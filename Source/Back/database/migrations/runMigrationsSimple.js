// Cargar variables de entorno primero
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { dbSPConnection } = require('../config');

/**
 * Script simplificado para ejecutar las migraciones de base de datos
 */

async function runMigrations() {
    let connection;
    
    try {
        console.log('🚀 Iniciando migraciones de base de datos...\n');
        
        connection = await dbSPConnection.getConnection();
        
        // ========== MIGRACIÓN 001: cat_status_ordenes ==========
        console.log('📋 Creando tabla cat_status_ordenes...');
        
        // Eliminar tabla si existe
        try {
            await connection.query('DROP TABLE IF EXISTS cat_status_ordenes');
        } catch (err) {
            console.log('Tabla no existía previamente');
        }
        
        // Crear tabla
        await connection.query(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de status para órdenes'
        `);
        
        // Insertar datos
        await connection.query(`
            INSERT INTO cat_status_ordenes (codigo, nombre, descripcion, color, orden, activo) VALUES
            ('PENDIENTE', 'Pendiente', 'Orden creada, esperando confirmación de pago', 'yellow', 1, TRUE),
            ('PAGADA', 'Pagada', 'Pago confirmado y procesado exitosamente', 'blue', 2, TRUE),
            ('EN_PROCESO', 'En Proceso', 'Orden en preparación para envío', 'orange', 3, TRUE),
            ('ENVIADA', 'Enviada', 'Orden despachada y en tránsito', 'purple', 4, TRUE),
            ('ENTREGADA', 'Entregada', 'Orden entregada al cliente', 'green', 5, TRUE),
            ('CANCELADA', 'Cancelada', 'Orden cancelada por el cliente o sistema', 'red', 6, TRUE),
            ('DEVUELTA', 'Devuelta', 'Orden devuelta por el cliente', 'gray', 7, TRUE),
            ('REEMBOLSADA', 'Reembolsada', 'Orden con reembolso procesado', 'cyan', 8, TRUE)
        `);
        
        // Crear índices
        await connection.query('CREATE INDEX idx_cat_status_ordenes_codigo ON cat_status_ordenes(codigo)');
        await connection.query('CREATE INDEX idx_cat_status_ordenes_activo ON cat_status_ordenes(activo)');
        
        console.log('✅ Tabla cat_status_ordenes creada exitosamente\n');
        
        // ========== MIGRACIÓN 002: cat_status_pagos ==========
        console.log('📋 Creando tabla cat_status_pagos...');
        
        // Eliminar tabla si existe
        try {
            await connection.query('DROP TABLE IF EXISTS cat_status_pagos');
        } catch (err) {
            console.log('Tabla no existía previamente');
        }
        
        // Crear tabla
        await connection.query(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de status para pagos'
        `);
        
        // Insertar datos
        await connection.query(`
            INSERT INTO cat_status_pagos (codigo, nombre, descripcion, color, orden, activo) VALUES
            ('PENDIENTE', 'Pendiente', 'Pago iniciado, esperando confirmación', 'yellow', 1, TRUE),
            ('APROBADO', 'Aprobado', 'Pago aprobado y confirmado', 'green', 2, TRUE),
            ('EN_PROCESO', 'En Proceso', 'Pago en proceso de verificación', 'blue', 3, TRUE),
            ('RECHAZADO', 'Rechazado', 'Pago rechazado por la entidad financiera', 'red', 4, TRUE),
            ('CANCELADO', 'Cancelado', 'Pago cancelado por el usuario o sistema', 'orange', 5, TRUE),
            ('REEMBOLSADO', 'Reembolsado', 'Pago reembolsado al cliente', 'purple', 6, TRUE),
            ('EXPIRADO', 'Expirado', 'Pago expirado por tiempo de espera', 'gray', 7, TRUE),
            ('EN_MEDIACION', 'En Mediación', 'Pago en proceso de mediación o disputa', 'cyan', 8, TRUE)
        `);
        
        // Crear índices
        await connection.query('CREATE INDEX idx_cat_status_pagos_codigo ON cat_status_pagos(codigo)');
        await connection.query('CREATE INDEX idx_cat_status_pagos_activo ON cat_status_pagos(activo)');
        
        console.log('✅ Tabla cat_status_pagos creada exitosamente\n');
        
        // ========== VERIFICACIÓN ==========
        console.log('📊 Verificando datos insertados:\n');
        
        console.log('--- Status de Órdenes ---');
        const [ordenes] = await connection.query('SELECT * FROM cat_status_ordenes ORDER BY orden');
        console.table(ordenes);
        
        console.log('\n--- Status de Pagos ---');
        const [pagos] = await connection.query('SELECT * FROM cat_status_pagos ORDER BY orden');
        console.table(pagos);
        
        console.log('\n✨ ¡Todas las migraciones se ejecutaron exitosamente!');
        console.log(`\n📈 Resumen:`);
        console.log(`   - ${ordenes.length} status de órdenes creados`);
        console.log(`   - ${pagos.length} status de pagos creados`);
        
    } catch (error) {
        console.error('❌ Error ejecutando migraciones:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            connection.release();
        }
        process.exit(0);
    }
}

// Ejecutar migraciones
runMigrations();
