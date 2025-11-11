# 🚀 LNbits NostrMarket API Reference

> Documentación completa de los endpoints de LNbits NostrMarket para TurboZaps

## 📋 Base URL

```
https://your-lnbits-instance.com/upgrades/b03490f98fa15d9bb5f4bd298c70b18542f6755d9e76f568752fc0a2fbe3683b/nostrmarket/api/v1/
```

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante header:
```
X-API-Key: your-admin-or-invoice-key
```

---

## 🏪 Merchants (Comerciantes)

### Crear Merchant
```http
POST /merchant
```

**Request Body:**
```json
{
  "private_key": "your_private_key",
  "public_key": "your_public_key",
  "config": {
    "name": "TurboZaps Store",
    "about": "Lightning marketplace",
    "active": true
  }
}
```

### Obtener Merchant
```http
GET /merchant
```

### Eliminar Merchant
```http
DELETE /merchant/{merchant_id}
```

### Actualizar Merchant en Nostr
```http
PUT /merchant/{merchant_id}/nostr
```

### Eliminar Merchant de Nostr
```http
DELETE /merchant/{merchant_id}/nostr
```

### Toggle Merchant Activo/Inactivo
```http
PUT /merchant/{merchant_id}/toggle
```

---

## 🏪 Stalls (Puestos)

### Crear Stall
```http
POST /stall
```

**Request Body:**
```json
{
  "wallet": "wallet_id",
  "name": "My Products",
  "currency": "sat",
  "shipping_zones": [
    {
      "id": "zone1",
      "name": "El Salvador",
      "currency": "USD",
      "cost": 5.0
    }
  ]
}
```

### Obtener Stalls
```http
GET /stall
```

**Query Parameters:**
- `pending`: boolean - Filtrar por stalls pendientes

### Obtener Stall por ID
```http
GET /stall/{stall_id}
```

### Actualizar Stall
```http
PUT /stall/{stall_id}
```

### Eliminar Stall
```http
DELETE /stall/{stall_id}
```

### Obtener Productos por Stall
```http
GET /stall/product/{stall_id}
```

**Query Parameters:**
- `pending`: boolean - Filtrar por productos pendientes

### Obtener Órdenes por Stall
```http
GET /stall/order/{stall_id}
```

**Query Parameters:**
- `paid`: boolean - Filtrar por órdenes pagadas
- `shipped`: boolean - Filtrar por órdenes enviadas
- `pubkey`: string - Filtrar por public key del comprador

---

## 📦 Products (Productos)

### Crear Producto
```http
POST /product
```

**Request Body:**
```json
{
  "stall_id": "stall_id",
  "name": "iPhone 15",
  "categories": ["electronics", "phones"],
  "price": 50000,
  "quantity": 1,
  "images": ["https://example.com/image.jpg"],
  "config": {
    "description": "Latest iPhone model",
    "currency": "sat"
  }
}
```

### Obtener Producto por ID
```http
GET /product/{product_id}
```

### Actualizar Producto
```http
PATCH /product/{product_id}
```

### Eliminar Producto
```http
DELETE /product/{product_id}
```

---

## 🛒 Orders (Órdenes)

### Obtener Órdenes
```http
GET /order
```

**Query Parameters:**
- `paid`: boolean - Filtrar por órdenes pagadas
- `shipped`: boolean - Filtrar por órdenes enviadas
- `pubkey`: string - Filtrar por public key del comprador

### Obtener Orden por ID
```http
GET /order/{order_id}
```

### Actualizar Estado de Orden
```http
PATCH /order/{order_id}
```

**Request Body:**
```json
{
  "paid": true,
  "shipped": true,
  "message": "Order shipped successfully"
}
```

### Re-emitir Invoice de Orden
```http
PUT /order/reissue
```

**Request Body:**
```json
{
  "id": "order_id",
  "shipping_id": "new_shipping_id"
}
```

### Restaurar Orden por Event ID
```http
PUT /order/restore/{event_id}
```

### Restaurar Órdenes
```http
PUT /orders/restore
```

---

## 💬 Messages (Mensajes)

### Obtener Mensajes
```http
GET /message/{public_key}
```

### Enviar Mensaje
```http
POST /message
```

**Request Body:**
```json
{
  "message": "Hello, when will my order be shipped?",
  "public_key": "recipient_public_key"
}
```

---

## 🌍 Zones (Zonas de Envío)

### Obtener Zonas
```http
GET /zone
```

### Crear Zona
```http
POST /zone
```

**Request Body:**
```json
{
  "name": "El Salvador",
  "currency": "USD",
  "cost": 5.0,
  "countries": ["SV"]
}
```

### Eliminar Zona
```http
DELETE /zone/{zone_id}
```

### Actualizar Zona
```http
PATCH /zone/{zone_id}
```

---

## 👥 Customers (Clientes)

### Obtener Clientes
```http
GET /customer
```

### Crear Cliente
```http
POST /customer
```

**Request Body:**
```json
{
  "merchant_id": "merchant_id",
  "public_key": "customer_public_key",
  "profile": {
    "name": "John Doe",
    "about": "Bitcoin enthusiast"
  }
}
```

---

## 📊 Monedas Soportadas

```http
GET /currencies
```

**Respuesta:**
```json
["sat", "btc", "USD", "EUR", "CAD", "GBP"]
```

---

## 🔧 Configuración

### Reiniciar Cliente Nostr
```http
PUT /restart
```

---

## ⚠️ Notas Importantes

1. **Todas las llamadas requieren autenticación** con `X-API-Key`
2. **Los precios están en sats** por defecto (1 sat = 0.00000001 BTC)
3. **Las imágenes de productos** deben ser URLs válidas
4. **Los mensajes se envían vía Nostr** para comunicación P2P
5. **Las órdenes incluyen escrow** - los fondos se mantienen retenidos hasta confirmación
6. **Los merchants deben tener claves Nostr** válidas para publicar en la red

---

## 🧪 Ejemplo de Flujo Completo

1. **Crear Merchant** → `POST /merchant`
2. **Crear Stall** → `POST /stall`
3. **Crear Productos** → `POST /product`
4. **Cliente ve productos** → `GET /stall/product/{stall_id}`
5. **Cliente crea orden** → *Nota: Las órdenes se crean automáticamente por el sistema*
6. **LNbits genera invoice con escrow** → Sistema interno
7. **Cliente paga invoice** → Lightning Network
8. **Merchant confirma pago y envía producto** → `PATCH /order/{order_id}`
9. **Cliente confirma recepción y libera fondos** → Sistema interno

---

## 📚 Recursos Adicionales

- [LNbits Documentation](https://demo.lnbits.com/docs#/)
- [Nostr Protocol](https://nostr.com/)
- [Lightning Network](https://lightning.network/)
