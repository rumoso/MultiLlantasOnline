const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');
const Sucursales = require('../sucursales');
const User = require('../user');

const CortescajaGeneral = dbConnection.define('cortescajageneral', {
    idcortescajageneral: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fechainicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fechacierre: {
        type: DataTypes.DATE,
        allowNull: true
    },
    idSucursal: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        references: {
            model: Sucursales,
            key: 'idSucursal'
        }
    },
    totalefectivo: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
    },
    totaltarjeta: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
    },
    totaltransferencia: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
    },
    totalventas: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
    },
    totalgastos: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
    },
    saldofinal: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
    },
    idUser: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'idUser'
        }
    }
});

module.exports = CortescajaGeneral;