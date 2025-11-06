
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const Municipios = dbConnection.define('municipios', {
    idmunicipios:{
        type:DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement:true
    },
    codigomunicipio:{
        type: DataTypes.STRING
    },
    nombre:{
        type: DataTypes.STRING
    },
    codigoestado:{
        type: DataTypes.STRING
    }
},{    
    createdAt: false,
    updatedAt: false
    });

module.exports= Municipios;
