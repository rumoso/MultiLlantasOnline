
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const CartDetail = dbConnection.define('cartdetail', {
    idcartDetail:{
        type:DataTypes.INTEGER,
        unique:true,
        primaryKey: true,
        autoIncrement:true
    },
    idcart:{
        type: DataTypes.INTEGER,
        references: 'cart',
        referencesKey: 'idcart'
    },
    sku:{
        type:DataTypes.STRING
    },
    idProducto:{
        type: DataTypes.INTEGER,
        references: 'productos',
        referencesKey: 'idProducto'
    },
    descripcion:{
        type:DataTypes.STRING
    },    
    cantidad:{
        type:DataTypes.DECIMAL(10,2)    
    },
    precio:{
        type:DataTypes.DECIMAL(18,2)
    }
},{    
createdAt: false,
updatedAt: false,
tableName: 'cartdetail'
});

module.exports= CartDetail;

