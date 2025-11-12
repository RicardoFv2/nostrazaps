# 🎬 Script de Demo - TurboZaps Hackathón

## 🎯 Pitch (30 segundos)

> **"TurboZaps resuelve el problema de confianza en compras P2P usando Lightning Network como escrow automático."**
>
> Imagina comprar un producto usado a un desconocido. ¿Cómo sabes que te enviará el producto después de pagar? Con TurboZaps:
> 1. Pagas → Dinero queda en escrow
> 2. Chatean → Coordinan entrega
> 3. Confirmas → Dinero se libera al vendedor
>
> Todo con Lightning (instantáneo) y Nostr (descentralizado).

---

## 📱 Demo en Vivo (4 minutos)

### 🟢 Paso 1: Vendedor publica producto (60 seg)

**Narración:**
> "Soy un vendedor que quiere vender mi celular usado."

**Acciones:**
1. Abrir `http://localhost:3000/select-role`
2. Click en "Vendedor"
3. En registro:
   - Click en "Generar claves" (automático)
   - Nombre: "Tienda de Ricardo"
   - About: "Vendo electrónicos usados"
   - Click "Crear Perfil de Comerciante"

**Mostrar:**
- ✅ "Perfil de comerciante creado exitosamente"
- Redirige a `/sell`

4. En `/sell`:
   - Click "Nuevo Producto"
   - Nombre: "iPhone 13 Pro"
   - Descripción: "Como nuevo, 256GB"
   - Precio: 1000000 sats (~$300)
   - Categoría: "Artículos de segunda mano"
   - Click "Publicar Producto"

**Mostrar:**
- ✅ Producto aparece en la lista
- Explicar: "Este producto ahora está en NostrMarket, visible para todos"

---

### 🔵 Paso 2: Comprador encuentra y compra (90 seg)

**Narración:**
> "Ahora soy un comprador buscando un iPhone usado."

**Acciones:**
1. **Nueva pestaña/ventana** (simular otro usuario)
2. Abrir `http://localhost:3000/select-role`
3. Click en "Comprador"
4. En registro:
   - Click en "Generar clave"
   - Nombre: "María López"
   - Click "Crear Perfil de Comprador"

**Mostrar:**
- ✅ "Perfil de comprador creado exitosamente"
- Redirige a `/marketplace`

5. Ver producto "iPhone 13 Pro"
6. Click en el producto → Ver detalle
7. Click "Comprar con Lightning ⚡"

**Mostrar:**
- 💳 Modal de pago Lightning
- QR Code
- Monto: 1,000,000 sats
- Invoice para copiar
- Mensaje: "Tu dinero está asegurado"

**Explicar:**
> "En una demo real, escanearía este QR con mi billetera Lightning. 
> Para esta demo, simularé que ya pagué."

8. Click "Ya pagué ✓"

**Mostrar:**
- ✅ Estado cambia a "Pago en escrow (asegurado)"
- 💬 Aparece chat de negociación

---

### 💬 Paso 3: Chat y negociación (60 seg)

**Narración:**
> "Ahora comprador y vendedor pueden coordinar la entrega de forma segura."

**Acciones (Ventana del Comprador):**
1. En el chat, escribir: "Hola, ¿cuándo puedes enviar el iPhone?"
2. Click enviar

**Cambiar a ventana del Vendedor:**
1. Ir a `/dashboard/seller`
2. Ver transacción en escrow
3. Click "Ver" en la transacción
4. En el chat, escribir: "¡Hola! Lo envío mañana. ¿A qué dirección?"

**Cambiar a ventana del Comprador:**
5. Responder: "Calle Principal #123, San Salvador"

**Cambiar a ventana del Vendedor:**
6. Responder: "Perfecto. Te envío el tracking mañana."

**Mostrar:**
- 💬 Mensajes aparecen en tiempo real
- 🟡 Badge "Pago en escrow (asegurado)"
- Explicar: "Los mensajes van vía Nostr (P2P, descentralizado)"

---

### ✅ Paso 4: Liberar fondos (30 seg)

