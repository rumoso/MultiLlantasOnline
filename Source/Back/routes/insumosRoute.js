const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
  cbxGetInsumosByProducto
} = require('../controllers/insumosController');

const router = require('express').Router();

router.post('/cbxGetInsumosByProducto', [
  check('idProducto', 'Id obligatorio').not().isEmpty(),
  check('idProducto', 'Id debe ser numérico').isNumeric(),
  validarCampos
], cbxGetInsumosByProducto);

module.exports = router;