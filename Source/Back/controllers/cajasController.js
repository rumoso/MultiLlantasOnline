const { response } = require('express');
const { Sequelize, Op } = require('sequelize');
const { dbConnection } = require('../database/config');

// Importar las asociaciones
require('../models/cajas/asociacionesCajas');

const Cajas = require('../models/cajas/cajas');
const { status } = require('express/lib/response');
const FormasPago = require('../models/formaspago');
const CatMovimientosCaja = require('../models/cajas/catmovimientoscaja');
const MovimientosCaja = require('../models/cajas/movimientoscaja');
const Turnoscaja = require('../models/cortescaja/turnoscaja');
const User = require('../models/user');

const moment = require('moment');

const getCajas = async (req, res = response) => {
    const idSucursal = req.params.id;
    try {
        const cajas = await Cajas.findAll({ where: { active: true, idSucursal} });
        res.json({
            status: 0,
            message: 'Cajas de sucursales.',
            data: cajas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error en el servicio:',
            data: error.message
        });
    }
};

const getCajasFiltradas = async (req, res = response) => {
    const { idSucursal, nombre } = req.query;
    
    try {
        // Construir condiciones de búsqueda
        const whereConditions = { active: true };
        
        // Agregar filtro por idSucursal si se proporciona
        if (idSucursal) {
            whereConditions.idSucursal = idSucursal;
        }
        
        // Agregar filtro por nombre si se proporciona (búsqueda parcial)
        if (nombre) {
            whereConditions.nombre = {
                [Op.like]: `%${nombre}%`
            };
        }
        
        const cajas = await Cajas.findAll({ where: whereConditions });
        
        res.json({
            status: 0,
            message: 'Cajas filtradas obtenidas con éxito.',
            data: cajas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error en el servicio:',
            data: error.message
        });
    }
};

