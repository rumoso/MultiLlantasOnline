const crypto = require('crypto');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { STATUS_ORDEN, STATUS_PAGO } = require('./constantes');
const { getConfig } = require('./appConfig');

/**
 * Utilidades de Mercado Pago: mapeo de estados, verificacion de firma del
 * webhook, y cliente de la API.
 *
 * Ver docs/modelo-datos-ordenes-pagos.md para el flujo completo.
 */

// ---------------------------------------------------------------------------
// Mapeo de estados de Mercado Pago -> catalogos propios
// (analisis 006, tabla de mapeo)
// ---------------------------------------------------------------------------
const MAPEO_ESTADOS = {
    approved: { pago: STATUS_PAGO.APROBADO, orden: STATUS_ORDEN.PAGADA },
    pending: { pago: STATUS_PAGO.PENDIENTE, orden: STATUS_ORDEN.PENDIENTE },
    in_process: { pago: STATUS_PAGO.EN_PROCESO, orden: STATUS_ORDEN.PENDIENTE },
    // Un rechazo NO cancela la orden: el cliente puede reintentar con otra tarjeta.
    rejected: { pago: STATUS_PAGO.RECHAZADO, orden: STATUS_ORDEN.PENDIENTE },
    cancelled: { pago: STATUS_PAGO.CANCELADO, orden: STATUS_ORDEN.CANCELADA },
    refunded: { pago: STATUS_PAGO.REEMBOLSADO, orden: STATUS_ORDEN.REEMBOLSADA },
    // Contracargo: la orden conserva su estado, pero el pago se marca en mediacion
    // y el evento queda para revision manual de la tienda.
    charged_back: { pago: STATUS_PAGO.EN_MEDIACION, orden: null }
};

/**
 * Traduce un estado de Mercado Pago a los codigos propios.
 * Devuelve null si el estado es desconocido — el llamador NO debe modificar
 * la orden en ese caso, solo registrarlo (analisis 006, criterio 12).
 */
const mapearEstado = (statusMP) => {
    return MAPEO_ESTADOS[statusMP] || null;
};

/**
 * Estados de pago que ya son finales: una notificacion vieja que llegue tarde
 * no puede revertir una orden desde uno de estos (analisis 006, criterio 14).
 */
const ESTADOS_PAGO_FINALES = [
    STATUS_PAGO.REEMBOLSADO,
    STATUS_PAGO.EN_MEDIACION
];

/**
 * Decide si se permite pasar del estado de pago actual al nuevo.
 * Reglas:
 *  - Nunca se retrocede desde un estado final (REEMBOLSADO / EN_MEDIACION),
 *    salvo hacia otro final (un reembolso puede terminar en contracargo).
 *  - Nunca se retrocede desde APROBADO hacia PENDIENTE / EN_PROCESO
 *    (notificacion vieja fuera de orden).
 */
const transicionPermitida = (estadoActual, estadoNuevo) => {
    if (!estadoActual) return true;
    if (estadoActual === estadoNuevo) return true;

    if (ESTADOS_PAGO_FINALES.includes(estadoActual)) {
        return ESTADOS_PAGO_FINALES.includes(estadoNuevo);
    }

    if (estadoActual === STATUS_PAGO.APROBADO) {
        // Desde aprobado solo se avanza a reembolso / contracargo.
        return ESTADOS_PAGO_FINALES.includes(estadoNuevo);
    }

    return true;
};

// ---------------------------------------------------------------------------
// Verificacion de la firma del webhook
// ---------------------------------------------------------------------------
/**
 * Valida el header x-signature que manda Mercado Pago.
 *
 * Formato del header: "ts=1704908010,v1=<hash hex>"
 * El manifest que se firma es: id:<dataId>;request-id:<xRequestId>;ts:<ts>;
 * y se firma con HMAC-SHA256 usando MP_WEBHOOK_SECRET.
 *
 * Sin esta verificacion cualquiera puede hacer POST diciendo "pago aprobado"
 * (analisis 006, criterio 9).
 */
