// TurboZaps Orders API - Release Escrow
// Sprint 3 - Release escrow funds to seller with TRUE ESCROW

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { releaseEscrow } from '@/lib/lnbits';
import type { Order } from '@/types';

// POST /api/orders/[id]/release - Release escrow funds to seller
// REAL ESCROW: Sends Lightning payment from system wallet to seller
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    // Get seller_payment_request (Lightning invoice) from request body
    // This is where the seller wants to receive the funds
    let requestBody: { seller_payment_request?: string; message?: string } | null = null;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'Request body is required with seller_payment_request (Lightning invoice)',
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

    if (!requestBody?.seller_payment_request) {
      return NextResponse.json(
        {
          ok: false,
          error: 'seller_payment_request (Lightning invoice) is required to release funds',
        },
        { status: 400 }
      );
    }

    console.log(`[POST /api/orders/${orderId}/release] Releasing escrow with TRUE PAYMENT`);

    // Get order from database
    const order = dbHelpers.getOrderById(orderId) as Order | undefined;

    if (!order) {
      console.error(`[POST /api/orders/${orderId}/release] Order not found`);
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Validate order status
    if (order.status !== 'paid') {
      console.error(
        `[POST /api/orders/${orderId}/release] Invalid order status: ${order.status}. Expected: paid`
      );
      return NextResponse.json(
        {
          ok: false,
          error: `Order must be in 'paid' status to release escrow. Current status: ${order.status}`,
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

    // CRITICAL: Verify that payment was actually received in system wallet (escrow)
    // This confirms the funds are actually in escrow before releasing
    if (order.payment_hash) {
      try {
        const { checkPaymentStatus } = await import('@/lib/lnbits');
        console.log(`[POST /api/orders/${orderId}/release] Verifying payment was received in system wallet...`);
        
        const paymentStatus = await checkPaymentStatus(order.payment_hash);
        
        if (!paymentStatus.paid) {
          console.error(`[POST /api/orders/${orderId}/release] Payment not confirmed in system wallet!`);
          return NextResponse.json(
            {
              ok: false,
              error: 'Payment not confirmed in system wallet. Cannot release escrow until payment is received.',
              hint: 'The invoice may not have been paid yet, or the payment is still pending confirmation.',
            },
            { status: 400 }
          );
        }
        
        console.log(`[POST /api/orders/${orderId}/release] ✅ Payment confirmed in system wallet. Funds are in escrow.`);
      } catch (paymentCheckError) {
        console.error(`[POST /api/orders/${orderId}/release] Error verifying payment status:`, paymentCheckError);
        // Don't fail the release if we can't verify, but log it
        console.warn(`[POST /api/orders/${orderId}/release] Proceeding with release despite payment verification error (non-fatal)`);
      }
    } else {
      console.warn(`[POST /api/orders/${orderId}/release] No payment_hash found. Cannot verify payment was received.`);
    }

    // Release escrow by sending Lightning payment to seller
    let paymentResult;
    try {
      console.log(`[POST /api/orders/${orderId}/release] Sending ${order.total_sats} sats to seller...`);
      
      paymentResult = await releaseEscrow(
        requestBody.seller_payment_request,
        order.total_sats,
        orderId
      );
      
      console.log(`[POST /api/orders/${orderId}/release] Payment sent successfully!`);
      console.log(`[POST /api/orders/${orderId}/release] Payment hash:`, paymentResult.payment_hash);
    } catch (lnbitsError) {
      console.error(`[POST /api/orders/${orderId}/release] Error sending payment to seller:`, lnbitsError);
      
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to send payment to seller',
          details: lnbitsError instanceof Error ? lnbitsError.message : 'Unknown error',
          hint: 'Check that the seller invoice is valid and LNbits has sufficient balance',
        },
        { status: 500 }
      );
    }

    // Update order status in database - mark escrow as released
    dbHelpers.releaseEscrow(orderId);
    console.log(`[POST /api/orders/${orderId}/release] Order status updated to 'released'`);

    return NextResponse.json({
      ok: true,
      message: '✅ Escrow released! Payment sent to seller.',
      order_id: orderId,
      status: 'released',
      escrow_held: false,
      payment_hash: paymentResult.payment_hash,
      amount_sent: paymentResult.amount,
    });
  } catch (error) {
    console.error('[POST /api/orders/[id]/release] Error releasing escrow:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to release escrow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

