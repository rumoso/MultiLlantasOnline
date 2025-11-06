
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');
const Ciudades = require('./ciudades');
const Municipios = require('./municipios');
const Estados = require('./estados');

const Colonias = dbConnection.define('colonias', {
    codigocolonia:{
        type:DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement:true
    },
    nombre:{
        type: DataTypes.STRING
    },
    codigopostal:{
        type: DataTypes.STRING
    },
    codigociudad:{
        type: DataTypes.STRING
    },
    codigomunicipio:{
        type: DataTypes.STRING
    },
    codigoestado:{
        type: DataTypes.STRING
    }
},{    
    createdAt: false,
    updatedAt: false
    });

    // Relación con Estado
    Colonias.belongsTo(Estados, {
        foreignKey: 'codigoestado',
        as: 'estado'
    });

module.exports= Colonias;






