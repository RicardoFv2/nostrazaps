// TurboZaps LNbits Integration Wrapper
// Sprint 2 - LNbits NostrMarket API Integration

import type { ProductData, OrderData, MessageData, LNbitsOrderResponse } from '@/types';

// Environment variables
const LNBITS_URL = process.env.LNBITS_URL || 'https://demo.lnbits.com';
const LNBITS_API_KEY = process.env.LNBITS_API_KEY || '';

// Base URL for NostrMarket API
// Direct path to NostrMarket extension
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
      'X-API-Key': LNBITS_API_KEY,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const fullUrl = `${NOSTRMARKET_BASE_URL}${endpoint}`;
    console.log(`[LNbits API] ${method} ${fullUrl}`);
    console.log(`[LNbits API] Base URL: ${NOSTRMARKET_BASE_URL}, Endpoint: ${endpoint}`);
    
    const response = await fetch(fullUrl, options);
    
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
    quantity: data.quantity,
  });
  
  try {
    // Validate required fields
    if (!data.stall_id || !data.name || data.price === undefined) {
      throw new Error('Missing required fields: stall_id, name, and price are required');
    }

    // Ensure quantity is set (default to 1 if not provided)
    const productData = {
      ...data,
      quantity: data.quantity ?? 1,
    };

    const response = await makeRequest('/product', 'POST', productData);
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
/**
 * Create a Lightning invoice for an order using LNbits API
 * Orders in NostrMarket are created via Nostr events, not API
 * So we generate invoices directly using LNbits wallet API
 * @param data Order data including amount and memo
 * @returns Invoice payment request and payment hash
 */
export const createLightningInvoice = async (data: {
  amount: number; // amount in sats
  memo: string;
  order_id: string;
}): Promise<{ payment_request: string; payment_hash: string }> => {
  console.log('[createLightningInvoice] Generating Lightning invoice:', {
    amount: data.amount,
    memo: data.memo,
    order_id: data.order_id,
  });

  // Check if we're in demo mode (no LNbits configured)
  const isDemoMode = !LNBITS_URL || !LNBITS_API_KEY || LNBITS_URL === 'https://demo.lnbits.com';
  
  if (isDemoMode) {
    console.warn('[createLightningInvoice] DEMO MODE: Generating mock invoice (LNbits not configured)');
    
    // Generate mock invoice for demo purposes
    const mockPaymentHash = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    
    const mockInvoice = `lnbc${data.amount}n1p${mockPaymentHash.substring(0, 20)}pp${mockPaymentHash.substring(20, 40)}`;
    
    return {
      payment_request: mockInvoice,
      payment_hash: mockPaymentHash,
    };
  }

  try {
    // Use LNbits wallet API to create invoice (not NostrMarket)
    // This bypasses NostrMarket and creates invoice directly
    const invoiceUrl = `${LNBITS_URL}/api/v1/payments`;
    
    console.log('[createLightningInvoice] Calling LNbits API:', invoiceUrl);
    
    const response = await fetch(invoiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LNBITS_API_KEY,
      },
      body: JSON.stringify({
        out: false, // incoming payment (invoice)
        amount: data.amount,
        memo: data.memo,
        unit: 'sat',
        webhook: null, // TODO: Add webhook for payment confirmation
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `Failed to create Lightning invoice: ${response.status} - ${errorText}`;
      console.error('[createLightningInvoice]', errorMessage);
      
      // Check if it's a connection error (520, 502, 503, 504)
      if (response.status >= 500) {
        console.error('[createLightningInvoice] LNbits server error - check if instance is running');
        console.error('[createLightningInvoice] URL:', invoiceUrl);
        console.error('[createLightningInvoice] Consider using a different LNbits instance or demo mode');
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    console.log('[createLightningInvoice] Invoice created successfully');
    
    return {
      payment_request: result.payment_request,
      payment_hash: result.payment_hash,
    };
  } catch (error) {
    console.error('[createLightningInvoice] Error creating invoice:', error);
    
    // If it's a network error, provide helpful message
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to LNbits at ${LNBITS_URL}. ` +
        'Please check: 1) LNbits is running, 2) URL is correct, 3) Network connection. ' +
        'You can use https://legend.lnbits.com for testing.'
      );
    }
    
    throw error;
  }
};

/**
 * DEPRECATED: NostrMarket doesn't support POST /order
 * Orders are created via Nostr events, not API
 * Use createLightningInvoice instead for generating payment requests
 */
export const createOrder = async (data: OrderData): Promise<LNbitsOrderResponse> => {
  console.log('[createOrder] DEPRECATED: NostrMarket orders are created via Nostr events, not API');
  console.log('[createOrder] Use createLightningInvoice() to generate payment requests instead');
  
  throw new Error(
    'POST /order is not supported by LNbits NostrMarket. ' +
    'Orders are created through Nostr events. ' +
    'Use createLightningInvoice() to generate Lightning invoices for payments.'
  );
};

/**
 * Get order status from LNbits NostrMarket
 * GET /nostrmarket/api/v1/order/{order_id}
 * 
 * NOTE: This function is used for orders that exist in NostrMarket.
 * For local orders created directly with invoices, use checkPaymentStatus() instead.
 * 
 * @param orderId Order ID
 * @returns Order status and details including payment information
 * @throws Error if order not found (404) or other API errors
 */
export const getOrderStatus = async (orderId: string): Promise<LNbitsOrderResponse> => {
  console.log('[getOrderStatus] Getting order status from LNbits NostrMarket:', orderId);
  
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
    // Check if it's a 404 error (order not found)
    if (error instanceof Error && error.message.includes('404')) {
      // Log as info instead of error since this is expected for local orders
      console.log('[getOrderStatus] Order not found in NostrMarket (expected for local orders):', orderId);
      throw new Error(`Order not found in NostrMarket: ${orderId}. This is expected if the order was created locally.`);
    }
    
    console.error('[getOrderStatus] Error getting order status:', error);
    throw error;
  }
};

/**
 * Send a Lightning payment to a wallet or invoice
 * POST /api/v1/payments
 * This is used to release escrow funds by sending payment to the seller
 * @param paymentRequest Lightning invoice (bolt11) to pay
 * @param amount Optional amount in sats (for amountless invoices)
 * @returns Payment confirmation with payment_hash
 */
export const sendLightningPayment = async (data: {
  payment_request: string;
  amount?: number;
}): Promise<{ payment_hash: string; checking_id: string; amount: number }> => {
  console.log('[sendLightningPayment] Sending Lightning payment');

  // Check if we're in demo mode (no LNbits configured)
  const isDemoMode = !LNBITS_URL || !LNBITS_API_KEY || LNBITS_URL === 'https://demo.lnbits.com';
  
  if (isDemoMode) {
    console.warn('[sendLightningPayment] DEMO MODE: Simulating payment (LNbits not configured)');
    
    // Generate mock payment hash
    const mockPaymentHash = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    
    return {
      payment_hash: mockPaymentHash,
      checking_id: mockPaymentHash,
      amount: data.amount || 0,
    };
  }

  try {
    // Use LNbits wallet API to send payment
    const paymentUrl = `${LNBITS_URL}/api/v1/payments`;
    
    console.log('[sendLightningPayment] Calling LNbits API:', paymentUrl);
    
    const requestBody: { out: boolean; bolt11: string; amount?: number } = {
      out: true, // outgoing payment
      bolt11: data.payment_request,
    };
    
    // Include amount only if provided (for amountless invoices)
    if (data.amount) {
      requestBody.amount = data.amount;
    }
    
    const response = await fetch(paymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LNBITS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `Failed to send Lightning payment: ${response.status} - ${errorText}`;
      console.error('[sendLightningPayment]', errorMessage);
      
      if (response.status >= 500) {
        console.error('[sendLightningPayment] LNbits server error - check if instance is running');
        console.error('[sendLightningPayment] URL:', paymentUrl);
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    console.log('[sendLightningPayment] Payment sent successfully');
    
    return {
      payment_hash: result.payment_hash,
      checking_id: result.checking_id,
      amount: data.amount || result.amount || 0,
    };
  } catch (error) {
    console.error('[sendLightningPayment] Error sending payment:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to LNbits at ${LNBITS_URL}. ` +
        'Please check: 1) LNbits is running, 2) URL is correct, 3) Network connection.'
      );
    }
    
    throw error;
  }
};

/**
 * Check payment status directly in LNbits using payment_hash
 * Uses two methods:
 * 1. GET /api/v1/payments/{payment_hash} - Direct lookup
 * 2. GET /api/v1/payments - List payments and search (fallback)
 * @param paymentHash Payment hash to check
 * @returns Payment status with paid information
 */
export const checkPaymentStatus = async (paymentHash: string): Promise<{ paid: boolean; details?: unknown }> => {
  console.log('[checkPaymentStatus] Checking payment status in LNbits:', paymentHash.substring(0, 16) + '...');

  // Check if we're in demo mode
  const isDemoMode = !LNBITS_URL || !LNBITS_API_KEY || LNBITS_URL === 'https://demo.lnbits.com';
  
  if (isDemoMode) {
    console.warn('[checkPaymentStatus] DEMO MODE: Cannot check payment status (LNbits not configured)');
    return { paid: false };
  }

  try {
    if (!paymentHash) {
      throw new Error('Payment hash is required');
    }

    // Method 1: Try direct lookup using payment_hash endpoint
    const paymentUrl = `${LNBITS_URL}/api/v1/payments/${paymentHash}`;
    
    console.log('[checkPaymentStatus] Calling LNbits API (direct):', paymentUrl);
    
    let response = await fetch(paymentUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LNBITS_API_KEY,
      },
    });

    let result: unknown;
    let isPaid = false;

    // If direct lookup fails, try listing payments and searching
    if (!response.ok && response.status === 404) {
      console.log('[checkPaymentStatus] Direct lookup returned 404, trying payment list search...');
      
      // Method 2: List payments and search for our payment_hash
      const paymentsListUrl = `${LNBITS_URL}/api/v1/payments?limit=100`;
      response = await fetch(paymentsListUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': LNBITS_API_KEY,
        },
      });

      if (!response.ok) {
        console.log('[checkPaymentStatus] Payment list also failed, payment likely not paid yet');
        return { paid: false };
      }

      const paymentsList = await response.json() as unknown[];
      
      // Search for payment with matching hash
      const payment = paymentsList.find((p: unknown) => {
        const pObj = p as { payment_hash?: string; checking_id?: string };
        return pObj.payment_hash === paymentHash || pObj.checking_id === paymentHash;
      });

      if (!payment) {
        console.log('[checkPaymentStatus] Payment not found in list, not paid yet');
        return { paid: false };
      }

      result = payment;
    } else if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `Failed to check payment status: ${response.status} - ${errorText}`;
      console.error('[checkPaymentStatus]', errorMessage);
      throw new Error(errorMessage);
    } else {
      result = await response.json();
    }

    // Parse payment status from result
    // LNbits payment response structure:
    // - For incoming payments (invoices): { paid: true/false, ... }
    // - For outgoing payments: { paid: true/false, ... }
    // - May have nested 'details' object
    
    const paymentObj = result as {
      paid?: boolean | number;
      status?: string;
      details?: { paid?: boolean | number; status?: string };
      payment_hash?: string;
      checking_id?: string;
      [key: string]: unknown;
    };

    // Check multiple possible indicators of paid status
    isPaid = 
      paymentObj.paid === true || 
      paymentObj.paid === 1 || 
      paymentObj.status === 'complete' || 
      paymentObj.status === 'paid' ||
      paymentObj.status === 'settled' ||
      (paymentObj.details && (
        paymentObj.details.paid === true ||
        paymentObj.details.paid === 1 ||
        paymentObj.details.status === 'complete' ||
        paymentObj.details.status === 'paid' ||
        paymentObj.details.status === 'settled'
      ));

    console.log('[checkPaymentStatus] Payment status result:', {
      paid: isPaid,
      paymentHash: paymentObj.payment_hash || paymentObj.checking_id,
      status: paymentObj.status || paymentObj.details?.status,
      hasDetails: !!paymentObj.details,
      rawPaid: paymentObj.paid,
      detailsPaid: paymentObj.details?.paid,
    });
    
    return {
      paid: isPaid,
      details: result,
    };
  } catch (error) {
    console.error('[checkPaymentStatus] Error checking payment status:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to LNbits at ${LNBITS_URL}. ` +
        'Please check: 1) LNbits is running, 2) URL is correct, 3) Network connection.'
      );
    }
    
    throw error;
  }
};

