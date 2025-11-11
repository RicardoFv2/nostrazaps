// TurboZaps LNbits Integration Wrapper
// Sprint 2 - LNbits NostrMarket API Integration

import type { ProductData, OrderData, MessageData, LNbitsOrderResponse } from '@/types';

// Environment variables
const LNBITS_URL = process.env.LNBITS_URL || 'https://demo.lnbits.com';
const LNBITS_API_KEY = process.env.LNBITS_API_KEY || '';

// Base URL for NostrMarket API
// Note: The extension path may vary. If using a custom installation,
// you might need to include the extension path: /upgrades/{extension_id}/nostrmarket/api/v1
const NOSTRMARKET_BASE_URL = `${LNBITS_URL}/nostrmarket/api/v1`;

/**
 * Helper function to make API requests to LNbits NostrMarket API
 * @param endpoint API endpoint (e.g., '/product', '/order/{id}')
 * @param method HTTP method
 * @param body Request body (optional)
 * @returns JSON response from API
 */
const makeRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown
): Promise<unknown> => {
  const url = `${NOSTRMARKET_BASE_URL}${endpoint}`;
  
  // Validate API key is set
  if (!LNBITS_API_KEY) {
    const error = new Error('LNBITS_API_KEY is not set in environment variables');
    console.error('LNbits API Configuration Error:', error.message);
    throw error;
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': LNBITS_API_KEY,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`[LNbits API] ${method} ${url}`);
    
    const response = await fetch(url, options);
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Unable to read error response';
      }
      
      const errorMessage = `LNbits API Error (${response.status}): ${errorText}`;
      console.error(`[LNbits API Error] ${errorMessage}`);
      
      // Provide more specific error messages
      if (response.status === 401) {
        throw new Error('LNbits API authentication failed. Check your LNBITS_API_KEY.');
      } else if (response.status === 404) {
        throw new Error(`LNbits API endpoint not found: ${endpoint}`);
      } else if (response.status === 403) {
        throw new Error('LNbits API access forbidden. Check your API key permissions.');
      }
      
      throw new Error(errorMessage);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      console.log(`[LNbits API] Response received for ${method} ${endpoint}`);
      return json;
    } else {
      // Some endpoints might return empty responses
      console.log(`[LNbits API] Empty response received for ${method} ${endpoint}`);
      return { ok: true };
    }
  } catch (error) {
    // Re-throw if it's already our custom error
    if (error instanceof Error && error.message.includes('LNbits API')) {
      throw error;
    }
    
    // Handle network errors
    console.error('[LNbits API] Request failed:', error);
    throw new Error(`Failed to connect to LNbits API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Create a product in LNbits NostrMarket
 * POST /nostrmarket/api/v1/product
 * @param data Product data (stall_id, name, price, categories, images, config)
 * @returns Created product object
 */
export const createProduct = async (data: ProductData): Promise<unknown> => {
  console.log('[createProduct] Creating product in LNbits:', {
    stall_id: data.stall_id,
    name: data.name,
    price: data.price,
  });
  
  try {
    // Validate required fields
    if (!data.stall_id || !data.name || data.price === undefined) {
      throw new Error('Missing required fields: stall_id, name, and price are required');
    }

    const response = await makeRequest('/product', 'POST', data);
    console.log('[createProduct] Product created successfully');
    return response;
  } catch (error) {
    console.error('[createProduct] Error creating product:', error);
    throw error;
  }
};

/**
 * Create an order with Lightning escrow in LNbits NostrMarket
 * Note: In LNbits NostrMarket, orders are typically created through Nostr events
 * when a buyer purchases a product. This function attempts to create an order
 * or retrieve an existing order based on the product and buyer.
 * 
 * If the POST /order endpoint doesn't exist, this will throw an error and
 * the application should handle order creation through the Nostr protocol instead.
 * 
 * @param data Order data (product_id, buyer_pubkey, shipping_id)
 * @returns Created order with payment request and invoice
 */
export const createOrder = async (data: OrderData): Promise<LNbitsOrderResponse> => {
  console.log('[createOrder] Creating order in LNbits:', {
    product_id: data.product_id,
    buyer_pubkey: data.buyer_pubkey,
  });
  
  try {
    // Validate required fields
    if (!data.product_id || !data.buyer_pubkey) {
      throw new Error('Missing required fields: product_id and buyer_pubkey are required');
    }

    // Attempt to create order via API
    // Note: This endpoint may not exist in all LNbits NostrMarket setups.
    // Orders might be created through Nostr events instead.
    const response = await makeRequest('/order', 'POST', {
      product_id: data.product_id,
      pubkey: data.buyer_pubkey,
      shipping_id: data.shipping_id || null,
    }) as LNbitsOrderResponse;

    console.log('[createOrder] Order created successfully:', response.id);
    return response;
  } catch (error) {
    console.error('[createOrder] Error creating order:', error);
    
    // If order creation fails, it might be because orders are created via Nostr
    // In that case, we might need to query existing orders or handle it differently
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error(
        'Order creation endpoint not found. Orders in LNbits NostrMarket are typically ' +
        'created through Nostr events. Please ensure the product exists and the buyer ' +
        'has initiated the purchase through the Nostr protocol.'
      );
    }
    
    throw error;
  }
};

/**
 * Get order status from LNbits NostrMarket
 * GET /nostrmarket/api/v1/order/{order_id}
 * @param orderId Order ID
 * @returns Order status and details including payment information
 */
export const getOrderStatus = async (orderId: string): Promise<LNbitsOrderResponse> => {
  console.log('[getOrderStatus] Getting order status from LNbits:', orderId);
  
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const response = await makeRequest(`/order/${orderId}`, 'GET') as LNbitsOrderResponse;
    
    console.log('[getOrderStatus] Order status retrieved:', {
      id: response.id,
      paid: response.paid,
      shipped: response.shipped,
    });
    
    return response;
  } catch (error) {
    console.error('[getOrderStatus] Error getting order status:', error);
    throw error;
  }
};

/**
 * Release escrow funds to seller
 * PATCH /nostrmarket/api/v1/order/{order_id}
 * Updates the order status to paid and shipped, which releases the escrow funds to the seller.
 * @param orderId Order ID
 * @param message Optional message to include with the status update
 * @returns Updated order object with release confirmation
 */
export const releaseEscrow = async (orderId: string, message?: string): Promise<unknown> => {
  console.log('[releaseEscrow] Releasing escrow for order:', orderId);
  
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    // Update order status to paid and shipped to release escrow
    // According to LNbits NostrMarket API, setting paid=true and shipped=true releases funds
    const response = await makeRequest(`/order/${orderId}`, 'PATCH', {
      paid: true,
      shipped: true,
      message: message || 'Escrow released to seller',
    });

    console.log('[releaseEscrow] Escrow released successfully for order:', orderId);
    return response;
  } catch (error) {
    console.error('[releaseEscrow] Error releasing escrow:', error);
    throw error;
  }
};

/**
 * Refund order by reissuing the invoice
 * PUT /nostrmarket/api/v1/order/reissue
 * Reissues an invoice for an order, which effectively refunds the buyer.
 * Note: This creates a new invoice. The original payment may need to be handled separately.
 * @param orderId Order ID
 * @param shippingId Optional new shipping ID if reissuing with different shipping
 * @returns Reissued order/invoice information
 */
export const refundOrder = async (orderId: string, shippingId?: string): Promise<unknown> => {
  console.log('[refundOrder] Refunding order:', orderId);
  
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    // Use reissue endpoint to refund/cancel order
    const requestBody: { id: string; shipping_id?: string } = {
      id: orderId,
    };
    
    if (shippingId) {
      requestBody.shipping_id = shippingId;
    }

    const response = await makeRequest('/order/reissue', 'PUT', requestBody);

    console.log('[refundOrder] Order refunded successfully:', orderId);
    return response;
  } catch (error) {
    console.error('[refundOrder] Error refunding order:', error);
    throw error;
  }
};

/**
 * Send message between buyer and seller via Nostr
 * POST /nostrmarket/api/v1/message
 * Sends a message to a recipient's public key through the Nostr protocol.
 * @param data Message data (message, public_key)
 * @returns Message confirmation
 */
export const sendMessage = async (data: MessageData): Promise<unknown> => {
  console.log('[sendMessage] Sending message via LNbits Nostr:', {
    public_key: data.public_key,
    message_length: data.message.length,
  });
  
  try {
    // Validate required fields
    if (!data.message || !data.public_key) {
      throw new Error('Missing required fields: message and public_key are required');
    }

    const response = await makeRequest('/message', 'POST', {
      message: data.message,
      public_key: data.public_key,
    });

    console.log('[sendMessage] Message sent successfully');
    return response;
  } catch (error) {
    console.error('[sendMessage] Error sending message:', error);
    throw error;
  }
};

/**
 * Get messages for a public key
 * GET /nostrmarket/api/v1/message/{public_key}
 * Retrieves all messages sent to a specific public key via Nostr.
 * @param publicKey Public key of the recipient
 * @returns List of messages
 */
export const getMessages = async (publicKey: string): Promise<unknown> => {
  console.log('[getMessages] Getting messages for public key:', publicKey);
  
  try {
    if (!publicKey) {
      throw new Error('Public key is required');
    }

    const response = await makeRequest(`/message/${publicKey}`, 'GET');
    console.log('[getMessages] Messages retrieved successfully');
    return response;
  } catch (error) {
    console.error('[getMessages] Error getting messages:', error);
    throw error;
  }
};

/**
 * Get all orders with optional filters
 * GET /nostrmarket/api/v1/order
 * Retrieves orders with optional filtering by paid status, shipped status, or buyer pubkey.
 * @param filters Optional filters (paid, shipped, pubkey)
 * @returns List of orders
 */
export const getOrders = async (filters?: {
  paid?: boolean;
  shipped?: boolean;
  pubkey?: string;
}): Promise<unknown> => {
  console.log('[getOrders] Getting orders with filters:', filters);
  
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters?.paid !== undefined) {
      queryParams.append('paid', filters.paid.toString());
    }
    if (filters?.shipped !== undefined) {
      queryParams.append('shipped', filters.shipped.toString());
    }
    if (filters?.pubkey) {
      queryParams.append('pubkey', filters.pubkey);
    }

    const endpoint = queryParams.toString() 
      ? `/order?${queryParams.toString()}` 
      : '/order';
    
    const response = await makeRequest(endpoint, 'GET');
    console.log('[getOrders] Orders retrieved successfully');
    return response;
  } catch (error) {
    console.error('[getOrders] Error getting orders:', error);
    throw error;
  }
};

/**
 * Get product by ID
 * GET /nostrmarket/api/v1/product/{product_id}
 * Retrieves a specific product by its ID.
 * @param productId Product ID
 * @returns Product object
 */
export const getProduct = async (productId: string): Promise<unknown> => {
  console.log('[getProduct] Getting product:', productId);
  
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const response = await makeRequest(`/product/${productId}`, 'GET');
    console.log('[getProduct] Product retrieved successfully');
    return response;
  } catch (error) {
    console.error('[getProduct] Error getting product:', error);
    throw error;
  }
};

/**
 * Get products by stall ID
 * GET /nostrmarket/api/v1/stall/product/{stall_id}
 * Retrieves all products for a specific stall.
 * @param stallId Stall ID
 * @param pending Optional filter for pending products
 * @returns List of products
 */
export const getProductsByStall = async (
  stallId: string,
  pending?: boolean
): Promise<unknown> => {
  console.log('[getProductsByStall] Getting products for stall:', stallId);
  
  try {
    if (!stallId) {
      throw new Error('Stall ID is required');
    }

    const queryParams = new URLSearchParams();
    if (pending !== undefined) {
      queryParams.append('pending', pending.toString());
    }

    const endpoint = queryParams.toString()
      ? `/stall/product/${stallId}?${queryParams.toString()}`
      : `/stall/product/${stallId}`;

    const response = await makeRequest(endpoint, 'GET');
    console.log('[getProductsByStall] Products retrieved successfully');
    return response;
  } catch (error) {
    console.error('[getProductsByStall] Error getting products by stall:', error);
    throw error;
  }
};

