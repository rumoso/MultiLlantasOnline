const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection, dbSPConnection } = require('../database/config');

const consultarInvParaGenerarProdAgranel = async (req, res) => {
    const { idProductoAgranel } = req.body;

    try {

        const result = await dbConnection.query(`CALL consultarInvParaGenerarProdAgranel( ${ idProductoAgranel } )`);
        console.log(result);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: result || null
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const producirProdAgranel = async (req, res) => {
    const { idProductoAgranel, cantAProducir, oDetailList } = req.body;

    console.log( req.body )

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        const jsonString = JSON.stringify(oDetailList, null, 2);
        console.log( 'jsonString', jsonString )

        let costoTotal = oDetailList.reduce((acumulador, item) => acumulador + item.costoTotal, 0);

        //console.log( 'costoTotal', costoTotal )
        
        const oSQL = await dbConnection.query(`CALL producirProdAgranel(
            '${ oGetDateNow }'
            , ${ idProductoAgranel }
            , '${ cantAProducir }'
            , '${ costoTotal }'
            , '${ jsonString }'
            )`);
        console.log('oSQL', oSQL);

        return res.json({
            status: oSQL[0].out_id > 0 ? 0 : 1,
            message: oSQL[0].message,
            insertID: oSQL[0].out_id
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getProdProdAgranelPaginado = async (req, res) => {
    const { startDate = '', endDate = '', search = '', limiter = 10, start = 0 } = req.body;

    try {
        const result = await dbConnection.query(`CALL getProdProdAgranelPaginado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , '${search}'
            , ${start}
            , ${limiter}
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

const cbxProductosAgranelForPA = async(req, res = response) => {

    const { search = '', idProdProdAgranelH } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxProductosAgranelForPA( '${ search }', ${ idProdProdAgranelH } )`)

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

const agregarProdAgranelDetalle = async (req, res) => {
    var { idProdProdAgranelH = 0, idProductoAgranel, cantAProducir, oInvParaGenerar, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var idProdProdDetalle = 0;

        if(idProdProdAgranelH == 0)
        {
            var oInsertUpdate = await connection.query(`CALL insertUpdateProdProdAgranel(
                '${ oGetDateNow }'
                , ${ idProdProdAgranelH }
                , 1
                , ${ idUserLogON })`);

            var oInsertUpdate = oInsertUpdate[0][0];
            console.log('oInsertUpdate', oInsertUpdate)

            if(oInsertUpdate[0].out_id > 0){
                idProdProdAgranelH = oInsertUpdate[0].out_id;
            }
            else{
                await connection.rollback();
                connection.release();
                return res.json({
                    status: 2,
                    message: 'No se pudo generar ID para la producción'
                });
            }
        }

        var oAgregarPPADetalle = await connection.query(`CALL agregarProdProdAgranelDetalle(
            '${ oGetDateNow }'
            , ${ idProdProdAgranelH }
            , ${ idProductoAgranel }
            , ${ cantAProducir }
            , ${ 1 })`);
        oAgregarPPADetalle = oAgregarPPADetalle[0][0];
    
        if(oAgregarPPADetalle[0].out_id == 0){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 2,
                message: 'No se pudo agregar el producto a la lista'
            });
        }
        else{
            idProdProdDetalle = oAgregarPPADetalle[0].out_id;

            const jsonString = JSON.stringify(oInvParaGenerar, null, 2);
            
            var oSQL = await connection.query(`CALL insertProdProdAgranelStock(
                ${ idProdProdDetalle }
                , '${ jsonString }'
                )`);

            oSQL = oSQL[0][0];

            if(oSQL[0].out_id == 0){
                await connection.rollback();
                connection.release();
                return res.json({
                    status: 2,
                    message: 'No se pudo agregar el control de stock del producto base para la producción'
                });
            }
        }

        var bOKGeneral = idProdProdAgranelH > 0 && idProdProdDetalle > 0;

        if(bOKGeneral){
            await connection.commit();
            connection.release();
        }
        else{
            await connection.rollback();
            connection.release();
        }

        return res.json({
            status: bOKGeneral ? 0 : 1,
            message: bOKGeneral ? 'Agregado correctamente.' : 'No pudo agregar',
            insertID: idProdProdAgranelH,
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getProdProdAgranelByID = async (req, res) => {
    const { idProdProdAgranelH } = req.body;

    try {
        const result = await dbConnection.query(`CALL getProdProdAgranelByID( ${ idProdProdAgranelH } )`);

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

const getProdProdAgranelDetalle = async (req, res) => {
    const { idProdProdAgranelH } = req.body;

    try {
        const result = await dbConnection.query(`CALL getProdProdAgranelDetalle( ${ idProdProdAgranelH } )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
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

const completarYProducirPA = async (req, res) => {
    const { idProdProdAgranelH, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        if(!(idProdProdAgranelH > 0)){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var oSQL = await connection.query(`CALL producirProdAgranel( '${ oGetDateNow }', ${ idProdProdAgranelH }, ${ idUserLogON } )`);

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

const deletePPADetail = async (req, res) => {
    const { idProdProdAgranelH, idProdProdAgranelDetalle, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        if(!(idProdProdAgranelH > 0 && idProdProdAgranelDetalle > 0)){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        var oSQL = await connection.query(`CALL deletePPADetail( ${ idProdProdAgranelH }, ${ idProdProdAgranelDetalle }, ${ idUserLogON } )`);

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
            message: oSQL[0].message
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

module.exports = {
    consultarInvParaGenerarProdAgranel
    , producirProdAgranel

    , getProdProdAgranelPaginado
    , cbxProductosAgranelForPA
    , agregarProdAgranelDetalle
    , getProdProdAgranelByID
    , getProdProdAgranelDetalle
    , completarYProducirPA
    , deletePPADetail
};
