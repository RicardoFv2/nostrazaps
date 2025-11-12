# 📚 TurboZaps - Índice de Documentación

> Guía completa de toda la documentación del proyecto

---

## 🚀 Para Empezar

### Para Desarrolladores

1. **[README.md](./README.md)** 📖
   - Introducción al proyecto
   - Características principales
   - Instalación y configuración
   - Stack tecnológico

2. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ⚡
   - Comandos rápidos
   - URLs principales
   - API endpoints
   - Variables de entorno
   - Debugging tips

### Para Usuarios

1. **[README_FLUJO.md](./README_FLUJO.md)** 👥
   - Flujo de usuario completo
   - Guía paso a paso
   - Interfaces y pantallas
   - Casos de uso

2. **[DEMO_SCRIPT.md](./DEMO_SCRIPT.md)** 🎬
   - Script para presentación
   - Timing y secuencia
   - Tips de presentación
   - Q&A preparadas

---

## 📐 Arquitectura y Diseño

### Arquitectura Técnica

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** 🏗️
   - Diagramas del sistema
   - Flujo de datos
   - Componentes principales
   - Esquema de base de datos
   - Endpoints LNbits
   - Consideraciones de escalabilidad

### Flujo Completo

1. **[FLUJO_COMPLETO.md](./FLUJO_COMPLETO.md)** 🔄
   - Flujo técnico detallado
   - Endpoints implementados
   - Estados de orden
   - Variables de entorno
   - Características del escrow

---

## 🔌 API y Backend

### API Reference

1. **[docs/api.md](./docs/api.md)** 📡
   - Documentación completa API LNbits
   - Base URL y autenticación
   - Endpoints de merchants, stalls, products
   - Endpoints de orders, messages, customers
   - Ejemplos de uso
   - Notas importantes

### Implementación

1. **[lib/lnbits.ts](./lib/lnbits.ts)** 💻
   - Wrapper de la API LNbits
   - Funciones helper
   - Manejo de errores
   - Logging

2. **[lib/db.ts](./lib/db.ts)** 🗄️
   - Gestión de SQLite
   - Queries principales
   - Migraciones

---

## 📊 Estado del Proyecto

### Estado Actual

1. **[STATUS.md](./STATUS.md)** ✅
   - Funcionalidades implementadas
   - Estructura del proyecto
   - Flujo completo
   - Componentes frontend
   - Estados de orden
   - Testing realizado
   - Próximos pasos

### Planificación

1. **[SPRINTS.MD](./SPRINTS.MD)** 📅
   - Sprints del hackathón
   - Tareas completadas
   - Roadmap futuro

2. **[AGENTS.md](./AGENTS.md)** 👥
   - Roles del equipo
   - Responsabilidades
   - Flujo de trabajo
   - Colaboración

---

## 🎯 Por Caso de Uso

### Quiero entender el proyecto

```
1. README.md → Introducción general
2. FLUJO_COMPLETO.md → Entender el flujo técnico
3. ARCHITECTURE.md → Ver la arquitectura
4. STATUS.md → Ver el estado actual
```

### Quiero desarrollar

```
1. README.md → Instalación
2. QUICK_REFERENCE.md → Comandos y APIs
3. docs/api.md → API LNbits
4. ARCHITECTURE.md → Arquitectura técnica
```

### Quiero hacer una demo

```
1. DEMO_SCRIPT.md → Script de presentación
2. README_FLUJO.md → Flujo de usuario
3. STATUS.md → Features implementadas
4. QUICK_REFERENCE.md → URLs y comandos
```

### Quiero probar el sistema

```
1. README.md → Instalación
2. README_FLUJO.md → Flujo de usuario
3. QUICK_REFERENCE.md → URLs y debugging
4. STATUS.md → Features disponibles
```

### Quiero integrar LNbits

```
1. docs/api.md → Referencia completa API
2. lib/lnbits.ts → Implementación
3. ARCHITECTURE.md → Flujo de datos
4. QUICK_REFERENCE.md → Variables de entorno
```

---

## 📝 Documentos por Categoría

### 📖 Introducción y Onboarding
- [README.md](./README.md)
- [README_FLUJO.md](./README_FLUJO.md)
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 🆘

### 🏗️ Arquitectura y Diseño
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [FLUJO_COMPLETO.md](./FLUJO_COMPLETO.md)

### 🔌 API y Backend
- [docs/api.md](./docs/api.md)
- [NOSTRMARKET_ORDERS.md](./NOSTRMARKET_ORDERS.md) 🛒
- [lib/lnbits.ts](./lib/lnbits.ts)
- [lib/db.ts](./lib/db.ts)

### 📊 Estado y Planificación
- [STATUS.md](./STATUS.md)
- [SPRINTS.MD](./SPRINTS.MD)
- [AGENTS.md](./AGENTS.md)

### 🎬 Demo y Presentación
- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)

---

## 🔍 Buscar Información

### Conceptos Clave

