const { response } = require('express');
const { Op } = require('sequelize');
const { dbConnection } = require('../database/config');
const moment = require('moment');
const Proveedor = require('../models/proveedores');

const cbxGetProveedores = async(req, res = response) => {

    const { search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxGetProveedores( '${ search }' )`)

        if(OSQL.length == 0){

            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });

        }
        else{

            res.json({
                status:  0,
                message:"Ejecutado correctamente.",
                data: OSQL
            });

        }

    }catch(error){

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }

};

const getProveedoresPaginado = async (req, res = response) => {
    const { search = '', limiter = 10, start = 0 } = req.body;

    try {
        var OSQL = await dbConnection.query(`call getProveedoresPaginado(
            '${ search }'
            , ${ start }
            , ${ limiter }
            )`);

        const iRows = OSQL.length > 0 ? OSQL[0].iRows : 0;

        res.json({
            status: 0,
            message: "Ejecutado correctamente.",
            data: {
                count: iRows,
                rows: OSQL
            }
        });

    } catch (error) {
        
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }
};

const proveedorById = async(req, res = response) =>{
    const idProveedor = req.params.id;
    const proveedor = await Proveedor.findByPk(idProveedor);
    
    res.json({
        status:0,
        message:'Proveedor por Id.',
        data:proveedor
    });
}

const guardarProveedor = async(req, res = response) => {
    const { 
        idProveedor,
        createDate,
        nombre, 
        calle, 
        numExt, 
        numInt, 
        entreCalles, 
        codigocolonia, 
        rfc, 
        telefono, 
        email,
        lat,
        long,
        active 
    } = req.body;

    try {
        if (idProveedor > 0) {
            const proveedorExistente = await Proveedor.findByPk(idProveedor);
            
            if (!proveedorExistente) {
                return res.status(404).json({
                    status: 1,
                    message: 'Proveedor no encontrado',
                    data: null
                });
            }

            const proveedorActualizado = await proveedorExistente.update({
                nombre,
                calle,
                numExt,
                numInt,
                entreCalles,
                codigocolonia,
                rfc,
                telefono,
                email,
                lat,
                long,
                active
            });

            return res.json({
                status: 0,
                message: 'Proveedor actualizado exitosamente',
                data: proveedorActualizado
            });
        } else {
            const nuevoProveedor = await Proveedor.create({
                createDate,
                nombre,
                calle,
                numExt,
                numInt,
                entreCalles,
                codigocolonia,
                rfc,
                telefono,
                email,
                lat,
                long,
                active
            });

            return res.json({
                status: 0,
                message: 'Proveedor creado exitosamente',
                data: nuevoProveedor
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 1,
            message: 'Error al guardar el proveedor',
            error: error.message
        });
    }
};

const eliminarProveedor = async(req, res = response) => {
    const { idProveedor } = req.params;

    try {
        const proveedor = await Proveedor.findByPk(idProveedor);
        
        if (!proveedor) {
            return res.status(404).json({
                status: 1,
                message: 'Proveedor no encontrado',
                data: null
            });
        }

        await proveedor.update({ active: false });

        return res.json({
            status: 0,
            message: 'Proveedor eliminado exitosamente',
            data: proveedor
        });

    } catch (error) {
        return res.status(500).json({
            status: 1,
            message: 'Error al eliminar el proveedor',
            error: error.message
        });
    }
};

module.exports = {
    cbxGetProveedores,
    getProveedoresPaginado,
    proveedorById,
    guardarProveedor,
    eliminarProveedor
};


