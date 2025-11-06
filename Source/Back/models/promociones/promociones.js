const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');

const Promociones = dbConnection.define('promociones', {
    idPromocion: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING
    },
    descripcion: {
        type: DataTypes.STRING
    },
    tipoPromocion: {
        type: DataTypes.STRING
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2)
    },
    fechaInicio: {
        type: DataTypes.DATE
    },
    fechaFin: {
        type: DataTypes.DATE
    },
    activo: {
        type: DataTypes.BOOLEAN
    },
    prioridad: {
        type: DataTypes.INTEGER
    },
    requiereCodigoCupon: {
        type: DataTypes.BOOLEAN
    },
    codigoCupon: {
        type: DataTypes.STRING
    },
    maxUsosTotal: {
        type: DataTypes.INTEGER
    },
    maxUsosPorCliente: {
        type: DataTypes.INTEGER
    }
});

module.exports= Promociones;











