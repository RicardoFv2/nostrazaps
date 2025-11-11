// TurboZaps Orders API - Get order by ID
// Sprint 1 - Get single order endpoint

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { getOrderStatus as getLNbitsOrderStatus } from '@/lib/lnbits';
import type { Order } from '@/types';

// GET /api/orders/[id] - Get order by ID
export const GET = async (
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

    // Optionally sync with LNbits to get latest status
    try {
      const lnbitsOrder = await getLNbitsOrderStatus(orderId);
      
      // Update order status if it has changed in LNbits
      if (lnbitsOrder.paid && order.status === 'pending') {
        dbHelpers.updateOrderPayment(
          orderId,
          lnbitsOrder.payment_hash || '',
          lnbitsOrder.payment_request || ''
        );
        order.status = 'paid';
        order.payment_hash = lnbitsOrder.payment_hash || null;
        order.payment_request = lnbitsOrder.payment_request || null;
      }
    } catch (lnbitsError) {
      console.error('Error syncing with LNbits (non-fatal):', lnbitsError);
      // Continue with database order even if LNbits sync fails
    }

    return NextResponse.json({
      ok: true,
      order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch order',
      },
      { status: 500 }
    );
  }
};

