const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
  cbxGetProductosBase
  , agregarMateriaPrimaALaFomulaDeProductoBase
  , getFormulaByProdBasePaginado
  , deleteMateriaPrimaDeLaFormula
  , agregarProdBaseDetalle
  , getProdProdBaseByID
  , getProdProdBaseDetallePag
  , completarYProducirPB
  , deletePPBDetail
  , cbxStatusProdBase
  , changeStatusPPB
  , getPPBStock
  , revisarStockPPB
  , actualizarCantProducida
} = require('../controllers/productosBaseController');

const router = require('express').Router();

router.post('/cbxGetProductosBase', cbxGetProductosBase);

router.post('/agregarMateriaPrimaALaFomulaDeProductoBase', [

  check('idProductoBase', 'El Producto Base es obligatorio').not().isEmpty(),
  check('idProductoBase', 'El Producto Base debe ser numérico').isNumeric(),
  check('idProductoBase', 'El Producto debe ser mayor a 0').isFloat({ min: 0.01 }),

  check('idMateriaPrima', 'La Materia Prima es obligatoria').not().isEmpty(),
  check('idMateriaPrima', 'La Materia Prima debe ser numérica').isNumeric(),
  check('idMateriaPrima', 'La Materia Prima debe ser mayor a 0').isFloat({ min: 0.01 }),

  check('cantidad', 'La Cantidad es obligatoria').not().isEmpty(),
  check('cantidad', 'La Cantidad debe ser numérica').isNumeric(),
  check('cantidad', 'La Cantidad debe ser mayor a 0').isFloat({ min: 0.001 }),

  validarCampos
], agregarMateriaPrimaALaFomulaDeProductoBase);

router.post('/getFormulaByProdBasePaginado', [

  check('idProductoBase', 'El Producto Base es obligatorio').not().isEmpty(),
  check('idProductoBase', 'El Producto Base debe ser numérico').isNumeric(),
  check('idProductoBase', 'El Producto debe ser mayor a 0').isFloat({ min: 0.01 }),

  validarCampos
], getFormulaByProdBasePaginado);

router.post('/deleteMateriaPrimaDeLaFormula', [
  check('idFormula', 'Id obligatorio').not().isEmpty(),
  check('idFormula', 'Id debe ser numérico').isNumeric(),

  check('idProductoBase', 'El Producto Base obligatorio').not().isEmpty(),
  check('idProductoBase', 'El Producto Base debe ser numérico').isNumeric(),

  validarCampos
], deleteMateriaPrimaDeLaFormula);

router.post('/agregarProdBaseDetalle', [

  check('idProductoBase', 'El Producto Base es obligatorio').not().isEmpty(),
  check('idProductoBase', 'El Producto Base debe ser numérico').isNumeric(),
  check('idProductoBase', 'El Producto debe ser mayor a 0').isFloat({ min: 0.01 }),

  check('cantAProducir', 'La Cantidad es obligatoria').not().isEmpty(),
  check('cantAProducir', 'La Cantidad debe ser numérica').isNumeric(),
  check('cantAProducir', 'La Cantidad debe ser mayor a 0').isFloat({ min: 0.01 }),

  validarCampos
], agregarProdBaseDetalle);

router.post('/getProdProdBaseByID', [

  check('idProdProdBaseH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdBaseH', 'ID debe ser numérico').isNumeric(),

  validarCampos
], getProdProdBaseByID);

router.post('/getProdProdBaseDetallePag', getProdProdBaseDetallePag);

router.post('/completarYProducirPB', [

  check('idProdProdBaseH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdBaseH', 'ID debe ser numérico').isNumeric(),
  check('idProdProdBaseH', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], completarYProducirPB);

router.post('/deletePPBDetail', [

  check('idProdProdBaseH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdBaseH', 'ID debe ser numérico').isNumeric(),
  check('idProdProdBaseH', 'ID obligatorio').isFloat({ min: 0.01 }),

  check('idProdProdBaseDetalle', 'ID obligatorio').not().isEmpty(),
  check('idProdProdBaseDetalle', 'ID debe ser numérico').isNumeric(),
  check('idProdProdBaseDetalle', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], deletePPBDetail);

router.post('/cbxStatusProdBase', cbxStatusProdBase);

router.post('/changeStatusPPB', [

  check('idStatus', 'Status obligatorio').not().isEmpty(),
  check('idStatus', 'Status debe ser numérico').isNumeric(),
  check('idStatus', 'Status obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], changeStatusPPB);

router.post('/getPPBStock', [

  check('idProdProdBaseDetalle', 'Status obligatorio').not().isEmpty(),
  check('idProdProdBaseDetalle', 'Status debe ser numérico').isNumeric(),
  check('idProdProdBaseDetalle', 'Status obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], getPPBStock);

router.post('/revisarStockPPB', [

  check('idProductoBase', 'El Producto Base es obligatorio').not().isEmpty(),
  check('idProductoBase', 'El Producto Base debe ser numérico').isNumeric(),
  check('idProductoBase', 'El Producto debe ser mayor a 0').isFloat({ min: 0.01 }),

  check('cantAProducir', 'La Cantidad es obligatoria').not().isEmpty(),
  check('cantAProducir', 'La Cantidad debe ser numérica').isNumeric(),
  check('cantAProducir', 'La Cantidad debe ser mayor a 0').isFloat({ min: 0.01 }),

  validarCampos
], revisarStockPPB);

router.post('/actualizarCantProducida', [

  check('idProdProdBaseDetalle', 'El ID es obligatorio').not().isEmpty(),
  check('idProdProdBaseDetalle', 'El ID debe ser numérico').isNumeric(),
  check('idProdProdBaseDetalle', 'El ID debe ser mayor a 0').isFloat({ min: 0.01 }),

  check('idProductoBase', 'El Producto Base es obligatorio').not().isEmpty(),
  check('idProductoBase', 'El Producto Base debe ser numérico').isNumeric(),
  check('idProductoBase', 'El Producto debe ser mayor a 0').isFloat({ min: 0.01 }),

  check('cantAProducir', 'La Cantidad es obligatoria').not().isEmpty(),
  check('cantAProducir', 'La Cantidad debe ser numérica').isNumeric(),
  check('cantAProducir', 'La Cantidad debe ser mayor a 0').isFloat({ min: 0.01 }),

  validarCampos
], actualizarCantProducida);


module.exports = router;