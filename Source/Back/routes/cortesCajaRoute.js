const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const {
    obtenerCorteCajaIndividual,
    iniciarTurnoCaja,
    verificarTurnoActivo,
    RealizarCorteIndividual,
    obtenerTurnosActivos,
    obtenerCortesCajaPorFecha,
    obtenerCajerosConTurnosActivos,
    obtenerSaldoInicialSugerido,
    obtenerTotalesCorte,
    generarTicketCorteCaja,
    imprimirTicketCorteCaja,
    obtenerTotalesCorteGeneral,
    iniciarCorteGeneral,
    finalizarCorteGeneral,
    validarCorteGeneralActivo,
    obtenerUltimoFolioCorte
} = require('../controllers/corteCajaController');

const router = Router();


// GET - Obtener cajeros con turnos activos
router.get('/cajeros-activos', obtenerCajerosConTurnosActivos);


// GET - Obtener corte de caja individual por ID de caja
router.get('/:idcajas', [
    check('idcajas', 'El ID de caja es obligatorio').not().isEmpty(),
    check('idcajas', 'El ID de caja debe ser un número').isNumeric(),
    validarCampos
], obtenerCorteCajaIndividual);

// GET - Verificar si hay turno activo para una caja
router.get('/:idcajas/verificar-turno', [
    check('idcajas', 'El ID de caja es obligatorio').not().isEmpty(),
    check('idcajas', 'El ID de caja debe ser un número').isNumeric(),
    validarCampos
], verificarTurnoActivo);

// GET - Obtener turnos activos (con filtro opcional por sucursal)
router.get('/turnos/activos', [
    check('idcajas', 'El ID de caja es obligatorio').not().isEmpty(),
    check('idcajas', 'El ID de caja debe ser un número').isNumeric(),
    check('idSucursal', 'El ID de sucursal debe ser un número').optional().isNumeric(),
    validarCampos
], obtenerTurnosActivos);


// GET - Obtener cortes de caja por fecha (con query parameters)
router.get('/:idcajas/cortes', [
    check('idcajas', 'El ID de caja es obligatorio').not().isEmpty(),
    check('idcajas', 'El ID de caja debe ser un número').isNumeric(),
    validarCampos
], obtenerCortesCajaPorFecha);


// GET - Obtener saldo inicial sugerido para una caja
router.get('/saldo-inicial/:idSucursal/:idcajas', [
    check('idSucursal', 'El ID de sucursal es obligatorio').not().isEmpty(),
    check('idSucursal', 'El ID de sucursal debe ser un número').isNumeric(),
    check('idcajas', 'El ID de caja es obligatorio').not().isEmpty(),
    check('idcajas', 'El ID de caja debe ser un número').isNumeric(),
    validarCampos
], obtenerSaldoInicialSugerido);

// GET - Obtener último folio de corte de caja
router.get('/ultimo-folio/:idSucursal/:idcajas', [
    check('idSucursal', 'El ID de sucursal es obligatorio').not().isEmpty(),
    check('idSucursal', 'El ID de sucursal debe ser un número').isNumeric(),
    check('idcajas', 'El ID de caja es obligatorio').not().isEmpty(),
    check('idcajas', 'El ID de caja debe ser un número').isNumeric(),
    validarCampos
], obtenerUltimoFolioCorte);

// GET - Validar si existe un corte general activo para una sucursal
router.get('/general/:idSucursal/validar', [
    check('idSucursal', 'El ID de sucursal es obligatorio').not().isEmpty(),
    check('idSucursal', 'El ID de sucursal debe ser un número').isNumeric(),
    validarCampos
], validarCorteGeneralActivo);

// POST - Iniciar turno de caja
router.post('/iniciar/turno', [
    check('idcajas', 'El ID de caja es obligatorio').not().isEmpty(),
    check('idUser', 'El ID de usuario es obligatorio').not().isEmpty(),
    check('idUser', 'El ID de usuario debe ser un número').isNumeric(),
    check('saldoinicial', 'El saldo inicial debe ser un número').optional().isNumeric(),
    validarCampos
], iniciarTurnoCaja);

