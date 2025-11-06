const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection } = require('../database/config');

const getAlmacenesPaginado = async(req, res = response) => {

    const {
        search = '', limiter = 10, start = 0
    } = req.body;

    console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call getAlmacenesPaginado('${ search }',${ start },${ limiter })`)

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

            const iRows = ( OSQL.length > 0 ? OSQL[0].iRows: 0 );
            
            res.json({
                status: 0,
                message: "Ejecutado correctamente.",
                data:{
                    count: iRows,
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

const getAlmacenByID = async(req, res = response) => {

    const {
        idAlmacen
    } = req.body;

    //console.log(req.body)

    try{
        
        var OSQL = await dbConnection.query(`call getAlmacenByID(${ idAlmacen })`)

        if(OSQL.length == 0){

            res.json({
                status: 0,
                message: "No se encontró la sucursal.",
                data: null
            });

        }
        else{

            res.json({
                status: 0,
                message: "Ejecutado correctamente.",
                data: OSQL[0]
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

const insertUpdateAlmacen = async(req, res) => {
    
    const {
        idAlmacen = 0
        , name
        , idCatRelacionOrigen
        , calle
        , entreCalles
        , codigocolonia = '0'
        , telefono
        , email
        , numExt
        , numInt
        , lat = 0
        , long = 0
        , active

        , idUserLogON
        
    } = req.body;

    //console.log(req.body)

    try{

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var OSQL = await dbConnection.query(`call insertUpdateAlmacen(
        '${ oGetDateNow }'
        ,${ idAlmacen }
        ,'${ name }'
        , ${ idCatRelacionOrigen }
        ,'${ calle }'
        ,'${ entreCalles }'
        ,'${ codigocolonia }'
        ,'${ telefono }'
        ,'${ email }'
        ,'${ numExt }'
        ,'${ numInt }'
        ,'${ lat }'
        ,'${ long }'
        , ${ active }
        )`)

        res.json({
            status: OSQL[0].out_id > 0 ? 0 : 1,
            message: OSQL[0].message,
            insertID: OSQL[0].out_id
        });

    }catch(error){

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }
}

const deleteAlmacen = async(req, res = response) => {

    const {
        idAlmacen
    } = req.body;

    //console.log(req.body)
    var OSQL = await dbConnection.query(`call deleteSucursal( ${ idAlmacen } )`)

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

const cbxCatRelacionOrigen = async(req, res = response) => {

    const { search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxCatRelacionOrigen( '${ search }' )`)

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
    getAlmacenesPaginado
    , getAlmacenByID
    , insertUpdateAlmacen
    , deleteAlmacen
    , cbxCatRelacionOrigen
  }