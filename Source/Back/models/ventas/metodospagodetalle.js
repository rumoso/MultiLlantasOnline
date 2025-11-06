const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');
const Pagos = require('./pagos');

const MetodosPagoDetalle = dbConnection.define('metodos_pago_detalle', {
    idMetodosPagoDetalle:{
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    efectivo:{
        type: DataTypes.DECIMAL(18, 2)
    },
    tarjeta:{
        type: DataTypes.DECIMAL(18, 2)
    },
    transferencia:{
        type: DataTypes.DECIMAL(18, 2)
    },
    total:{
        type: DataTypes.DECIMAL(18, 2)
    },
    referenciaTarjeta:{
        type: DataTypes.STRING(45)
    },
    referenciaTransferencia:{
        type: DataTypes.STRING(45)
    }
},{
    createdAt: false,
    updatedAt: false,
    tableName: 'metodos_pago_detalle'
});


module.exports = MetodosPagoDetalle; 