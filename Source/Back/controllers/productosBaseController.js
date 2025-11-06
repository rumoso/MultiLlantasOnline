const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection, dbSPConnection } = require('../database/config');

const cbxGetProductosBase = async(req, res = response) => {

    const { search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxGetProductosBase( '${ search }' )`)

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

const agregarMateriaPrimaALaFomulaDeProductoBase = async (req, res) => {
    const { idFormula = 0, idProductoBase, idMateriaPrima, cantidad, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var result = await connection.query(`CALL agregarMateriaPrimaALaFomulaDeProductoBase(
            '${ oGetDateNow }'
            , ${ idFormula }
            , ${ idProductoBase }
            , ${ idMateriaPrima }
            , '${ cantidad }'
            , ${ idUserLogON }
            )`);
        result = result[0][0] || [];

        const oSQLUpdateCosto = await connection.query(`CALL actualizar_costo_producto( ${ idProductoBase } )`);
        
        await connection.commit();
        connection.release();
        
        res.json({
            status: result[0].out_id > 0 ? 0 : 1,
            message: result[0].message,
            insertID: result[0].out_id
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

const getFormulaByProdBasePaginado = async (req, res) => {
    const { idProductoBase, search = '', limiter = 10, start = 0 } = req.body;

    try {
        const result = await dbConnection.query(`CALL getFormulaByProdBasePaginado( ${ idProductoBase }, '${search}', ${start}, ${limiter})`);
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

const deleteMateriaPrimaDeLaFormula = async (req, res) => {
    const { idFormula, idProductoBase } = req.body;
    
    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();
    
    try {
        var oSQL = await connection.query(`CALL deleteMateriaPrimaDeLaFormula( ${ idFormula } )`);
        oSQL = oSQL[0][0];

        if(oSQL[0].out_id == 0){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 2,
                message: 'No se pudo eliminar'
            });
        }

        const oSQLUpdateCosto = await connection.query(`CALL actualizar_costo_producto( ${ idProductoBase } )`);

        await connection.commit();
        connection.release();

        res.json({
            status: 0,
            message: 'Eliminado correctamente.',
            data: result
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

const agregarProdBaseDetalle = async (req, res) => {
    var { idProdProdBaseDetalle = 0, idProductoBase, cantAProducir, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var oAgregarPPBDetalle = await connection.query(`CALL agregarProdProdBaseDetalle(
            '${ oGetDateNow }'
            , ${ idProdProdBaseDetalle }
            , ${ idProductoBase }
            , ${ cantAProducir }
            , ${ 0 }
            , ${ 0 }
            , ${ 0 }
            , ${ idUserLogON }
            )`);

        oAgregarPPBDetalle = oAgregarPPBDetalle[0][0] || [];

        console.log('oAgregarPPBDetalle', oAgregarPPBDetalle)

        if(oAgregarPPBDetalle.out_id == 0){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 2,
                message: 'No se pudo agregar el producto base a la lista'
            });
        }
        else{
            idProdProdBaseDetalle = oAgregarPPBDetalle[0].out_id;
        }

        var oRevisarStockPPB = null;

        if(idProdProdBaseDetalle > 0){
            oRevisarStockPPB = await revisarStockPPB_(connection, oGetDateNow, idProdProdBaseDetalle, idProductoBase, cantAProducir, idUserLogON);
        }

        if( oRevisarStockPPB.status == 0 ){
            await connection.commit();
            connection.release();
        }else{
            await connection.rollback();
            connection.release();
        }

        return res.json({
            status: oRevisarStockPPB.data.bOKGeneral ? 0 : 1,
            message: oRevisarStockPPB.data.bOKGeneral ? 'Ejecutado correctamente.' : 'No hay inventario',
            insertID: idProdProdBaseDetalle,
            data: {
                bOKGeneral: oRevisarStockPPB.data.bOKGeneral,
                cantProducida: cantAProducir,
                rows: oRevisarStockPPB.data.resultado
            }
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

const revisarStockPPB_ = async (connection, oGetDateNow, idProdProdBaseDetalle, idProductoBase, cantAProducir, idUserLogON) => {
    try {

        var oSQL = await connection.query(`CALL deleteProdProdBaseStock( ${ idProdProdBaseDetalle } )`);

        var inventario = await connection.query(`CALL consInvPFormDeProdBase( ${ idProductoBase }, '${cantAProducir}' )`);
        inventario = inventario[0][0] || [];

        if(inventario.length == 0){
            return {
                status: 2,
                message: 'No hay inventario para generar esta fórmula'
            };
        }

        var resultado = [];

        if(inventario.length > 0){

            for (let stock of inventario) {

                let { idMateriaPrima, cantNecesaria, cantidadDisp, materiaPrimaName } = stock;

                if (!resultado.some(item => item.idMateriaPrima === stock.idMateriaPrima)) {
                    resultado.push({
                        bOK: parseFloat( cantidadDisp ) >= parseFloat( cantNecesaria ),
                        idMateriaPrima,
                        materiaPrimaName,
                        cantidadDisponible: parseFloat( cantidadDisp ),
                        cantidadConsumida: Number((cantNecesaria).toFixed(2))
                    });
                }
            }

        }
    
        if(resultado.length > 0 && resultado.every(item => item.bOK)){

            var oProducto = await dbConnection.query(`CALL getProductoByID( ${ idProductoBase } )`);

            const jsonString = JSON.stringify(resultado, null, 2);
            
            var oSQL = await connection.query(`CALL insertProdProdBaseStock(
                '${ oGetDateNow }'
                , '${ oProducto[0].articuloName }'
                , ${ idProdProdBaseDetalle }
                , '${ jsonString }'
                )`);
            
            oSQL = oSQL[0][0] || [];

            if (oSQL.out_id === 0) {
                return {
                    status: 2,
                    message: 'No se pudo guardar el stock consumido del producto base'
                };
            }
        }

        let bOKGeneral = resultado.every(item => item.bOK);
    
        return {
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                bOKGeneral: bOKGeneral,
                resultado: resultado
            }
        };

    } catch (error) {
        return {
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        };
    }
};

const getProdProdBaseByID = async (req, res) => {
    const { idProdProdBaseH } = req.body;

    try {
        const result = await dbConnection.query(`CALL getProdProdBaseByID( ${ idProdProdBaseH } )`);

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

const getProdProdBaseDetallePag = async (req, res) => {
    const {
        startDate = '',
        endDate = '',
        idProducto = 0,
        idStatus = 0,
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;

    

    try {
        const oSQL = await dbConnection.query(`CALL getProdProdBaseDetallePag( 
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idProducto }
            , ${ idStatus }
            , ${ start }
            , ${ limiter }
            , ${ idUserLogON }
            
            )`);

        const iRows = ( oSQL.length > 0 ? oSQL[0].iRows: 0 );
            
        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: oSQL
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

const completarYProducirPB = async (req, res) => {
    const { idProdProdBaseH, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        if(!(idProdProdBaseH > 0)){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var oSQL = await connection.query(`CALL producirProdBase2( '${ oGetDateNow }', ${ idProdProdBaseH }, ${ idUserLogON } )`);

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

const deletePPBDetail = async (req, res) => {
    const { idProdProdBaseH, idProdProdBaseDetalle, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        if(!(idProdProdBaseH > 0 && idProdProdBaseDetalle > 0)){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        var oSQL = await connection.query(`CALL deletePPBDetail( ${ idProdProdBaseH }, ${ idProdProdBaseDetalle }, ${ idUserLogON } )`);

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

const cbxStatusProdBase = async(req, res = response) => {

    const { search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxStatusProdBase( '${ search }' )`)

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

