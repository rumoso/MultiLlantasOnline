const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos');
const { dbConnection } = require('../database/config');

const { getLastCartUser, createUpdateCart, updateQuantityProductCart, 
        deleteProductCart, removeAllCart, registrarVenta, getVentaById,
        getAllVentas, getTicketImprimir
        , agregarVentaDetalle
        , getVentaDetalle
        , getLastVentaByType
        , getVentaByID
        , insertUpdateVenta
        , deleteVentaDetalle
        , cerrarVenta
        , convertirPedidoAVenta
        , getArticulosParaVenta
        , getFormasDePagoPorVenta
        , regresarPedido
        , getCajaByID
        , cancelarVenta
        , updateIdClienteDiElect
        , quitarPromosiones

} =  require('../controllers/ventasController');
const router = Router();
router.get('/cart/user/:idUser/:idSucursal/:clienteGeneral', getLastCartUser);
router.get('/:id', getVentaById);
router.get('/imprimir/ticket/:id/:impresora', getTicketImprimir);
router.post('/all', getAllVentas);
router.post('/cart', createUpdateCart);
router.post('/registrar/venta', registrarVenta);
router.post('/cart/update/quantity', updateQuantityProductCart);
router.post('/cart/all/remove', removeAllCart);
router.delete('/cart/:id', deleteProductCart);

router.post('/agregarVentaDetalle', [

  check('idCliente', 'El Cliente es obligatorio').not().isEmpty(),
  check('idCliente', 'El Cliente es obligatorio').isFloat({ min: 0.01 }),
  check('idCliente', 'El Cliente debe ser numérico').isNumeric(),

  check('idTipoVenta', 'Tipo de venta es obligatoria').not().isEmpty(),
  check('idTipoVenta', 'Tipo de venta es obligatoria').isFloat({ min: 0.01 }),
  check('idTipoVenta', 'Tipo de venta debe ser numérica').isNumeric(),

  check('idProducto', 'El Articulo es obligatorio').not().isEmpty(),
  check('idProducto', 'El Articulo es obligatorio').isFloat({ min: 0.01 }),
  check('idProducto', 'El Articulo debe ser numérico').isNumeric(),

  check('cantidad', 'La Cantidad es obligatoria').not().isEmpty(),
  check('cantidad', 'La Cantidad debe ser numérica').isNumeric(),

  validarCampos
], agregarVentaDetalle);

router.post('/getVentaDetalle', [

  check('idVenta', 'El ID es obligatorio').not().isEmpty(),
  check('idVenta', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idVenta', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], getVentaDetalle);

router.post('/getLastVentaByType', [

  check('idType', 'El ID es obligatorio').not().isEmpty(),
  check('idType', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idType', 'El ID debe ser numérico').isNumeric(),

  check('idCaja', 'Caja es obligatoria').not().isEmpty(),
  check('idCaja', 'Caja es obligatoria').isFloat({ min: 0.01 }),
  check('idCaja', 'Caja debe ser numérica').isNumeric(),

  validarCampos
], getLastVentaByType);

router.post('/getVentaByID', [

  check('idVenta', 'El ID es obligatorio').not().isEmpty(),
  check('idVenta', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idVenta', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], getVentaByID);

router.post('/insertUpdateVenta', [

  check('idCliente', 'El cliente es obligatorio').not().isEmpty(),
  check('idCliente', 'El cliente es obligatorio').isFloat({ min: 0.01 }),
  check('idCliente', 'El cliente debe ser numérico').isNumeric(),

  validarCampos
], insertUpdateVenta);

router.post('/deleteVentaDetalle', [

  check('idVenta', 'El ID es obligatorio').not().isEmpty(),
  check('idVenta', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idVenta', 'El ID debe ser numérico').isNumeric(),

  check('idVentaDetalle', 'El ID detalle es obligatorio').not().isEmpty(),
  check('idVentaDetalle', 'El ID detalle es obligatorio').isFloat({ min: 0.01 }),
  check('idVentaDetalle', 'El ID detalle debe ser numérico').isNumeric(),

  validarCampos
], deleteVentaDetalle);

router.post('/cerrarVenta', [

  check('idVenta', 'El ID es obligatorio').not().isEmpty(),
  check('idVenta', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idVenta', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], cerrarVenta);

router.post('/convertirPedidoAVenta', [

  check('idPedido', 'El ID es obligatorio').not().isEmpty(),
  check('idPedido', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idPedido', 'El ID debe ser numérico').isNumeric(),

  check('idCaja', 'La caja es obligatoria').not().isEmpty(),
  check('idCaja', 'La caja es obligatoria').isFloat({ min: 0.01 }),
  check('idCaja', 'La caja debe ser numérica').isNumeric(),

  validarCampos
], convertirPedidoAVenta);

router.post('/getArticulosParaVenta', getArticulosParaVenta);

router.post('/getFormasDePagoPorVenta', [

  check('idVenta', 'El ID es obligatorio').not().isEmpty(),
  check('idVenta', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idVenta', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], getFormasDePagoPorVenta);

router.post('/regresarPedido', [

  check('idPedido', 'El Pedido es obligatorio').not().isEmpty(),
  check('idPedido', 'El Pedido es obligatorio').isFloat({ min: 0.01 }),
  check('idPedido', 'El Pedido debe ser numérico').isNumeric(),

  check('idVenta', 'Venta es obligatoria').not().isEmpty(),
  check('idVenta', 'Venta es obligatoria').isFloat({ min: 0.01 }),
  check('idVenta', 'Venta debe ser numérica').isNumeric(),

  validarCampos
], regresarPedido);

router.post('/getCajaByID', [

  check('idCaja', 'Caja es obligatoria').not().isEmpty(),
  check('idCaja', 'Caja es obligatoria').isFloat({ min: 0.01 }),
  check('idCaja', 'Caja debe ser numérica').isNumeric(),

  validarCampos
], getCajaByID);

router.post('/cancelarVenta', [

  check('idVenta', 'Venta es obligatoria').not().isEmpty(),
  check('idVenta', 'Venta es obligatoria').isFloat({ min: 0.01 }),
  check('idVenta', 'Venta debe ser numérica').isNumeric(),

  validarCampos
], cancelarVenta);

router.post('/updateIdClienteDiElect', [

  check('idVenta', 'Venta es obligatoria').not().isEmpty(),
  check('idVenta', 'Venta es obligatoria').isFloat({ min: 0.01 }),
  check('idVenta', 'Venta debe ser numérica').isNumeric(),

  validarCampos
], updateIdClienteDiElect);

router.post('/quitarPromosiones', [
  check('idVenta', 'El ID de la venta es obligatorio').not().isEmpty(),
  check('idVenta', 'El ID de la venta debe ser numérico').isNumeric(),
  check('idVenta', 'El ID de la venta es obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], quitarPromosiones);

module.exports = router;
