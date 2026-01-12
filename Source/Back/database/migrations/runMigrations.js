// Cargar variables de entorno primero
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { dbSPConnection } = require('../config');
const fs = require('fs');
const path = require('path');

/**
 * Script para ejecutar las migraciones de base de datos
 * Uso: node database/migrations/runMigrations.js
 */

async function runMigrations() {
    let connection;
    
    try {
        console.log('🚀 Iniciando migraciones de base de datos...\n');
        
        connection = await dbSPConnection.getConnection();
        
        // Leer y ejecutar migración 001: cat_status_ordenes
        console.log('📋 Ejecutando migración 001: cat_status_ordenes...');
        const migration001 = fs.readFileSync(
            path.join(__dirname, '001_create_cat_status_ordenes.sql'),
            'utf8'
        );
        
        // Ejecutar todo el SQL de una vez
        const statements001 = migration001
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));
        
        for (const statement of statements001) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                } catch (err) {
                    // Ignorar errores de DROP TABLE si la tabla no existe
                    if (!err.message.includes("Unknown table") && !err.code === 'ER_BAD_TABLE_ERROR') {
                        throw err;
                    }
                }
            }
        }
        console.log('✅ Migración 001 completada\n');
        
        // Leer y ejecutar migración 002: cat_status_pagos
        console.log('📋 Ejecutando migración 002: cat_status_pagos...');
        const migration002 = fs.readFileSync(
            path.join(__dirname, '002_create_cat_status_pagos.sql'),
            'utf8'
        );
        
        const statements002 = migration002
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));
        
        for (const statement of statements002) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                } catch (err) {
                    // Ignorar errores de DROP TABLE si la tabla no existe
                    if (!err.message.includes("Unknown table") && !err.code === 'ER_BAD_TABLE_ERROR') {
                        throw err;
                    }
                }
            }
        }
        console.log('✅ Migración 002 completada\n');
        
        // Verificar los datos insertados
        console.log('📊 Verificando datos insertados:\n');
        
        console.log('--- Status de Órdenes ---');
        const [ordenes] = await connection.query('SELECT * FROM cat_status_ordenes ORDER BY orden');
        console.table(ordenes);
        
        console.log('\n--- Status de Pagos ---');
        const [pagos] = await connection.query('SELECT * FROM cat_status_pagos ORDER BY orden');
        console.table(pagos);
        
        console.log('\n✨ ¡Todas las migraciones se ejecutaron exitosamente!');
        
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
