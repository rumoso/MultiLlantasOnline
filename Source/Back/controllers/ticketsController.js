const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection, dbSPConnection } = require('../database/config');

const printVentaTickeyt = async(req, res = response) => {

    const {
        idVenta = 0
    } = req.body;

    try{

        var OSQL = await dbConnection.query(`call getUsersListWithPage('${ search }',${ start },${ limiter })`)

        if(OSQL.length == 0){

            res.json({
                status:0,
                message:"Ejecutado correctamente.",
                data:{
                count: 0,
                rows: null
                }
            });

        }
        else{

            const iRows = ( OSQL.length > 0 ? OSQL[0].iRows: 0 );
            
            res.json({
                status: 0,
                message: "Ejecutado correctamente.",
                data:{
                    count: iRows,
                    rows: OSQL
                }
            });
            
        }
        
    }catch(error){
      
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

const printVentaTicket = async (req, res = response) => {
    const { idVenta = 0, configLocal, idUserLogON } = req.body;

    try {

        var _oVenta = await dbConnection.query(
            `CALL getVentaByID( ${ idVenta } )`
        );
        _oVenta =  _oVenta[0] || {};

        var oClienteDiElect = await dbConnection.query(`call getClienteByID( ${ _oVenta.idClienteDiElect } )`);
        oClienteDiElect =  oClienteDiElect[0] || {};
        
        var _oVentaDetalle = await dbConnection.query(
            `CALL getVentaDetalle(${ idVenta }, ${idUserLogON})`
        );
        _oVentaDetalle =  _oVentaDetalle || [];

        var _oFormasPago = await dbConnection.query(`CALL getFormasDePagoPorVenta(
            ${ idVenta }
        )`);
        _oFormasPago =  _oFormasPago[0] || {};

        var _oInfoTicket = await dbConnection.query(`call getImpresoraTicketsData(${ _oVenta.idSucursal })`)
        _oInfoTicket = _oInfoTicket[0] || {};

        // Aquí debes hacer las consultas reales a la base de datos y asignar los valores a las variables de arriba

        let oLinesP = [];
        let oLines = [];
        let oLine;

        // Imagen/logo en base64
        oLines = [];
        oLine = { bImage: true, base64Image: imgBase64, iHeight: 50, ticketWidth: 32 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        // Encabezado
        oLines = [];
        oLine = { text: _oInfoTicket.nombrenegocio, aling: "Center", size: 10, style: "Bold", type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: "RFC: " + _oInfoTicket.rfc, aling: "Center", size: 8, type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: _oInfoTicket.direccion, aling: "Center", size: 8, type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: _oInfoTicket.telefono, aling: "Center", size: 8, type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: 'Folio: #' + _oVenta.idVenta, aling: "left", size: 8, type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: _oVenta.createDateDate + ' ' + _oVenta.createDateHours, aling: "left", size: 8, type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: "---------------------------------------------------------------------", aling: "Center", size: 8, type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        // Encabezado de tabla de productos
        oLines = [];
        oLines.push({ text: "DESCRIPCIÓN", aling: "Left", size: 5, style: "Bold", type: "Helvetica", iWith: 42 });
        oLines.push({ text: "CANT", aling: "Center", size: 5, style: "Bold", type: "Helvetica", iWith: 10 });
        oLines.push({ text: "PRECIO", aling: "Right", size: 5, style: "Bold", type: "Helvetica", iWith: 23 });
        oLines.push({ text: "IMPORTE", aling: "Right", size: 5, style: "Bold", type: "Helvetica", iWith: 25 });
        oLinesP.push({ oLines });

        // Ciclo para los productos de la venta
        for (const prod of _oVentaDetalle) {
            oLines = [];
            oLines.push({ text: (prod.articuloName || '').replace(/^[^-]+-\d+-/, '') + (prod.promoName && prod.promoName.length > 0 ? ' ' + prod.promoName : ''), aling: "Left", size: 8, type: "Helvetica", iWith: 42 });
            oLines.push({ text: prod.cantidad ? prod.cantidad.toString() : '1', aling: "Center", size: 8, type: "Helvetica", iWith: 10 });
            oLines.push({ text: formatMoney(prod.precioUnitario), aling: "Right", size: 8, type: "Helvetica", iWith: 23 });
            oLines.push({ text: formatMoney(prod.precioUnitario * prod.cantidad), aling: "Right", size: 8, type: "Helvetica", iWith: 25 });
            oLinesP.push({ oLines });
        }

        // Separador
        oLines = [];
        oLine = { text: "---------------------------------------------------------------------", aling: "Center", size: 8, type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        // Subtotal
        oLines = [];
        oLines.push({ text: "SUBTOTAL:", aling: "Right", size: 8, type: "Helvetica", iWith: 75 });
        oLines.push({ text: formatMoney(_oVenta.subtotal), aling: "Right", size: 8, type: "Helvetica", iWith: 25 });
        oLinesP.push({ oLines });

        oLines = [];
        oLines.push({ text: "DESCUENTO:", aling: "Right", size: 8, type: "Helvetica", iWith: 75 });
        oLines.push({ text: formatMoney(_oVenta.descuento), aling: "Right", size: 8, type: "Helvetica", iWith: 25 });
        oLinesP.push({ oLines });

        // Total
        oLines = [];
        oLines.push({ text: "TOTAL:", aling: "Right", size: 8, type: "Helvetica", iWith: 75 });
        oLines.push({ text: formatMoney(_oVenta.total), aling: "Right", size: 8, type: "Helvetica", iWith: 25 });
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: 'PRECIOS CON IVA INCLUIDO', aling: "Center", size: 10, style: "Bold", type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        // Formas de pago
        oLines = [];
        oLines.push({ text: "FORMA DE PAGO", aling: "Left", size: 8, style: "Bold", type: "Helvetica", iWith: 100 });
        oLinesP.push({ oLines });

        // Efectivo
        if (Number(_oFormasPago.efectivo) > 0) {
            oLines = [];
            oLines.push({
                text: `Efectivo: ${formatMoney(_oFormasPago.recibido)}  Cambio: ${formatMoney(_oFormasPago.cambio)}`,
                aling: "Left", size: 8, type: "Helvetica", iWith: 100
            });
            oLinesP.push({ oLines });
        }

        // Tarjeta
        if (Number(_oFormasPago.tarjeta) > 0) {
            oLines = [];
            oLines.push({
                text: `Tarjeta: ${formatMoney(_oFormasPago.tarjeta)}`,
                aling: "Left", size: 8, type: "Helvetica", iWith: 100
            });
            oLinesP.push({ oLines });
        }

        // Transferencia
        if (Number(_oFormasPago.transferencia) > 0) {
            oLines = [];
            oLines.push({
                text: `Transferencia: ${formatMoney(_oFormasPago.transferencia)}`,
                aling: "Left", size: 8, type: "Helvetica", iWith: 100
            });
            oLinesP.push({ oLines });
        }

        // Cheque
        if (Number(_oFormasPago.cheque) > 0) {
            oLines = [];
            oLines.push({
                text: `Cheque: ${formatMoney(_oFormasPago.cheque)}`,
                aling: "Left", size: 8, type: "Helvetica", iWith: 100
            });
            oLinesP.push({ oLines });
        }

        // dineroElectronico
        if (Number(_oFormasPago.dineroElectronico) > 0) {
            oLines = [];
            oLines.push({
                text: `Dinero Electrónico: ${formatMoney(_oFormasPago.dineroElectronico)}`,
                aling: "Left", size: 8, type: "Helvetica", iWith: 100
            });
            oLinesP.push({ oLines });
        }

        if(oClienteDiElect.idCliente > 0){
            oLines = [];
            oLine = { text: " ", aling: "Center", size: 8, type: "Helvetica", iWith: 100 };
            oLines.push(oLine);
            oLinesP.push({ oLines });

            oLines = [];
            oLine = { text: oClienteDiElect.nombre, aling: "Center", size: 10, style: "Bold", type: "Helvetica", iWith: 100 };
            oLines.push(oLine);
            oLinesP.push({ oLines });

            oLines = [];
            oLine = { text: "Dinero electrónico acumulado", aling: "Center", size: 10, style: "Bold", type: "Helvetica", iWith: 100 };
            oLines.push(oLine);
            oLinesP.push({ oLines });

            oLines = [];
            oLine = { text: formatMoney( oClienteDiElect.montoDiElect ), aling: "Center", size: 10, style: "Bold", type: "Helvetica", iWith: 100 };
            oLines.push(oLine);
            oLinesP.push({ oLines });
        }

        // QR Code
        oLines = [];
        oLine = { text: " ", aling: "Center", size: 8, type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: "Escanea el código y comparte tu experiencia", aling: "Center", size: 10, style: "Bold", type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { bImage: true, base64Image: imgQRBase64, posX: 100, iHeight: 100, colWith: 100, ticketWidth: 500 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: " ", aling: "Center", size: 8, type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: "Tu opinión es importante y confidencial", aling: "Center", size: 10, style: "Bold", type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });
        // *****************************************************************************************************

        oLines = [];
        oLine = { text: " ", aling: "Center", size: 8, type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        // Footer
        oLines = [];
        oLine = { text: _oInfoTicket.agradecimiento, aling: "Center", size: 10, style: "Bold", type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        oLines = [];
        oLine = { text: _oInfoTicket.infoadicional, aling: "Center", size: 10, style: "Bold", type: "Helvetica", iWith: 100 };
        oLines.push(oLine);
        oLinesP.push({ oLines });

        const oPrintP = {
            oPrinter: {
                printerName: configLocal.defaultPrinter,
                maxWidth: configLocal.maxWidth || 280, // Ancho máximo de impresión
                maxMargen: configLocal.maxMargen || 100, // Margen máximo
                sBarCode: ""
            },
            oLinesP
        };

        // Aquí puedes enviar el JSON al frontend o imprimirlo desde el backend
        res.json({
            status: 0,
            message: "Ticket generado correctamente.",
            data: oPrintP
        });

    } catch (error) {
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};

function formatMoney(value) {
    return '$' + (Number(value) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const printPruebaTicket = async (req, res = response) => {
    const { configLocal, idUserLogON } = req.body;

    try {

        var _oInfoTicket = await dbConnection.query(`call getImpresoraTicketsData( ${ configLocal.idSucursal } )`)
        _oInfoTicket = _oInfoTicket[0] || {};

        // Aquí debes hacer las consultas reales a la base de datos y asignar los valores a las variables de arriba

        let oLinesP = [
        {
            oLines: [{ bImage: true, base64Image: imgBase64, iHeight: 50, ticketWidth: 32 }]
        },
        {
            oLines: [
                {
                    text: _oInfoTicket.nombrenegocio,
                    aling: "Center",
                    size: 10,
                    style: "Bold",
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: "RFC: " + _oInfoTicket.rfc,
                    aling: "Center",
                    size: 8,
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: _oInfoTicket.direccion,
                    aling: "Center",
                    size: 8,
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: _oInfoTicket.telefono,
                    aling: "Center",
                    size: 8,
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: "Folio: #143",
                    aling: "left",
                    size: 8,
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: "18-08-2025 10:05:25 AM",
                    aling: "left",
                    size: 8,
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: "---------------------------------------------------------------------",
                    aling: "Center",
                    size: 8,
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: "DESCRIPCIÓN",
                    aling: "Left",
                    size: 5,
                    style: "Bold",
                    type: "Helvetica",
                    iWith: 42
                },
                {
                    text: "CANT",
                    aling: "Center",
                    size: 5,
                    style: "Bold",
                    type: "Helvetica",
                    iWith: 10
                },
                {
                    text: "PRECIO",
                    aling: "Right",
                    size: 5,
                    style: "Bold",
                    type: "Helvetica",
                    iWith: 23
                },
                {
                    text: "IMPORTE",
                    aling: "Right",
                    size: 5,
                    style: "Bold",
                    type: "Helvetica",
                    iWith: 25
                }
            ]
        },
        {
            oLines: [
                {
                    text: "Botella con atomizador 1 PZ",
                    aling: "Left",
                    size: 8,
                    type: "Helvetica",
                    iWith: 42
                },
                {
                    text: "1",
                    aling: "Center",
                    size: 8,
                    type: "Helvetica",
                    iWith: 10
                },
                {
                    text: "$35.00",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 23
                },
                {
                    text: "$35.00",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 25
                }
            ]
        },
        {
            oLines: [
                {
                    text: "Botella con atomizador uso rudo 1 PZ",
                    aling: "Left",
                    size: 8,
                    type: "Helvetica",
                    iWith: 42
                },
                {
                    text: "2",
                    aling: "Center",
                    size: 8,
                    type: "Helvetica",
                    iWith: 10
                },
                {
                    text: "$45.00",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 23
                },
                {
                    text: "$90.00",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 25
                }
            ]
        },
        {
            oLines: [
                {
                    text: "Trapeador de aceite mediano 1 PZ",
                    aling: "Left",
                    size: 8,
                    type: "Helvetica",
                    iWith: 42
                },
                {
                    text: "2",
                    aling: "Center",
                    size: 8,
                    type: "Helvetica",
                    iWith: 10
                },
                {
                    text: "$55.00",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 23
                },
                {
                    text: "$110.00",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 25
                }
            ]
        },
        {
            oLines: [
                {
                    text: "---------------------------------------------------------------------",
                    aling: "Center",
                    size: 8,
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: "SUBTOTAL:",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 75
                },
                {
                    text: "$235.00",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 25
                }
            ]
        },
        {
            oLines: [
                {
                    text: "DESCUENTO:",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 75
                },
                {
                    text: "$0.00",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 25
                }
            ]
        },
        {
            oLines: [
                {
                    text: "TOTAL:",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 75
                },
                {
                    text: "$235.00",
                    aling: "Right",
                    size: 8,
                    type: "Helvetica",
                    iWith: 25
                }
            ]
        },
        {
            oLines: [
                {
                    text: "PRECIOS CON IVA INCLUIDO",
                    aling: "Center",
                    size: 10,
                    style: "Bold",
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: "FORMA DE PAGO",
                    aling: "Left",
                    size: 8,
                    style: "Bold",
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: " ",
                    aling: "Center",
                    size: 8,
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [{ bImage: true, base64Image: imgQRBase64, posX: 100, iHeight: 100, colWith: 100, ticketWidth: 500 }]
        },
        {
            oLines: [
                {
                    text: " ",
                    aling: "Center",
                    size: 8,
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: "Gracias por su compra",
                    aling: "Center",
                    size: 10,
                    style: "Bold",
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        },
        {
            oLines: [
                {
                    text: "www.facebook.com/diprolim",
                    aling: "Center",
                    size: 10,
                    style: "Bold",
                    type: "Helvetica",
                    iWith: 100
                }
            ]
        }
    ];

        const oPrintP = {
            oPrinter: {
                printerName: configLocal.defaultPrinter,
                maxWidth: configLocal.maxWidth || 280, // Ancho máximo de impresión
                maxMargen: configLocal.maxMargen || 100, // Margen máximo
                sBarCode: ""
            },
            oLinesP
        };

        // Aquí puedes enviar el JSON al frontend o imprimirlo desde el backend
        res.json({
            status: 0,
            message: "Ticket generado correctamente.",
            data: oPrintP
        });

    } catch (error) {
        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
};


module.exports = {
    
    printVentaTicket
    , printPruebaTicket

};
const imgQRBase64 = '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';
const imgBase64 = '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'; // tu imagen