const verificarFirmaWebhook = ({ xSignature, xRequestId, dataId, secret }) => {
    if (!xSignature || !secret || !dataId) return false;

    const partes = String(xSignature).split(',');
    let ts = null;
    let hash = null;

    for (const parte of partes) {
        const [clave, valor] = parte.split('=').map(s => s && s.trim());
        if (clave === 'ts') ts = valor;
        if (clave === 'v1') hash = valor;
    }

    if (!ts || !hash) return false;

    const manifest = `id:${String(dataId).toLowerCase()};request-id:${xRequestId || ''};ts:${ts};`;
    const esperado = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

    // Comparacion en tiempo constante para no filtrar informacion por timing.
    const bufEsperado = Buffer.from(esperado, 'hex');
    const bufRecibido = Buffer.from(hash, 'hex');
    if (bufEsperado.length !== bufRecibido.length) return false;

    return crypto.timingSafeEqual(bufEsperado, bufRecibido);
};

// ---------------------------------------------------------------------------
// Cliente de la API
// ---------------------------------------------------------------------------
const getClient = async () => {
    // Se lee de la tabla `constantes` (administrable desde el Admin); si falta,
    // cae al .env (MP_ACCESS_TOKEN).
    const accessToken = await getConfig('MP_ACCESS_TOKEN', 'MP_ACCESS_TOKEN');
    if (!accessToken) {
        throw new Error('MP_ACCESS_TOKEN no esta configurado (ni en constantes ni en .env)');
    }
    return new MercadoPagoConfig({ accessToken });
};

/**
 * Consulta el pago en la API de Mercado Pago.
 * La notificacion del webhook solo avisa "paso algo con el pago X"; el estado
 * real se obtiene aqui (analisis 006, criterio 10).
 */
const consultarPago = async (paymentId) => {
    const payment = new Payment(await getClient());
    return await payment.get({ id: paymentId });
};

/**
 * Crea la preferencia de pago.
 *
 * Sobre meses sin intereses (MSI): OJO, la disponibilidad de MSI se define
 * principalmente en el PANEL de la cuenta de Mercado Pago (promociones /
 * costos), no solo desde la API. Aqui se limita el numero maximo de cuotas,
 * pero para asegurar que no se ofrezcan MSI hay que verificarlo tambien en el
 * panel de la cuenta. No basta con este archivo (analisis 006, criterio 16).
 */
