const { Router } = require('express');
const { getMyPurchases, getOrderDetails } = require('../controllers/ordersController');
const { validarJWT, validarJWTOptional } = require('../middlewares/validar-jwt');

const router = Router();

router.post('/my-purchases', [
    validarJWTOptional
], getMyPurchases);

router.post('/get-details', [
    validarJWTOptional
], getOrderDetails);

module.exports = router;
