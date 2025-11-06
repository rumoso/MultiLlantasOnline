const MovimientosCaja = require('./movimientoscaja');
const CatMovimientosCaja = require('./catmovimientoscaja');
const FormasPago = require('../formaspago');
const User = require('../user');
const Cajas = require('./cajas');
const Turnoscaja = require('../cortescaja/turnoscaja');

// Asociaciones para MovimientosCaja
MovimientosCaja.belongsTo(CatMovimientosCaja, { 
    foreignKey: 'idcatmovimientos',
    targetKey: 'idcatmovimientoscaja',
    as: 'categoria' 
});
CatMovimientosCaja.hasMany(MovimientosCaja, { 
    foreignKey: 'idcatmovimientos',
    sourceKey: 'idcatmovimientoscaja'
});

MovimientosCaja.belongsTo(FormasPago, { 
    foreignKey: 'idformaspago', 
    as: 'formaPago' 
});
FormasPago.hasMany(MovimientosCaja, { 
    foreignKey: 'idformaspago' 
});

MovimientosCaja.belongsTo(User, { 
    foreignKey: 'idUser', 
    as: 'usuario' 
});
User.hasMany(MovimientosCaja, { 
    foreignKey: 'idUser' 
});

MovimientosCaja.belongsTo(Cajas, { 
    foreignKey: 'idcajas', 
    as: 'caja' 
});
Cajas.hasMany(MovimientosCaja, { 
    foreignKey: 'idcajas' 
});

MovimientosCaja.belongsTo(Turnoscaja, { 
    foreignKey: 'idturnoscaja', 
    as: 'turnoCaja' 
});
Turnoscaja.hasMany(MovimientosCaja, { 
    foreignKey: 'idturnoscaja' 
});

module.exports = {
    MovimientosCaja,
    CatMovimientosCaja,
    FormasPago,
    User,
    Cajas,
    Turnoscaja
};
