const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 

  cbxCatStatusPedidosClientes
  , cbxGetClientesParaPedidos
  , cbxGetClientes
  , cbxArticulosParaPedidosClientes
  , agregarPedidoDetalle
  , getPedidoClienteDetalle
  , getPedidosClientesPaginado
  , getPedidoByID

  , cbxGetRepartidores
  , cbxGetTiposDeVenta
  , deletePedidoDetalle

  , insertUpdatePedidosClientes
  , updateStatusPedidoCliente
  , getPedidosPendientesPaginado
  , deletePedido
  , cambioStatusPedido
  , copiarPedido
  , quitarPromosiones

   } = require('../controllers/pedidosClientesController');

   
const router = Router();

router.post('/cbxCatStatusPedidosClientes', cbxCatStatusPedidosClientes);
router.post('/cbxGetClientesParaPedidos', cbxGetClientesParaPedidos);
router.post('/cbxGetClientes', cbxGetClientes);

router.post('/cbxArticulosParaPedidosClientes', cbxArticulosParaPedidosClientes);

router.post('/agregarPedidoDetalle', [

  check('idProducto', 'El Articulo es obligatorio').not().isEmpty(),
  check('idProducto', 'El Articulo es obligatorio').isFloat({ min: 0.01 }),
  check('idProducto', 'El Articulo debe ser numérico').isNumeric(),

  check('cantidad', 'La Cantidad es obligatoria').not().isEmpty(),
  check('cantidad', 'La Cantidad debe ser numérica').isNumeric(),

  validarCampos
], agregarPedidoDetalle);

router.post('/getPedidoClienteDetalle', [

  check('idPedido', 'El ID es obligatorio').not().isEmpty(),
  check('idPedido', 'El ID es obligatorio').isFloat({ min: 0.01 }),
  check('idPedido', 'El ID debe ser numérico').isNumeric(),

  validarCampos
], getPedidoClienteDetalle);

router.post('/getPedidosClientesPaginado', getPedidosClientesPaginado);

router.post('/getPedidoByID', [
  check('idPedido', 'Id obligatorio').not().isEmpty(),
  check('idPedido', 'Id es obligatorio').isFloat({ min: 0.01 }),
  check('idPedido', 'Id debe ser numérico').isNumeric(),
  
  validarCampos
], getPedidoByID);

router.post('/cbxGetRepartidores', cbxGetRepartidores);

router.post('/cbxGetTiposDeVenta', cbxGetTiposDeVenta);

router.post('/deletePedidoDetalle', [
  check('idPedidoDetalle', 'El ID es obligatorio').not().isEmpty(),
  check('idPedidoDetalle', 'El ID debe ser numérico').isNumeric(),
  validarCampos
], deletePedidoDetalle);


router.post('/insertUpdatePedidosClientes', [

  check('idCliente', 'El cliente es obligatorio').not().isEmpty(),
  check('idCliente', 'El cliente es obligatorio').isFloat({ min: 0.01 }),
  check('idCliente', 'El cliente debe ser numérico').isNumeric(),

  validarCampos
], insertUpdatePedidosClientes);

router.post('/updateStatusPedidoCliente', [
  check('idPedido', 'El ID del pedido es obligatorio').not().isEmpty(),
  check('idPedido', 'El ID del pedido debe ser numérico').isNumeric(),
  check('idPedido', 'El ID del pedido es obligatorio').isFloat({ min: 0.01 }),

  check('idCatStatusPedidosClientes', 'El estatus es obligatorio').not().isEmpty(),
  check('idCatStatusPedidosClientes', 'El estatus debe ser numérico').isNumeric(),
  check('idCatStatusPedidosClientes', 'El estatus es obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], updateStatusPedidoCliente);

router.post('/getPedidosPendientesPaginado', getPedidosPendientesPaginado);

router.post('/deletePedido', [
  check('idPedido', 'El ID del pedido es obligatorio').not().isEmpty(),
  check('idPedido', 'El ID del pedido debe ser numérico').isNumeric(),
  check('idPedido', 'El ID del pedido es obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], deletePedido);

router.post('/cambioStatusPedido', [
  check('idPedido', 'El ID del pedido es obligatorio').not().isEmpty(),
  check('idPedido', 'El ID del pedido debe ser numérico').isNumeric(),
  check('idPedido', 'El ID del pedido es obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], cambioStatusPedido);

router.post('/copiarPedido', [
  check('idPedido', 'El ID del pedido es obligatorio').not().isEmpty(),
  check('idPedido', 'El ID del pedido debe ser numérico').isNumeric(),
  check('idPedido', 'El ID del pedido es obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], copiarPedido);

router.post('/quitarPromosiones', [
  check('idPedido', 'El ID del pedido es obligatorio').not().isEmpty(),
  check('idPedido', 'El ID del pedido debe ser numérico').isNumeric(),
  check('idPedido', 'El ID del pedido es obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], quitarPromosiones);

module.exports = router;