// TurboZaps Orders API - Get order by ID
// Sprint 3 - Get single order with LNbits synchronization

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { checkPaymentStatus } from '@/lib/lnbits';
import type { Order } from '@/types';

// GET /api/orders/[id] - Get order by ID
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;
    const searchParams = request.nextUrl.searchParams;
    const sync = searchParams.get('sync') !== 'false'; // Default to true, can be disabled with sync=false

    if (!orderId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order ID is required',
        },
        { status: 400 }
      );
    }

    console.log(`[GET /api/orders/${orderId}] Fetching order (sync: ${sync})`);

    // Get order from database
    let order = dbHelpers.getOrderById(orderId) as Order | undefined;

    if (!order) {
      console.error(`[GET /api/orders/${orderId}] Order not found in database`);
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Sync payment status with LNbits if order has a payment_hash
    // Note: We don't sync with NostrMarket because orders are created locally,
    // not in NostrMarket. Instead, we check payment status directly using payment_hash.
    if (sync && order.payment_hash && order.status === 'pending') {
      try {
        console.log(`[GET /api/orders/${orderId}] Checking payment status in LNbits...`);
        const paymentStatus = await checkPaymentStatus(order.payment_hash);
        
        // Update order status if payment is confirmed
        if (paymentStatus.paid && order.status === 'pending') {
          console.log(`[GET /api/orders/${orderId}] ✅ Payment confirmed in system wallet! Funds are now in escrow.`);
          console.log(`[GET /api/orders/${orderId}] Updating order status: pending -> paid (escrow_held: true)`);
          
          dbHelpers.updateOrderStatus(orderId, 'paid');
          order.status = 'paid';
          // Ensure escrow_held is set to true when payment is confirmed
          // The order should already have escrow_held=true by default, but we ensure it
          if (order.escrow_held === false || order.escrow_held === null || order.escrow_held === 0) {
            // Update escrow_held to true using direct SQL
            const getDb = (await import('@/lib/db')).default;
            const db = getDb();
            db.prepare('UPDATE orders SET escrow_held = 1 WHERE id = ?').run(orderId);
            order.escrow_held = true;
          }
        }

        console.log(`[GET /api/orders/${orderId}] Payment check completed. Status: ${order.status}, Paid: ${paymentStatus.paid}`);
      } catch (paymentError) {
        // Log error but don't fail the request
        // Payment might not be found yet (404) or LNbits might be unavailable
        console.log(`[GET /api/orders/${orderId}] Payment status check failed (non-fatal):`, 
          paymentError instanceof Error ? paymentError.message : 'Unknown error');
        // Continue with database order status
      }
    }

    return NextResponse.json({
      ok: true,
      order,
      synced: sync,
    });
  } catch (error) {
    console.error('[GET /api/orders/[id]] Error fetching order:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

// PATCH /api/orders/[id] - Update order status
export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;
    const body = await request.json();

    if (!orderId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order ID is required',
        },
        { status: 400 }
      );
    }

    console.log(`[PATCH /api/orders/${orderId}] Updating order:`, body);

    // Get order from database
    const order = dbHelpers.getOrderById(orderId) as Order | undefined;

    if (!order) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Note: We don't update orders in NostrMarket because orders are created locally,
    // not in NostrMarket. Orders exist only in our local database.
    // If you need to update orders in NostrMarket in the future, you would need to
    // create the order in NostrMarket first when creating the order locally.

    // Update order status in database
    if (body.paid === true && order.status === 'pending') {
      dbHelpers.updateOrderStatus(orderId, 'paid');
    } else if (body.shipped === true && order.status === 'paid') {
      // When shipped is true and paid is true, it means escrow is released
      dbHelpers.updateOrderStatus(orderId, 'released');
    }

    // Get updated order
    const updatedOrder = dbHelpers.getOrderById(orderId) as Order;

    return NextResponse.json({
      ok: true,
      order: updatedOrder,
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('[PATCH /api/orders/[id]] Error updating order:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to update order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

