# ⚡ TurboZaps

**TurboZaps** es una plataforma descentralizada de compraventa pensada para el comercio informal en El Salvador.
Permite publicar anuncios, comprar productos y realizar pagos seguros a través de **Lightning Network (LNbits)** con un **sistema de escrow** que protege a comprador y vendedor.

---

## 🚀 Características principales

- 🛒 **Marketplace P2P:** Compra y venta directa de artículos nuevos o usados.
- ⚡ **Pagos Lightning Network:** Integración con LNbits y soporte futuro para NostrMarket.
- 🤝 **Escrow de confianza:** Los fondos se mantienen retenidos hasta que ambas partes confirmen.
- 💬 **Chat entre partes:** Comunicación directa para coordinar entrega o negociación.
- 🧑‍💻 **Roles separados:** Paneles de control para comprador y vendedor.
- 📱 **UI moderna y ligera:** Construida con Next.js + TypeScript + TailwindCSS.
- 🌗 **Modo oscuro opcional** (si v0 lo generó).

---

## 🧩 Estructura del proyecto

```
turbozaps/
├── app/
│   ├── globals.css                 # Estilos globales de Next.js
│   ├── layout.tsx                  # Layout principal de la aplicación
│   ├── page.tsx                    # Landing page
│   ├── api/                        # API Routes de Next.js
│   │   ├── chat/
│   │   │   └── route.ts            # API de chat buyer/seller
│   │   ├── orders/
│   │   │   └── route.ts            # API de órdenes (GET/POST)
│   │   ├── orders/[id]/
│   │   │   └── route.ts            # API específica de orden
│   │   ├── orders/[id]/refund/
│   │   │   └── route.ts            # API de reembolso de orden
│   │   ├── orders/[id]/release/
│   │   │   └── route.ts            # API de liberación de escrow
│   │   └── products/
│   │       └── route.ts            # API de productos
│   ├── cart/
│   │   └── page.tsx                # Página del carrito de compras
│   ├── dashboard/
│   │   ├── buyer/
│   │   │   └── page.tsx            # Panel del comprador
│   │   └── seller/
│   │       └── page.tsx            # Panel del vendedor
│   ├── marketplace/
│   │   └── page.tsx                # Listado de productos
│   ├── product/[id]/
│   │   └── page.tsx                # Detalle de producto
│   ├── select-role/
│   │   └── page.tsx                # Pantalla para elegir rol
│   └── sell/
│       └── page.tsx                # Publicar anuncio
├── components/
│   ├── ui/                         # Componentes base de UI (shadcn/ui)
│   ├── cta.tsx                     # Call-to-action component
│   ├── dashboard-layout.tsx        # Layout del dashboard
│   ├── escrow-chat.tsx             # Componente de chat de escrow
│   ├── escrow-status-badge.tsx     # Badge de estado de escrow
│   ├── escrows-table.tsx           # Tabla de escrows
│   ├── features.tsx                # Sección de características
│   ├── footer.tsx                  # Footer de la aplicación
│   ├── hero.tsx                    # Sección hero
│   ├── how-it-works.tsx            # Sección "cómo funciona"
│   ├── lightning-payment-modal.tsx # Modal de pago Lightning
│   ├── navbar.tsx                  # Barra de navegación
│   ├── product-card.tsx            # Tarjeta de producto
│   ├── product-detail.tsx          # Detalle de producto
│   ├── product-form.tsx            # Formulario de producto
│   ├── theme-provider.tsx          # Proveedor de tema
│   └── why-turbozaps.tsx           # Sección "por qué TurboZaps"
├── docs/
│   └── api.md                      # Documentación de la API
├── lib/
│   ├── config.ts                   # Configuraciones
│   ├── db.ts                       # Utilidades de base de datos
│   ├── lnbits.ts                   # Integración con LNbits
│   └── utils.ts                    # Utilidades generales
├── public/                         # Assets estáticos
├── scripts/
│   ├── README.md                   # Documentación de scripts
│   └── test-local.ts               # Script de testing local
├── styles/
│   └── globals.css                 # Estilos globales adicionales
├── types/
│   └── index.ts                    # Definiciones de tipos TypeScript
├── .gitignore                      # Archivos ignorados por Git
├── eslint.config.mjs               # Configuración de ESLint
├── next.config.mjs                 # Configuración de Next.js
├── package.json                    # Dependencias y scripts
├── pnpm-lock.yaml                  # Lockfile de pnpm
├── README.md                       # Este archivo
├── SPRINTS.MD                      # Documentación de sprints
├── tsconfig.json                   # Configuración de TypeScript
└── ...
```

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|-------------|-----|
| **Next.js 14 (App Router)** | Framework principal |
| **TypeScript** | Tipado estático |
| **TailwindCSS** | Estilos y diseño responsivo |
| **LNbits API** | Manejo de pagos Lightning |
| **NostrMarket (opcional)** | Extensión para listados descentralizados |
| **Framer Motion** | Animaciones suaves |
| **React Hot Toast** | Notificaciones visuales |

---

## ⚙️ Instalación local

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/<tu_usuario>/turbozaps.git
   cd turbozaps
   ```

2. **Instala las dependencias:**
   ```bash
   pnpm install
   # o
   npm install
   ```

3. **Inicia el servidor de desarrollo:**
   ```bash
   pnpm dev
   # o
   npm run dev
   ```

4. **Abre en el navegador:**
   ```
   http://localhost:3000
   ```
## 🌐 Integración con LNbits

**Nota:** Durante el hackatón puedes usar LNbits local o un servidor público.

Configura tu URL y API key en variables de entorno:

```bash
NEXT_PUBLIC_LNBITS_URL=https://legend.lnbits.com
NEXT_PUBLIC_LNBITS_API_KEY=<tu_api_key>
```

## 🔒 Escrow Flow (visión general)

1. **Compra:** El comprador genera un pago Lightning.
2. **Retención:** LNbits mantiene los fondos en escrow.
3. **Entrega:** El vendedor entrega el producto.
4. **Liberación:** El comprador confirma, los fondos se liberan al vendedor.

## 👨‍💻 Equipo & Hackathon

Proyecto creado en 1 día para hackatón Lightning / Nostr / Web3.

**Equipo TurboZaps ⚡**

- Ricardo Fuentes – Backend & Arquitectura LNbits
- *(Agregar más si participan)*

## 📜 Licencia

MIT License © 2025 TurboZaps
