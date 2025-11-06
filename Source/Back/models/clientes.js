
const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../database/config');

const Clientes = dbConnection.define('clientes', {
    idCliente:{
        type:DataTypes.INTEGER,
        unique:true,
        primaryKey: true,
        autoIncrement:true
    },
    idVendedor: {
        type: DataTypes.INTEGER,        
        references: 'vendedores',
        referencesKey: 'idVendedor'
    },
    createDate:{
        type:DataTypes.DATE
    },
    nombre:{
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

module.exports= Clientes;

