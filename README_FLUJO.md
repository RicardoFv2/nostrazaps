# 🎯 TurboZaps - Flujo de Usuario MVP

## 🚀 Inicio Rápido

### 1️⃣ Comerciante vende productos

```bash
# 1. Ir a selección de rol
http://localhost:3000/select-role

# 2. Seleccionar "Vendedor" → Registrarse
# - Genera claves Nostr (o ingresa las tuyas)
# - Crea merchant en NostrMarket
# - Automáticamente crea un stall (tienda)
# - Inicia sesión con npub

# 3. Redirige a /sell → Crear productos
# - Click en "Nuevo Producto"
# - Llenar formulario
# - Producto se crea en NostrMarket
# - Aparece en tu lista de productos
```

### 2️⃣ Comprador compra productos

```bash
# 1. Ir a selección de rol
http://localhost:3000/select-role

# 2. Seleccionar "Comprador" → Registrarse
# - Genera clave pública Nostr
# - Crea customer en NostrMarket
# - Inicia sesión con npub

# 3. Ir a Marketplace
http://localhost:3000/marketplace

# 4. Click en un producto → Ver detalle
# 5. Click en "Comprar con Lightning ⚡"
# - Sistema crea orden
# - Genera invoice Lightning
# - Muestra modal con QR y código
```

### 3️⃣ Pago y Escrow

```bash
# 1. Comprador paga invoice
# - Escanea QR con billetera Lightning
# - O copia el invoice

# 2. Click en "Ya pagué ✓"
# - Estado cambia a "paid" (en escrow)
# - Fondos retenidos de forma segura
# - Aparece chat P2P

# 3. Chat de negociación
# - Comprador y vendedor se comunican
# - Mensajes vía Nostr (descentralizado)
# - Coordinan entrega del producto
```

### 4️⃣ Liberación de fondos

```bash
# Cuando el comprador recibe el producto:

# 1. Click en "Confirmar entrega"
# - Dialog de confirmación
# - "¿Confirmas que recibiste el producto?"

# 2. Confirmar → Fondos liberados
# - Estado cambia a "released"
# - Dinero transferido al vendedor
# - Transacción completada ✅

# Alternativa: Cancelar
# - Vendedor puede cancelar
# - Fondos devueltos al comprador
```

---

## 📊 Estados de la Orden

```
┌──────────┐
│ PENDING  │ ← Orden creada, esperando pago
└────┬─────┘
     │ Pago invoice
     ↓
┌──────────┐
│   PAID   │ ← Fondos en ESCROW (asegurados)
│ (escrow) │    Chat activo
└────┬─────┘
     │
     ├─→ Confirmar entrega
     │        ↓
     │   ┌──────────┐
     │   │ RELEASED │ ✅ Fondos al vendedor
     │   └──────────┘
     │
     └─→ Cancelar
             ↓
        ┌───────────┐
        │ CANCELLED │ ❌ Fondos devueltos
        └───────────┘
```

---

## 🔑 Claves Nostr (para demo)

El sistema genera claves automáticamente, pero puedes usar estas para testing:

### Merchant
```
Private: nsec1testmerchant123...
Public:  npub1testmerchant456...
```

### Buyer
```
Public:  npub1testbuyer789...
```

---

## 🎨 Interfaz de Usuario

### 🏪 Vista del Vendedor (`/sell`)
- Lista de productos del merchant
- Botón "Nuevo Producto"
- Toggle entre lista y formulario
- Productos cargados desde NostrMarket

### 🛍️ Vista del Comprador (`/marketplace`)
- Grid de productos disponibles
- Click en producto → Detalle
- Botón "Comprar con Lightning"

### 💬 Chat de Escrow
- Mensajes en tiempo real
- Badge de estado del escrow
- Botones de acción (Confirmar/Cancelar)
- Scroll automático

### 📊 Dashboards
- **Buyer:** Ver compras y escrows activos
- **Seller:** Ver ventas y gestionar transacciones

---

## 🔗 APIs Conectadas

### NostrMarket (LNbits)
- ✅ Merchants
- ✅ Stalls
- ✅ Products
- ✅ Orders (si disponible)
- ✅ Messages (Nostr P2P)

### Local (Next.js)
- ✅ Orders management
- ✅ Escrow logic
- ✅ Chat interface
- ✅ Status updates

---

## 💡 Características Clave

### 🔐 Seguridad
- Fondos en escrow Lightning
- No se pueden revertir sin confirmación
- Comunicación P2P cifrada (Nostr)

### ⚡ Velocidad
- Pagos Lightning instantáneos
- Chat en tiempo real
- UI responsive

### 🌐 Descentralización
- Nostr para identidad
- Lightning para pagos
- Sin intermediarios centralizados

### 🎯 Simplicidad (MVP)
- Flujo claro de 4 pasos
- UI intuitiva
- Mínima fricción

---

## 🛠️ Configuración

### Variables de entorno (`.env.local`)

```env
LNBITS_URL=https://demo.lnbits.com
LNBITS_API_KEY=tu_admin_key_aqui
DATABASE_URL=./turbozaps.db
```

### Iniciar el proyecto

```bash
# Instalar dependencias
pnpm install

# Iniciar desarrollo
pnpm dev

# Abrir navegador
http://localhost:3000
```

---

## 🎬 Demo para Hackathón

### Guión sugerido (5 minutos)

**Minuto 1:** Introducción
- Problema: Compras P2P sin confianza
- Solución: Escrow Lightning + Nostr

**Minuto 2:** Crear Vendedor
- Registro rápido
- Crear producto
- Mostrar en NostrMarket

**Minuto 3:** Crear Comprador
- Registro rápido
- Ver marketplace
- Comprar producto

**Minuto 4:** Mostrar Escrow
- Pago Lightning (demo)
- Chat P2P
- Estado del escrow

**Minuto 5:** Liberar Fondos
- Confirmar entrega
- Fondos liberados
- Cierre

---

## 📝 Notas Técnicas

### Base de datos local (SQLite)
- Productos (cache)
- Orders (gestión local)
- Messages (cache de Nostr)

### NostrMarket como fuente de verdad
- Productos publicados en Nostr
- Identidades verificables
- Mensajes descentralizados

### Lightning Network
- Invoices generados por LNbits
- Escrow automático
- Confirmación instantánea

---

## ✅ Checklist Pre-Demo

- [ ] LNbits configurado y funcionando
- [ ] NostrMarket extension activa
- [ ] Variables de entorno configuradas
- [ ] Base de datos inicializada
- [ ] Merchant de prueba creado
- [ ] Productos de prueba creados
- [ ] Buyer de prueba creado
- [ ] Lightning wallet lista (para demo de pago)

---

## 🐛 Troubleshooting

### Error: "LNbits API endpoint not found"
- Verifica que NostrMarket esté instalado
- Revisa `LNBITS_URL` en `.env.local`
- Confirma que `LNBITS_API_KEY` sea válida

### Error: "No se encontró el ID de la tienda"
- Crea merchant desde `/register/merchant`
- Verifica que se creó el stall automáticamente

### Chat no muestra mensajes
- Verifica que ambos usuarios tengan npub válidas
- Revisa que el order_id sea correcto
- Confirma conexión con NostrMarket

---

## 🎉 ¡Listo!

El sistema está 100% funcional para el MVP del hackathón.

**Pagos instantáneos, confianza sin bancos. ⚡**

