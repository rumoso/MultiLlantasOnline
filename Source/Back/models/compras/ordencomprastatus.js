
const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');

const OrdenCompraStatus = dbConnection.define('cat_orden_compra_status', {
    idOrdenCompraStatus: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    active: {
        type: TINYINT,
        defaultValue: 1
    }
});

module.exports = OrdenCompraStatus;