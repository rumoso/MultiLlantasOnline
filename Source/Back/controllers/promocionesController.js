const { response } = require('express');
const { Op } = require('sequelize');
const { dbConnection } = require('../database/config');

// Importar desde el archivo de asociaciones
const { 
    Promociones,
    PromocionCondicion,
    PromocionAccion
} = require('../models/asociaciones');

const crearPromocion = async (req, res = response) => {
    const { 
        idPromocion = 0, 
        nombre, 
        descripcion, 
        tipoPromocion, 
        valor, 
        fechaInicio, 
        fechaFin, 
        activo, 
        prioridad,
        requiereCodigoCupon, 
        codigoCupon, 
        maxUsosTotal, 
        maxUsosPorCliente,
        acciones = [],  // Array de acciones
        condiciones = [] // Array de condiciones
    } = req.body;

    // Iniciamos una transacción para asegurar que todo se guarde correctamente
    const t = await dbConnection.transaction();

    try {
        // Datos para la promoción
        const datosPromocion = {
            nombre,
            descripcion,
            tipoPromocion,
            valor,
            fechaInicio,
            fechaFin,
            activo,
            prioridad,
            requiereCodigoCupon,
            codigoCupon,
            maxUsosTotal,
            maxUsosPorCliente
        };

        let promocion;
        let mensaje;

        // Si tiene ID, actualizar promoción existente
        if (idPromocion && idPromocion > 0) {
            // Verificar que la promoción exista
            const existePromocion = await Promociones.findByPk(idPromocion, { transaction: t });
            
            if (!existePromocion) {
                await t.rollback();
                return res.json({
                    status: 1,
                    message: `No existe una promoción con id ${idPromocion}`,
                    data: null
                });
            }
            
            // Actualizar la promoción existente
            await Promociones.update(datosPromocion, { 
                where: { idPromocion },
                transaction: t 
            });
            
            // Obtener la promoción actualizada
            promocion = await Promociones.findByPk(idPromocion, { transaction: t });
            
            // Eliminar acciones y condiciones existentes para actualizarlas
            await PromocionAccion.destroy({ 
                where: { idPromocion },
                transaction: t 
            });
            
            await PromocionCondicion.destroy({ 
                where: { idPromocion },
                transaction: t 
            });
            
            mensaje = "Promoción actualizada exitosamente";
        } else {
            // Crear nueva promoción
            promocion = await Promociones.create(datosPromocion, { transaction: t });
            mensaje = "Promoción creada exitosamente";
        }

        // Guardar las acciones
        if (acciones && acciones.length > 0) {
            const accionesParaGuardar = acciones.map(accion => ({
                idPromocion: promocion.idPromocion,
                tipoAccion: accion.tipoAccion,
                entidadObjetivo: accion.entidadObjetivo,
                idObjetivo: accion.idObjetivo,
                valor: accion.valor
            }));
            
            await PromocionAccion.bulkCreate(accionesParaGuardar, { transaction: t });
        }

        // Guardar las condiciones
        if (condiciones && condiciones.length > 0) {
            const condicionesParaGuardar = condiciones.map(condicion => ({
                idPromocion: promocion.idPromocion,
                tipoCondicion: condicion.tipoCondicion,
                entidadObjetivo: condicion.entidadObjetivo,
                idObjetivo: condicion.idObjetivo,
                operador: condicion.operador,
                valor: condicion.valor
            }));
            
            await PromocionCondicion.bulkCreate(condicionesParaGuardar, { transaction: t });
        }

        // Confirmar la transacción
        await t.commit();

        // Devolver respuesta con la promoción creada o actualizada
        res.json({
            status: 0,
            message: mensaje,
            data: {
                promocion,
                accionesGuardadas: acciones.length,
                condicionesGuardadas: condiciones.length
            }
        });
    } catch (error) {
        // Si hay error, hacer rollback de la transacción
        await t.rollback();
        
        console.error(error);
        res.json({
            status: 1,
            message: 'Error al procesar la promoción',
            data: error.message
        });
    }
}

