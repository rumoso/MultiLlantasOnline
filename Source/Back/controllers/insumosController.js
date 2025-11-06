const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection } = require('../database/config');

const cbxGetInsumosByProducto = async(req, res = response) => {

    const { idProducto, search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxGetInsumosByProducto( ${ idProducto }, '${ search }' )`)

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

module.exports = {
    cbxGetInsumosByProducto
};
