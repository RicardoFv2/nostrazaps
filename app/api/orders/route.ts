// TurboZaps Orders API
// Sprint 1 - Order management endpoints

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { createOrder as createLNbitsOrder, getOrderStatus as getLNbitsOrderStatus } from '@/lib/lnbits';
import type { CreateOrderRequest, CreateOrderResponse, Order } from '@/types';
import { randomUUID } from 'crypto';

// GET /api/orders - List orders with filtering
export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const buyer_pubkey = searchParams.get('buyer_pubkey');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let orders: Order[] = [];

    if (buyer_pubkey) {
      orders = dbHelpers.getOrdersByBuyer(buyer_pubkey, limit, offset) as Order[];
    } else if (status) {
      orders = dbHelpers.getOrdersByStatus(status, limit, offset) as Order[];
    } else {
      // Get all orders
      orders = dbHelpers.getAllOrders(limit, offset) as Order[];
    }

    return NextResponse.json({
      ok: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
};

// POST /api/orders - Create a new order with Lightning escrow
export const POST = async (request: NextRequest) => {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.product_id || !body.buyer_pubkey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required fields: product_id and buyer_pubkey are required',
        },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = dbHelpers.getProductById(body.product_id);
    if (!product) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Generate order ID
    const orderId = randomUUID();

    // Create order in LNbits to get payment request
    let paymentRequest: string | null = null;
    let paymentHash: string | null = null;
    let totalSats: number | null = null;

    try {
      const lnbitsOrder = await createLNbitsOrder({
        product_id: body.product_id,
        buyer_pubkey: body.buyer_pubkey,
      });

      paymentRequest = lnbitsOrder.payment_request || null;
      paymentHash = lnbitsOrder.payment_hash || null;
      totalSats = lnbitsOrder.total || (product as { price_sats: number }).price_sats;

      console.log('Order created in LNbits:', orderId);
    } catch (lnbitsError) {
      console.error('Error creating order in LNbits:', lnbitsError);
      // For Sprint 1, we'll continue even if LNbits fails (mock mode)
      totalSats = (product as { price_sats: number }).price_sats;
    }

    // Create order in database
    const order: Order = {
      id: orderId,
      product_id: body.product_id,
      buyer_pubkey: body.buyer_pubkey,
      status: 'pending',
      payment_hash: paymentHash,
      payment_request: paymentRequest,
      total_sats: totalSats,
      created_at: new Date().toISOString(),
    };

    dbHelpers.createOrder(order);

    const response: CreateOrderResponse = {
      order_id: orderId,
      payment_request: paymentRequest,
      status: 'pending',
    };

    return NextResponse.json({
      ok: true,
      ...response,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create order',
      },
      { status: 500 }
    );
  }
};

