const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');
const PromocionUso = dbConnection.define('promocionuso', {
    idpromocionuso: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    idPromocion: {
        type: DataTypes.INTEGER,
        references: 'promociones',
        referencesKey: 'idPromociones'
    },
    idventas: {
        type: DataTypes.INTEGER,
        references: 'ventas',
        referencesKey: 'idventas'
    },
    idCliente: {
        type: DataTypes.INTEGER,
        references: 'clientes',
        referencesKey: 'idCliente'
    }
});

module.exports= PromocionUso;











