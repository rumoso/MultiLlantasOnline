
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const CatTipoVenta = dbConnection.define('cat_tipo_venta', {
    idTipoVenta:{
        type:DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement:true
    },
    name:{
        type: DataTypes.STRING
    },
    description:{
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.TINYINT
    }
},{    
    createdAt: false,
    updatedAt: false
    });

module.exports = CatTipoVenta;
