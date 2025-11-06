const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection } = require('../database/config');

const getClientesListWithPage = async (req, res = response) => {
    const { idVendedor = 0, idTipoCliente = 0, search = '', limiter = 10, start = 0 } = req.body;

    try {
        var OSQL = await dbConnection.query(`call getClientesListWithPage(
            ${ idVendedor }
            , ${ idTipoCliente }
            ,'${ search }'
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


const getClienteByID = async (req, res = response) => {
    const { idCliente } = req.body;

    try {
        var OSQL = await dbConnection.query(`call getClienteByID( ${ idCliente } )`);

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

const insertUpdateCliente = async (req, res = response) => {
    var {
        idCliente = 0,
        createDate = moment().format('YYYY-MM-DD HH:mm:ss'),
        idVendedor = 0,
        nombre = '',
        idTipoCliente = 0,
        calle = '',
        numExt = '',
        numInt = '',
        entreCalles = '',
        codigocolonia = 0,
        razonSocial = '',
        rfc = '',
        telefono = '',
        email = '',
        lat = 0,
        long = 0,
        active,
        bCredito = 0,
        iDiasCredito = 0,
        limiteCredito = 0,
        bPuntoDVenta = false,
        bDineroElectronico = false
    } = req.body;

    const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

    lat = lat == '' ? 0 : lat;
    long = long == '' ? 0 : long;
    iDiasCredito = iDiasCredito == '' ? 0 : iDiasCredito;
    limiteCredito = limiteCredito == '' ? 0 : limiteCredito;

    try {
        var OSQL = await dbConnection.query(`call insertUpdateCliente(
            '${oGetDateNow}',
            ${idCliente},
            '${ moment(createDate).format('YYYY-MM-DD HH:mm:ss') }',
            '${idVendedor}',
            '${nombre}',
            ${idTipoCliente},
            '${calle}',
            '${numExt}',
            '${numInt}',
            '${entreCalles}',
            '${codigocolonia}',
            '${razonSocial}',
            '${rfc}',
            '${telefono}',
            '${email}',
            '${lat}',
            '${long}',
            ${active},
            ${bCredito},
            '${iDiasCredito}',
            '${limiteCredito}',
            ${bPuntoDVenta},
            ${bDineroElectronico}
        )`);
        OSQL = OSQL[0] || null;

        var oClient = await dbConnection.query(`call getClienteByID( ${ OSQL.out_id } )`);

        res.json({
            status: OSQL.out_id > 0 ? 0 : 1,
            message: OSQL.message,
            insertID: OSQL.out_id,
            data: oClient[0] || null
        });

    } catch (error) {

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }
};


const deleteCliente = async (req, res = response) => {
    const { idCliente } = req.body;

    try {
        var OSQL = await dbConnection.query(`call deleteCliente(${idCliente})`);

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

const cbxTipoCliente = async(req, res = response) => {

    const {
        search = ''
        , bAll = 0
    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call cbxTipoCliente( '${ search }', ${ bAll } )`)

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

const cbxGetClientesParaVentasClientes = async(req, res = response) => {

    const {
        search = ''
    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call cbxGetClientesParaVentasClientes( '${ search }' )`)

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

const getClienteByTel = async (req, res = response) => {
  const { telefono } = req.body;
    try {
        var oClient = await dbConnection.query(`call getClienteByTel('${telefono}')`);
        oClient = oClient[0] || null;

        res.json({
            status: oClient ? 0 : 1,
            message: "Ejecutado correctamente.",
            data: oClient || null
        });
    } catch (error) {
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

const cbxGetTipoClienteEmprendedores = async(req, res = response) => {

    const {
        search = ''
    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call cbxGetTipoClienteEmprendedores( '${ search }' )`)

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
    getClientesListWithPage
    , getClienteByID
    , insertUpdateCliente
    , deleteCliente
    , cbxTipoCliente
    , cbxGetClientesParaVentasClientes
    , getClienteByTel
    , cbxGetTipoClienteEmprendedores
  }