const { dbSPConnection } = require('../database/config');

// Lector de configuración de la aplicación desde la tabla `constantes`
// (administrable desde MultiLlantasAdmin con permisos). Cae al .env como
// respaldo, para no romper nada si una constante falta o si la BD falla.
//
// Se cachea en memoria por CACHE_TTL_MS para no consultar la BD en cada
// operación de pago; los cambios hechos en el Admin se reflejan dentro de
// ese lapso (o de inmediato si se limpia la caché).

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map(); // sKey -> { value, exp }

/**
 * Devuelve el valor de una constante por sKey (solo activas). Si no existe o
 * viene vacía, usa process.env[fallbackEnv]. Devuelve null si no hay ninguno.
 */
const getConfig = async (sKey, fallbackEnv = null) => {
    const now = Date.now();
    const hit = cache.get(sKey);
    if (hit && hit.exp > now) return hit.value;

    let value = null;
    try {
        const [rows] = await dbSPConnection.query(
            'SELECT sValue FROM constantes WHERE sKey = ? AND active = 1 LIMIT 1',
            [sKey]
        );
        if (rows.length && rows[0].sValue != null && String(rows[0].sValue).trim() !== '') {
            value = rows[0].sValue;
        }
    } catch (e) {
        // Si la BD falla, se cae al .env para no tumbar el flujo de pago.
        console.error(`appConfig: error leyendo constante ${sKey}:`, e.message);
    }

    if ((value === null || value === undefined) && fallbackEnv) {
        const envVal = process.env[fallbackEnv];
        value = (envVal !== undefined && envVal !== '') ? envVal : null;
    }

    cache.set(sKey, { value, exp: now + CACHE_TTL_MS });
    return value;
};

/** Limpia la caché (útil tras editar constantes o en pruebas). */
const clearConfigCache = () => cache.clear();

module.exports = { getConfig, clearConfigCache };
