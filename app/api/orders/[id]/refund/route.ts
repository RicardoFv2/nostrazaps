// TurboZaps Orders API - Refund Order
// Sprint 3 - Refund escrow funds to buyer with validation

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { refundOrder } from '@/lib/lnbits';
import type { Order } from '@/types';

// POST /api/orders/[id]/refund - Refund escrow funds to buyer
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    // Optional: Get buyer_pubkey from request body for ownership validation
    // In a full implementation, this would come from authentication/session
    let requestBody: { buyer_pubkey?: string; shipping_id?: string } | null = null;
    try {
      requestBody = await request.json().catch(() => null);
    } catch {
      // Request body is optional
    }

    if (!orderId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order ID is required',
        },
        { status: 400 }
      );
    }

    console.log(`[POST /api/orders/${orderId}/refund] Refunding order`);

    // Get order from database
    const order = dbHelpers.getOrderById(orderId) as Order | undefined;

    if (!order) {
      console.error(`[POST /api/orders/${orderId}/refund] Order not found`);
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Validate buyer ownership (if buyer_pubkey is provided in request)
    if (requestBody?.buyer_pubkey && requestBody.buyer_pubkey !== order.buyer_pubkey) {
      console.error(
        `[POST /api/orders/${orderId}/refund] Buyer pubkey mismatch. ` +
        `Expected: ${order.buyer_pubkey.substring(0, 20)}..., ` +
        `Got: ${requestBody.buyer_pubkey.substring(0, 20)}...`
      );
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized. Only the buyer can refund this order.',
        },
        { status: 403 }
      );
    }

    // Validate order status (can refund if pending or paid, but not released or already refunded)
    if (order.status === 'released') {
      console.error(
        `[POST /api/orders/${orderId}/refund] Cannot refund order with status: ${order.status}. ` +
        `Escrow has already been released to the seller.`
      );
      return NextResponse.json(
        {
          ok: false,
          error: 'Cannot refund order. Escrow has already been released to the seller.',
          current_status: order.status,
        },
        { status: 400 }
      );
    }

    if (order.status === 'refunded') {
      console.error(
        `[POST /api/orders/${orderId}/refund] Order already refunded. Status: ${order.status}`
      );
      return NextResponse.json(
        {
          ok: false,
          error: 'Order has already been refunded.',
          current_status: order.status,
        },
        { status: 400 }
      );
    }

    // Refund order in LNbits
    let lnbitsRefundSuccess = false;
    try {
      console.log(`[POST /api/orders/${orderId}/refund] Refunding order in LNbits...`);
      await refundOrder(orderId, requestBody?.shipping_id);
      lnbitsRefundSuccess = true;
      console.log(`[POST /api/orders/${orderId}/refund] Order refunded successfully in LNbits`);
    } catch (lnbitsError) {
      console.error(`[POST /api/orders/${orderId}/refund] Error refunding order in LNbits:`, lnbitsError);
      
      // Check if it's a critical error that should prevent database update
      if (lnbitsError instanceof Error) {
        // For 403, we might not have permission (critical)
        if (lnbitsError.message.includes('403') || lnbitsError.message.includes('forbidden')) {
          return NextResponse.json(
            {
              ok: false,
              error: 'Permission denied. Unable to refund order in LNbits.',
              details: lnbitsError.message,
            },
            { status: 403 }
          );
        }
        
        // For pending orders that haven't been paid yet, LNbits might return 404
        // This is expected and we can still update the database
        if (order.status === 'pending' && lnbitsError.message.includes('404')) {
          console.log(
            `[POST /api/orders/${orderId}/refund] Order is pending (not paid), ` +
            `LNbits refund not applicable. Updating database status.`
          );
        } else {
          // For other errors, we can still update the database
          // This allows the system to work even if LNbits is temporarily unavailable
          console.warn(
            `[POST /api/orders/${orderId}/refund] LNbits error (non-fatal), updating database status`
          );
        }
      }
    }

    // Update order status in database
    dbHelpers.updateOrderStatus(orderId, 'refunded');
    console.log(`[POST /api/orders/${orderId}/refund] Order status updated to 'refunded'`);

    return NextResponse.json({
      ok: true,
      message: lnbitsRefundSuccess
        ? 'Order refunded successfully'
        : order.status === 'pending'
        ? 'Order cancelled successfully (no payment was made)'
        : 'Refund initiated. Order status updated locally.',
      order_id: orderId,
      status: 'refunded',
      lnbits_synced: lnbitsRefundSuccess,
      previous_status: order.status,
    });
  } catch (error) {
    console.error('[POST /api/orders/[id]/refund] Error refunding order:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to refund order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

