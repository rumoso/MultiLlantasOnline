const { Router } = require('express');
const { getMyPurchases, getOrderDetails } = require('../controllers/ordersController');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.post('/my-purchases', [
    validarJWT
], getMyPurchases);

router.post('/get-details', [
    validarJWT
], getOrderDetails);

module.exports = router;
