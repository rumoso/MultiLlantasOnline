
const { DataTypes } = require('sequelize');
const { dbConnection } = require('../../database/config');

const Descripciones = dbConnection.define('cat_descripciones', {
    idDescription:{
        type:DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement:true
    },
    description:{
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.TINYINT
    }
},{    
    createdAt: false,
    updatedAt: false,
    freezeTableName:true
    });

module.exports= Descripciones;
