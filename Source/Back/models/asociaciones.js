// Este archivo maneja todas las asociaciones entre modelos

const Promociones = require('./promociones/promociones');
const PromocionCondicion = require('./promociones/promocioncondicion');
const PromocionAccion = require('./promociones/promocionaccion');
const PromocionUso = require('./promociones/promocionuso');

// Asociaciones para Promociones
Promociones.hasMany(PromocionCondicion, { foreignKey: 'idPromocion', as: 'condiciones' });
Promociones.hasMany(PromocionAccion, { foreignKey: 'idPromocion', as: 'acciones' });
Promociones.hasMany(PromocionUso, { foreignKey: 'idPromocion', as: 'usos' });

// Asociaciones para PromocionCondicion
PromocionCondicion.belongsTo(Promociones, { foreignKey: 'idPromocion' });

// Asociaciones para PromocionAccion
PromocionAccion.belongsTo(Promociones, { foreignKey: 'idPromocion' });

// Asociaciones para PromocionUso
PromocionUso.belongsTo(Promociones, { foreignKey: 'idPromocion' });

module.exports = {
    Promociones,
    PromocionCondicion,
    PromocionAccion,
    PromocionUso
};