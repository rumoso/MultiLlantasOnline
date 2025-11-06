# Endpoint: Reporte de Movimientos de Caja

## Descripción
Endpoint para obtener un reporte detallado de los movimientos de dinero en caja, con capacidades de filtrado avanzado y totales calculados.

## Información del Endpoint

**URL:** `POST /api/reportes/repMovimientosCaja`

**Método:** POST

**Content-Type:** application/json

## Parámetros de Entrada

### Parámetros del Body (JSON)

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|----------|
| `startDate` | string | No | Fecha de inicio (YYYY-MM-DD) | "2024-01-01" |
| `endDate` | string | No | Fecha de fin (YYYY-MM-DD) | "2024-01-31" |
| `idCaja` | number | No | ID de la caja específica (0 = todas) | 1 |
| `idUser` | number | No | ID del usuario (0 = todos) | 5 |
| `idCatMovimiento` | number | No | ID de categoría de movimiento (0 = todas) | 2 |
| `tipo` | string | No | Tipo de movimiento: "INGRESO" o "EGRESO" | "INGRESO" |
| `idFormaPago` | number | No | ID de forma de pago (0 = todas) | 1 |
| `idTurnoCaja` | number | No | ID del turno de caja (0 = todos) | 3 |
| `limiter` | number | No | Número de registros por página | 10 |
| `start` | number | No | Registro inicial para paginación | 0 |
| `idUserLogON` | number | Sí | ID del usuario autenticado | 1 |

## Ejemplos de Uso

### 1. Obtener todos los movimientos (sin filtros)

```javascript
const response = await fetch('/api/reportes/repMovimientosCaja', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    idUserLogON: 1,
    limiter: 20,
    start: 0
  })
});

const data = await response.json();
```

### 2. Filtrar por rango de fechas y tipo de movimiento

```javascript
const response = await fetch('/api/reportes/repMovimientosCaja', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    tipo: "INGRESO",
    idUserLogON: 1,
    limiter: 50,
    start: 0
  })
});

const data = await response.json();
```

### 3. Filtrar por caja específica y usuario

```javascript
const response = await fetch('/api/reportes/repMovimientosCaja', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    idCaja: 2,
    idUser: 5,
    idCatMovimiento: 1,
    idUserLogON: 1,
    limiter: 25,
    start: 0
  })
});

const data = await response.json();
```

## Estructura de Respuesta

### Respuesta Exitosa (status: 0)

```json
{
  "status": 0,
  "message": "Ejecutado correctamente.",
  "data": {
    "count": 150,
    "rows": [
      {
        "idmovimientoscaja": 1,
        "fecha": "2024-01-15 10:30:00",
        "tipo": "INGRESO",
        "monto": "500.00",
        "observaciones": "Venta de productos",
        "idcajas": 1,
        "idUser": 3,
        "idturnoscaja": 5,
        "idformaspago": 1,
        "idcatmovimientos": 2,
        "categoria_descripcion": "Ventas",
        "categoria_tipo": "INGRESO",
        "usuario_nombre": "Juan Pérez",
        "caja_nombre": "Caja Principal",
        "forma_pago_descripcion": "Efectivo"
      },
      {
        "idmovimientoscaja": 2,
        "fecha": "2024-01-15 11:45:00",
        "tipo": "EGRESO",
        "monto": "150.00",
        "observaciones": "Compra de insumos",
        "idcajas": 1,
        "idUser": 3,
        "idturnoscaja": 5,
        "idformaspago": 1,
        "idcatmovimientos": 3,
        "categoria_descripcion": "Gastos operativos",
        "categoria_tipo": "EGRESO",
        "usuario_nombre": "Juan Pérez",
        "caja_nombre": "Caja Principal",
        "forma_pago_descripcion": "Efectivo"
      }
    ],
    "totales": {
      "total_ingresos": 12500.00,
      "total_egresos": 3200.00,
      "saldo_neto": 9300.00,
      "cantidad_ingresos": 85,
      "cantidad_egresos": 65,
      "total_movimientos": 150
    }
  }
}
```

### Respuesta de Error (status: 2)

```json
{
  "status": 2,
  "message": "Sucedió un error inesperado",
  "data": "Error message details"
}
```

## Campos de Respuesta Detallados

