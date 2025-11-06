const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
    cbxGetProveedores, 
    getProveedoresPaginado, 
    proveedorById, 
    guardarProveedor, 
    eliminarProveedor
} = require('../controllers/proveedoresController');

   
const router = Router();

router.post('/cbxGetProveedores', cbxGetProveedores);
router.post('/getPaginado', getProveedoresPaginado);
router.post('/guardar', guardarProveedor);
router.get('/:id', proveedorById);
router.delete('/eliminar/:idProveedor', eliminarProveedor);

module.exports = router;