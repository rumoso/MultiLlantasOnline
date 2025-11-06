const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')
const { STRING_REGEX, STRING_MSG, USERNAME_REGEX, USERNAME_MSG } = require('../utils/validaciones');

const { 
  getUsersListWithPage
  , getUserByID
  , insertUser
  , updateUser
  , changePassword
  , disabledUser
  , cbxGetSellersCombo
  , updateAuthorizationCode
  , getCatStatusUser
  , cbxGetEmployeesForOrigen
  , cbxGetUsersByVendedor
   } = require('../controllers/usersController');

   
const router = Router();

router.post('/getUsersListWithPage', getUsersListWithPage);

router.post('/getUserByID', [
  check('idUser','Id obligatorio').not().isEmpty(),
  check('idUser','Id debe ser numérico').isNumeric(),
  validarCampos
], getUserByID);

router.post('/insertUser', [
  check('name','Nombre obligatorio').not().isEmpty()
  .matches(STRING_REGEX)
  .withMessage(`El nombre ${ STRING_MSG }`),
  check('userName','Usuario obligatorio').not().isEmpty()
  .matches(USERNAME_REGEX)
  .withMessage(`El usuario ${ USERNAME_MSG }`),

  validarCampos
], insertUser);

router.post('/updateUser', [
  check('name','Nombre obligatorio').not().isEmpty()
  .matches(STRING_REGEX)
  .withMessage(`El nombre ${ STRING_MSG }`),
  check('userName','Usuario obligatorio').not().isEmpty()
  .matches(USERNAME_REGEX)
  .withMessage(`El usuario ${ USERNAME_MSG }`),

  check('name','Nombre obligatorio').not().isEmpty(),

  validarCampos
], updateUser);

router.post('/changePassword', [
  check('idUser','Id obligatorio').not().isEmpty(),
  check('idUser','Id debe ser numérico').isNumeric(),

  check('pwd','Usuario obligatorio').not().isEmpty(),

  check('pwd2','Nombre obligatorio').not().isEmpty(),

  validarCampos
], changePassword);

router.post('/disabledUser', [
  check('idUser','Id obligatorio').not().isEmpty(),
  check('idUser','Id debe ser numérico').isNumeric(),
  validarCampos
], disabledUser);

router.post('/cbxGetSellersCombo', [

  check('idUser','Id obligatorio').not().isEmpty(),
  check('idUser','Id debe ser numérico').isNumeric(),

  validarCampos
], cbxGetSellersCombo);

router.post('/updateAuthorizationCode', [
  check('authorizationCode','Id obligatorio').not().isEmpty(),
  validarCampos
], updateAuthorizationCode);

router.post('/getCatStatusUser', getCatStatusUser);

router.post('/cbxGetEmployeesForOrigen', cbxGetEmployeesForOrigen);

router.post('/cbxGetUsersByVendedor', cbxGetUsersByVendedor);

module.exports = router;