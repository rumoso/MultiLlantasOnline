const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 

  getProdProdFinalPaginado
  , cbxProductosFinalForPF
  , agregarProdFinalDetalle
  , getProdProdFinalByID
  , getProdProdFinalDetalle
  , completarYProducirPF
  , deletePPFDetail
} = require('../controllers/productosFinalController');

const router = require('express').Router();

router.post('/getProdProdFinalPaginado', getProdProdFinalPaginado);

router.post('/cbxProductosFinalForPF', [

  check('idProdProdFinalH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdFinalH', 'ID debe ser numérico').isNumeric(),

  validarCampos
], cbxProductosFinalForPF);

router.post('/agregarProdFinalDetalle', agregarProdFinalDetalle);

router.post('/getProdProdFinalByID', [

  check('idProdProdFinalH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdFinalH', 'ID debe ser numérico').isNumeric(),

  validarCampos
], getProdProdFinalByID);

router.post('/getProdProdFinalDetalle', [

  check('idProdProdFinalH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdFinalH', 'ID debe ser numérico').isNumeric(),
  check('idProdProdFinalH', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], getProdProdFinalDetalle);

router.post('/completarYProducirPF', [

  check('idProdProdFinalH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdFinalH', 'ID debe ser numérico').isNumeric(),
  check('idProdProdFinalH', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], completarYProducirPF);

router.post('/deletePPFDetail', [

  check('idProdProdFinalH', 'ID obligatorio').not().isEmpty(),
  check('idProdProdFinalH', 'ID debe ser numérico').isNumeric(),
  check('idProdProdFinalH', 'ID obligatorio').isFloat({ min: 0.01 }),

  check('idProdProdFinalDetalle', 'ID obligatorio').not().isEmpty(),
  check('idProdProdFinalDetalle', 'ID debe ser numérico').isNumeric(),
  check('idProdProdFinalDetalle', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], deletePPFDetail);

module.exports = router;