# Catálogos de Status - Documentación

## 📊 Resumen

Se han creado dos catálogos completos para gestionar los estados de **órdenes** y **pagos** en el sistema de e-commerce MultiLlantasOnline.

---

## 🗄️ Base de Datos

### Tabla: `cat_status_ordenes`

**Estructura:**
- `idStatusOrden` (INT, PK, AUTO_INCREMENT)
- `codigo` (VARCHAR(50), UNIQUE) - Código del status
- `nombre` (VARCHAR(100)) - Nombre en español
- `descripcion` (TEXT) - Descripción detallada
- `color` (VARCHAR(20)) - Color para UI
- `orden` (INT) - Orden de visualización
- `activo` (BOOLEAN) - Status activo/inactivo
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Valores iniciales:**
| Código | Nombre | Descripción | Color |
|--------|--------|-------------|-------|
| PENDIENTE | Pendiente | Orden creada, esperando confirmación de pago | yellow |
| PAGADA | Pagada | Pago confirmado y procesado exitosamente | blue |
| EN_PROCESO | En Proceso | Orden en preparación para envío | orange |
| ENVIADA | Enviada | Orden despachada y en tránsito | purple |
| ENTREGADA | Entregada | Orden entregada al cliente | green |
| CANCELADA | Cancelada | Orden cancelada por el cliente o sistema | red |
| DEVUELTA | Devuelta | Orden devuelta por el cliente | gray |
| REEMBOLSADA | Reembolsada | Orden con reembolso procesado | cyan |

---

### Tabla: `cat_status_pagos`

**Estructura:**
- `idStatusPago` (INT, PK, AUTO_INCREMENT)
- `codigo` (VARCHAR(50), UNIQUE) - Código del status
- `nombre` (VARCHAR(100)) - Nombre en español
- `descripcion` (TEXT) - Descripción detallada
- `color` (VARCHAR(20)) - Color para UI
- `orden` (INT) - Orden de visualización
- `activo` (BOOLEAN) - Status activo/inactivo
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

**Valores iniciales:**
| Código | Nombre | Descripción | Color |
|--------|--------|-------------|-------|
| PENDIENTE | Pendiente | Pago iniciado, esperando confirmación | yellow |
| APROBADO | Aprobado | Pago aprobado y confirmado | green |
| EN_PROCESO | En Proceso | Pago en proceso de verificación | blue |
| RECHAZADO | Rechazado | Pago rechazado por la entidad financiera | red |
| CANCELADO | Cancelado | Pago cancelado por el usuario o sistema | orange |
| REEMBOLSADO | Reembolsado | Pago reembolsado al cliente | purple |
| EXPIRADO | Expirado | Pago expirado por tiempo de espera | gray |
| EN_MEDIACION | En Mediación | Pago en proceso de mediación o disputa | cyan |

---

## 💻 Frontend (Angular/TypeScript)

### Archivos creados:

**`Front/MultiLlantasOnline/src/app/shared/ENUMS/StatusOrden.ts`**
- Enum `StatusOrden`
- Interface `CatStatusOrden`
- Helpers: `StatusOrdenColors`, `StatusOrdenLabels`, `StatusOrdenDescriptions`
- Funciones útiles:
  - `getStatusOrdenLabel(status)`
  - `getStatusOrdenColor(status)`
  - `puedeSerCancelada(status)`
  - `puedeSerDevuelta(status)`
  - `esStatusFinal(status)`

**`Front/MultiLlantasOnline/src/app/shared/ENUMS/StatusPago.ts`**
- Enum `StatusPago`
- Interface `CatStatusPago`
- Helpers: `StatusPagoColors`, `StatusPagoLabels`, `StatusPagoDescriptions`
- Funciones útiles:
  - `getStatusPagoLabel(status)`
  - `getStatusPagoColor(status)`
  - `esPagoExitoso(status)`
  - `esPagoFallido(status)`
  - `estaPagoEnProceso(status)`
  - `puedeSerReembolsado(status)`

### Ejemplo de uso en componentes:

```typescript
import { StatusOrden, getStatusOrdenLabel, getStatusOrdenColor } from '@shared/ENUMS/StatusOrden';
import { StatusPago, esPagoExitoso } from '@shared/ENUMS/StatusPago';

// Uso en componente
export class OrdenesComponent {
  orden = {
    status: StatusOrden.PAGADA,
    pago: {
      status: StatusPago.APROBADO
    }
  };

  getStatusLabel(): string {
    return getStatusOrdenLabel(this.orden.status);
  }

  getStatusColor(): string {
    return getStatusOrdenColor(this.orden.status);
  }

  isPagoExitoso(): boolean {
    return esPagoExitoso(this.orden.pago.status);
  }
}
```

