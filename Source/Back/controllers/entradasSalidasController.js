const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection, dbSPConnection } = require('../database/config');

const cbxCatMovEntradaSalida = async(req, res = response) => {

    const { search = '', bALL = 0, idUserLogON } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxCatMovEntradaSalida( '${ search }', ${ bALL }, ${ idUserLogON } )`)

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

const insertUpdateEntradaSalida = async (req, res) => {
    const {

        idEntradasSalidasH = 0
        , idCatMov
        , idOrigen
        , idOrigenTo
        , comments

        , idUserLogON
        
    } = req.body;

    try {

        if(!idCatMov > 0){
            return res.json({
                status: 1,
                message: 'Debes seleccionar motivo'
            });
        }

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var oInsertUpdate = await dbConnection.query(`CALL insertUpdateEntradaSalida( 
            '${ oGetDateNow }'
            , ${ idEntradasSalidasH }
            , ${ idCatMov }
            , ${ idOrigen }
            , ${ idOrigenTo }
            , '${ comments }'
            , ${ idUserLogON }
            )`);

        return res.json({
            status: oInsertUpdate[0].out_id > 0 ? 0 : 1,
            message: oInsertUpdate[0].message,
            insertID: oInsertUpdate[0].out_id
        });

    } catch (error) {
        return res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getEntradasSalidasPaginado = async (req, res) => {
    const {
        startDate = ''
        , endDate = ''
        , idCatMov = 0
        , idEntradaSalidaStatus = 0
        , idOrigenFrom = 0
        , idOrigenTo = 0
        
        , search = ''
        , limiter = 10
        , start = 0
        , idUserLogON
    } = req.body;

    try {
        const result = await dbConnection.query(`CALL getEntradasSalidasPaginado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idCatMov }
            , ${ idEntradaSalidaStatus }
            , ${ idOrigenFrom }
            , ${ idOrigenTo }
            , '${ search }'
            , ${ start }
            , ${ limiter }
            , ${ idUserLogON }
            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getEntradaSalidaByID = async (req, res) => {
    const { idEntradasSalidasH } = req.body;

    try {
        const result = await dbConnection.query(`CALL getEntradaSalidaByID( ${idEntradasSalidasH} )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: result[0] || null
        });
    } catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const cbxArticulosParaES = async(req, res = response) => {

    const { idEntradasSalidasH, idCatMov, idOrigen, search = '', idUserLogON } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxArticulosParaES( ${ idEntradasSalidasH }, ${ idCatMov }, ${ idOrigen }, '${ search }', ${ idUserLogON } )`)

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

const agregarEntradaSalidaDetalle = async (req, res) => {
    var {
        idEntradasSalidasH = 0
        , idEntradasSalidasDetalle = 0
        , idCatMov
        , idOrigen
        , idOrigenTo
        , comments
        , idProducto
        , cantidad

        , idUserLogON
        } = req.body;

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        if(idEntradasSalidasH == 0)
        {
            var oInsertUpdate = await dbConnection.query(`CALL insertUpdateEntradaSalida( 
                '${ oGetDateNow }'
                , ${ idEntradasSalidasH }
                , ${ idCatMov }
                , ${ idOrigen }
                , ${ idOrigenTo }
                , '${ comments }'
                , ${ idUserLogON }
                )`);

            if(oInsertUpdate.length == 0){
                return res.json({
                    status: 2,
                    message: 'No se pudo generar ID'
                });
            }
            else{
                idEntradasSalidasH = oInsertUpdate[0].out_id;
                
            }
        }

        cantidad *= ( idCatMov == 5 ? -1 : 1 );

        const oAddDetail = await dbConnection.query(`CALL agregarEntradaSalidaDetalle(
            ${ idEntradasSalidasH }
            , ${ idEntradasSalidasDetalle }
            , ${ idProducto }
            , '${ cantidad }'
            )`);

        if(oAddDetail.length == 0){
            return res.json({
                status: 2,
                message: 'No se pudo agregar el producto a la lista'
            });
        }
        else{
            var idEntradasSalidasDetalle = oAddDetail[0].out_id;

            return res.json({
                status: idEntradasSalidasDetalle > 0 ? 0 : 1,
                message: idEntradasSalidasDetalle > 0 ? 'Agregado correctamente.' : 'No pudo agregar',
                insertID: idEntradasSalidasH,
                data: idEntradasSalidasDetalle
            });
        
        }

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getEntradaSalidaDetallePaginado = async (req, res) => {
    const { idEntradasSalidasH = 0, idUserLogON } = req.body;

    try {
        const result = await dbConnection.query(`CALL getEntradaSalidaDetallePaginado( ${ idEntradasSalidasH }, ${ idUserLogON } )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: result.length,
                rows: result
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const deleteEntradaSalidaDetalle = async (req, res) => {
    const {
        idEntradasSalidasDetalle
        , idUserLogON
    } = req.body;

    try {

        if(!idEntradasSalidasDetalle > 0){
            return res.json({
                status: 1,
                message: 'Debes seleccionar motivo'
            });
        }

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        const result = await dbConnection.query(`CALL deleteEntradaSalidaDetalle( 
            ${ idEntradasSalidasDetalle }
            )`);

        return res.json({
            status: result[0].out_id > 0 ? 0 : 1,
            message: result[0].message,
            insertID: result[0].out_id
        });

    } catch (error) {
        return res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const completarYGuardarES = async (req, res) => {
    const { idEntradasSalidasH, idUserLogON } = req.body;

    if(!(idEntradasSalidasH > 0)){
        return res.json({
            status: 1,
            message: 'Parametros incorrectos'
        });
    }
    
    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var oSQL = await connection.query(`CALL completarYGuardarES( '${ oGetDateNow }', ${ idEntradasSalidasH }, ${ idUserLogON } )`);

        oSQL = oSQL[0][0];

        if(oSQL[0].out_id == 0){
            await connection.rollback();
            connection.release();
        }else{
            await connection.commit();
            connection.release();
        }

        return res.json({
            status: oSQL[0].out_id > 0 ? 0 : 1,
            message: oSQL[0].message,
            insertID: oSQL[0].out_id
        });

    } catch (error) {

        await connection.rollback();
        connection.release();

        return res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const cbxOrigenesTo = async(req, res = response) => {

    const { idOrigenFrom, search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxOrigenesToES( '${ search }', ${ idOrigenFrom } )`)

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

const changeStatusES = async (req, res) => {
    const {
        idEntradasSalidasH
        , idStatus
        , idUserLogON
    } = req.body;

    try {

        if(!idEntradasSalidasH > 0){
            return res.json({
                status: 1,
                message: 'Debes seleccionar motivo'
            });
        }

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        const result = await dbConnection.query(`CALL changeStatusES( 
            ${ idEntradasSalidasH }
            , ${ idStatus }
            , ${ idUserLogON }
            )`);

        return res.json({
            status: result[0].out_id > 0 ? 0 : 1,
            message: result[0].message,
            insertID: result[0].out_id
        });

    } catch (error) {
        return res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const actualizarCantidadES = async (req, res) => {
    const {
        idEntradasSalidasDetalle
        , cantidad
        , idUserLogON
    } = req.body;

    try {

        if(!idEntradasSalidasDetalle > 0){
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        const result = await dbConnection.query(`CALL actualizarCantidadES( 
            ${ idEntradasSalidasDetalle }
            , ${ cantidad }
            )`);

        return res.json({
            status: result[0].out_id > 0 ? 0 : 1,
            message: result[0].message,
            insertID: result[0].out_id
        });

    } catch (error) {
        return res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const recibirArticulosES = async (req, res) => {
    var { idEntradasSalidasH, oDetailList, idUserLogON } = req.body;

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        if(!(idEntradasSalidasH > 0)){
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        const jsonString = JSON.stringify(oDetailList, null, 2);
        //console.log( 'jsonString', jsonString )

        var result = null;

        result = await dbConnection.query(`CALL recibirArticulosES( '${ oGetDateNow }', '${ jsonString }', ${ idEntradasSalidasH }, ${ idUserLogON } )`);

        return res.json({
            status: result[0].out_id > 0 ? 0 : 1,
            message: result[0].message,
        });

    } catch (error) {
        return res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const ReEnviarArticulosES = async (req, res) => {
    var { idEntradasSalidasH, oDetailList, idUserLogON } = req.body;

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        if(!(idEntradasSalidasH > 0)){
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        const jsonString = JSON.stringify(oDetailList, null, 2);
        //console.log( 'jsonString', jsonString )

        var result = null;

        result = await dbConnection.query(`CALL ReEnviarArticulosES( '${ oGetDateNow }', '${ jsonString }', ${ idUserLogON } )`);

        return res.json({
            status: result[0].out_id > 0 ? 0 : 1,
            message: result[0].message,
        });

    } catch (error) {
        return res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const enviarArticulosES = async (req, res) => {
    var { idEntradasSalidasH, oDetailList, idUserLogON } = req.body;

    if(!(idEntradasSalidasH > 0)){
        return res.json({
            status: 1,
            message: 'Parametros incorrectos'
        });
    }

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();
    
    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        const jsonString = JSON.stringify(oDetailList, null, 2);

        var oSQL = await connection.query(`CALL enviarArticulosES( '${ oGetDateNow }', '${ jsonString }', ${ idEntradasSalidasH }, ${ idUserLogON } )`);

        oSQL = oSQL[0][0];

        if(oSQL[0].out_id == 0){
            await connection.rollback();
            connection.release();
        }else{
            await connection.commit();
            connection.release();
        }

        return res.json({
            status: oSQL[0].out_id > 0 ? 0 : 1,
            message: oSQL[0].message,
        });


    } catch (error) {

        await connection.rollback();
        connection.release();

        return res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const cbxOrigenesFromFilterES = async(req, res = response) => {

    const { search = '', idUserLogON } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxOrigenesFromFilterES( '${ search }', ${ idUserLogON } )`)

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

const cbxOrigenesToFilterES = async(req, res = response) => {

    const { search = '', idUserLogON } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxOrigenesToFilterES( '${ search }', ${ idUserLogON } )`)

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

const cbxEntradasSalidasStatusFilterES = async(req, res = response) => {

    const { search = '', idUserLogON } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxEntradasSalidasStatusFilterES( '${ search }', ${ idUserLogON } )`)

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
    
    cbxCatMovEntradaSalida
    , insertUpdateEntradaSalida
    , getEntradasSalidasPaginado
    , getEntradaSalidaByID
    , cbxArticulosParaES
    , agregarEntradaSalidaDetalle
    , getEntradaSalidaDetallePaginado
    , deleteEntradaSalidaDetalle
    , completarYGuardarES
    , cbxOrigenesTo
    , changeStatusES
    , actualizarCantidadES
    , recibirArticulosES
    , ReEnviarArticulosES
    , enviarArticulosES

    , cbxOrigenesFromFilterES
    , cbxOrigenesToFilterES
    , cbxEntradasSalidasStatusFilterES

};


