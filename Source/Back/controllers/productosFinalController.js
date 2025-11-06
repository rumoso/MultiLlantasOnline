const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection, dbSPConnection } = require('../database/config');

const getProdProdFinalPaginado = async (req, res) => {
    const { startDate = '', endDate = '', search = '', limiter = 10, start = 0 } = req.body;

    try {
        
        const result = await dbConnection.query(`CALL getProdProdFinalPaginado(
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

const cbxProductosFinalForPF = async(req, res = response) => {

    const { search = '', idProdProdFinalH } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxProductosFinalForPF( '${ search }', ${ idProdProdFinalH } )`)

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

// NUEVA FUNCIÓN PARA AGREGAR DETALLE EN LOTE, transacción por línea
const agregarProdFinalDetalle = async (req, res) => {
    var { detalles = [], idUserLogON } = req.body;

    let resultados = [];

    var idProdProdFinalHGlobal = 0;

    try {
        for (var detalle of detalles) {
            var { idProdProdFinalH = 0, idProductoFinal, cantAProducir } = detalle;
            
            idProdProdFinalH = idProdProdFinalH > 0 ? idProdProdFinalH : idProdProdFinalHGlobal;

            // Para cada línea, abre y cierra su propia transacción
            const connection = await dbSPConnection.getConnection();
            await connection.beginTransaction();

            try {
                var resultado = await agregarProdFinalDetalleInterno(connection, {
                    idProdProdFinalH,
                    idProductoFinal,
                    cantAProducir,
                    idUserLogON
                });

                console.log('Resultado interno:', resultado);

                idProdProdFinalHGlobal = resultado.insertID > 0 ? resultado.insertID : idProdProdFinalHGlobal;

                if (resultado.status === 0) {
                    await connection.commit();
                } else {
                    await connection.rollback();
                }
                connection.release();

                resultados.push({
                    idProductoFinal,
                    cantAProducir,
                    status: resultado.status,
                    message: resultado.message,
                    insertID: resultado.insertID,
                    productoName: resultado.productoName,
                    data: resultado.data
                });
            } catch (error) {
                await connection.rollback();
                connection.release();
                resultados.push({
                    idProductoFinal,
                    cantAProducir,
                    status: 2,
                    message: 'Error inesperado',
                    data: error.message
                });
            }
        }

        return res.json({
            status: 0,
            message: 'Procesamiento terminado',
            resultados,
            insertID: idProdProdFinalHGlobal
        });

    } catch (error) {
        return res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message,
            resultados
        });
    }
};

