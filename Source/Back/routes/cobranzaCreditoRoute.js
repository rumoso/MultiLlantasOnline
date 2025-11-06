const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 

  getCreditosPendientesPorCliente
  , savePagos

   } = require('../controllers/cobranzaCreditoController');

   
const router = Router();

router.post('/getCreditosPendientesPorCliente', [
  
  check('idCliente', 'El ID del cliente es obligatorio').not().isEmpty(),
  check('idCliente', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], getCreditosPendientesPorCliente);

router.post('/savePagos', [
  // Aquí puedes agregar validaciones si lo deseas, por ejemplo:
  check('idCliente', 'El ID del cliente es obligatorio').not().isEmpty(),
  check('abonos', 'Debe enviar los abonos').isArray({ min: 1 }),
  validarCampos
], savePagos);

module.exports = router;