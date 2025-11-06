const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');


const router = Router();

const {
    crearPromocion,
    agregarPromotionCondition,
    agregarPromotionAction,
    obtenerPromociones,
    obtenerPromocionById,
    eliminarPromocion
} = require('../controllers/promocionesController');

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('tipoPromocion', 'El tipo de promoción es obligatorio').not().isEmpty(),
    check('valor', 'El valor de la promoción es obligatorio').not().isEmpty(),
    validarCampos
], crearPromocion);

router.post('/agregar-condition', [
    check('idPromocion', 'El ID de la promoción es obligatorio').not().isEmpty(),
    check('tipoCondicion', 'El tipo de condición es obligatorio').not().isEmpty(),
    check('entidadObjetivo', 'La entidad objetivo es obligatoria').not().isEmpty(),
    check('idObjetivo', 'El ID del objetivo es obligatorio').not().isEmpty(),
    check('operador', 'El operador es obligatorio').not().isEmpty(),
    check('valor', 'El valor es obligatorio').not().isEmpty(),
    validarCampos
], agregarPromotionCondition);

router.post('/agregar-action', [
    check('idPromocion', 'El ID de la promoción es obligatorio').not().isEmpty(),
    check('tipoAccion', 'El tipo de acción es obligatorio').not().isEmpty(),
    check('entidadObjetivo', 'La entidad objetivo es obligatoria').not().isEmpty(),
    check('idObjetivo', 'El ID del objetivo es obligatorio').not().isEmpty(),
    check('valor', 'El valor es obligatorio').not().isEmpty(),
    validarCampos
], agregarPromotionAction);

router.post('/paginado', obtenerPromociones);

router.get('/', obtenerPromociones);

router.get('/:idPromocion', obtenerPromocionById);

router.delete('/:idPromocion', eliminarPromocion);

// router.post('/usar', [
//     check('idPromocion', 'El ID de la promoción es obligatorio').not().isEmpty(),
//     check('entidadObjetivo', 'La entidad objetivo es obligatoria').not().isEmpty(),
//     check('idObjetivo', 'El ID del objetivo es obligatorio').not().isEmpty(),
//     validarCampos
// ], usarPromocion);

module.exports = router;