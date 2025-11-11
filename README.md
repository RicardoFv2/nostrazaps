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
│   ├── page.tsx                    # Landing page
│   ├── marketplace/page.tsx        # Listado de productos
│   ├── sell/page.tsx               # Publicar anuncio
│   ├── product/[id]/page.tsx       # Detalle de producto
│   ├── dashboard/buyer/page.tsx    # Panel comprador
│   ├── dashboard/seller/page.tsx   # Panel vendedor
│   ├── select-role/page.tsx        # Pantalla para elegir rol
│   └── cart/page.tsx               # Carrito de compras
├── components/
│   ├── ui/                         # Componentes base de UI
│   ├── navbar.tsx                  # Barra de navegación
│   ├── product-card.tsx            # Tarjeta de producto
│   ├── lightning-payment-modal.tsx # Modal de pago Lightning
│   ├── escrow-chat.tsx             # Chat de escrow
│   ├── dashboard-layout.tsx        # Layout del dashboard
│   └── ...                         # Otros componentes
├── lib/
│   └── utils.ts                    # Utilidades
├── public/                         # Assets estáticos
├── styles/
│   └── globals.css                 # Estilos globales
├── README.md
└── package.json
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