const agregarPromotionCondition = async (req, res = response) => {
    const { idPromocion, tipoCondicion, entidadObjetivo, idObjetivo, operador, valor } = req.body;

    try {
        const nuevaCondicion = await PromocionCondicion.create({
            idPromocion,
            tipoCondicion,
            entidadObjetivo,
            idObjetivo,
            operador,
            valor
        });

        res.json({
            status: 0,
            message: "Condición de promoción agregada exitosamente",
            data: nuevaCondicion
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 1,
            message: 'Error al agregar la condición de promoción',
            data: error.message
        });
    }
}

const agregarPromotionAction = async (req, res = response) => {
    const { idPromocion, tipoAccion, entidadObjetivo, idObjetivo, valor } = req.body;

    try {
        const nuevaAccion = await PromocionAccion.create({
            idPromocion,
            tipoAccion,
            entidadObjetivo,
            idObjetivo,
            valor
        });

        res.json({
            status: 0,
            message: "Acción de promoción agregada exitosamente",
            data: nuevaAccion
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 1,
            message: 'Error al agregar la acción de promoción',
            data: error.message
        });
    }
}

const obtenerPromociones = async (req, res = response) => {
    try {
        const { pagina = 1, limite = 10, search = "", activo = null } = req.body;
        
        // Calcular offset para paginación
        const offset = (pagina - 1) * limite;
        
        // Crear objeto de condiciones WHERE
        let where = {};
        
        // Filtrar por nombre o descripción si hay búsqueda
        if (search && search.trim() !== '') {
            where = {
                [Op.or]: [
                    { nombre: { [Op.like]: `%${search}%` } },
                    { descripcion: { [Op.like]: `%${search}%` } }
                ]
            };
        }
        
        // Filtrar por estado activo/inactivo si se especifica
        if (activo !== null) {
            where.activo = activo;
        }
        
        // Realizar la consulta con paginación
        const { count, rows } = await Promociones.findAndCountAll({
            where,
            include: [
                {
                    model: PromocionCondicion,
                    as: 'condiciones'
                },
                {
                    model: PromocionAccion,
                    as: 'acciones'
                }
            ],
            order: [
                ['prioridad', 'DESC'],
                ['idPromocion', 'DESC']
            ],
            offset,
            limit: parseInt(limite)
        });

        // Calcular el total de páginas
        const totalPaginas = Math.ceil(count / limite);
        
        res.json({
            status: 0,
            message: "Promociones obtenidas exitosamente",
            data: {
                total: count,
                totalPaginas,
                paginaActual: parseInt(pagina),
                porPagina: parseInt(limite),
                promociones: rows
            }
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 1,
            message: 'Error al obtener las promociones',
            data: error.message
        });
    }
}

const obtenerPromocionById = async (req, res = response) => {
    const { idPromocion } = req.params;

    try {
        // Buscar la promoción por ID
        const promocion = await Promociones.findByPk(idPromocion, {
            include: [
                {
                    model: PromocionCondicion,
                    as: 'condiciones'
                },
                {
                    model: PromocionAccion,
                    as: 'acciones'
                }
            ]
        });

        if (!promocion) {
            return res.json({
                status: 1,
                message: `No existe una promoción con id ${idPromocion}`,
                data: null
            });
        }

        res.json({
            status: 0,
            message: "Promoción obtenida exitosamente",
            data: promocion
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 1,
            message: 'Error al obtener la promoción',
            data: error.message
        });
    }
}

const eliminarPromocion = async (req, res = response) => {
    const { idPromocion } = req.params;

    try {
        // Verificar si la promoción existe
        const promocion = await Promociones.findByPk(idPromocion);
        if (!promocion) {
            return res.json({
                status: 1,
                message: `No existe una promoción con id ${idPromocion}`,
                data: null
            });
        }

        // Eliminar la promoción y sus condiciones y acciones asociadas        
        await PromocionCondicion.destroy({ where: { idPromocion } });
        await PromocionAccion.destroy({ where: { idPromocion } });
        await Promociones.destroy({ where: { idPromocion } });

        res.json({
            status: 0,
            message: "Promoción eliminada exitosamente",
            data: null
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 1,
            message: 'Error al eliminar la promoción',
            data: error.message
        });
    }
}

module.exports = {
    crearPromocion,
    agregarPromotionCondition,
    agregarPromotionAction,
    obtenerPromociones,
    obtenerPromocionById,
    eliminarPromocion
}