| Concepto | Documentos |
|----------|-----------|
| **Escrow** | FLUJO_COMPLETO.md, ARCHITECTURE.md, docs/api.md |
| **Lightning Network** | README.md, ARCHITECTURE.md, docs/api.md |
| **Nostr** | FLUJO_COMPLETO.md, ARCHITECTURE.md, docs/api.md |
| **Merchants** | README_FLUJO.md, docs/api.md, QUICK_REFERENCE.md |
| **Buyers** | README_FLUJO.md, docs/api.md, QUICK_REFERENCE.md |
| **Chat P2P** | FLUJO_COMPLETO.md, ARCHITECTURE.md |
| **API LNbits** | docs/api.md, lib/lnbits.ts, ARCHITECTURE.md |
| **Instalación** | README.md, QUICK_REFERENCE.md |
| **Configuración** | README.md, QUICK_REFERENCE.md, STATUS.md |

### Endpoints

| Endpoint | Documentos |
|----------|-----------|
| `/api/merchants` | docs/api.md, QUICK_REFERENCE.md, ARCHITECTURE.md |
| `/api/products` | docs/api.md, QUICK_REFERENCE.md, ARCHITECTURE.md |
| `/api/orders` | docs/api.md, QUICK_REFERENCE.md, ARCHITECTURE.md |
| `/api/chat` | docs/api.md, QUICK_REFERENCE.md, ARCHITECTURE.md |

### Componentes

| Componente | Documentos |
|-----------|-----------|
| `ProductDetail` | ARCHITECTURE.md, FLUJO_COMPLETO.md |
| `LightningPaymentModal` | ARCHITECTURE.md, FLUJO_COMPLETO.md |
| `EscrowChat` | ARCHITECTURE.md, FLUJO_COMPLETO.md |
| `ProductForm` | FLUJO_COMPLETO.md, README_FLUJO.md |

---

## 📚 Orden de Lectura Recomendado

### Para Nuevos Desarrolladores

```
Día 1: Entender el proyecto
├─ README.md (15 min)
├─ STATUS.md (10 min)
└─ FLUJO_COMPLETO.md (20 min)

Día 2: Setup y desarrollo
├─ README.md → Instalación (30 min)
├─ QUICK_REFERENCE.md (15 min)
└─ docs/api.md (30 min)

Día 3: Arquitectura profunda
├─ ARCHITECTURE.md (45 min)
├─ lib/lnbits.ts (código) (30 min)
└─ Probar el sistema (60 min)
```

### Para Presentación del Hackathón

```
1 hora antes:
├─ DEMO_SCRIPT.md (revisar)
├─ STATUS.md (features)
└─ README_FLUJO.md (flujo visual)

Durante la demo:
├─ Seguir DEMO_SCRIPT.md
└─ QUICK_REFERENCE.md (URLs)

Q&A:
├─ STATUS.md (features)
├─ ARCHITECTURE.md (técnico)
└─ FLUJO_COMPLETO.md (detalles)
```

---

## 🗂️ Estructura de Archivos

```
turbozaps/
├── README.md ★★★★★           # Entrada principal
├── DOCS_INDEX.md ★★★★☆       # Este archivo
├── STATUS.md ★★★★☆           # Estado actual
├── QUICK_REFERENCE.md ★★★★☆  # Referencia rápida
├── FLUJO_COMPLETO.md ★★★★☆   # Flujo técnico
├── ARCHITECTURE.md ★★★☆☆     # Arquitectura
├── README_FLUJO.md ★★★★☆     # Flujo usuario
├── DEMO_SCRIPT.md ★★★★★      # Script demo
├── SPRINTS.MD ★★☆☆☆          # Planificación
├── AGENTS.md ★★☆☆☆           # Roles equipo
└── docs/
    └── api.md ★★★★★          # API Reference

Leyenda:
★★★★★ Esencial
★★★★☆ Muy importante
★★★☆☆ Importante
★★☆☆☆ Opcional
```

---

## 💡 Tips de Navegación

### Buscar Información Específica

1. **Ctrl+F / Cmd+F** en cada documento
2. Usar la tabla "Buscar Información" arriba
3. Seguir los enlaces entre documentos

### Actualizar Documentación

1. Editar el documento correspondiente
2. Actualizar `DOCS_INDEX.md` si es necesario
3. Mantener coherencia entre documentos

### Crear Nueva Documentación

1. Seguir el formato de los existentes
2. Agregar a `DOCS_INDEX.md`
3. Enlazar desde otros documentos relevantes

---

## 📞 Contacto y Soporte

### Equipo TurboZaps

- **Ricardo Fuentes** - Arquitectura y desarrollo
- *(Agregar más colaboradores)*

### Links Útiles

- GitHub: [github.com/turbozaps](https://github.com/turbozaps)
- Demo: [turbozaps.com](https://turbozaps.com)
- LNbits: [demo.lnbits.com](https://demo.lnbits.com)
- Nostr: [nostr.com](https://nostr.com)

---

## 📅 Última Actualización

**Fecha:** 12 de noviembre, 2025  
**Versión:** MVP 1.0  
**Estado:** Completo para hackathón

---

<div align="center">

**⚡ TurboZaps**

*Pagos instantáneos, confianza sin bancos.*

[Inicio](./README.md) • [Demo](./DEMO_SCRIPT.md) • [API](./docs/api.md)

</div>