---

## 🔙 Backend (Node.js)

### Archivo actualizado:

**`Back/utils/constantes.js`**

Añadidos:
```javascript
STATUS_ORDEN: {
    PENDIENTE: 'PENDIENTE',
    PAGADA: 'PAGADA',
    EN_PROCESO: 'EN_PROCESO',
    ENVIADA: 'ENVIADA',
    ENTREGADA: 'ENTREGADA',
    CANCELADA: 'CANCELADA',
    DEVUELTA: 'DEVUELTA',
    REEMBOLSADA: 'REEMBOLSADA'
}

STATUS_PAGO: {
    PENDIENTE: 'PENDIENTE',
    APROBADO: 'APROBADO',
    EN_PROCESO: 'EN_PROCESO',
    RECHAZADO: 'RECHAZADO',
    CANCELADO: 'CANCELADO',
    REEMBOLSADO: 'REEMBOLSADO',
    EXPIRADO: 'EXPIRADO',
    EN_MEDIACION: 'EN_MEDIACION'
}
```

### Ejemplo de uso en controllers:

```javascript
const { STATUS_ORDEN, STATUS_PAGO } = require('../utils/constantes');

// Crear orden
orden.status = STATUS_ORDEN.PENDIENTE;

// Actualizar pago
if (pagoAprobado) {
    pago.status = STATUS_PAGO.APROBADO;
    orden.status = STATUS_ORDEN.PAGADA;
}

// Verificar cancelación
if (orden.status === STATUS_ORDEN.PENDIENTE || orden.status === STATUS_ORDEN.PAGADA) {
    // Permitir cancelación
}
```

---

## 🚀 Instalación

### 1. Ejecutar migraciones de base de datos

**Opción A: Usando Node.js (Recomendado)**
```bash
cd Back
node database/migrations/runMigrations.js
```

**Opción B: Usando MySQL CLI**
```bash
cd Back/database/migrations
mysql -u tu_usuario -p tu_base_de_datos < run_migrations.sql
```

### 2. Importar enums en módulos Angular

En tu `material.module.ts` o donde corresponda:
```typescript
export * from './ENUMS/StatusOrden';
export * from './ENUMS/StatusPago';
```

---

## 🔍 Verificación

Después de ejecutar las migraciones, verifica:

```sql
-- Ver todos los status de órdenes
SELECT * FROM cat_status_ordenes ORDER BY orden;

-- Ver todos los status de pagos
SELECT * FROM cat_status_pagos ORDER BY orden;

-- Contar registros
SELECT 'Órdenes' as Tabla, COUNT(*) as Total FROM cat_status_ordenes
UNION ALL
SELECT 'Pagos' as Tabla, COUNT(*) as Total FROM cat_status_pagos;
```

---

## 📝 Flujos de Estado

### Flujo típico de una orden:
```
PENDIENTE → PAGADA → EN_PROCESO → ENVIADA → ENTREGADA
     ↓
  CANCELADA
```

### Flujo típico de un pago:
```
PENDIENTE → EN_PROCESO → APROBADO
     ↓            ↓
CANCELADO    RECHAZADO
     ↓
 EXPIRADO
```

---

## 🛠️ Mantenimiento

### Agregar nuevo status de orden:
```sql
INSERT INTO cat_status_ordenes (codigo, nombre, descripcion, color, orden, activo) 
VALUES ('NUEVO_STATUS', 'Nuevo Status', 'Descripción', 'color', 10, TRUE);
```

Luego actualizar el enum en TypeScript:
```typescript
export enum StatusOrden {
  // ... existentes
  NUEVO_STATUS = 'NUEVO_STATUS'
}
```

Y en JavaScript:
```javascript
STATUS_ORDEN: {
    // ... existentes
    NUEVO_STATUS: 'NUEVO_STATUS'
}
```

---

## ✅ Beneficios

1. **Consistencia**: Valores únicos y centralizados
2. **Mantenibilidad**: Un solo lugar para actualizar
3. **Type Safety**: TypeScript valida en tiempo de compilación
4. **Internacionalización**: Fácil traducir desde los labels
5. **UI Consistente**: Colores estandarizados
6. **Validaciones**: Funciones helper para lógica de negocio
7. **Reportes**: Filtros y agrupaciones estandarizadas

---

## 📞 Notas Finales

- Los códigos en la BD están en MAYÚSCULAS y sin espacios
- Los nombres están en español para UI
- Los colores son sugerencias, ajústalos según tu theme
- Todas las funciones helper tienen validaciones incorporadas
- Los enums son compatibles con Sequelize y TypeORM