// Lógica interna para agregar detalle (extraída de agregarProdFinalDetalle)
async function agregarProdFinalDetalleInterno(connection, { idProdProdFinalH = 0, idProductoFinal, cantAProducir, idUserLogON }) {
    try {
        var oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var oProducto = await dbConnection.query(`CALL getProductoByID( ${ idProductoFinal } )`);

        var inventario = await dbConnection.query(`CALL consInvDeProdAgrProdFinal( ${ idProductoFinal } )`);

        console.log('Inventario:', inventario);

        if(inventario.length == 0){
            return {
                status: 2,
                message: 'No hay inventario para generar',
                productoName: oProducto[0].articuloName
            };
        }

        let resultadoProdAgranel = [];
        let resultadoInsumos = [];

        var valorMedida = oProducto[0].valorMedida;

        let cantidadRestante = cantAProducir * valorMedida;

        let index = 0;
        for (let stock of inventario) {
            console.log('Iteración:', index, 'Stock:', stock, 'Cantidad restante:', cantidadRestante);
            if (index === 0) {
                cantidadRestante = cantidadRestante * stock.porcentajeRelation;
            }
            
            if (cantidadRestante <= 0) break;

            let cantidadATomar = Math.min(stock.cantidadDisp, cantidadRestante);

            cantidadATomar = Math.round(cantidadATomar * 100) / 100;
            cantidadRestante = Math.round(cantidadRestante * 100) / 100;

            resultadoProdAgranel.push({
                bOK: parseFloat( cantidadATomar ) > 0,
                idProductoRelacion: stock.idProductoRelacion,
                productoNameRelation: stock.productoNameRelation,
                cantidadDisp: parseFloat( stock.cantidadDisp ),
                cantidadConsumida: Number((cantidadATomar).toFixed(2)),
                idOrigen: 3 // 1: AMP, 2: APB, 3: APA, 4: APT
            });

            cantidadRestante -= cantidadATomar;

            index++;
        }

        if (cantidadRestante > 0) {
            resultadoProdAgranel.push({
                bOK: false,
                idProductoRelacion: 0,
                productoNameRelation: '',
                cantidadDisp: 0,
                cantidadConsumida: Number(cantidadRestante.toFixed(2))
            });
        }

        let bOKProdAgranel = resultadoProdAgranel.length > 0 && resultadoProdAgranel.every(item => item.bOK);
        let bOKInsumos = false;
        let bOKGeneral = true;

        if(bOKProdAgranel){
            var inventarioInsumos = await dbConnection.query(`CALL consInvDeInsPProdFinal( ${ idProductoFinal } )`);
            console.log('Inventario insumos:', inventarioInsumos);

            if(inventarioInsumos.length == 0){
                return {
                    status: 2,
                    message: 'No tiene configurado los insumos en el producto',
                    productoName: oProducto[0].articuloName
                };
            }


            for (let stock of inventarioInsumos) {

                if (!resultadoInsumos.some(item => item.idInsumo === stock.idInsumo)) {
                    resultadoInsumos.push({
                        bOK: parseFloat( stock.cantidadDisp ) >= parseFloat( cantAProducir ),
                        idInsumo: stock.idInsumo,
                        insumoName: stock.insumoName,
                        cantidadDisp: parseFloat( stock.cantidadDisp ),
                        cantidadConsumida: parseFloat( cantAProducir ),
                        idOrigen: 5 // 1: AMP, 2: APB, 3: APA, 4: APT, 5: AIN
                    });
                }
            }

            console.log('Resultado insumos:', resultadoInsumos);

            bOKInsumos = resultadoInsumos.length > 0 && resultadoInsumos.every(item => item.bOK);

            if(bOKInsumos){
                if(idProdProdFinalH == 0)
                {
                    var oInsertUpdate = await connection.query(`CALL insertUpdateProdProdFinal(
                        '${ oGetDateNow }'
                        , ${ idProdProdFinalH }
                        , 1
                        , ${ idUserLogON })`);

                    oInsertUpdate = oInsertUpdate[0][0];

                    if(oInsertUpdate[0].out_id > 0){
                        idProdProdFinalH = oInsertUpdate[0].out_id;
                    }
                    else{
                        return {
                            status: 2,
                            message: 'No se pudo generar ID para la producción',
                            productoName: oProducto[0].articuloName
                        };
                    }
                }

                var oAgregarPPFDetalle = await connection.query(`CALL agregarProdProdFinalDetalle(
                '${ oGetDateNow }'
                , ${ idProdProdFinalH }
                , ${ idProductoFinal }
                , ${ cantAProducir }
                )`);

                oAgregarPPFDetalle = oAgregarPPFDetalle[0][0];

                if(oAgregarPPFDetalle[0].out_id == 0){
                    return {
                        status: 2,
                        message: 'No se pudo agregar el producto a la lista',
                        productoName: oProducto[0].articuloName
                    };
                }
                else{
                    var idProdProdFinalDetalle = oAgregarPPFDetalle[0].out_id;

                    var jsonDataAgranel = JSON.stringify(resultadoProdAgranel, null, 2);
                    var jsonDataInsumos = JSON.stringify(resultadoInsumos, null, 2);
                    
                    var oSQL = await connection.query(`CALL insertProdProdFinalStock(
                        '${ oGetDateNow }'
                        , ${ idProdProdFinalH }
                        , ${ idProdProdFinalDetalle }
                        , '${ oProducto[0].articuloName }'
                        , '${ jsonDataAgranel }'
                        , '${ jsonDataInsumos }'
                        )`);

                    oSQL = oSQL[0][0];

                    if(oSQL[0].out_id == 0){
                        return {
                            status: 2,
                            message: 'No se pudo agregar el control de stock del producto a granel para la producción',
                            productoName: oProducto[0].articuloName
                        };
                    }
                }
            }
        }

        bOKGeneral = bOKProdAgranel && bOKInsumos;

        return {
            status: bOKGeneral ? 0 : 1,
            message: bOKGeneral ? 'Ejecutado correctamente.'
            : !bOKProdAgranel && bOKInsumos ? 'Hay problemas con el producto agranel'
            : bOKProdAgranel && !bOKInsumos ? 'Hay problemas con los insumos'
            : !bOKProdAgranel && !bOKInsumos ? 'Hay problemas con el producto agranel y con los insumos'
            : '',
            insertID: idProdProdFinalH,
            productoName: oProducto[0].articuloName,
            data: {
                bOKGeneral: bOKGeneral,
                bOKProdAgranel: bOKProdAgranel,
                bOKInsumos: bOKInsumos,
                cantProducida: cantAProducir,
                resultadoProdAgranel: resultadoProdAgranel,
                resultadoInsumos: resultadoInsumos
            }
        };

    } catch (error) {
        return {
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        };
    }
}

const getProdProdFinalByID = async (req, res) => {
    const { idProdProdFinalH } = req.body;

    try {
        const result = await dbConnection.query(`CALL getProdProdFinalByID( ${ idProdProdFinalH } )`);

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

const getProdProdFinalDetalle = async (req, res) => {
    const { idProdProdFinalH } = req.body;

    try {
        const result = await dbConnection.query(`CALL getProdProdFinalDetalle( ${ idProdProdFinalH } )`);

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

const completarYProducirPF = async (req, res) => {
    const { idProdProdFinalH, idUserLogON } = req.body;

    if(!(idProdProdFinalH > 0)){
        return res.json({
            status: 1,
            message: 'Parametros incorrectos'
        });
    }

    var connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        
        console.log(`CALL producirProdFinal( '${ oGetDateNow }', ${ idProdProdFinalH }, ${ idUserLogON } )`);
        var oSQL = await connection.query(`CALL producirProdFinal( '${ oGetDateNow }', ${ idProdProdFinalH }, ${ idUserLogON } )`);
        oSQL = oSQL[0][0];
        console.log('oSQL:', oSQL);

        if (oSQL.out_id > 0) {
            await connection.commit();
            connection.release();
        } else {
            await connection.rollback();
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

const deletePPFDetail = async (req, res) => {
    const { idProdProdFinalH, idProdProdFinalDetalle, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        if(!(idProdProdFinalH > 0 && idProdProdFinalDetalle > 0)){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        var oSQL = await connection.query(`CALL deletePPFDetail( ${ idProdProdFinalH }, ${ idProdProdFinalDetalle }, ${ idUserLogON } )`);

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

    getProdProdFinalPaginado
    , cbxProductosFinalForPF
    , agregarProdFinalDetalle
    , getProdProdFinalByID
    , getProdProdFinalDetalle
    , completarYProducirPF
    , deletePPFDetail
};
