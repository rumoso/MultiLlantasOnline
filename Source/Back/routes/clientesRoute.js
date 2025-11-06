const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')
const { STRING_REGEX, STRING_MSG } = require('../utils/validaciones');

const { 
  getClientesListWithPage
  , getClienteByID
  , insertUpdateCliente
  , deleteCliente
  , cbxTipoCliente

  , cbxGetClientesParaVentasClientes
  , getClienteByTel
  , cbxGetTipoClienteEmprendedores
   } = require('../controllers/clientesController');

   
const router = Router();

router.post('/getClientesListWithPage', getClientesListWithPage);

router.post('/getClienteByID', [
  check('idCliente','Id obligatorio').not().isEmpty(),
  check('idCliente','Id debe ser numérico').isNumeric(),
  validarCampos
], getClienteByID);

router.post('/insertUpdateCliente', [
  check('nombre','Nombre obligatorio').not().isEmpty()
  .matches(STRING_REGEX)
  .withMessage(`El nombre ${ STRING_MSG }`),

  validarCampos
], insertUpdateCliente);

router.post('/deleteCliente', [
  check('idCliente','Id de sucursal obligatorio').not().isEmpty(),
  check('idCliente','Id de sucursal debe ser numérico').isNumeric(),

  validarCampos
], deleteCliente);

router.post('/cbxTipoCliente', cbxTipoCliente);

router.post('/cbxGetClientesParaVentasClientes', cbxGetClientesParaVentasClientes);

router.post('/getClienteByTel', [
  check('telefono','El telefono obligatorio').not().isEmpty(),
  check('telefono','El telefono debe ser numérico').isNumeric(),

  validarCampos
], getClienteByTel);

router.post('/cbxGetTipoClienteEmprendedores', cbxGetTipoClienteEmprendedores);

module.exports = router;