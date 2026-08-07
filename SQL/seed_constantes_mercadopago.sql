-- ============================================================================
-- Constantes de configuración de Mercado Pago (tabla `constantes`)
-- ----------------------------------------------------------------------------
-- El backend lee estos valores desde `constantes` (utils/appConfig.js) y cae
-- al .env como respaldo. Se administran desde MultiLlantasAdmin
-- (Configuración → Constantes) con permisos.
--
-- IMPORTANTE: este archivo es solo PLANTILLA/documentación. NO pongas aquí los
-- secretos reales (Access Token, Webhook Secret) — se cargan en la BD de cada
-- ambiente. Reemplaza <...> por los valores correspondientes al ejecutar
-- manualmente, o usa el panel del Admin.
--
-- Producción: cambia MP_ACCESS_TOKEN / MP_PUBLIC_KEY / MP_WEBHOOK_SECRET por
-- las credenciales de producción y las *_URL por tu dominio público real.
-- ============================================================================

INSERT INTO constantes (createDate, active, idCreateUser, sKey, sValue) VALUES
  (NOW(), 1, NULL, 'MP_ACCESS_TOKEN',     '<ACCESS_TOKEN>'),
  (NOW(), 1, NULL, 'MP_PUBLIC_KEY',       '<PUBLIC_KEY>'),
  (NOW(), 1, NULL, 'MP_WEBHOOK_SECRET',   '<WEBHOOK_SECRET>'),
  (NOW(), 1, NULL, 'MP_SUCCESS_URL',      'https://TU_DOMINIO/checkout/resultado?status=success'),
  (NOW(), 1, NULL, 'MP_FAILURE_URL',      'https://TU_DOMINIO/checkout/resultado?status=failure'),
  (NOW(), 1, NULL, 'MP_PENDING_URL',      'https://TU_DOMINIO/checkout/resultado?status=pending'),
  (NOW(), 1, NULL, 'MP_NOTIFICATION_URL', 'https://TU_DOMINIO_BACKEND/api/checkout/webhook'),
  (NOW(), 1, NULL, 'MP_EXPIRACION_HORAS', '72')
ON DUPLICATE KEY UPDATE sValue = VALUES(sValue), active = 1;
