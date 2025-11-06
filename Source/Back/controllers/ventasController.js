const { response } = require('express');
const { Op } = require('sequelize');
const moment = require('moment');
const { dbConnection, dbSPConnection } = require('../database/config');
const { Cart } = require('../models/ventas/cart');
const CartDetail = require('../models/ventas/cartdetail');
const Ventas = require('../models/ventas/ventas');
const VentasDetalle = require('../models/ventas/ventasdetalle');
const Clientes = require('../models/clientes');
const Sucursales = require('../models/sucursales');
const CatTipoVenta = require('../models/ventas/catTipoVenta');
const Pagos = require('../models/ventas/pagos');
const MetodosPagoDetalle = require('../models/ventas/metodospagodetalle');

const { agruparCarrito, prorratearEnvases, validarPromociones } = require('../utils/ventasUtils');


const getLastCartUser = async (req, res = response) => {
    try {
        const { idUser, idSucursal, clienteGeneral = true } = req.params;
        const isClienteGeneral = clienteGeneral === 'true' || clienteGeneral === true;
        let where = { idUser, idSucursal };
        let idCliente = 1;
        if (isClienteGeneral) {
            where = { ...where, idCliente };
        } else {
            where = { ...where, idCliente: { [Op.ne]: 1 } };
        }
        const cart = await Cart.findOne({
            where,
            include: [
                {
                    model: CartDetail,
                    as: 'productos',
                    required: false
                },
                {
                    model: Clientes,
                    as: 'cliente',
                    required: false
                },
                {
                    model: CatTipoVenta,
                    as: 'tipoVenta',
                    required: false
                }
            ],
            order: [
                ['idcart', 'DESC'],
                [{ model: CartDetail, as: 'productos' }, 'idcartDetail', 'DESC']
            ]
        });

        if (cart) {
            res.json({
                status: 0,
                message: 'Obtener carrito usuario actual',
                data: cart
            });
        } else {
            res.json({
                status: 2,
                message: 'El carrito se encuentra vacio',
                data: cart
            });
        }

    } catch (error) {
        console.error('Error en getLastCartUser:', error);
        res.status(500).json({
            status: 1,
            message: 'Error al obtener el carrito',
            error: error.message
        });
    }
}

const createUpdateCart = async (req, res = response) => {
    const { idcart = 0, idUser, idCliente, idSucursal, productos, idTipoVenta } = req.body;
    let newCart = null;
    const t = await dbConnection.transaction();
    try {

        if (idcart === 0) {
            newCart = await Cart.create({
                createDate: new Date(),
                idUser,
                idCliente,
                idSucursal,
                idTipoVenta
            }, { transaction: t });
        }

        const cartId = newCart ? newCart.idcart : idcart;

        // Procesar cada producto
        for (const producto of productos) {
            // Buscar si el producto ya existe en el carrito
            const existingProduct = await CartDetail.findOne({
                where: {
                    idcart: cartId,
                    idProducto: producto.idProducto
                }
            });

            if (existingProduct) {
                // Si existe, actualizar sumando la cantidad
                await CartDetail.update(
                    {
                        cantidad: parseFloat(existingProduct.cantidad) + producto.cantidad
                    },
                    {
                        where: {
                            idcart: cartId,
                            idProducto: producto.idProducto
                        },
                        transaction: t
                    }
                );
            } else {
                // Si no existe, crear nuevo registro
                await CartDetail.create({
                    idcart: cartId,
                    sku: producto.sku,
                    idProducto: producto.idProducto,
                    descripcion: producto.descripcion,
                    cantidad: producto.cantidad,
                    precio: producto.precio
                }, { transaction: t });
            }
        }

        await t.commit();

        res.json({
            status: 0,
            message: 'Carrito creado exitosamente',
            data: newCart
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            status: 1,
            message: 'Error al crear el carrito',
            error: error.message
        });
    }


}

const deleteProductCart = async (req, res = response) => {
    const idcartDetail = req.params.id;
    const cartDetail = await CartDetail.destroy({ where: { idcartDetail } });

    res.json({
        status: 0,
        message: 'Carrito, producto eliminado con éxito.',
        data: cartDetail
    });
}

