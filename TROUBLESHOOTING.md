# 🔧 TurboZaps - Troubleshooting Guide

## 🐛 Problemas Comunes y Soluciones

### Error: "Cannot create merchant" (500)

**Síntoma:**
```
LNbits API Error (500): {"detail":"Cannot create merchant"}
```

**Causa:**
Las claves Nostr no están en el formato correcto. LNbits NostrMarket espera claves en formato **hexadecimal** (64 caracteres), no en formato bech32 (`nsec`/`npub`).

**Solución:**
✅ Las claves ahora se generan automáticamente en formato hexadecimal correcto.

**Verificación:**
```javascript
// Correcto ✅
private_key: "a1b2c3d4e5f6..." // 64 caracteres hex
public_key: "f6e5d4c3b2a1..."  // 64 caracteres hex

// Incorrecto ❌
private_key: "nsec1abc123..."  // formato bech32
public_key: "npub1xyz789..."   // formato bech32
```

---

### Error: "LNbits API endpoint not found" (404)

**Síntoma:**
```
LNbits API Error (404): endpoint /merchant not found
```

**Posibles causas:**
1. NostrMarket extension no está instalada en LNbits
2. URL de LNbits incorrecta
3. Extension ID incorrecto

**Solución:**

1. **Verificar que NostrMarket está instalado:**
   - Ir a tu instancia LNbits
   - Extensions → NostrMarket
   - Activar si no está activo

2. **Verificar variables de entorno:**
```env
# .env.local
LNBITS_URL=https://demo.lnbits.com
LNBITS_API_KEY=your_admin_key_here
```

3. **Verificar la URL completa en los logs:**
```bash
# Buscar en consola:
[LNbits API] POST https://demo.lnbits.com/nostrmarket/api/v1/merchant
```

---

### Error: "Authentication failed" (401)

**Síntoma:**
```
LNbits API Error (401): Authentication failed
```

**Causa:**
API Key incorrecta o sin permisos suficientes.

**Solución:**

1. **Obtener API Key correcta:**
   - Ir a LNbits → Wallet
   - Usar **Admin Key** (no Invoice Key)
   - Copiar y pegar en `.env.local`

2. **Verificar en código:**
```bash
# Ver qué key se está usando (en logs)
[LNbits API] Using key: abc123... (primeros 6 chars)
```

---

### Error: "Missing stall_id"

**Síntoma:**
No puedes crear productos, error en consola.

**Causa:**
Usuario no está registrado como merchant o no se creó el stall.

**Solución:**

1. **Verificar localStorage:**
```javascript
// Consola del navegador
localStorage.getItem('merchant_id')
localStorage.getItem('stall_id')
// Ambos deben tener valores
```

2. **Registrarse de nuevo:**
   - Ir a `/register/merchant`
   - Completar formulario
   - Sistema creará merchant + stall automáticamente

---

### Error: "Buyer not registered"

**Síntoma:**
No puedes comprar productos.

**Causa:**
No hay `buyer_pubkey` en localStorage.

**Solución:**

1. **Verificar:**
```javascript
localStorage.getItem('buyer_pubkey')
// Debe tener valor
```

2. **Registrarse como buyer:**
   - Ir a `/register/buyer`
   - Generar clave pública
   - Crear perfil

---

### Error: "Missing pubkey information" al enviar mensaje

**Síntoma:**
Al intentar enviar un mensaje en el chat, aparece el error "Missing pubkey information".

**Causa:**
Falta `buyerPubkey` o `sellerPubkey` en el componente de chat.

**Solución:**

1. **Verificar buyer pubkey:**
```javascript
// Consola del navegador
localStorage.getItem('buyer_pubkey')
// Debe tener 64 caracteres hex
```

2. **Verificar merchant/seller pubkey:**
```javascript
localStorage.getItem('merchant_public_key')
// Debe tener 64 caracteres hex
```

