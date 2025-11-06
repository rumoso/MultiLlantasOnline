const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');
const Cortescaja = require('./cortescaja');

const CortescajaDenominaciones = dbConnection.define('cortescajadenominaciones', {
    idcortescajadenominaciones: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idcortescaja: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cortescaja,
            key: 'idcortescaja'
        }
    },
    tipo: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0,
        allowNull: false
    }
});

module.exports = CortescajaDenominaciones;