// POST - Realizar corte individual de caja
router.post('/finalizarcorte/individual/', [
    check('idcajas', 'El ID de caja es obligatorio').not().isEmpty(),
    check('idcajas', 'El ID de caja debe ser un número').isNumeric(),
    
    // Validaciones para todos los atributos del modelo Cortescaja
    check('fecha', 'La fecha debe tener el formato YYYYMMDD y ser válida')
        .optional()
        .custom((value) => {
            // Verificar formato YYYYMMDD
            if (!/^\d{8}$/.test(value)) {
                throw new Error('La fecha debe tener exactamente 8 dígitos en formato YYYYMMDD');
            }
            
            // Extraer año, mes y día
            const year = parseInt(value.substring(0, 4));
            const month = parseInt(value.substring(4, 6));
            const day = parseInt(value.substring(6, 8));
            
            // Validar rangos básicos
            if (year < 1900 || year > 2100) {
                throw new Error('El año debe estar entre 1900 y 2100');
            }
            if (month < 1 || month > 12) {
                throw new Error('El mes debe estar entre 01 y 12');
            }
            if (day < 1 || day > 31) {
                throw new Error('El día debe estar entre 01 y 31');
            }
            
            // Verificar que la fecha sea válida usando Date
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                throw new Error('La fecha no es válida');
            }
            
            return true;
        }),
    check('horaapertura', 'La hora de apertura debe ser válida').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    check('horacierre', 'La hora de cierre debe ser válida').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    check('idUser', 'El ID de usuario debe ser un número').optional().isNumeric(),
    check('idSucursal', 'El ID de sucursal debe ser un número').optional().isNumeric(),
    check('idturnoscaja', 'El ID de turno de caja debe ser un número').optional().isNumeric(),
    check('saldoinicial', 'El saldo inicial debe ser un número').optional().isNumeric(),
    check('totalefectivo', 'El total en efectivo debe ser un número').optional().isNumeric(),
    check('totaltarjeta', 'El total en tarjeta debe ser un número').optional().isNumeric(),
    check('totaltransferencia', 'El total en transferencia debe ser un número').optional().isNumeric(),
    check('totalventas', 'El total de ventas debe ser un número').optional().isNumeric(),
    check('totalgastos', 'El total de gastos debe ser un número').optional().isNumeric(),
    check('saldofinal', 'El saldo final debe ser un número').optional().isNumeric(),
    check('efectivocontado', 'El efectivo contado debe ser un número').optional().isNumeric(),
    check('diferencia', 'La diferencia debe ser un número').optional().isNumeric(),
    check('retiroporcorte', 'El retiro por corte debe ser un número').optional().isNumeric(),
    check('observaciones', 'Las observaciones deben ser texto').optional().isString(),
    check('estatus', 'El estatus debe ser texto').optional().isString(),
    validarCampos
], RealizarCorteIndividual);

// GET - Obtener totales del corte de caja
router.get('/:idcajas/totales', [
    check('idcajas', 'El ID de caja es obligatorio').not().isEmpty(),
    check('idcajas', 'El ID de caja debe ser un número').isNumeric(),
    validarCampos
], obtenerTotalesCorte);

// POST - Generar e imprimir ticket de corte de caja
router.post('/ticket/:idcortescaja', [
    check('idcortescaja', 'El ID del corte de caja es obligatorio').not().isEmpty(),
    check('idcortescaja', 'El ID del corte de caja debe ser un número').isNumeric(),
    check('impresora', 'El nombre de la impresora debe ser texto').optional().isString(),
    validarCampos
], imprimirTicketCorteCaja);

// POST - Obtener totales del corte de caja general agrupados por vendedor
router.post('/general/totales', [
    check('idSucursal', 'El ID de sucursal es obligatorio').not().isEmpty(),
    check('idSucursal', 'El ID de sucursal debe ser un número').isNumeric(),
    validarCampos
], obtenerTotalesCorteGeneral);

// POST - Iniciar corte de caja general
router.post('/general/iniciar', [
    check('idSucursal', 'El ID de sucursal es obligatorio').not().isEmpty(),
    check('idSucursal', 'El ID de sucursal debe ser un número').isNumeric(),
    check('idUser', 'El ID de usuario es obligatorio').not().isEmpty(),
    check('idUser', 'El ID de usuario debe ser un número').isNumeric(),
    check('fechaInicio', 'La fecha de inicio debe tener formato válido')
        .optional()
        .custom((value) => {
            if (!value) return true; // Si es opcional y no se proporciona, es válido
            
            // Regex para diferentes formatos válidos
            const formatoSoloFecha = /^\d{4}-\d{2}-\d{2}$/;                    // YYYY-MM-DD
            const formatoFechaHora = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;        // YYYY-MM-DD HH:mm
            const formatoFechaHoraCompleta = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/; // YYYY-MM-DD HH:mm:ss
            const formatoISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;         // YYYY-MM-DDTHH:mm:ss (formato ISO)
            
            if (!formatoSoloFecha.test(value) && 
                !formatoFechaHora.test(value) && 
                !formatoFechaHoraCompleta.test(value) && 
                !formatoISO.test(value)) {
                throw new Error('Formato de fecha inválido. Formatos válidos: YYYY-MM-DD, YYYY-MM-DD HH:mm, YYYY-MM-DD HH:mm:ss');
            }
            
            // Validar que la fecha sea válida
            let fechaParaValidar;
            if (formatoSoloFecha.test(value)) {
                fechaParaValidar = new Date(value + 'T00:00:00');
            } else if (formatoFechaHora.test(value)) {
                fechaParaValidar = new Date(value + ':00');
            } else if (formatoFechaHoraCompleta.test(value)) {
                fechaParaValidar = new Date(value);
            } else if (formatoISO.test(value)) {
                fechaParaValidar = new Date(value);
            }
            
            if (isNaN(fechaParaValidar.getTime())) {
                throw new Error('La fecha proporcionada no es válida');
            }
            
            return true;
        }),
    validarCampos
], iniciarCorteGeneral);

// POST - Finalizar corte de caja general
router.post('/general/finalizar', [
    check('idCortescajaGeneral', 'El ID del corte general es obligatorio').not().isEmpty(),
    check('idCortescajaGeneral', 'El ID del corte general debe ser un número').isNumeric(),
    check('idUser', 'El ID de usuario es obligatorio').not().isEmpty(),
    check('idUser', 'El ID de usuario debe ser un número').isNumeric(),
    validarCampos
], finalizarCorteGeneral);

module.exports = router;