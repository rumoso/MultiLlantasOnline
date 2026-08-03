const { response } = require('express');
const { dbConnection } = require('../database/config');
const { encrypt, decrypt } = require('../utils/crypto');

const getCart = async (req, res = response) => {
    const { idUser } = req.body;
    let guest_id = req.guestId;

    let finalIdUser = (idUser && idUser > 0) ? idUser : null;

    if (idUser && isNaN(idUser)) {
        try {
            finalIdUser = decrypt(idUser);
        } catch (e) {
            console.error('Error decrypting getCart idUser', e);
            finalIdUser = 0;
        }
    }

    if (finalIdUser) {
        guest_id = '';
    }

    try {
        const results = await dbConnection.query('CALL getCart(?, ?)', {
            replacements: [finalIdUser || 0, guest_id || '']
        });


        let resultData = [];

        if (Array.isArray(results)) {
            resultData = results;
        } else if (results && results[0] && Array.isArray(results[0])) {
            // Handle case where it might be [ [items], metadata ]
            resultData = results[0];
        }

        res.json({
            status: 0,
            message: 'Carrito obtenido con éxito',
            data: resultData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener el carrito',
            data: error.message
        });
    }
};

const addToCart = async (req, res = response) => {
    const { sIdP, cantidad, idUser } = req.body;

    // Support either sIdP or idProducto for backward compatibility (during transition)
    let idProducto = req.body.idProducto;
    if (sIdP) {
        try {
            idProducto = decrypt(sIdP);
        } catch (e) { console.error('Error decrypting addToCart sIdP', e); }
    } else if (idProducto && isNaN(idProducto)) { // Assuming sIdP passed as idProducto
        try {
            idProducto = decrypt(idProducto);
        } catch (e) { console.error('Error decrypting addToCart idProducto', e); }
    }
    const guest_id = req.guestId;
    const dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!idProducto) {
        return res.status(400).json({
            status: 2,
            message: 'El ID del producto es obligatorio y no fue recibido'
        });
    }

    let finalIdUser = (idUser && idUser !== 0) ? idUser : null;
    if (idUser && isNaN(idUser)) {
        try {
            finalIdUser = decrypt(idUser);
        } catch (e) { console.error('Error decrypting addToCart idUser', e); }
    }

    let finalGuestId = guest_id;

    if (finalIdUser) {
        finalGuestId = '';
    }

    try {
        const results = await dbConnection.query('CALL agregarAlCarrito(?, ?, ?, ?, ?)', {
            replacements: [dateNow, idProducto, cantidad, finalIdUser, finalGuestId || '']
        });



        let resultData = {};

        if (Array.isArray(results) && results.length > 0) {
            resultData = results[0];
        } else if (results && results[0] && Array.isArray(results[0])) {
            resultData = results[0][0];
        }

        res.json({
            status: 0,
            message: resultData.message || 'Producto agregado al carrito',
            data: resultData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al agregar al carrito',
            data: error.message
        });
    }
};

const updateQuantity = async (req, res = response) => {
    const { idItem, cantidad } = req.body;

    console.log('DEBUG: updateQuantity body:', req.body);

    if (!idItem) {
        return res.status(400).json({
            status: 2,
            message: 'El ID del item es obligatorio (idItem)'
        });
    }

    try {
        await dbConnection.query('UPDATE cart_items SET cantidad = ?, updateDate = NOW() WHERE keyx = ?', {
            replacements: [cantidad, idItem]
        });

        res.json({
            status: 0,
            message: 'Cantidad actualizada con éxito'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al actualizar cantidad',
            data: error.message
        });
    }
};

const removeFromCart = async (req, res = response) => {
    const { idItem } = req.body;

    console.log('DEBUG: removeFromCart body:', req.body);

    if (!idItem) {
        return res.status(400).json({
            status: 2,
            message: 'El ID del item es obligatorio (idItem)'
        });
    }

    try {
        await dbConnection.query('DELETE FROM cart_items WHERE keyx = ?', {
            replacements: [idItem]
        });

        res.json({
            status: 0,
            message: 'Producto eliminado del carrito'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al eliminar del carrito',
            data: error.message
        });
    }
};

// processPurchase se retiro: marcaba la orden como PAGADA sin cobrar nada y
// confiaba en el idUser del body. El cobro real vive ahora en
// checkoutController.js (crearOrden + webhook de Mercado Pago).

module.exports = {
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart
};
