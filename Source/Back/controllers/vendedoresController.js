const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection } = require('../database/config');

const getVendedoresListWithPage = async (req, res = response) => {
    const { search = '', limiter = 10, start = 0 } = req.body;

    try {
        var OSQL = await dbConnection.query(`call getVendedoresListWithPage('${search}', ${start}, ${limiter})`);

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

const getVendedorByID = async (req, res = response) => {
    const { idVendedor } = req.body;

    try {
        var OSQL = await dbConnection.query(`call getVendedorByID(${idVendedor})`);

        res.json({
            status: 0,
            message: "Ejecutado correctamente.",
            data: OSQL[0] || null
        });
    } catch (error) {
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

const insertUpdateVendedor = async (req, res = response) => {
    const {
        idVendedor,
        nombre,
        fechaIngreso,
        fechaNacimiento,
        sexo,
        idUser,
        idStatusVendedor,
        calle,
        numExt,
        numInt, 
        entreCalle = "",
        codigocolonia = 0,
        rfc,
        telefono,
        email,
        lat = 0,
        long = 0,
        active
    } = req.body;

    const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        var OSQL = await dbConnection.query(`call insertUpdateVendedor(
            '${oGetDateNow}',
             ${idVendedor},
            '${nombre}',
            '${ fechaIngreso ? fechaIngreso.substring(0, 10) : '0' }',
            '${ fechaNacimiento ? fechaNacimiento.substring(0, 10) : '0' }',
            '${sexo}',
            ${idUser},
            ${idStatusVendedor},
            '${calle}',
            '${numExt}',
            '${numInt}',
            '${entreCalle}',
            '${codigocolonia}',
            '${rfc}',
            '${telefono}',
            '${email}',
            '${lat}',
            '${long}',
            ${active}
        )`);

        res.json({
            status: OSQL[0].out_id > 0 ? 0 : 1,
            message: OSQL[0].message,
            insertID: OSQL[0].out_id
        });
    } catch (error) {
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

const deleteVendedor = async (req, res = response) => {
    const { idVendedor } = req.body;

    try {
        var OSQL = await dbConnection.query(`call deleteVendedor(${idVendedor})`);

        res.json({
            status: 0,
            message: "Eliminado correctamente.",
            data: OSQL
        });
    } catch (error) {
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

const cbxGetVendedores = async(req, res = response) => {

    const {
        search = '',
        idUserLogON
    } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxGetVendedores( '${search}', ${idUserLogON} )`)

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


module.exports = {
    getVendedoresListWithPage
    , getVendedorByID
    , insertUpdateVendedor
    , deleteVendedor
    , cbxGetVendedores
  }