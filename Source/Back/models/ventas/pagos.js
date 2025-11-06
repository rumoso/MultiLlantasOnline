const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');
const MetodosPagoDetalle = require('./metodospagodetalle');

const Pagos = dbConnection.define('pagos', {
    idPago:{
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    createDate:{
        type: DataTypes.DATE
    },
    active:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    idMetodosPagoDetalle:{
        type: DataTypes.INTEGER,
        references: 'metodos_pago_detalle',
        referencesKey: 'idMetodoPagoDetalle'
    },
    idVenta:{
        type: DataTypes.INTEGER,
        references: 'ventas',
        referencesKey: 'idVenta'
    },
    idCreateUser:{
        type: DataTypes.INTEGER,
        references: 'users',
        referencesKey: 'idUser'
    },
    total:{
        type: DataTypes.DECIMAL(18, 2)
    }
},{
    createdAt: false,
    updatedAt: false,
    tableName: 'pagos'
});

Pagos.belongsTo(MetodosPagoDetalle, { foreignKey: "idMetodosPagoDetalle" });

MetodosPagoDetalle.hasOne(Pagos, { foreignKey: "idMetodosPagoDetalle" });

module.exports = Pagos; 