const updateQuantityProductCart = async (req, res = response) => {
    const { idcartDetail, cantidad } = req.body;
    const cartDetail = await CartDetail.update({ cantidad }, { where: { idcartDetail } });

    res.json({
        status: 0,
        message: 'Cantidad actualizada con éxito.',
        data: cartDetail
    });
}

const removeAllCart = async (req, res = response) => {
    const { idcart } = req.body;
    const t = await dbConnection.transaction();
    try {
        const cartDetail = await CartDetail.destroy({ where: { idcart } }, { transaction: t });
        const cart = await Cart.destroy({ where: { idcart } }, { transaction: t });
        await t.commit();
        res.json({
            status: 0,
            message: 'Carrito borrado con éxito.',
            data: true
        });

    } catch (error) {
        await t.rollback();
        res.status(500).json({
            status: 1,
            message: 'Error al borrar carrito',
            error: error.message
        });
    }

}

const registrarVenta = async (req, res = response) => {
    const { idcart, idUser, efectivo, tarjeta, idcajas= 2, transferencia, cambio, active = true, idTipoVenta = 0 } = req.body;
    let descuento = 0, subtotal = 0, iva = 0, total = 0;

    const t = await dbConnection.transaction();
    try {

        const cart = await Cart.findOne({ where: { idcart } });
        const cartDetail = cart ? await CartDetail.findAll({ where: { idcart } }) : [];
        if (cartDetail.length > 0) {
            // Calculate subtotal, IVA, and total
            subtotal = cartDetail.reduce((sum, item) => {
                return sum + (parseFloat(item.cantidad) * parseFloat(item.precio));
            }, 0);

            const oClient = await dbConnection.query(`CALL getClienteByID( ${ cart.idCliente } )`);
            console.log('oClient', oClient);

            // Calculate IVA (assuming 16% tax rate - adjust as needed)
            //iva = subtotal * 0.16;

            // Calculate total
            total = subtotal - descuento;

            const ventasCreate = await Ventas.create({
                idcart, createDate: new Date(), idUser, idcajas, descuento, subtotal, iva, total,
                idCliente: cart.idCliente, idSucursal: cart.idSucursal, active
                , idTipoVenta: idTipoVenta, idVendedor: oClient[0].idVendedor
            },
                { transaction: t });

            const ventasDetalleData = cartDetail.map(item => ({
                idventas: ventasCreate.idventas,
                sku: item.sku,
                idProducto: item.idProducto,
                descripcion: item.descripcion,
                cantidad: item.cantidad,
                precio: item.precio
            }));

            await VentasDetalle.bulkCreate(ventasDetalleData, { transaction: t });

            const metodopago = await MetodosPagoDetalle.create({
                efectivo: efectivo || 0,
                tarjeta: tarjeta || 0,
                transferencia: transferencia || 0,
                total: total
            }, { transaction: t });
            await Pagos.create({
                createDate: new Date(),
                idMetodosPagoDetalle: metodopago.idMetodosPagoDetalle,
                idventas: ventasCreate.idventas,
                idCreateUser: idUser,
                total: total
            }, { transaction: t });

            await CartDetail.destroy({ where: { idcart: cart.idcart }, transaction: t });
            await Cart.destroy({ where: { idcart: cart.idcart }, transaction: t });

            await t.commit();

            const ventas = await Ventas.findOne({
                where: { idventas: ventasCreate.idventas },
                include: [{ model: VentasDetalle, as: 'ventasdetalle' }]
            });

            res.json({
                status: 0,
                message: 'Venta registrada con éxito.',
                data: { ventas }
            });
        } else {
            res.json({
                status: 0,
                message: 'No hay productos para registrar',
                data: false
            });
        }
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            status: 1,
            message: 'Error al registrar Venta.',
            error: error.message
        });
    }


}

