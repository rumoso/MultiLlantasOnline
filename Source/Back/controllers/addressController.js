const { response } = require('express');
const { Sequelize, Op } = require('sequelize');
const { dbConnection } = require('../database/config');
const Estados = require('../models/addresses/estados');
const Municipios = require('../models/addresses/municipios');
const Ciudades = require('../models/addresses/ciudades');
const Colonias = require('../models/addresses/colonias');

const getEstados = async(req, res = response) => {
    const {search="", codigoestado ="", start= 0, limiter = 100} = req.body;
    let where ={nombre:{[Op.like]:'%'+search+'%'}};
    
    if(codigoestado){
        where.codigoestado = codigoestado;
    }

    const { count, rows} = await Estados.findAndCountAll({ 
                    where,
                    limit:limiter,
                    offset:start    
                });
    
    res.json({
        status:0,
        message:'Estados de México.',
        data:{count, rows}
    });
}

const getMunicipios = async(req, res = response) => {
    const {search="", municipio ="", start= 0, limiter = 1000} = req.body;
    let where={[Op.or]:[{nombre:{[Op.like]:'%'+search+'%'}}]};
    if(municipio.codigomunicipio){
        where.codigomunicipio =  municipio.codigomunicipio;
    }
    if(municipio.codigoestado){
        where.codigoestado = municipio.codigoestado;
    }
    const { count, rows} = await Municipios.findAndCountAll({ 
                    where,
                    limit:limiter,
                    offset:start    
                });
    
    res.json({
        status:0,
        message:'Municipios de México.',
        data:{count, rows}
    });
}

const getCiudades = async(req, res = response) => {
    const {search="", start= 0, ciudad, limiter = 1000} = req.body;
    let where = {[Op.or]:[{nombre:{[Op.like]:'%'+search+'%'}}]};
    if(ciudad.codigociudad){
        where = {...where, codigociudad: ciudad.codigociudad};
    }
    if(ciudad.codigomunicipio){
        where = {...where, codigomunicipio: ciudad.codigomunicipio};
    }

    if(ciudad.codigoestado){
        where = {...where, codigoestado: ciudad.codigoestado};
    }

    const { count, rows} = await Ciudades.findAndCountAll({ 
                    where,
                    limit:limiter,
                    offset:start    
                });
    
    res.json({
        status:0,
        message:'Ciudades de México.',
        data:{count, rows}
    });
}

const getColonias = async(req, res = response) => {
    const {search="", codigoPostal = "", codigociudad = "", codigomunicipio="", codigoestado ="",
        start= 0, limiter = 1000} = req.body;
    let where ={};
    where ={[Op.or]:[{nombre:{[Op.like]:'%'+search+'%'}}]};
    if (codigoPostal){
        where.codigopostal = codigoPostal;
    }

    if (codigociudad){
        where.codigociudad = codigociudad;
    }

    if (codigomunicipio){
        where.codigomunicipio = codigomunicipio;
    }

    if (codigoestado){
        where.codigoestado = codigoestado;
    }

    
    const { count, rows} = await Colonias.findAndCountAll({ 
                    where,
                    limit:limiter,
                    offset:start    
                });
    
    res.json({
        status:0,
        message:'Colonias de México.',
        data:{count, rows}
    });
}

const getCodigoPostal = async(req, res = response) => {
    const {codigoPostal = ""} = req.body;    
    const colonias = await Colonias.findAll({ 
                    where:{codigopostal:codigoPostal},
                    include: [
                        {
                            model: Estados,
                            as: 'estado',  
                            attributes: ['nombre', 'codigoestado'],
                            required: false

                        }
                    ]
                });
        res.json({
            status:0,
            message:'Colonias de México.',
            data:colonias
        });
}

const getColoniaById = async (req, res = response) =>{
    const id = parseInt(req.params.id);
    const colonia = await Colonias.findOne({where:{codigocolonia:id}});
    res.json({
        status: 0,
        message: 'Colonia encontrada.',
        data: colonia
    });
}

module.exports = {
    getEstados,
    getMunicipios,
    getCiudades,
    getColonias,
    getCodigoPostal,
    getColoniaById
}