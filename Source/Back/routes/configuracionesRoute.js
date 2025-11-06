const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos');


const { getInfoTicketByIdSucursal, guardarInformacionTicket } = require('../controllers/configuracionesController');


const router = Router();

router.get('/info/ticket/:id', getInfoTicketByIdSucursal);
router.post('/info/ticket/guardar', guardarInformacionTicket);


module.exports = router;