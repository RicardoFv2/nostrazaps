# 🔄 Flujo Completo TurboZaps - Lightning Escrow

## Resumen del flujo MVP

```
[Comerciante] → Crea productos en NostrMarket
     ↓
[Comprador] → Ve productos y crea orden
     ↓
[Sistema] → Genera invoice Lightning con escrow
     ↓
[Comprador] → Paga invoice (fondos en escrow)
     ↓
[Chat P2P] → Negociación vía NostrMarket API
     ↓
[Comprador] → Confirma recepción → Libera fondos al vendedor
```

---

## 📋 Paso 1: Comerciante crea cuenta y productos

### 1.1 Registro de Comerciante
- **Ruta:** `/register/merchant`
- **API:** `POST /api/merchants`
- **LNbits:** `POST /nostrmarket/api/v1/merchant`
- **Resultado:** 
  - Merchant creado en NostrMarket
  - Stall (tienda) creado automáticamente
  - Sesión iniciada con `npub`

### 1.2 Crear productos
- **Ruta:** `/sell`
- **API:** `POST /api/products`
- **LNbits:** `POST /nostrmarket/api/v1/product`
- **Datos:**
  ```json
  {
    "stall_id": "...",
    "name": "Producto",
    "price": 50000,
    "categories": ["Ropa"],
    "images": ["url"],
    "config": {
      "description": "...",
      "currency": "sat"
    }
  }
  ```

### 1.3 Ver productos del merchant
- **Ruta:** `/sell`
- **API:** `GET /api/products/stall/{stall_id}`
- **LNbits:** `GET /nostrmarket/api/v1/stall/product/{stall_id}`
- **Resultado:** Lista de productos del merchant

---

## 📋 Paso 2: Comprador crea cuenta y ve productos

### 2.1 Registro de Comprador
- **Ruta:** `/register/buyer`
- **API:** `POST /api/customers`
- **LNbits:** `POST /nostrmarket/api/v1/customer`
- **Resultado:** 
  - Customer creado en NostrMarket
  - Sesión iniciada con `buyer_pubkey`

### 2.2 Ver marketplace
- **Ruta:** `/marketplace`
- **API:** `GET /api/products`
- **Resultado:** Todos los productos disponibles

---

## 📋 Paso 3: Comprador crea orden (compra producto)

### 3.1 Ver detalle de producto
- **Ruta:** `/product/{id}`
- **Componente:** `ProductDetail`
- **Estado inicial:** `pending`

### 3.2 Comprador hace click en "Comprar"
- **API:** `POST /api/orders`
- **LNbits:** `POST /api/v1/payments` (crear invoice Lightning directo)
- **Datos:**
  ```json
  {
    "product_id": "...",
    "buyer_pubkey": "npub..."
  }
  ```
- **Sistema genera invoice:**
  ```javascript
  // Usa LNbits API directo (NO NostrMarket)
  createLightningInvoice({
    amount: product.price_sats,
    memo: "TurboZaps - Product - Order abc123",
    order_id: "..."
  })
  ```
- **Respuesta:**
  ```json
  {
    "order_id": "...",
    "payment_request": "lnbc...",  // Invoice Lightning
    "payment_hash": "...",
    "status": "pending",
    "total_sats": 50000
  }
  ```

> **Nota:** Las órdenes se crean **localmente** en TurboZaps, no en NostrMarket. NostrMarket no tiene endpoint POST /order (las órdenes allí se crean vía eventos Nostr).

### 3.3 Sistema muestra Invoice Lightning
- **Componente:** `LightningPaymentModal`
- **Muestra:**
  - QR Code del invoice Lightning
  - Monto en sats
  - Código del invoice para copiar
  - Mensaje: "Tu dinero está asegurado en escrow"

---

## 📋 Paso 4: Comprador paga invoice

### 4.1 Comprador escanea QR o copia invoice
- Usa su billetera Lightning (Phoenix, Wallet of Satoshi, etc.)
- Paga el invoice

### 4.2 Sistema detecta pago
- **API:** `PATCH /api/orders/{id}`
- **LNbits:** `PATCH /nostrmarket/api/v1/order/{id}`
- **Datos:**
  ```json
  {
    "paid": true
  }
  ```
- **Estado:** `pending` → `paid` (en escrow)

### 4.3 UI se actualiza
- **Componente:** `ProductDetail`
- **Nuevo estado:** `paid`
- **Muestra:** `EscrowChat`

---

## 📋 Paso 5: Chat P2P (Negociación)

### 5.1 Comprador y vendedor se comunican
- **Componente:** `EscrowChat`
- **API:** 
  - Enviar: `POST /api/chat`
  - Recibir: `GET /api/chat?order_id={id}`
- **LNbits:**
  - Enviar: `POST /nostrmarket/api/v1/message`
  - Recibir: `GET /nostrmarket/api/v1/message/{public_key}`

### 5.2 Ejemplo de mensajes
```
Vendedor: "Hola, confirma tu dirección de entrega"
Comprador: "Calle Principal #123"
Vendedor: "Perfecto, tu pedido sale hoy"
Vendedor: "Pedido enviado, tracking: 123456"
Comprador: "Recibido, gracias!"
```

### 5.3 Estado del escrow
- **Badge:** 🟡 Pago en escrow (asegurado)
- **Mensaje:** "Tu dinero está seguro hasta que confirmes la entrega"

---

