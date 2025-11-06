const User = require('../user');
const Cajas = require('../cajas/cajas');
const Sucursales = require('../sucursales'); // Asegúrate de que esta ruta sea correcta
const TurnosCaja = require('./turnoscaja');
const CorteCaja = require('./cortescaja');
const CortescajaGeneral = require('./cortescajageneral');

// Asociaciones para TurnosCaja
TurnosCaja.belongsTo(User, { foreignKey: 'idUser' });
User.hasMany(TurnosCaja, { foreignKey: 'idUser' });

TurnosCaja.belongsTo(Cajas, { foreignKey: 'idcajas' });
Cajas.hasMany(TurnosCaja, { foreignKey: 'idcajas' });

// Asociaciones para CorteCaja
CorteCaja.belongsTo(User, { foreignKey: 'idUser' });
User.hasMany(CorteCaja, { foreignKey: 'idUser' });

CorteCaja.belongsTo(Cajas, { foreignKey: 'idcajas' });
Cajas.hasMany(CorteCaja, { foreignKey: 'idcajas' });

CorteCaja.belongsTo(Sucursales, { foreignKey: 'idSucursal' });
Sucursales.hasMany(CorteCaja, { foreignKey: 'idSucursal' });

CorteCaja.belongsTo(TurnosCaja, { foreignKey: 'idturnoscaja' });
TurnosCaja.hasOne(CorteCaja, { foreignKey: 'idturnoscaja' });

// Asociaciones para CortescajaGeneral
CortescajaGeneral.belongsTo(User, { foreignKey: 'idUser' });
User.hasMany(CortescajaGeneral, { foreignKey: 'idUser' });

CortescajaGeneral.belongsTo(Sucursales, { foreignKey: 'idSucursal' });
Sucursales.hasMany(CortescajaGeneral, { foreignKey: 'idSucursal' });

// *** ASOCIACIÓN FALTANTE: Cajas y Sucursales ***
Cajas.belongsTo(Sucursales, { foreignKey: 'idSucursal', as: 'sucursales'});
Sucursales.hasMany(Cajas, { foreignKey: 'idSucursal' });

module.exports = {
    User,
    Cajas,
    Sucursales,
    TurnosCaja,
    CorteCaja,
    CortescajaGeneral
};