const { response } = require('express');
const { dbConnection } = require('../database/config');

const getCart = async (req, res = response) => {
    const { idUser } = req.body;
    let guest_id = req.guestId;

    if (idUser) {
        guest_id = '';
    }

    try {
        const results = await dbConnection.query('CALL getCart(?, ?)', {
            replacements: [idUser || 0, guest_id || '']
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
    const { idProducto, cantidad, idUser } = req.body;
    const guest_id = req.guestId;
    const dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!idProducto) {
        return res.status(400).json({
            status: 2,
            message: 'El ID del producto es obligatorio y no fue recibido'
        });
    }

    const finalIdUser = (idUser && idUser !== 0) ? idUser : null;
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

const processPurchase = async (req, res = response) => {
    const { idUser } = req.body;

    if (!idUser) {
        return res.status(400).json({
            status: 2,
            message: 'El usuario es requerido para procesar la compra'
        });
    }

    try {
        const results = await dbConnection.query('CALL processPurchase(?)', {
            replacements: [idUser]
        });

        let resultData = {};

        if (Array.isArray(results) && results.length > 0) {
            resultData = results[0];
        } else if (results && results[0] && Array.isArray(results[0])) {
            resultData = results[0][0]; // For stored procedure returning select
        }

        res.json({
            status: 0,
            message: 'Compra procesada exitosamente',
            data: resultData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al procesar la compra',
            data: error.message
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    processPurchase
};
