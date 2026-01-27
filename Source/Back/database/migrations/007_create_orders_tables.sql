-- =============================================================================
-- Tablas para el manejo de órdenes
-- =============================================================================

DROP TABLE IF EXISTS `payments`; -- Drop potential conflicting table
DROP TABLE IF EXISTS `order_details`;
DROP TABLE IF EXISTS `order_items`; -- Drop potential conflicting table
DROP TABLE IF EXISTS `orders`;

-- Tabla de encabezado de órdenes
CREATE TABLE `orders` (
    `idOrder` INT AUTO_INCREMENT PRIMARY KEY,
    `idUser` INT NOT NULL,
    `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `idStatusOrden` INT NOT NULL DEFAULT 1, -- PENDIENTE por defecto
    `idStatusPago` INT NOT NULL DEFAULT 1,  -- PENDIENTE por defecto
    `createDate` DATETIME NOT NULL,
    `updateDate` DATETIME NOT NULL,
    
    FOREIGN KEY (`idStatusOrden`) REFERENCES `cat_status_ordenes`(`idStatusOrden`),
    FOREIGN KEY (`idStatusPago`) REFERENCES `cat_status_pagos`(`idStatusPago`)
    -- Podríamos agregar FK a users si la tabla existe
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de detalle de órdenes
CREATE TABLE `order_details` (
    `idOrderDetail` INT AUTO_INCREMENT PRIMARY KEY,
    `idOrder` INT NOT NULL,
    `idProducto` INT NOT NULL,
    `cantidad` INT NOT NULL,
    `precio` DECIMAL(10,2) NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (`idOrder`) REFERENCES `orders`(`idOrder`) ON DELETE CASCADE
    -- FK a productos
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
