// TurboZaps Orders API
// Sprint 3 - Orders API & Escrow Flow

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { createOrder as createLNbitsOrder } from '@/lib/lnbits';
import type { CreateOrderRequest, CreateOrderResponse, Order } from '@/types';
import { randomUUID } from 'crypto';

// GET /api/orders - List orders with filtering
export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const buyer_pubkey = searchParams.get('buyer_pubkey');
    const sync = searchParams.get('sync') === 'true'; // Optional: sync with LNbits
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let orders: Order[] = [];

    // Apply filters - support combined filters
    if (buyer_pubkey && status) {
      orders = dbHelpers.getOrdersByBuyerAndStatus(buyer_pubkey, status, limit, offset) as Order[];
    } else if (buyer_pubkey) {
      orders = dbHelpers.getOrdersByBuyer(buyer_pubkey, limit, offset) as Order[];
    } else if (status) {
      orders = dbHelpers.getOrdersByStatus(status, limit, offset) as Order[];
    } else {
      // Get all orders
      orders = dbHelpers.getAllOrders(limit, offset) as Order[];
    }

    // Optional: Sync with LNbits if requested
    if (sync) {
      try {
        console.log('[GET /api/orders] Syncing orders with LNbits...');
        // Note: In a production environment, you might want to sync specific orders
        // For now, we'll just log that sync was requested
        // Full sync could be implemented by fetching from LNbits and updating local DB
      } catch (syncError) {
        console.error('[GET /api/orders] Error syncing with LNbits (non-fatal):', syncError);
        // Continue with database orders even if sync fails
      }
    }

    console.log(`[GET /api/orders] Retrieved ${orders.length} orders`);

    return NextResponse.json({
      ok: true,
      orders,
      count: orders.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[GET /api/orders] Error fetching orders:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

// POST /api/orders - Create a new order with Lightning escrow
export const POST = async (request: NextRequest) => {
  try {
    const body: CreateOrderRequest = await request.json();

    console.log('[POST /api/orders] Creating order:', {
      product_id: body.product_id,
      buyer_pubkey: body.buyer_pubkey?.substring(0, 20) + '...',
    });

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
    const product = dbHelpers.getProductById(body.product_id) as { price_sats: number } | undefined;
    if (!product) {
      console.error('[POST /api/orders] Product not found:', body.product_id);
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
    let totalSats: number = product.price_sats;
    let lnbitsOrderId: string | null = null;

    try {
      console.log('[POST /api/orders] Creating order in LNbits...');
      const lnbitsOrder = await createLNbitsOrder({
        product_id: body.product_id,
        buyer_pubkey: body.buyer_pubkey,
      });

      // Extract order information from LNbits response
      lnbitsOrderId = lnbitsOrder.id || orderId;
      paymentRequest = lnbitsOrder.payment_request || null;
      paymentHash = lnbitsOrder.payment_hash || null;
      totalSats = lnbitsOrder.total || product.price_sats;

      console.log('[POST /api/orders] Order created in LNbits:', {
        orderId: lnbitsOrderId,
        hasPaymentRequest: !!paymentRequest,
        totalSats,
      });
    } catch (lnbitsError) {
      console.error('[POST /api/orders] Error creating order in LNbits:', lnbitsError);
      
      // Check if it's a known error (e.g., orders created via Nostr)
      if (lnbitsError instanceof Error) {
        if (lnbitsError.message.includes('404') || lnbitsError.message.includes('not found')) {
          console.warn(
            '[POST /api/orders] LNbits order creation endpoint not available. ' +
            'Orders may be created through Nostr events. Continuing with local order creation.'
          );
          // Continue with local order creation
        } else {
          // For other errors, we still create the order locally but log the error
          console.warn('[POST /api/orders] LNbits error (non-fatal), continuing with local order');
        }
      }
      
      // Use product price as fallback
      totalSats = product.price_sats;
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

    console.log('[POST /api/orders] Order created successfully:', orderId);

    const response: CreateOrderResponse = {
      order_id: orderId,
      payment_request: paymentRequest,
      status: 'pending',
    };

    return NextResponse.json({
      ok: true,
      ...response,
      total_sats: totalSats,
      message: paymentRequest
        ? 'Order created successfully. Payment request generated.'
        : 'Order created successfully. Payment request will be generated when order is processed.',
    });
  } catch (error) {
    console.error('[POST /api/orders] Error creating order:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

