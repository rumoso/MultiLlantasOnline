const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
  getCajas,
  getCajasFiltradas,
  getCajaById,
  cajaGuardar,
  cajaDelete,
  asignarCaja,
  obtenerFormasPago,
  movimientosCaja,
  catMovimientosCaja,
  imprimirTicketMovimientosCaja,
  getCajasParaCambio
   } = require('../controllers/cajasController');

   
const router = Router();


router.get('/catmovimientos', catMovimientosCaja);

router.get('/formaspago', [
    check('tipo', 'El parámetro tipo debe ser INGRESO o EGRESO')
        .optional()
        .isIn(['INGRESO', 'EGRESO', 'ingreso', 'egreso']),
    validarCampos
], obtenerFormasPago);

router.get('/filtrar/cajas', getCajasFiltradas);
router.get('/:id', getCajas);
router.post('/getCajasParaCambio', getCajasParaCambio);

router.get('/cajabyid/:id', getCajaById);

router.post('/', 
    [
        check('idSucursal', 'El idSucursal es obligatorio').not().isEmpty(),
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        validarCampos
    ],
    cajaGuardar
);

router.post('/movimientos/efectivo', 
    [
        check('idcajas', 'El idcajas es obligatorio').not().isEmpty(),
        check('fecha', 'La fecha es obligatoria').not().isEmpty(),
        check('tipo', 'El tipo es obligatorio').not().isEmpty(),
        check('monto', 'El monto es obligatorio').not().isEmpty(),
        check('idcatmovimientos', 'El idcatmovimientos es obligatorio').not().isEmpty(),
        check('idformaspago', 'El idformaspago es obligatorio').not().isEmpty(),
        check('idUser', 'El idUser es obligatorio').not().isEmpty(),
        check('idturnoscaja', 'El idturnoscaja es obligatorio').not().isEmpty(),
        check('observaciones', 'Las observaciones son obligatorias').not().isEmpty(),
        validarCampos
    ],
    movimientosCaja
);

router.delete('/', cajaDelete);

router.post('/asignarCaja', asignarCaja);

router.get('/movimientos/imprimir/:id/:impresora', imprimirTicketMovimientosCaja);

module.exports = router;