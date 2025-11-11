// TurboZaps Database Configuration
// Sprint 1 - SQLite database setup using better-sqlite3

// Load environment variables
import 'dotenv/config';

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database instance - lazy initialization for Vercel compatibility
let db: Database.Database | null = null;

// Get database path from environment or use default
const getDbPath = () => process.env.DATABASE_URL || path.join(process.cwd(), 'turbozaps.db');

// Initialize database connection (lazy loading)
const getDb = (): Database.Database => {
  if (!db) {
    // Only initialize in runtime, not during build
    if (typeof window === 'undefined') { // Server-side only
      const dbPath = getDbPath();

      // Ensure directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Create database connection
      db = new Database(dbPath);

      // Enable foreign keys
      db.pragma('foreign_keys = ON');

      // Create tables
      db.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price_sats INTEGER NOT NULL,
          category TEXT,
          image TEXT,
          stall_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          buyer_pubkey TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_hash TEXT,
          payment_request TEXT,
          total_sats INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id)
        );

        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          sender TEXT NOT NULL,
          receiver TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id)
        );

        CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
        CREATE INDEX IF NOT EXISTS idx_orders_buyer_pubkey ON orders(buyer_pubkey);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);
        CREATE INDEX IF NOT EXISTS idx_products_stall_id ON products(stall_id);
      `);
    }
  }
  return db!;
};

// Export database getter function instead of instance
export default getDb;

// Helper functions for database operations
export const dbHelpers = {
  // Products
  getProductById: (id: string) => {
    const db = getDb();
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  },

  getAllProducts: (limit = 100, offset = 0) => {
    const db = getDb();
    return db.prepare('SELECT * FROM products LIMIT ? OFFSET ?').all(limit, offset);
  },

  createProduct: (product: {
    id: string;
    name: string;
    description: string | null;
    price_sats: number;
    category: string | null;
    image: string | null;
    stall_id: string | null;
  }) => {
    const db = getDb();
    return db
      .prepare(
        'INSERT INTO products (id, name, description, price_sats, category, image, stall_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        product.id,
        product.name,
        product.description,
        product.price_sats,
        product.category,
        product.image,
        product.stall_id
      );
  },

  // Orders
  getOrderById: (id: string) => {
    const db = getDb();
    return db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  },

  getOrdersByBuyer: (buyerPubkey: string, limit = 100, offset = 0) => {
    const db = getDb();
    return db
      .prepare('SELECT * FROM orders WHERE buyer_pubkey = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(buyerPubkey, limit, offset);
  },

  getOrdersByStatus: (status: string, limit = 100, offset = 0) => {
    const db = getDb();
    return db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(status, limit, offset);
  },

  getOrdersByBuyerAndStatus: (buyerPubkey: string, status: string, limit = 100, offset = 0) => {
    const db = getDb();
    return db
      .prepare('SELECT * FROM orders WHERE buyer_pubkey = ? AND status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(buyerPubkey, status, limit, offset);
  },

  getAllOrders: (limit = 100, offset = 0) => {
    const db = getDb();
    return db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  },

  createOrder: (order: {
    id: string;
    product_id: string;
    buyer_pubkey: string;
    status: string;
    payment_hash: string | null;
    payment_request: string | null;
    total_sats: number | null;
  }) => {
    const db = getDb();
    return db
      .prepare(
        'INSERT INTO orders (id, product_id, buyer_pubkey, status, payment_hash, payment_request, total_sats) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        order.id,
        order.product_id,
        order.buyer_pubkey,
        order.status,
        order.payment_hash,
        order.payment_request,
        order.total_sats
      );
  },

  updateOrderStatus: (id: string, status: string) => {
    const db = getDb();
    return db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  },

  updateOrderPayment: (id: string, paymentHash: string, paymentRequest: string) => {
    const db = getDb();
    return db
      .prepare('UPDATE orders SET payment_hash = ?, payment_request = ?, status = ? WHERE id = ?')
      .run(paymentHash, paymentRequest, 'paid', id);
  },

  updateOrderStatusAndPayment: (id: string, status: string, paymentHash?: string | null, paymentRequest?: string | null) => {
    const db = getDb();
    if (paymentHash && paymentRequest) {
      return db
        .prepare('UPDATE orders SET status = ?, payment_hash = ?, payment_request = ? WHERE id = ?')
        .run(status, paymentHash, paymentRequest, id);
    } else {
      return db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    }
  },

  // Messages
  getMessagesByOrderId: (orderId: string, limit = 100, offset = 0) => {
    const db = getDb();
    return db
      .prepare('SELECT * FROM messages WHERE order_id = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?')
      .all(orderId, limit, offset);
  },

  getMessagesByOrderIdAndSender: (orderId: string, sender: string, limit = 100, offset = 0) => {
    const db = getDb();
    return db
      .prepare('SELECT * FROM messages WHERE order_id = ? AND sender = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?')
      .all(orderId, sender, limit, offset);
  },

  getMessagesByOrderIdAndReceiver: (orderId: string, receiver: string, limit = 100, offset = 0) => {
    const db = getDb();
    return db
      .prepare('SELECT * FROM messages WHERE order_id = ? AND receiver = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?')
      .all(orderId, receiver, limit, offset);
  },

  createMessage: (message: {
    id: string;
    order_id: string;
    sender: string;
    receiver: string;
    content: string;
  }) => {
    const db = getDb();
    return db
      .prepare('INSERT INTO messages (id, order_id, sender, receiver, content) VALUES (?, ?, ?, ?, ?)')
      .run(message.id, message.order_id, message.sender, message.receiver, message.content);
  },
};