3. **Si falta buyer_pubkey:**
   - Ir a `/register/buyer`
   - Crear perfil de comprador

4. **Si falta merchant_public_key:**
   - El vendedor debe registrarse en `/register/merchant`
   - O el sistema usará un pubkey por defecto para demo

5. **Ver logs en consola:**
```bash
[EscrowChat] Missing pubkey information:
  buyerPubkey: MISSING
  sellerPubkey: present
```

---

### Chat no muestra mensajes

**Síntoma:**
El chat está vacío o no actualiza.

**Posibles causas:**
1. orderId incorrecto
2. Claves públicas incorrectas
3. Error en NostrMarket API

**Solución:**

1. **Verificar en DevTools Network:**
   - Ver request a `/api/chat`
   - Verificar que `order_id` es correcto

2. **Verificar logs:**
```bash
# Buscar en consola:
[LNbits API] GET /message/{pubkey}
```

3. **Verificar claves:**
```javascript
// Consola del navegador
localStorage.getItem('buyer_pubkey')
localStorage.getItem('merchant_public_key')
// Deben ser strings hex de 64 caracteres
```

---

### Error: "Method Not Allowed" (405) al crear orden

**Síntoma:**
```
LNbits API Error (405): {"detail":"Method Not Allowed"}
POST /nostrmarket/api/v1/order
```

**Causa:**
NostrMarket **no tiene un endpoint POST /order**. Las órdenes se crean a través de eventos Nostr, no mediante API directa.

**Solución:**
✅ Ya implementado: Ahora usamos `createLightningInvoice()` que genera invoices directamente desde la API de LNbits (`/api/v1/payments`), no desde NostrMarket.

**Cómo funciona ahora:**
1. Crear orden localmente en TurboZaps
2. Generar invoice Lightning usando LNbits API directo
3. Manejar escrow localmente
4. No usar NostrMarket para crear órdenes

---

### Lightning invoice no se genera

**Síntoma:**
Al comprar producto, no aparece QR ni invoice.

**Causa:**
Error al generar invoice en LNbits.

**Solución:**

1. **Ver logs del servidor:**
```bash
# Buscar en terminal:
[POST /api/orders] Generating Lightning invoice...
[createLightningInvoice] Error: ...
```

2. **Verificar API Key de LNbits:**
```bash
# Debe tener permisos de wallet para crear invoices
LNBITS_API_KEY=your_wallet_invoice_key
```

3. **Verificar que el producto existe:**
```bash
# GET /api/products
# Debe incluir el producto que intentas comprar
```

4. **Verificar que buyer está registrado:**
```javascript
localStorage.getItem('buyer_pubkey')
```

---

### Productos no aparecen en marketplace

**Síntoma:**
`/marketplace` está vacío.

**Causa:**
No hay productos creados o error en la API.

**Solución:**

1. **Crear productos:**
   - Registrarse como merchant
   - Ir a `/sell`
   - Click "Nuevo Producto"

2. **Verificar API:**
```bash
# Abrir DevTools Network
# Ir a /marketplace
# Ver request a /api/products
# Debe devolver array de productos
```

3. **Verificar base de datos:**
```sql
sqlite3 turbozaps.db
SELECT * FROM products;
```

---

## 🔍 Debugging Tips

### Ver todas las claves en localStorage

```javascript
// Consola del navegador
Object.keys(localStorage).forEach(key => {
  console.log(`${key}: ${localStorage.getItem(key)}`)
})
```

### Ver todas las requests a la API

```javascript
// Chrome DevTools
// Network tab
// Filter: "api"
// Ver todas las llamadas a /api/*
```

### Ver logs del servidor

```bash
# Terminal donde corre pnpm dev
# Buscar líneas con [LNbits API]
# Buscar líneas con [API /...]
```

### Limpiar todo y empezar de nuevo

```javascript
// Consola del navegador
localStorage.clear()
location.reload()
```

