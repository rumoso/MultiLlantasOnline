const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection } = require('../database/config');

const User = require('../models/user');

const getUsersListWithPage = async(req, res = response) => {

    const {
        search = '', limiter = 10, start = 0
    } = req.body;

    console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call getUsersListWithPage('${ search }',${ start },${ limiter })`)

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

const getUserByID = async(req, res = response) => {

    const {
        idUser
    } = req.body;

    //console.log(req.body)

    try{
        
        var OSQL = await dbConnection.query(`call getUserByID(${ idUser })`)

        if(OSQL.length == 0){

            res.json({
                status: 0,
                message: "No se encontró el usuario.",
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

const insertUser = async(req, res) => {
    
    const {
        name,
        userName,
        pwd = '',
        idStatus = 0,
        active,

        idUserLogON,
        idSucursalLogON
        
    } = req.body;

    //console.log(req.body)

    try{

        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        //encript pwd
        const salt = bcryptjs.genSaltSync();
        const pwdEncrypt = bcryptjs.hashSync( pwd, salt);

        var OSQL = await dbConnection.query(`call insertUser(
        '${ oGetDateNow }'
        ,'${ name }'
        ,'${ userName }'
        ,'${ pwdEncrypt }'
        , ${ idStatus }
        , ${ active }

        , ${ idUserLogON }
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

const updateUser = async(req, res) => {
   
    const {
        idUser,

        name,
        userName,
        pwd = '',
        idStatus = 0,
        active,

        idUserLogON,
        idSucursalLogON

    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call updateUser(
        ${ idUser }
        ,'${ name }'
        ,'${ userName }'
        ,'${ idStatus }'
        , ${ active }
        )`)

        //var ODeleteSync_up = await dbConnection.query(`call deleteSync_up( 'Users', ${ idUser } )`);

        res.json({
            status: OSQL[0].out_id > 0 ? 0 : 1,
            message: OSQL[0].message
        });

    }catch(error){

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }
}

const changePassword = async(req, res) => {

    const {
        idUser,
        pwd = '',
        pwd2 = ''
    } = req.body;

    //console.log(req.body)

    try{

        if(pwd == pwd2){

            //encript pwd
            const salt = bcryptjs.genSaltSync();
            const pwdEncrypt = bcryptjs.hashSync( pwd, salt);

            var OSQL = await dbConnection.query(`call updatePWD(
            ${idUser}
            ,'${pwdEncrypt}'
            )`)

            //var ODeleteSync_up = await dbConnection.query(`call deleteSync_up( 'Users', ${ idUser } )`);

            res.json({
                status: 0,
                message: "Contraseña actualizada con éxito.",
                insertID: OSQL[0].out_id
            });

        }else{

            res.json({
            status: 1,
            message: "Las contraseñas no coinciden",
            });

        }

    }catch(error){

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }
}

const disabledUser = async(req, res) => {
   
    const {
        idUser
    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call disabledUser(
        ${ idUser }
        )`)

        var ODeleteSync_up = await dbConnection.query(`call deleteSync_up( 'Users', ${ idUser } )`);

        res.json({
            status:0,
            message:"Usuario deshabilitado con éxito.",
            insertID: OSQL[0].out_id
        });

    }catch(error){

        res.json({
        status:2,
        message: "Sucedió un error inesperado",
        data: error.message
        });

    }
}

const cbxGetSellersCombo = async(req, res = response) => {

    const {
        idUser,
        search = ''
    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call cbxGetSellersCombo( ${ idUser },'${ search }' )`)

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

const updateAuthorizationCode = async(req, res) => {

    const {
        idUser,
        authorizationCode
    } = req.body;

    //console.log(req.body)

    try{

        var OSQL = await dbConnection.query(`call updateAuthorizationCode(
        ${ idUser }
        ,'${ authorizationCode }'
        )`)

        //var ODeleteSync_up = await dbConnection.query(`call deleteSync_up( 'Users', ${ idUser } )`);

        res.json({
            status: OSQL[0].out_id > 0 ? 0 : 1,
            message: OSQL[0].message
        });

    }catch(error){

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }
}

const getCatStatusUser = async(req, res = response) => {

    const { text = '' } = req.body;

    try {
        var OSQL = await dbConnection.query(`call getCatStatusUser( '${ text }' )`)

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
        
        console.error("Error en getCatStatusUser:", error);
        return res.status(500).json({
            status: 2,
            message: "Sucedió un error inesperado.",
            data: error.message,
        });
        
    }

};

const cbxGetEmployeesForOrigen = async(req, res = response) => {

    const { idOrigen, search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxGetEmployeesForOrigen( ${ idOrigen }, '${ search }' )`)

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

const cbxGetUsersByVendedor = async(req, res = response) => {

    const { idOrigen, search = '' } = req.body;

    try{

        var OSQL = await dbConnection.query(`call cbxGetUsersByVendedor( '${ search }' )`)

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
    getUsersListWithPage
    , getUserByID
    , insertUser
    , updateUser
    , changePassword
    , disabledUser
    , cbxGetSellersCombo
    , updateAuthorizationCode
    , getCatStatusUser
    , cbxGetEmployeesForOrigen
    , cbxGetUsersByVendedor
  }