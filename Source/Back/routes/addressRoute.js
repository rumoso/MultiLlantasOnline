const { Router } = require('express');
const { check } = require('express-validator')

const { validarCampos } = require('../middlewares/validar-campos')

const { getEstados, getMunicipios, getCiudades, getColonias, getCodigoPostal, getColoniaById } = require('../controllers/addressController');

const router = Router();

router.post('/estados', getEstados);
router.post('/municipios', getMunicipios);
router.post('/ciudades', getCiudades);
router.post('/colonias', getColonias);
router.post('/codigopostal', getCodigoPostal);
router.get('/colonia/:id', getColoniaById);


module.exports = router;