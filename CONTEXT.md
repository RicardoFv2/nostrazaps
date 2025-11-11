
## ⚡ Proyecto
**TurboZaps** es un MVP construido para un hackatón Lightning/Nostr/Web3.  
Su objetivo es permitir que el comercio informal en El Salvador use **pagos con escrow Lightning Network** a través de **LNbits + extensión NostrMarket**.

El frontend (UI) fue creado con **v0.dev** en Next.js + TypeScript + TailwindCSS.  
Este archivo contextualiza el entorno del backend que será generado con **Cursor**.

---

## 🧩 Arquitectura esperada
- **Framework:** Next.js (App Router) o Go Lambda.
- **DB:** SQLite (o mock temporal).
- **Integraciones:** LNbits API (Lightning payments + NostrMarket extension).
- **Responsabilidad principal:** Manejar órdenes con escrow Lightning:
  1. Crear producto.
  2. Crear orden (invoice en LNbits/NostrMarket).
  3. Verificar pago.
  4. Mantener fondos en escrow.
  5. Liberar o reembolsar pago.

---

## 🌐 LNbits API Reference
- **Base URL:** `https://demo.lnbits.com`
- **Documentation:** [LNbits Docs](https://demo.lnbits.com/docs#/)
- **Auth:** Uses `X-Api-Key` header.
  - You’ll need two keys:
    - `ADMIN_KEY` for managing merchant actions.
    - `INVOICE_KEY` for customer payments.

> Example:
> ```http
> GET https://demo.lnbits.com/api/v1/wallet
> X-Api-Key: {{ADMIN_KEY}}
> ```

---

## 🧱 Extensión clave: NostrMarket
**NostrMarket** es una extensión de LNbits que implementa productos, órdenes, mensajes y escrow.

### Usos dentro de TurboZaps:
- Publicar y obtener productos.
- Crear y gestionar órdenes Lightning (escrow).
- Chat P2P entre comprador y vendedor.
- Restaurar y reemitir órdenes en caso de fallo.

La lista completa de endpoints usados se encuentra en:
`/docs/api.md`

---

## ⚙️ Archivos de referencia locales

| Archivo | Descripción |
|----------|--------------|
| `/docs/lnbitsapi.json` | Export completo de la API LNbits + NostrMarket. |
| `/docs/api.md` | Resumen de los endpoints relevantes para TurboZaps. |
| `/lib/lnbits.ts` | Wrapper TypeScript que interactúa con los endpoints. |
| `/app/api/orders/...` | Rutas REST internas del backend (crear, liberar, refund). |

---

## 🧩 Cómo Cursor debe usar este contexto
1. Leer `/docs/api.md` como resumen de endpoints NostrMarket.
2. Usar `/docs/lnbitsapi.json` si necesita parámetros o ejemplos más detallados.
3. Generar funciones en `/lib/lnbits.ts` que interactúen con los endpoints reales de LNbits.
4. Implementar rutas en `/app/api/orders` basadas en esos helpers.
5. Mantener compatibilidad con el frontend en Next.js (UI v0.dev).

---

## 🧠 Tips para generación
- Todas las llamadas a LNbits requieren `X-Api-Key`.
- Los endpoints de `/nostrmarket/api/v1/order` gestionan el flujo escrow.
- Chat buyer/seller se maneja con `/nostrmarket/api/v1/message`.
- Usar `fetch` o `axios` con manejo de errores claro.
- Mantener logging simple para depuración (`console.log` o `pino`).

---

**Resumen:**  
Cursor debe generar un backend que use **LNbits NostrMarket API** como servicio de escrow Lightning para el proyecto **TurboZaps**.
