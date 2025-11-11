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
  status: OrderStatus;
  payment_hash: string | null;
  payment_request: string | null;
  total_sats: number | null;
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