/**
 * Release escrow funds to seller by sending a Lightning payment
 * This function generates an invoice for the seller and sends payment
 * @param sellerPaymentRequest Seller's Lightning invoice (bolt11)
 * @param amount Amount in sats to send to seller
 * @param orderId Order ID for logging purposes
 * @returns Payment confirmation
 */
export const releaseEscrow = async (
  sellerPaymentRequest: string,
  amount: number,
  orderId: string
): Promise<{ payment_hash: string; checking_id: string; amount: number }> => {
  console.log('[releaseEscrow] Releasing escrow for order:', orderId);
  
  try {
    if (!sellerPaymentRequest) {
      throw new Error('Seller payment request (invoice) is required');
    }
    
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Send payment to seller's invoice
    const payment = await sendLightningPayment({
      payment_request: sellerPaymentRequest,
      amount: amount,
    });

    console.log('[releaseEscrow] Escrow released successfully for order:', orderId);
    console.log('[releaseEscrow] Payment hash:', payment.payment_hash);
    
    return payment;
  } catch (error) {
    console.error('[releaseEscrow] Error releasing escrow:', error);
    throw error;
  }
};

/**
 * Refund order by sending payment back to buyer
 * Sends the escrow funds back to the buyer's Lightning invoice
 * @param buyerPaymentRequest Buyer's Lightning invoice (bolt11) for refund
 * @param amount Amount in sats to refund to buyer
 * @param orderId Order ID for logging purposes
 * @returns Payment confirmation
 */
