const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection, dbSPConnection } = require('../database/config');

const getCreditosPendientesPorCliente = async (req, res) => {
    const { idCliente = 0, idUserLogON } = req.body;

    try {
        const result = await dbConnection.query(`CALL getCreditosPendientesPorCliente( ${ idCliente }, ${ idUserLogON } )`);

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

const savePagos = async (req, res) => {
    var { idCliente, abonos, metodosPago, idUserLogON } = req.body;

    // Validaciones previas
    if (!abonos || !Array.isArray(abonos) || abonos.length === 0) {
        return res.status(400).json({
            status: 1,
            message: 'Debe enviar al menos un abono.',
            data: null
        });
    }
    if (!metodosPago || typeof metodosPago !== 'object' || Object.keys(metodosPago).length === 0) {
        return res.status(400).json({
            status: 1,
            message: 'Debe enviar los métodos de pago.',
            data: null
        });
    }

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        metodosPago.fechaTransferencia = metodosPago.fechaTransferencia ? metodosPago.fechaTransferencia.substring(0, 10) : null;
        metodosPago.fechaDeposito = metodosPago.fechaDeposito ? metodosPago.fechaDeposito.substring(0, 10) : null;

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        const [result] = await connection.query(
            `CALL savePagosCredito(?, ?, ?, ?, ?)`,
            [
                oGetDateNow,
                idCliente,
                JSON.stringify(abonos),
                JSON.stringify(metodosPago),
                idUserLogON
            ]
        );

        // El resultado es un array de arrays, toma el primer registro
        const spResult = result[0][0];
        console.log('Resultado del SP:', spResult);

        if (spResult.out_id === 1) {
            await connection.commit();
            connection.release();
            res.json({
                status: 0,
                message: spResult.message,
                data: spResult
            });
        } else {
            await connection.rollback();
            connection.release();
            res.json({
                status: 1,
                message: spResult.message,
                data: spResult
            });
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
    getCreditosPendientesPorCliente,
    savePagos
};


