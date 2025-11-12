# ⚡ TurboZaps

> **"Pagos instantáneos, confianza sin bancos."**

**TurboZaps** es una plataforma descentralizada de compraventa P2P con **escrow automático Lightning** para mercados informales. Construida con Lightning Network (LNbits) y Nostr para comunicación descentralizada.

🎯 **Estado:** MVP Completo - Listo para demo  
🏆 **Hackathón:** Lightning / Nostr / Web3 (Noviembre 2025)

---

## 🚀 Características principales

- 🛒 **Marketplace P2P:** Compra y venta directa de artículos nuevos o usados
- ⚡ **Pagos Lightning:** Integración completa con LNbits NostrMarket API
- 🔐 **Escrow automático:** Fondos retenidos hasta confirmación del comprador
- 💬 **Chat P2P vía Nostr:** Comunicación descentralizada y cifrada
- 🧑‍💻 **Roles completos:** Merchant (vendedor) y Customer (comprador)
- 📊 **Dashboards:** Gestión de ventas, compras y escrows activos
- 📱 **UI moderna:** Next.js 14 + TypeScript + TailwindCSS + Shadcn/ui
- 🌐 **Descentralizado:** Identidad Nostr + Lightning Network

---

## ⚡ Flujo Completo

```
1. Merchant crea cuenta → Publica productos en NostrMarket
2. Buyer crea cuenta → Navega marketplace
3. Buyer compra producto → Sistema genera invoice Lightning
4. Buyer paga invoice → Fondos quedan en ESCROW
5. Chat P2P → Negocian entrega vía Nostr
6. Buyer confirma → Fondos liberados al vendedor ✅
```

📖 **Ver flujo detallado:** [`FLUJO_COMPLETO.md`](./FLUJO_COMPLETO.md)

---

## 🧩 Estructura del proyecto

```
turbozaps/
├── app/
│   ├── api/                        # API Routes (Next.js)
│   │   ├── merchants/              # ✅ Gestión de merchants
│   │   ├── stalls/                 # ✅ Gestión de stalls (tiendas)
│   │   ├── customers/              # ✅ Gestión de buyers
│   │   ├── products/               # ✅ CRUD de productos
│   │   ├── orders/                 # ✅ Sistema de órdenes
│   │   │   └── [id]/
│   │   │       ├── release/        # ✅ Liberar escrow
│   │   │       └── refund/         # ✅ Devolver fondos
│   │   └── chat/                   # ✅ Chat P2P vía Nostr
│   ├── register/
│   │   ├── merchant/               # ✅ Registro de vendedor
│   │   └── buyer/                  # ✅ Registro de comprador
│   ├── select-role/                # ✅ Selector de rol
│   ├── marketplace/                # ✅ Listado de productos
│   ├── sell/                       # ✅ Gestión de productos (seller)
│   ├── product/[id]/               # ✅ Detalle + compra
│   ├── dashboard/
│   │   ├── buyer/                  # ✅ Dashboard comprador
│   │   └── seller/                 # ✅ Dashboard vendedor
│   └── page.tsx                    # Landing page
├── components/
│   ├── ui/                         # Shadcn/ui components
│   ├── product-form.tsx            # ✅ Crear productos
│   ├── product-detail.tsx          # ✅ Detalle + compra + escrow
│   ├── lightning-payment-modal.tsx # ✅ Modal de pago
│   ├── escrow-chat.tsx             # ✅ Chat P2P
│   ├── escrows-table.tsx           # ✅ Tabla de transacciones
│   └── ...                         # Otros componentes de UI
├── lib/
│   ├── lnbits.ts                   # ✅ Wrapper API LNbits
│   ├── db.ts                       # ✅ SQLite local
│   ├── config.ts                   # ✅ Configuración
│   └── utils.ts                    # Utilidades
├── types/
│   └── index.ts                    # ✅ TypeScript interfaces
├── docs/
│   ├── api.md                      # ✅ API Reference LNbits
│   ├── FLUJO_COMPLETO.md           # ✅ Flujo técnico detallado
│   ├── README_FLUJO.md             # ✅ Guía de usuario
│   ├── DEMO_SCRIPT.md              # ✅ Script para demo
│   ├── STATUS.md                   # ✅ Estado del proyecto
│   └── QUICK_REFERENCE.md          # ✅ Referencia rápida
├── .env.local                      # Variables de entorno
├── package.json                    # Dependencias
└── turbozaps.db                    # Base de datos SQLite
```

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|-------------|-----|
| **Next.js 14 (App Router)** | Framework principal + API Routes |
| **TypeScript** | Tipado estático end-to-end |
| **TailwindCSS + Shadcn/ui** | Estilos y componentes |
| **LNbits + NostrMarket** | Pagos Lightning + Marketplace descentralizado |
| **Nostr Protocol** | Identidad descentralizada + Chat P2P |
| **SQLite** | Base de datos local |
| **React Hooks** | Gestión de estado |

