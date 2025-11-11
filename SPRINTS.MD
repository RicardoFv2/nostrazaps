# 🚀 TurboZaps Backend Development Sprints

## 📋 Sprint 1 — Base Backend Structure

**Objective:** Create the foundational backend structure for TurboZaps using Next.js (App Router) + TypeScript + SQLite.

**Goal:** Build an API that manages products, orders, and Lightning escrow through LNbits NostrMarket API.

### 📁 Expected Structure
```
/app/api/products/route.ts
/app/api/orders/route.ts
/app/api/orders/[id]/release/route.ts
/app/api/orders/[id]/refund/route.ts
/app/api/chat/route.ts
/lib/db.ts
/lib/lnbits.ts
/types/index.ts
/docs/api.md
/docs/lnbitsapi.json
```

### 🗄️ Database Schema (SQLite)

**products table:**
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `description` (TEXT)
- `price_sats` (INTEGER NOT NULL)
- `category` (TEXT)
- `image` (TEXT)
- `stall_id` (TEXT)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

**orders table:**
- `id` (TEXT PRIMARY KEY)
- `product_id` (TEXT NOT NULL)
- `buyer_pubkey` (TEXT NOT NULL)
- `status` (TEXT DEFAULT 'pending')
- `payment_hash` (TEXT)
- `payment_request` (TEXT)
- `total_sats` (INTEGER)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

**messages table:**
- `id` (TEXT PRIMARY KEY)
- `order_id` (TEXT NOT NULL)
- `sender` (TEXT NOT NULL)
- `receiver` (TEXT NOT NULL)
- `content` (TEXT NOT NULL)
- `timestamp` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 🔧 Implementation Requirements

**`/lib/db.ts`:**
- Use `better-sqlite3` or `sqlite3`
- Implement database connection and table creation
- Export database instance

**`/lib/lnbits.ts` (placeholders):**
- `createProduct()`
- `createOrder()`
- `getOrderStatus()`
- `releaseEscrow()`
- `refundOrder()`
- `sendMessage()`

### 🌍 Environment Variables
```env
LNBITS_URL=https://demo.lnbits.com
LNBITS_API_KEY=your_api_key_here
DATABASE_URL=./turbozaps.db
```

### 🎯 Sprint Goal
Create the backend skeleton with proper TypeScript types, empty function implementations, and database setup. Export `db` and `lnbits` modules ready for API route imports.

## ⚙️ Sprint 2 — LNbits Integration Wrapper

**Objective:** Implement `/lib/lnbits.ts` to interact with LNbits NostrMarket API using the documentation in `/docs/api.md`.

### 🔧 Required Functions
```typescript
export async function createProduct(data: ProductData)
export async function createOrder(data: OrderData)
export async function getOrderStatus(orderId: string)
export async function releaseEscrow(orderId: string)
export async function refundOrder(orderId: string)
export async function sendMessage(data: MessageData)
```

### 🌐 API Endpoint Mapping
- `POST /nostrmarket/api/v1/product` → `createProduct()`
- `GET /nostrmarket/api/v1/order/{id}` → `getOrderStatus()`
- `POST /nostrmarket/api/v1/message` → `sendMessage()`
- `PUT /nostrmarket/api/v1/order/reissue` → `refundOrder()` (optional)

### 🛠️ Implementation Details
- Use `fetch()` with `X-Api-Key` header and `LNBITS_URL`
- Handle errors with try/catch and `console.error`
- Use TypeScript interfaces from `/types/index.ts`
- Return JSON data ready for UI consumption

### 📝 Example Implementation
```typescript
const res = await fetch(`${LNBITS_URL}/nostrmarket/api/v1/order`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": process.env.LNBITS_API_KEY!,
  },
  body: JSON.stringify(data),
});
return await res.json();
```

## 💸 Sprint 3 — Orders API & Escrow Flow

**Objective:** Implement the complete order management system with Lightning escrow for TurboZaps.

### 🛠️ API Endpoints to Implement

**`POST /api/orders`**
- **Input:** `{ product_id, buyer_pubkey }`
- **Process:** Call `createOrder()` from lnbits.ts, save to SQLite with status 'pending'
- **Output:** `{ order_id, payment_request, status }`