export const refundOrder = async (
  buyerPaymentRequest: string,
  amount: number,
  orderId: string
): Promise<{ payment_hash: string; checking_id: string; amount: number }> => {
  console.log('[refundOrder] Refunding order:', orderId);
  
  try {
    if (!buyerPaymentRequest) {
      throw new Error('Buyer payment request (invoice) is required');
    }
    
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Send payment to buyer's invoice (refund)
    const payment = await sendLightningPayment({
      payment_request: buyerPaymentRequest,
      amount: amount,
    });

    console.log('[refundOrder] Order refunded successfully:', orderId);
    console.log('[refundOrder] Payment hash:', payment.payment_hash);
    
    return payment;
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
    console.log('[getProductsByStall] Products retrieved successfully:', {
      type: typeof response,
      isArray: Array.isArray(response),
      response: response,
    });
    return response;
  } catch (error) {
    console.error('[getProductsByStall] Error getting products by stall:', error);
    throw error;
  }
};
// ==================== MERCHANTS ====================

/**
 * Create a merchant in LNbits NostrMarket
 * POST /nostrmarket/api/v1/merchant
 * @param data Merchant keys
 * @returns Created merchant object
 */
export const createMerchant = async (data: {
  private_key: string;
  public_key: string;
  config: {
    name: string;
    about?: string;
    active?: boolean;
  };
}): Promise<unknown> => {
  console.log('[createMerchant] Creating merchant in LNbits');
  console.log('[createMerchant] Keys format - private_key length:', data.private_key.length, 'public_key length:', data.public_key.length);

  try {
    if (!data.private_key || !data.public_key || !data.config?.name) {
      throw new Error('Missing required fields: private_key, public_key, and config.name are required');
    }

    // Validate key format (should be 64 hex characters)
    const hexRegex = /^[0-9a-f]{64}$/i;
    if (!hexRegex.test(data.private_key)) {
      throw new Error(`Invalid private_key format. Expected 64 hex characters, got: ${data.private_key.substring(0, 10)}...`);
    }
    if (!hexRegex.test(data.public_key)) {
      throw new Error(`Invalid public_key format. Expected 64 hex characters, got: ${data.public_key.substring(0, 10)}...`);
    }

    const payload = {
      private_key: data.private_key,
      public_key: data.public_key,
      config: {
        name: data.config.name,
        about: data.config.about || '',
        active: data.config.active ?? true,
      },
    };

    console.log('[createMerchant] Sending payload with config:', payload.config);
    const response = await makeRequest('/merchant', 'POST', payload);
    console.log('[createMerchant] Merchant created successfully');
    return response;
  } catch (error) {
    console.error('[createMerchant] Error creating merchant:', error);
    throw error;
  }
};

