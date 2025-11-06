
const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../database/config');

const Sucursales = dbConnection.define('sucursales', {
    idSucursal:{
        type:DataTypes.NUMBER,
        unique:true,
        primaryKey: true,
        autoIncrement:true
    },
    createDate:{
        type:DataTypes.DATE
    },
    name:{
        type:DataTypes.STRING
    },
    calle:{
        type:DataTypes.STRING
    },
    numExt:{
        type:DataTypes.STRING
    },
    numInt:{
        type:DataTypes.STRING
    },
    entreCalles:{
        type:DataTypes.STRING
    },
    codigocolonia:{
        type:DataTypes.INTEGER
    },
    telefono:{
        type:DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING
    },
    lat:{
        type:DataTypes.STRING
    },
    long:{
        type:DataTypes.STRING
    },
    active:{
        type:DataTypes.BOOLEAN
    }
},{    
createdAt: false,
updatedAt: false
});

module.exports= Sucursales;

