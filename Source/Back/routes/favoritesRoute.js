const { Router } = require('express');
const { check } = require('express-validator')
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, validarJWTOptional } = require('../middlewares/validar-jwt');
const { getMyFavorites, toggleFavorite } = require('../controllers/favoritesController');

const router = Router();

router.post('/get', [
    validarJWTOptional,
    validarCampos
], getMyFavorites);

router.post('/toggle', [
    validarJWTOptional,
    check('idProducto', 'El idProducto es obligatorio').not().isEmpty(),
    validarCampos
], toggleFavorite);

module.exports = router;
