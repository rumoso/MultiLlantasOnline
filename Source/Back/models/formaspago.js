
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../database/config');


const FormasPago = dbConnection.define('formas_pago', {
    idformaspago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion: {
        type: DataTypes.STRING(45),
    },
    activo: {
        type: DataTypes.BOOLEAN      
    }
}, {
    tableName: 'formas_pago',
    timestamps: false
});

module.exports = FormasPago;
