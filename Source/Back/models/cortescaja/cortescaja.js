const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');
const User = require('../user');
const Sucursales = require('../sucursales');
const Cajas = require('../cajas/cajas');

const Cortescaja = dbConnection.define('cortescaja', {
    idcortescaja: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.STRING(8), // Para formato YYYYMMDD
        allowNull: false
    },
    horaapertura: {
        type: DataTypes.STRING(6) // Para formato HHMMSS
    },
    horacierre: {
        type: DataTypes.STRING(6) // Para formato HHMMSS
    },
    idUser: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: 'idUser'
        }
    },
    idSucursal: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        references: {
            model: Sucursales,
            key: 'idSucursal'
        }
    },
    idcajas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cajas,
            key: 'idcajas'
        }
    },
    idturnoscaja:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'turnoscaja', // Nombre de la tabla de turnos de caja
            key: 'idturnoscaja'
        }
    },
    saldoinicial: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
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
    totalcheque: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
    },
    totaldineroelectronico: {
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
    efectivocontado: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
    },
    diferencia: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
    },
    retiroporcorte: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0
    },
    observaciones: {
        type: DataTypes.TEXT
    },
    estatus: {
        type: DataTypes.STRING(20),
        defaultValue: 'ABIERTO'
    }
});

module.exports = Cortescaja;