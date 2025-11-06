
const { DataTypes, TINYINT } = require('sequelize');
const { dbConnection } = require('../../database/config');
const UnidadMedida = require('./unidadmedida');
const Descripciones = require('./descripciones');
const CatTipoProducto = require('./cattipoproducto');
const Familias = require('./familias');

const Productos = dbConnection.define('productos', {
        idProducto:{
            type:DataTypes.NUMBER,
            unique:true,
            primaryKey: true,
            autoIncrement:true
        },
        createDate:{
            type:DataTypes.DATE
        },
        sku:{
            type: DataTypes.STRING
        },
        idDescription: {
            type: DataTypes.STRING,            
            references: 'cat_descripciones',
            referencesKey: 'idDescription'
        },
        valorMedida:{
            type:DataTypes.INTEGER
        },
        idUnidadMedida:{
            type:DataTypes.INTEGER,
            references: 'cat_unidad_medida',
            referencesKey: 'idUnidadMedida'
        },
        idCatTipoProducto:{
            type:DataTypes.INTEGER,
            references: 'cat_tipo_producto',
            referencesKey: 'idCatTipoProducto'
        },
        idProductoRelacion:{
            type:DataTypes.INTEGER,
            references: 'productos',
            referencesKey: 'idProducto'
        },   
        porcentajeRelation:{
            type:DataTypes.FLOAT(10,2),
            defaultValue: 100
        },
        idcatcategoriaproducto:{
            type:DataTypes.INTEGER,
            references: 'cat_categoria_producto',
            referencesKey: 'idcatcategoriaproducto'
        },
        idproductocategoria:{
            type:DataTypes.INTEGER
        },
        idFamilia:{
            type:DataTypes.INTEGER,
            references: 'cat_familias',
            referencesKey: 'idFamilia'
        },   
        cantidad:{
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('cantidad') || 0;
            },
            set(value) {
                this.setDataValue('cantidad', value);
            }
        },    
        costo:{
            type:DataTypes.FLOAT(10,2)
        },
        precio:{
            type:DataTypes.FLOAT(10,2)
        },
        active:{
            type:DataTypes.TINYINT
        },
        imageUrl:{
            type: DataTypes.STRING
        },
        bEnvase:{
            type: DataTypes.BOOLEAN,
        },
        precioEcoAgr:{
            type:DataTypes.FLOAT(10,2)
        },
        porcentDineroElectronico:{
            type:DataTypes.INTEGER,
            defaultValue: 3
        },
        porcentDineroElectronicoEnvase:{
            type:DataTypes.INTEGER,
            defaultValue: 0
        }
    },{    
    createdAt: false,
    updatedAt: false
    });

    Productos.belongsTo(UnidadMedida,{
        foreignKey:'idUnidadMedida',
        as:'unidadmedida',
    });
    Productos.belongsTo(Descripciones,{
        foreignKey:'idDescription',        
        as:'descripciones'
    });

    Productos.belongsTo(Productos,{
        foreignKey:'idProductoRelacion',
        as:'productobase'
    });

    Productos.belongsTo(CatTipoProducto,{
        foreignKey:'idCatTipoProducto',
        as:'tipoproducto'
    });

    Productos.belongsTo(Familias,{
        foreignKey:'idFamilia',
        as:'familia'
    });

module.exports= Productos;











