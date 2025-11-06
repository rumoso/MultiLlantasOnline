const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');
const PromocionCondicion = dbConnection.define('promocioncondicion', {
   idPromocionCondicion: {
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
   tipoCondicion: {
       type: DataTypes.STRING
   },
   entidadObjetivo: {
       type: DataTypes.STRING
   },
   idObjetivo: {
       type: DataTypes.INTEGER
   },
   operador: {
       type: DataTypes.STRING
   },
   valor: {
       type: DataTypes.DECIMAL(10, 2)
   }
});


module.exports= PromocionCondicion;











