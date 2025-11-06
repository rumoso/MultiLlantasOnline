const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection, dbSPConnection } = require('../database/config');

const getOrdenesCompraListWithPage = async (req, res) => {
    // Solo consulta, no requiere transacción
    const {
        startDate = '',
        endDate = '',
        idProveedor = 0,
        folio = 0,
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;

    try {
        const result = await dbConnection.query(`CALL getOrdenesCompraListWithPage(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idProveedor }
            , ${ folio == '' ? 0 : folio }
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

const getOrdenCompraByID = async (req, res) => {
    // Solo consulta, no requiere transacción
    const { idOrdenDeCompra } = req.body;

    try {
        const result = await dbConnection.query(`CALL getOrdenCompraByID(${idOrdenDeCompra})`);

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

const insertUpdateOrdenCompra = async (req, res) => {
    // Modifica datos, requiere transacción
    const {
        idOrdenDeCompra
        , idProveedor
        , active
        , numeroFactura = ''
        , fechaPedido = ''
        , fechaRecepcion = ''
        , idUserLogON
    } = req.body;

    if(!idProveedor > 0){
        return res.json({
            status: 1,
            message: 'Debes seleccionar proveedor'
        });
    }
    
    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        const result = await connection.query(`CALL insertUpdateOrdenCompra( 
            '${ oGetDateNow }'
            , ${ idOrdenDeCompra }
            , ${ idProveedor }
            , '${ numeroFactura }'
            , '${ fechaPedido ? fechaPedido.substring(0, 10) : '' }'
            , '${ fechaRecepcion ? fechaRecepcion.substring(0, 10) : '' }'
            , ${ active }
            , ${ idUserLogON }
            )`);

        const spData = result[0][0][0];

        // Validar el resultado del SP
        if (spData && spData.out_id > 0) {
            await connection.commit();
            connection.release();
            return res.json({
                status: spData.out_id > 0 ? 0 : 1,
                message: spData.message,
                insertID: spData.out_id
            });
        } else {
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: spData && spData.message ? spData.message : 'No se pudo guardar la orden de compra'
            });
        }

    } catch (error) {
        await connection.rollback();
        connection.release();

        return res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const deleteOrdenCompra = async (req, res) => {
    // Modifica datos, requiere transacción
    const { idOrdenDeCompra } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const result = await connection.query(`CALL deleteOrdenCompra(${idOrdenDeCompra})`);

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
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const agregarOrdenCompraDetalle = async (req, res) => {
    // Modifica datos, requiere transacción
    const { idOrdenDeCompraDetalle, idOrdenDeCompra, idProducto, cantidad, costo } = req.body;

    if(!(idOrdenDeCompra > 0 && idProducto > 0 && cantidad > 0 && costo > 0)){
        return res.json({
            status: 1,
            message: 'Parametros incorrectos'
        });
    }

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var result = await connection.query(`CALL agregarOrdenCompraDetalle( ${ idOrdenDeCompraDetalle }, ${ idOrdenDeCompra }, ${ idProducto }, '${ cantidad }', '${ costo }')`);

        var spData = result[0][0][0];

        if (spData.out_id > 0) {
            await connection.commit();
            connection.release();
            return res.json({
                status: 0,
                message: spData.message,
                insertID: spData.out_id
            });
        } else {
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: spData.message,
                insertID: spData.out_id
            });
        }
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

const getOrdenCompraDetailListWithPage = async (req, res) => {
    // Solo consulta, no requiere transacción
    const { idOrdenDeCompra = 0 } = req.body;

    try {
        const result = await dbConnection.query(`CALL getOrdenCompraDetailList( ${ idOrdenDeCompra } )`);

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

const deleteOrdenCompraDetalle = async (req, res) => {
    // Modifica datos, requiere transacción
    const { idOrdenDeCompra, idOrdenDeCompraDetalle } = req.body;

    if(!idOrdenDeCompraDetalle > 0){
        return res.json({
            status: 1,
            message: 'Parametros incorrectos'
        });
    }

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        const result = await connection.query(`CALL deleteOrdenCompraDetalle( ${ idOrdenDeCompra }, ${ idOrdenDeCompraDetalle } )`);

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
        return res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const completarOrdenCompra = async (req, res) => {
    const { idOrdenDeCompra, idUserLogON } = req.body;

    if(!(idOrdenDeCompra > 0)){
        return res.json({
            status: 1,
            message: 'Parametros incorrectos'
        });
    }

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        const result = await connection.query(`CALL completarOrdenCompra( '${ oGetDateNow }', ${ idOrdenDeCompra }, ${ idUserLogON } )`);

        const spData = result[0][0][0];

        // Validar el resultado del SP
        if (spData && spData.out_id > 0) {
            await connection.commit();
            connection.release();
            return res.json({
                status: spData.out_id > 0 ? 0 : 1,
                message: spData.message,
                insertID: spData.out_id
            });
        } else {
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: spData && spData.message ? spData.message : 'No se pudo completar la orden de compra'
            });
        }

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
    getOrdenesCompraListWithPage
    , getOrdenCompraByID
    , insertUpdateOrdenCompra
    , deleteOrdenCompra
    , agregarOrdenCompraDetalle
    , getOrdenCompraDetailListWithPage
    , deleteOrdenCompraDetalle
    , completarOrdenCompra
};
