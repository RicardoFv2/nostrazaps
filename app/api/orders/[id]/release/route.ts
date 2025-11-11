// TurboZaps Orders API - Release Escrow
// Sprint 3 - Release escrow funds to seller with validation

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { releaseEscrow } from '@/lib/lnbits';
import type { Order } from '@/types';

// POST /api/orders/[id]/release - Release escrow funds to seller
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    // Optional: Get seller_pubkey from request body for ownership validation
    // In a full implementation, this would come from authentication/session
    let requestBody: { seller_pubkey?: string; message?: string } | null = null;
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

    console.log(`[POST /api/orders/${orderId}/release] Releasing escrow`);

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

    // Get product to verify seller (if stall_id is available, we could validate seller_pubkey)
    const product = dbHelpers.getProductById(order.product_id);
    // Note: In a full implementation, we would validate that the seller_pubkey
    // from the request matches the product's stall owner or seller
    // For now, we'll proceed with the release if the order is in the correct state

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

    // Release escrow in LNbits
    let lnbitsReleaseSuccess = false;
    try {
      console.log(`[POST /api/orders/${orderId}/release] Releasing escrow in LNbits...`);
      const releaseMessage = requestBody?.message || 'Escrow released to seller';
      await releaseEscrow(orderId, releaseMessage);
      lnbitsReleaseSuccess = true;
      console.log(`[POST /api/orders/${orderId}/release] Escrow released successfully in LNbits`);
    } catch (lnbitsError) {
      console.error(`[POST /api/orders/${orderId}/release] Error releasing escrow in LNbits:`, lnbitsError);
      
      // Check if it's a critical error that should prevent database update
      if (lnbitsError instanceof Error) {
        // For 404, the order might not exist in LNbits (created locally)
        // For 403, we might not have permission (but this is critical)
        if (lnbitsError.message.includes('403') || lnbitsError.message.includes('forbidden')) {
          return NextResponse.json(
            {
              ok: false,
              error: 'Permission denied. Unable to release escrow in LNbits.',
              details: lnbitsError.message,
            },
            { status: 403 }
          );
        }
        
        // For other errors (404, network errors, etc.), we can still update the database
        // This allows the system to work even if LNbits is temporarily unavailable
        console.warn(
          `[POST /api/orders/${orderId}/release] LNbits error (non-fatal), updating database status`
        );
      }
    }

    // Update order status in database
    dbHelpers.updateOrderStatus(orderId, 'released');
    console.log(`[POST /api/orders/${orderId}/release] Order status updated to 'released'`);

    return NextResponse.json({
      ok: true,
      message: lnbitsReleaseSuccess
        ? 'Escrow released successfully'
        : 'Escrow release initiated. Order status updated locally.',
      order_id: orderId,
      status: 'released',
      lnbits_synced: lnbitsReleaseSuccess,
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

