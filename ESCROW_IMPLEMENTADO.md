# ✅ Escrow Real Implementado en TurboZaps

## 🎉 ¡Escrow Custodiado Funcional!

Se ha implementado exitosamente un **escrow real** donde los fondos Lightning se retienen físicamente en la wallet del sistema hasta que ambas partes confirmen la entrega.

---

## 📋 Cambios Implementados

### 1. Base de Datos ✅
**Archivo:** `lib/db.ts`

**Cambios:**
- Agregado campo `seller_pubkey` a la tabla `orders`
- Agregado campo `escrow_held` (boolean) para rastrear si los fondos están retenidos
- Nuevos helpers:
  - `releaseEscrow(orderId)` - Marca escrow como liberado
  - `refundEscrow(orderId)` - Marca escrow como reembolsado

**SQL:**
```sql
ALTER TABLE orders ADD COLUMN seller_pubkey TEXT;
ALTER TABLE orders ADD COLUMN escrow_held BOOLEAN DEFAULT 1;
```

---

### 2. LNbits Integration ✅
**Archivo:** `lib/lnbits.ts`

**Nuevas funciones:**

#### `sendLightningPayment()`
Envía un pago Lightning a cualquier invoice.

```typescript
await sendLightningPayment({
  payment_request: "lnbc50000n...",
  amount: 50000, // sats
});
```

#### `releaseEscrow()` (actualizada)
Libera el escrow enviando pago al vendedor.

```typescript
await releaseEscrow(
  sellerInvoice,  // Lightning invoice del vendedor
  amount,         // Monto en sats
  orderId        // ID de la orden
);
```

#### `refundOrder()` (actualizada)
Devuelve fondos al comprador.

```typescript
await refundOrder(
  buyerInvoice,   // Lightning invoice del comprador
  amount,         // Monto en sats
  orderId        // ID de la orden
);
```

---

### 3. API Endpoints ✅

#### `POST /api/orders/{id}/release`
Libera fondos al vendedor.

**Request:**
```json
{
  "seller_payment_request": "lnbc50000n..."
}
```

**Response:**
```json
{
  "ok": true,
  "message": "✅ Escrow released! Payment sent to seller.",
  "order_id": "abc123",
  "status": "released",
  "escrow_held": false,
  "payment_hash": "a1b2c3...",
  "amount_sent": 50000
}
```

**Validaciones:**
- ✅ Estado debe ser `"paid"`
- ✅ `escrow_held` debe ser `true`
- ✅ Monto debe ser válido
- ✅ Invoice del vendedor debe ser válido

---

#### `POST /api/orders/{id}/refund`
Devuelve fondos al comprador.

**Request:**
```json
{
  "buyer_payment_request": "lnbc50000n..."
}
```

**Response:**
```json
{
  "ok": true,
  "message": "✅ Order refunded! Payment sent back to buyer.",
  "order_id": "abc123",
  "status": "refunded",
  "escrow_held": false,
  "payment_hash": "d4e5f6...",
  "amount_refunded": 50000
}
```

**Validaciones:**
- ✅ Estado debe ser `"paid"`
- ✅ `escrow_held` debe ser `true`
- ✅ Monto debe ser válido
- ✅ Invoice del comprador debe ser válido

---

### 4. Componentes UI ✅

#### Nuevo: `LightningInvoiceModal`
**Archivo:** `components/lightning-invoice-modal.tsx`

