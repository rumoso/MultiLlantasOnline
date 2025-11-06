const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
  getOrdenesCompraListWithPage
  , getOrdenCompraByID
  , insertUpdateOrdenCompra
  , deleteOrdenCompra
  , agregarOrdenCompraDetalle
  , getOrdenCompraDetailListWithPage
  , deleteOrdenCompraDetalle
  , completarOrdenCompra
} = require('../controllers/ordenesCompraController');

const router = require('express').Router();

router.post('/getOrdenesCompraListWithPage', getOrdenesCompraListWithPage);

router.post('/getOrdenCompraByID', [
  check('idOrdenDeCompra', 'Id obligatorio').not().isEmpty(),
  check('idOrdenDeCompra', 'Id debe ser numérico').isNumeric(),
  validarCampos
], getOrdenCompraByID);

router.post('/insertUpdateOrdenCompra', [

  check('idProveedor', 'El proveedor es obligatorio').not().isEmpty(),
  check('idProveedor', 'El proveedor debe ser numérico').isNumeric(),

  check('idUserLogON', 'El Usuario es obligatorio').not().isEmpty(),
  check('idUserLogON', 'El Usuario debe ser numérico').isNumeric(),

  validarCampos
], insertUpdateOrdenCompra);

router.post('/deleteOrdenCompra', [
  check('idOrdenDeCompra', 'Id obligatorio').not().isEmpty(),
  check('idOrdenDeCompra', 'Id debe ser numérico').isNumeric(),
  validarCampos
], deleteOrdenCompra);

router.post('/agregarOrdenCompraDetalle', [

  check('idProducto', 'El Articulo es obligatorio').not().isEmpty(),
  check('idProducto', 'El Articulo debe ser numérico').isNumeric(),

  check('cantidad', 'La Cantidad es obligatoria').not().isEmpty(),
  check('cantidad', 'La Cantidad debe ser numérica').isNumeric(),

  check('costo', 'El costo es obligatorio').not().isEmpty(),
  check('costo', 'El costo debe ser numérico').isNumeric(),

  validarCampos
], agregarOrdenCompraDetalle);

router.post('/getOrdenCompraDetailListWithPage', [

  check('idOrdenDeCompra', 'La orden de compra es obligatoria').not().isEmpty(),
  check('idOrdenDeCompra', 'La orden de compra debe ser numérica').isNumeric(),

  validarCampos
], getOrdenCompraDetailListWithPage);

router.post('/deleteOrdenCompraDetalle', [

  check('idOrdenDeCompraDetalle', 'La orden de compra es obligatoria').not().isEmpty(),
  check('idOrdenDeCompraDetalle', 'La orden de compra debe ser numérica').isNumeric(),

  validarCampos
], deleteOrdenCompraDetalle);

router.post('/completarOrdenCompra', [

  check('idOrdenDeCompra', 'La orden de compra es obligatoria').not().isEmpty(),
  check('idOrdenDeCompra', 'La orden de compra debe ser numérica').isNumeric(),

  validarCampos
], completarOrdenCompra);

module.exports = router;