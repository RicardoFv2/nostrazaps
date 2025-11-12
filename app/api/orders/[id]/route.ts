// TurboZaps Orders API - Get order by ID
// Sprint 3 - Get single order with LNbits synchronization

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { getOrderStatus as getLNbitsOrderStatus } from '@/lib/lnbits';
import type { Order, OrderStatus } from '@/types';

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

    // Sync with LNbits to get latest status
    if (sync) {
      try {
        console.log(`[GET /api/orders/${orderId}] Syncing with LNbits...`);
        const lnbitsOrder = await getLNbitsOrderStatus(orderId);
        
        // Determine new status based on LNbits order state
        let newStatus: OrderStatus = order.status;
        let shouldUpdate = false;

        if (lnbitsOrder.paid && lnbitsOrder.shipped) {
          // Order is paid and shipped - escrow should be released
          if (order.status !== 'released') {
            newStatus = 'released';
            shouldUpdate = true;
          }
        } else if (lnbitsOrder.paid && !lnbitsOrder.shipped) {
          // Order is paid but not shipped yet
          if (order.status === 'pending') {
            newStatus = 'paid';
            shouldUpdate = true;
          }
        }

        // Update order if status changed
        if (shouldUpdate) {
          console.log(`[GET /api/orders/${orderId}] Updating order status: ${order.status} -> ${newStatus}`);
          
          dbHelpers.updateOrderStatusAndPayment(
            orderId,
            newStatus,
            lnbitsOrder.payment_hash || order.payment_hash || null,
            lnbitsOrder.payment_request || order.payment_request || null
          );

          // Update local order object
          order.status = newStatus;
          order.payment_hash = lnbitsOrder.payment_hash || order.payment_hash;
          order.payment_request = lnbitsOrder.payment_request || order.payment_request;
        } else if (lnbitsOrder.payment_hash && !order.payment_hash) {
          // Update payment info if we got it from LNbits but don't have it locally
          dbHelpers.updateOrderStatusAndPayment(
            orderId,
            order.status,
            lnbitsOrder.payment_hash,
            lnbitsOrder.payment_request || order.payment_request || null
          );
          order.payment_hash = lnbitsOrder.payment_hash;
          order.payment_request = lnbitsOrder.payment_request || order.payment_request;
        }

        console.log(`[GET /api/orders/${orderId}] Sync completed. Status: ${order.status}`);
      } catch (lnbitsError) {
        console.error(`[GET /api/orders/${orderId}] Error syncing with LNbits (non-fatal):`, lnbitsError);
        // Continue with database order even if LNbits sync fails
        // This is expected if the order was created locally or LNbits is unavailable
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

    // Update order in LNbits if paid or shipped status is being updated
    if (body.paid !== undefined || body.shipped !== undefined) {
      try {
        const { updateOrder } = await import('@/lib/lnbits');
        await updateOrder(orderId, {
          paid: body.paid,
          shipped: body.shipped,
          message: body.message,
        });
      } catch (lnbitsError) {
        console.error(`[PATCH /api/orders/${orderId}] Error updating order in LNbits (non-fatal):`, lnbitsError);
      }
    }

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