Modal para que vendedor/comprador generen invoices Lightning.

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: string) => void;
  title: string;
  description: string;
  amount: number;
  isRefund?: boolean;
}
```

**Características:**
- 📱 Instrucciones claras para generar invoice
- ✅ Validación de formato Lightning (lnbc)
- 📋 Botón para pegar desde clipboard
- 🔒 Nota de seguridad sobre el monto
- 🎨 UI diferenciada para release vs refund

---

#### Actualizado: `ProductDetail`
**Archivo:** `components/product-detail.tsx`

**Cambios:**
- Integrado `LightningInvoiceModal` para release y refund
- Actualizado `handleReleasePayment()` para enviar invoice del vendedor
- Actualizado `handleCancelTransaction()` para enviar invoice del comprador
- Estados de modal: `showReleaseModal`, `showRefundModal`

**Flujo:**
1. Comprador confirma entrega → Abre `LightningInvoiceModal` (release)
2. Vendedor cancela → Abre `LightningInvoiceModal` (refund)
3. Usuario genera invoice en su wallet
4. Pega invoice en el modal
5. Sistema envía pago Lightning
6. Estado actualiza a `"released"` o `"refunded"`

---

#### Actualizado: `EscrowStatusBadge`
**Archivo:** `components/escrow-status-badge.tsx`

**Cambios:**
- Estado `"paid"` ahora muestra: **"💰 Fondos retenidos en escrow"**
- Color naranja para enfatizar que los fondos están bloqueados
- Icono de candado 🔒

---

### 5. Types ✅
**Archivo:** `types/index.ts`

**Cambios:**
```typescript
export interface Order {
  // ...existing fields
  seller_pubkey?: string | null;
  escrow_held?: boolean | null;
}

export interface CreateOrderRequest {
  product_id: string;
  buyer_pubkey: string;
  seller_pubkey?: string;  // Nuevo
}
```

---

## 🚀 Cómo Usar el Escrow Real

### Paso 1: Configurar LNbits
```bash
LNBITS_URL=https://legend.lnbits.com
LNBITS_API_KEY=tu_admin_key_aqui
```

**Importante:** Esta wallet será la que retenga los fondos en escrow.

---

### Paso 2: Comprador Crea Orden
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "prod_123",
    "buyer_pubkey": "npub..."
  }'
```

**Respuesta:**
```json
{
  "ok": true,
  "order_id": "order_abc",
  "payment_request": "lnbc50000n...",  // ← Este invoice va a la WALLET DEL SISTEMA
  "status": "pending",
  "total_sats": 50000
}
```

---

### Paso 3: Comprador Paga Invoice
- Copia el `payment_request`
- Paga desde cualquier wallet Lightning
- **Los fondos llegan a la wallet del sistema** (en escrow)
- Estado cambia a `"paid"` con `escrow_held: true`

---

### Paso 4: Negociación vía Chat
- Comprador y vendedor se comunican
- Vendedor envía el producto
- Comprador confirma recepción

---

### Paso 5a: Liberar Fondos (Entrega Exitosa)

**En el UI:**
1. Comprador hace click en "Confirmar entrega"
2. Se abre modal pidiendo invoice del vendedor
3. **Vendedor genera invoice en su wallet** por 50,000 sats
4. Vendedor copia y pega el invoice en el modal
5. Sistema envía pago Lightning al vendedor
6. Estado cambia a `"released"`

**API:**
```bash
curl -X POST http://localhost:3000/api/orders/order_abc/release \
  -H "Content-Type: application/json" \
  -d '{
    "seller_payment_request": "lnbc50000n..."
  }'
```

---

### Paso 5b: Reembolsar (Problema con Entrega)

**En el UI:**
1. Vendedor hace click en "Cancelar transacción"
2. Se abre modal pidiendo invoice del comprador
3. **Comprador genera invoice en su wallet** por 50,000 sats
4. Comprador copia y pega el invoice en el modal
5. Sistema envía pago Lightning al comprador
6. Estado cambia a `"refunded"`

**API:**
```bash
curl -X POST http://localhost:3000/api/orders/order_abc/refund \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_payment_request": "lnbc50000n..."
  }'
```

---

## 🔍 Verificar que Funciona

### 1. Ver orden en la DB
```bash
curl http://localhost:3000/api/orders/order_abc
```

**Cuando está en escrow:**
```json
{
  "id": "order_abc",
  "status": "paid",
  "escrow_held": true,  // ← Fondos retenidos
  "total_sats": 50000,
  "payment_hash": "abc123..."
}
```

**Después de liberar:**
```json
{
  "id": "order_abc",
  "status": "released",
  "escrow_held": false,  // ← Fondos liberados
  "total_sats": 50000
}
```

