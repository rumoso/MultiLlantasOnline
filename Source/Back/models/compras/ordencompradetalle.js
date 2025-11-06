const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');

const OrdenCompraDetalle = dbConnection.define('orden_compra_detalle', {
    idOrdenDeCompraDetalle: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    idOrdenDeCompra: {
        type: DataTypes.INTEGER,
        references: 'orden_compra',
        referencesKey: 'idOrdenDeCompra'
    },
    idProducto: {
        type: DataTypes.INTEGER,
        references: 'productos',
        referencesKey: 'idProducto'
    },
    cantidad: {
        type: DataTypes.INTEGER
    },
    costo: {
        type: DataTypes.DECIMAL(18, 2)
    },
    importe: {
        type: DataTypes.DECIMAL(18, 2)
    },
    active: {
        type: TINYINT,
        defaultValue: 1
    }
}, {
    createdAt: false,
    updatedAt: false,
    tableName: 'orden_compra_detalle'
});

module.exports = OrdenCompraDetalle;