
const { DataTypes, TINYINT, SMALLINT } = require('sequelize');
const { dbConnection } = require('../../database/config');

const VentasDetalle = dbConnection.define('ventasdetalle', {
    idVentaDetalle:{
        type: DataTypes.BIGINT,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    idVenta:{
        type: DataTypes.BIGINT,
        references: 'ventas',
        referencesKey: 'idVenta'
    },
    idProducto:{
        type: DataTypes.BIGINT,
        references: 'productos',
        referencesKey: 'idProducto'
    },
    descripcion:{
        type: DataTypes.STRING(500)
    },
    bEnvase:{
        type: DataTypes.SMALLINT,
        defaultValue: 0
    },
    cantidad:{
        type: DataTypes.DECIMAL(18, 2)    
    },
    precioUnitario:{
        type: DataTypes.DECIMAL(18, 2)
    },
    descuento:{
        type: DataTypes.DECIMAL(18, 2)
    },
    precioConDescuento:{
        type: DataTypes.DECIMAL(18, 2)
    },
    total:{
        type: DataTypes.DECIMAL(18, 2)
    },
    aplicaPromo:{
        type: DataTypes.SMALLINT,
        defaultValue: 0
    },
    idPromocion:{
        type: DataTypes.BIGINT,
        references: 'promociones',
        referencesKey: 'idPromocion'
    },
    promoName:{
        type: DataTypes.STRING(500)
    },
},{    
createdAt: false,
updatedAt: false
});

module.exports= VentasDetalle;