const getCajasParaCambio = async (req, res = response) => {
    const { idUserLogON } = req.body;

    try {

        const result = await dbConnection.query(`CALL getCajas( ${ idUserLogON } )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: result
        });

    } catch (error) {
        console.error(error);
        res.json({
            status: 2,
            message: 'Sucedió un error en el servicio:',
            data: error.message
        });
    }
};

const getCajaById = async (req, res = response) => {
    const idCaja = req.params.id;
    try {
        const caja = await Cajas.findByPk(idCaja);
        if (!caja) {
            return res.status(404).json({
                status: 2,
                message: 'Caja not found'
            });
        }
        res.json({
            status: 0,
            message: 'Consulta de caja por ID.',
            data:caja
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error en el servicio:',
            data: error.message
        });
    }
};

const cajaGuardar = async (req, res) => {
    try {
        const { idcajas = 0, idSucursal, nombre, descripcion, active, 
            activeuuid = "", ultimouso = new Date() } = req.body;

            console.log(req.body);
            console.log("ultimouso", ultimouso);

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        
        let cajaGuardada = null;
        const existeCaja = await Cajas.findOne({ where: { idcajas } });
        console.log(existeCaja);
        if (existeCaja) {                 
            cajaGuardada = await Cajas.update(
                { idSucursal, nombre, descripcion, active, activeuuid, ultimouso: oGetDateNow },
                { where: { idcajas } }
            );
        } else {      
            cajaGuardada = await Cajas.create({ idcajas, idSucursal, nombre, descripcion, active, 
                activeuuid, ultimouso: oGetDateNow });  
        }
       
        res.status(200).json({
            status: 0,
            message: 'Datos de caja guardada con éxito.',
            data: cajaGuardada
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error en el servicio:',
            data: error.message
        });
    }
};  

const asignarCaja = async (req, res = response) => {
    const { idcajas, activeuuid, ultimouso } = req.body;
    try {
        const caja = await Cajas.findOne({where: { idcajas }});
        if (!caja) {
            return res.status(404).json({
                status: 2,
                message: 'Caja no encontrada.',
                data: null
            });
        }

        // Verificar si la caja ya está asignada a otra terminal
        if (caja.activeuuid && caja.activeuuid.length > 0 && caja.activeuuid !== activeuuid) {
            return res.status(400).json({
                status: 2,
                message: 'La caja ya está asignada a otra terminal.',
                data: null
            });
        }

        await Cajas.update({ activeuuid, ultimouso }, { where: { idcajas } });

        res.json({
            status: 0,
            message: 'Caja asignada con éxito.',
            data:true
        });
    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error en el servicio:',
            data: error.message
        });
    }
}

const obtenerFormasPago = async (req, res = response) => {
    const { tipo } = req.query;
    
    try {
        // Validar parámetro tipo si se proporciona
        if (tipo && !['INGRESO', 'EGRESO'].includes(tipo.toUpperCase())) {
            return res.status(400).json({
                status: 2,
                message: 'Parámetro tipo inválido. Valores permitidos: INGRESO, EGRESO',
                data: null
            });
        }

        let whereCondition = { activo: true };
        let mensaje = 'Formas de pago obtenidas con éxito.';

        // Aplicar lógica de negocio según el tipo
        if (tipo && tipo.toUpperCase() === 'EGRESO') {
            // Para egresos, solo permitir efectivo
            whereCondition = {
                activo: true,
                descripcion: 'Efectivo'
            };
            mensaje = 'Formas de pago para egresos obtenidas con éxito (solo efectivo).';
        }
        // Para INGRESO o sin parámetro, devolver todas las formas de pago activas
        // (whereCondition ya está configurado por defecto)

        const formasPago = await FormasPago.findAll({ 
            where: whereCondition,
            order: [['descripcion', 'ASC']] // Ordenar alfabéticamente
        });

        res.json({
            status: 0,
            message: mensaje,
            data: formasPago
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error en el servicio:',
            data: error.message
        });
    }
};

const movimientosCaja = async (req, res = response) => {
    const { fecha, tipo, monto, idcatmovimientos, idformaspago, idUser, idturnoscaja=4, idcajas, observaciones} = req.body;

    try {
        //const fechaFormateada = formatearFecha(fecha); 
        const movimientos = await MovimientosCaja.create({ fecha, tipo, monto, idcatmovimientos, idformaspago, idUser,
                                                             idturnoscaja, idcajas, observaciones });
        res.json({
            status: 0,
            message: 'Movimientos de caja obtenidos con éxito.',
            data: movimientos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error en el servicio:',
            data: error.message
        });
    }
};
//Crear función para imprimir el ticket de movimientos de caja puede estar basado en el de imprimir ticket de ventas
const imprimirTicketMovimientosCaja = async (req, res = response) => {
    const idmovimiento = req.params.id;
    const impresora = req.params.impresora; // Añadir parámetro de impresora
    
    try {
        const movimiento = await MovimientosCaja.findOne({
            where: { idmovimientoscaja: idmovimiento },
            include: [
                {
                    model: CatMovimientosCaja,
                    as: 'categoria',
                    attributes: ['idcatmovimientoscaja', 'descripcion'],
                    required: false
                },
                {
                    model: FormasPago,
                    as: 'formaPago',
                    attributes: ['idformaspago', 'descripcion'],
                    required: false
                },
                {
                    model: Turnoscaja,
                    as: 'turnoCaja',
                    attributes: ['idturnoscaja', 'fechainicio', 'fechafin'],
                    required: false 
                },
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['idUser', 'name'], // Solo seleccionar columnas que existen
                    required: false
                },
                {
                    model: Cajas,
                    as: 'caja',
                    attributes: ['idcajas', 'nombre', 'descripcion'],
                    required: false
                }
            ]
        });

        if (!movimiento) {
            return res.status(404).json({
                status: 2,
                message: 'Movimiento no encontrado.',
                data: null
            });
        }

        const fechaFormateada = movimiento.fecha;
        // Determinar el tipo de movimiento y color
        const tipoMovimiento = movimiento.tipo;
        const esIngreso = tipoMovimiento === 'INGRESO';
        const montoFormateado = `$${parseFloat(movimiento.monto).toFixed(2)}`;

        // Función para formatear moneda
        const formatMoney = (amount) => {
            return `$${parseFloat(amount || 0).toFixed(2)}`;
        };

        // Crear estructura JSON usando formato oLinesP como en generarTicketCorteCaja
        const oLinesP = [];

        // Encabezado con título
        oLinesP.push({
            oLines: [
                { text: "MOVIMIENTO DE CAJA", aling: "center", size: 12, style: "Bold", type: "Helvetica", iWith: 100 }
            ]
        });

        // Tipo de movimiento con color
        const colorTipo = esIngreso ? "green" : "red";
        oLinesP.push({
            oLines: [
                { text: `Tipo: ${tipoMovimiento}`, aling: "center", size: 10, style: "Bold", type: "Helvetica", iWith: 100, color: colorTipo }
            ]
        });

        // Información básica del movimiento
        oLinesP.push({
            oLines: [
                { text: "   Folio:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(movimiento.idmovimientoscaja), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });

        oLinesP.push({
            oLines: [
                { text: "   Fecha:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(fechaFormateada), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });

        oLinesP.push({
            oLines: [
                { text: "   Caja:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(movimiento.caja ? movimiento.caja.nombre : movimiento.idcajas || 'No especificada'), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });

        oLinesP.push({
            oLines: [
                { text: "   Usuario:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(movimiento.usuario ? movimiento.usuario.name : 'No especificado'), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });

        // Separador
        oLinesP.push({
            oLines: [
                { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
            ]
        });

        // Detalles del movimiento
        oLinesP.push({
            oLines: [
                { text: "  DETALLES DEL MOVIMIENTO", aling: "center", size: 9, style: "Bold", type: "Helvetica", iWith: 100 }
            ]
        });

        oLinesP.push({
            oLines: [
                { text: "   Movimiento:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(movimiento.categoria ? movimiento.categoria.descripcion : 'No especificada'), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });

        oLinesP.push({
            oLines: [
                { text: "   Forma de Pago:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(movimiento.formaPago ? movimiento.formaPago.descripcion : 'No especificada'), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });

        // Separador
        oLinesP.push({
            oLines: [
                { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
            ]
        });

        // Monto principal
        oLinesP.push({
            oLines: [
                { text: "  MONTO:", aling: "left", size: 14, style: "Bold", type: "Helvetica", iWith: 60 },
                { text: String(montoFormateado), aling: "right", size: 14, style: "Bold", type: "Helvetica", iWith: 40 }
            ]
        });

        // Observaciones
        if (movimiento.observaciones) {
            oLinesP.push({
                oLines: [
                    { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
                ]
            });

            oLinesP.push({
                oLines: [
                    { text: "  OBSERVACIONES:", aling: "left", size: 8, style: "Bold", type: "Helvetica", iWith: 100 }
                ]
            });

            oLinesP.push({
                oLines: [
                    { text: "   "+String(movimiento.observaciones), aling: "justify", size: 7, type: "Helvetica", iWith: 100 }
                ]
            });
        }

        // Información adicional
        oLinesP.push({
            oLines: [
                { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
            ]
        });

        oLinesP.push({
            oLines: [
                { text: "   Turno de caja:", aling: "left", size: 7, type: "Helvetica", iWith: 60 },
                { text: String(movimiento.idturnoscaja || 'No especificado'), aling: "right", size: 7, type: "Helvetica", iWith: 40 }
            ]
        });

        // Footer
        oLinesP.push({
            oLines: [
                { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
            ]
        });

        oLinesP.push({
            oLines: [
                { text: "Sistema de Gestión DIPROLIM", aling: "center", size: 8, style: "Bold", type: "Helvetica", iWith: 100 }
            ]
        });

        oLinesP.push({
            oLines: [
                { text: "www.diprolim.com.mx", aling: "center", size: 7, type: "Helvetica", iWith: 100 }
            ]
        });

        oLinesP.push({
            oLines: [
                { text: "Impreso:", aling: "left", size: 6, type: "Helvetica", iWith: 30 },
                { text: String(new Date().toLocaleString()), aling: "right", size: 6, type: "Helvetica", iWith: 70 }
            ]
        });

        // Estructura final para imprimir (similar a generarTicketCorteCaja)
        const ticketData = {
            oPrinter: {
                printerName: impresora || "POS-Printer",
                maxWidth: 280,
                maxMargen: 100,
                sBarCode: ""
            },
            oLinesP
        };

        res.json({
            status: 0,
            message: 'Ticket de movimiento de caja generado con éxito.',
            data: {
                movimiento: movimiento,
                ticketFormat: ticketData
            }
        });

    } catch (error) {
        console.error('Error al generar ticket de movimiento:', error);
        res.status(500).json({
            status: 2,
            message: 'Error al generar el ticket de movimiento',
            data: error.message
        });
    }
};

const catMovimientosCaja = async (req, res = response) => {
    const { tipo_movimiento } = req.query;
    try {
        const categorias = await CatMovimientosCaja.findAll({
            where: {
                ...(tipo_movimiento && { tipo_movimiento }),
                activo: true
            }
        });
        res.json({
            status: 0,
            message: 'Categorías de movimientos de caja obtenidas con éxito.',
            data: categorias
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error en el servicio:',
            data: error.message
        });
    }
};

const cajaDelete = async (req, res = response) => {
    const { idcajas } = req.params;

    try {
        const caja = await Cajas.findByPk(idcajas);

        if (!caja) {
            return res.status(404).json({
                status: 2,
                message: 'Caja no encontrada.',
                data: null
            });
        }

        await Cajas.destroy({ where: { idcajas } });

        res.json({
            status: 0,
            message: 'Caja eliminada con éxito.',
            data:true
        });
    }catch(error){
        res.json({
            status: 2,
            message: 'Sucedió un error en el servicio: ',
            data: error.message
        });
    }
};

module.exports = {
    getCajas,
    getCajasFiltradas,
    getCajasParaCambio,
    getCajaById,
    cajaGuardar,
    cajaDelete,
    asignarCaja,
    obtenerFormasPago,
    movimientosCaja,
    catMovimientosCaja,
    imprimirTicketMovimientosCaja
}