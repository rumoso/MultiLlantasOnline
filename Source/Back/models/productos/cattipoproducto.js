
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const CatTipoProducto = dbConnection.define('cat_tipo_producto', {
    idCatTipoProducto:{
        type:DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement:true
    },
    name:{
        type: DataTypes.STRING
    },
    descripcion:{
        type: DataTypes.STRING
    },
    abreviatura:{
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.TINYINT
    }
},{    
    createdAt: false,
    updatedAt: false,
    freezeTableName:true
    });

module.exports= CatTipoProducto;
