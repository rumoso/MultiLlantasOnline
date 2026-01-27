require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runStoredProcedures() {
    let connection;

    try {
        // Crear conexión
        connection = await mysql.createConnection({
            host: process.env.SERVER,
            user: process.env.USERDB,
            password: process.env.PASSWORD,
            database: process.env.DATABASE,
            port: process.env.PORT_SQL,
            multipleStatements: true
        });

        console.log('✅ Conexión exitosa a la base de datos');

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Lista de archivos de stored procedures
        const spFiles = [
            '001_create_cat_status_ordenes.sql',
            '002_create_cat_status_pagos.sql',
            '007_create_orders_tables.sql',
            '008_sp_processPurchase.sql',
            '009_sp_getMyPurchases.sql',
            '010_favorites_feature.sql',
            '011_sp_getOrderDetails.sql'
        ];

        // Ejecutar cada stored procedure
        for (const file of spFiles) {
            const filePath = path.join(__dirname, file);

            if (fs.existsSync(filePath)) {
                console.log(`\n📄 Ejecutando: ${file}`);

                const sql = fs.readFileSync(filePath, 'utf8');
                await connection.query(sql);

                console.log(`✅ ${file} ejecutado correctamente`);
            } else {
                console.log(`⚠️  Archivo no encontrado: ${file}`);
            }
        }

        console.log('\n✨ ¡Todos los stored procedures se crearon exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔒 Conexión cerrada');
        }
    }
}

// Ejecutar
runStoredProcedures();
