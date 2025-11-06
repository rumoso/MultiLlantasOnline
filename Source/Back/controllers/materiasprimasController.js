const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection } = require('../database/config');

const cbxGetMateriasPrimas = async(req, res = response) => {

    const { search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxGetMateriasPrimas( '${ search }' )`)

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

const cbxGetMateriasPrimasByOrdenCompra = async(req, res = response) => {

    const { idOrdenDeCompra, search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxGetMateriasPrimasByOrdenCompra( ${ idOrdenDeCompra }, '${ search }' )`)

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

const cbxGetMateriasPrimasByFormulaProdBase = async(req, res = response) => {

    const { idProductoBase, search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxGetMateriasPrimasByFormulaProdBase( ${ idProductoBase }, '${ search }' )`)

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
    cbxGetMateriasPrimas
    , cbxGetMateriasPrimasByOrdenCompra
    , cbxGetMateriasPrimasByFormulaProdBase
};
