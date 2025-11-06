
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../database/config');

const Proveedor = dbConnection.define('proveedores', {
    idProveedor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    createDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    calle: {
        type: DataTypes.STRING
    },
    numExt: {
        type: DataTypes.STRING
    },
    numInt: {
        type: DataTypes.STRING
    },
    entreCalles: {
        type: DataTypes.STRING
    },
    codigocolonia: {
        type: DataTypes.INTEGER
    },
    rfc: {
        type: DataTypes.STRING
    },
    telefono: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    lat: {
        type: DataTypes.STRING
    },
    long: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    createdAt: false,
    updatedAt: false
});

module.exports = Proveedor;