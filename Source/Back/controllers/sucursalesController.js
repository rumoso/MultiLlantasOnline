const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection } = require('../database/config');

    const cbxGetSucursalesCombo = async(req, res = response) => {

        const {
            search = '',

            idUserLogON
        } = req.body;

        //console.log(req.body)
        var OSQL = await dbConnection.query(`call cbxGetSucursalesCombo( '${search}', ${idUserLogON} )`)

        if(OSQL.length == 0){

            res.json({
                status:3,
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

    const cbxGetSucursales = async(req, res = response) => {

        const {
            search = '',
            idUserLogON
        } = req.body;

        try{

            var OSQL = await dbConnection.query(`call cbxGetSucursales( '${search}', ${idUserLogON} )`)

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


  const getPrintTicketSuc = async(req, res = response) => {

    const {
        idSucursal,
        type = ''
    } = req.body;
  
    //console.log(req.body)
    var OSQL = await dbConnection.query(`call getPrintTicketSuc( ${idSucursal}, '${type}' )`)
  
    if(OSQL.length == 0){
  
          res.json({
              status:3,
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

  const getSucursalesListWithPage = async(req, res = response) => {

    const {
        search = '', limiter = 10, start = 0
    } = req.body;

    console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call getSucursalesListWithPage('${ search }',${ start },${ limiter })`)

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

const getSucursalByID = async(req, res = response) => {

    const {
        idSucursal
    } = req.body;

    //console.log(req.body)

    try{
        
        var OSQL = await dbConnection.query(`call getSucursalByID(${ idSucursal })`)

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

const insertUpdateSucursal = async(req, res) => {
    
    const {
        idSucursal
        , name
        , calle
        , entreCalles
        , codigocolonia
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

        var OSQL = await dbConnection.query(`call insertUpdateSucursal(
        '${ oGetDateNow }'
        ,${ idSucursal }
        ,'${ name }'
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

const deleteSucursal = async(req, res = response) => {

    const {
      idSucursal
    } = req.body;
  
    //console.log(req.body)
    var OSQL = await dbConnection.query(`call deleteSucursal( ${ idSucursal } )`)
  
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

const getImpresoraTicketsData = async(req, res = response) => {

    const {
        idSucursal
    } = req.body;

    //console.log(req.body)

    try{
        
        var OSQL = await dbConnection.query(`call getImpresoraTicketsData(${ idSucursal })`)

        if(OSQL.length == 0){

            res.json({
                status: 0,
                message: "No se encontró la información.",
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

module.exports = {
    cbxGetSucursalesCombo
    , cbxGetSucursales
    , getPrintTicketSuc
    , getSucursalesListWithPage
    , getSucursalByID
    , insertUpdateSucursal
    , deleteSucursal
    , getImpresoraTicketsData
  }