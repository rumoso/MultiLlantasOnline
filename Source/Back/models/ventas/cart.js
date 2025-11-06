
const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');
const CartDetail = require('./cartdetail');
const Clientes = require('../clientes');
const CatTipoVenta = require('./catTipoVenta');

const Cart = dbConnection.define('cart', {
    idcart:{
        type:DataTypes.INTEGER,
        unique:true,
        primaryKey: true,
        autoIncrement:true
    },
    createDate:{
        type:DataTypes.DATE
    },
    idUser:{
        type: DataTypes.INTEGER,
        references: 'usuarios',
        referencesKey: 'idUser'
    },
    idCliente:{
        type: DataTypes.INTEGER,
        references: 'clientes',
        referencesKey: 'idCliente'
    },
    idSucursal:{
        type: DataTypes.TINYINT,
        references: 'sucursales',
        referencesKey: 'idSucursal'
    },
        idTipoVenta:{
        type: DataTypes.INTEGER,
        references: 'cat_tipo_venta',
        referencesKey: 'idTipoVenta'
    },
},{    
createdAt: false,
updatedAt: false,
tableName: 'cart'
});

Cart.hasMany(CartDetail, {
    foreignKey: 'idcart',
    sourceKey: 'idcart',
    as: 'productos'
});

CartDetail.belongsTo(Cart, {
    foreignKey: 'idcart',
    targetKey: 'idcart'
});

Cart.belongsTo(Clientes, {
    foreignKey: 'idCliente',
    as: 'cliente'
});

Cart.belongsTo(CatTipoVenta, {
    foreignKey: 'idTipoVenta',
    as: 'tipoVenta'
});


module.exports= {Cart};

