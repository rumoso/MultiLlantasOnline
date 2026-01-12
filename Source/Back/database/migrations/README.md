# Migraciones de Base de Datos

Este directorio contiene los scripts de migración para crear las tablas de catálogos del sistema.

## 📋 Migraciones Disponibles

### 001_create_cat_status_ordenes.sql
Crea la tabla `cat_status_ordenes` con los siguientes estados:
- **PENDIENTE**: Orden creada, esperando confirmación de pago
- **PAGADA**: Pago confirmado y procesado exitosamente
- **EN_PROCESO**: Orden en preparación para envío
- **ENVIADA**: Orden despachada y en tránsito
- **ENTREGADA**: Orden entregada al cliente
- **CANCELADA**: Orden cancelada por el cliente o sistema
- **DEVUELTA**: Orden devuelta por el cliente
- **REEMBOLSADA**: Orden con reembolso procesado

### 002_create_cat_status_pagos.sql
Crea la tabla `cat_status_pagos` con los siguientes estados:
- **PENDIENTE**: Pago iniciado, esperando confirmación
- **APROBADO**: Pago aprobado y confirmado
- **EN_PROCESO**: Pago en proceso de verificación
- **RECHAZADO**: Pago rechazado por la entidad financiera
- **CANCELADO**: Pago cancelado por el usuario o sistema
- **REEMBOLSADO**: Pago reembolsado al cliente
- **EXPIRADO**: Pago expirado por tiempo de espera
- **EN_MEDIACION**: Pago en proceso de mediación o disputa

## 🚀 Cómo Ejecutar las Migraciones

### Opción 1: Usando Node.js (Recomendado)

```bash
# Desde el directorio raíz del backend
node database/migrations/runMigrations.js
```

Este script ejecutará automáticamente todas las migraciones en orden y mostrará los resultados.

### Opción 2: Usando MySQL CLI

```bash
# Navegar al directorio de migraciones
cd database/migrations

# Ejecutar el script de migraciones
mysql -u tu_usuario -p tu_base_de_datos < run_migrations.sql
```

### Opción 3: Ejecutar migraciones individuales

```bash
# Para cat_status_ordenes
mysql -u tu_usuario -p tu_base_de_datos < 001_create_cat_status_ordenes.sql

# Para cat_status_pagos
mysql -u tu_usuario -p tu_base_de_datos < 002_create_cat_status_pagos.sql
```

## 📝 Notas Importantes

1. **Eliminar tablas existentes**: Los scripts incluyen `DROP TABLE IF EXISTS`, lo que eliminará las tablas si ya existen. Úsalo con precaución en producción.

2. **Variables de entorno**: Asegúrate de tener configurado tu archivo `.env` con las credenciales correctas de la base de datos.

3. **Respaldo**: Siempre realiza un respaldo de tu base de datos antes de ejecutar migraciones en producción.

4. **Orden**: Las migraciones deben ejecutarse en orden numérico (001, 002, etc.).

## 🔍 Verificar Instalación

Después de ejecutar las migraciones, puedes verificar que las tablas se crearon correctamente:

```sql
-- Verificar estructura de cat_status_ordenes
DESCRIBE cat_status_ordenes;
SELECT * FROM cat_status_ordenes;

-- Verificar estructura de cat_status_pagos
DESCRIBE cat_status_pagos;
SELECT * FROM cat_status_pagos;
```

## 🛠️ Mantenimiento

Para agregar nuevos estados:

```sql
-- Ejemplo: Agregar nuevo estado a órdenes
INSERT INTO cat_status_ordenes (codigo, nombre, descripcion, color, orden, activo) 
VALUES ('NUEVO_ESTADO', 'Nuevo Estado', 'Descripción del nuevo estado', 'color', 9, TRUE);
```

## 📞 Soporte

Si encuentras algún error durante la ejecución de las migraciones, revisa:
1. Las credenciales de la base de datos en tu archivo `.env`
2. Los permisos del usuario de base de datos
3. La existencia de la base de datos
4. Los logs de error en la consola
