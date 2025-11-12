# ⚡ TurboZaps - Escrow Real Lightning Network

## 🎯 Problema Solucionado

**Antes:** Los pagos Lightning eran instantáneos y finales. El "escrow" solo existía como estado en la base de datos.  
**Ahora:** Los fondos se retienen físicamente en la wallet del sistema y solo se envían al vendedor cuando ambas partes confirman.

---

## 🔐 ¿Cómo funciona el Escrow Custodiado?

### Flujo Completo:

```
1. Comprador crea orden
   ↓
2. Sistema genera invoice Lightning → WALLET DEL SISTEMA
   ↓
3. Comprador paga invoice
   ↓
4. Fondos llegan a WALLET DEL SISTEMA (retenidos)
   ↓
5. Estado: "paid" (en escrow)
   ↓
6. Negociación vía chat P2P
   ↓
7a. ✅ Entrega confirmada:
    - Vendedor genera invoice Lightning
    - Sistema envía pago al vendedor
    - Estado: "released"
    
7b. ❌ Problema con la entrega:
    - Comprador genera invoice Lightning
    - Sistema devuelve pago al comprador
    - Estado: "refunded"
```

---

## 💰 Wallet del Sistema (Escrow Wallet)

La **wallet de LNbits** configurada en `LNBITS_API_KEY` actúa como:

- **Custodia temporal** de los fondos
- **Intermediario confiable** entre comprador y vendedor
- **Garantía de pago** para ambas partes

### Características:

✅ **Fondos reales retenidos** - No solo un estado en DB  
✅ **Control total** del flujo de liberación  
✅ **Transparente** - Ambas partes ven el estado  
✅ **Seguro** - Solo el sistema puede liberar fondos  

---

## 🔄 Endpoints Actualizados

### 1. Crear Orden
```http
POST /api/orders
```

**Request:**
```json
{
  "product_id": "prod_123",
  "buyer_pubkey": "npub...",
  "seller_pubkey": "npub..." // Opcional, para tracking
}
```

**Response:**
```json
{
  "ok": true,
  "order_id": "order_abc",
  "payment_request": "lnbc...",
  "status": "pending",
  "total_sats": 50000,
  "message": "Order created. Payment request generated."
}
```

**Nota:** El invoice apunta a la **wallet del sistema**, NO del vendedor.

---

### 2. Liberar Fondos (Release Escrow)
```http
POST /api/orders/{order_id}/release
```

**Request:**
```json
{
  "seller_payment_request": "lnbc50000n...",
  "message": "Producto entregado y confirmado"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "✅ Escrow released! Payment sent to seller.",
  "order_id": "order_abc",
  "status": "released",
  "escrow_held": false,
  "payment_hash": "a1b2c3...",
  "amount_sent": 50000
}
```

**Proceso:**
1. Valida que el estado sea `"paid"`
2. Valida que `escrow_held = true`
3. **Envía pago Lightning al invoice del vendedor**
4. Actualiza estado a `"released"`
5. Marca `escrow_held = false`

---

### 3. Devolver Fondos (Refund)
```http
POST /api/orders/{order_id}/refund
```

**Request:**
```json
{
  "buyer_payment_request": "lnbc50000n...",
  "message": "Producto no entregado, devolver fondos"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "✅ Order refunded! Payment sent back to buyer.",
  "order_id": "order_abc",
  "status": "refunded",
  "escrow_held": false,
  "payment_hash": "d4e5f6...",
  "amount_refunded": 50000
}
```

**Proceso:**
1. Valida que el estado sea `"paid"`
2. Valida que `escrow_held = true`
3. **Envía pago Lightning al invoice del comprador**
4. Actualiza estado a `"refunded"`
5. Marca `escrow_held = false`

---

## 🎨 Integración Frontend

### ProductDetail Component

```typescript
// Cuando comprador confirma entrega
const handleConfirmDelivery = async () => {
  // 1. Mostrar modal para que vendedor genere invoice
  const sellerInvoice = await promptSellerInvoice();
  
  // 2. Llamar al endpoint de release
  const response = await fetch(`/api/orders/${orderId}/release`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seller_payment_request: sellerInvoice,
      message: 'Buyer confirmed delivery',
    }),
  });
  
  const data = await response.json();
  
  if (data.ok) {
    toast.success('✅ Payment sent to seller!');
    setOrderStatus('released');
  }
};
```

### Refund Flow