---

## ⚙️ Instalación y Configuración

### 1. Clona el repositorio

```bash
git clone https://github.com/turbozaps/turbozaps.git
cd turbozaps
```

### 2. Instala dependencias

```bash
pnpm install
# o
npm install
```

### 3. Configura variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# LNbits Configuration
LNBITS_URL=https://demo.lnbits.com
LNBITS_API_KEY=your_admin_key_here

# Database
DATABASE_URL=./turbozaps.db
```

> ⚠️ **Importante:** Necesitas tener instalada la extensión **NostrMarket** en tu instancia de LNbits.

### 4. Inicia el servidor

```bash
pnpm dev
```

### 5. Abre en el navegador

```
http://localhost:3000
```

---

## 🌐 Configuración de LNbits

### Opción A: Demo (para testing)

```env
LNBITS_URL=https://demo.lnbits.com
LNBITS_API_KEY=your_demo_key
```

### Opción B: Instancia propia

1. Instala LNbits: https://lnbits.com
2. Activa la extensión **NostrMarket**
3. Crea una API Key (Admin o Invoice)
4. Configura `.env.local`

---

## 🔒 Flujo de Escrow

```
┌──────────┐
│ COMPRA   │ → Buyer paga invoice Lightning
└────┬─────┘
     ↓
┌──────────┐
│ ESCROW   │ → Fondos retenidos en LNbits
└────┬─────┘
     ↓
┌──────────┐
│ CHAT P2P │ → Negocian entrega vía Nostr
└────┬─────┘
     ↓
┌──────────┐
│ CONFIRMA │ → Buyer confirma recepción
└────┬─────┘
     ↓
┌──────────┐
│ LIBERA   │ → Fondos transferidos al seller ✅
└──────────┘
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [`docs/api.md`](./docs/api.md) | Referencia completa API LNbits NostrMarket |
| [`FLUJO_COMPLETO.md`](./FLUJO_COMPLETO.md) | Flujo técnico detallado del sistema |
| [`README_FLUJO.md`](./README_FLUJO.md) | Guía de usuario paso a paso |
| [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) | Script para presentación del hackathón |
| [`STATUS.md`](./STATUS.md) | Estado actual del proyecto |
| [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) | Referencia rápida para desarrollo |
| [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) | 🆘 Guía de solución de problemas |

---

## 🚀 Inicio Rápido

### Para probar el flujo completo:

1. **Crear Merchant:** `http://localhost:3000/register/merchant`
2. **Crear Productos:** `http://localhost:3000/sell`
3. **Crear Buyer:** `http://localhost:3000/register/buyer`
4. **Comprar:** `http://localhost:3000/marketplace`
5. **Ver Dashboards:**
   - Buyer: `http://localhost:3000/dashboard/buyer`
   - Seller: `http://localhost:3000/dashboard/seller`

📖 **Guía detallada:** Ver [`README_FLUJO.md`](./README_FLUJO.md)  
🎬 **Script de demo:** Ver [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)

---

## 🎯 Roadmap

### ✅ MVP Completo (Noviembre 2025)
- [x] Sistema de registro (Merchants y Buyers)
- [x] CRUD de productos en NostrMarket
- [x] Marketplace funcional
- [x] Órdenes con invoices Lightning
- [x] Escrow automático
- [x] Chat P2P vía Nostr
- [x] Dashboards completos
- [x] Liberación/devolución de fondos

### 🔮 Futuras Mejoras
- [ ] Sistema de reputación
- [ ] Búsqueda y filtros avanzados
- [ ] Notificaciones push
- [ ] Multi-idioma (i18n)
- [ ] Sistema de arbitraje
- [ ] PWA (Progressive Web App)
- [ ] Analytics y métricas

---

## 👨‍💻 Equipo TurboZaps

**Hackathón:** Lightning / Nostr / Web3 (Noviembre 2025)

- **Ricardo Fuentes** – Full-Stack & Arquitectura Lightning
- *(Agregar más colaboradores)*

---

## 📜 Licencia

MIT License © 2025 TurboZaps

---

## 🙏 Agradecimientos

- **LNbits Team** - Por la increíble infraestructura Lightning
- **Nostr Community** - Por el protocolo descentralizado
- **Lightning Network** - Por hacer posible los micropagos instantáneos

---

<div align="center">
  
**⚡ TurboZaps**

*Pagos instantáneos, confianza sin bancos.*

[Demo](https://turbozaps.com) • [Docs](./docs/api.md) • [Twitter](#) • [Discord](#)

</div>
