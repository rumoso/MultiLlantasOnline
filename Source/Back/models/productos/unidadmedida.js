
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const UnidadMedida = dbConnection.define('cat_unidad_medida', {
    idUnidadMedida:{
        type:DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement:true
    },
    name:{
        type: DataTypes.STRING
    },
    abreviatura:{
        type:DataTypes.STRING
    },
    active: {
        type: DataTypes.TINYINT
    }
},{    
    createdAt: false,
    updatedAt: false
    });

module.exports= UnidadMedida;

