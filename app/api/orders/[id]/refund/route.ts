// TurboZaps Orders API - Refund Order
// Sprint 3 - Refund order and return funds to buyer with TRUE ESCROW

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { refundOrder } from '@/lib/lnbits';
import type { Order } from '@/types';

// POST /api/orders/[id]/refund - Refund order and return funds to buyer
// REAL ESCROW: Sends Lightning payment from system wallet back to buyer
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    // Get buyer_payment_request (Lightning invoice) from request body
    // This is where the buyer wants to receive the refund
    let requestBody: { buyer_payment_request?: string; message?: string } | null = null;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'Request body is required with buyer_payment_request (Lightning invoice)',
        },
        { status: 400 }
      );
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

    if (!requestBody?.buyer_payment_request) {
      return NextResponse.json(
        {
          ok: false,
          error: 'buyer_payment_request (Lightning invoice) is required to refund',
        },
        { status: 400 }
      );
    }

    console.log(`[POST /api/orders/${orderId}/refund] Refunding order with TRUE PAYMENT`);

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

    // Validate order status - can only refund if paid (and not yet released)
    if (order.status !== 'paid') {
      console.error(
        `[POST /api/orders/${orderId}/refund] Invalid order status: ${order.status}. Can only refund 'paid' orders`
      );
      return NextResponse.json(
        {
          ok: false,
          error: `Can only refund orders in 'paid' status. Current status: ${order.status}`,
          current_status: order.status,
        },
        { status: 400 }
      );
    }

    // Check if escrow is still held
    if (order.escrow_held === false || order.escrow_held === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Escrow has already been released or refunded',
        },
        { status: 400 }
      );
    }

    // Validate we have the amount
    if (!order.total_sats || order.total_sats <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order amount is invalid or missing',
        },
        { status: 400 }
      );
    }

    // Refund by sending Lightning payment back to buyer
    let paymentResult;
    try {
      console.log(`[POST /api/orders/${orderId}/refund] Sending ${order.total_sats} sats to buyer (refund)...`);
      
      paymentResult = await refundOrder(
        requestBody.buyer_payment_request,
        order.total_sats,
        orderId
      );
      
      console.log(`[POST /api/orders/${orderId}/refund] Refund payment sent successfully!`);
      console.log(`[POST /api/orders/${orderId}/refund] Payment hash:`, paymentResult.payment_hash);
    } catch (lnbitsError) {
      console.error(`[POST /api/orders/${orderId}/refund] Error sending refund to buyer:`, lnbitsError);
      
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to send refund to buyer',
          details: lnbitsError instanceof Error ? lnbitsError.message : 'Unknown error',
          hint: 'Check that the buyer invoice is valid and LNbits has sufficient balance',
        },
        { status: 500 }
      );
    }

    // Update order status in database - mark as refunded
    dbHelpers.refundEscrow(orderId);
    console.log(`[POST /api/orders/${orderId}/refund] Order status updated to 'refunded'`);

    return NextResponse.json({
      ok: true,
      message: '✅ Order refunded! Payment sent back to buyer.',
      order_id: orderId,
      status: 'refunded',
      escrow_held: false,
      payment_hash: paymentResult.payment_hash,
      amount_refunded: paymentResult.amount,
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
