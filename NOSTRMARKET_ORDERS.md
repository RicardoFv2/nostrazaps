# 🛒 TurboZaps - NostrMarket Orders Explained

## 📋 Endpoints Oficiales de LNbits NostrMarket (Orders)

Según la API oficial de LNbits NostrMarket, estos son los endpoints disponibles para órdenes:

### ✅ Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/nostrmarket/api/v1/stall/order/{stall_id}` | Obtener órdenes de un stall |
| `GET` | `/nostrmarket/api/v1/order` | Obtener todas las órdenes |
| `GET` | `/nostrmarket/api/v1/order/{order_id}` | Obtener una orden específica |
| `PATCH` | `/nostrmarket/api/v1/order/{order_id}` | Actualizar estado de orden |
| `PUT` | `/nostrmarket/api/v1/order/restore/{event_id}` | Restaurar orden por event_id |
| `PUT` | `/nostrmarket/api/v1/orders/restore` | Restaurar órdenes |
| `PUT` | `/nostrmarket/api/v1/order/reissue` | Re-emitir invoice de orden |

### ❌ Endpoint NO Disponible

```
POST /nostrmarket/api/v1/order  ← NO EXISTE
```

---

## 🤔 ¿Cómo se Crean las Órdenes en NostrMarket?

Las órdenes en NostrMarket **NO se crean mediante API HTTP**. En su lugar, se crean automáticamente a través de **eventos Nostr** siguiendo el protocolo **NIP-15** (Nostr Marketplace).

### Flujo Original de NostrMarket

```
1. Buyer publica evento Nostr tipo 4 (Direct Message)
   → Contenido cifrado con detalles de la orden
   → Dirigido al merchant's pubkey

2. NostrMarket detecta el evento
   → Parsea el contenido
   → Crea orden automáticamente
   → Genera invoice Lightning

3. Orden aparece en NostrMarket
   → GET /order/{order_id}
   → PATCH /order/{order_id} para actualizar
```

### Protocolo NIP-15

**NIP-15** define:
- Formato de eventos para crear órdenes
- Estructura de mensajes entre buyer y seller
- Estados de orden (pending, paid, shipped)
- Cifrado de mensajes sensibles

**Documentación:** https://github.com/nostr-protocol/nips/blob/master/15.md

---

## 🎯 Solución de TurboZaps (MVP)

Para el MVP del hackathón, **no implementamos NIP-15 completo**. En su lugar, usamos un enfoque híbrido más simple:

### Arquitectura Actual

```
┌─────────────────────────────────────────────────────┐
│           TurboZaps Hybrid Approach                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Productos → NostrMarket API ✅                  │
│     POST /nostrmarket/api/v1/product                │
│                                                     │
│  2. Órdenes → Local + LNbits Wallet API ✅          │
│     - Crear orden en SQLite local                   │
│     - Generar invoice: POST /api/v1/payments        │
│                                                     │
│  3. Mensajes → NostrMarket API ✅                   │
│     POST /nostrmarket/api/v1/message                │
│                                                     │
│  4. Escrow → Gestión local ✅                       │
│     - Estados en SQLite                             │
│     - Liberar/cancelar localmente                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### ¿Por Qué Este Enfoque?

**Ventajas:**
- ✅ Más simple para MVP
- ✅ Control total sobre el flujo de escrow
- ✅ No requiere implementar NIP-15 completo
- ✅ Funciona sin necesidad de relays Nostr
- ✅ Lightning invoices generados directamente

**Desventajas:**
- ❌ Órdenes no son "nativas" de NostrMarket
- ❌ No aprovecha descentralización completa de Nostr
- ❌ No son visibles en otros clientes NostrMarket

---

## 🔮 Futura Implementación NIP-15 (Post-MVP)

Para convertir TurboZaps en un cliente NostrMarket completo:

### Paso 1: Implementar Eventos Nostr

```typescript
// Crear evento NIP-15 para orden
import { SimplePool, getEventHash, getSignature } from 'nostr-tools';

const createOrderEvent = (product, buyer_keys) => {
  const event = {
    kind: 4, // Direct Message
    pubkey: buyer_keys.public_key,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', merchant_pubkey],
      ['e', product_event_id],
    ],
    content: JSON.stringify({
      id: order_id,
      type: 0, // New order
      name: buyer_name,
      address: shipping_address,
      message: buyer_message,
      contact: { nostr: buyer_pubkey },
      items: [{
        product_id: product.id,
        quantity: 1,
      }],
      shipping_id: shipping_zone_id,
    }),
  };

  event.id = getEventHash(event);
  event.sig = getSignature(event, buyer_keys.private_key);
  
  return event;
};
```

### Paso 2: Publicar a Relays

```typescript
const pool = new SimplePool();
const relays = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];

