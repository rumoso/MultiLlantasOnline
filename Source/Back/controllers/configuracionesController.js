const { response } = require('express');
const { Op } = require('sequelize');
const { dbConnection } = require('../database/config');


const ImpresoraTickets = require('../models/configuraciones/impresoratickets');

const getInfoTicketByIdSucursal = async (req, res) => {
    const idSucursal = req.params.id;

    try {
        const impresoraTicket = await ImpresoraTickets.findOne({ where: { idSucursal } });

        if (!impresoraTicket) {
            return res.status(400).json({
                status: 1,
                message: 'Impresora no encontrada para la sucursal proporcionada.',
            });
        }

        res.json({
            status: 0,
            message: 'Información para impresora de ticket.',
            data: impresoraTicket
        });
    } catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }

   
};

const guardarInformacionTicket = async (req, res) => {
    const { idimpresoratickets = 0, nombrenegocio, razonsocial, rfc, direccion, telefono, agradecimiento, infoadicional, 
        idSucursal } = req.body;
    let impresoraTicket = null;            
    try{

        if( idimpresoratickets === 0){
            impresoraTicket = await ImpresoraTickets.create({ nombrenegocio, razonsocial, rfc, direccion, telefono, 
                agradecimiento, infoadicional, idSucursal });
        }
        else{
            const existeImpresora = await ImpresoraTickets.findOne({ where: { idimpresoratickets } });

            if( !existeImpresora ){
                return res.status(400).json({
                    status: 1,
                    message: 'Configuración de impresora no encontrada.',
                    data: null
                  });
            }

            impresoraTicket = await ImpresoraTickets.update({nombrenegocio, razonsocial, rfc, direccion, telefono,
                                    agradecimiento, infoadicional, idSucursal }, { where: { idimpresoratickets } });
        }
        

        return res.json({
            status: 0,
            message: 'Información para impresora actualizada correctamente.',
            data: impresoraTicket
            });


    }catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

module.exports = {
    getInfoTicketByIdSucursal,
    guardarInformacionTicket
  };
