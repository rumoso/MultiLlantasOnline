-- =============================================================================
-- Tabla de catálogo de status para pagos
-- =============================================================================
-- Descripción: Esta tabla almacena los diferentes estados que puede tener
--              un pago en el sistema de e-commerce
-- Autor: Sistema
-- Fecha: 2026-01-04
-- =============================================================================

-- Eliminar tabla si existe (para desarrollo)
DROP TABLE IF EXISTS cat_status_pagos;

-- Crear tabla de catálogo de status de pagos
CREATE TABLE cat_status_pagos (
    idStatusPago INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del status de pago',
    codigo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del status (PENDIENTE, APROBADO, etc.)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo del status en español',
    descripcion TEXT NULL COMMENT 'Descripción detallada del status',
    color VARCHAR(20) DEFAULT 'gray' COMMENT 'Color para UI (yellow, green, red, etc.)',
    orden INT DEFAULT 0 COMMENT 'Orden de visualización',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el status está activo',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de status para pagos';

-- Insertar los status iniciales
INSERT INTO cat_status_pagos (codigo, nombre, descripcion, color, orden, activo) VALUES
('PENDIENTE', 'Pendiente', 'Pago iniciado, esperando confirmación', 'yellow', 1, TRUE),
('APROBADO', 'Aprobado', 'Pago aprobado y confirmado', 'green', 2, TRUE),
('EN_PROCESO', 'En Proceso', 'Pago en proceso de verificación', 'blue', 3, TRUE),
('RECHAZADO', 'Rechazado', 'Pago rechazado por la entidad financiera', 'red', 4, TRUE),
('CANCELADO', 'Cancelado', 'Pago cancelado por el usuario o sistema', 'orange', 5, TRUE),
('REEMBOLSADO', 'Reembolsado', 'Pago reembolsado al cliente', 'purple', 6, TRUE),
('EXPIRADO', 'Expirado', 'Pago expirado por tiempo de espera', 'gray', 7, TRUE),
('EN_MEDIACION', 'En Mediación', 'Pago en proceso de mediación o disputa', 'cyan', 8, TRUE);

-- Crear índices
CREATE INDEX idx_cat_status_pagos_codigo ON cat_status_pagos(codigo);
CREATE INDEX idx_cat_status_pagos_activo ON cat_status_pagos(activo);

-- Comentarios adicionales sobre los status
-- PENDIENTE: Estado inicial cuando se inicia el proceso de pago
-- APROBADO: El pago fue confirmado por MercadoPago/Stripe/etc
-- EN_PROCESO: El pago está siendo procesado por la pasarela
-- RECHAZADO: El banco o tarjeta rechazó la transacción
-- CANCELADO: El usuario canceló antes de completar el pago
-- REEMBOLSADO: Se devolvió el dinero al cliente
-- EXPIRADO: El tiempo límite para completar el pago se agotó
-- EN_MEDIACION: Hay una disputa o reclamo en proceso
