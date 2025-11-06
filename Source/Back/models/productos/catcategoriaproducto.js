
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const CatCategoriaProducto = dbConnection.define('cat_categoria_producto', {
    idcatcategoriaproducto:{
        type:DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement:true
    },
    name:{
        type: DataTypes.STRING
    },
    description:{
        type: DataTypes.STRING
    }
},{    
    createdAt: false,
    updatedAt: false,
    freezeTableName:true
    });

module.exports= CatCategoriaProducto;
