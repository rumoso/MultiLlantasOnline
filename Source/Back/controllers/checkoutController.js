const { response } = require('express');
const { dbConnection } = require('../database/config');
const { STATUS_ORDEN, STATUS_PAGO } = require('../utils/constantes');
const {
    mapearEstado,
    transicionPermitida,
    verificarFirmaWebhook,
    consultarPago,
    crearPreferencia
} = require('../utils/mercadoPago');

const METODO_ENVIO = 'ENVIO';
const METODO_RETIRO = 'RETIRO';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

const getIdStatus = async (tabla, columnaId, codigo, transaction = null) => {
    const [rows] = await dbConnection.query(
        `SELECT ${columnaId} AS id FROM ${tabla} WHERE codigo = ? LIMIT 1`,
        { replacements: [codigo], transaction }
    );
    if (rows.length === 0) throw new Error(`No existe el status ${codigo} en ${tabla}`);
    return rows[0].id;
};

const getIdStatusOrden = (codigo, tran) => getIdStatus('cat_status_ordenes', 'idStatusOrden', codigo, tran);
const getIdStatusPago = (codigo, tran) => getIdStatus('cat_status_pagos', 'idStatusPago', codigo, tran);

/**
 * Busca la tarifa de envio para un codigo postal.
 * Devuelve null si el CP no esta cubierto — en ese caso NO se inventa un costo
 * por defecto, simplemente no se ofrece envio (analisis 006, criterio 3).
 */
const buscarTarifaEnvio = async (codigoPostal, transaction = null) => {
    if (!codigoPostal) return null;
    const cp = String(codigoPostal).trim().padStart(5, '0');

    const [rows] = await dbConnection.query(
        `SELECT idShippingRate, zona, costo
         FROM shipping_rates
         WHERE activo = 1 AND ? BETWEEN cpDesde AND cpHasta
         ORDER BY idShippingRate LIMIT 1`,
        { replacements: [cp], transaction }
    );
    return rows.length > 0 ? rows[0] : null;
};

/**
 * EL CALCULO AUTORITATIVO DEL PEDIDO.
 *
 * Se ejecuta siempre en el servidor a partir de la BD. Nunca acepta montos,
 * precios ni costos de envio que venga del navegador (analisis 006, criterio 4).
 * Lo usan tanto el resumen (solo lectura) como la creacion de la orden, para
 * que sea imposible que muestren numeros distintos a los que se cobran.
 */
const calcularResumen = async ({ idUser, metodoEntrega, idAddress, transaction = null }) => {
    // 1. Items del carrito, con el precio ACTUAL de productos (cart_items.precio
    //    esta congelado desde que se agrego y puede estar viejo). NO se maneja
    //    stock: la disponibilidad la controla el proveedor, no esta tienda.
    const [items] = await dbConnection.query(
        `SELECT ci.idProducto, ci.cantidad,
                p.nombre, p.precio AS precioActual, p.activo
         FROM cart_items ci
         INNER JOIN carts c ON ci.idCart = c.idCart
         INNER JOIN productos p ON ci.idProducto = p.idProducto
         WHERE c.idUser = ?
         ORDER BY ci.keyx`,
        { replacements: [idUser], transaction }
    );

    if (items.length === 0) {
        return { vacio: true, items: [], subtotal: 0, costoEnvio: 0, total: 0 };
    }

    const itemsCalculados = items.map(it => ({
        idProducto: it.idProducto,
        nombre: it.nombre,
        cantidad: Number(it.cantidad),
        precio: Number(it.precioActual),
        subtotal: Number((Number(it.precioActual) * Number(it.cantidad)).toFixed(2)),
        activo: !!it.activo
    }));

    const subtotal = Number(itemsCalculados.reduce((acc, it) => acc + it.subtotal, 0).toFixed(2));

    // 2. Envio
    let costoEnvio = 0;
    let direccion = null;
    let envioDisponible = true;
    let motivoEnvio = null;

    if (metodoEntrega === METODO_ENVIO) {
        if (!idAddress) {
            envioDisponible = false;
            motivoEnvio = 'No se selecciono una direccion de envio';
        } else {
            // La direccion debe pertenecer al usuario de la sesion.
            const [dirRows] = await dbConnection.query(
                `SELECT idAddress, codigoPostal, calle, numExt, numInt, entreCalles,
                        colonia, ciudad, municipio, estado
                 FROM addresses WHERE idAddress = ? AND idUser = ? LIMIT 1`,
                { replacements: [idAddress, idUser], transaction }
            );

            if (dirRows.length === 0) {
                envioDisponible = false;
                motivoEnvio = 'Direccion no encontrada';
            } else {
                direccion = dirRows[0];
                const tarifa = await buscarTarifaEnvio(direccion.codigoPostal, transaction);
                if (!tarifa) {
                    envioDisponible = false;
                    motivoEnvio = `No hay cobertura de envio para el codigo postal ${direccion.codigoPostal}. Puedes elegir recoger en tienda.`;
                } else {
                    costoEnvio = Number(tarifa.costo);
                }
            }
        }
    }

    const total = Number((subtotal + costoEnvio).toFixed(2));

    return {
        vacio: false,
        items: itemsCalculados,
        subtotal,
        costoEnvio,
        total,
        direccion,
        envioDisponible,
        motivoEnvio,
        // Se sigue validando que los productos esten ACTIVOS (a la venta),
        // pero no que haya existencia: el stock lo maneja el proveedor.
        productosValidos: itemsCalculados.every(it => it.activo)
    };
};

