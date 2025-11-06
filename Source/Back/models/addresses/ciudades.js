
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const Ciudades = dbConnection.define('ciudades', {
    idciudades:{
        type:DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement:true
    },
    codigociudad:{
        type: DataTypes.STRING
    },
    nombre:{
        type: DataTypes.STRING
    },
    codigomunicipio:{
        type: DataTypes.STRING
    },
    codigoestado:{
        type: DataTypes.STRING
    }
},{    
    createdAt: false,
    updatedAt: false
    });

module.exports= Ciudades;









