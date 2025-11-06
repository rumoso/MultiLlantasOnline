
const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../database/config');

const Vendedores = dbConnection.define('vendedores', {
    idVendedor:{
        type:DataTypes.INTEGER,
        unique:true,
        primaryKey: true,
        autoIncrement:true
    },
    createDate:{
        type:DataTypes.DATE
    },
    nombre:{
        type:DataTypes.STRING
    },
    fechaIngreso:{
        type:DataTypes.DATE
    },
    fechaNacimiento:{
        type:DataTypes.DATE
    },
    sexo:{
        type:DataTypes.STRING
    },
    idUser:{
        type:DataTypes.INTEGER
    },
    idStatusVendedor:{
        type:DataTypes.INTEGER
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
    entreCalle:{
        type:DataTypes.STRING
    },
    codigocolonia:{
        type:DataTypes.INTEGER
    },
    rfc:{
        type:DataTypes.STRING
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

module.exports= Vendedores;

