const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 

    printVentaTicket
    , printPruebaTicket

   } = require('../controllers/ticketsController');

   
const router = Router();

router.post('/printVentaTicket', [
  
  check('idVenta', 'El ID de la venta es obligatorio').not().isEmpty(),
  check('idVenta', 'El ID de la venta debe ser numérico').isNumeric(),

  validarCampos
], printVentaTicket);

router.post('/printPruebaTicket', printPruebaTicket);

module.exports = router;