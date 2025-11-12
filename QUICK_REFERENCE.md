# ⚡ TurboZaps - Quick Reference

## 🚀 Comandos Rápidos

```bash
# Desarrollo
pnpm dev                    # Iniciar en http://localhost:3000

# Base de datos
sqlite3 turbozaps.db        # Abrir DB
.tables                     # Ver tablas
.schema products            # Ver esquema

# Linter
pnpm lint                   # Revisar código

# Build
pnpm build                  # Compilar para producción
pnpm start                  # Iniciar producción
```

---

## 🔗 URLs Principales

```bash
# Landing & Auth
http://localhost:3000/                    # Landing page
http://localhost:3000/select-role         # Seleccionar rol

# Registration
http://localhost:3000/register/merchant   # Registro vendedor
http://localhost:3000/register/buyer      # Registro comprador

# Marketplace
http://localhost:3000/marketplace         # Ver productos
http://localhost:3000/product/[id]        # Detalle producto
http://localhost:3000/sell                # Productos del merchant

# Dashboards
http://localhost:3000/dashboard/buyer     # Dashboard comprador
http://localhost:3000/dashboard/seller    # Dashboard vendedor
```

---

## 📡 API Endpoints

### Merchants
```bash
POST   /api/merchants        # Crear merchant
GET    /api/merchants        # Obtener merchant
```

### Stalls
```bash
POST   /api/stalls           # Crear stall
GET    /api/stalls           # Obtener stalls
```

### Products
```bash
POST   /api/products         # Crear producto
GET    /api/products         # Listar productos
GET    /api/products/[id]    # Obtener producto
```

### Orders
```bash
POST   /api/orders           # Crear orden
GET    /api/orders           # Listar órdenes
GET    /api/orders/[id]      # Obtener orden
PATCH  /api/orders/[id]      # Actualizar orden
```

### Escrow
```bash
POST   /api/orders/[id]/release   # Liberar fondos
POST   /api/orders/[id]/refund    # Devolver fondos
```

### Chat
```bash
POST   /api/chat             # Enviar mensaje
GET    /api/chat?order_id=X  # Obtener mensajes
```

### Customers
```bash
POST   /api/customers        # Crear customer
GET    /api/customers        # Listar customers
```

---

## 🔑 LocalStorage Keys

```javascript
// Merchant/Seller
localStorage.getItem('merchant_id')       // ID del merchant
localStorage.getItem('merchant_npub')     // npub del merchant
localStorage.getItem('stall_id')          // ID del stall

// Buyer
localStorage.getItem('buyer_pubkey')      // npub del buyer

// Helpers
localStorage.setItem('merchant_id', 'xxx')
localStorage.removeItem('merchant_id')
localStorage.clear()                      // ⚠️ Borrar todo
```

---

## 🎨 Componentes Principales

```typescript
// Product Management
<ProductForm />                    // Crear productos
<ProductCard product={product} />  // Card de producto
<ProductDetail product={product} /> // Detalle + compra

// Payments
<LightningPaymentModal 
  invoice="lnbc..." 
  amount={50000} 
/>

// Escrow
<EscrowChat 
  orderId="xxx" 
  buyerPubkey="npub..." 
  sellerPubkey="npub..." 
/>
<EscrowsTable escrows={[...]} />
<EscrowStatusBadge status="paid" />

// Layout
<Navbar />
<Footer />
<DashboardLayout role="buyer">
  {children}
</DashboardLayout>
```

---

## 📦 Tipos TypeScript

```typescript
// Product
interface Product {
  id: string
  stall_id: string
  name: string
  price: number
  categories: string[]
  images: string[]
  config: {
    description: string
    currency: string
  }
}

// Order
interface Order {
  id: string
  product_id: string
  buyer_pubkey: string
  payment_request: string
  status: 'pending' | 'paid' | 'released' | 'cancelled'
  total_sats: number
}

// Message
interface Message {
  id: string
  order_id: string
  sender_pubkey: string
  recipient_pubkey: string
  message: string
  timestamp: string
}

// Escrow
interface Escrow {
  orderId: string
  buyerPubkey: string
  productName: string
  amount: number
  status: 'pending' | 'paid' | 'released' | 'cancelled'
  date: string
}
```

---

## 🔐 Variables de Entorno

