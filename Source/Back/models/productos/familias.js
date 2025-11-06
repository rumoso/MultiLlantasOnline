
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const Familias = dbConnection.define('cat_familias', {
    idFamilia:{
        type:DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement:true
    },
    name:{
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.TINYINT
    }
},{    
    createdAt: false,
    updatedAt: false
    });

module.exports = Familias;
