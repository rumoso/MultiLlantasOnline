-- =============================================================================
-- Inserción de productos de llantas para testing y diseño
-- =============================================================================
-- Descripción: Este script crea la tabla productos (si no existe) e inserta
--              productos de llantas con datos realistas para desarrollo
-- Autor: Sistema
-- Fecha: 2026-01-04
-- =============================================================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ancho VARCHAR(20) NOT NULL COMMENT 'Ancho de la llanta en mm (ej: 195, 205)',
    perfil VARCHAR(20) NOT NULL COMMENT 'Perfil/altura de la llanta (ej: 55, 60, 65)',
    rin VARCHAR(20) NOT NULL COMMENT 'Diámetro del rin en pulgadas (ej: 15, 16, 17)',
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    imagen_url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_marca (marca),
    INDEX idx_activo (activo),
    INDEX idx_precio (precio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Limpiar productos existentes (opcional, comentar si quieres mantener datos previos)
-- DELETE FROM productos;

-- Insertar productos de llantas (Marcas Premium)
INSERT INTO productos (nombre, descripcion, marca, modelo, ancho, perfil, rin, precio, stock, imagen_url, activo) VALUES
-- Michelin
('Michelin Primacy 4 195/55 R16', 'Llanta de alto rendimiento con excelente agarre en mojado y seco. Ideal para sedanes compactos.', 'Michelin', 'Primacy 4', '195', '55', '16', 2850.00, 25, 'https://via.placeholder.com/400x400?text=Michelin+Primacy+4', TRUE),
('Michelin Pilot Sport 4 225/45 R17', 'Llanta deportiva de alta performance con tecnología híbrida. Para autos deportivos y sedanes premium.', 'Michelin', 'Pilot Sport 4', '225', '45', '17', 4200.00, 18, 'https://via.placeholder.com/400x400?text=Michelin+Pilot+Sport+4', TRUE),
('Michelin Latitude Sport 3 235/55 R19', 'Llanta SUV de alto rendimiento con excelente estabilidad y confort.', 'Michelin', 'Latitude Sport 3', '235', '55', '19', 5800.00, 12, 'https://via.placeholder.com/400x400?text=Michelin+Latitude', TRUE),
('Michelin Energy XM2+ 185/65 R15', 'Llanta económica con bajo consumo de combustible y larga duración.', 'Michelin', 'Energy XM2+', '185', '65', '15', 2150.00, 40, 'https://via.placeholder.com/400x400?text=Michelin+Energy', TRUE),

-- Bridgestone
('Bridgestone Turanza T005 205/55 R16', 'Llanta premium con excelente frenado en mojado y bajo nivel de ruido.', 'Bridgestone', 'Turanza T005', '205', '55', '16', 3100.00, 30, 'https://via.placeholder.com/400x400?text=Bridgestone+Turanza', TRUE),
('Bridgestone Potenza RE-71RS 245/40 R18', 'Llanta de competición para máximo agarre en pista. Compuesto ultra adherente.', 'Bridgestone', 'Potenza RE-71RS', '245', '40', '18', 6500.00, 8, 'https://via.placeholder.com/400x400?text=Bridgestone+Potenza', TRUE),
('Bridgestone Dueler H/T 684 II 265/65 R17', 'Llanta para camionetas y SUVs con excelente tracción en terracería.', 'Bridgestone', 'Dueler H/T 684 II', '265', '65', '17', 4800.00, 15, 'https://via.placeholder.com/400x400?text=Bridgestone+Dueler', TRUE),
('Bridgestone Ecopia EP150 175/65 R14', 'Llanta ecológica con bajo consumo de combustible para autos compactos.', 'Bridgestone', 'Ecopia EP150', '175', '65', '14', 1950.00, 50, 'https://via.placeholder.com/400x400?text=Bridgestone+Ecopia', TRUE),

-- Goodyear
('Goodyear Eagle F1 Asymmetric 5 225/50 R17', 'Llanta deportiva con tecnología de frenado mejorado en mojado.', 'Goodyear', 'Eagle F1 Asymmetric 5', '225', '50', '17', 3850.00, 22, 'https://via.placeholder.com/400x400?text=Goodyear+Eagle+F1', TRUE),
('Goodyear Assurance MaxLife 195/60 R15', 'Llanta de larga duración con garantía extendida de kilometraje.', 'Goodyear', 'Assurance MaxLife', '195', '60', '15', 2400.00, 35, 'https://via.placeholder.com/400x400?text=Goodyear+Assurance', TRUE),
('Goodyear Wrangler AT Adventure 255/70 R16', 'Llanta todo terreno para pickup y SUVs aventureros.', 'Goodyear', 'Wrangler AT Adventure', '255', '70', '16', 4200.00, 20, 'https://via.placeholder.com/400x400?text=Goodyear+Wrangler', TRUE),
('Goodyear EfficientGrip Performance 185/60 R15', 'Llanta eficiente con bajo consumo y buen agarre.', 'Goodyear', 'EfficientGrip Performance', '185', '60', '15', 2250.00, 45, 'https://via.placeholder.com/400x400?text=Goodyear+EfficientGrip', TRUE),

-- Continental
('Continental PremiumContact 6 215/55 R17', 'Llanta premium con excelente confort y seguridad en altas velocidades.', 'Continental', 'PremiumContact 6', '215', '55', '17', 3600.00, 28, 'https://via.placeholder.com/400x400?text=Continental+Premium', TRUE),
('Continental SportContact 6 255/35 R19', 'Llanta ultra deportiva para autos de alto desempeño.', 'Continental', 'SportContact 6', '255', '35', '19', 7200.00, 10, 'https://via.placeholder.com/400x400?text=Continental+Sport', TRUE),
('Continental CrossContact LX25 235/60 R18', 'Llanta SUV con excelente tracción y confort de marcha.', 'Continental', 'CrossContact LX25', '235', '60', '18', 4900.00, 16, 'https://via.placeholder.com/400x400?text=Continental+Cross', TRUE),

-- Pirelli
('Pirelli Cinturato P7 205/60 R16', 'Llanta verde con bajo consumo de combustible y alta eficiencia.', 'Pirelli', 'Cinturato P7', '205', '60', '16', 3200.00, 25, 'https://via.placeholder.com/400x400?text=Pirelli+Cinturato', TRUE),
('Pirelli P Zero 245/40 R18', 'Llanta de alta performance para autos deportivos y premium.', 'Pirelli', 'P Zero', '245', '40', '18', 6800.00, 12, 'https://via.placeholder.com/400x400?text=Pirelli+P+Zero', TRUE),
('Pirelli Scorpion Verde All Season 225/65 R17', 'Llanta SUV ecológica para uso todo el año.', 'Pirelli', 'Scorpion Verde', '225', '65', '17', 4500.00, 18, 'https://via.placeholder.com/400x400?text=Pirelli+Scorpion', TRUE),

-- Yokohama
('Yokohama BluEarth-GT AE51 195/65 R15', 'Llanta ecológica con excelente rendimiento de combustible.', 'Yokohama', 'BluEarth-GT AE51', '195', '65', '15', 2300.00, 32, 'https://via.placeholder.com/400x400?text=Yokohama+BluEarth', TRUE),
('Yokohama Advan Fleva V701 215/45 R17', 'Llanta deportiva con tecnología avanzada para máximo control.', 'Yokohama', 'Advan Fleva V701', '215', '45', '17', 4100.00, 15, 'https://via.placeholder.com/400x400?text=Yokohama+Advan', TRUE),
('Yokohama Geolandar G055 265/70 R17', 'Llanta off-road para aventuras extremas y terracería.', 'Yokohama', 'Geolandar G055', '265', '70', '17', 5200.00, 10, 'https://via.placeholder.com/400x400?text=Yokohama+Geolandar', TRUE),

-- Hankook
('Hankook Ventus V12 evo2 225/45 R17', 'Llanta deportiva de alto rendimiento a precio competitivo.', 'Hankook', 'Ventus V12 evo2', '225', '45', '17', 2950.00, 26, 'https://via.placeholder.com/400x400?text=Hankook+Ventus', TRUE),
('Hankook Kinergy Eco 185/65 R15', 'Llanta económica con baja resistencia al rodamiento.', 'Hankook', 'Kinergy Eco', '185', '65', '15', 1850.00, 48, 'https://via.placeholder.com/400x400?text=Hankook+Kinergy', TRUE),
('Hankook Dynapro AT2 RF11 245/70 R16', 'Llanta todo terreno robusta para pickup y SUV.', 'Hankook', 'Dynapro AT2 RF11', '245', '70', '16', 3800.00, 20, 'https://via.placeholder.com/400x400?text=Hankook+Dynapro', TRUE),

-- Firestone
('Firestone Firehawk AS V2 205/55 R16', 'Llanta all-season con excelente balance entre comfort y agarre.', 'Firestone', 'Firehawk AS V2', '205', '55', '16', 2100.00, 35, 'https://via.placeholder.com/400x400?text=Firestone+Firehawk', TRUE),
('Firestone Destination LE3 235/65 R17', 'Llanta SUV con tecnología de larga duración.', 'Firestone', 'Destination LE3', '235', '65', '17', 3400.00, 22, 'https://via.placeholder.com/400x400?text=Firestone+Destination', TRUE),

-- Algunos productos con stock bajo o agotado para testing
('Michelin Pilot Sport Cup 2 265/35 R19', 'Llanta semi-slick para pista y competición. Stock limitado.', 'Michelin', 'Pilot Sport Cup 2', '265', '35', '19', 9500.00, 3, 'https://via.placeholder.com/400x400?text=Michelin+Cup+2', TRUE),
('Bridgestone Blizzak WS90 195/65 R15', 'Llanta de invierno para condiciones extremas. Temporalmente agotado.', 'Bridgestone', 'Blizzak WS90', '195', '65', '15', 3200.00, 0, 'https://via.placeholder.com/400x400?text=Bridgestone+Blizzak', TRUE),

-- Producto inactivo (para testing de filtros)
('Continental WinterContact TS870 205/55 R16', 'Llanta de invierno discontinuada.', 'Continental', 'WinterContact TS870', '205', '55', '16', 3500.00, 5, 'https://via.placeholder.com/400x400?text=Continental+Winter', FALSE);

-- Verificar inserción
SELECT COUNT(*) as total_productos FROM productos;
SELECT marca, COUNT(*) as cantidad FROM productos WHERE activo = TRUE GROUP BY marca ORDER BY cantidad DESC;
SELECT * FROM productos ORDER BY precio DESC LIMIT 5;
