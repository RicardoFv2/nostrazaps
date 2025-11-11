// TurboZaps LNbits Integration Wrapper
// Sprint 1 - Placeholder functions for LNbits NostrMarket API

import type { ProductData, OrderData, MessageData, LNbitsOrderResponse } from '@/types';

// Environment variables
const LNBITS_URL = process.env.LNBITS_URL || 'https://demo.lnbits.com';
const LNBITS_API_KEY = process.env.LNBITS_API_KEY || '';

// Base URL for NostrMarket API
const NOSTRMARKET_BASE_URL = `${LNBITS_URL}/nostrmarket/api/v1`;

// Helper function to make API requests
const makeRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown
) => {
  const url = `${NOSTRMARKET_BASE_URL}${endpoint}`;
  
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
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LNbits API Error (${response.status}):`, errorText);
      throw new Error(`LNbits API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('LNbits API Request Error:', error);
    throw error;
  }
};

/**
 * Create a product in LNbits NostrMarket
 * @param data Product data
 * @returns Created product
 */
export const createProduct = async (data: ProductData) => {
  console.log('Creating product in LNbits:', data);
  
  try {
    const response = await makeRequest('/product', 'POST', data);
    return response;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Create an order with Lightning escrow in LNbits NostrMarket
 * @param data Order data
 * @returns Created order with payment request
 */
export const createOrder = async (data: OrderData): Promise<LNbitsOrderResponse> => {
  console.log('Creating order in LNbits:', data);
  
  try {
    // Note: According to API docs, orders are created automatically by the system
    // This function should fetch or create the order based on product_id and buyer_pubkey
    const response = await makeRequest('/order', 'POST', data);
    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get order status from LNbits
 * @param orderId Order ID
 * @returns Order status and details
 */
export const getOrderStatus = async (orderId: string): Promise<LNbitsOrderResponse> => {
  console.log('Getting order status from LNbits:', orderId);
  
  try {
    const response = await makeRequest(`/order/${orderId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error getting order status:', error);
    throw error;
  }
};

/**
 * Release escrow funds to seller
 * @param orderId Order ID
 * @returns Release confirmation
 */
export const releaseEscrow = async (orderId: string) => {
  console.log('Releasing escrow for order:', orderId);
  
  try {
    // Update order status to shipped/paid to release escrow
    const response = await makeRequest(`/order/${orderId}`, 'PATCH', {
      paid: true,
      shipped: true,
      message: 'Escrow released to seller',
    });
    return response;
  } catch (error) {
    console.error('Error releasing escrow:', error);
    throw error;
  }
};

/**
 * Refund order (reissue invoice or cancel)
 * @param orderId Order ID
 * @returns Refund confirmation
 */
export const refundOrder = async (orderId: string) => {
  console.log('Refunding order:', orderId);
  
  try {
    // Use reissue endpoint to refund
    const response = await makeRequest('/order/reissue', 'PUT', {
      id: orderId,
    });
    return response;
  } catch (error) {
    console.error('Error refunding order:', error);
    throw error;
  }
};

/**
 * Send message between buyer and seller via Nostr
 * @param data Message data
 * @returns Message confirmation
 */
export const sendMessage = async (data: MessageData) => {
  console.log('Sending message via LNbits:', data);
  
  try {
    const response = await makeRequest('/message', 'POST', data);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get messages for a public key
 * @param publicKey Public key of the recipient
 * @returns List of messages
 */
export const getMessages = async (publicKey: string) => {
  console.log('Getting messages for public key:', publicKey);
  
  try {
    const response = await makeRequest(`/message/${publicKey}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

