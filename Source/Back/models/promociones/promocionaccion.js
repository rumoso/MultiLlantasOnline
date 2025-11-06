const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');
const PromocionAccion = dbConnection.define('promocionaccion', {
    idPromocionAccion: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    idPromocion: {
        type: DataTypes.INTEGER,
        references: 'promociones',
        referencesKey: 'idPromocion'
    },
    tipoAccion: {
        type: DataTypes.STRING
    },
    entidadObjetivo: {
        type: DataTypes.STRING
    },
    idObjetivo: {
        type: DataTypes.INTEGER
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2)
    }
});

module.exports= PromocionAccion;











