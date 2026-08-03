const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const {
    getResumenCheckout,
    getSucursales,
    crearOrden,
    webhookMercadoPago,
    getEstadoOrden
} = require('../controllers/checkoutController');

const router = Router();

router.post('/resumen', [
    validarJWT
], getResumenCheckout);

router.post('/sucursales', [
    validarJWT
], getSucursales);

router.post('/crear-orden', [
    validarJWT,
    check('metodoEntrega', 'El metodo de entrega es obligatorio').not().isEmpty(),
    validarCampos
], crearOrden);

router.post('/estado-orden', [
    validarJWT,
    check('idOrder', 'El ID de la orden es obligatorio').not().isEmpty(),
    validarCampos
], getEstadoOrden);

/**
 * WEBHOOK DE MERCADO PAGO — endpoint PUBLICO, sin validarJWT.
 *
 * Esta es la UNICA excepcion al patron de autenticacion del proyecto: lo llama
 * Mercado Pago (servidor a servidor), no el usuario, asi que no hay sesion ni
 * token que validar. Su autenticacion es la FIRMA (header x-signature), que se
 * verifica dentro del controller ANTES de tocar nada.
 *
 * No agregar validarJWT aqui: rompería las notificaciones de pago.
 */
router.post('/webhook', webhookMercadoPago);

module.exports = router;
