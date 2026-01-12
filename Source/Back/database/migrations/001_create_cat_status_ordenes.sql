-- =============================================================================
-- Tabla de catálogo de status para órdenes
-- =============================================================================
-- Descripción: Esta tabla almacena los diferentes estados que puede tener
--              una orden en el sistema de e-commerce
-- Autor: Sistema
-- Fecha: 2026-01-04
-- =============================================================================

-- Eliminar tabla si existe (para desarrollo)
DROP TABLE IF EXISTS cat_status_ordenes;

-- Crear tabla de catálogo de status de órdenes
CREATE TABLE cat_status_ordenes (
    idStatusOrden INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del status',
    codigo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del status (PENDIENTE, PAGADA, etc.)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo del status en español',
    descripcion TEXT NULL COMMENT 'Descripción detallada del status',
    color VARCHAR(20) DEFAULT 'gray' COMMENT 'Color para UI (yellow, blue, green, red, etc.)',
    orden INT DEFAULT 0 COMMENT 'Orden de visualización',
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el status está activo',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de status para órdenes';

-- Insertar los status iniciales
INSERT INTO cat_status_ordenes (codigo, nombre, descripcion, color, orden, activo) VALUES
('PENDIENTE', 'Pendiente', 'Orden creada, esperando confirmación de pago', 'yellow', 1, TRUE),
('PAGADA', 'Pagada', 'Pago confirmado y procesado exitosamente', 'blue', 2, TRUE),
('EN_PROCESO', 'En Proceso', 'Orden en preparación para envío', 'orange', 3, TRUE),
('ENVIADA', 'Enviada', 'Orden despachada y en tránsito', 'purple', 4, TRUE),
('ENTREGADA', 'Entregada', 'Orden entregada al cliente', 'green', 5, TRUE),
('CANCELADA', 'Cancelada', 'Orden cancelada por el cliente o sistema', 'red', 6, TRUE),
('DEVUELTA', 'Devuelta', 'Orden devuelta por el cliente', 'gray', 7, TRUE),
('REEMBOLSADA', 'Reembolsada', 'Orden con reembolso procesado', 'cyan', 8, TRUE);

-- Crear índices
CREATE INDEX idx_cat_status_ordenes_codigo ON cat_status_ordenes(codigo);
CREATE INDEX idx_cat_status_ordenes_activo ON cat_status_ordenes(activo);

-- Comentarios adicionales
-- PENDIENTE: Estado inicial cuando se crea la orden
-- PAGADA: El pago fue confirmado por la pasarela de pagos
-- EN_PROCESO: El almacén está preparando el pedido
-- ENVIADA: El pedido fue entregado a paquetería
-- ENTREGADA: El cliente recibió su pedido
-- CANCELADA: Puede ser cancelada antes o después del pago
-- DEVUELTA: El cliente devolvió el producto
-- REEMBOLSADA: Se procesó el reembolso del dinero
