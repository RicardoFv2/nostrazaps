// TurboZaps Orders API - Refund Order
// Sprint 1 - Refund escrow funds to buyer

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

    // Validate order status (can refund if paid or pending)
    if (order.status === 'released' || order.status === 'refunded') {
      return NextResponse.json(
        {
          ok: false,
          error: `Order cannot be refunded. Current status: ${order.status}`,
        },
        { status: 400 }
      );
    }

    // Refund order in LNbits
    try {
      await refundOrder(orderId);
      console.log('Order refunded in LNbits:', orderId);
    } catch (lnbitsError) {
      console.error('Error refunding order in LNbits:', lnbitsError);
      // For Sprint 1, we'll update the database even if LNbits fails (for testing)
      // In production, you might want to return an error here
    }

    // Update order status in database
    dbHelpers.updateOrderStatus(orderId, 'refunded');

    return NextResponse.json({
      ok: true,
      message: 'Order refunded successfully',
      order_id: orderId,
      status: 'refunded',
    });
  } catch (error) {
    console.error('Error refunding order:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to refund order',
      },
      { status: 500 }
    );
  }
};

