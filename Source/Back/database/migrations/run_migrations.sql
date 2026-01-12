-- =============================================================================
-- Script de ejecución de migraciones
-- =============================================================================
-- Descripción: Este script ejecuta todas las migraciones en orden
-- Autor: Sistema
-- Fecha: 2026-01-04
-- Uso: mysql -u usuario -p nombre_bd < run_migrations.sql
-- =============================================================================

-- Seleccionar la base de datos (ajustar según tu configuración)
-- USE nombre_de_tu_base_de_datos;

-- Ejecutar migración 001: Catálogo de status de órdenes
SOURCE 001_create_cat_status_ordenes.sql;

-- Ejecutar migración 002: Catálogo de status de pagos
SOURCE 002_create_cat_status_pagos.sql;

-- Mostrar los registros creados
SELECT 'Catálogo de Status de Órdenes creado:' AS mensaje;
SELECT * FROM cat_status_ordenes ORDER BY orden;

SELECT '';
SELECT 'Catálogo de Status de Pagos creado:' AS mensaje;
SELECT * FROM cat_status_pagos ORDER BY orden;

SELECT '';
SELECT 'Migraciones completadas exitosamente!' AS mensaje;