## 📋 Paso 6: Comprador confirma recepción

### 6.1 Comprador hace click en "Confirmar entrega"
- **Botón:** "Confirmar entrega" (verde, con check)
- **Dialog:** "¿Confirmas que recibiste el producto?"
- **Acción:** Liberar fondos al vendedor

### 6.2 Sistema libera fondos
- **API:** `POST /api/orders/{id}/release`
- **LNbits:** `PATCH /nostrmarket/api/v1/order/{id}`
- **Datos:**
  ```json
  {
    "paid": true,
    "shipped": true,
    "message": "Escrow released to seller"
  }
  ```

### 6.3 Estado final
- **Estado:** `paid` → `released`
- **Resultado:**
  - Fondos transferidos al vendedor
  - Transacción completada
  - UI muestra: ✅ "Pago liberado al vendedor"

---

## 📋 Paso 7 (Alternativo): Cancelar transacción

### 7.1 Si hay problema
- **Vendedor puede:** "Cancelar transacción" (devolver fondos)
- **API:** `POST /api/orders/{id}/refund`
- **LNbits:** `PUT /nostrmarket/api/v1/order/reissue`

### 7.2 Estado final
- **Estado:** `paid` → `cancelled`
- **Resultado:**
  - Fondos devueltos al comprador
  - UI muestra: ❌ "Transacción cancelada"

---

## 🔗 Endpoints Implementados

### Merchants
- ✅ `POST /api/merchants` - Crear merchant
- ✅ `GET /api/merchants` - Obtener merchant

### Stalls
- ✅ `POST /api/stalls` - Crear stall
- ✅ `GET /api/stalls` - Obtener stalls

### Products
- ✅ `POST /api/products` - Crear producto (→ NostrMarket)
- ✅ `GET /api/products` - Listar productos (→ DB local)
- ✅ `GET /api/products/stall/{id}` - Productos por stall (→ NostrMarket)

### Orders
- ✅ `POST /api/orders` - Crear orden con invoice
- ✅ `GET /api/orders` - Listar órdenes
- ✅ `GET /api/orders/{id}` - Obtener orden
- ✅ `PATCH /api/orders/{id}` - Actualizar estado
- ✅ `POST /api/orders/{id}/release` - Liberar escrow
- ✅ `POST /api/orders/{id}/refund` - Devolver fondos

### Chat
- ✅ `POST /api/chat` - Enviar mensaje (→ NostrMarket)
- ✅ `GET /api/chat?order_id={id}` - Obtener mensajes

### Customers
- ✅ `POST /api/customers` - Crear customer
- ✅ `GET /api/customers` - Listar customers

---

## 📱 Componentes Frontend

### Páginas
- ✅ `/register/merchant` - Registro de comerciante
- ✅ `/register/buyer` - Registro de comprador
- ✅ `/sell` - Productos del merchant (con NostrMarket)
- ✅ `/marketplace` - Ver todos los productos
- ✅ `/product/{id}` - Detalle y compra de producto
- ✅ `/dashboard/buyer` - Compras y escrows del comprador
- ✅ `/dashboard/seller` - Ventas y escrows del vendedor

### Componentes
- ✅ `ProductForm` - Crear productos
- ✅ `ProductDetail` - Detalle y compra (con estados)
- ✅ `LightningPaymentModal` - Modal de pago Lightning
- ✅ `EscrowChat` - Chat P2P con API NostrMarket
- ✅ `EscrowsTable` - Tabla de transacciones
- ✅ `EscrowStatusBadge` - Badge de estado

---

## 🔐 Estados de Orden

```
pending          → Orden creada, esperando pago
     ↓ (pago)
paid (escrow)    → Fondos en escrow, negociación en curso
     ↓ (confirmación)
released         → Fondos liberados al vendedor ✅
     ↓ (o cancelación)
cancelled        → Fondos devueltos al comprador ❌
```

---

## 🎯 Variables de Entorno

```env
LNBITS_URL=https://tu-instancia.lnbits.com
LNBITS_API_KEY=tu_admin_key_aqui
DATABASE_URL=./turbozaps.db
```

---

## 🚀 Para Probar el Flujo Completo

1. **Crear Merchant:**
   ```
   http://localhost:3000/register/merchant
   ```

2. **Crear Productos:**
   ```
   http://localhost:3000/sell
   ```

3. **Crear Buyer:**
   ```
   http://localhost:3000/register/buyer
   ```

4. **Ver y Comprar:**
   ```
   http://localhost:3000/marketplace
   ```

5. **Ver Dashboards:**
   ```
   http://localhost:3000/dashboard/buyer
   http://localhost:3000/dashboard/seller
   ```

---

## ⚡ Características del Escrow

1. **Seguridad:** Fondos retenidos hasta confirmación
2. **P2P:** Comunicación directa via Nostr
3. **Transparencia:** Estados claros en todo momento
4. **Lightning:** Pagos instantáneos
5. **NostrMarket:** Integración completa con LNbits

---

## 🎉 MVP Completo

- ✅ Registro de merchants y buyers
- ✅ Creación de productos en NostrMarket
- ✅ Marketplace público
- ✅ Sistema de órdenes con Lightning
- ✅ Escrow automático
- ✅ Chat P2P vía Nostr
- ✅ Liberación/devolución de fondos
- ✅ Dashboards para ambos roles

**Estado:** 🚀 Listo para demo del hackathón

