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

---

## 🧱 `RULES.md`

```markdown
# ⚙️ Reglas del Proyecto — TurboZaps

## 🧭 Propósito
Construir un MVP funcional en 24 horas que demuestre cómo **Lightning Network** puede habilitar **pagos con escrow confiables** para el comercio informal en El Salvador.

---

## 🚧 Estructura de trabajo

- **Frontend (v0):**
  - Diseño rápido de UI/UX.
  - Componentes base y vistas (`Landing`, `Marketplace`, `Dashboard`).
  - Integración mínima con backend mock.

- **Backend (Cursor):**
  - API en Go o TypeScript (según setup del equipo).
  - Endpoints principales:
    - `POST /orders` → crear escrow.
    - `POST /release` → liberar fondos.
    - `POST /cancel` → cancelar transacción.
    - `GET /escrows` → listar transacciones activas.

---

## 🧑‍💻 Roles

| Rol | Responsabilidades |
|------|--------------------|
| **Frontend Lead** | UI, componentes, integración con API. |
| **Backend Lead** | Lambda o API para LNbits + NostrMarket. |
| **Product Owner** | Visión, UX y demo final. |

---

## 🔄 Flujo de commits

1. Crear rama con prefijo del módulo:
   ```
   feat/ui-dashboard
   fix/lnbits-integration
   ```

2. PRs pequeños y revisados antes del merge.
3. Cada PR debe incluir cambios en código y, si aplica, en README.

---

## 🧪 Buenas prácticas

- Usa **nombres claros** para commits.
- Mantén el código **tipado y comentado**.
- Simula datos locales cuando el backend no esté listo.
- **No hardcodees keys** — usa `.env.local`.

---

## 🧠 Guía rápida de desarrollo

1. Genera componentes visuales en **v0.dev**.
2. Desarrolla el backend en **Cursor**.
3. Conecta ambos usando fetch/axios.
4. Testea con LNbits local o legend.lnbits.com.
5. Demuestra el flujo completo (landing → marketplace → pago → escrow → liberación).

---

## ⚡ Objetivo final del hackatón
Lograr una **demo en vivo funcional** con al menos un flujo:
> “Publicar producto → Pagar con Lightning → Chat → Liberar escrow”.
