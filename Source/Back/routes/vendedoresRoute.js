const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')
const { STRING_REGEX, STRING_MSG } = require('../utils/validaciones');

const { 
  getVendedoresListWithPage
  , getVendedorByID
  , insertUpdateVendedor
  , deleteVendedor
  , cbxGetVendedores
   } = require('../controllers/vendedoresController');

   
const router = Router();

router.post('/getVendedoresListWithPage', getVendedoresListWithPage);

router.post('/getVendedorByID', [
  check('idVendedor','Id obligatorio').not().isEmpty(),
  check('idVendedor','Id debe ser numérico').isNumeric(),
  validarCampos
], getVendedorByID);

router.post('/insertUpdateVendedor', [
  check('nombre','Nombre obligatorio').not().isEmpty()
  .matches(STRING_REGEX)
  .withMessage(`El nombre ${ STRING_MSG }`),

  validarCampos
], insertUpdateVendedor);

router.post('/deleteVendedor', [
  check('idVendedor','Id de sucursal obligatorio').not().isEmpty(),
  check('idVendedor','Id de sucursal debe ser numérico').isNumeric(),

  validarCampos
], deleteVendedor);

router.post('/cbxGetVendedores', cbxGetVendedores);

module.exports = router;