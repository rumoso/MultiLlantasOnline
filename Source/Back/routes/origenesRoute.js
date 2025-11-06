const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { 
  getOrigenesResponsables
  , insertOrinResponsable
  , deleteOrinResponsable
  , getIdOrigenByRelation
  
  , getOrigenesForAddUser
  , getOrigenesByIdUser
  , insertOrigenByIdUser
  , deleteOrigenByIdUser
  , cambioDeOrigenPrincipalByIdUser

   } = require('../controllers/origenesController');

   
const router = Router();

router.post('/getOrigenesResponsables', getOrigenesResponsables);

router.post('/getOrigenesResponsables', [

  check('idOrigen', 'El Origen es obligatorio').not().isEmpty(),
  check('idOrigen', 'El Origen es obligatorio').isFloat({ min: 0.01 }),
  check('idOrigen', 'El Origen debe ser numérico').isNumeric(),

  validarCampos
], getOrigenesResponsables);

router.post('/insertOrinResponsable', [

  check('idOrigen', 'El Origen es obligatorio').not().isEmpty(),
  check('idOrigen', 'El Origen es obligatorio').isFloat({ min: 0.01 }),
  check('idOrigen', 'El Origen debe ser numérico').isNumeric(),

  check('idEmployee', 'El Empleado es obligatorio').not().isEmpty(),
  check('idEmployee', 'El Empleado es obligatorio').isFloat({ min: 0.01 }),
  check('idEmployee', 'El Empleado debe ser numérico').isNumeric(),

  validarCampos
], insertOrinResponsable);

router.post('/deleteOrinResponsable', [

  check('idOrigenesResponsables', 'El Origen es obligatorio').not().isEmpty(),
  check('idOrigenesResponsables', 'El Origen es obligatorio').isFloat({ min: 0.01 }),
  check('idOrigenesResponsables', 'El Origen debe ser numérico').isNumeric(),

  validarCampos
], deleteOrinResponsable);

router.post('/getIdOrigenByRelation', [

  check('idRelation', 'La relación es obligatoria').not().isEmpty(),
  check('idRelation', 'La relación es obligatoria').isFloat({ min: 0.01 }),
  check('idRelation', 'La relación debe ser numérica').isNumeric(),

  check('idCatRelacionOrigen', 'El tipo es obligatorio').not().isEmpty(),
  check('idCatRelacionOrigen', 'El tipo es obligatorio').isFloat({ min: 0.01 }),
  check('idCatRelacionOrigen', 'El tipo debe ser numérico').isNumeric(),

  validarCampos
], getIdOrigenByRelation);




router.post('/getOrigenesForAddUser', [
  check('idUser','Id obligatorio').not().isEmpty(),
  check('idUser','Id debe ser numérico').isNumeric(),
  
  validarCampos
], getOrigenesForAddUser);

router.post('/getOrigenesByIdUser', [
  check('idUser','Id obligatorio').not().isEmpty(),
  check('idUser','Id debe ser numérico').isNumeric(),

  validarCampos
], getOrigenesByIdUser);

router.post('/insertOrigenByIdUser', [
  check('idUser','Id del usuario obligatorio').not().isEmpty(),
  check('idUser','Id del usuario debe ser numérico').isNumeric(),

  check('idOrigen','Id del origen obligatorio').not().isEmpty(),
  check('idOrigen','Id del origen debe ser numérico').isNumeric(),

  validarCampos
], insertOrigenByIdUser);

router.post('/deleteOrigenByIdUser', [
  check('idUser','Id del usuario obligatorio').not().isEmpty(),
  check('idUser','Id del usuario debe ser numérico').isNumeric(),

  check('idOrigen','Id del origen obligatorio').not().isEmpty(),
  check('idOrigen','Id del origen debe ser numérico').isNumeric(),

  validarCampos
], deleteOrigenByIdUser);

router.post('/cambioDeOrigenPrincipalByIdUser', [
  check('idUser','Id del usuario obligatorio').not().isEmpty(),
  check('idUser','Id del usuario debe ser numérico').isNumeric(),

  check('idOrigen','Id del origen obligatorio').not().isEmpty(),
  check('idOrigen','Id del origen debe ser numérico').isNumeric(),

  validarCampos
], cambioDeOrigenPrincipalByIdUser);

module.exports = router;