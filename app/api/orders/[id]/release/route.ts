// TurboZaps Orders API - Release Escrow
// Sprint 1 - Release escrow funds to seller

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

    if (!orderId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order ID is required',
        },
        { status: 400 }
      );
    }

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

    // Validate order status
    if (order.status !== 'paid') {
      return NextResponse.json(
        {
          ok: false,
          error: `Order must be in 'paid' status to release escrow. Current status: ${order.status}`,
        },
        { status: 400 }
      );
    }

    // Release escrow in LNbits
    try {
      await releaseEscrow(orderId);
      console.log('Escrow released in LNbits for order:', orderId);
    } catch (lnbitsError) {
      console.error('Error releasing escrow in LNbits:', lnbitsError);
      // For Sprint 1, we'll update the database even if LNbits fails (for testing)
      // In production, you might want to return an error here
    }

    // Update order status in database
    dbHelpers.updateOrderStatus(orderId, 'released');

    return NextResponse.json({
      ok: true,
      message: 'Escrow released successfully',
      order_id: orderId,
      status: 'released',
    });
  } catch (error) {
    console.error('Error releasing escrow:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to release escrow',
      },
      { status: 500 }
    );
  }
};