```bash
# Terminal
rm turbozaps.db
pnpm dev
```

---

## 🧪 Testing Manual

### Test 1: Crear Merchant

```bash
1. Ir a /register/merchant
2. Click "Generar claves" ← Debe generar 64 chars hex
3. Llenar nombre
4. Submit
5. Verificar:
   - Redirect a /sell
   - localStorage tiene merchant_id y stall_id
   - Logs muestran "Merchant created successfully"
```

### Test 2: Crear Producto

```bash
1. En /sell
2. Click "Nuevo Producto"
3. Llenar formulario
4. Submit
5. Verificar:
   - Producto aparece en la lista
   - Logs muestran "[LNbits API] POST /product"
```

### Test 3: Crear Buyer

```bash
1. Nueva ventana/perfil
2. Ir a /register/buyer
3. Click "Generar clave" ← 64 chars hex
4. Llenar nombre
5. Submit
6. Verificar:
   - Redirect a /marketplace
   - localStorage tiene buyer_pubkey
```

### Test 4: Comprar Producto

```bash
1. En /marketplace (como buyer)
2. Click en un producto
3. Click "Comprar con Lightning"
4. Verificar:
   - Aparece modal con QR
   - Hay payment_request
   - Monto correcto
5. Click "Ya pagué"
6. Verificar:
   - Estado cambia a "paid"
   - Aparece chat
```

---

## 📊 Logs Importantes

### Crear Merchant

```bash
[POST /api/merchants] Creating merchant...
[createMerchant] Creating merchant in LNbits
[createMerchant] Keys format - private_key length: 64 public_key length: 64
[createMerchant] Sending payload with config: { name: '...', about: '', active: true }
[LNbits API] POST https://demo.lnbits.com/nostrmarket/api/v1/merchant
[LNbits API] Base URL: https://demo.lnbits.com/nostrmarket/api/v1, Endpoint: /merchant
[createMerchant] Merchant created successfully
[POST /api/merchants] Merchant created successfully
```

### Crear Producto

```bash
[POST /api/products] Creating product...
[createLNbitsProduct] Creating product in LNbits
[LNbits API] POST https://demo.lnbits.com/nostrmarket/api/v1/product
[createLNbitsProduct] Product created successfully
```

### Crear Orden

```bash
[POST /api/orders] Creating order: { product_id: '...', buyer_pubkey: '...' }
[POST /api/orders] Generating Lightning invoice...
[createLightningInvoice] Generating Lightning invoice: { amount: 50000, memo: '...', order_id: '...' }
[createLightningInvoice] Invoice created successfully
[POST /api/orders] Lightning invoice generated successfully: { orderId: '...', hasPaymentRequest: true, totalSats: 50000, paymentHash: '...' }
[POST /api/orders] Order created successfully: order_123
```

---

## 🆘 Si Nada Funciona

1. **Verificar versión de Node:**
```bash
node --version
# Debe ser >= 18
```

2. **Reinstalar dependencias:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

3. **Verificar que LNbits funciona:**
```bash
curl -H "X-API-Key: your_key" \
  https://demo.lnbits.com/nostrmarket/api/v1/merchant
# Debe devolver 401 o un merchant, no 404
```

4. **Usar LNbits demo:**
```env
LNBITS_URL=https://demo.lnbits.com
LNBITS_API_KEY=demo_admin_key
```

---

## 📞 Soporte

Si el problema persiste:

1. **Abrir un issue en GitHub** con:
   - Descripción del error
   - Logs completos de consola y servidor
   - Pasos para reproducir
   - Variables de entorno (sin API keys)

2. **Información útil:**
   - Node version: `node --version`
   - OS: Windows/Mac/Linux
   - Browser: Chrome/Firefox/etc
   - LNbits version/instance

---

**Última actualización:** 12 de noviembre, 2025  
**Equipo:** TurboZaps ⚡

