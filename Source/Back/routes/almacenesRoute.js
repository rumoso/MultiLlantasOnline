const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
  getAlmacenesPaginado
  , getAlmacenByID
  , insertUpdateAlmacen
  , deleteAlmacen
  , cbxCatRelacionOrigen
   } = require('../controllers/almacenesController');

   
const router = Router();

router.post('/getAlmacenesPaginado', getAlmacenesPaginado);

router.post('/getAlmacenByID', [
  check('idAlmacen','Id obligatorio').not().isEmpty(),
  check('idAlmacen','Id debe ser numérico').isNumeric(),
  validarCampos
], getAlmacenByID);

router.post('/insertUpdateAlmacen', [
  check('name','Nombre obligatorio').not().isEmpty(),

  validarCampos
], insertUpdateAlmacen);

router.post('/deleteAlmacen', [
  check('idAlmacen','Id de sucursal obligatorio').not().isEmpty(),
  check('idAlmacen','Id de sucursal debe ser numérico').isNumeric(),

  validarCampos
], deleteAlmacen);

router.post('/cbxCatRelacionOrigen', cbxCatRelacionOrigen);

module.exports = router;