// ---------------------------------------------------------------------------
// T8/T9 — Resumen del checkout (solo lectura, no escribe nada)
// ---------------------------------------------------------------------------
const getResumenCheckout = async (req, res = response) => {
    const idUser = req.uid;
    const { metodoEntrega, idAddress } = req.body;

    try {
        const resumen = await calcularResumen({
            idUser,
            metodoEntrega: metodoEntrega || METODO_RETIRO,
            idAddress
        });

        if (resumen.vacio) {
            return res.json({
                status: 1,
                message: 'Tu carrito esta vacio',
                data: null
            });
        }

        res.json({
            status: 0,
            message: 'Resumen calculado',
            data: resumen
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al calcular el resumen',
            data: error.message
        });
    }
};

// ---------------------------------------------------------------------------
// T10 — Sucursales para retiro en tienda
// ---------------------------------------------------------------------------
const getSucursales = async (req, res = response) => {
    try {
        const [rows] = await dbConnection.query(
            `SELECT idSucursal, nombre, direccion, horario, telefono
             FROM sucursales WHERE activo = 1 ORDER BY nombre`
        );
        res.json({ status: 0, message: 'Sucursales obtenidas', data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 2, message: 'Error al obtener sucursales', data: error.message });
    }
};

// ---------------------------------------------------------------------------
// T11/T12 — Crear la orden y la preferencia de pago
// ---------------------------------------------------------------------------
const crearOrden = async (req, res = response) => {
    const idUser = req.uid;
    const { metodoEntrega, idAddress, idSucursal } = req.body;

    if (![METODO_ENVIO, METODO_RETIRO].includes(metodoEntrega)) {
        return res.status(400).json({ status: 2, message: 'Metodo de entrega invalido' });
    }

    const tran = await dbConnection.transaction();
    let idOrder = null;
    let resumen = null;

    try {
        // Se RECALCULA todo aqui. Lo que haya mandado el navegador es irrelevante.
        resumen = await calcularResumen({ idUser, metodoEntrega, idAddress, transaction: tran });

        if (resumen.vacio) {
            await tran.rollback();
            return res.json({ status: 1, message: 'Tu carrito esta vacio', data: null });
        }

        if (!resumen.productosValidos) {
            await tran.rollback();
            const noDisponibles = resumen.items.filter(it => !it.activo).map(it => it.nombre);
            return res.json({
                status: 1,
                message: `Estos productos ya no estan disponibles: ${noDisponibles.join(', ')}`,
                data: null
            });
        }

        if (metodoEntrega === METODO_ENVIO && !resumen.envioDisponible) {
            await tran.rollback();
            return res.json({ status: 1, message: resumen.motivoEnvio, data: null });
        }

        let sucursalValida = null;
        if (metodoEntrega === METODO_RETIRO) {
            const [suc] = await dbConnection.query(
                'SELECT idSucursal FROM sucursales WHERE idSucursal = ? AND activo = 1 LIMIT 1',
                { replacements: [idSucursal], transaction: tran }
            );
            if (suc.length === 0) {
                await tran.rollback();
                return res.json({ status: 1, message: 'Selecciona una sucursal valida', data: null });
            }
            sucursalValida = suc[0].idSucursal;
        }

        const idStatusOrdenPend = await getIdStatusOrden(STATUS_ORDEN.PENDIENTE, tran);
        const idStatusPagoPend = await getIdStatusPago(STATUS_PAGO.PENDIENTE, tran);
        const dir = resumen.direccion;

        // La orden nace PENDIENTE. No se descuenta stock ni se vacia el carrito
        // todavia: eso ocurre cuando el webhook confirme el pago.
        const [insertResult] = await dbConnection.query(
            `INSERT INTO orders
                (idUser, subtotal, costoEnvio, total, metodoEntrega, idSucursal,
                 idStatusOrden, idStatusPago, createDate, updateDate,
                 envioCodigoPostal, envioCalle, envioNumExt, envioNumInt, envioEntreCalles,
                 envioColonia, envioCiudad, envioMunicipio, envioEstado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    idUser, resumen.subtotal, resumen.costoEnvio, resumen.total,
                    metodoEntrega, sucursalValida,
                    idStatusOrdenPend, idStatusPagoPend,
                    // Snapshot de la direccion: copia de texto, no FK (criterio 20)
                    dir ? dir.codigoPostal : null,
                    dir ? dir.calle : null,
                    dir ? dir.numExt : null,
                    dir ? dir.numInt : null,
                    dir ? dir.entreCalles : null,
                    dir ? dir.colonia : null,
                    dir ? dir.ciudad : null,
                    dir ? dir.municipio : null,
                    dir ? dir.estado : null
                ],
                transaction: tran
            }
        );

        idOrder = insertResult;

        for (const it of resumen.items) {
            await dbConnection.query(
                `INSERT INTO order_details (idOrder, idProducto, cantidad, precio, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                { replacements: [idOrder, it.idProducto, it.cantidad, it.precio, it.subtotal], transaction: tran }
            );
        }

        await tran.commit();
    } catch (error) {
        await tran.rollback();
        console.error('Error creando la orden:', error);
        return res.status(500).json({ status: 2, message: 'Error al crear la orden', data: error.message });
    }

    // La preferencia se crea FUERA de la transaccion: si Mercado Pago falla,
    // la orden ya existe en PENDIENTE y se puede reintentar el pago.
    try {
        const [userRows] = await dbConnection.query(
            'SELECT email, userName FROM users WHERE idUser = ? LIMIT 1',
            { replacements: [idUser] }
        );
        const email = userRows.length > 0 ? (userRows[0].email || null) : null;

        const pref = await crearPreferencia({
            idOrder,
            items: resumen.items,
            total: resumen.total,
            costoEnvio: resumen.costoEnvio,
            emailComprador: email
        });

        await dbConnection.query(
            'UPDATE orders SET preferenceId = ?, updateDate = NOW() WHERE idOrder = ?',
            { replacements: [pref.id, idOrder] }
        );

        res.json({
            status: 0,
            message: 'Orden creada',
            data: {
                idOrder,
                preferenceId: pref.id,
                initPoint: pref.init_point,
                sandboxInitPoint: pref.sandbox_init_point,
                total: resumen.total
            }
        });
    } catch (error) {
        console.error('Error creando la preferencia de pago:', error);
        // La orden quedo creada en PENDIENTE; se informa para poder reintentar.
        res.status(502).json({
            status: 2,
            message: 'La orden se creo pero no se pudo iniciar el pago. Intenta de nuevo.',
            data: { idOrder, error: error.message }
        });
    }
};

