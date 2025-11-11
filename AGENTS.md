# 👥 AGENTS.md — TurboZaps

> Roles, responsabilidades y guías de trabajo para el equipo TurboZaps ⚡  
> Proyecto creado para hackatón Lightning / Nostr / Web3.

---

## 🧭 Propósito
Definir los **agentes técnicos** y su área de acción dentro del proyecto.  
El objetivo es acelerar el desarrollo paralelo entre **frontend (v0)** y **backend (Cursor)** manteniendo coherencia técnica.

---

## 🧩 Estructura de agentes

### 🟡 Frontend Agent — `@v0`
**Rol:** Diseñador y generador de UI (Next.js + Tailwind + TS)

**Responsabilidades:**
- Generar vistas completas en `/app/`:
  - Landing (`/`)
  - Marketplace (`/marketplace`)
  - Sell (`/sell`)
  - Product detail (`/product/[id]`)
  - Dashboard buyer/seller (`/dashboard/...`)
- Crear componentes:
  - `ProductCard`, `Navbar`, `LightningPaymentModal`, `EscrowChat`, `DashboardLayout`.
- Asegurar diseño responsive y coherente con la marca TurboZaps.
- Exportar componentes limpios listos para integración con el backend.

**Flujo:**
- Generar prompts modulares en v0.
- Verificar que los enlaces (`next/link`) y rutas funcionen.
- Coordinar con `@cursor` para API endpoints (mock primero, fetch después).

---

### 🔵 Backend Agent — `@cursor`
**Rol:** Ingeniero backend e integrador de Lightning Network.

**Responsabilidades:**
- Crear e implementar la API principal en Go o TypeScript.
- Conectar con LNbits + NostrMarket:
  - `POST /orders` → Crear invoice y escrow.
  - `POST /release` → Liberar pago al vendedor.
  - `POST /cancel` → Devolver fondos.
  - `GET /escrows` → Listar transacciones activas.
- Gestionar variables de entorno (`.env`) y autenticación básica.
- Documentar endpoints en `docs/api.md`.

**Flujo:**
- Inicia con mocks locales en `/api`.
- Conecta con LNbits cuando los endpoints estén listos.
- Coordina con `@v0` para manejo de estados (`paid`, `escrow`, `released`, `cancelled`).

---

### 🟢 Product Owner — `@ricardo`
**Rol:** Dirección técnica y narrativa de producto.

**Responsabilidades:**
- Definir visión y storytelling del proyecto para el hackatón.
- Priorizar features clave:
  - Escrow Lightning
  - Chat P2P
  - Roles Buyer/Seller
- Mantener foco MVP (mostrar valor, no complejidad).
- Coordinar tiempos y entregas entre `@v0` y `@cursor`.

---

### 🟣 QA & Demo Agent — `@turboqa`
**Rol:** Verificación de flujo completo y demo pública.

**Responsabilidades:**
- Probar el flujo completo:
  - Crear producto → Comprar → Pagar → Liberar.
- Asegurar que las transiciones sean fluidas.
- Grabar y documentar la demo para presentación final.
- Reportar bugs en `/issues` con etiqueta `qa`.

---

## 🧠 Comunicación y colaboración

| Canal | Uso |
|--------|-----|
| `v0.dev` | Generación rápida de UI/UX |
| `Cursor` | Backend, integración y despliegue |
| `GitHub Issues` | Reporte de bugs, tareas y QA |
| `README.md` | Documentación viva del proyecto |
| `RULES.md` | Guía técnica del hackatón |

---

## 🧩 Dev environment tips

- Usa `pnpm dlx turbo run where <project_name>` si se escala a monorepo.
- Ejecuta `pnpm install --filter <package>` si Vite, ESLint o TS no detectan el módulo.
- Usa mocks mientras el backend no esté conectado.
- Mantén los endpoints REST o RPC documentados desde `@cursor`.

---

## 🧠 Flujo de desarrollo ideal

```
[v0.dev] → Genera UI y componentes
[Cursor] → Conecta API LNbits + Escrow
[TurboQA] → Testea flujo end-to-end
[PO] → Revisa narrativa y demo final
```

---

## ⚡ Filosofía TurboZaps

> "Pagos instantáneos, confianza sin bancos."  
> Construimos una herramienta real para los mercados informales del futuro.

---

**© 2025 TurboZaps — Hack the Lightning.**
