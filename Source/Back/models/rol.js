const { DataTypes } = require('sequelize');
const { dbConnection } = require('../database/config');

const Rol = dbConnection.define('Rols',{
    idRol: {
        type: DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement: true
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    }
})

module.exports = Rol;