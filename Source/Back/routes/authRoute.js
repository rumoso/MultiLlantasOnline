const { Router } = require('express');
const { check } = require('express-validator')
const rateLimit = require('express-rate-limit');

const { validarCampos } = require('../middlewares/validar-campos')
const { validarJWT } = require('../middlewares/validar-jwt');
const { esRolValido, existeEmail } = require('../helpers/db-validators/user-validator');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { status: 2, message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false
});

const {

    login
    , register
    , logout
    , getMenuByPermissions
    , getActionsPermissionByUser

} = require('../controllers/authController');


const router = Router();

router.post('/login',[
    loginLimiter,
    check('username','El nombre de usuario es obligatorio').not().isEmpty(),
    check('pwd','La contraseña es obligatoria').not().isEmpty(),
    validarCampos

], login );

router.post('/register',[
    check('name','El nombre es obligatorio').not().isEmpty(),
    check('userName','El nombre de usuario es obligatorio').not().isEmpty(),
    check('email','El correo no es válido').isEmail(),
    check('pwd','La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    validarCampos

], register );

router.post('/logout', logout);

router.post('/getMenuByPermissions',[
    validarJWT,
    validarCampos

], getMenuByPermissions );

router.post('/getActionsPermissionByUser',[
    validarJWT,
    validarCampos

], getActionsPermissionByUser );

module.exports = router;