
const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');

const OrdenCompra = dbConnection.define('orden_compra', {
    idOrdenDeCompra: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    createDate: {
        type: DataTypes.DATE
    },
    idProveedor: {
        type: DataTypes.INTEGER,
        references: 'proveedores',
        referencesKey: 'idProveedor'
    },
    idOrdenCompraStatus: {
        type: DataTypes.INTEGER,
        references: 'cat_orden_compra_status',
        referencesKey: 'idOrdenCompraStatus'
    },
    costoTotal: {
        type: DataTypes.DECIMAL(18, 2)
    },
    idCreateUser: {
        type: DataTypes.INTEGER,
        references: 'users',
        referencesKey: 'idUser'
    },
    fechaPedido: {
        type: DataTypes.DATE
    },
    fechaRecepcion: {
        type: DataTypes.DATE
    },
    numeroFactura: {
        type: DataTypes.STRING(45)
    },
    active: {
        type: TINYINT,
        defaultValue: 1
    }
}, {
    createdAt: false,
    updatedAt: false,
    tableName: 'orden_compra'
});

module.exports = OrdenCompra;