**Narración:**
> "Pasan unos días... María recibe el iPhone y confirma que todo está bien."

**Acciones (Ventana del Comprador):**
1. En el chat, escribir: "¡Recibido! Muchas gracias"
2. Click "Confirmar entrega" (botón verde)
3. En el dialog: Click "Confirmar entrega"

**Mostrar:**
- ✅ Estado cambia a "Pago liberado al vendedor"
- ✅ Mensaje: "Transacción completada exitosamente"
- 💰 El vendedor ahora tiene los fondos

**Explicar:**
> "Los 1,000,000 sats se transfirieron al vendedor en este momento.
> Esto es Lightning + escrow programático. Sin intermediarios, sin bancos."

---

## 🎯 Cierre (30 segundos)

**Narración:**
> **"Esto es TurboZaps:"**
> - ⚡ Pagos Lightning instantáneos
> - 🔐 Escrow automático sin confianza
> - 💬 Chat P2P descentralizado vía Nostr
> - 🌎 Ideal para mercados informales en LATAM
>
> **El futuro del comercio P2P: rápido, seguro, sin bancos.**

---

## 💡 Preguntas Frecuentes (Preparación)

### P: ¿Qué pasa si el vendedor no envía el producto?
**R:** El comprador no confirma la entrega. El vendedor puede optar por cancelar y devolver los fondos, o se puede implementar un sistema de arbitraje.

### P: ¿Esto funciona solo con Lightning?
**R:** Sí, porque Lightning es instantáneo y programable. Bitcoin onchain sería muy lento para este caso de uso.

### P: ¿Necesito instalar LNbits?
**R:** Para producción sí, o puedes usar demo.lnbits.com. Es el backend que gestiona los escrows.

### P: ¿Los mensajes son privados?
**R:** Sí, van cifrados vía Nostr (NIP-04). Solo comprador y vendedor pueden leerlos.

### P: ¿Cuánto cuesta usar TurboZaps?
**R:** Solo pagas fees de Lightning Network (normalmente < 1 sat). No hay comisiones adicionales.

### P: ¿Qué pasa si ambos pierden conexión?
**R:** Todo está en NostrMarket (descentralizado). Pueden reconectar y continuar donde quedaron.

---

## 🎨 Tips de Presentación

### Visual
- ✅ Usa dos ventanas lado a lado (comprador y vendedor)
- ✅ Zoom a los elementos importantes (QR, chat, botones)
- ✅ Prepara productos de ejemplo con buenas imágenes

### Timing
- ⏱️ Practica varias veces para quedarte en 5 minutos
- ⏱️ Ten un "fast path" si vas corto de tiempo (saltar el chat)
- ⏱️ Ten historias de respaldo si algo falla

### Storytelling
- 🎭 Habla en primera persona ("Soy un vendedor...")
- 🎭 Usa casos reales ("Vender un celular usado")
- 🎭 Enfatiza los momentos "wow" (invoice, escrow, liberación)

### Backup Plan
- 💾 Ten screenshots/video pregrabado por si falla la demo live
- 💾 Ten productos ya creados como respaldo
- 💾 Ten orden de prueba en varios estados

---

## ✅ Checklist Pre-Demo

**1 hora antes:**
- [ ] Servidor corriendo (`pnpm dev`)
- [ ] LNbits funcionando
- [ ] Base de datos limpia
- [ ] Navegador con dos ventanas/perfiles preparados

**30 minutos antes:**
- [ ] Practicar el flujo completo 1 vez
- [ ] Verificar que todos los endpoints respondan
- [ ] Cargar imágenes de productos

**5 minutos antes:**
- [ ] Cerrar tabs innecesarias
- [ ] Zoom al 125% para que se vea bien
- [ ] Tener la URL inicial lista
- [ ] Respirar profundo 😊

---

## 🎉 ¡Éxito!

**Recuerda el mensaje clave:**
> "Pagos instantáneos, confianza sin bancos. ⚡"

¡Buena suerte en el hackathón! 🚀

