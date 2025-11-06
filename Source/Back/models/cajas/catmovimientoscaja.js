
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const CatMovimientosCaja = dbConnection.define('cat_movimientos_caja', {
    idcatmovimientoscaja: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion: {
        type: DataTypes.STRING(45),
    },
    activo: {
        type: DataTypes.TINYINT,
    },
    tipo_movimiento: {
        type: DataTypes.ENUM('INGRESO', 'EGRESO', 'AMBOS'),
    }
},{
    tableName: 'cat_movimientos_caja',
    timestamps: false
});

module.exports = CatMovimientosCaja;