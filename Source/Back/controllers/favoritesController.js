const { response } = require('express');
const { dbConnection } = require('../database/config');

const getMyFavorites = async (req, res = response) => {
    let { idUser } = req.body;
    const guestIdHeader = req.headers['x-guest-id'];
    const guestIdMiddleware = req.guestId;

    const finalGuestId = guestIdMiddleware || guestIdHeader || req.body.guest_id;
    const finalIdUser = (idUser && idUser > 0) ? idUser : null;

    if (!finalIdUser && !finalGuestId) {
        return res.status(400).json({
            status: 2,
            message: 'El ID de usuario o Guest ID es obligatorio'
        });
    }

    try {
        const results = await dbConnection.query('CALL getMyFavorites(?, ?)', {
            replacements: [finalIdUser, finalGuestId || null]
        });

        let resultData = [];
        // Handle varied response structures from driver
        if (Array.isArray(results)) {
            // Often results[0] is the rows, results[1] is metadata? Or results isn't nested?
            // Usually for CALL it returns [ [Rows], {Metadata} ]
            if (Array.isArray(results[0])) {
                resultData = results[0];
            } else {
                resultData = results;
            }
        }

        // Filter out metadata if it leaked in
        resultData = resultData.filter(item => item.idFavorite);

        res.json({
            status: 0,
            message: 'Favoritos obtenidos exitosamente',
            data: resultData
        });
    } catch (error) {
        console.error('Error getMyFavorites:', error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener favoritos',
            data: error.message
        });
    }
};

const toggleFavorite = async (req, res = response) => {
    let { idUser, idProducto } = req.body;
    const guestIdHeader = req.headers['x-guest-id'];
    const guestIdMiddleware = req.guestId;

    // Logic similar to cartController: User ID takes precedence but we need guestID if no User
    // Use the middleware guestId which respects header priority
    const finalGuestId = guestIdMiddleware || guestIdHeader || req.body.guest_id;
    const finalIdUser = (idUser && idUser > 0) ? idUser : null;

    console.log('DEBUG: toggleFavorite | User:', finalIdUser, 'Guest:', finalGuestId, 'Prod:', idProducto);

    if ((!finalIdUser && !finalGuestId) || !idProducto) {
        return res.status(400).json({
            status: 2,
            message: 'Usuario/Guest y Producto son obligatorios'
        });
    }

    try {
        const results = await dbConnection.query('CALL toggleFavorite(?, ?, ?)', {
            replacements: [finalIdUser, finalGuestId || null, idProducto]
        });

        console.log('DEBUG: toggleFavorite SQL Result:', JSON.stringify(results));

        let data = { message: 'Operación realizada', isFavorite: false };
        let spResult = null;

        if (Array.isArray(results)) {
            // Find the result set that has the message
            spResult = results.find(r => Array.isArray(r) && r.length > 0 && r[0].message);
            // Fallback if structure is different (e.g. direct array)
            if (!spResult && results[0] && results[0].message) spResult = [results[0]];
            // Fallback for some drivers: results[0] IS the row list
            if (!spResult && Array.isArray(results[0])) spResult = results[0];
        }

        if (spResult && spResult[0]) {
            data = spResult[0];
        }

        res.json({
            status: 0,
            message: data.message || 'Operación exitosa',
            data: data
        });

    } catch (error) {
        console.error('Error toggleFavorite:', error);
        res.status(500).json({
            status: 2,
            message: 'Error al actualizar favoritos',
            data: error.message
        });
    }
};

module.exports = {
    getMyFavorites,
    toggleFavorite
};
