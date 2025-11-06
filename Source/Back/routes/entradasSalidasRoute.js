const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 

  cbxCatMovEntradaSalida
  , insertUpdateEntradaSalida
  , getEntradasSalidasPaginado
  , getEntradaSalidaByID
  , cbxArticulosParaES
  , agregarEntradaSalidaDetalle
  , getEntradaSalidaDetallePaginado
  , deleteEntradaSalidaDetalle
  , completarYGuardarES

  , cbxOrigenesTo
  , changeStatusES
  , actualizarCantidadES
  , recibirArticulosES

  , ReEnviarArticulosES

  , enviarArticulosES

  , cbxOrigenesFromFilterES
  , cbxOrigenesToFilterES
  , cbxEntradasSalidasStatusFilterES

   } = require('../controllers/entradasSalidasController');

   
const router = Router();

router.post('/cbxCatMovEntradaSalida', cbxCatMovEntradaSalida);

router.post('/insertUpdateEntradaSalida', [

  check('idCatMov', 'El motivo es obligatorio').not().isEmpty(),
  check('idCatMov', 'El motivo es obligatorio').isFloat({ min: 0.01 }),
  check('idCatMov', 'El motivo debe ser numérico').isNumeric(),

  check('idOrigen', 'El motivo es obligatorio').not().isEmpty(),
  check('idOrigen', 'El motivo es obligatorio').isFloat({ min: 0.01 }),
  check('idOrigen', 'El motivo debe ser numérico').isNumeric(),

  validarCampos
], insertUpdateEntradaSalida);

router.post('/getEntradasSalidasPaginado', getEntradasSalidasPaginado);

router.post('/getEntradaSalidaByID', [
  check('idEntradasSalidasH', 'Id obligatorio').not().isEmpty(),
  check('idEntradasSalidasH', 'Id es obligatorio').isFloat({ min: 0.01 }),
  check('idEntradasSalidasH', 'Id debe ser numérico').isNumeric(),
  
  validarCampos
], getEntradaSalidaByID);

router.post('/getEntradaSalidaByID', [
  check('idEntradasSalidasH', 'Id obligatorio').not().isEmpty(),
  check('idEntradasSalidasH', 'Id obligatorio').isFloat({ min: 0.01 }),
  check('idEntradasSalidasH', 'Id debe ser numérico').isNumeric(),

  check('idCatMov', 'El motivo obligatorio').not().isEmpty(),
  check('idCatMov', 'El motivo es obligatorio').isFloat({ min: 0.01 }),
  check('idCatMov', 'El motivo debe ser numérico').isNumeric(),

  validarCampos
], getEntradaSalidaByID);

router.post('/cbxArticulosParaES', cbxArticulosParaES);

router.post('/agregarEntradaSalidaDetalle', [

  check('idOrigen', 'Origen obligatorio').not().isEmpty(),
  check('idOrigen', 'Origen obligatorio').isFloat({ min: 0.01 }),
  check('idOrigen', 'Origen debe ser numérico').isNumeric(),

  check('idProducto', 'El Articulo es obligatorio').not().isEmpty(),
  check('idProducto', 'El Articulo es obligatorio').isFloat({ min: 0.01 }),
  check('idProducto', 'El Articulo debe ser numérico').isNumeric(),

  check('cantidad', 'La Cantidad es obligatoria').not().isEmpty(),
  check('cantidad', 'La Cantidad debe ser numérica').isNumeric(),

  check('idCatMov', 'Motivo obligatorio').not().isEmpty(),
  check('idCatMov', 'Motivo obligatorio').isFloat({ min: 0.01 }),
  check('idCatMov', 'Motivo debe ser numérico').isNumeric(),

  validarCampos
], agregarEntradaSalidaDetalle);

router.post('/getEntradaSalidaDetallePaginado', [

  check('idEntradasSalidasH', 'El ID es obligatorio').not().isEmpty(),
  check('idEntradasSalidasH', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idEntradasSalidasH', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], getEntradaSalidaDetallePaginado);

router.post('/deleteEntradaSalidaDetalle', [

  check('idEntradasSalidasDetalle', 'El ID es obligatorio').not().isEmpty(),
  check('idEntradasSalidasDetalle', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idEntradasSalidasDetalle', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], deleteEntradaSalidaDetalle);

router.post('/completarYGuardarES', [

  check('idEntradasSalidasH', 'El ID es obligatorio').not().isEmpty(),
  check('idEntradasSalidasH', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idEntradasSalidasH', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], completarYGuardarES);

router.post('/cbxOrigenesTo', cbxOrigenesTo);

router.post('/changeStatusES', [

  check('idEntradasSalidasH', 'El ID es obligatorio').not().isEmpty(),
  check('idEntradasSalidasH', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idEntradasSalidasH', 'El ID debe ser numérico').isNumeric(),

  check('idStatus', 'El estatus es obligatorio').not().isEmpty(),
  check('idStatus', 'El estatus es obligatorio').isFloat({ min: 0.01 }),
  check('idStatus', 'El estatus debe ser numérico').isNumeric(),

  validarCampos
], changeStatusES);

router.post('/actualizarCantidadES', [

  check('idEntradasSalidasDetalle', 'El ID es obligatorio').not().isEmpty(),
  check('idEntradasSalidasDetalle', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idEntradasSalidasDetalle', 'El ID debe ser numérico').isNumeric(),

  check('cantidad', 'El estatus es obligatorio').not().isEmpty(),
  check('cantidad', 'El estatus es obligatorio').isFloat({ min: 0.01 }),
  check('cantidad', 'El estatus debe ser numérico').isNumeric(),

  validarCampos
], actualizarCantidadES);

router.post('/recibirArticulosES', [

  check('idEntradasSalidasH', 'El ID es obligatorio').not().isEmpty(),
  check('idEntradasSalidasH', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idEntradasSalidasH', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], recibirArticulosES);

router.post('/ReEnviarArticulosES', [

  check('idEntradasSalidasH', 'El ID es obligatorio').not().isEmpty(),
  check('idEntradasSalidasH', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idEntradasSalidasH', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], ReEnviarArticulosES);

router.post('/enviarArticulosES', [

  check('idEntradasSalidasH', 'El ID es obligatorio').not().isEmpty(),
  check('idEntradasSalidasH', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idEntradasSalidasH', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], enviarArticulosES);

router.post('/cbxOrigenesFromFilterES', cbxOrigenesFromFilterES);
router.post('/cbxOrigenesToFilterES', cbxOrigenesToFilterES);
router.post('/cbxEntradasSalidasStatusFilterES', cbxEntradasSalidasStatusFilterES);

module.exports = router;