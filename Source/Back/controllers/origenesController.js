const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection } = require('../database/config');


const getOrigenesResponsables = async(req, res = response) => {

    const {
        idOrigen
    } = req.body;

    console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call getOrigenesResponsables( ${ idOrigen } )`)

        if(OSQL.length == 0){

            res.json({
                status:0,
                message:"Ejecutado correctamente.",
                data:{
                count: 0,
                rows: null
                }
            });

        }
        else{

            res.json({
                status: 0,
                message: "Ejecutado correctamente.",
                data:{
                    rows: OSQL
                }
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

const insertOrinResponsable = async (req, res) => {
    const {

        idOrigen = 0
        , idEmployee = 0

        , idUserLogON
        
    } = req.body;

    try {

        if(!(idOrigen > 0 && idEmployee > 0)){
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var oInsertUpdate = await dbConnection.query(`CALL insertOrinResponsable( 
            '${ oGetDateNow }'
            , ${ idEmployee }
            , ${ idOrigen }
            , ${ idUserLogON }
            )`);

        return res.json({
            status: oInsertUpdate[0].out_id > 0 ? 0 : 1,
            message: oInsertUpdate[0].message,
            insertID: oInsertUpdate[0].out_id
        });

    } catch (error) {
        return res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const deleteOrinResponsable = async (req, res) => {
    const {

        idOrigenesResponsables
        , idUserLogON
        
    } = req.body;

    try {

        var oInsertUpdate = await dbConnection.query(`CALL deleteOrinResponsable( 
            ${ idOrigenesResponsables }
            )`);

        return res.json({
            status: oInsertUpdate[0].out_id > 0 ? 0 : 1,
            message: oInsertUpdate[0].message,
            insertID: oInsertUpdate[0].out_id
        });

    } catch (error) {
        return res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getIdOrigenByRelation = async(req, res = response) => {

    const {
        idRelation, idCatRelacionOrigen
    } = req.body;

    console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call getIdOrigenByRelation( ${ idRelation }, ${ idCatRelacionOrigen } )`)
        console.log(OSQL)

        if(OSQL.length > 0){

            res.json({
                status:0,
                message:"Ejecutado correctamente.",
                data: OSQL[0].idOrigen
            });

        }
        else{

            res.json({
                status: 1,
                message: "Ejecutado correctamente.",
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


const getOrigenesForAddUser = async(req, res = response) => {

    const { search = '', idUser } = req.body;

    try {
        var OSQL = await dbConnection.query(`call getOrigenesForAddUser( '${ search }' , ${ idUser })`)

        if (!OSQL || OSQL.length === 0) {
            return res.json({
                status: 0,
                message: "No se encontró información.",
                data: null,
            });
        }

        return res.json({
            status: 0,
            message: "Ejecutado correctamente.",
            data: OSQL,
        });

    } catch (error) {
        
        console.error("Error en getOrigenesForAddUser:", error);
        return res.status(500).json({
            status: 2,
            message: "Sucedió un error inesperado.",
            data: error.message,
        });
        
    }

};

const getOrigenesByIdUser = async(req, res = response) => {

    const {
        idUser
    } = req.body;

    //console.log(req.body)
    var OSQL = await dbConnection.query(`call getOrigenesByIdUser( ${ idUser } )`)

    if(OSQL.length == 0){

            res.json({
                status:0,
                message:"No se encontró información.",
                data: null
            });

    }
    else{

        res.json({
            status:0,
            message:"Ejecutado correctamente.",
            data: OSQL
        });

    }
  
};

const insertOrigenByIdUser = async(req, res = response) => {

    const {
        idUser
        , idOrigen
    } = req.body;

    try{

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var OSQL = await dbConnection.query(`call insertOrigenByIdUser( ${ idUser }, ${ idOrigen }, '${ oGetDateNow }' )`)
        
        if(OSQL.length == 0){
        
                res.json({
                    status:0,
                    message:"No se encontró información.",
                    data: null
                });
        
            }
            else{
        
                res.json({
                    status:0,
                    message: OSQL[0].message,
                    data: OSQL
                });
        
            }

    }catch(error){
            
        res.status(500).json({
            status:2,
            message:"Sucedió un error inesperado",
            data: error.message
        });

    }

};

const deleteOrigenByIdUser = async(req, res = response) => {

    const {
        idUser
        , idOrigen
    } = req.body;

    //console.log(req.body)
    var OSQL = await dbConnection.query(`call deleteOrigenByIdUser( ${ idUser }, ${ idOrigen } )`)

    if(OSQL.length == 0){

        res.json({
            status:0,
            message:"No se encontró información.",
            data: null
        });

    }
    else{

        res.json({
            status:0,
            message:"Eliminado correctamente.",
            data: OSQL
        });

    }

};

const cambioDeOrigenPrincipalByIdUser = async(req, res = response) => {

    const {
        idUser
        , idOrigen
    } = req.body;


    try{
        var OSQL = await dbConnection.query(`call cambioDeOrigenPrincipalByIdUser( ${ idUser }, ${ idOrigen } )`)

        if(OSQL.length == 0){

            res.json({
                status:0,
                message:"No se encontró información.",
                data: null
            });

        }
        else{

            res.json({
                status:0,
                message:"Eliminado correctamente.",
                data: OSQL
            });

        }

    }catch(error){
        res.status(500).json({
            status:2,
            message:"Sucedió un error inesperado",
            data: error.message
        });
    }

};

module.exports = {
    getOrigenesResponsables
    , insertOrinResponsable
    , deleteOrinResponsable
    , getIdOrigenByRelation

    , getOrigenesForAddUser
    , getOrigenesByIdUser
    , insertOrigenByIdUser
    , deleteOrigenByIdUser
    , cambioDeOrigenPrincipalByIdUser
  }