
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const MovimientosCaja = dbConnection.define('movimientos_caja', {
    idmovimientoscaja: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.STRING,
    },
    tipo: {
        type: DataTypes.ENUM('INGRESO', 'EGRESO'),
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
    },
    idcatmovimientos: {
        type: DataTypes.INTEGER,
    },
    idformaspago: {
        type: DataTypes.INTEGER,
    },
    idUser: {
        type: DataTypes.BIGINT,
    },
    idturnoscaja: {
        type: DataTypes.INTEGER,
    },
    idcajas: {
        type: DataTypes.INTEGER        
    },
    observaciones: {
        type: DataTypes.STRING(500)
    }
}, {
    tableName: 'movimientos_caja',
    timestamps: false
});

module.exports = MovimientosCaja;