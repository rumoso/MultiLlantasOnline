
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const Cajas = dbConnection.define('cajas', {
    idcajas:{
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    idSucursal:{
        type: DataTypes.INTEGER,
        references: 'sucursales',
        referencesKey: 'idSucursal'
    },
    nombre: {
        type: DataTypes.STRING
    },
    descripcion: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    activeuuid: {
        type: DataTypes.STRING
    },
    ultimouso:{
        type: DataTypes.STRING(14) // Para formato yyyyMMddHHmmss
    },
    esgeneral:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    estatus: {
        type: DataTypes.STRING,
        defaultValue: 'CERRADA'// Valores posibles: ABIERTA, CERRADA
    }
});

module.exports= Cajas;

