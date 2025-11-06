
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const ImpresoraTickets = dbConnection.define('impresora_tickets', {
    idimpresoratickets:{
        type:DataTypes.INTEGER,
        unique:true,
        primaryKey: true,
        autoIncrement:true
    },
    nombrenegocio:{
        type:DataTypes.STRING
    },
    razonsocial:{
        type:DataTypes.STRING
    },
    rfc:{
        type:DataTypes.STRING
    },
    direccion:{
        type:DataTypes.STRING
    },
    telefono:{
        type:DataTypes.STRING
    },
    agradecimiento:{
        type:DataTypes.STRING
    },
    infoadicional:{
        type:DataTypes.STRING
    },
    idSucursal:{
        type: DataTypes.INTEGER,        
        references: 'sucursales',
        referencesKey: 'idSucursal'
    }      
},{    
createdAt: false,
updatedAt: false
});

module.exports= ImpresoraTickets;



