// TurboZaps Orders API
// Sprint 3 - Orders API & Escrow Flow

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { createLightningInvoice, getMerchant, getCustomerByPubkey } from '@/lib/lnbits';
import { ensureValidNostrPubkey } from '@/lib/utils';
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

    // Verify buyer has a role (is registered as a buyer in LNbits)
    try {
      const customer = await getCustomerByPubkey(body.buyer_pubkey);
      if (!customer) {
        console.error('[POST /api/orders] Buyer not found in LNbits:', body.buyer_pubkey.substring(0, 20) + '...');
        return NextResponse.json(
          {
            ok: false,
            error: 'Buyer role not found. Please register as a buyer before creating an order.',
            hint: 'Visit /register/buyer to create your buyer profile',
          },
          { status: 403 }
        );
      }

      const customerObj = customer as { public_key?: string; profile?: { name?: string } };
      console.log('[POST /api/orders] Buyer verified in LNbits:', {
        public_key: body.buyer_pubkey.substring(0, 20) + '...',
        name: customerObj.profile?.name || 'Unknown',
      });
    } catch (lnbitsError) {
      console.error('[POST /api/orders] Error verifying buyer in LNbits:', lnbitsError);
      // If LNbits is unavailable, we can't verify the buyer - reject the order
      return NextResponse.json(
        {
          ok: false,
          error: 'Unable to verify buyer role. LNbits service may be unavailable.',
          message: lnbitsError instanceof Error ? lnbitsError.message : 'Unknown error',
        },
        { status: 503 }
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

    // Get seller pubkey from merchant (for messages and escrow)
    let sellerPubkey: string | null = null;
    try {
      console.log('[POST /api/orders] Getting seller pubkey from merchant...');
      const merchant = await getMerchant() as { public_key?: string } | undefined;
      if (merchant?.public_key) {
        // Validate and normalize the merchant's public key
        const validPubkey = ensureValidNostrPubkey(merchant.public_key, false);
        if (validPubkey) {
          sellerPubkey = validPubkey;
          console.log('[POST /api/orders] Seller pubkey retrieved from merchant:', sellerPubkey.substring(0, 20) + '...');
        } else {
          console.warn('[POST /api/orders] Invalid merchant pubkey format:', merchant.public_key.substring(0, 20) + '...');
        }
      }
    } catch (merchantError) {
      console.error('[POST /api/orders] Error getting merchant (non-fatal):', merchantError);
      // Continue without seller pubkey - order can still be created
    }

    // Generate Lightning invoice using LNbits API
    let paymentRequest: string | null = null;
    let paymentHash: string | null = null;
    let totalSats: number = product.price_sats;

    try {
      console.log('[POST /api/orders] Generating Lightning invoice...');
      
      // Get product details for invoice memo
      const productData = product as { name?: string; price_sats: number };
      const memo = `TurboZaps - ${productData.name || 'Product'} - Order ${orderId.substring(0, 8)}`;
      
      const invoice = await createLightningInvoice({
        amount: product.price_sats,
        memo: memo,
        order_id: orderId,
      });

      paymentRequest = invoice.payment_request;
      paymentHash = invoice.payment_hash;

      console.log('[POST /api/orders] Lightning invoice generated successfully:', {
        orderId: orderId,
        hasPaymentRequest: !!paymentRequest,
        totalSats,
        paymentHash: paymentHash.substring(0, 16) + '...',
      });
    } catch (lnbitsError) {
      console.error('[POST /api/orders] Error generating Lightning invoice:', lnbitsError);
      
      // If invoice generation fails, we can't proceed
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to generate Lightning invoice',
          message: lnbitsError instanceof Error ? lnbitsError.message : 'Unknown error',
          hint: 'Verify LNBITS_URL and LNBITS_API_KEY are correctly configured',
        },
        { status: 500 }
      );
    }

    // Create order in database (include seller_pubkey if available)
    const order: Order = {
      id: orderId,
      product_id: body.product_id,
      buyer_pubkey: body.buyer_pubkey,
      seller_pubkey: sellerPubkey,
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