---

### 2. Ver transacciones en LNbits
1. Ir a LNbits → Transactions
2. Verás 2 transacciones:
   - **Incoming:** Del comprador → Wallet del sistema (escrow)
   - **Outgoing:** Wallet del sistema → Vendedor (release)

---

## ⚠️ Consideraciones Importantes

### 1. Liquidez de la Wallet
La wallet del sistema (LNbits) debe tener:
- **Canales abiertos** con buena liquidez
- **Capacidad de recibir** igual o mayor a los pagos esperados

### 2. Fees Lightning
- **Recibir pago:** 0 sats (gratis)
- **Enviar pago (release/refund):** ~1-5 sats
- Los fees se descuentan de la wallet del sistema

### 3. Security
- La wallet del sistema es **custodiadora** de los fondos
- Solo el backend puede liberar fondos (no hay acceso directo de usuarios)
- Los invoices se validan antes de enviar pago

### 4. Demo Mode
Si LNbits no está configurado:
- El sistema genera invoices mock
- Los pagos se simulan
- Útil para desarrollo sin Lightning real

---

## 📊 Estados del Escrow

| Estado | Descripción | `escrow_held` | Wallet Sistema |
|--------|-------------|---------------|----------------|
| `pending` | Esperando pago | `null` | Sin fondos |
| `paid` | **Fondos en escrow** | `true` | **Tiene fondos** |
| `released` | Pago enviado al vendedor | `false` | Fondos enviados |
| `refunded` | Pago devuelto al comprador | `false` | Fondos enviados |

---

## 🎬 Demo para el Hackathon

### Script:
1. **Mostrar:** Comprador crea orden y paga
2. **Enfatizar:** "Los fondos llegan a la wallet del sistema, NO al vendedor"
3. **Mostrar:** Chat entre comprador y vendedor
4. **Mostrar:** Vendedor genera invoice en su wallet (Phoenix/WoS)
5. **Ejecutar:** Release escrow
6. **Mostrar:** Pago Lightning instantáneo al vendedor ⚡
7. **Mensaje:** "Este es un ESCROW REAL. Los fondos estuvieron físicamente retenidos."

---

## 🎯 Ventajas del Sistema

✅ **Escrow Real** - Los fondos se retienen físicamente  
✅ **Lightning Native** - Pagos instantáneos  
✅ **Sin Intermediarios** - Solo LNbits (auto-hospedable)  
✅ **Transparente** - Ambas partes ven el estado  
✅ **Flexible** - Funciona con cualquier wallet Lightning  
✅ **Económico** - Fees mínimos (~1-5 sats)  

---

## 📚 Documentación Adicional

- Ver `ESCROW_REAL.md` para detalles técnicos completos
- Ver `FLUJO_COMPLETO.md` para el flujo general de la app
- Ver `docs/api.md` para referencia completa de LNbits API

---

## 🐛 Troubleshooting

### Error: "Failed to send payment to seller"
**Causa:** Wallet del sistema no tiene liquidez o invoice inválido  
**Solución:** 
- Verificar balance en LNbits
- Verificar que el invoice sea válido (lnbc)
- Verificar que el monto del invoice coincida

### Error: "Order must be in 'paid' status"
**Causa:** El escrow ya fue liberado o no se pagó  
**Solución:**
- Verificar el estado actual de la orden
- Solo se puede liberar/refundar si `status === "paid"`

### Invoice no válido
**Causa:** El invoice no comienza con "lnbc"  
**Solución:**
- Generar nuevo invoice en la wallet
- Copiar el invoice completo (sin espacios)

---

## 🚀 Próximos Pasos (Post-Hackathon)

1. **Hodl Invoices** - Implementar para ser trustless
2. **Timeouts** - Auto-refund después de X días
3. **Multi-firma** - Ambas partes confirman release
4. **Webhooks** - Notificaciones automáticas de pagos
5. **Auditoría** - Dashboard de todas las transacciones

---

**© 2025 TurboZaps - Real Lightning Escrow**

