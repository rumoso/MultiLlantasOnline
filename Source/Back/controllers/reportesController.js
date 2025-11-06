const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection } = require('../database/config');

const rep_InventarioPaginado = async (req, res) => {
    var {
        idOrigen = 0
        , idFamilia = 0
        , idProducto = 0
        , idUnidadMedida = 0
        , valorMedida = ''
        
        , search = ''
        , limiter = 10
        , start = 0
        , idUserLogON
    } = req.body;

    try {

        if(valorMedida == null || valorMedida == undefined){
            valorMedida = '';
        }

        const result = await dbConnection.query(`CALL rep_InventarioPaginado(
            ${ idOrigen }
            , ${ idFamilia }
            , ${ idProducto }
            , ${ idUnidadMedida }
            , '${ valorMedida }'

            , ${ start }
            , ${ limiter }
            , ${ idUserLogON }
            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        const getSUMInventario = await dbConnection.query(`CALL getSUMInventario(
            ${ idOrigen }
            , ${ idFamilia }
            , ${ idProducto }
            , ${ idUnidadMedida }
            , '${ valorMedida }'
            , ${ idUserLogON }
            )`);

        console.log(getSUMInventario)

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                getSUMInventario: getSUMInventario
            }
        });
    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const cbxOrigenes = async(req, res = response) => {

    const { search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxOrigenes( '${ search }' )`)

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

const cbxAllProductos = async(req, res = response) => {

    const { search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxAllProductos( '${ search }' )`)

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

const rep_InventarioHistPaginado = async (req, res) => {
    const { idOrigen = 0, idProducto = 0, search = '', limiter = 10, start = 0, idUserLogON } = req.body;

    try {
        const result = await dbConnection.query(`CALL rep_InventarioHistPaginado(
            ${ idOrigen }
            , ${ idProducto }
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
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getEmployeesRespForOrigen = async (req, res) => {
    const { idOrigen = 0, idUserLogON } = req.body;

    try {
        const result = await dbConnection.query(`CALL getEmployeesRespForOrigen(
            ${ idOrigen }
            )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: result
        });
    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const repCreditosPag = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        statusFiltro = 2,
        estatusCredito = '',

        idUserLogON
    } = req.body;

    console.log('repCreditosPag', req.body);

    try {

        const result = await dbConnection.query(`CALL repCreditosPag(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ statusFiltro }

            , '${ estatusCredito }'
            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        const oSum = await dbConnection.query(`CALL repCreditosSumarizado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ statusFiltro }

            , '${ estatusCredito }'
            )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                oSum: oSum[0] ?? {}
            }
        });
    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repPagos = async (req, res) => {
    const {
        startDate = '',
        endDate = '',
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        folioVenta = '',
        tipoDeVenta = '1', // 0=Todo, 1=Contado, 2=Crédito
        formaDePago = '0', // 0=Todo, 1=Efectivo, 2=Tarjeta, 3=Transferencia
        idUserLogON,
        limiter = 10
        , start = 0
    } = req.body;

    try {
        const result = await dbConnection.query(`CALL repPagosPorVenta(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , '${ folioVenta == '' ? 0 : folioVenta }'
            , ${ tipoDeVenta }
            , ${ formaDePago }
            , ${ start }
            , ${ limiter }
            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        var oSum = await dbConnection.query(`CALL repPagosFormaDPagoSumarizado(
            
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , '${ folioVenta == '' ? 0 : folioVenta }'
            , ${ tipoDeVenta }
            , ${ formaDePago }

            )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                oSum: oSum[0] ?? {}
            }
        });
    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repPagosPorVentaHist = async (req, res) => {
    const {
        idVenta = 0,
        idUserLogON,
        limiter = 10
        , start = 0
    } = req.body;

    try {
        const result = await dbConnection.query(`CALL repPagosPorVentaHist(
            ${ idVenta }
            , ${ start }
            , ${ limiter }
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
            data: error.message
        });
    }
}

const cbxOrigenesRepInv = async(req, res = response) => {

    const { search = '', idUserLogON } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxOrigenesRepInv( '${ search }', ${ idUserLogON } )`)

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

const cbxOrigenesForES = async(req, res = response) => {

    const { search = '', idESType } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxOrigenesForES( '${ search }', ${ idESType } )`)

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

const repVentasPag = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        idTipoCliente = 0,
        idProducto = 0,
        idTipoPromocion = 0,
        idTipoVenta = 0,
        startDateCliente = null,
        endDateCliente = null,
        idFamilia = 0,
        
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;

    try {

        const result = await dbConnection.query(`CALL repVentasPag(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            , ${ start }
            , ${ limiter }
            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        const oSum = await dbConnection.query(`CALL repVentasSumarizado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                oSum: oSum[0] ?? {}
            }
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repVentasPorProducto = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        idTipoCliente = 0,
        idProducto = 0,
        idTipoPromocion = 0,
        idTipoVenta = 0,
        startDateCliente = null,
        endDateCliente = null,
        idFamilia = 0,
        
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;

    try {

        const result = await dbConnection.query(`CALL repVentasPorProducto(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            , ${ start }
            , ${ limiter }
            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        const oSum = await dbConnection.query(`CALL repVentasSumarizado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                oSum: oSum[0] ?? {}
            }
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repVentasPorFamilia = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        idTipoCliente = 0,
        idProducto = 0,
        idTipoPromocion = 0,
        idTipoVenta = 0,
        startDateCliente = null,
        endDateCliente = null,
        idFamilia = 0,
        
        idUserLogON
    } = req.body;

    try {

        const result = await dbConnection.query(`CALL repVentasPorFamilia(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        const oSum = await dbConnection.query(`CALL repVentasSumarizado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                oSum: oSum[0] ?? {}
            }
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repVentasPorVendedor = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        idTipoCliente = 0,
        idProducto = 0,
        idTipoPromocion = 0,
        idTipoVenta = 0,
        startDateCliente = null,
        endDateCliente = null,
        idFamilia = 0,
        
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;

    try {

        const result = await dbConnection.query(`CALL repVentasPorVendedor(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            , ${ start }
            , ${ limiter }
            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        const oSum = await dbConnection.query(`CALL repVentasSumarizado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                oSum: oSum[0] ?? {}
            }
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repVentasPorCliente = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        idTipoCliente = 0,
        idProducto = 0,
        idTipoPromocion = 0,
        idTipoVenta = 0,
        startDateCliente = null,
        endDateCliente = null,
        idFamilia = 0,
        
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;

    try {

        const result = await dbConnection.query(`CALL repVentasPorCliente(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            , ${ start }
            , ${ limiter }
            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        const oSum = await dbConnection.query(`CALL repVentasSumarizado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }
            )`);

        var oRepVentasEfectividadPorVendedor = [];
            
        oRepVentasEfectividadPorVendedor = await dbConnection.query(`CALL repVentasEfectividadPorVendedor(
                    '${ startDate ? startDate.substring(0, 10) : '' }'
                    , '${ endDate ? endDate.substring(0, 10) : '' }'
                    , ${ idVendedor }
                    , ${ idCliente }
                    , ${ idTipoCliente }
                    )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                oSum: oSum[0] ?? {},
                oRepVentasEfectividadPorVendedor: oRepVentasEfectividadPorVendedor[0] ?? {}
            }
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repVentasPorSucursal = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        idTipoCliente = 0,
        idProducto = 0,
        idTipoPromocion = 0,
        idTipoVenta = 0,
        startDateCliente = null,
        endDateCliente = null,
        idFamilia = 0,
        
        idUserLogON
    } = req.body;

    try {

        const result = await dbConnection.query(`CALL repVentasPorSucursal(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        const oSum = await dbConnection.query(`CALL repVentasSumarizado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                oSum: oSum[0] ?? {}
            }
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repVentasPorTipoClientes = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        idTipoCliente = 0,
        idProducto = 0,
        idTipoPromocion = 0,
        idTipoVenta = 0,
        startDateCliente = null,
        endDateCliente = null,
        idFamilia = 0,
        
        idUserLogON
    } = req.body;

    try {

        const result = await dbConnection.query(`CALL repVentasPorTipoClientes(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        const oSum = await dbConnection.query(`CALL repVentasSumarizado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                oSum: oSum[0] ?? {}
            }
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repStockBlockHistPag = async (req, res) => {
    const {
        idOrigen = 0
        , idProducto = 0
        , limiter = 10
        , start = 0
        , idUserLogON

    } = req.body;

    try {
        const result = await dbConnection.query(`CALL repStockBlockHistPag(
            ${ idOrigen }
            , ${ idProducto }
            , ${ start }
            , ${ limiter }
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
            data: error.message
        });
    }
}

const repMovimientosCaja = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idCaja = 0,
        idUser = 0,
        idCatMovimiento = 0,
        tipo = '',
        idFormaPago = 0,
        idTurnoCaja = 0,
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;

    try {
        let whereConditions = [];
        let queryParams = [];
        
        // Construir condiciones WHERE dinámicamente
        if (startDate) {
            whereConditions.push('DATE(mc.fecha) >= ?');
            queryParams.push(startDate.substring(0, 10));
        }
        
        if (endDate) {
            whereConditions.push('DATE(mc.fecha) <= ?');
            queryParams.push(endDate.substring(0, 10));
        }
        
        if (idCaja > 0) {
            whereConditions.push('mc.idcajas = ?');
            queryParams.push(idCaja);
        }
        
        if (idUser > 0) {
            whereConditions.push('mc.idUser = ?');
            queryParams.push(idUser);
        }
        
        if (idCatMovimiento > 0) {
            whereConditions.push('mc.idcatmovimientos = ?');
            queryParams.push(idCatMovimiento);
        }
        
        if (tipo && tipo !== '') {
            whereConditions.push('mc.tipo = ?');
            queryParams.push(tipo);
        }
        
        if (idFormaPago > 0) {
            whereConditions.push('mc.idformaspago = ?');
            queryParams.push(idFormaPago);
        }
        
        if (idTurnoCaja > 0) {
            whereConditions.push('mc.idturnoscaja = ?');
            queryParams.push(idTurnoCaja);
        }
        
        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
        
        // Query principal para obtener los datos
        const mainQuery = `
            SELECT 
                mc.idmovimientoscaja,
                mc.fecha,
                mc.tipo,
                mc.monto,
                mc.observaciones,
                mc.idcajas,
                mc.idUser,
                mc.idturnoscaja,
                mc.idformaspago,
                mc.idcatmovimientos,
                cmc.descripcion as categoria_descripcion,
                cmc.tipo_movimiento as categoria_tipo,
                u.name as usuario_nombre,
                c.nombre as caja_nombre,
                fp.descripcion as forma_pago_descripcion
            FROM movimientos_caja mc
            LEFT JOIN cat_movimientos_caja cmc ON mc.idcatmovimientos = cmc.idcatmovimientoscaja
            LEFT JOIN users u ON mc.idUser = u.idUser
            LEFT JOIN cajas c ON mc.idcajas = c.idcajas
            LEFT JOIN formas_pago fp ON mc.idformaspago = fp.idformaspago
            ${whereClause}
            ORDER BY mc.fecha DESC, mc.idmovimientoscaja DESC
            LIMIT ${limiter} OFFSET ${start}
        `;
        
        // Query para contar total de registros
        const countQuery = `
            SELECT COUNT(*) as total
            FROM movimientos_caja mc
            LEFT JOIN cat_movimientos_caja cmc ON mc.idcatmovimientos = cmc.idcatmovimientoscaja
            LEFT JOIN users u ON mc.idUser = u.idUser
            LEFT JOIN cajas c ON mc.idcajas = c.idcajas
            LEFT JOIN formas_pago fp ON mc.idformaspago = fp.idformaspago
            ${whereClause}
        `;
        
        // Query para obtener totales por tipo
        const totalsQuery = `
            SELECT 
                mc.tipo,
                SUM(mc.monto) as total_monto,
                COUNT(*) as cantidad_movimientos
            FROM movimientos_caja mc
            LEFT JOIN cat_movimientos_caja cmc ON mc.idcatmovimientos = cmc.idcatmovimientoscaja
            LEFT JOIN users u ON mc.idUser = u.idUser
            LEFT JOIN cajas c ON mc.idcajas = c.idcajas
            LEFT JOIN formas_pago fp ON mc.idformaspago = fp.idformaspago
            ${whereClause}
            GROUP BY mc.tipo
        `;
        
        // Ejecutar queries
        const [result, countResult, totalsResult] = await Promise.all([
            dbConnection.query(mainQuery, { replacements: queryParams, type: dbConnection.QueryTypes.SELECT }),
            dbConnection.query(countQuery, { replacements: queryParams, type: dbConnection.QueryTypes.SELECT }),
            dbConnection.query(totalsQuery, { replacements: queryParams, type: dbConnection.QueryTypes.SELECT })
        ]);
        
        const totalCount = countResult[0]?.total || 0;
        
        // Procesar totales
        let totalIngresos = 0;
        let totalEgresos = 0;
        let cantidadIngresos = 0;
        let cantidadEgresos = 0;
        
        totalsResult.forEach(item => {
            if (item.tipo === 'INGRESO') {
                totalIngresos = parseFloat(item.total_monto) || 0;
                cantidadIngresos = parseInt(item.cantidad_movimientos) || 0;
            } else if (item.tipo === 'EGRESO') {
                totalEgresos = parseFloat(item.total_monto) || 0;
                cantidadEgresos = parseInt(item.cantidad_movimientos) || 0;
            }
        });
        
        const saldoNeto = totalIngresos - totalEgresos;
        
        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: totalCount,
                rows: result,
                totales: {
                    total_ingresos: totalIngresos,
                    total_egresos: totalEgresos,
                    saldo_neto: saldoNeto,
                    cantidad_ingresos: cantidadIngresos,
                    cantidad_egresos: cantidadEgresos,
                    total_movimientos: cantidadIngresos + cantidadEgresos
                }
            }
        });
        
    } catch (error) {
        console.error('Error en repMovimientosCaja:', error);
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repEmprendedoresPremium = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idTipoCliente = 0,
        idVendedor = 0,

        limiter = 10,
        start = 0,

        idUserLogON
    } = req.body;

    try {

        const result = await dbConnection.query(`CALL repEmprendedoresPremium(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idTipoCliente }
            , ${ idVendedor }

            , ${ start }
            , ${ limiter }
            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
            }
        });
    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repVentasDeClienteFrecuentePag = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        idTipoCliente = 0,
        idProducto = 0,
        idTipoPromocion = 0,
        idTipoVenta = 0,
        startDateCliente = null,
        endDateCliente = null,
        idFamilia = 0,
        
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;

    try {

        const result = await dbConnection.query(`CALL repVentasDeClienteFrecuentePag(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            , ${ start }
            , ${ limiter }
            )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        const oSum = await dbConnection.query(`CALL repVentasDeClienteFrecuenteSumarizado(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result,
                oSum: oSum[0] ?? {}
            }
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
}

const repDineroElectronicoHist = async (req, res) => {
    const { idCliente = 0, limiter = 10, start = 0 } = req.body;

    try {
        const result = await dbConnection.query(`CALL repDineroElectronicoHist(
            ${ idCliente }
            , ${ start }
            , ${ limiter }
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
            data: error.message
        });
    }
};

const repClientesInactivos = async (req, res) => {
    const {
        startDate = null,
        endDate = null,
        idSucursal = 0,
        idVendedor = 0,
        idCliente = 0,
        idTipoCliente = 0,
        idProducto = 0,
        idTipoPromocion = 0,
        idTipoVenta = 0,
        startDateCliente = null,
        endDateCliente = null,
        idFamilia = 0,
        
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;

    try {

        const result = await dbConnection.query(`CALL repClientesInactivos(
            '${ startDate ? startDate.substring(0, 10) : '' }'
            , '${ endDate ? endDate.substring(0, 10) : '' }'
            , ${ idSucursal }
            , ${ idVendedor }
            , ${ idCliente }
            , ${ idTipoCliente }
            , ${ idProducto }
            , ${ idTipoPromocion }
            , ${ idTipoVenta }
            , '${ startDateCliente ? startDateCliente.substring(0, 10) : '' }'
            , '${ endDateCliente ? endDateCliente.substring(0, 10) : '' }'
            , ${ idFamilia }

            , ${ start }
            , ${ limiter }
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
            data: error.message
        });
    }
}

module.exports = {
    rep_InventarioPaginado
    , cbxOrigenes
    , cbxAllProductos
    , rep_InventarioHistPaginado
    , getEmployeesRespForOrigen
    , repCreditosPag
    , repPagos
    , repPagosPorVentaHist
    , cbxOrigenesRepInv
    , cbxOrigenesForES
    , repVentasPag
    , repVentasPorProducto
    , repVentasPorFamilia
    , repVentasPorVendedor
    , repVentasPorCliente
    , repVentasPorSucursal
    , repVentasPorTipoClientes
    , repStockBlockHistPag
    , repMovimientosCaja
    , repEmprendedoresPremium
    , repVentasDeClienteFrecuentePag
    , repDineroElectronicoHist
    , repClientesInactivos
};