// ---------------------------------------------------------------------------
// T15-T22 — Webhook de Mercado Pago
// ---------------------------------------------------------------------------

/**
 * Aplica los efectos de un pago aprobado: vacia el carrito del usuario.
 * NO se descuenta stock: la existencia la maneja el proveedor, no esta tienda.
 */
const aplicarEfectosPagoAprobado = async ({ idUser, transaction }) => {
    // El carrito se vacia solo cuando el pago quedo confirmado.
    await dbConnection.query(
        `DELETE ci FROM cart_items ci
         INNER JOIN carts c ON ci.idCart = c.idCart
         WHERE c.idUser = ?`,
        { replacements: [idUser], transaction }
    );
};

const webhookMercadoPago = async (req, res = response) => {
    // ATENCION: este endpoint es PUBLICO y es la UNICA excepcion al patron de
    // validarJWT del proyecto. Lo llama Mercado Pago, no el usuario, y su
    // autenticacion es la FIRMA (x-signature), no un token de sesion.

    try {
        const dataId = (req.query['data.id'] || req.query.id || (req.body && req.body.data && req.body.data.id));
        const tipo = req.query.type || (req.body && req.body.type);

        // Solo interesan las notificaciones de pagos.
        if (tipo && tipo !== 'payment') {
            return res.status(200).json({ status: 0, message: 'Notificacion ignorada (no es de pago)' });
        }

        if (!dataId) {
            return res.status(400).json({ status: 2, message: 'Falta el id del pago' });
        }

        // --- T16: verificar la firma ANTES de confiar en nada ---
        const firmaValida = verificarFirmaWebhook({
            xSignature: req.headers['x-signature'],
            xRequestId: req.headers['x-request-id'],
            dataId,
            secret: process.env.MP_WEBHOOK_SECRET
        });

        if (!firmaValida) {
            console.warn('Webhook con firma invalida o ausente. Se rechaza.');
            return res.status(401).json({ status: 2, message: 'Firma invalida' });
        }

        // --- T17: la notificacion solo avisa; el estado real lo da la API ---
        const pago = await consultarPago(dataId);
        if (!pago) {
            return res.status(404).json({ status: 2, message: 'Pago no encontrado en Mercado Pago' });
        }

        const statusMP = pago.status;
        const idOrder = parseInt(pago.external_reference, 10);
        const mapeo = mapearEstado(statusMP);

        if (!mapeo) {
            // Estado desconocido: se registra y NO se toca la orden (criterio 12).
            console.error(`Estado de Mercado Pago desconocido: "${statusMP}" (pago ${dataId}, orden ${idOrder})`);
            return res.status(200).json({ status: 0, message: 'Estado desconocido, registrado sin aplicar cambios' });
        }

        if (!idOrder) {
            console.error(`Pago ${dataId} sin external_reference valido`);
            return res.status(200).json({ status: 0, message: 'Pago sin orden asociada' });
        }

        const tran = await dbConnection.transaction();
        try {
            const [ordenRows] = await dbConnection.query(
                `SELECT o.idOrder, o.idUser, sp.codigo AS codigoPagoActual
                 FROM orders o
                 INNER JOIN cat_status_pagos sp ON o.idStatusPago = sp.idStatusPago
                 WHERE o.idOrder = ? LIMIT 1`,
                { replacements: [idOrder], transaction: tran }
            );

            if (ordenRows.length === 0) {
                await tran.rollback();
                return res.status(200).json({ status: 0, message: 'Orden no encontrada' });
            }

            const orden = ordenRows[0];

            // --- T18: idempotencia ---
            // La llave es paymentId + estado. OJO: en OXXO llega primero "pending"
            // y dias despues el MISMO paymentId como "approved"; si se ignorara por
            // ser el mismo id, los pagos en efectivo nunca se completarian.
            const [pagoPrevio] = await dbConnection.query(
                'SELECT idOrderPayment, statusMP FROM order_payments WHERE paymentId = ? LIMIT 1',
                { replacements: [String(dataId)], transaction: tran }
            );

            const yaProcesadoIgual = pagoPrevio.length > 0 && pagoPrevio[0].statusMP === statusMP;
            if (yaProcesadoIgual) {
                await tran.commit();
                return res.status(200).json({ status: 0, message: 'Notificacion ya procesada (idempotente)' });
            }

            // --- T19: transiciones invalidas ---
            if (!transicionPermitida(orden.codigoPagoActual, mapeo.pago)) {
                await tran.commit();
                console.warn(`Transicion ignorada para orden ${idOrder}: ${orden.codigoPagoActual} -> ${mapeo.pago}`);
                return res.status(200).json({ status: 0, message: 'Transicion no permitida, se ignora' });
            }

            const idStatusPagoNuevo = await getIdStatusPago(mapeo.pago, tran);

            // Registrar / actualizar el evento de pago
            const montoCobrado = pago.transaction_amount || null;
            const montoNeto = (pago.transaction_details && pago.transaction_details.net_received_amount) || null;
            const metodoPago = pago.payment_method_id || null;

            if (pagoPrevio.length > 0) {
                await dbConnection.query(
                    `UPDATE order_payments
                     SET statusMP = ?, idStatusPago = ?, metodoPago = ?,
                         montoCobrado = ?, montoNeto = ?, updateDate = NOW()
                     WHERE idOrderPayment = ?`,
                    {
                        replacements: [statusMP, idStatusPagoNuevo, metodoPago, montoCobrado, montoNeto, pagoPrevio[0].idOrderPayment],
                        transaction: tran
                    }
                );
            } else {
                await dbConnection.query(
                    `INSERT INTO order_payments
                        (idOrder, paymentId, preferenceId, statusMP, idStatusPago, metodoPago,
                         montoCobrado, montoNeto, createDate, updateDate)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                    {
                        replacements: [
                            idOrder, String(dataId), pago.preference_id || null, statusMP,
                            idStatusPagoNuevo, metodoPago, montoCobrado, montoNeto
                        ],
                        transaction: tran
                    }
                );
            }

            // Actualizar la orden
            if (mapeo.orden) {
                const idStatusOrdenNuevo = await getIdStatusOrden(mapeo.orden, tran);
                await dbConnection.query(
                    'UPDATE orders SET idStatusOrden = ?, idStatusPago = ?, updateDate = NOW() WHERE idOrder = ?',
                    { replacements: [idStatusOrdenNuevo, idStatusPagoNuevo, idOrder], transaction: tran }
                );
            } else {
                // charged_back: el estado de la orden se conserva, solo cambia el pago.
                await dbConnection.query(
                    'UPDATE orders SET idStatusPago = ?, updateDate = NOW() WHERE idOrder = ?',
                    { replacements: [idStatusPagoNuevo, idOrder], transaction: tran }
                );
            }

            // --- Efectos SOLO al pasar a aprobado, y solo una vez ---
            // (vaciar el carrito). No se toca stock: lo maneja el proveedor.
            const yaEstabaAprobado = orden.codigoPagoActual === STATUS_PAGO.APROBADO;
            if (mapeo.pago === STATUS_PAGO.APROBADO && !yaEstabaAprobado) {
                await aplicarEfectosPagoAprobado({
                    idUser: orden.idUser,
                    transaction: tran
                });
            }

            // charged_back siempre requiere que la tienda se entere (criterio 13).
            if (mapeo.pago === STATUS_PAGO.EN_MEDIACION) {
                await dbConnection.query(
                    `UPDATE order_payments SET revisionManual = 1,
                     notaRevision = 'Contracargo: el dinero sera retirado. Requiere atencion.'
                     WHERE paymentId = ?`,
                    { replacements: [String(dataId)], transaction: tran }
                );
            }

            await tran.commit();
            return res.status(200).json({ status: 0, message: 'Notificacion procesada' });
        } catch (error) {
            await tran.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error procesando el webhook:', error);
        // 500 para que Mercado Pago reintente (el handler es idempotente).
        return res.status(500).json({ status: 2, message: 'Error procesando la notificacion' });
    }
};

// ---------------------------------------------------------------------------
// Consulta del estado de una orden (para la pantalla de resultado)
// ---------------------------------------------------------------------------
const getEstadoOrden = async (req, res = response) => {
    const idUser = req.uid;
    const { idOrder } = req.body;

    if (!idOrder) {
        return res.status(400).json({ status: 2, message: 'El ID de la orden es obligatorio' });
    }

    try {
        const [rows] = await dbConnection.query(
            `SELECT o.idOrder, o.total, o.subtotal, o.costoEnvio, o.metodoEntrega,
                    so.codigo AS codigoOrden, so.nombre AS statusOrden, so.color AS colorOrden,
                    sp.codigo AS codigoPago, sp.nombre AS statusPago, sp.color AS colorPago
             FROM orders o
             INNER JOIN cat_status_ordenes so ON o.idStatusOrden = so.idStatusOrden
             INNER JOIN cat_status_pagos sp ON o.idStatusPago = sp.idStatusPago
             WHERE o.idOrder = ? AND o.idUser = ? LIMIT 1`,
            { replacements: [idOrder, idUser] }
        );

        if (rows.length === 0) {
            return res.status(404).json({ status: 2, message: 'Orden no encontrada' });
        }

        res.json({ status: 0, message: 'Estado obtenido', data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 2, message: 'Error al consultar la orden', data: error.message });
    }
};

module.exports = {
    getResumenCheckout,
    getSucursales,
    crearOrden,
    webhookMercadoPago,
    getEstadoOrden,
    // exportados para pruebas
    calcularResumen,
    buscarTarifaEnvio
};