await pool.publish(relays, orderEvent);
```

### Paso 3: NostrMarket Detecta y Crea Orden

```
NostrMarket escucha relays
  → Detecta evento tipo 4 con tag 'p' = merchant_pubkey
  → Parsea contenido
  → Crea orden automáticamente
  → Genera invoice Lightning
  → Publica respuesta vía Nostr
```

### Paso 4: Usar Endpoints NostrMarket

```typescript
// Ahora sí podemos usar todos los endpoints
GET /nostrmarket/api/v1/order/{order_id}
PATCH /nostrmarket/api/v1/order/{order_id}
PUT /nostrmarket/api/v1/order/reissue
```

---

## 📊 Comparación: MVP vs Full NIP-15

| Feature | MVP Actual | Full NIP-15 |
|---------|------------|-------------|
| **Crear Productos** | ✅ NostrMarket API | ✅ Eventos Nostr |
| **Crear Órdenes** | ⚠️ Local + LNbits | ✅ Eventos Nostr |
| **Invoices Lightning** | ✅ LNbits Wallet API | ✅ NostrMarket auto |
| **Chat P2P** | ✅ NostrMarket API | ✅ Eventos Nostr |
| **Escrow** | ✅ Local | ⚠️ Manual |
| **Descentralización** | ⚠️ Parcial | ✅ Total |
| **Interoperabilidad** | ❌ Solo TurboZaps | ✅ Otros clientes |
| **Complejidad** | 🟢 Baja | 🟡 Media |
| **Tiempo desarrollo** | 🟢 Rápido | 🔴 Largo |

---

## 🎯 Recomendaciones

### Para el Hackathón (Ahora)
✅ **Usar solución actual (híbrida)**
- Funcional y completa
- Fácil de demostrar
- Todos los features críticos funcionan

### Para Producción (Futuro)
✅ **Migrar a NIP-15 completo**
- Interoperabilidad con otros clientes
- Descentralización total
- Mejor experiencia Nostr

---

## 🔗 Endpoints que SÍ Usamos

### Productos (✅ Implementado)
```bash
POST   /nostrmarket/api/v1/product
GET    /nostrmarket/api/v1/product/{id}
GET    /nostrmarket/api/v1/stall/product/{stall_id}
```

### Mensajes (✅ Implementado)
```bash
POST   /nostrmarket/api/v1/message
GET    /nostrmarket/api/v1/message/{pubkey}
```

### Merchants (✅ Implementado)
```bash
POST   /nostrmarket/api/v1/merchant
GET    /nostrmarket/api/v1/merchant
```

### Stalls (✅ Implementado)
```bash
POST   /nostrmarket/api/v1/stall
GET    /nostrmarket/api/v1/stall
```

### Órdenes (❌ NO Implementado con NostrMarket)
```bash
# En su lugar usamos:
POST /api/v1/payments  (LNbits Wallet API)
```

---

## 📚 Referencias

- **LNbits NostrMarket:** https://github.com/lnbits/nostrmarket
- **NIP-15 (Nostr Marketplace):** https://github.com/nostr-protocol/nips/blob/master/15.md
- **NIP-04 (Encrypted Direct Messages):** https://github.com/nostr-protocol/nips/blob/master/04.md
- **Nostr Tools:** https://github.com/nbd-wtf/nostr-tools

---

## 💡 Conclusión

**TurboZaps MVP usa un enfoque híbrido pragmático:**

1. ✅ **Productos en NostrMarket** (descentralizados)
2. ⚠️ **Órdenes locales** (centralizadas pero funcionales)
3. ✅ **Invoices Lightning** (descentralizados)
4. ✅ **Chat via Nostr** (descentralizado)
5. ✅ **Escrow local** (controlado)

**Resultado:** Un sistema funcional que demuestra el concepto de escrow Lightning P2P, listo para evolucionar hacia descentralización completa en el futuro.

---

**Última actualización:** 12 de noviembre, 2025  
**Equipo:** TurboZaps ⚡  
**Estado:** MVP Funcional - NIP-15 completo en roadmap