const crearPreferencia = async ({ idOrder, items, total, costoEnvio = 0, emailComprador }) => {
    const preference = new Preference(await getClient());

    // Config leída de `constantes` (Admin) con respaldo al .env.
    const [horasRaw, successUrl, failureUrl, pendingUrl, notificationUrl] = await Promise.all([
        getConfig('MP_EXPIRACION_HORAS', 'MP_EXPIRACION_HORAS'),
        getConfig('MP_SUCCESS_URL', 'MP_SUCCESS_URL'),
        getConfig('MP_FAILURE_URL', 'MP_FAILURE_URL'),
        getConfig('MP_PENDING_URL', 'MP_PENDING_URL'),
        getConfig('MP_NOTIFICATION_URL', 'MP_NOTIFICATION_URL')
    ]);

    const horas = parseInt(horasRaw || '72', 10);
    const expiraEn = new Date(Date.now() + horas * 60 * 60 * 1000);
    // Mercado Pago rechaza auto_return si la URL de retorno es localhost:
    // exige una direccion publicamente alcanzable. En desarrollo se omite
    // (el usuario regresa con el boton "Volver al sitio") y en produccion,
    // con el dominio real, el regreso vuelve a ser automatico.
    const esLocal = /localhost|127\.0\.0\.1/.test(successUrl || '');

    const body = {
        items: items.map(it => ({
            id: String(it.idProducto),
            title: it.nombre,
            quantity: Number(it.cantidad),
            unit_price: Number(it.precio),
            currency_id: 'MXN'
        })),
        // La orden es la referencia externa: asi el webhook sabe a quien aplicarle el pago.
        external_reference: String(idOrder),
        payer: emailComprador ? { email: emailComprador } : undefined,
        back_urls: {
            success: successUrl,
            failure: failureUrl,
            pending: pendingUrl
        },
        ...(esLocal ? {} : { auto_return: 'approved' }),
        // A donde Mercado Pago notifica el resultado del pago (servidor a
        // servidor). Sin esto la orden nunca pasa de PENDIENTE. En produccion
        // es el dominio real del backend; en local, el tunel publico.
        ...(notificationUrl
            ? { notification_url: notificationUrl }
            : {}),
        // El costo de envio se cobra aparte de los items. Sin esto Mercado Pago
        // solo cobraria la suma de los productos y el envio saldria gratis.
        ...(Number(costoEnvio) > 0
            ? { shipments: { cost: Number(costoEnvio), mode: 'not_specified' } }
            : {}),
        payment_methods: {
            // `installments` SOLO limita el NUMERO maximo de mensualidades; no
            // controla si son con interes o sin interes (MSI).
            installments: 12,
            // Por defecto se muestra el pago de contado seleccionado.
            default_installments: 1
            // ----------------------------------------------------------------
            // MESES SIN INTERESES (MSI): la decision del negocio es permitir
            // cuotas CON interes (las paga el comprador) y NO ofrecer MSI (que
            // las pagaria la tienda). Pero MSI NO se apaga desde aqui: el API
            // de Checkout Pro no tiene una bandera "excluir MSI". Se controla
            // en el PANEL de Mercado Pago (cuenta real, no la de prueba):
            //   Tu negocio > Costos / Cuotas sin interes > desactivar.
            // En sandbox seguira apareciendo MSI porque la cuenta de prueba lo
            // trae activo por defecto; eso NO refleja produccion.
            // ----------------------------------------------------------------
        },
        expires: true,
        expiration_date_to: expiraEn.toISOString()
    };

    const creada = await preference.create({ body });

    // Mercado Pago DESCARTA EN SILENCIO las back_urls que apuntan a
    // localhost: las guarda como cadena vacia sin avisar. El efecto es que
    // el comprador se queda atrapado en el sitio de MP porque no hay a donde
    // volver (y el pago puede fallar al final). Como no da error, hay que
    // detectarlo aqui o se descubre mucho despues y de la peor manera.
    const urlsGuardadas = creada.back_urls || {};
    if (successUrl && !urlsGuardadas.success) {
        console.warn(
            '[mercadoPago] AVISO: Mercado Pago descarto las URLs de retorno.\n' +
            `  Se enviaron: ${successUrl}\n` +
            '  MP no acepta localhost/127.0.0.1 como back_url. El comprador no\n' +
            '  podra regresar al sitio y el pago puede fallar al finalizar.\n' +
            '  Para probar en local: exponer el Front con un tunel publico y\n' +
            '  apuntar MP_SUCCESS_URL/FAILURE/PENDING a esa URL.'
        );
    }

    // Red de seguridad: lo que Mercado Pago va a cobrar debe coincidir con el
    // total calculado por el servidor. Si no cuadra, es preferible fallar aqui
    // que cobrarle al cliente un importe distinto al que acepto.
    if (total != null) {
        const cobrara = (creada.items || []).reduce((acc, i) => acc + Number(i.unit_price) * Number(i.quantity), 0)
            + Number((creada.shipments && creada.shipments.cost) || 0);
        if (Math.abs(cobrara - Number(total)) > 0.01) {
            throw new Error(
                `La preferencia cobraria ${cobrara} pero la orden es de ${total}. No se inicia el pago.`
            );
        }
    }

    return creada;
};

module.exports = {
    MAPEO_ESTADOS,
    mapearEstado,
    transicionPermitida,
    ESTADOS_PAGO_FINALES,
    verificarFirmaWebhook,
    consultarPago,
    crearPreferencia
};