```bash
# .env.local
LNBITS_URL=https://demo.lnbits.com
LNBITS_API_KEY=your_admin_key_here
DATABASE_URL=./turbozaps.db
```

```bash
# Verificar
echo $LNBITS_URL           # Bash/Zsh
echo %LNBITS_URL%          # Windows CMD
$env:LNBITS_URL            # Windows PowerShell
```

---

## 🛠️ Debugging

### Console logs
```javascript
// lib/lnbits.ts
console.log('[LNbits API] POST /merchant')
console.log('[LNbits API] Response:', data)

// Ver en navegador
// Chrome DevTools → Console (Ctrl+Shift+J)
```

### Network requests
```javascript
// Chrome DevTools → Network → Filter: API
// Ver requests a /api/*
// Ver requests a LNbits
```

### Database
```sql
-- Ver productos
SELECT * FROM products;

-- Ver órdenes
SELECT * FROM orders;

-- Ver mensajes
SELECT * FROM messages;

-- Limpiar todo
DELETE FROM products;
DELETE FROM orders;
DELETE FROM messages;
```

---

## 🐛 Errores Comunes

### "LNbits API endpoint not found"
```bash
# Verificar:
1. LNBITS_URL en .env.local
2. NostrMarket extension instalada
3. URL correcta: /nostrmarket/api/v1/merchant
```

### "Missing stall_id"
```bash
# Solución:
1. Registrarse como merchant
2. Verificar localStorage.getItem('stall_id')
3. Si falta, ir a /register/merchant
```

### "Buyer not registered"
```bash
# Solución:
1. Ir a /select-role
2. Click "Comprador"
3. Completar registro
```

### "Chat no muestra mensajes"
```bash
# Verificar:
1. orderId correcto
2. buyerPubkey y sellerPubkey válidos
3. Consola del navegador para errores
```

---

## ⚡ Atajos de Desarrollo

### Crear merchant rápido
```javascript
// Consola del navegador en /register/merchant
localStorage.setItem('merchant_id', 'test_merchant_123')
localStorage.setItem('stall_id', 'test_stall_456')
```

### Crear buyer rápido
```javascript
// Consola del navegador en /register/buyer
localStorage.setItem('buyer_pubkey', 'npub1test...')
```

### Limpiar sesión
```javascript
localStorage.clear()
location.reload()
```

---

## 📊 Estados de Orden

```javascript
// Estados válidos
'pending'   → 🟡 Esperando pago
'paid'      → 🟡 En escrow
'released'  → 🟢 Completado
'cancelled' → 🔴 Cancelado

// Transiciones
pending → paid → released
pending → paid → cancelled
```

---

## 🎬 Demo Checklist

```bash
✅ Servidor corriendo (pnpm dev)
✅ LNbits configurado
✅ 2 ventanas de navegador (buyer/seller)
✅ Productos de ejemplo preparados
✅ Script de demo a mano
✅ Zoom al 125%
✅ Tabs innecesarias cerradas
```

---

## 🔗 Links Útiles

```bash
# Documentación
./docs/api.md              # API Reference
./FLUJO_COMPLETO.md       # Flujo técnico
./README_FLUJO.md         # Guía de usuario
./DEMO_SCRIPT.md          # Script demo
./STATUS.md               # Estado del proyecto

# Externos
https://demo.lnbits.com   # LNbits demo
https://nostr.com         # Nostr protocol
https://lightning.network # Lightning Network
```

---

## 💡 Tips de Desarrollo

```bash
# Hot reload
# Next.js detecta cambios automáticamente
# Si no funciona: Ctrl+C y pnpm dev

# TypeScript errors
# Ignorar temporalmente: // @ts-ignore
# Mejor: Arreglar el tipo

# Import errors
# Verificar: tsconfig.json paths
# Usar: import { X } from '@/components/X'

# Tailwind no funciona
# Verificar: tailwind.config.ts
# Reiniciar: pnpm dev
```

---

## 🎯 Mensajes Clave

```bash
# Pitch
"Pagos instantáneos, confianza sin bancos."

# Problema
"¿Cómo comprar P2P sin confiar en desconocidos?"

# Solución
"Escrow automático con Lightning Network."

# Diferenciador
"Descentralizado (Nostr), instantáneo (Lightning)."
```

---

**Última actualización:** 12 de noviembre, 2025  
**Equipo:** TurboZaps ⚡

