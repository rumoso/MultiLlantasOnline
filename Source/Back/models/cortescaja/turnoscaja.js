const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');
const User = require('../user');
const Cajas = require('../cajas/cajas');

const Turnoscaja = dbConnection.define('turnoscaja', {
    idturnoscaja: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idcajas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cajas,
            key: 'idcajas'
        }
    },
    idUser: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: 'idUser'
        }
    },
    fechainicio: {
        type: DataTypes.STRING(14), // Para formato yyyyMMddHHmmss
    },
    fechafin: {
        type: DataTypes.STRING(14) // Para formato yyyyMMddHHmmss
    }
}, {
    tableName: 'turnoscaja',
    timestamps: false
});

module.exports = Turnoscaja;