const getVentaById = async (req, res = response) => {
    const idventas = req.params.id;

    const ventas = await Ventas.findOne({
        where: { idventas },
        include: [{ model: VentasDetalle, as: 'ventasdetalle' }]
    });


    res.json({
        status: 0,
        message: 'Cantidad actualizada con éxito.',
        data: ventas
    });
}
const getAllVentas = async (req, res) => {
    const{ limiter = 1000, start = 0, search = ""} =req.body;
    try {
        const {count, rows } = await Ventas.findAndCountAll({
            distinct:true,
            include: [
                { model: VentasDetalle, as: 'ventasdetalle' },
                { model: Clientes, as: 'cliente' },
                { model: Sucursales, as: 'sucursal' },
            ],
            order: [
                ['idVenta', 'DESC']
            ],
            offset: parseInt(start),
            limit: parseInt(limiter)
        });

        res.json({
            status: 0,
            message: 'Obtener ventas paginadas.',
            data: {
                count,
                rows
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 1,
            message: 'Error al obtener las ventas.',
            data: null
        });

    }
}

const getTicketImprimir = async (req, res) => {
    const idVenta = req.params.id;
    const nombreImpresora = req.params.impresora;

    try {

        var oHeader = await dbConnection.query(
            `CALL getVentaByID( ${ idVenta } )`
        );
        oHeader = oHeader[0] || {};
        console.log('oHeaderRICKET', oHeader);

        // 1. Traer el detalle actual de la BD (por si es edición)
        var detalleActual = await dbConnection.query(
            `CALL getVentaDetalle( ${ idVenta }, ${ 1 } )`
        );
        console.log('detalleActual', detalleActual);

        var oMetodosPago = await dbConnection.query(
            `CALL getMetodoPagoBySale( ${ idVenta } )`
        );
        oMetodosPago = oMetodosPago[0] || {};
        console.log('oMetodosPago', oMetodosPago);

        // Format date
        const createDate = new Date(oHeader.createDate);
        const formattedDate = createDate.toISOString().replace('T', ' ').substring(0, 19);

        // Format products for table rows
        const rows = detalleActual.map(item => ({
            name: item.articuloName,
            quantity: parseFloat(item.cantidad).toFixed(2),
            price: `$${parseFloat(item.precioConDescuento).toFixed(2)}`,
            total: `$${(parseFloat(item.total)).toFixed(2)}`
        }));

        // Calculate totals
        const subtotal = parseFloat(oHeader.subtotal).toFixed(2);
        const iva = parseFloat(oHeader.iva).toFixed(2);
        const total = parseFloat(oHeader.total).toFixed(2);

        // // Determine payment method text
        let paymentMethod = [];
        if (parseFloat(oMetodosPago.efectivo) > 0) paymentMethod.push("Efectivo");
        if (parseFloat(oMetodosPago.tarjeta) > 0) paymentMethod.push("Tarjeta");
        if (parseFloat(oMetodosPago.transferencia) > 0) paymentMethod.push("Transferencia");
        const paymentMethodText = paymentMethod.join(", ") || "No especificado";

        // Create ticket format
        const ticketData = {
            "width": 227,
            "height": null,
            "printerName": nombreImpresora,
            "silent": true,
            "separators": {
                "afterHeader": true,
                "afterBody": true
            },
            "header": [
                {
                    "type": "image",
                    "imagePath": "./src/modules/printing/logo.png",
                    "fit": [180, 60],
                    "alignText": "center",
                    "moveDown": 1
                },
                {
                    "type": "text",
                    "text": "TICKET DE VENTA",
                    "fontSize": 12,
                    "fontFamily": "Helvetica",
                    "fontStyle": "Bold",
                    "alignText": "center"
                },
                {
                    "type": "text",
                    "text": `Sucursal: ${ ( oHeader.sucursalName || '' ) }`,
                    "fontSize": 8,
                    "fontFamily": "Helvetica",
                    "fontStyle": "Bold",
                    "alignText": "center"
                },
                {
                    "type": "text",
                    "text": `Fecha: ${formattedDate}`,
                    "fontSize": 8,
                    "alignText": "center",
                    "moveDown": 0.5
                },
                {
                    "type": "text",
                    "text": `Cliente: ${ oHeader.clienteName }`,
                    "fontSize": 8,
                    "alignText": "center",
                    "moveDown": 0.5
                }
            ],
            "body": [
                {
                    "type": "table",
                    "fontSize": 8,
                    "headerFontSize": 8,
                    "headerFontStyle": "Bold",
                    "columnWidths": [120, 30, 47, 47],  // Custom widths for each column
                    "columns": [
                        { "header": "PRODUCTO", "key": "name", "align": "left" },
                        { "header": "CANT", "key": "quantity", "align": "center" },
                        { "header": "PRECIO", "key": "price", "align": "right" },
                        { "header": "TOTAL", "key": "total", "align": "right" }
                    ],
                    "rows": rows,
                    "headerSpacing": 0.5,
                    "rowSpacing": 2,
                    "moveDown": 1
                },
                {
                    "type": "line",
                    "dashed": true,
                    "moveDown": 0.5
                },
                {
                    "type": "text",
                    "text": `SUBTOTAL: $${subtotal}`,
                    "fontSize": 8,
                    "fontStyle": "Bold",
                    "alignText": "right"
                },
                {
                    "type": "text",
                    "text": `IVA: $${iva}`,
                    "fontSize": 8,
                    "alignText": "right"
                },
                {
                    "type": "text",
                    "text": `TOTAL: $${total}`,
                    "fontSize": 10,
                    "fontStyle": "Bold",
                    "alignText": "right",
                    "moveDown": 1
                }
            ],
            "footer": [
                {
                    "type": "text",
                    "text": "Información de pago:",
                    "fontSize": 7,
                    "fontStyle": "Bold",
                    "alignText": "right"
                },
                {
                    "type": "text",
                    "text": `Método: ${paymentMethodText}`,
                    "fontSize": 7,
                    "alignText": "right"
                },
                {
                    "type": "text",
                    "text": `Folio: ${oHeader.idVenta}`,
                    "fontSize": 7,
                    "alignText": "right",
                    "moveDown": 1
                },
                {
                    "type": "text",
                    "text": "TÉRMINOS Y CONDICIONES:",
                    "fontSize": 6,
                    "fontStyle": "Bold",
                    "alignText": "center"
                },
                {
                    "type": "text",
                    "text": "Los productos adquiridos tienen garantía de 30 días. Para devoluciones es necesario presentar este ticket. No se aceptan devoluciones en productos en oferta.",
                    "fontSize": 6,
                    "alignText": "justify",
                    "moveDown": 1
                },
                {
                    "type": "text",
                    "text": "¡Gracias por su compra!",
                    "fontSize": 7,
                    "fontStyle": "Bold",
                    "alignText": "center"
                },
                {
                    "type": "text",
                    "text": "www.diprolim.com",
                    "fontSize": 6,
                    "alignText": "center"
                }
            ]
        };

        // // Add payment details if available
        if (parseFloat(oMetodosPago.efectivo) > 0) {
            ticketData.body.push({
                "type": "text",
                "text": `EFECTIVO: $${parseFloat(oMetodosPago.efectivo).toFixed(2)}`,
                "fontSize": 8,
                "alignText": "right"
            });
        }
        
        if (parseFloat(oMetodosPago.cambio) > 0) {
            ticketData.body.push({
                "type": "text",
                "text": `CAMBIO: $${parseFloat(oMetodosPago.cambio).toFixed(2)}`,
                "fontSize": 8,
                "alignText": "right"
            });
        }

        res.json({
            status: 0,
            message: 'Ticket generado con éxito',
            data: {
                ticketFormat: ticketData
            }
        });
    } catch (error) {
        console.error('Error al generar ticket:', error);
        res.status(500).json({
            status: 1,
            message: 'Error al generar el ticket',
            error: error.message
        });
    }
}

const agregarVentaDetalle = async (req, res) => {

    let {
        idType = 0
        , idVenta = 0
        , idCliente = 0
        , idSucursal = 0
        , idCaja = 0
        , idTipoVenta = 0
        , idVendedor = 0
        , idOrigenVendedor = 0
        , cantEnvases = 0
        , idClienteDiElect = 0

        , idVentaDetalle = 0
        , idProducto
        , bEnvase
        , cantidad

        , idUserLogON
    } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        // Si aún no hay pedido, crearlo y obtener idVenta
        if (idVenta == 0) {
            var oInsertUpdate = await connection.query(`CALL insertUpdateVenta(
                '${ oGetDateNow }'
                , ${ idVenta }
                , ${ idCliente }
                , ${ idSucursal }
                , ${ idCaja }
                , ${ idTipoVenta }
                , ${ idVendedor }
                , ${ idOrigenVendedor }
                , ${ cantEnvases == '' ? 0 : cantEnvases }
                , ${ idClienteDiElect }
                , ${ idUserLogON }
            )`);
            oInsertUpdate =  oInsertUpdate[0][0];

            if (oInsertUpdate.length == 0) {
                await connection.rollback();
                connection.release();
                return res.json({
                    status: 2,
                    message: 'No se pudo generar ID'
                });
            } else {
                idVenta = oInsertUpdate[0].out_id;
            }
        }

        var oAddDetail = await connection.query(`CALL agregarVentasDetalle(
            ${ idVenta }
            , ${ idVentaDetalle }
            , ${ idProducto }
            , ${ bEnvase }
            , '${ cantidad }'
            , ${ idType }
            )`);
        oAddDetail =  oAddDetail[0][0];

        if(oAddDetail.length == 0){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 2,
                message: 'No se pudo agregar el producto a la lista'
            });
        }
        else{
            idVentaDetalle = oAddDetail[0].out_id;

            await prorratearEnvasesPorVenta(idVenta, idUserLogON, connection);

            await promocionesApply(idVenta, idUserLogON, connection);

            await connection.commit();
            connection.release();

            return res.json({
                status: 0,
                message: 'Venta actualizada correctamente',
                insertID: idVenta,
                //data: toStore
            });
        
        }

    } catch (error) {
        await connection.rollback();
        connection.release();

        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getVentaDetalle = async (req, res) => {
    const { idVenta = 0, idUserLogON } = req.body;
    try {
        const result = await dbConnection.query(`CALL getVentaDetalle( ${ idVenta }, ${ idUserLogON } )`);
        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: result.length,
                rows: result
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getLastVentaByType = async (req, res) => {
    const { idType = 0, idCaja = 0, idUserLogON } = req.body;
    try {
        var result = await dbConnection.query(`CALL getLastVentaByType( ${ idType }, ${ idCaja } )`);
        console.log('result', result);
        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                idVenta: result[0].idVenta || 0,
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getVentaByID = async (req, res) => {
    const { idVenta } = req.body;
    try {
        var oVenta = await dbConnection.query(`CALL getVentaByID( ${ idVenta } )`);
        oVenta =  oVenta[0] || {};

        console.log('oVenta', oVenta);

        var oCliente = await dbConnection.query(`CALL getClienteByID( ${ oVenta.idClienteDiElect || 0 } )`);

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: oVenta || null,
            oCliente: oCliente[0] || null
        });
    } catch (error) {
        res.status(500).json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const insertUpdateVenta = async (req, res) => {
    let {
        idVenta = 0
        , idCliente = 0
        , idSucursal = 0
        , idCaja = 0
        , idTipoVenta = 0
        , idVendedor = 0
        , idOrigenVendedor = 0
        , cantEnvases = 0
        , idClienteDiElect = 0

        , idUserLogON
    } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        var oInsertUpdate = await connection.query(`CALL insertUpdateVenta(
            '${ oGetDateNow }'
            , ${ idVenta }
            , ${ idCliente }
            , ${ idSucursal }
            , ${ idCaja }
            , ${ idTipoVenta }
            , ${ idVendedor }
            , ${ idOrigenVendedor }
            , ${ cantEnvases == '' ? 0 : cantEnvases }
            , ${ idClienteDiElect }
            , ${ idUserLogON }
        )`);
        oInsertUpdate =  oInsertUpdate[0][0];

        if(oInsertUpdate[0].out_id > 0){
            idVenta = oInsertUpdate[0].out_id
            await prorratearEnvasesPorVenta(idVenta, idUserLogON, connection);
            await promocionesApply(idVenta, idUserLogON, connection);
        }

        await connection.commit();
        connection.release();

        return res.json({
            status: oInsertUpdate[0].out_id > 0 ? 0 : 1,
            message: oInsertUpdate[0].message,
            insertID: oInsertUpdate[0].out_id
        });

    } catch (error) {

        await connection.rollback();
        connection.release();

        return res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

async function prorratearEnvasesPorVenta(id, idUserLogON, connection) {

    var oHeader = await connection.query(
        `CALL getVentaByID( ${ id } )`
    );
    oHeader =  oHeader[0][0][0] || {};
    //console.log('oHeader', oHeader);

    var envasesList = await connection.query(
        `CALL getVentasEnvases( ${ id } )`
    );
    envasesList =  envasesList[0][0];

    // 1. Traer el detalle actual de la BD (por si es edición)
    var detalleActual = await connection.query(
        `CALL getVentaDetalle( ${ id }, ${ idUserLogON } )`
    );
    detalleActual =  detalleActual[0][0];

    // AGRUPO EL CARRITO PARA QUE NO SEA PROBLEMA LA DISTRIBUCIÓN
    detalleActual = agruparCarrito(detalleActual, 'idVentaDetalle');

    // LOS CLIENTES TIPO EMPRENDEDOR O PUNTO DE VENTA NO NECESITAN LA BANDERA DEL bCanEnvase
    var bAllbEnvase = oHeader.idTipoCliente == 3 || oHeader.idTipoCliente == 4;
    const { prorrateados } = prorratearEnvases(bAllbEnvase, detalleActual, envasesList, 'idVentaDetalle')
    //console.log('prorrateados', prorrateados);

    // 3. Generar JSONS separados
    const insertUpdateList = prorrateados.filter(p => p.bChange);

    // 4. Guardar cambios en la BD a través de un solo Store Procedure usando JSON
    if (insertUpdateList.length > 0) {
        await connection.query(
            `CALL syncVentaDetalle( ${ id }, '${ JSON.stringify(insertUpdateList) }')`
        );
    }
}

async function promocionesApply(id, idUserLogON, connection, bSinPromocion = false) {

    var oHeader = await connection.query(
        `CALL getVentaByID( ${ id } )`
    );
    oHeader =  oHeader[0][0][0] || {};
    //console.log('oHeader', oHeader);
    
    // 1. Traer el detalle actual de la BD (por si es edición)
    var detalleActual = await connection.query(
        `CALL getVentaDetalle(${ id }, ${idUserLogON})`
    );
    detalleActual =  detalleActual[0][0];
    //console.log('detalleActual', detalleActual);

    var oParam = {
        oHeader: {
            idCliente: oHeader.idCliente,
            idTipoCliente: oHeader.idTipoCliente,
            idTipoVenta: oHeader.idTipoVenta
        },
        productosList: detalleActual
    }
    //console.log('oParam', oParam);


    // El resultado puede venir anidado, ajusta si tu driver lo retorna distinto
    const { productosList } = await validarPromociones(oParam, 'idVentaDetalle', bSinPromocion);
    //console.log('productosList', productosList)

    await connection.query(
        `CALL updateVentaDetallePromos( ${ id }, '${ JSON.stringify(productosList) }')`
    );
}

const deleteVentaDetalle = async (req, res) => {
    const { idVentaDetalle, idVenta, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        if (!idVentaDetalle || idVentaDetalle <= 0) {
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'ID inválido'
            });
        }
        var result = await connection.query(`CALL deleteVentaDetalle(${idVentaDetalle})`);
        result =  result[0][0];

        await prorratearEnvasesPorVenta(idVenta, idUserLogON, connection);
        await promocionesApply(idVenta, idUserLogON, connection);

        await connection.commit();
        connection.release();

        return res.json({
            status: result[0].out_id > 0 ? 0 : 1,
            message: result[0].message
        });

    } catch (error) {

        await connection.rollback();
        connection.release();

        return res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const cerrarVenta = async (req, res) => {

    let {
        idVenta = 0
        , metodosPago

        , idUserLogON
    } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var oSQL = await connection.query(`CALL cerrarVenta(
                '${ oGetDateNow }'
                , ${ idVenta }
                , ${ metodosPago.efectivo == '' ? 0 : metodosPago.efectivo }
                , ${ metodosPago.recibido == '' ? 0 : metodosPago.recibido }
                , ${ metodosPago.cambio == '' ? 0 : metodosPago.cambio }
                , ${ metodosPago.tarjeta == '' ? 0 : metodosPago.tarjeta }
                , '${ metodosPago.referenciaTarjeta || '' }'
                , ${ metodosPago.transferencia == '' ? 0 : metodosPago.transferencia }
                , '${ metodosPago.referenciaTransferencia || '' }'
                , '${ metodosPago.fechaTransferencia ? metodosPago.fechaTransferencia.substring(0, 10) : null }'

                , ${ metodosPago.cheque == '' ? 0 : metodosPago.cheque }
                , '${ metodosPago.fechaDeposito ? metodosPago.fechaDeposito.substring(0, 10) : null }'
                , ${ metodosPago.dineroElectronico == '' ? 0 : metodosPago.dineroElectronico }
                
                , ${ idUserLogON }
            )`);

        // El resultado es un array de arrays, toma el primer registro
        oSQL = oSQL[0][0][0];
        console.log('Resultado del SP:', oSQL);

        if (oSQL.out_id === 1) {
            await connection.commit();
            connection.release();
            res.json({
                status: 0,
                message: oSQL.message,
                data: oSQL
            });
        } else {
            await connection.rollback();
            connection.release();
            res.json({
                status: 1,
                message: oSQL.message,
                data: oSQL
            });
        }

    } catch (error) {
        await connection.rollback();
        connection.release();

        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const convertirPedidoAVenta = async (req, res) => {

    let {
        idPedido = 0
        , idCaja = 0

        , idUserLogON
    } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

        var oSQL = await connection.query(`CALL convertirPedidoAVenta(
                '${ oGetDateNow }'
                , ${ idPedido }
                , ${ idCaja }
                
                , ${ idUserLogON }
            )`);

        // El resultado es un array de arrays, toma el primer registro
        oSQL = oSQL[0][0][0];
        console.log('Resultado del SP:', oSQL);

        if (oSQL.idVenta > 0) {
            await connection.commit();
            connection.release();
            res.json({
                status: 0,
                message: oSQL.message,
                data: oSQL
            });
        } else {
            await connection.rollback();
            connection.release();
            res.json({
                status: 1,
                message: oSQL.message,
                data: oSQL
            });
        }

    } catch (error) {
        await connection.rollback();
        connection.release();

        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getArticulosParaVenta = async (req, res) => {
    const {
        idSucursal = 0,
        search = '',
        limiter = 10,
        start = 0,
        idUserLogON
    } = req.body;
    try {

        if(!idSucursal){
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        const result = await dbConnection.query(`CALL getArticulosParaVenta(
            ${ idSucursal },
            '${ search }',
            ${ start },
            ${ limiter },
            ${ idUserLogON }
        )`);
        const iRows = result.length > 0 ? result[0].iRows: 0;
        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result
            }
        });
    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: { error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...error // incluye otros campos si existen
        } }
        });
    }
};

const getFormasDePagoPorVenta = async (req, res) => {
    const {
        idVenta = 0
    } = req.body;
    try {
        var oSQL = await dbConnection.query(`CALL getFormasDePagoPorVenta(
            ${ idVenta }
        )`);
        
        if(oSQL.length == 0){
            res.json({
                status: 0,
                message: "No se encontró la información.",
                data: null
            });
        }
        else{
            res.json({
                status: 0,
                message: "Ejecutado correctamente.",
                data: oSQL[0]
            });
        }
    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: { error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...error // incluye otros campos si existen
        } }
        });
    }
};

