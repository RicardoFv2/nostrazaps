# TurboZaps Local Testing Script

Script de testing local para verificar todos los endpoints del backend sin requerir un frontend.

## 📋 Requisitos

1. **Servidor Next.js corriendo**: El script necesita que el servidor de desarrollo esté ejecutándose
   ```bash
   pnpm dev
   ```

2. **Variables de entorno**: Asegúrate de tener un archivo `.env.local` con:
   ```env
   LNBITS_URL=https://demo.lnbits.com
   LNBITS_API_KEY=your_api_key_here
   DATABASE_URL=./turbozaps.db
   ```

3. **Dependencias instaladas**:
   ```bash
   pnpm install
   ```

## 🚀 Ejecución

### Opción 1: Usando el script npm (recomendado)
```bash
pnpm test:local
```

### Opción 2: Usando tsx directamente
```bash
npx tsx scripts/test-local.ts
```

### Opción 3: Usando ts-node (alternativa)
```bash
npx ts-node scripts/test-local.ts
```

## 🧪 Tests Incluidos

El script ejecuta los siguientes tests en orden:

1. **Create Product** - Crea un producto de prueba
2. **Get Products List** - Obtiene la lista de productos
3. **Create Order** - Crea una orden con escrow Lightning
4. **Get Orders List** - Obtiene la lista de órdenes
5. **Check Order Status** - Verifica el estado de una orden
6. **Send Message** - Envía un mensaje entre buyer y seller
7. **Release Funds** - Intenta liberar fondos del escrow (puede fallar si la orden no está pagada)
8. **Refund Order** - Intenta reembolsar una orden (puede fallar si ya fue procesada)

## 📊 Salida Esperada

El script mostrará:

- ✅/❌ Estado de cada test
- 📝 Logs detallados de cada request/response
- ⏱️ Duración de cada test
- 📈 Resumen final con estadísticas
- 🔌 Información de conexión LNbits

## ⚙️ Configuración

Puedes configurar la URL base de la API usando la variable de entorno:

```bash
API_BASE_URL=http://localhost:3000 pnpm test:local
```

Por defecto usa `http://localhost:3000`.

## ⚠️ Notas

- Algunos tests pueden fallar si los prerequisitos no se cumplen (ej: orden no pagada para release)
- Los tests crean datos de prueba en la base de datos
- El script verifica la conectividad con la API antes de ejecutar los tests
- Los tests tienen un timeout de 30 segundos por defecto

## 🐛 Troubleshooting

### Error: "API is not accessible"
- Asegúrate de que el servidor Next.js esté corriendo (`pnpm dev`)
- Verifica que el puerto 3000 esté disponible
- Revisa que no haya errores en el servidor

### Error: "LNBITS_API_KEY is not set"
- Crea un archivo `.env.local` en la raíz del proyecto
- Agrega tu API key de LNbits
- Los tests de integración con LNbits pueden fallar sin esto

### Error: "Test timeout"
- Algunos tests pueden tardar más si LNbits está lento
- Aumenta el timeout en el script si es necesario
- Verifica tu conexión a internet

