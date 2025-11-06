const { Router } = require('express');
const { check } = require('express-validator');
const path = require('path');
const fs = require('fs');

const { validarCampos } = require('../middlewares/validar-campos')

const { getImageProduct } = require('../controllers/assetsController');

   
const router = Router();

router.get('/productos/image/:nombreImagen', getImageProduct);

module.exports = router;