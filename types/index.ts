// TurboZaps TypeScript Types
// Sprint 1 - Base Backend Structure

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_sats: number;
  category: string | null;
  image: string | null;
  stall_id: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  buyer_pubkey: string;
  seller_pubkey?: string | null;
  status: OrderStatus;
  payment_hash: string | null;
  payment_request: string | null;
  total_sats: number | null;
  escrow_held?: boolean | null;
  created_at: string;
}

export type OrderStatus = 'pending' | 'paid' | 'released' | 'cancelled' | 'refunded';

export interface Message {
  id: string;
  order_id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}

// Request/Response Types for API

export interface CreateProductRequest {
  name: string;
  description?: string;
  price_sats: number;
  category?: string;
  image?: string;
  stall_id?: string;
}

export interface CreateOrderRequest {
  product_id: string;
  buyer_pubkey: string;
  seller_pubkey?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  payment_request: string | null;
  status: OrderStatus;
}

export interface CreateMessageRequest {
  order_id: string;
  sender: string;
  receiver: string;
  content: string;
}

export interface CreateMessageResponse {
  ok: boolean;
  message_id: string;
}

// LNbits API Types

export interface ProductData {
  stall_id: string;
  name: string;
  categories?: string[];
  price: number;
  quantity?: number;
  images?: string[];
  config?: {
    description?: string;
    currency?: string;
  };
}

export interface OrderData {
  product_id: string;
  buyer_pubkey: string;
  shipping_id?: string;
}

export interface MessageData {
  message: string;
  public_key: string;
}

export interface LNbitsOrderResponse {
  id: string;
  product_id: string;
  payment_hash: string | null;
  payment_request: string | null;
  paid: boolean;
  shipped: boolean;
  total: number;
}

// Merchant Types
export interface Merchant {
  id?: string;
  private_key: string;
  public_key: string;
  config: {
    name: string;
    about?: string;
    active?: boolean;
  };
}

export interface CreateMerchantRequest {
  private_key: string;
  public_key: string;
  config: {
    name: string;
    about?: string;
    active?: boolean;
  };
}

// Stall Types
export interface Stall {
  id?: string;
  wallet: string;
  name: string;
  currency?: string;
  shipping_zones?: Array<{
    id?: string;
    name: string;
    currency: string;
    cost: number;
  }>;
}

export interface CreateStallRequest {
  wallet: string;
  name: string;
  currency?: string;
  shipping_zones?: Array<{
    id?: string;
    name: string;
    currency: string;
    cost: number;
  }>;
}

// Customer Types
export interface Customer {
  id?: string;
  merchant_id: string;
  public_key: string;
  profile?: {
    name?: string;
    about?: string;
  };
}

export interface CreateCustomerRequest {
  merchant_id: string;
  public_key: string;
  profile?: {
    name?: string;
    about?: string;
  };
}