/**
 * Get merchant information
 * GET /nostrmarket/api/v1/merchant
 * @returns Merchant object
 */
export const getMerchant = async (): Promise<unknown> => {
  console.log('[getMerchant] Getting merchant from LNbits')

  try {
    const response = await makeRequest('/merchant', 'GET')
    console.log('[getMerchant] Merchant retrieved successfully')
    return response
  } catch (error) {
    console.error('[getMerchant] Error getting merchant:', error)
    throw error
  }
}


// ==================== STALLS ====================

/**
 * Create a stall in LNbits NostrMarket
 * POST /nostrmarket/api/v1/stall
 * @param data Stall data (wallet, name, currency, shipping_zones)
 * @returns Created stall object
 */
export const createStall = async (data: {
  wallet: string;
  name: string;
  currency?: string;
  shipping_zones?: Array<{
    id?: string;
    name: string;
    currency: string;
    cost: number;
  }>;
}): Promise<unknown> => {
  console.log('[createStall] Creating stall in LNbits:', {
    wallet: data.wallet,
    name: data.name,
  });
  
  try {
    if (!data.wallet || !data.name) {
      throw new Error('Missing required fields: wallet and name are required');
    }

    const response = await makeRequest('/stall', 'POST', {
      wallet: data.wallet,
      name: data.name,
      currency: data.currency || 'sat',
      shipping_zones: data.shipping_zones || [],
    });
    console.log('[createStall] Stall created successfully');
    return response;
  } catch (error) {
    console.error('[createStall] Error creating stall:', error);
    throw error;
  }
};