const changeStatusPPB = async (req, res) => {
    var { idStatus, catlist, comments = '', idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        if(!(idStatus > 0 && catlist.length > 0)){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        comments = comments.replace(/\n/g, '\\n').replace(/\r/g, '\\r');

        catlist = catlist.map(item => ({
            ...item,
            cantProducida: item.cantProducida ?? 0, // Si es null o undefined, pone 0
            comments: comments ?? ''
        }));

        const jsonString = JSON.stringify(catlist, null, 2);
        //console.log( 'jsonString', jsonString )

        var oSQL = await connection.query(`CALL changeStatusPPB2( '${ oGetDateNow }', ${ idStatus }, '${ jsonString }', ${ idUserLogON } )`);

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

const getPPBStock = async (req, res) => {
    const { idProdProdBaseDetalle } = req.body;

    try {
        const result = await dbConnection.query(`CALL getPPBStock( ${ idProdProdBaseDetalle } )`);

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

const revisarStockPPB = async (req, res) => {
    var { idProdProdBaseDetalle = 0, idProductoBase, cantAProducir, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        
        var oRevisarStockPPB = null;

        if(idProdProdBaseDetalle > 0){
            oRevisarStockPPB = await revisarStockPPB_(connection, oGetDateNow, idProdProdBaseDetalle, idProductoBase, cantAProducir, idUserLogON);
        }

        if( oRevisarStockPPB.status == 0 ){
            await connection.commit();
            connection.release();
        }else{
            await connection.rollback();
            connection.release();
        }

        return res.json({
            status: oRevisarStockPPB.data.bOKGeneral ? 0 : 1,
            message: oRevisarStockPPB.data.bOKGeneral ? 'Ejecutado correctamente.' : 'No hay inventario',
            insertID: idProdProdBaseDetalle,
            data: {
                bOKGeneral: oRevisarStockPPB.data.bOKGeneral,
                cantProducida: cantAProducir,
                rows: oRevisarStockPPB.data.resultado
            }
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

const actualizarCantProducida = async (req, res) => {
    var { idProdProdBaseDetalle = 0, idProductoBase, cantAProducir, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        
        var oSQL = await connection.query(`CALL actualizarCantProducida( ${ idProdProdBaseDetalle }, '${ cantAProducir }' )`);
        oSQL = oSQL[0][0] || [];

        if(oSQL[0]?.out_id > 0){
            var oRevisarStockPPB = null;

            if(idProdProdBaseDetalle > 0){
                oRevisarStockPPB = await revisarStockPPB_(connection, oGetDateNow, idProdProdBaseDetalle, idProductoBase, cantAProducir, idUserLogON);
            }

            if( oRevisarStockPPB.status == 0 ){
                await connection.commit();
                connection.release();
            }else{
                await connection.rollback();
                connection.release();
            }

            return res.json({
                status: oRevisarStockPPB.data.bOKGeneral ? 0 : 1,
                message: oRevisarStockPPB.data.bOKGeneral ? 'Ejecutado correctamente.' : 'No hay inventario',
                insertID: idProdProdBaseDetalle,
                data: {
                    bOKGeneral: oRevisarStockPPB.data.bOKGeneral,
                    cantProducida: cantAProducir,
                    rows: oRevisarStockPPB.data.resultado
                }
            });
        }else{
            await connection.rollback();
            connection.release();
            return {
                status: 2,
                message: 'No se pudo actualizar.',
            };
        }
        
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


module.exports = {
    cbxGetProductosBase
    , agregarMateriaPrimaALaFomulaDeProductoBase
    , getFormulaByProdBasePaginado
    , deleteMateriaPrimaDeLaFormula
    , agregarProdBaseDetalle
    , getProdProdBaseByID
    , getProdProdBaseDetallePag
    , completarYProducirPB
    , deletePPBDetail
    , cbxStatusProdBase
    , changeStatusPPB
    , getPPBStock
    , revisarStockPPB
    , actualizarCantProducida
};