```typescript
// Cuando vendedor acepta devolver fondos
const handleRefund = async () => {
  // 1. Mostrar modal para que comprador genere invoice
  const buyerInvoice = await promptBuyerInvoice();
  
  // 2. Llamar al endpoint de refund
  const response = await fetch(`/api/orders/${orderId}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buyer_payment_request: buyerInvoice,
      message: 'Seller agreed to refund',
    }),
  });
  
  const data = await response.json();
  
  if (data.ok) {
    toast.success('✅ Refund sent to buyer!');
    setOrderStatus('refunded');
  }
};
```

---

## 📊 Estados del Escrow

| Estado | Descripción | `escrow_held` | Acción Disponible |
|--------|-------------|---------------|-------------------|
| `pending` | Esperando pago | `null` | Pagar invoice |
| `paid` | Fondos en escrow | `true` | Release o Refund |
| `released` | Pago enviado al vendedor | `false` | Ninguna |
| `refunded` | Pago devuelto al comprador | `false` | Ninguna |
| `cancelled` | Orden cancelada antes de pago | `null` | Ninguna |

---

## 🔒 Seguridad y Validaciones

### En Release:
- ✅ Validar que `status === 'paid'`
- ✅ Validar que `escrow_held === true`
- ✅ Validar que `total_sats > 0`
- ✅ Validar que el invoice del vendedor sea válido
- ✅ Verificar que la wallet del sistema tenga fondos suficientes

### En Refund:
- ✅ Validar que `status === 'paid'`
- ✅ Validar que `escrow_held === true`
- ✅ Validar que `total_sats > 0`
- ✅ Validar que el invoice del comprador sea válido
- ✅ Verificar que la wallet del sistema tenga fondos suficientes

---

## ⚠️ Consideraciones Importantes

### 1. Liquidez de la Wallet del Sistema
La wallet de LNbits debe tener:
- **Fondos suficientes** para recibir pagos entrantes (capacidad de recepción)
- **Canales Lightning abiertos** con buena liquidez

### 2. Fees Lightning
Los pagos Lightning tienen fees mínimos:
- **Recibir pago (invoice):** ~0 sats (gratis generalmente)
- **Enviar pago (release/refund):** ~1-5 sats (muy bajo)

### 3. Timeouts
- Los invoices Lightning expiran típicamente en 24 horas
- Las órdenes `pending` sin pago deberían limpiarse automáticamente

### 4. Auditoría
Todos los pagos quedan registrados en:
- **Base de datos local:** `orders.payment_hash`
- **LNbits:** Historial de transacciones
- **Lightning Network:** Hash público del pago

---

## 🧪 Testing del Escrow Real

### 1. Setup
```bash
# Configurar LNbits URL y API Key
LNBITS_URL=https://legend.lnbits.com
LNBITS_API_KEY=tu_admin_key_aqui
```

### 2. Crear Orden
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "prod_123",
    "buyer_pubkey": "npub..."
  }'
```

### 3. Pagar Invoice
- Copiar `payment_request` de la respuesta
- Pagar con wallet Lightning (Phoenix, Wallet of Satoshi, etc.)
- Los fondos llegan a la **wallet del sistema**

### 4. Verificar Estado
```bash
curl http://localhost:3000/api/orders/order_abc
```

### 5. Generar Invoice del Vendedor
```bash
# En tu wallet Lightning (como vendedor)
# Generar invoice por el monto de la orden
lncli addinvoice --amt 50000 --memo "TurboZaps payout"
```

### 6. Liberar Escrow
```bash
curl -X POST http://localhost:3000/api/orders/order_abc/release \
  -H "Content-Type: application/json" \
  -d '{
    "seller_payment_request": "lnbc50000n..."
  }'
```

### 7. Verificar Pago
- El vendedor debe recibir el pago instantáneamente
- Verificar en la wallet del vendedor
- Estado en DB debe ser `"released"`

---

## 🎉 Ventajas vs Hodl Invoices

| Característica | Hodl Invoices | Escrow Custodiado |
|----------------|---------------|-------------------|
| Complejidad | Alta ⚠️ | Baja ✅ |
| Compatibilidad | Limitada ⚠️ | Total ✅ |
| Setup LNbits | Extension específica ⚠️ | Wallet estándar ✅ |
| Trustless | Sí ✅ | No ⚠️ (el sistema es custodio) |
| Confiabilidad | Media ⚠️ | Alta ✅ |
| Para Hackathon | Difícil de demostrar ⚠️ | Perfecto ✅ |

---

## 📝 Próximos Pasos

### MVP (Hackathon):
- ✅ Escrow custodiado funcionando
- ⏳ UI para generar invoices de vendedor/comprador
- ⏳ Chat para negociar liberación de fondos
- ⏳ Dashboards mostrando escrow status

### Producción:
- ⏳ Implementar Hodl Invoices para ser trustless
- ⏳ Auditoría automática de pagos
- ⏳ Timeouts automáticos para órdenes abandonadas
- ⏳ Multi-firma entre comprador/vendedor

---

## 🚀 Demo Script

1. **Mostrar:** "Comprador crea orden y paga invoice"
2. **Mostrar:** "Fondos llegan a wallet del sistema (en escrow)"
3. **Mostrar:** "Chat P2P para negociar entrega"
4. **Mostrar:** "Vendedor genera invoice"
5. **Mostrar:** "Sistema libera fondos al vendedor"
6. **Resultado:** "Pago Lightning instantáneo al vendedor ⚡"

**Mensaje clave:** 
> "Los fondos están REALMENTE retenidos. No es solo un estado en base de datos. Es un escrow REAL en Lightning Network."

---

**© 2025 TurboZaps - Real Lightning Escrow**