/**
 * Get stalls
 * GET /nostrmarket/api/v1/stall
 * @param pending Optional filter for pending stalls
 * @returns List of stalls
 */
export const getStalls = async (pending?: boolean): Promise<unknown> => {
  console.log('[getStalls] Getting stalls from LNbits');
  
  try {
    const queryParams = new URLSearchParams();
    if (pending !== undefined) {
      queryParams.append('pending', pending.toString());
    }

    const endpoint = queryParams.toString()
      ? `/stall?${queryParams.toString()}`
      : '/stall';

    const response = await makeRequest(endpoint, 'GET');
    console.log('[getStalls] Stalls retrieved successfully');
    return response;
  } catch (error) {
    console.error('[getStalls] Error getting stalls:', error);
    throw error;
  }
};

/**
 * Get stall by ID
 * GET /nostrmarket/api/v1/stall/{stall_id}
 * @param stallId Stall ID
 * @returns Stall object
 */
export const getStall = async (stallId: string): Promise<unknown> => {
  console.log('[getStall] Getting stall:', stallId);
  
  try {
    if (!stallId) {
      throw new Error('Stall ID is required');
    }

    const response = await makeRequest(`/stall/${stallId}`, 'GET');
    console.log('[getStall] Stall retrieved successfully');
    return response;
  } catch (error) {
    console.error('[getStall] Error getting stall:', error);
    throw error;
  }
};

// ==================== CUSTOMERS ====================

/**
 * Create a customer in LNbits NostrMarket
 * POST /nostrmarket/api/v1/customer
 * @param data Customer data (merchant_id, public_key, profile)
 * @returns Created customer object
 */
export const createCustomer = async (data: {
  merchant_id: string;
  public_key: string;
  profile?: {
    name?: string;
    about?: string;
  };
}): Promise<unknown> => {
  console.log('[createCustomer] Creating customer in LNbits');
  console.log('[createCustomer] Keys format - public_key length:', data.public_key.length, 'merchant_id:', data.merchant_id);
  
  try {
    if (!data.merchant_id || !data.public_key) {
      throw new Error('Missing required fields: merchant_id and public_key are required');
    }

    // Validate key format (should be 64 hex characters)
    const hexRegex = /^[0-9a-f]{64}$/i;
    if (!hexRegex.test(data.public_key)) {
      throw new Error(`Invalid public_key format. Expected 64 hex characters, got: ${data.public_key.substring(0, 10)}... (length: ${data.public_key.length})`);
    }

    const payload = {
      merchant_id: data.merchant_id,
      public_key: data.public_key,
      profile: data.profile || {},
    };

    console.log('[createCustomer] Sending payload with merchant_id:', payload.merchant_id);
    const response = await makeRequest('/customer', 'POST', payload);
    console.log('[createCustomer] Customer created successfully');
    return response;
  } catch (error) {
    console.error('[createCustomer] Error creating customer:', error);
    throw error;
  }
};

/**
 * Get customers
 * GET /nostrmarket/api/v1/customer
 * @returns List of customers
 */
export const getCustomers = async (): Promise<unknown> => {
  console.log('[getCustomers] Getting customers from LNbits');
  
  try {
    const response = await makeRequest('/customer', 'GET');
    console.log('[getCustomers] Customers retrieved successfully');
    return response;
  } catch (error) {
    console.error('[getCustomers] Error getting customers:', error);
    throw error;
  }
};

// ==================== ORDER UPDATES ====================

/**
 * Update order status
 * PATCH /nostrmarket/api/v1/order/{order_id}
 * Updates order status (paid, shipped, etc.)
 * @param orderId Order ID
 * @param updates Order updates (paid, shipped, message)
 * @returns Updated order object
 */
export const updateOrder = async (
  orderId: string,
  updates: {
    paid?: boolean;
    shipped?: boolean;
    message?: string;
  }
): Promise<unknown> => {
  console.log('[updateOrder] Updating order:', orderId, updates);
  
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const response = await makeRequest(`/order/${orderId}`, 'PATCH', updates);
    console.log('[updateOrder] Order updated successfully');
    return response;
  } catch (error) {
    console.error('[updateOrder] Error updating order:', error);
    throw error;
  }
};

