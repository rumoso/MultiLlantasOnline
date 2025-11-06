const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
  cbxGetSucursalesCombo
  , cbxGetSucursales
  , getPrintTicketSuc
  , getSucursalesListWithPage
  , getSucursalByID
  , insertUpdateSucursal
  , deleteSucursal
  , getImpresoraTicketsData
   } = require('../controllers/sucursalesController');

   
const router = Router();

router.post('/cbxGetSucursalesCombo', [
  check('idUserLogON','Id del usuario obligatorio').not().isEmpty(),
  check('idUserLogON','Id del usuario debe ser numérico').isNumeric(),

  validarCampos
], cbxGetSucursalesCombo);

router.post('/cbxGetSucursales', [
  check('idUserLogON','Id del usuario obligatorio').not().isEmpty(),
  check('idUserLogON','Id del usuario debe ser numérico').isNumeric(),

  validarCampos
], cbxGetSucursales);

router.post('/getPrintTicketSuc', [
  check('idSucursal','Id de la sucursal obligatorio').not().isEmpty(),
  check('idSucursal','Id de la sucursal debe ser numérico').isNumeric(),

  check('type','El tipo es obligatorio').not().isEmpty(),

  validarCampos
], getPrintTicketSuc);

router.post('/getSucursalesListWithPage', getSucursalesListWithPage);

router.post('/getSucursalByID', [
  check('idSucursal','Id obligatorio').not().isEmpty(),
  check('idSucursal','Id debe ser numérico').isNumeric(),
  validarCampos
], getSucursalByID);

router.post('/insertUpdateSucursal', [
  check('name','Nombre obligatorio').not().isEmpty(),

  validarCampos
], insertUpdateSucursal);

router.post('/deleteSucursal', [
  check('idSucursal','Id de sucursal obligatorio').not().isEmpty(),
  check('idSucursal','Id de sucursal debe ser numérico').isNumeric(),

  validarCampos
], deleteSucursal);

router.post('/getImpresoraTicketsData', [
  check('idSucursal','Id de sucursal obligatorio').not().isEmpty(),
  check('idSucursal','Id de sucursal debe ser numérico').isNumeric(),

  validarCampos
], getImpresoraTicketsData);

getImpresoraTicketsData

module.exports = router;