### Objeto `rows` (Array de movimientos)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idmovimientoscaja` | number | ID único del movimiento |
| `fecha` | string | Fecha y hora del movimiento (YYYY-MM-DD HH:mm:ss) |
| `tipo` | string | Tipo de movimiento: "INGRESO" o "EGRESO" |
| `monto` | string | Monto del movimiento (decimal) |
| `observaciones` | string | Observaciones del movimiento |
| `idcajas` | number | ID de la caja |
| `idUser` | number | ID del usuario que realizó el movimiento |
| `idturnoscaja` | number | ID del turno de caja |
| `idformaspago` | number | ID de la forma de pago |
| `idcatmovimientos` | number | ID de la categoría de movimiento |
| `categoria_descripcion` | string | Descripción de la categoría |
| `categoria_tipo` | string | Tipo de la categoría |
| `usuario_nombre` | string | Nombre del usuario |
| `caja_nombre` | string | Nombre de la caja |
| `forma_pago_descripcion` | string | Descripción de la forma de pago |

### Objeto `totales`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total_ingresos` | number | Suma total de todos los ingresos |
| `total_egresos` | number | Suma total de todos los egresos |
| `saldo_neto` | number | Diferencia entre ingresos y egresos |
| `cantidad_ingresos` | number | Número total de movimientos de ingreso |
| `cantidad_egresos` | number | Número total de movimientos de egreso |
| `total_movimientos` | number | Número total de movimientos |

## Códigos de Estado

| Status | Descripción |
|--------|-------------|
| 0 | Éxito - Datos obtenidos correctamente |
| 2 | Error - Ocurrió un error inesperado |

## Implementación en Frontend

### Función Reutilizable (JavaScript/TypeScript)

```javascript
/**
 * Obtiene el reporte de movimientos de caja
 * @param {Object} filters - Filtros para la consulta
 * @param {string} filters.startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} filters.endDate - Fecha fin (YYYY-MM-DD)
 * @param {number} filters.idCaja - ID de caja (0 = todas)
 * @param {number} filters.idUser - ID de usuario (0 = todos)
 * @param {number} filters.idCatMovimiento - ID categoría (0 = todas)
 * @param {string} filters.tipo - Tipo: "INGRESO", "EGRESO" o ""
 * @param {number} filters.idFormaPago - ID forma pago (0 = todas)
 * @param {number} filters.idTurnoCaja - ID turno (0 = todos)
 * @param {number} filters.limiter - Registros por página
 * @param {number} filters.start - Registro inicial
 * @param {number} idUserLogON - ID usuario autenticado
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function getMovimientosCajaReport(filters = {}, idUserLogON) {
  const defaultFilters = {
    startDate: null,
    endDate: null,
    idCaja: 0,
    idUser: 0,
    idCatMovimiento: 0,
    tipo: '',
    idFormaPago: 0,
    idTurnoCaja: 0,
    limiter: 10,
    start: 0
  };

  const requestBody = {
    ...defaultFilters,
    ...filters,
    idUserLogON
  };

  try {
    const response = await fetch('/api/reportes/repMovimientosCaja', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (data.status === 0) {
      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } else {
      return {
        success: false,
        error: data.message,
        data: data.data
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Error de conexión',
      data: null
    };
  }
}

// Función auxiliar para obtener el token (implementar según tu sistema de auth)
function getAuthToken() {
  // Implementar según tu sistema de autenticación
  return localStorage.getItem('authToken') || '';
}
```

### Ejemplo de Uso en React/Angular

```javascript
// Ejemplo de uso
async function loadMovimientosData() {
  const filters = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    tipo: 'INGRESO',
    limiter: 50,
    start: 0
  };

  const result = await getMovimientosCajaReport(filters, currentUserId);
  
  if (result.success) {
    console.log('Movimientos:', result.data.rows);
    console.log('Totales:', result.data.totales);
    console.log('Total registros:', result.data.count);
  } else {
    console.error('Error:', result.error);
  }
}
```

## Notas Importantes

1. **Paginación**: Utiliza `limiter` y `start` para implementar paginación en el frontend
2. **Filtros Opcionales**: Todos los filtros son opcionales, envía solo los que necesites
3. **Fechas**: Las fechas deben enviarse en formato YYYY-MM-DD
4. **Autenticación**: Asegúrate de incluir el token de autenticación en los headers
5. **Totales**: Los totales se calculan sobre todos los registros que coinciden con los filtros, no solo los de la página actual
6. **Performance**: Para grandes volúmenes de datos, considera implementar filtros más específicos

## Casos de Uso Comunes

- **Dashboard de caja**: Mostrar resumen de movimientos del día actual
- **Reporte mensual**: Filtrar por mes específico y mostrar totales
- **Auditoría por usuario**: Filtrar movimientos de un usuario específico
- **Análisis por categoría**: Agrupar movimientos por tipo de categoría
- **Conciliación de caja**: Verificar movimientos de una caja específica en un turno