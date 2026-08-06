-- ============================================================================
-- Tarifas de envío (shipping_rates)
-- ----------------------------------------------------------------------------
-- El checkout habilita "entrega a domicilio" solo si el CP de la dirección cae
-- dentro de un rango activo (cpDesde–cpHasta). Se elige el de MENOR
-- idShippingRate que coincida (ver buscarTarifaEnvio en checkoutController.js),
-- por eso las zonas específicas (ids bajos) ganan sobre la nacional (id alto),
-- que actúa como respaldo para el resto del país.
-- ============================================================================

INSERT INTO shipping_rates (idShippingRate, zona, cpDesde, cpHasta, costo, activo, createDate, updateDate) VALUES
  (1, 'Durango capital',         '34000', '34999', 150.00, 1, NOW(), NOW()),
  (2, 'Gomez Palacio / Lerdo',   '35000', '35999', 200.00, 1, NOW(), NOW()),
  (3, 'Zona metropolitana CDMX', '01000', '16999', 350.00, 1, NOW(), NOW()),
  (4, 'Nacional',                '00000', '99999', 250.00, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  zona = VALUES(zona), cpDesde = VALUES(cpDesde), cpHasta = VALUES(cpHasta),
  costo = VALUES(costo), activo = VALUES(activo), updateDate = NOW();
