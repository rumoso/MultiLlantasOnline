const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const {
    getMyAccount,
    updateMyAccount,
    changePassword,
    getMyAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setAddressPrincipal
} = require('../controllers/accountController');

const router = Router();

router.post('/get', [
    validarJWT
], getMyAccount);

router.post('/update', [
    validarJWT,
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], updateMyAccount);

router.post('/change-password', [
    validarJWT,
    check('pwdActual', 'La contraseña actual es obligatoria').not().isEmpty(),
    check('pwdNueva', 'La contraseña nueva debe tener al menos 6 caracteres').isLength({ min: 6 }),
    check('pwdNueva2', 'Debes confirmar la contraseña nueva').not().isEmpty(),
    validarCampos
], changePassword);

router.post('/addresses/get', [
    validarJWT
], getMyAddresses);

router.post('/addresses/add', [
    validarJWT,
    check('calle', 'La calle es obligatoria').not().isEmpty(),
    check('codigoPostal', 'El código postal es obligatorio').not().isEmpty(),
    validarCampos
], addAddress);

router.post('/addresses/update', [
    validarJWT,
    check('idAddress', 'El ID de la dirección es obligatorio').not().isEmpty(),
    check('calle', 'La calle es obligatoria').not().isEmpty(),
    check('codigoPostal', 'El código postal es obligatorio').not().isEmpty(),
    validarCampos
], updateAddress);

router.post('/addresses/delete', [
    validarJWT,
    check('idAddress', 'El ID de la dirección es obligatorio').not().isEmpty(),
    validarCampos
], deleteAddress);

router.post('/addresses/set-principal', [
    validarJWT,
    check('idAddress', 'El ID de la dirección es obligatorio').not().isEmpty(),
    validarCampos
], setAddressPrincipal);

module.exports = router;
