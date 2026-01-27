const { response } = require('express');
const { dbConnection } = require('../database/config');

const getMyPurchases = async (req, res = response) => {
    const { idUser } = req.body;

    if (!idUser) {
        return res.status(400).json({
            status: 2,
            message: 'El ID de usuario es obligatorio'
        });
    }

    try {
        const results = await dbConnection.query('CALL getMyPurchases(?)', {
            replacements: [idUser]
        });

        // Handle SP return
        let resultData = [];
        if (Array.isArray(results)) {
            resultData = results;
        } else if (results && results[0] && Array.isArray(results[0])) {
            resultData = results[0];
        }

        res.json({
            status: 0,
            message: 'Compras obtenidas exitosamente',
            data: resultData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener las compras',
            data: error.message
        });
    }
};

const getOrderDetails = async (req, res = response) => {
    const { idOrder } = req.body;

    if (!idOrder) {
        return res.status(400).json({
            status: 2,
            message: 'El ID de la orden es obligatorio'
        });
    }

    try {
        const results = await dbConnection.query('CALL getOrderDetails(?)', {
            replacements: [idOrder]
        });

        let resultData = [];
        if (Array.isArray(results)) {
            resultData = results;
        } else if (results && results[0] && Array.isArray(results[0])) {
            resultData = results[0];
        }

        res.json({
            status: 0,
            message: 'Detalle de orden obtenido exitosamente',
            data: resultData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener el detalle de la orden',
            data: error.message
        });
    }
};

module.exports = {
    getMyPurchases,
    getOrderDetails
};
