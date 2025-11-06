const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection, dbSPConnection } = require('../database/config');

const { agruparCarrito, prorratearEnvases, validarPromociones } = require('../utils/ventasUtils');

const cbxCatStatusPedidosClientes = async(req, res = response) => {
    const { search = '', bChangeStatus } = req.body;
    try{
        var OSQL = await dbConnection.query(`call cbxCatStatusPedidosClientes( '${ search }', ${ bChangeStatus } )`)
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

const cbxGetClientesParaPedidos = async(req, res = response) => {
    const { search = '' } = req.body;
    try{
        var OSQL = await dbConnection.query(`call cbxGetClientesParaPedidos( '${ search }' )`)
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

const cbxGetClientes = async(req, res = response) => {
    const { search = '' } = req.body;
    try{
        var OSQL = await dbConnection.query(`call cbxGetClientes( '${ search }' )`)
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

const cbxArticulosParaPedidosClientes = async(req, res = response) => {
    
    var {
        search = ''
        , idSucursal = 0
        , idOrigenVendedor = 0
        , idUserLogON
    } = req.body;

    try{

        if(!idSucursal){
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        var OSQL = await dbConnection.query(`call cbxArticulosParaPedidosClientes(
            '${ search }'
            , ${ idSucursal }
            , ${ idOrigenVendedor }
            , ${ idUserLogON } )`)
            
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

const agregarPedidoDetalle = async (req, res) => {
    let {
        idPedido = 0
        , idCliente = 0
        , idRepartidor = 0
        , idTipoVenta = 0
        , fechaEntrega = ''
        , fechaEntregada = ''

        , idPedidoDetalle = 0
        , comments
        , cantEnvases = 0
        , idProducto
        , bEnvase
        , cantidad

        , idSucursal = 0

        , idUserLogON
    } = req.body;

    if(!idSucursal){
        return res.json({
            status: 1,
            message: 'Parametros incorrectos'
        });
    }

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        // Si aún no hay pedido, crearlo y obtener idPedido
        if (idPedido == 0) {
            var oInsertUpdate = await connection.query(`CALL insertUpdatePedidosClientes(
                '${oGetDateNow}'
                , ${idPedido}
                , ${idCliente}
                , ${idRepartidor}
                , ${idTipoVenta}
                , '${fechaEntrega ? fechaEntrega.substring(0, 10) : ''}'
                , '${fechaEntregada ? fechaEntregada.substring(0, 10) : ''}'
                , '${comments}'
                , ${ cantEnvases == '' ? 0 : cantEnvases }

                , ${ idSucursal }
                , ${idUserLogON}
            )`);
            oInsertUpdate =  oInsertUpdate[0][0];

            if (oInsertUpdate.length == 0) {
                await connection.rollback();
                connection.release();
                return res.json({
                    status: 2,
                    message: 'No se pudo generar ID'
                });
            } else {
                idPedido = oInsertUpdate[0].out_id;
            }
        }

        var oAddDetail = await connection.query(`CALL agregarPedidosClientes(
            ${ idPedido }
            , ${ idPedidoDetalle }
            , ${ idProducto }
            , ${ bEnvase }
            , '${ cantidad }'
            )`);
        oAddDetail =  oAddDetail[0][0];

        if(oAddDetail.length == 0){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 2,
                message: 'No se pudo agregar el producto a la lista'
            });
        }
        else{
            idPedidoDetalle = oAddDetail[0].out_id;

            await prorratearEnvasesPorPedido(idPedido, idUserLogON, connection);

            await promocionesApply(idPedido, idUserLogON, connection, bSinPromocion = false);

            await connection.commit();
            connection.release();

            return res.json({
                status: 0,
                message: 'Pedido actualizado correctamente',
                insertID: idPedido,
                //data: toStore
            });
        
        }

    } catch (error) {
        await connection.rollback();
        connection.release();

        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: { error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...error // incluye otros campos si existen
        } }
        });
    }
};

const getPedidoClienteDetalle = async (req, res) => {
    const { idPedido = 0, idUserLogON } = req.body;
    try {
        const result = await dbConnection.query(`CALL getPedidoClienteDetalle( ${ idPedido }, ${ idUserLogON } )`);

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

const getPedidosClientesPaginado = async (req, res) => {
    const {
        startDate = '',
        endDate = '',
        idCatStatusPedidosClientes = 0,
        idTipoVenta = 0,
        idRepartidor = 0,
        idCliente = 0,
        idPedidoSearch = '', // <-- Nuevo parámetro
        search = '',
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;
    try {
        const result = await dbConnection.query(`CALL getPedidosClientesPaginado(
            '${ startDate ? startDate.substring(0, 10) : '' }',
            '${ endDate ? endDate.substring(0, 10) : '' }',
            ${idCatStatusPedidosClientes},
            ${idTipoVenta},
            ${idRepartidor},
            ${idCliente},
            '${idPedidoSearch}',
            '${search}',
            ${start},
            ${limiter},
            ${idUserLogON}
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
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: { error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...error // incluye otros campos si existen
        } }
        });
    }
};

const getPedidoByID = async (req, res) => {
    const { idPedido } = req.body;
    try {
        const result = await dbConnection.query(`CALL getPedidoByID( ${ idPedido } )`);
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

const insertUpdatePedidosClientes = async (req, res) => {
    var {
        idPedido = 0,
        idCliente,
        idRepartidor = 0,
        idTipoVenta = 0,
        fechaEntrega = '',
        fechaEntregada = '',
        comments = '',
        cantEnvases = 0,
        
        idSucursal = 0,

        idUserLogON
    } = req.body;

    if(!idSucursal){
        return res.json({
            status: 1,
            message: 'Parametros incorrectos'
        });
    }

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        var oInsertUpdate = await connection.query(`CALL insertUpdatePedidosClientes( 
            '${ oGetDateNow }'
            , ${ idPedido }
            , ${ idCliente }
            , ${ idRepartidor }
            , ${ idTipoVenta }
            , '${ fechaEntrega ? fechaEntrega.substring(0, 10) : '' }'
            , '${ fechaEntregada ? fechaEntregada.substring(0, 10) : '' }'
            , '${ comments }'
            , ${ cantEnvases == '' ? 0 : cantEnvases }

            , ${ idSucursal }
            , ${ idUserLogON }
        )`);
        oInsertUpdate =  oInsertUpdate[0][0];

        if(oInsertUpdate[0].out_id > 0){
            idPedido = oInsertUpdate[0].out_id
            await prorratearEnvasesPorPedido(idPedido, idUserLogON, connection);
            await promocionesApply(idPedido, idUserLogON, connection, bSinPromocion = false);
        }

        await connection.commit();
        connection.release();

        return res.json({
            status: oInsertUpdate[0].out_id > 0 ? 0 : 1,
            message: oInsertUpdate[0].message,
            insertID: oInsertUpdate[0].out_id
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

const updateStatusPedidoCliente = async (req, res) => {
    const { idPedido, idCatStatusPedidosClientes } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        if (!idPedido || !idCatStatusPedidosClientes) {
            return res.json({
                status: 1,
                message: 'Parámetros inválidos'
            });
        }

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var oSQL = await connection.query(`CALL updateStatusPedidoCliente( 
            '${ oGetDateNow }'
            , ${ idPedido }
            , ${ idCatStatusPedidosClientes }
        )`);

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

const cbxGetRepartidores = async (req, res = response) => {
    const { search = '' } = req.body;
    try {
        const OSQL = await dbConnection.query(`CALL cbxGetRepartidores('${search}')`);
        if (OSQL.length === 0) {
            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });
        } else {
            res.json({
                status: 0,
                message: "Ejecutado correctamente.",
                data: OSQL
            });
        }
    } catch (error) {
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

const cbxGetTiposDeVenta = async (req, res = response) => {
    const { search = '', idCliente = 0 } = req.body;
    try {
        const OSQL = await dbConnection.query(`CALL cbxGetTiposDeVenta( '${ search }', ${ idCliente } )`);
        if (OSQL.length === 0) {
            res.json({
                status: 3,
                message: "No se encontró información.",
                data: null
            });
        } else {
            res.json({
                status: 0,
                message: "Ejecutado correctamente.",
                data: OSQL
            });
        }
    } catch (error) {
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

const deletePedidoDetalle = async (req, res) => {
    const { idPedidoDetalle, idPedido, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        if (!idPedidoDetalle || idPedidoDetalle <= 0) {
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'ID inválido'
            });
        }
        var result = await connection.query(`CALL deletePedidoDetalle(${idPedidoDetalle})`);
        result =  result[0][0];

        await prorratearEnvasesPorPedido(idPedido, idUserLogON, connection);

        await promocionesApply(idPedido, idUserLogON, connection, bSinPromocion = false);

        await connection.commit();
        connection.release();

        return res.json({
            status: result[0].out_id > 0 ? 0 : 1,
            message: result[0].message
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

async function prorratearEnvasesPorPedido(id, idUserLogON, connection) {

    var oHeader = await connection.query(
        `CALL getPedidoByID( ${ id } )`
    );
    oHeader =  oHeader[0][0][0] || {};
    //console.log('oHeader', oHeader);

    var envasesList = await connection.query(
        `CALL getPedidoClienteEnvases(${ id }, ${idUserLogON})`
    );
    envasesList =  envasesList[0][0];

    // 1. Traer el detalle actual de la BD (por si es edición)
    var detalleActual = await connection.query(
        `CALL getPedidoClienteDetalle(${ id }, ${idUserLogON})`
    );
    detalleActual =  detalleActual[0][0];
    //console.log('detalleActual', detalleActual);

    // AGRUPO EL CARRITO PARA QUE NO SEA PROBLEMA LA DISTRIBUCIÓN
    detalleActual = agruparCarrito(detalleActual, 'idPedidoDetalle');

    // LOS CLIENTES TIPO EMPRENDEDOR O PUNTO DE VENTA NO NECESITAN LA BANDERA DEL bCanEnvase
    var bAllbEnvase = oHeader.idTipoCliente == 3 || oHeader.idTipoCliente == 4;
    const { prorrateados } = prorratearEnvases(bAllbEnvase, detalleActual, envasesList, 'idPedidoDetalle')
    //console.log('prorrateados', prorrateados);

    // 3. Generar JSONS separados
    const insertUpdateList = prorrateados.filter(p => p.bChange);

    // 4. Guardar cambios en la BD a través de un solo Store Procedure usando JSON
    if (insertUpdateList.length > 0) {
        await connection.query(
            `CALL syncPedidoClienteDetalle( ${ id }, '${ JSON.stringify(insertUpdateList) }')`
        );
    }
}

async function promocionesApply(id, idUserLogON, connection, bSinPromocion = false) {

    var oHeader = await connection.query(
        `CALL getPedidoByID( ${ id } )`
    );
    oHeader =  oHeader[0][0][0] || {};
    
    // 1. Traer el detalle actual de la BD (por si es edición)
    var detalleActual = await connection.query(
        `CALL getPedidoClienteDetalle(${ id }, ${idUserLogON})`
    );
    detalleActual =  detalleActual[0][0];

    if(detalleActual.length > 0){
        var oParam = {
            oHeader: {
                idCliente: oHeader.idCliente,
                idTipoCliente: oHeader.idTipoCliente,
                idTipoVenta: oHeader.idTipoVenta,
                puntoVenta: 2 // VENTA A CLIENTE
            },
            productosList: detalleActual
        }
        //console.log('oParam', oParam);


        // El resultado puede venir anidado, ajusta si tu driver lo retorna distinto
        const { productosList } = await validarPromociones(oParam, 'idPedidoDetalle', bSinPromocion);
        console.log('productosList', productosList)

        await connection.query(
            `CALL updatePedidoClienteDetallePromos( ${ id }, '${ JSON.stringify(productosList) }')`
        );
    }
}

const getPedidosPendientesPaginado = async (req, res) => {
    const {
        startDate = '',
        endDate = '',
        idPedidoSearch = '', // <-- Nuevo parámetro
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        search = '',
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;
    try {
        const result = await dbConnection.query(`CALL getPedidosPendientesPaginado(
            '${ startDate ? startDate.substring(0, 10) : '' }',
            '${ endDate ? endDate.substring(0, 10) : '' }',
            '${ idPedidoSearch }',
            ${ idSucursal },
            ${ idVendedor },
            ${ idCliente },
            '${ search }',
            ${ start },
            ${ limiter },
            ${ idUserLogON }
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
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: { error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...error // incluye otros campos si existen
        } }
        });
    }
};

const deletePedido = async (req, res) => {
    const { idPedido, idUserLogON } = req.body;

    try {
        if (!idPedido || idPedido <= 0) {
            return res.json({
                status: 1,
                message: 'ID inválido'
            });
        }
        var result = await dbConnection.query(`CALL deletePedido( ${ idPedido } )`);
        console.log('result', result);
        return res.json({
            status: result[0].out_id > 0 ? 0 : 1,
            message: result[0].message
        });

    } catch (error) {

        return res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const cambioStatusPedido = async (req, res) => {
    const { idPedido, idCatStatusPedidosClientes, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        if (!idPedido || idPedido <= 0 || !idCatStatusPedidosClientes || idCatStatusPedidosClientes <= 0) {
            return res.json({
                status: 1,
                message: 'ID inválido o Estatus inválido'
            });
        }

        var oSQL = await connection.query(`CALL cambioStatusPedido(
            ${ idPedido }
            , ${ idCatStatusPedidosClientes }
            , ${ idUserLogON }
        )`);

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

        return res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const copiarPedido = async (req, res) => {
    const { idPedido, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        if(!(idPedido > 0 )){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        var oSQL = await connection.query(`CALL copiarPedido( ${ idPedido }, '${ oGetDateNow }', ${ idUserLogON } )`);

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

const quitarPromosiones = async (req, res) => {
    const { idPedido, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        if(!(idPedido > 0 )){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        await promocionesApply(idPedido, idUserLogON, connection, bSinPromocion = true);

        await connection.commit();
        connection.release();

        return res.json({
            status: 0,
            message: 'Se han quitado las promociones correctamente'
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
    
    cbxCatStatusPedidosClientes
    , cbxGetClientesParaPedidos
    , cbxGetClientes
    , cbxArticulosParaPedidosClientes
    , agregarPedidoDetalle
    , getPedidoClienteDetalle
    , getPedidosClientesPaginado
    , getPedidoByID

    , cbxGetRepartidores
    , cbxGetTiposDeVenta
    , deletePedidoDetalle


    , insertUpdatePedidosClientes
    , updateStatusPedidoCliente

    , getPedidosPendientesPaginado

    , deletePedido
    , cambioStatusPedido
    , copiarPedido

    , quitarPromosiones

};


