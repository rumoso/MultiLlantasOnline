const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
  cbxGetMateriasPrimas
  , cbxGetMateriasPrimasByFormulaProdBase
} = require('../controllers/materiasprimasController');

const router = require('express').Router();

router.post('/cbxGetMateriasPrimas', cbxGetMateriasPrimas);

router.post('/cbxGetMateriasPrimasByFormulaProdBase', [
  check('idProductoBase', 'Id obligatorio').not().isEmpty(),
  check('idProductoBase', 'Id debe ser numérico').isNumeric(),
  validarCampos
], cbxGetMateriasPrimasByFormulaProdBase);

module.exports = router;