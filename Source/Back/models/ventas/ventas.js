
const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');
const VentasDetalle = require('./ventasdetalle');
const Clientes = require('../clientes');
const Sucursales = require('../sucursales');

const Ventas = dbConnection.define('ventas', {
    idVenta:{
        type: DataTypes.BIGINT,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    createDate:{
        type: DataTypes.DATE
    },
    active:{
        type: DataTypes.SMALLINT
    },
    idCreateUser:{
        type: DataTypes.BIGINT,
        references: 'users',
        referencesKey: 'idUser'
    },
    subtotal: {
        type: DataTypes.DECIMAL(18, 2)
    },
    descuento: {
        type: DataTypes.DECIMAL(18, 2)   
    },
    iva:{
        type: DataTypes.DECIMAL(10, 2)
    },
    total:{
        type: DataTypes.DECIMAL(18, 2)
    },
    pendiente:{
        type: DataTypes.DECIMAL(18, 2)
    },
    idCliente:{
        type: DataTypes.BIGINT,
        references: 'clientes',
        referencesKey: 'idCliente'
    },
    idSucursal:{
        type: DataTypes.SMALLINT,
        references: 'sucursales',
        referencesKey: 'idSucursal'
    },
    idCaja:{
        type: DataTypes.INTEGER,
        references: 'cajas',
        referencesKey: 'idcajas'
    },
    idTipoVenta:{
        type: DataTypes.INTEGER,
    },
    idVendedor:{
        type: DataTypes.BIGINT,
    },
    bClosed:{
        type: DataTypes.SMALLINT
    },
    idPedido:{
        type: DataTypes.BIGINT
    },
},{    
createdAt: false,
updatedAt: false
});

Ventas.hasMany(VentasDetalle, { foreignKey: 'idVenta', as: 'ventasdetalle' });
Ventas.belongsTo(Clientes, { foreignKey: 'idCliente', as: 'cliente' });
Ventas.belongsTo(Sucursales, { foreignKey: 'idSucursal', as: 'sucursal' });

module.exports= Ventas;