**`GET /api/orders`**
- **Function:** List all orders with filtering options
- **Query params:** `status`, `buyer_pubkey`, `limit`, `offset`

**`POST /api/orders/[id]/release`**
- **Function:** Release escrow funds to seller
- **Process:** Call `releaseEscrow()`, update status to 'released'

**`POST /api/orders/[id]/refund`**
- **Function:** Refund escrow funds to buyer
- **Process:** Call `refundOrder()`, update status to 'refunded'

### ⚠️ Implementation Considerations
- All responses must be JSON format
- Use logging: `console.log('Order released:', id)`
- Handle HTTP errors (LNbits may return 403, 404, 500)
- Maintain UI consistency: `pending`, `paid`, `released`, `cancelled`
- Validate order ownership before release/refund operations

## 💬 Sprint 4 — Chat System (Buyer/Seller Communication)

**Objective:** Create `/app/api/chat/route.ts` to handle real-time messaging between buyers and sellers.

### 🛠️ API Endpoints to Implement

**`POST /api/chat`**
- **Input:** `{ order_id, sender, receiver, content }`
- **Process:** Save to SQLite, call `sendMessage()` from LNbits
- **Output:** `{ ok: true, message_id }`

**`GET /api/chat`**
- **Query params:** `order_id` (required), `limit`, `offset`
- **Function:** Retrieve messages for a specific order

### 🗄️ Database Schema
```sql
messages(
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 🔧 Implementation Features
- **LNbits Integration:** Call `/nostrmarket/api/v1/message` endpoint
- **Message Filtering:** By `order_id`, optional `buyer_pubkey`/`seller_pubkey`
- **Response Format:**
```json
[
  { "from": "seller", "text": "Confirmas la entrega?" },
  { "from": "buyer", "text": "Sí, en el parque central." }
]
```

### 🚀 Optional Enhancements
- WebSocket support for real-time messaging
- Long-polling fallback
- Message encryption
- File attachments support

## 🧠 Sprint 5 — Local Testing & Verification

**Objective:** Create `/scripts/test-local.ts` to test all backend endpoints without requiring a frontend.

### 🧪 Test Scenarios to Implement
1. **Create Product** - Test product creation and storage
2. **Create Order** - Test escrow order creation with LNbits
3. **Check Order Status** - Verify order status updates
4. **Send Message** - Test buyer/seller communication
5. **Release Funds** - Test escrow release to seller
6. **Refund Order** - Test escrow refund to buyer

### 🚀 Execution Instructions
```bash
ts-node scripts/test-local.ts
```

### 📊 Expected Output
- Console logs showing API responses
- LNbits connection debugging information
- Success/failure status for each test
- Error handling verification

## 🧩 Sprint 6 — Backend Technical Documentation

**Objective:** Create comprehensive `README_BACKEND.md` for the TurboZaps backend.

### 📋 Documentation Requirements

**Dependencies Section:**
- Next.js, TypeScript, SQLite
- better-sqlite3, dotenv
- Development vs production dependencies

**Environment Variables:**
- `LNBITS_URL` - LNbits instance URL
- `LNBITS_API_KEY` - API authentication key
- `DATABASE_URL` - SQLite database path

**Complete Flow Documentation:**
- Order Creation → Escrow → Release/Refund
- API endpoint interactions
- Database state changes

**cURL Examples:**
```bash
# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"product_id": "123", "buyer_pubkey": "npub..."}'

# Check order status
curl http://localhost:3000/api/orders/123
```

**Frontend Integration Guide:**
- How to connect from React/Next.js UI
- fetch() examples for each endpoint
- Error handling patterns
- Real-time updates (WebSocket/polling)

## 💡 Development Workflow Tips

### 🛠️ Cursor IDE Setup
1. Open `CONTEXT.md` and `docs/api.md` as pinned context
2. Copy and paste Sprint 1 prompt into Cursor chat
3. Wait for automatic structure generation
4. Continue with Sprint 2, 3, etc. sequentially

### 🔄 Progressive Implementation
- Cursor understands context progressively
- Each sprint builds upon previous work
- Test frequently to catch integration issues early
- Use the test script from Sprint 5 for verification

### 🎯 Best Practices
- Implement one endpoint at a time
- Test LNbits integration thoroughly
- Handle all error cases gracefully
- Maintain consistent API response formats
