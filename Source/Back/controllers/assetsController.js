const { response } = require('express');
const { Op } = require('sequelize');
const { dbConnection } = require('../database/config');
const moment = require('moment');
const path = require('path');
const fs = require('fs');


const getImageProduct = async(req, res = response) => {
    const nombreImagen = req.params.nombreImagen;
    const rutaImagen = path.join(__dirname, '../assets/productos', nombreImagen);
    
    // Verificar si la imagen existe
    if (fs.existsSync(rutaImagen)) {
        return res.sendFile(rutaImagen);
    } else {
        // Enviar una imagen por defecto o un error
        return res.status(404).json({
        status: 1,
        message: 'Imagen no encontrada',
        data: null
        });
    }
}


module.exports = {
    getImageProduct
};


