

const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const Estados = dbConnection.define('estados', {
    codigoestado:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nombre:{
        type: DataTypes.STRING
    }
},{    
    createdAt: false,
    updatedAt: false
    });

module.exports= Estados;
