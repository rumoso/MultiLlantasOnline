const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
  consultarInvParaGenerarProdAgranel
  , producirProdAgranel

  , getProdProdAgranelPaginado
  , cbxProductosAgranelForPA
  , agregarProdAgranelDetalle
  , getProdProdAgranelByID
  , getProdProdAgranelDetalle
  , completarYProducirPA
  , deletePPADetail
} = require('../controllers/productosAgranelController');

const router = require('express').Router();

router.post('/consultarInvParaGenerarProdAgranel', [

  check('idProductoAgranel', 'El Producto Agranel es obligatorio').not().isEmpty(),
  check('idProductoAgranel', 'El Producto Agranel debe ser numérico').isNumeric(),
  check('idProductoAgranel', 'El Producto Agranel ser mayor a 0').isFloat({ min: 0.01 }),

  validarCampos
], consultarInvParaGenerarProdAgranel);

router.post('/producirProdAgranel', [

  check('idProductoAgranel', 'El Producto Agranel es obligatorio').not().isEmpty(),
  check('idProductoAgranel', 'El Producto Agranel debe ser numérico').isNumeric(),
  check('idProductoAgranel', 'El Producto Agranel ser mayor a 0').isFloat({ min: 0.01 }),

  check('cantAProducir', 'La Cantidad es obligatoria').not().isEmpty(),
  check('cantAProducir', 'La Cantidad debe ser numérica').isNumeric(),
  check('cantAProducir', 'La Cantidad debe ser mayor a 0').isFloat({ min: 0.01 }),

  validarCampos
], producirProdAgranel);



router.post('/getProdProdAgranelPaginado', getProdProdAgranelPaginado);

router.post('/cbxProductosAgranelForPA', [

  check('idProdProdAgranelH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdAgranelH', 'ID debe ser numérico').isNumeric(),

  validarCampos
], cbxProductosAgranelForPA);

router.post('/agregarProdAgranelDetalle', [

  check('idProductoAgranel', 'El Producto es obligatorio').not().isEmpty(),
  check('idProductoAgranel', 'El Producto debe ser numérico').isNumeric(),
  check('idProductoAgranel', 'El Producto ser mayor a 0').isFloat({ min: 0.01 }),

  check('cantAProducir', 'La Cantidad es obligatoria').not().isEmpty(),
  check('cantAProducir', 'La Cantidad debe ser numérica').isNumeric(),
  check('cantAProducir', 'La Cantidad debe ser mayor a 0').isFloat({ min: 0.01 }),

  validarCampos
], agregarProdAgranelDetalle);

router.post('/getProdProdAgranelByID', [

  check('idProdProdAgranelH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdAgranelH', 'ID debe ser numérico').isNumeric(),

  validarCampos
], getProdProdAgranelByID);

router.post('/getProdProdAgranelDetalle', [

  check('idProdProdAgranelH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdAgranelH', 'ID debe ser numérico').isNumeric(),
  check('idProdProdAgranelH', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], getProdProdAgranelDetalle);

router.post('/completarYProducirPA', [

  check('idProdProdAgranelH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdAgranelH', 'ID debe ser numérico').isNumeric(),
  check('idProdProdAgranelH', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], completarYProducirPA);

router.post('/deletePPADetail', [

  check('idProdProdAgranelH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdAgranelH', 'ID debe ser numérico').isNumeric(),
  check('idProdProdAgranelH', 'ID obligatorio').isFloat({ min: 0.01 }),

  check('idProdProdAgranelDetalle', 'ID obligatorio').not().isEmpty(),
  check('idProdProdAgranelDetalle', 'ID debe ser numérico').isNumeric(),
  check('idProdProdAgranelDetalle', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], deletePPADetail);

module.exports = router;