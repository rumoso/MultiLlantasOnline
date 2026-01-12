// Cargar variables de entorno primero
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { dbSPConnection } = require('../config');
const fs = require('fs');
const path = require('path');

/**
 * Script para insertar productos de llantas en la base de datos
 */

async function insertProductos() {
    let connection;
    
    try {
        console.log('🚀 Iniciando inserción de productos de llantas...\n');
        
        connection = await dbSPConnection.getConnection();
        
        console.log('📋 Creando tabla productos (si no existe)...');
        
        // Crear tabla productos
        await connection.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                marca VARCHAR(100) NOT NULL,
                modelo VARCHAR(100) NOT NULL,
                ancho VARCHAR(20) NOT NULL COMMENT 'Ancho de la llanta en mm',
                perfil VARCHAR(20) NOT NULL COMMENT 'Perfil/altura de la llanta',
                rin VARCHAR(20) NOT NULL COMMENT 'Diámetro del rin en pulgadas',
                precio DECIMAL(10,2) NOT NULL,
                stock INT DEFAULT 0,
                imagen_url VARCHAR(500),
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_marca (marca),
                INDEX idx_activo (activo),
                INDEX idx_precio (precio)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        console.log('✅ Tabla productos verificada/creada\n');
        
        // Verificar si ya hay productos
        const [existing] = await connection.query('SELECT COUNT(*) as total FROM productos');
        if (existing[0].total > 0) {
            console.log(`⚠️  Ya existen ${existing[0].total} productos en la base de datos.`);
            console.log('¿Deseas continuar? Los productos se agregarán (no se eliminarán los existentes).\n');
        }
        
        console.log('📦 Insertando productos de llantas...\n');
        
        // Productos organizados por marca
        const productos = [
            // Michelin
            { nombre: 'Michelin Primacy 4 195/55 R16', descripcion: 'Llanta de alto rendimiento con excelente agarre en mojado y seco. Ideal para sedanes compactos.', marca: 'Michelin', modelo: 'Primacy 4', ancho: '195', perfil: '55', rin: '16', precio: 2850.00, stock: 25, imagen_url: 'https://via.placeholder.com/400x400?text=Michelin+Primacy+4', activo: 1 },
            { nombre: 'Michelin Pilot Sport 4 225/45 R17', descripcion: 'Llanta deportiva de alta performance con tecnología híbrida. Para autos deportivos y sedanes premium.', marca: 'Michelin', modelo: 'Pilot Sport 4', ancho: '225', perfil: '45', rin: '17', precio: 4200.00, stock: 18, imagen_url: 'https://via.placeholder.com/400x400?text=Michelin+Pilot+Sport+4', activo: 1 },
            { nombre: 'Michelin Latitude Sport 3 235/55 R19', descripcion: 'Llanta SUV de alto rendimiento con excelente estabilidad y confort.', marca: 'Michelin', modelo: 'Latitude Sport 3', ancho: '235', perfil: '55', rin: '19', precio: 5800.00, stock: 12, imagen_url: 'https://via.placeholder.com/400x400?text=Michelin+Latitude', activo: 1 },
            { nombre: 'Michelin Energy XM2+ 185/65 R15', descripcion: 'Llanta económica con bajo consumo de combustible y larga duración.', marca: 'Michelin', modelo: 'Energy XM2+', ancho: '185', perfil: '65', rin: '15', precio: 2150.00, stock: 40, imagen_url: 'https://via.placeholder.com/400x400?text=Michelin+Energy', activo: 1 },
            
            // Bridgestone
            { nombre: 'Bridgestone Turanza T005 205/55 R16', descripcion: 'Llanta premium con excelente frenado en mojado y bajo nivel de ruido.', marca: 'Bridgestone', modelo: 'Turanza T005', ancho: '205', perfil: '55', rin: '16', precio: 3100.00, stock: 30, imagen_url: 'https://via.placeholder.com/400x400?text=Bridgestone+Turanza', activo: 1 },
            { nombre: 'Bridgestone Potenza RE-71RS 245/40 R18', descripcion: 'Llanta de competición para máximo agarre en pista. Compuesto ultra adherente.', marca: 'Bridgestone', modelo: 'Potenza RE-71RS', ancho: '245', perfil: '40', rin: '18', precio: 6500.00, stock: 8, imagen_url: 'https://via.placeholder.com/400x400?text=Bridgestone+Potenza', activo: 1 },
            { nombre: 'Bridgestone Dueler H/T 684 II 265/65 R17', descripcion: 'Llanta para camionetas y SUVs con excelente tracción en terracería.', marca: 'Bridgestone', modelo: 'Dueler H/T 684 II', ancho: '265', perfil: '65', rin: '17', precio: 4800.00, stock: 15, imagen_url: 'https://via.placeholder.com/400x400?text=Bridgestone+Dueler', activo: 1 },
            { nombre: 'Bridgestone Ecopia EP150 175/65 R14', descripcion: 'Llanta ecológica con bajo consumo de combustible para autos compactos.', marca: 'Bridgestone', modelo: 'Ecopia EP150', ancho: '175', perfil: '65', rin: '14', precio: 1950.00, stock: 50, imagen_url: 'https://via.placeholder.com/400x400?text=Bridgestone+Ecopia', activo: 1 },
            
            // Goodyear
            { nombre: 'Goodyear Eagle F1 Asymmetric 5 225/50 R17', descripcion: 'Llanta deportiva con tecnología de frenado mejorado en mojado.', marca: 'Goodyear', modelo: 'Eagle F1 Asymmetric 5', ancho: '225', perfil: '50', rin: '17', precio: 3850.00, stock: 22, imagen_url: 'https://via.placeholder.com/400x400?text=Goodyear+Eagle+F1', activo: 1 },
            { nombre: 'Goodyear Assurance MaxLife 195/60 R15', descripcion: 'Llanta de larga duración con garantía extendida de kilometraje.', marca: 'Goodyear', modelo: 'Assurance MaxLife', ancho: '195', perfil: '60', rin: '15', precio: 2400.00, stock: 35, imagen_url: 'https://via.placeholder.com/400x400?text=Goodyear+Assurance', activo: 1 },
            { nombre: 'Goodyear Wrangler AT Adventure 255/70 R16', descripcion: 'Llanta todo terreno para pickup y SUVs aventureros.', marca: 'Goodyear', modelo: 'Wrangler AT Adventure', ancho: '255', perfil: '70', rin: '16', precio: 4200.00, stock: 20, imagen_url: 'https://via.placeholder.com/400x400?text=Goodyear+Wrangler', activo: 1 },
            { nombre: 'Goodyear EfficientGrip Performance 185/60 R15', descripcion: 'Llanta eficiente con bajo consumo y buen agarre.', marca: 'Goodyear', modelo: 'EfficientGrip Performance', ancho: '185', perfil: '60', rin: '15', precio: 2250.00, stock: 45, imagen_url: 'https://via.placeholder.com/400x400?text=Goodyear+EfficientGrip', activo: 1 },
            
            // Continental
            { nombre: 'Continental PremiumContact 6 215/55 R17', descripcion: 'Llanta premium con excelente confort y seguridad en altas velocidades.', marca: 'Continental', modelo: 'PremiumContact 6', ancho: '215', perfil: '55', rin: '17', precio: 3600.00, stock: 28, imagen_url: 'https://via.placeholder.com/400x400?text=Continental+Premium', activo: 1 },
            { nombre: 'Continental SportContact 6 255/35 R19', descripcion: 'Llanta ultra deportiva para autos de alto desempeño.', marca: 'Continental', modelo: 'SportContact 6', ancho: '255', perfil: '35', rin: '19', precio: 7200.00, stock: 10, imagen_url: 'https://via.placeholder.com/400x400?text=Continental+Sport', activo: 1 },
            { nombre: 'Continental CrossContact LX25 235/60 R18', descripcion: 'Llanta SUV con excelente tracción y confort de marcha.', marca: 'Continental', modelo: 'CrossContact LX25', ancho: '235', perfil: '60', rin: '18', precio: 4900.00, stock: 16, imagen_url: 'https://via.placeholder.com/400x400?text=Continental+Cross', activo: 1 },
            
            // Pirelli
            { nombre: 'Pirelli Cinturato P7 205/60 R16', descripcion: 'Llanta verde con bajo consumo de combustible y alta eficiencia.', marca: 'Pirelli', modelo: 'Cinturato P7', ancho: '205', perfil: '60', rin: '16', precio: 3200.00, stock: 25, imagen_url: 'https://via.placeholder.com/400x400?text=Pirelli+Cinturato', activo: 1 },
            { nombre: 'Pirelli P Zero 245/40 R18', descripcion: 'Llanta de alta performance para autos deportivos y premium.', marca: 'Pirelli', modelo: 'P Zero', ancho: '245', perfil: '40', rin: '18', precio: 6800.00, stock: 12, imagen_url: 'https://via.placeholder.com/400x400?text=Pirelli+P+Zero', activo: 1 },
            { nombre: 'Pirelli Scorpion Verde All Season 225/65 R17', descripcion: 'Llanta SUV ecológica para uso todo el año.', marca: 'Pirelli', modelo: 'Scorpion Verde', ancho: '225', perfil: '65', rin: '17', precio: 4500.00, stock: 18, imagen_url: 'https://via.placeholder.com/400x400?text=Pirelli+Scorpion', activo: 1 },
            
            // Yokohama
            { nombre: 'Yokohama BluEarth-GT AE51 195/65 R15', descripcion: 'Llanta ecológica con excelente rendimiento de combustible.', marca: 'Yokohama', modelo: 'BluEarth-GT AE51', ancho: '195', perfil: '65', rin: '15', precio: 2300.00, stock: 32, imagen_url: 'https://via.placeholder.com/400x400?text=Yokohama+BluEarth', activo: 1 },
            { nombre: 'Yokohama Advan Fleva V701 215/45 R17', descripcion: 'Llanta deportiva con tecnología avanzada para máximo control.', marca: 'Yokohama', modelo: 'Advan Fleva V701', ancho: '215', perfil: '45', rin: '17', precio: 4100.00, stock: 15, imagen_url: 'https://via.placeholder.com/400x400?text=Yokohama+Advan', activo: 1 },
            { nombre: 'Yokohama Geolandar G055 265/70 R17', descripcion: 'Llanta off-road para aventuras extremas y terracería.', marca: 'Yokohama', modelo: 'Geolandar G055', ancho: '265', perfil: '70', rin: '17', precio: 5200.00, stock: 10, imagen_url: 'https://via.placeholder.com/400x400?text=Yokohama+Geolandar', activo: 1 },
            
            // Hankook
            { nombre: 'Hankook Ventus V12 evo2 225/45 R17', descripcion: 'Llanta deportiva de alto rendimiento a precio competitivo.', marca: 'Hankook', modelo: 'Ventus V12 evo2', ancho: '225', perfil: '45', rin: '17', precio: 2950.00, stock: 26, imagen_url: 'https://via.placeholder.com/400x400?text=Hankook+Ventus', activo: 1 },
            { nombre: 'Hankook Kinergy Eco 185/65 R15', descripcion: 'Llanta económica con baja resistencia al rodamiento.', marca: 'Hankook', modelo: 'Kinergy Eco', ancho: '185', perfil: '65', rin: '15', precio: 1850.00, stock: 48, imagen_url: 'https://via.placeholder.com/400x400?text=Hankook+Kinergy', activo: 1 },
            { nombre: 'Hankook Dynapro AT2 RF11 245/70 R16', descripcion: 'Llanta todo terreno robusta para pickup y SUV.', marca: 'Hankook', modelo: 'Dynapro AT2 RF11', ancho: '245', perfil: '70', rin: '16', precio: 3800.00, stock: 20, imagen_url: 'https://via.placeholder.com/400x400?text=Hankook+Dynapro', activo: 1 },
            
            // Firestone
            { nombre: 'Firestone Firehawk AS V2 205/55 R16', descripcion: 'Llanta all-season con excelente balance entre comfort y agarre.', marca: 'Firestone', modelo: 'Firehawk AS V2', ancho: '205', perfil: '55', rin: '16', precio: 2100.00, stock: 35, imagen_url: 'https://via.placeholder.com/400x400?text=Firestone+Firehawk', activo: 1 },
            { nombre: 'Firestone Destination LE3 235/65 R17', descripcion: 'Llanta SUV con tecnología de larga duración.', marca: 'Firestone', modelo: 'Destination LE3', ancho: '235', perfil: '65', rin: '17', precio: 3400.00, stock: 22, imagen_url: 'https://via.placeholder.com/400x400?text=Firestone+Destination', activo: 1 },
            
            // Productos especiales para testing
            { nombre: 'Michelin Pilot Sport Cup 2 265/35 R19', descripcion: 'Llanta semi-slick para pista y competición. Stock limitado.', marca: 'Michelin', modelo: 'Pilot Sport Cup 2', ancho: '265', perfil: '35', rin: '19', precio: 9500.00, stock: 3, imagen_url: 'https://via.placeholder.com/400x400?text=Michelin+Cup+2', activo: 1 },
            { nombre: 'Bridgestone Blizzak WS90 195/65 R15', descripcion: 'Llanta de invierno para condiciones extremas. Temporalmente agotado.', marca: 'Bridgestone', modelo: 'Blizzak WS90', ancho: '195', perfil: '65', rin: '15', precio: 3200.00, stock: 0, imagen_url: 'https://via.placeholder.com/400x400?text=Bridgestone+Blizzak', activo: 1 },
            { nombre: 'Continental WinterContact TS870 205/55 R16', descripcion: 'Llanta de invierno discontinuada.', marca: 'Continental', modelo: 'WinterContact TS870', ancho: '205', perfil: '55', rin: '16', precio: 3500.00, stock: 5, imagen_url: 'https://via.placeholder.com/400x400?text=Continental+Winter', activo: 0 }
        ];
        
        let insertados = 0;
        for (const producto of productos) {
            try {
                await connection.query(
                    `INSERT INTO productos (nombre, descripcion, marca, modelo, ancho, perfil, rin, precio, stock, imagen_url, activo)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [producto.nombre, producto.descripcion, producto.marca, producto.modelo, 
                     producto.ancho, producto.perfil, producto.rin, producto.precio, 
                     producto.stock, producto.imagen_url, producto.activo]
                );
                insertados++;
                console.log(`✓ ${producto.nombre}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`⚠️  ${producto.nombre} (ya existe)`);
                } else {
                    console.error(`✗ Error en ${producto.nombre}:`, err.message);
                }
            }
        }
        
        console.log(`\n✅ ${insertados} productos insertados correctamente\n`);
        
        // Estadísticas
        const [stats] = await connection.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
                SUM(stock) as stock_total,
                MIN(precio) as precio_minimo,
                MAX(precio) as precio_maximo,
                AVG(precio) as precio_promedio
            FROM productos
        `);
        
        console.log('📊 Estadísticas de productos:');
        console.table(stats);
        
        const [porMarca] = await connection.query(`
            SELECT marca, COUNT(*) as cantidad, SUM(stock) as stock_total
            FROM productos 
            WHERE activo = 1
            GROUP BY marca 
            ORDER BY cantidad DESC
        `);
        
        console.log('\n📈 Productos por marca:');
        console.table(porMarca);
        
        console.log('\n✨ ¡Inserción de productos completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error insertando productos:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            connection.release();
        }
        process.exit(0);
    }
}

// Ejecutar inserción
insertProductos();
