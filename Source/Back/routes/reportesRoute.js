const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
  
  rep_InventarioPaginado
  , cbxOrigenes
  , cbxAllProductos
  , rep_InventarioHistPaginado
  , getEmployeesRespForOrigen
  , repCreditosPag
  , repPagos
  , repPagosPorVentaHist
  , cbxOrigenesRepInv
  , cbxOrigenesForES
  , repVentasPag
  , repVentasPorProducto
  , repVentasPorFamilia
  , repVentasPorVendedor
  , repVentasPorCliente
  , repVentasPorSucursal
  , repVentasPorTipoClientes
  , repStockBlockHistPag
  , repMovimientosCaja
  , repEmprendedoresPremium
  , repVentasDeClienteFrecuentePag
  , repDineroElectronicoHist
  , repClientesInactivos
} = require('../controllers/reportesController');

const router = Router();

router.post('/rep_InventarioPaginado', [
  check('idOrigen', 'Origen obligatorio').not().isEmpty(),
  check('idOrigen', 'Origen debe ser numérico').isNumeric(),
  check('idOrigen', 'Origen obligatorio').isFloat({ min: 0.01 }),
  validarCampos
], rep_InventarioPaginado);

router.post('/cbxOrigenes', cbxOrigenes);

router.post('/cbxAllProductos', cbxAllProductos);

router.post('/rep_InventarioHistPaginado', [
  check('idOrigen', 'Origen obligatorio').not().isEmpty(),
  check('idOrigen', 'Origen debe ser numérico').isNumeric(),
  check('idOrigen', 'Origen obligatorio').isFloat({ min: 0.01 }),

  check('idProducto', 'Producto obligatorio').not().isEmpty(),
  check('idProducto', 'Producto debe ser numérico').isNumeric(),
  check('idProducto', 'Producto obligatorio').isFloat({ min: 0.01 }),
  validarCampos
], rep_InventarioHistPaginado);

router.post('/getEmployeesRespForOrigen', [
  check('idOrigen', 'Origen obligatorio').not().isEmpty(),
  check('idOrigen', 'Origen debe ser numérico').isNumeric(),
  check('idOrigen', 'Origen obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], getEmployeesRespForOrigen);

router.post('/repCreditosPag', repCreditosPag);

router.post('/repPagos', repPagos);


router.post('/repPagosPorVentaHist', [
  check('idVenta', 'Venta obligatoria').not().isEmpty(),
  check('idVenta', 'La venta debe ser numérica').isNumeric(),
  check('idVenta', 'Venta obligatoria').isFloat({ min: 0.01 }),

  validarCampos
], repPagosPorVentaHist);

router.post('/cbxOrigenesRepInv', cbxOrigenesRepInv);

router.post('/cbxOrigenesForES', cbxOrigenesForES);

router.post('/repVentasPag', repVentasPag);

router.post('/repVentasPorProducto', repVentasPorProducto);

router.post('/repVentasPorFamilia', repVentasPorFamilia);

router.post('/repVentasPorVendedor', repVentasPorVendedor);

router.post('/repVentasPorCliente', repVentasPorCliente);

router.post('/repVentasPorSucursal', repVentasPorSucursal);

router.post('/repVentasPorTipoClientes', repVentasPorTipoClientes );

router.post('/repStockBlockHistPag', [
  check('idProducto', 'Producto obligatoria').not().isEmpty(),
  check('idProducto', 'El Producto debe ser numérico').isNumeric(),
  check('idProducto', 'Producto obligatorio').isFloat({ min: 0.01 }),

  check('idOrigen', 'Origen obligatoria').not().isEmpty(),
  check('idOrigen', 'El Origen debe ser numérico').isNumeric(),
  check('idOrigen', 'Origen obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], repStockBlockHistPag);

router.post('/repMovimientosCaja', repMovimientosCaja);

router.post('/repEmprendedoresPremium', repEmprendedoresPremium);

router.post('/repVentasDeClienteFrecuentePag', repVentasDeClienteFrecuentePag);

router.post('/repDineroElectronicoHist', [
  check('idCliente', 'Cliente obligatorio').not().isEmpty(),
  check('idCliente', 'El cliente debe ser numérico').isNumeric(),
  check('idCliente', 'Cliente obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], repDineroElectronicoHist);

router.post('/repClientesInactivos', repClientesInactivos);

module.exports = router;