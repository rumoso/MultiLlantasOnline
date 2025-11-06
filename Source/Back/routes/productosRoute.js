const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
    unidadesMedidaGet,
    unidadMedidaById,
    unidadMedidaDelete,
    unidadesMedidaGuardar,
    familiasGet,
    familiaById,
    familiaDelete,
    familiasGuardar,
    productoGuardar,     
    productosGetAll, 
    productosGetById,
    productosDelete,
    productoIDSugerido,
    obtenerDescripciones,
    descripcionGuardar,
    descripcionById,
    descripcionDelete,
    cbxGetUnidadesMedida,
    getCatTipoProductoAll,
    cbxArticulosParaOC,
    getProductoByID,
    cbxProductos,
    getInsumosByProductosPaginado,
    agregarInsumoAlProducto,
    deleteInsumoDelProducto,
    cbxGetFamilias,
    cbxProductosByType,
    cbxArticulosParaRepVentas,
    cbxProductosFromConvert,
    convertirProductos,
    revisarPedidosPendientes,
    cbxOrigenesForConvert

   } = require('../controllers/productosController');

   
const router = Router();

router.post('/getUnidadesMedida', unidadesMedidaGet);
router.get('/unidadmedida/:id', unidadMedidaById);
router.delete('/unidadmedida/:id', unidadMedidaDelete);

router.post('/unidadmedida', [
  check('name','Id obligatorio').not().isEmpty(),  
  validarCampos
], unidadesMedidaGuardar);

router.post('/getFamilias', familiasGet);
router.get('/familia/:id', familiaById);
router.delete('/familia/:id', familiaDelete);
router.post('/familiasGuardar', [
    check('name','Id obligatorio').not().isEmpty(),  
    validarCampos
  ], familiasGuardar);

router.post('/productoGuardar', productoGuardar);

router.post('/', productosGetAll);
router.get('/', productosGetById);
router.get('/codigo/sugerido', productoIDSugerido);
router.get('/descripcion/:id', descripcionById);
router.post('/descripciones', obtenerDescripciones);
router.post('/descripcionGuardar', descripcionGuardar);
router.post('/tipoProducto', getCatTipoProductoAll);


router.delete('/:id', productosDelete);

router.delete('/descripcion/:id', descripcionDelete);

router.post('/cbxGetUnidadesMedida', cbxGetUnidadesMedida);

router.post('/cbxArticulosParaOC', [
  check('idOrdenDeCompra', 'Id obligatorio').not().isEmpty(),
  check('idOrdenDeCompra', 'Id debe ser numérico').isNumeric(),
  validarCampos
], cbxArticulosParaOC);

router.post('/getProductoByID', [
  check('idProducto', 'Id obligatorio').not().isEmpty(),
  check('idProducto', 'Id debe ser numérico').isNumeric(),
  validarCampos
], getProductoByID);

router.post('/cbxProductos', cbxProductos);

router.post('/getInsumosByProductosPaginado', [
  
  check('idProducto', 'Id obligatorio').not().isEmpty(),
  check('idProducto', 'Id debe ser numérico').isNumeric(),
  check('idProducto', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], getInsumosByProductosPaginado);

router.post('/agregarInsumoAlProducto', [
  
  check('idProducto', 'Id obligatorio').not().isEmpty(),
  check('idProducto', 'Id debe ser numérico').isNumeric(),
  check('idProducto', 'ID obligatorio').isFloat({ min: 0.01 }),

  check('idInsumo', 'Id obligatorio').not().isEmpty(),
  check('idInsumo', 'Id debe ser numérico').isNumeric(),
  check('idInsumo', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], agregarInsumoAlProducto);

router.post('/deleteInsumoDelProducto', [
  
  check('keyx', 'Id obligatorio').not().isEmpty(),
  check('keyx', 'Id debe ser numérico').isNumeric(),
  check('keyx', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], deleteInsumoDelProducto);

router.post('/cbxGetFamilias', cbxGetFamilias);

router.post('/cbxProductosByType', [
  
  check('idCatTipoProducto', 'Id obligatorio').not().isEmpty(),
  check('idCatTipoProducto', 'Id debe ser numérico').isNumeric(),
  check('idCatTipoProducto', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], cbxProductosByType);

router.post('/cbxArticulosParaRepVentas', cbxArticulosParaRepVentas);

router.post('/cbxProductosFromConvert', [
  
  check('idOrigen', 'Id obligatorio').not().isEmpty(),
  check('idOrigen', 'Id debe ser numérico').isNumeric(),
  check('idOrigen', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], cbxProductosFromConvert);

router.post('/convertirProductos', [
  
  check('idOrigen', 'Id obligatorio').not().isEmpty(),
  check('idOrigen', 'Id debe ser numérico').isNumeric(),
  check('idOrigen', 'ID obligatorio').isFloat({ min: 0.01 }),

  validarCampos
], convertirProductos);

router.post('/revisarPedidosPendientes', [
  
  check('iOption', 'Id obligatorio').not().isEmpty(),
  check('iOption', 'Id debe ser numérico').isNumeric(),
  check('iOption', 'ID obligatorio').isFloat({ min: 0.01 }),

  check('idRelation', 'Id obligatorio').not().isEmpty(),
  check('idRelation', 'Id debe ser numérico').isNumeric(),

  validarCampos
], revisarPedidosPendientes);

router.post('/cbxOrigenesForConvert', cbxOrigenesForConvert);


// router.delete('/:id',[validarJWT], productosDelete); <---------------Revisar manejar Token



// router.post('/getSucursalesByIdUser', [
//   check('idUser','Id obligatorio').not().isEmpty(),
//   check('idUser','Id debe ser numérico').isNumeric(),

//   validarCampos
// ], getSucursalesByIdUser);

// router.post('/insertSucursalByIdUser', [
//   check('idUser','Id del usuario obligatorio').not().isEmpty(),
//   check('idUser','Id del usuario debe ser numérico').isNumeric(),

//   check('idSucursal','Id de sucursal obligatorio').not().isEmpty(),
//   check('idSucursal','Id de sucursal debe ser numérico').isNumeric(),

//   validarCampos
// ], insertSucursalByIdUser);

// router.post('/deleteSucursalByIdUser', [
//   check('idUser','Id del usuario obligatorio').not().isEmpty(),
//   check('idUser','Id del usuario debe ser numérico').isNumeric(),

//   check('idSucursal','Id de sucursal obligatorio').not().isEmpty(),
//   check('idSucursal','Id de sucursal debe ser numérico').isNumeric(),

//   validarCampos
// ], deleteSucursalByIdUser);


// router.post('/cbxGetSucursalesCombo', [
//   check('idUser','Id del usuario obligatorio').not().isEmpty(),
//   check('idUser','Id del usuario debe ser numérico').isNumeric(),

//   validarCampos
// ], cbxGetSucursalesCombo);

// router.post('/getPrintTicketSuc', [
//   check('idSucursal','Id de la sucursal obligatorio').not().isEmpty(),
//   check('idSucursal','Id de la sucursal debe ser numérico').isNumeric(),

//   check('type','El tipo es obligatorio').not().isEmpty(),

//   validarCampos
// ], getPrintTicketSuc);



module.exports = router;