const regresarPedido = async (req, res) => {

    let {
        idPedido = 0
        , idVenta = 0

        , idUserLogON
    } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');
                
        var oSQL = await connection.query(`CALL regresarPedido(
                '${ oGetDateNow }'
                , ${ idPedido }
                , ${ idVenta }
                
                , ${ idUserLogON }
            )`);
        oSQL = oSQL[0][0];

        if(oSQL[0].out_id == 0){
            await connection.rollback();
            connection.release();
        }else{
            await connection.commit();
            connection.release();
        }

        return res.json({
            status: oSQL[0].out_id > 0 ? 0 : 1,
            message: oSQL[0].message,
            data: oSQL[0] || null
        });

    } catch (error) {
        await connection.rollback();
        connection.release();

        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const getCajaByID = async (req, res) => {
    const {
        idCaja = 0,
        idUserLogON
    } = req.body;
    try {

        if(!idCaja){
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        var result = await dbConnection.query(`CALL getCajaByID(
            ${ idCaja }
        )`);

        
        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: result[0] || null
        });

    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: { error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...error // incluye otros campos si existen
        } }
        });
    }
};

const cancelarVenta = async (req, res) => {

    let {
        idPedido = 0
        , idVenta = 0

        , idUserLogON
    } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');
                
        var oSQL = await connection.query(`CALL cancelarVenta(
                '${ oGetDateNow }'
                , ${ idVenta }
                
                , ${ idUserLogON }
            )`);
        oSQL = oSQL[0][0];

        if(oSQL[0].out_id == 0){
            await connection.rollback();
            connection.release();
        }else{
            await connection.commit();
            connection.release();
        }

        return res.json({
            status: oSQL[0].out_id > 0 ? 0 : 1,
            message: oSQL[0].message,
            data: oSQL[0] || null
        });

    } catch (error) {
        await connection.rollback();
        connection.release();

        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const updateIdClienteDiElect = async (req, res) => {

    let {
        idVenta = 0
        , idClienteDiElect = 0

        , idUserLogON
    } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {
        var oSQL = await connection.query(`CALL updateIdClienteDiElect(
                ${ idVenta }
                , ${ idClienteDiElect }
                
            )`);
        oSQL = oSQL[0][0];

        if(oSQL[0].out_id == 0){
            await connection.rollback();
            connection.release();
        }else{
            await connection.commit();
            connection.release();
        }

        return res.json({
            status: oSQL[0].out_id > 0 ? 0 : 1,
            message: oSQL[0].message,
            data: oSQL[0] || null
        });

    } catch (error) {
        await connection.rollback();
        connection.release();

        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

const quitarPromosiones = async (req, res) => {
    const { idVenta, idUserLogON } = req.body;

    const connection = await dbSPConnection.getConnection();
    await connection.beginTransaction();

    try {

        if(!(idVenta > 0 )){
            await connection.rollback();
            connection.release();
            return res.json({
                status: 1,
                message: 'Parametros incorrectos'
            });
        }

        await promocionesApply(idVenta, idUserLogON, connection, bSinPromocion = true);

        await connection.commit();
        connection.release();

        return res.json({
            status: 0,
            message: 'Se han quitado las promociones correctamente'
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        return res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

module.exports = {
    getLastCartUser,
    createUpdateCart,
    updateQuantityProductCart,
    deleteProductCart,
    removeAllCart,
    registrarVenta,
    getVentaById,
    getAllVentas,
    getTicketImprimir

    , agregarVentaDetalle
    , getVentaDetalle
    , getLastVentaByType
    , getVentaByID
    , insertUpdateVenta
    , deleteVentaDetalle
    , cerrarVenta
    , convertirPedidoAVenta
    , getArticulosParaVenta
    , getFormasDePagoPorVenta
    , regresarPedido
    , getCajaByID
    , cancelarVenta
    , updateIdClienteDiElect
    , quitarPromosiones
}