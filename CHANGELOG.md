# 📋 TurboZaps - Changelog

## [Unreleased] - 2025-11-12

### 🔧 Fixed

#### Problema: Error 405 "Method Not Allowed" al crear órdenes
- **Síntoma:** Error al intentar comprar productos
- **Causa:** NostrMarket no tiene endpoint `POST /order`
- **Solución:** Implementado generación de invoices Lightning directamente

**Cambios realizados:**

1. **Nueva función `createLightningInvoice()` en `lib/lnbits.ts`**
   - Genera invoices Lightning usando LNbits Wallet API (`/api/v1/payments`)
   - No usa NostrMarket para crear órdenes
   - Parámetros: `amount`, `memo`, `order_id`
   - Retorna: `payment_request`, `payment_hash`

2. **Función `createOrder()` marcada como DEPRECATED**
   - NostrMarket crea órdenes vía eventos Nostr, no vía API
   - Ahora lanza error explicativo

3. **Actualizado `app/api/orders/route.ts`**
   - Usa `createLightningInvoice()` en lugar de `createOrder()`
   - Genera memo descriptivo para invoices
   - Manejo de errores mejorado

4. **Documentación actualizada:**
   - `TROUBLESHOOTING.md`: Agregada sección sobre error 405
   - `FLUJO_COMPLETO.md`: Actualizado flujo de órdenes
   - `ARCHITECTURE.md`: Actualizado diagrama de flujo
   - `env.example`: Aclarado tipo de API key necesaria

#### Problema: Claves Nostr inválidas
- **Síntoma:** Error 500 "Cannot create merchant"
- **Causa:** Claves generadas no eran hexadecimales válidas
- **Solución:** Implementada generación de claves hex de 64 caracteres

**Cambios realizados:**

1. **Actualizado `app/register/merchant/page.tsx`**
   - Función `generateNostrKeys()` ahora genera claves hex válidas
   - Usa `crypto.getRandomValues()` para 32 bytes aleatorios
   - Convierte a string hexadecimal de 64 caracteres

2. **Actualizado `app/register/buyer/page.tsx`**
   - Función `generatePublicKey()` genera clave hex válida
   - Mismo formato que merchant (64 chars hex)

3. **Validación agregada en `lib/lnbits.ts`**
   - Función `createMerchant()` valida formato hex
   - Regex: `/^[0-9a-f]{64}$/i`
   - Logging mejorado con longitud de claves

4. **UI actualizada:**
   - Labels cambiados de `(nsec)/(npub)` a `(hex)`
   - Placeholders: "64 caracteres hexadecimales..."
   - Mensaje de ayuda actualizado

5. **Documentación:**
   - Creado `TROUBLESHOOTING.md` con guías completas
   - Actualizado `README.md` con link a troubleshooting

---

## [1.0.0] - MVP Inicial - 2025-11-12

### ✨ Features Implementadas

#### Sistema de Usuarios
- Registro de comerciantes (Merchants) con claves Nostr
- Registro de compradores (Buyers/Customers)
- Generación automática de claves Nostr hexadecimales
- Selección de rol (Buyer/Seller)
- Almacenamiento en localStorage

#### Gestión de Productos
- Crear productos en NostrMarket via API
- Listar productos del merchant
- Listar todos los productos (marketplace)
- Ver detalle de producto
- CRUD completo de productos

#### Sistema de Órdenes
- Crear orden de compra localmente
- Generar invoice Lightning (LNbits Wallet API)
- Gestión de estados (pending/paid/released/cancelled)
- Listar órdenes por comprador
- Listar órdenes por vendedor

#### Escrow Lightning
- Retención de fondos mediante invoices Lightning
- Liberación de fondos al vendedor
- Devolución de fondos al comprador
- Estados visuales claros con badges

#### Chat P2P
- Mensajes vía NostrMarket (Nostr Protocol)
- Chat integrado en detalle de producto
- Polling de mensajes nuevos cada 5s
- UI de chat responsiva

#### Dashboards
- Dashboard del comprador (ver compras y escrows)
- Dashboard del vendedor (ver ventas y gestionar)
- Tabla de transacciones con filtros
- Estados con badges de colores

#### Integración LNbits
- Autenticación con X-API-Key
- Conexión con NostrMarket extension
- Endpoints de merchants, stalls, products
- Sistema de mensajería Nostr
- Generación de invoices Lightning
- Manejo de errores robusto

#### Documentación
- README completo con guía de instalación
- API Reference de LNbits NostrMarket
- Flujo técnico detallado
- Guía de usuario paso a paso
- Script de demo para hackathón
- Referencia rápida para desarrollo
- Guía de troubleshooting
- Arquitectura del sistema
- Índice de documentación

---

## Formato de Claves Nostr

### Antes (Incorrecto)
```javascript
private_key: "nsecabc123..."  // ❌ No válido
public_key: "npubxyz789..."   // ❌ No válido
```

### Ahora (Correcto)
```javascript
private_key: "a1b2c3d4e5f6..." // ✅ 64 chars hex
public_key: "f6e5d4c3b2a1..."  // ✅ 64 chars hex
```

---

## Flujo de Órdenes

### Antes
```
POST /api/orders
  → createOrder()
    → POST /nostrmarket/api/v1/order ❌ (405 Error)
```

### Ahora
```
POST /api/orders
  → createLightningInvoice()
    → POST /api/v1/payments ✅ (LNbits Wallet API)
      → payment_request, payment_hash
```

---

## Variables de Entorno

```env
# LNbits
LNBITS_URL=https://demo.lnbits.com
LNBITS_API_KEY=your_admin_or_invoice_key_here

# Database
DATABASE_URL=./turbozaps.db
```

---

## Tecnologías

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **TailwindCSS + Shadcn/ui** - Estilos y componentes
- **LNbits + NostrMarket** - Backend Lightning + Marketplace
- **Nostr Protocol** - Identidad y mensajería P2P
- **SQLite** - Base de datos local
- **Lightning Network** - Pagos instantáneos

---

## Estado del Proyecto

🎯 **MVP Completo** - Listo para demo del hackathón  
📅 **Fecha:** 12 de noviembre, 2025  
🏆 **Hackathón:** Lightning / Nostr / Web3

---

**Equipo TurboZaps ⚡**  
*Pagos instantáneos, confianza sin bancos.*

