const { response } = require('express');
const { Sequelize, Op, col, fn } = require('sequelize');
const { dbConnection } = require('../database/config');
const { formatearFechaFinTurno, formatearFechaHora, formatoCompactoASQL } = require('../helpers/funciones');
const moment = require('moment');

// Importar las asociaciones
require('../models/cortescaja/asociaciones');
require('../models/cajas/asociacionesCajas');
const Cajas = require('../models/cajas/cajas');
const Sucursales = require('../models/sucursales'); // Importar Sucursales aquí
const TurnosCaja = require('../models/cortescaja/turnoscaja');
const Cortescaja = require('../models/cortescaja/cortescaja');
const User = require('../models/user');
const Ventas = require('../models/ventas/ventas');
const MetodosPagoDetalle = require('../models/ventas/metodospagodetalle');
const Pagos = require('../models/ventas/pagos');
const OrdenCompra = require('../models/compras/ordencompra');
const MovimientosCaja = require('../models/cajas/movimientoscaja');

const VENTA_CONTADO = 1;
const VENTA_CREDITO = 2;

const obtenerCorteCajaIndividual = async (req, res = response) => {
    const { idcajas } = req.params;

    try {
        const corteCaja = await Cortescaja.findOne({
            where: {
                idcajas,
                estatus: 'ABIERTO' // Solo obtener cortes abiertos
            }
        });

        if (!corteCaja) {
            return res.status(404).json({
                status: 0,
                message: 'Corte de caja no encontrado',
                data: null
            });
        }

        // Calcular la fecha inicial del corte en formato compacto yyyyMMddHHmmss
        const fechaInicial = formatearFechaHora(corteCaja.fecha, corteCaja.horaapertura);
        
        // Obtener el total de ventas desde la apertura del corte
        const totalVentas = await Ventas.sum('total', {
            where: {
                idCaja: idcajas,
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.col('createDate'), '%Y%m%d%H%i%s'),
                        Op.gte,
                        fechaInicial
                    )
                ],
                active: 1 // Solo ventas activas
            }
        }) || 0;

        // Obtener totales por tipo de venta
        const totalVentasContado = await Ventas.sum('total', {
            where: {
                idCaja: idcajas,
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.col('createDate'), '%Y%m%d%H%i%s'),
                        Op.gte,
                        fechaInicial
                    )
                ],
                idTipoVenta: VENTA_CONTADO,
                active: 1
            }
        }) || 0;

        const totalVentasCredito = await Ventas.sum('total', {
            where: {
                idCaja: idcajas,
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.col('createDate'), '%Y%m%d%H%i%s'),
                        Op.gte,
                        fechaInicial
                    )
                ],
                idTipoVenta: VENTA_CREDITO,
                active: 1
            }
        }) || 0;

        // Obtener desglose por métodos de pago
        const [ventasPorMetodo] = await dbConnection.query(`
            SELECT 
                COALESCE(SUM(mpd.efectivo), 0) as totalEfectivo,
                COALESCE(SUM(mpd.tarjeta), 0) as totalTarjeta,
                COALESCE(SUM(mpd.transferencia), 0) as totalTransferencia,
                COALESCE(SUM(mpd.cheque), 0) as totalCheque,
                COALESCE(SUM(mpd.dineroElectronico), 0) as totalDineroElectronico
            FROM metodos_pago_detalle mpd
            INNER JOIN pagos p ON mpd.idMetodosPagoDetalle = p.idMetodosPagoDetalle
            INNER JOIN ventas v ON p.idVenta = v.idVenta
            WHERE DATE_FORMAT(p.createDate, '%Y%m%d%H%i%s') >= :fechaInicial
            AND v.idCaja = :idcajas
            AND v.active = 1
        `, {
            replacements: { 
                fechaInicial: fechaInicial,
                idcajas: idcajas
            },
            type: Sequelize.QueryTypes.SELECT
        });

        // Obtener desglose por métodos de pago solo para ventas de CONTADO (idTipoVenta = 1)
        const [ventasPorMetodoContado] = await dbConnection.query(`
            SELECT 
                COALESCE(SUM(mpd.efectivo), 0) as totalEfectivo,
                COALESCE(SUM(mpd.tarjeta), 0) as totalTarjeta,
                COALESCE(SUM(mpd.transferencia), 0) as totalTransferencia,
                COALESCE(SUM(mpd.cheque), 0) as totalCheque,
                COALESCE(SUM(mpd.dineroElectronico), 0) as totalDineroElectronico
            FROM metodos_pago_detalle mpd
            INNER JOIN pagos p ON mpd.idMetodosPagoDetalle = p.idMetodosPagoDetalle
            INNER JOIN ventas v ON p.idVenta = v.idVenta
            WHERE DATE_FORMAT(p.createDate, '%Y%m%d%H%i%s') >= :fechaInicial
            AND v.idCaja = :idcajas
            AND v.idTipoVenta = 1
            AND v.active = 1
        `, {
            replacements: { 
                fechaInicial: fechaInicial,
                idcajas: idcajas
            },
            type: Sequelize.QueryTypes.SELECT
        });

        // Obtener desglose por métodos de pago solo para ventas de CREDITO (idTipoVenta = 2)
        const [ventasPorMetodoCredito] = await dbConnection.query(`
            SELECT 
                COALESCE(SUM(mpd.efectivo), 0) as totalEfectivo,
                COALESCE(SUM(mpd.tarjeta), 0) as totalTarjeta,
                COALESCE(SUM(mpd.transferencia), 0) as totalTransferencia,
                COALESCE(SUM(mpd.cheque), 0) as totalCheque,
                COALESCE(SUM(mpd.dineroElectronico), 0) as totalDineroElectronico
            FROM metodos_pago_detalle mpd
            INNER JOIN pagos p ON mpd.idMetodosPagoDetalle = p.idMetodosPagoDetalle
            INNER JOIN ventas v ON p.idVenta = v.idVenta
            WHERE DATE_FORMAT(p.createDate, '%Y%m%d%H%i%s') >= :fechaInicial
            AND v.idCaja = :idcajas
            AND v.idTipoVenta = 2
            AND v.active = 1
        `, {
            replacements: { 
                fechaInicial: fechaInicial,
                idcajas: idcajas
            },
            type: Sequelize.QueryTypes.SELECT
        });

        // Obtener el total de órdenes de compra (gastos) desde la apertura del corte
        const totalOrdenesCompra = 0;
        // await OrdenCompra.sum('costoTotal', {
        //     where: {
        //         createDate: {
        //             [Op.gte]: fechaInicial
        //         },
        //         active: 1 // Solo órdenes activas
        //     }
        // }) || 0;

        // Obtener el ID de la forma de pago de efectivo
        const [formaEfectivo] = await dbConnection.query(`
            SELECT idformaspago 
            FROM formas_pago 
            WHERE LOWER(descripcion) LIKE '%efectivo%' 
            OR LOWER(descripcion) LIKE '%cash%'
            LIMIT 1
        `, {
            type: Sequelize.QueryTypes.SELECT
        });

        const idFormaEfectivo = formaEfectivo ? formaEfectivo.idformaspago : 1; // Default a 1 si no se encuentra

        // Obtener movimientos de caja en efectivo (ingresos y egresos) desde la apertura del corte
        const totalIngresosCajaEfectivo = await MovimientosCaja.sum('monto', {
            where: {
                idcajas: idcajas,
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha'), '%Y%m%d%H%i%s'),
                        Op.gte,
                        fechaInicial
                    )
                ],
                tipo: 'INGRESO',
                idformaspago: idFormaEfectivo
            }
        }) || 0;

        const totalEgresosCajaEfectivo = await MovimientosCaja.sum('monto', {
            where: {
                idcajas: idcajas,
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha'), '%Y%m%d%H%i%s'),
                        Op.gte,
                        fechaInicial
                    )
                ],
                tipo: 'EGRESO',
                idformaspago: idFormaEfectivo
            }
        }) || 0;

        // Obtener movimientos de caja (ingresos y egresos) desde la apertura del corte
        const totalIngresosCaja = await MovimientosCaja.sum('monto', {
            where: {
                idcajas: idcajas,
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha'), '%Y%m%d%H%i%s'),
                        Op.gte,
                        fechaInicial
                    )
                ],
                tipo: 'INGRESO'
            }
        }) || 0;

        const totalEgresosCaja = await MovimientosCaja.sum('monto', {
            where: {
                idcajas: idcajas,
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.col('fecha'), '%Y%m%d%H%i%s'),
                        Op.gte,
                        fechaInicial
                    )
                ],
                tipo: 'EGRESO'
            }
        }) || 0;

        // Obtener desglose de movimientos de caja por forma de pago
        const resultadoMovimientos = await dbConnection.query(`
            SELECT 
                fp.descripcion as formaPago,
                mc.tipo,
                COALESCE(SUM(mc.monto), 0) as total
            FROM movimientos_caja mc
            LEFT JOIN formas_pago fp ON mc.idformaspago = fp.idformaspago
            WHERE mc.idcajas = :idcajas
            AND DATE_FORMAT(mc.fecha, '%Y%m%d%H%i%s') >= :fechaInicial
            GROUP BY fp.descripcion, mc.tipo
            ORDER BY mc.tipo, fp.descripcion
        `, {
            replacements: { 
                fechaInicial: fechaInicial,
                idcajas: idcajas
            },
            type: Sequelize.QueryTypes.SELECT
        });

        // Extraer los datos del resultado
        const movimientosPorFormaPago = resultadoMovimientos || [];
        
        // Log para debugging
        console.log('Movimientos por forma de pago:', movimientosPorFormaPago);

        // Procesar el desglose para separar ingresos y egresos por forma de pago
        const desgloseMovimientos = {
            ingresos: {},
            egresos: {}
        };

        // Procesar los movimientos si existen
        if (movimientosPorFormaPago.length > 0) {
            movimientosPorFormaPago.forEach(movimiento => {
                const formaPago = movimiento.formaPago || 'Sin especificar';
                const tipo = movimiento.tipo;
                
                if (tipo === 'INGRESO') {
                    desgloseMovimientos.ingresos[formaPago] = parseFloat(movimiento.total).toFixed(2);
                } else if (tipo === 'EGRESO') {
                    desgloseMovimientos.egresos[formaPago] = parseFloat(movimiento.total).toFixed(2);
                }
            });
        }

        // Calcular total de gastos (órdenes de compra + egresos de caja)
        const totalGastos = parseFloat(totalOrdenesCompra) + parseFloat(totalEgresosCaja);

        // Calcular total de ingresos adicionales (ventas + ingresos de caja)
        const totalIngresosAdicionales = parseFloat(totalVentas) + parseFloat(totalIngresosCaja);

        // Calcular saldo final considerando solo efectivo:
        // FÓRMULA: Saldo inicial + ventas en efectivo + ingresos de caja en efectivo - egresos de caja en efectivo - gastos en efectivo
        // Esto representa el dinero físico que debería estar en la caja al momento del corte
        const ventasEfectivo = parseFloat(ventasPorMetodo.totalEfectivo || 0);
        const saldoFinalEfectivo = parseFloat(corteCaja.saldoinicial) + 
                                  ventasEfectivo + 
                                  parseFloat(totalIngresosCajaEfectivo) - 
                                  parseFloat(totalEgresosCajaEfectivo) - 
                                  parseFloat(totalOrdenesCompra); // Las órdenes de compra normalmente se pagan en efectivo

        // Actualizar los campos del corte de caja con los totales calculados
        await corteCaja.update({
            totalventas: totalVentas,
            totalefectivo: ventasPorMetodo.totalEfectivo || 0,
            totaltarjeta: ventasPorMetodo.totalTarjeta || 0,
            totaltransferencia: ventasPorMetodo.totalTransferencia || 0,
            totalcheque: ventasPorMetodo.totalCheque || 0,
            totaldineroelectronico: ventasPorMetodo.totalDineroElectronico || 0,
            totalgastos: totalGastos,
            // Saldo final solo considera efectivo
            saldofinal: saldoFinalEfectivo
        });

        // Recargar el corte de caja actualizado
        await corteCaja.reload();

        res.json({
            status: 0,
            message: 'Corte de caja individual obtenido correctamente',
            data: {
                corteCaja,
                resumen: {
                    totalVentasContado: parseFloat(totalVentasContado).toFixed(2),
                    totalVentasCredito: parseFloat(totalVentasCredito).toFixed(2),
                    totalOrdenesCompra: parseFloat(totalOrdenesCompra).toFixed(2),
                    movimientosCaja: {
                        totalIngresos: parseFloat(totalIngresosCaja).toFixed(2),
                        totalEgresos: parseFloat(totalEgresosCaja).toFixed(2),
                        diferencia: parseFloat(totalIngresosCaja - totalEgresosCaja).toFixed(2),
                        efectivo: {
                            totalIngresos: parseFloat(totalIngresosCajaEfectivo).toFixed(2),
                            totalEgresos: parseFloat(totalEgresosCajaEfectivo).toFixed(2),
                            diferencia: parseFloat(totalIngresosCajaEfectivo - totalEgresosCajaEfectivo).toFixed(2)
                        },
                        desglosePorFormaPago: desgloseMovimientos
                    },
                    totales: {
                        totalIngresosCombinados: parseFloat(totalIngresosAdicionales).toFixed(2),
                        totalGastosCombinados: parseFloat(totalGastos).toFixed(2),
                        saldoFinalEfectivo: parseFloat(saldoFinalEfectivo).toFixed(2),
                        calculoSaldoFinal: {
                            saldoInicial: parseFloat(corteCaja.saldoinicial).toFixed(2),
                            ventasEfectivo: parseFloat(ventasEfectivo).toFixed(2),
                            ingresosEfectivo: parseFloat(totalIngresosCajaEfectivo).toFixed(2),
                            egresosEfectivo: parseFloat(totalEgresosCajaEfectivo).toFixed(2),
                            gastosEfectivo: parseFloat(totalOrdenesCompra).toFixed(2)
                        }
                    },
                    desglosePorMetodo: {
                        efectivo: parseFloat(corteCaja.totalefectivo).toFixed(2),
                        tarjeta: parseFloat(corteCaja.totaltarjeta).toFixed(2),
                        transferencia: parseFloat(corteCaja.totaltransferencia).toFixed(2),
                        cheque: parseFloat(corteCaja.totalcheque).toFixed(2),
                        dineroElectronico: parseFloat(corteCaja.totaldineroelectronico).toFixed(2)
                    },
                    desglosePorMetodoContado: {
                        efectivo: parseFloat(ventasPorMetodoContado.totalEfectivo || 0).toFixed(2),
                        tarjeta: parseFloat(ventasPorMetodoContado.totalTarjeta || 0).toFixed(2),
                        transferencia: parseFloat(ventasPorMetodoContado.totalTransferencia || 0).toFixed(2),
                        cheque: parseFloat(ventasPorMetodoContado.totalCheque || 0).toFixed(2),
                        dineroElectronico: parseFloat(ventasPorMetodoContado.totalDineroElectronico || 0).toFixed(2)
                    },
                    desglosePorMetodoCredito: {
                        efectivo: parseFloat(ventasPorMetodoCredito.totalEfectivo || 0).toFixed(2),
                        tarjeta: parseFloat(ventasPorMetodoCredito.totalTarjeta || 0).toFixed(2),
                        transferencia: parseFloat(ventasPorMetodoCredito.totalTransferencia || 0).toFixed(2),
                        cheque: parseFloat(ventasPorMetodoCredito.totalCheque || 0).toFixed(2),
                        dineroElectronico: parseFloat(ventasPorMetodoCredito.totalDineroElectronico || 0).toFixed(2)
                    }
                }
            }
        });
    
        // totales: {
        //             totalVentas: parseFloat(totalVentas).toFixed(2),
        //             totalVentasContado: parseFloat(totalVentasContado).toFixed(2),
        //             totalVentasCredito: parseFloat(totalVentasCredito).toFixed(2),
        //             desglosePorMetodo: {
        //                 efectivo: parseFloat(ventasPorMetodo.totalEfectivo || 0).toFixed(2),
        //                 tarjeta: parseFloat(ventasPorMetodo.totalTarjeta || 0).toFixed(2),
        //                 transferencia: parseFloat(ventasPorMetodo.totalTransferencia || 0).toFixed(2)
        //             }
        //         }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener el corte de caja',
            data: null
        });
    }
}

const obtenerSaldoInicialSugerido = async (req, res = response) => {
    const { idSucursal, idcajas } = req.params;

    try {
        // Buscar el último corte de caja cerrado para esta caja y sucursal
        const ultimoCorte = await Cortescaja.findOne({
            where: {
                idSucursal,
                idcajas,
                estatus: 'CERRADO'
            },
            order: [['idcortescaja', 'DESC']]
        });

        if (!ultimoCorte) {
            return res.json({
                status: 0,
                message: 'No se encontró un corte anterior para esta caja',
                data: {
                    saldoInicialSugerido: 0,
                    ultimoCorte: null
                }
            });
        }

        // Calcular el dinero no retirado: efectivocontado - retiroporcorte
        const efectivoContado = parseFloat(ultimoCorte.efectivocontado) || 0;
        const retiroPorCorte = parseFloat(ultimoCorte.retiroporcorte) || 0;
        const saldoInicialSugerido = efectivoContado - retiroPorCorte;

        res.json({
            status: 0,
            message: 'Saldo inicial sugerido obtenido correctamente',
            data: {
                saldoInicialSugerido: parseFloat(saldoInicialSugerido).toFixed(2),
                ultimoCorte: {
                    idcortescaja: ultimoCorte.idcortescaja,
                    fecha: ultimoCorte.fecha,
                    horacierre: ultimoCorte.horacierre,
                    efectivocontado: parseFloat(efectivoContado).toFixed(2),
                    retiroporcorte: parseFloat(retiroPorCorte).toFixed(2)
                },
                calculo: {
                    efectivoContado: parseFloat(efectivoContado).toFixed(2),
                    retiroPorCorte: parseFloat(retiroPorCorte).toFixed(2),
                    dineroNoRetirado: parseFloat(saldoInicialSugerido).toFixed(2)
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener el saldo inicial sugerido',
            data: null
        });
    }
}

const obtenerTotalesCorte = async (req, res = response) => {
    const { idcajas } = req.params;

    try {
        const corteCaja = await Cortescaja.findOne({
            where: {
                idcajas,
                estatus: 'ABIERTO' // Solo obtener cortes abiertos
            },
            attributes: [
                'saldoinicial',
                'estatus',
                'fecha',
                'horaapertura'
            ]
        });
        const fechaInicial = corteCaja ? corteCaja.fecha + ' ' + corteCaja.horaapertura : null;
        const totalVentas = await Ventas.sum('total', {
            where: {
                idcajas,
                createDate: {
                    [Op.gte]: fechaInicial
                },
                active: 1
            }
        });

        totalVentasContado = await Ventas.sum('total', {
            where: {
                idcajas,
                createDate: {
                    [Op.gte]: fechaInicial
                },
                idTipoVenta: VENTA_CONTADO,
                active: 1
            }
        });
        totalVentasContado = totalVentasContado || 0;

        totalVentasCredito = await Ventas.sum('total', {
            where: {
                idcajas,
                createDate: {
                    [Op.gte]: fechaInicial
                },
                idTipoVenta: VENTA_CREDITO,
                active: 1
            }
        });

        totalVentasCredito = totalVentasCredito || 0;

      const [ventasPorMetodo] = await dbConnection.query(`
            SELECT 
                SUM(mpd.efectivo) as totalEfectivo,
                SUM(mpd.tarjeta) as totalTarjeta,
                SUM(mpd.transferencia) as totalTransferencia
            FROM metodos_pago_detalle mpd
            INNER JOIN pagos p ON mpd.idMetodosPagoDetalle = p.idMetodosPagoDetalle
            INNER JOIN ventas v ON p.idVenta = v.idVenta
            WHERE p.createDate >= :fechaInicial
            AND v.active = 1
        `, {
            replacements: { 
                fechaInicial: fechaInicial
            },
            type: Sequelize.QueryTypes.SELECT
        });

        res.json({
            status: 0,
            message: 'Totales del corte de caja obtenidos correctamente',            
            data: {cortesCaja, totalVentas, totalVentasContado, totalVentasCredito, ventasPorMetodo}
        });
        //data: {cortesCaja, totalVentas, totalVentasContado, totalVentasCredito, ventasPorMetodo}
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener los totales del corte de caja',
            data: null
        });
    }
}

const iniciarTurnoCaja = async (req, res = response) => {    
    const { idcajas, idUser, fecha, horaActual, saldoinicial } = req.body;
    const fechaHora = fecha + horaActual; // Combinar fecha y hora en un solo string
    const t = await dbConnection.transaction();

    try {
        // Verificar que la caja existe
        const caja = await Cajas.findByPk(idcajas);
        if (!caja) {
            await t.rollback();
            return res.status(404).json({
                status: 1,
                message: 'Caja no encontrada',
                data: null
            });
        }

        // VALIDAR QUE EXISTE UN CORTE GENERAL ACTIVO PARA LA SUCURSAL
        const validacionCorteGeneral = await validarCorteGeneralActivoParaOperacion(caja.idSucursal);
        if (!validacionCorteGeneral.valido) {
            await t.rollback();
            return res.status(400).json({
                status: 1,
                message: 'No se puede iniciar turno de caja individual',
                data: {
                    razon: 'No existe un corte general activo para esta sucursal',
                    detalle: validacionCorteGeneral.mensaje,
                    sucursal: {
                        idSucursal: caja.idSucursal
                    },
                    accionRequerida: 'Debe iniciar un corte general antes de abrir turnos individuales de caja'
                }
            });
        }

        // Verificar si ya hay un turno activo para esta caja
        const turnoActivo = await TurnosCaja.findOne({
            where: {
                idcajas,
                fechafin: null // Turno sin cerrar
            }
        });

        if (turnoActivo) {
            // Buscar el corte de caja activo asociado
            const corteCajaActivo = await Cortescaja.findOne({
                where: {
                    idcajas,
                    estatus: 'ABIERTO'
                }
            });

            await t.rollback();
            
            // Devolver la misma respuesta que cuando se crea un nuevo turno
            return res.json({
                status: 0,
                message: 'Turno de caja iniciado correctamente',
                data: {
                    turno: turnoActivo,
                    cortesCaja: corteCajaActivo,
                    corteGeneral: {
                        activo: true,
                        idcortescajageneral: validacionCorteGeneral.corteActivo.idcortescajageneral,
                        fechainicio: validacionCorteGeneral.corteActivo.fechainicio
                    }
                }
            });
        }

        // Crear el nuevo turno de caja
        const nuevoTurno = await TurnosCaja.create({
            idcajas,
            idUser,
            fechainicio:fechaHora, // Combinar fecha y hora en un solo string,
            fechafin: null
        }, { transaction: t });
   
        const nuevoCorteCaja = await Cortescaja.create({
            fecha, // Solo la fecha (YYYYMMDD)
            horaapertura: horaActual, // Solo la hora (HHMMSS)
            horacierre: null,
            idUser,
            idSucursal: caja.idSucursal, // Obtener idSucursal de la caja
            idcajas,
            idturnoscaja: nuevoTurno.idturnoscaja, // Asociar el turno de caja
            saldoinicial: saldoinicial || 0,
            totalefectivo: 0,
            totaltarjeta: 0,
            totaltransferencia: 0,
            totalcheque: 0,
            totaldineroelectronico: 0,
            totalventas: 0,
            totalgastos: 0,
            saldofinal: 0,
            efectivocontado: 0,
            diferencia: 0,
            retiroporcorte: 0,
            observaciones: null,
            estatus: 'ABIERTO'
        }, { transaction: t });

        // Actualizar la caja para marcarla como en uso
        await Cajas.update({
            ultimouso: fechaHora, // Actualizar el último uso con fecha y hora
        }, {
            where: { idcajas },
            transaction: t
        });

        await t.commit();

        res.json({
            status: 0,
            message: 'Turno de caja iniciado correctamente',
            data: {
                turno: nuevoTurno,
                cortesCaja: nuevoCorteCaja,
                corteGeneral: {
                    activo: true,
                    idcortescajageneral: validacionCorteGeneral.corteActivo.idcortescajageneral,
                    fechainicio: validacionCorteGeneral.corteActivo.fechainicio,
                    mensaje: 'Turno iniciado dentro de un período de corte general activo'
                }
            }
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al iniciar el turno de caja',
            data: null
        });
    }
}

const verificarTurnoActivo = async (req, res = response) => {
    const { idcajas } = req.params;

    try {
        // Verificar que la caja existe
        const caja = await Cajas.findByPk(idcajas);
        if (!caja) {
            return res.status(404).json({
                status: 0,
                message: 'Caja no encontrada',
                data: null
            });
        }

        // Buscar turno activo para la caja
        const turnoActivo = await TurnosCaja.findOne({
            where: {
                idcajas,
                fechafin: null // Turno sin cerrar
            },
            include: [
                {
                    model: User,
                    attributes: ['idUser', 'name']
                }
            ]
        });

        // Buscar corte de caja activo relacionado
        let corteCajaActivo = null;
        if (turnoActivo) {
            corteCajaActivo = await Cortescaja.findOne({
                where: {
                    idcajas,
                    estatus: 'ABIERTO'
                }
            });
        }

        if (turnoActivo && corteCajaActivo) {
            return res.json({
                status: 1,
                message: 'Turno activo encontrado',
                data: {
                    turnoActivo: true,
                    turno: turnoActivo,
                    cortesCaja: corteCajaActivo
                }
            });
        } else {
            return res.json({
                status: 1,
                message: 'No hay turno activo',
                data: {
                    turnoActivo: false,
                    turno: null,
                    cortesCaja: null
                }
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 0,
            message: 'Error al verificar el turno de caja',
            data: null
        });
    }
}

// Función auxiliar para usar en otros controladores
const validarTurnoActivoParaOperacion = async (idcajas) => {
    try {
        // Buscar turno activo
        const turnoActivo = await TurnosCaja.findOne({
            where: {
                idcajas,
                fechafin: null
            }
        });

        if (!turnoActivo) {
            return {
                valido: false,
                mensaje: 'No hay un turno activo para esta caja. Debe iniciar turno antes de realizar operaciones.'
            };
        }

        // Buscar corte de caja activo
        const corteCajaActivo = await Cortescaja.findOne({
            where: {
                idcajas,
                estatus: 'ABIERTO'
            }
        });

        if (!corteCajaActivo) {
            return {
                valido: false,
                mensaje: 'No hay un corte de caja activo para esta caja.'
            };
        }

        return {
            valido: true,
            turno: turnoActivo,
            cortesCaja: corteCajaActivo
        };

    } catch (error) {
        console.error(error);
        return {
            valido: false,
            mensaje: 'Error al validar el turno de caja'
        };
    }
}

/**
 * Realizar corte individual de caja y finalizar turno
 * Permite actualizar todos los campos del modelo Cortescaja y finalizar el turno activo
 * 
 * Proceso realizado:
 * 1. Valida que exista un turno activo para la caja
 * 2. Actualiza los datos del corte de caja (modelo Cortescaja)
 * 3. Finaliza el turno de caja (modelo TurnosCaja) estableciendo fechafin en formato yyyyMMddHHmmss
 * 4. Libera la caja para uso posterior
 * 5. Calcula estadísticas del turno (duración, etc.)
 * 
 * Nota: La fechafin del turno se formatea como string yyyyMMddHHmmss usando los parámetros
 * fecha (YYYYMMDD) y horacierre (HH:MM:SS) para evitar problemas de timezone
 * 
 * @param {number} idcajas - ID de la caja (enviado en el body, no como parámetro de ruta)
 * @param {Object} req.body - Datos del corte de caja
 * @param {string} [req.body.fecha] - Fecha del corte (YYYYMMDD)
 * @param {string} [req.body.horaapertura] - Hora de apertura (HH:MM:SS)
 * @param {string} [req.body.horacierre] - Hora de cierre (HH:MM:SS)
 * @param {number} [req.body.idUser] - ID del usuario responsable
 * @param {number} [req.body.idSucursal] - ID de la sucursal
 * @param {number} [req.body.idturnoscaja] - ID del turno de caja
 * @param {number} [req.body.saldoinicial] - Saldo inicial en efectivo
 * @param {number} [req.body.totalefectivo] - Total en efectivo
 * @param {number} [req.body.totaltarjeta] - Total en tarjeta
 * @param {number} [req.body.totaltransferencia] - Total en transferencia
 * @param {number} [req.body.totalcheque] - Total en cheque
 * @param {number} [req.body.totaldineroelectronico] - Total en dinero electrónico
 * @param {number} [req.body.totalventas] - Total de ventas
 * @param {number} [req.body.totalgastos] - Total de gastos
 * @param {number} [req.body.saldofinal] - Saldo final (se calcula automáticamente si no se proporciona)
 * @param {number} [req.body.efectivocontado] - Efectivo contado físicamente
 * @param {number} [req.body.diferencia] - Diferencia entre efectivo teórico y contado (se calcula automáticamente si no se proporciona)
 * @param {number} [req.body.retiroporcorte] - Monto retirado durante el corte de caja
 * @param {string} [req.body.observaciones] - Observaciones del corte
 * @param {string} [req.body.estatus] - Estatus del corte (por defecto 'CERRADO')
 * 
 * @returns {Object} Respuesta con datos del turno finalizado, corte de caja y estadísticas
 */
const RealizarCorteIndividual = async (req, res = response) => {
    
    const { 
        // Atributos del modelo Cortescaja
        fecha,
        horaapertura,
        horacierre,
        idUser,
        idSucursal,
        idcajas,
        idturnoscaja,
        saldoinicial,
        totalefectivo, 
        totaltarjeta, 
        totaltransferencia, 
        totalcheque,
        totaldineroelectronico,
        totalventas, 
        totalgastos,
        saldofinal,
        efectivocontado,         
        diferencia,
        retiroporcorte,
        observaciones,
        estatus
    } = req.body;

    const t = await dbConnection.transaction();

    try {
        // Verificar que existe un turno activo
        const turnoActivo = await TurnosCaja.findOne({
            where: {
                idcajas,
                fechafin: null // Solo turnos activos (sin fecha de fin)
            }
        });

        if (!turnoActivo) {
            await t.rollback();
            return res.status(404).json({
                status: 0,
                message: 'No hay turno activo para esta caja. No se puede realizar el corte.',
                data: null
            });
        }

        // Verificar que el turno pertenezca a la caja correcta
        if (turnoActivo.idcajas !== parseInt(idcajas)) {
            await t.rollback();
            return res.status(400).json({
                status: 0,
                message: 'El turno activo no corresponde a la caja especificada',
                data: null
            });
        }

        // Buscar el corte de caja activo
        const corteCajaActivo = await Cortescaja.findOne({
            where: {
                idcajas,
                estatus: 'ABIERTO'
            }
        });

        if (!corteCajaActivo) {
            await t.rollback();
            return res.status(404).json({
                status: 0,
                message: 'No hay corte de caja activo',
                data: null
            });
        }

        // Calcular valores finales si no se proporcionan
        const saldofinalCalculado = saldofinal !== undefined ? saldofinal : 
                                  (parseFloat(corteCajaActivo.saldoinicial) + 
                                   parseFloat(totalventas || 0) - 
                                   parseFloat(totalgastos || 0));
        
        const diferenciaCalculada = diferencia !== undefined ? diferencia :
                                  (parseFloat(efectivocontado || 0) - 
                                   parseFloat(totalefectivo || 0));

        // Preparar datos para actualización
        const datosActualizacion = {
            horacierre: horacierre || new Date().toTimeString().split(' ')[0],
            estatus: estatus || 'CERRADO'
        };

        // Solo actualizar campos que se proporcionen
        if (fecha !== undefined) datosActualizacion.fecha = fecha;
        if (horaapertura !== undefined) datosActualizacion.horaapertura = horaapertura;
        if (idUser !== undefined) datosActualizacion.idUser = idUser;
        if (idSucursal !== undefined) datosActualizacion.idSucursal = idSucursal;
        if (idturnoscaja !== undefined) datosActualizacion.idturnoscaja = idturnoscaja;
        if (saldoinicial !== undefined) datosActualizacion.saldoinicial = saldoinicial;
        if (totalefectivo !== undefined) datosActualizacion.totalefectivo = totalefectivo;
        if (totaltarjeta !== undefined) datosActualizacion.totaltarjeta = totaltarjeta;
        if (totaltransferencia !== undefined) datosActualizacion.totaltransferencia = totaltransferencia;
        if (totalcheque !== undefined) datosActualizacion.totalcheque = totalcheque;
        if (totaldineroelectronico !== undefined) datosActualizacion.totaldineroelectronico = totaldineroelectronico;
        if (totalventas !== undefined) datosActualizacion.totalventas = totalventas;
        if (totalgastos !== undefined) datosActualizacion.totalgastos = totalgastos;
        if (efectivocontado !== undefined) datosActualizacion.efectivocontado = efectivocontado;
        if (retiroporcorte !== undefined) datosActualizacion.retiroporcorte = retiroporcorte;
        if (observaciones !== undefined) datosActualizacion.observaciones = observaciones;
        
        // Siempre calcular estos valores
        datosActualizacion.saldofinal = saldofinalCalculado;
        datosActualizacion.diferencia = diferenciaCalculada;

        // Actualizar el corte de caja
        await corteCajaActivo.update(datosActualizacion, { transaction: t });

        // Finalizar el turno de caja - Actualizar datos del modelo TurnosCaja
        // Usar la fecha y hora de cierre proporcionadas, o la actual si no se proporcionan
        const fechaFinTurnoString = formatearFechaFinTurno(fecha, horacierre);
        
        await turnoActivo.update({
            fechafin: fechaFinTurnoString
        }, { transaction: t });

        // Log de auditoría
        console.log(`Turno finalizado - ID: ${turnoActivo.idturnoscaja}, Caja: ${idcajas}, Usuario: ${turnoActivo.idUser}, FechaFin: ${fechaFinTurnoString}`);

        // Liberar la caja - Marcar como disponible
        await Cajas.update({
            activeuuid: null,
            ultimouso: fechaFinTurnoString // Actualizar el último uso con la fecha de cierre del turno
        }, {
            where: { idcajas },
            transaction: t
        });

        await t.commit();

        // Recargar los datos actualizados
        await corteCajaActivo.reload();
        await turnoActivo.reload();

        res.json({
            status: 0,
            message: 'Corte de caja realizado correctamente',
            data: {
                turno: {
                    ...turnoActivo.toJSON(),
                    finalizado: true
                },
                cortesCaja: corteCajaActivo,
                actualizaciones: {
                    camposActualizados: Object.keys(datosActualizacion),
                    saldofinalCalculado: saldofinalCalculado,
                    diferenciaCalculada: diferenciaCalculada,
                    turnoFinalizado: {
                        fechaInicio: turnoActivo.fechainicio,
                        fechaFinFormateada: fechaFinTurnoString
                    }
                },
                caja: {
                    idcajas: idcajas,
                    liberada: true,
                    ultimoUso: fechaFinTurnoString
                }
            }
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al cerrar el turno de caja',
            data: null
        });
    }
}

const obtenerTurnosActivos = async (req, res = response) => {    
    const { idcajas, idSucursal } = req.query;

    try {
        const whereConditions = {
            fechafin: null
        };

        if (idcajas && idcajas !== '0') {
            whereConditions.idcajas = idcajas;
        }

        const includeConditions = [
            {
                model: User,
                attributes: ['idUser', 'name']
            },
            {
                model: Cajas,
                attributes: ['idcajas', 'nombre', 'idSucursal'],
                ...(idSucursal && {
                    where: {
                        idSucursal: idSucursal
                    }
                }),
                include: [
                    {
                        model: Sucursales,
                        as: 'sucursales', // Agregar el alias aquí
                        attributes: ['idSucursal', 'name'],
                        required: false
                    }
                ]
            }
        ];

        const turnosActivos = await TurnosCaja.findAll({
            where: whereConditions,
            include: includeConditions,
            order: [['fechainicio', 'DESC']]
        });

        res.json({
            status: 0,
            message: 'Turnos activos obtenidos correctamente',
            data: turnosActivos
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener turnos activos',
            data: null
        });
    }
}

const obtenerCortesCajaPorFecha = async (req, res = response) => {
    const { idcajas } = req.params;
    const { fechaInicio, fechaFin, estatus } = req.query;

    try {
        const whereConditions = {
            ...(idcajas ? { idcajas } : {})
        };

        // Filtros de fecha
        if (fechaInicio && fechaFin) {
            whereConditions.fecha = {
                [Op.between]: [fechaInicio, fechaFin]
            };
        } else if (fechaInicio) {
            whereConditions.fecha = {
                [Op.gte]: fechaInicio
            };
        } else if (fechaFin) {
            whereConditions.fecha = {
                [Op.lte]: fechaFin
            };
        }

        // Filtro de estatus
        if (estatus) {
            whereConditions.estatus = estatus;
        }

        const cortesCaja = await Cortescaja.findAll({
            where: whereConditions,
            include: [
                {
                    model: User,
                    attributes: ['idUser', 'name']
                },
                {
                    model: Cajas,
                    attributes: ['idcajas', 'nombre'],
                    include: [
                        {
                            model: Sucursales,
                            as: 'sucursales', // Agregar el alias aquí también
                            attributes: ['idSucursal', 'name'],
                            required: false
                        }
                    ]
                }
            ],
            order: [['fecha', 'DESC'], ['horaapertura', 'DESC']]
        });

        res.json({
            status: 0,
            message: 'Cortes de caja obtenidos correctamente',
            data: cortesCaja
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener cortes de caja',
            data: null
        });
    }
}

const obtenerCajerosConTurnosActivos = async (req, res = response) => {
    try {
        const cajerosActivos = await TurnosCaja.findAll({
            where: {
                fechafin: null
            },
            include: [
                {
                    model: User,
                    attributes: ['idUser', 'name'],
                    required: true
                },
                {
                    model: Cajas,
                    attributes: ['idcajas', 'nombre', 'descripcion', 'idSucursal'],
                    required: true,
                    include: [
                        {
                            model: Sucursales,
                            as: 'sucursales', // Agregar el alias aquí también
                            attributes: ['idSucursal', 'name'],
                            required: false
                        }
                    ]
                }
            ],
            order: [['fechainicio', 'DESC']],
            attributes: ['idturnoscaja', 'fechainicio']
        });

        // Formatear la respuesta
        const cajerosFormateados = cajerosActivos.map(turno => ({
            idTurno: turno.idturnoscaja,
            fechaInicio: turno.fechainicio,
            usuario: {
                idUser: turno.user.idUser,
                nombre: turno.user.name
            },
            caja: {
                idcajas: turno.caja.idcajas,
                nombre: turno.caja.nombre,
                descripcion: turno.caja.descripcion,
                sucursal: turno.caja.sucursales ? { // Usar 'sucursales' según el alias
                    idSucursal: turno.caja.sucursales.idSucursal,
                    nombre: turno.caja.sucursales.name
                } : null
            }
        }));

        res.json({
            status: 1,
            message: 'Cajeros con turnos activos obtenidos correctamente',
            data: cajerosFormateados,
            total: cajerosFormateados.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 0,
            message: 'Error al obtener cajeros con turnos activos',
            data: null
        });
    }
}

/**
 * Generar estructura JSON para imprimir ticket de corte de caja
 * @param {Object} datosTicket - Datos necesarios para el ticket
 * @param {Object} datosTicket.sucursal - Información de la sucursal
 * @param {Object} datosTicket.caja - Información de la caja
 * @param {Object} datosTicket.usuario - Información del usuario/cajero
 * @param {Object} datosTicket.corte - Datos del corte de caja
 * @param {Array} datosTicket.movimientosEfectivo - Movimientos de efectivo (opcional)
 * @param {Object} datosTicket.resumen - Resumen de totales (opcional)
 * @param {Object} datosTicket.config - Configuración de impresión (opcional)
 * @returns {Object} Estructura JSON para impresión
 */
const generarTicketCorteCaja = (datosTicket) => {
    const {
        sucursal = {},
        caja = {},
        usuario = {},
        corte = {},
        movimientosEfectivo = [],
        resumen = {},
        config = {}
    } = datosTicket;

    // Función para formatear moneda
    const formatMoney = (amount) => {
        const number = parseFloat(amount || 0).toFixed(2);
        return `$${number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    };

    // Función para formatear fecha y hora
    const formatearFechaHora = (fecha, hora) => {
        if (!fecha || !hora) return new Date().toLocaleString();
        
        // Si la fecha está en formato YYYY-MM-DD y hora en HH:MM:SS
        if (fecha.includes('-') && hora.includes(':')) {
            return `${fecha} ${hora}`;
        }
        
        // Si están en formato compacto, convertir
        if (fecha.length === 8) { // YYYYMMDD
            const year = fecha.substring(0, 4);
            const month = fecha.substring(4, 6);
            const day = fecha.substring(6, 8);
            fecha = `${year}-${month}-${day}`;
        }
        
        if (hora.length === 6) { // HHMMSS
            const hour = hora.substring(0, 2);
            const minute = hora.substring(2, 4);
            const second = hora.substring(4, 6);
            hora = `${hour}:${minute}:${second}`;
        }
        
        return `${fecha} ${hora}`;
    };

    const oLinesP = [];

    // Logo (si se proporciona)
    if (config.logoBase64) {
        oLinesP.push({
            oLines: [
                { bImage: true, base64Image: config.logoBase64, iHeight: 50, ticketWidth: 32 }
            ]
        });
    }

    // Encabezado de sucursal
    const encabezadoLines = [
        { text: String(sucursal.name || "SUCURSAL"), aling: "center", size: 10, style: "Bold", type: "Helvetica", iWith: 100 }
    ];

    oLinesP.push({ oLines: encabezadoLines });
    // Construir dirección si está disponible
    let direccionCompleta = '';
    const direccion = [];
    if (sucursal.calle) {
        direccionCompleta = sucursal.calle;
        if (sucursal.numExt) direccionCompleta += ` ${sucursal.numExt}`;
        if (sucursal.numInt) direccionCompleta += ` Int. ${sucursal.numInt}`;
    }

    if (direccionCompleta) {
        direccion.push({ text: String(direccionCompleta), aling: "center", size: 8, type: "Helvetica", iWith: 100 });
    }
    if (sucursal.telefono) {
        direccion.push({ text: String(sucursal.telefono), aling: "center", size: 8, type: "Helvetica", iWith: 100 });
    }

    oLinesP.push({ oLines: direccion });

    // Título y datos del corte
    oLinesP.push({
        oLines: [
            { text: "  CORTE DE CAJA", aling: "center", size: 12, style: "Bold", type: "Helvetica", iWith: 100 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Folio:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(corte.idcortescaja || 'N/A'), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Caja:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(`${caja.nombre || caja.idcajas}`), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Cajero:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(usuario.name || usuario.nombre || 'N/A'), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Apertura:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(formatearFechaHora(corte.fecha, corte.horaapertura)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });

    // Hora de cierre si existe
    if (corte.horacierre) {
        oLinesP.push({
            oLines: [
                { text: "  Cierre:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(formatearFechaHora(corte.fecha, corte.horacierre)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });
        
        oLinesP.push({
            oLines: [
                { text: "  Estado:", aling: "left", size: 8, style: "Bold", type: "Helvetica", iWith: 60 },
                { text: String(corte.estatus || 'ABIERTO'), aling: "right", size: 8, style: "Bold", type: "Helvetica", iWith: 40 }
            ]
        });
    }

    // Separador
    oLinesP.push({
        oLines: [
            { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
        ]
    });

    // Totales principales
    oLinesP.push({
        oLines: [
            { text: "  RESUMEN FINANCIERO", aling: "center", size: 9, style: "Bold", type: "Helvetica", iWith: 100 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Saldo Inicial:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(formatMoney(corte.saldoinicial)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });

    // Desglose de ingresos por método de pago
    oLinesP.push({
        oLines: [
            { text: "  INGRESOS POR METODO DE PAGO:", aling: "left", size: 8, style: "Bold", type: "Helvetica", iWith: 100 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Efectivo:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(formatMoney(corte.totalefectivo)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Tarjeta:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(formatMoney(corte.totaltarjeta)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Transferencia:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(formatMoney(corte.totaltransferencia)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });

       oLinesP.push({
        oLines: [
            { text: "  Cheque:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(formatMoney(corte.totalcheque)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Dinero Electronico:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(formatMoney(corte.totaldineroelectronico)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Total Ventas:", aling: "left", size: 8, style: "Bold", type: "Helvetica", iWith: 60 },
            { text: String(formatMoney(corte.totalventas)), aling: "right", size: 8, style: "Bold", type: "Helvetica", iWith: 40 }
        ]
    });

    // Egresos y saldo final
    oLinesP.push({
        oLines: [
            { text: "  Total Egresos:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
            { text: String(formatMoney(corte.totalgastos)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "  Saldo Final Calculado:", aling: "left", size: 8, style: "Bold", type: "Helvetica", iWith: 60 },
            { text: String(formatMoney(corte.saldofinal)), aling: "right", size: 8, style: "Bold", type: "Helvetica", iWith: 40 }
        ]
    });

    // Efectivo contado y diferencia
    if (corte.efectivocontado !== undefined) {
        const diferencia = parseFloat(corte.diferencia || 0);
        const colorDiferencia = diferencia === 0 ? "" : (diferencia > 0 ? "green" : "red");
        
        oLinesP.push({
            oLines: [
                { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
            ]
        });
        
        oLinesP.push({
            oLines: [
                { text: "  ARQUEO DE EFECTIVO:", aling: "left", size: 8, style: "Bold", type: "Helvetica", iWith: 100 }
            ]
        });
        
        oLinesP.push({
            oLines: [
                { text: "  Efectivo Teórico:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(formatMoney(corte.saldofinal)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });
        
        oLinesP.push({
            oLines: [
                { text: "  Efectivo Contado:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(formatMoney(corte.efectivocontado)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });
        
        oLinesP.push({
            oLines: [
                { text: "  Diferencia:", aling: "left", size: 8, style: "Bold", type: "Helvetica", iWith: 60 },
                { text: String(formatMoney(corte.diferencia)), aling: "right", size: 8, style: "Bold", type: "Helvetica", iWith: 40, color: colorDiferencia }
            ]
        });
        
        oLinesP.push({
            oLines: [
                { text: "  Retiro por corte:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(formatMoney(corte.retiroporcorte)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });
        
        // Calcular saldo en caja (efectivo contado - retiro por corte)
        const saldoEnCaja = parseFloat(corte.efectivocontado || 0) - parseFloat(corte.retiroporcorte || 0);
        
        oLinesP.push({
            oLines: [
                { text: "  Saldo en caja:", aling: "left", size: 8, type: "Helvetica", iWith: 60 },
                { text: String(formatMoney(saldoEnCaja)), aling: "right", size: 8, type: "Helvetica", iWith: 40 }
            ]
        });
    }

    // Resumen de movimientos de efectivo (si existe)
    if (movimientosEfectivo && movimientosEfectivo.length > 0) {
        oLinesP.push({
            oLines: [
                { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
            ]
        });
        
        oLinesP.push({
            oLines: [
                { text: "MOVIMIENTOS DE EFECTIVO:", aling: "left", size: 8, style: "Bold", type: "Helvetica", iWith: 100 }
            ]
        });

        movimientosEfectivo.forEach(mov => {
            oLinesP.push({
                oLines: [
                    { text: String(mov.tipo) + ":", aling: "left", size: 7, type: "Helvetica", iWith: 30 },
                    { text: String(formatMoney(mov.monto)), aling: "right", size: 7, type: "Helvetica", iWith: 30 },
                    { text: String(mov.descripcion || mov.concepto || ''), aling: "left", size: 7, type: "Helvetica", iWith: 40 }
                ]
            });
        });
    }

    // Resumen adicional (si existe)
    if (resumen && Object.keys(resumen).length > 0) {
        oLinesP.push({
            oLines: [
                { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
            ]
        });
        
        oLinesP.push({
            oLines: [
                { text: "RESUMEN DETALLADO:", aling: "left", size: 8, style: "Bold", type: "Helvetica", iWith: 100 }
            ]
        });

        if (resumen.totalVentasContado) {
            oLinesP.push({
                oLines: [
                    { text: "Ventas de Contado:", aling: "left", size: 7, type: "Helvetica", iWith: 60 },
                    { text: String(formatMoney(resumen.totalVentasContado)), aling: "right", size: 7, type: "Helvetica", iWith: 40 }
                ]
            });
        }

        if (resumen.totalVentasCredito) {
            oLinesP.push({
                oLines: [
                    { text: "Ventas de Crédito:", aling: "left", size: 7, type: "Helvetica", iWith: 60 },
                    { text: String(formatMoney(resumen.totalVentasCredito)), aling: "right", size: 7, type: "Helvetica", iWith: 40 }
                ]
            });
        }

        if (resumen.movimientosCaja && resumen.movimientosCaja.efectivo) {
            const efectivo = resumen.movimientosCaja.efectivo;
            oLinesP.push({
                oLines: [
                    { text: "Ingresos Efectivo Extra:", aling: "left", size: 7, type: "Helvetica", iWith: 60 },
                    { text: String(formatMoney(efectivo.totalIngresos)), aling: "right", size: 7, type: "Helvetica", iWith: 40 }
                ]
            });
            
            oLinesP.push({
                oLines: [
                    { text: "Egresos Efectivo Extra:", aling: "left", size: 7, type: "Helvetica", iWith: 60 },
                    { text: String(formatMoney(efectivo.totalEgresos)), aling: "right", size: 7, type: "Helvetica", iWith: 40 }
                ]
            });
        }
    }

    // Observaciones
    if (corte.observaciones) {
        oLinesP.push({
            oLines: [
                { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
            ]
        });
        
        oLinesP.push({
            oLines: [
                { text: "OBSERVACIONES:", aling: "left", size: 8, style: "Bold", type: "Helvetica", iWith: 100 }
            ]
        });
        
        oLinesP.push({
            oLines: [
                { text: String(corte.observaciones), aling: "justify", size: 7, type: "Helvetica", iWith: 100 }
            ]
        });
    }

    // Footer
    oLinesP.push({
        oLines: [
            { text: "---------------------------------------------------------------------", aling: "center", size: 8, type: "Helvetica", iWith: 100 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: String(config.agradecimiento || "¡Gracias por su preferencia!"), aling: "center", size: 8, style: "Bold", type: "Helvetica", iWith: 100 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: String(config.infoAdicional || "Sistema DIPROLIM"), aling: "center", size: 7, type: "Helvetica", iWith: 100 }
        ]
    });
    
    oLinesP.push({
        oLines: [
            { text: "Impreso:", aling: "left", size: 6, type: "Helvetica", iWith: 30 },
            { text: String(new Date().toLocaleString()), aling: "right", size: 6, type: "Helvetica", iWith: 70 }
        ]
    });

    // Estructura final para imprimir
    return {
        oPrinter: {
            printerName: config.defaultPrinter || "POS-Printer",
            maxWidth: config.maxWidth || 280,
            maxMargen: config.maxMargen || 100,
            sBarCode: ""
        },
        oLinesP
    };
};

/**
 * Endpoint para generar e imprimir ticket de corte de caja
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const imprimirTicketCorteCaja = async (req, res = response) => {
    const { idcortescaja } = req.params;
    const { impresora = "POS-Printer" } = req.body;

    try {
        // Buscar el corte de caja con todas las relaciones necesarias
        const corteCaja = await Cortescaja.findByPk(idcortescaja, {
            include: [
                {
                    model: User,
                    attributes: ['idUser', 'name']
                },
                {
                    model: Cajas,
                    attributes: ['idcajas', 'nombre', 'descripcion', 'idSucursal'],
                    include: [
                        {
                            model: Sucursales,
                            as: 'sucursales', // Especificar el alias
                            attributes: ['idSucursal', 'name', 'calle', 'numExt', 'numInt', 'telefono']
                        }
                    ]
                }
            ]
        });

        if (!corteCaja) {
            return res.status(404).json({
                status: 0,
                message: 'Corte de caja no encontrado',
                data: null
            });
        }

        // Preparar datos para el ticket
        const datosTicket = {
            sucursal: corteCaja.caja?.sucursales || {},
            caja: corteCaja.caja || {},
            usuario: corteCaja.user || {},
            corte: corteCaja,
            config: {
                defaultPrinter: impresora,
                agradecimiento: "¡Corte de caja generado exitosamente!",
                infoAdicional: "Sistema de Gestión DIPROLIM"
            }
        };

        // Generar el ticket
        const ticketJSON = generarTicketCorteCaja(datosTicket);

        res.json({
            status: 0,
            message: 'Ticket de corte de caja generado correctamente',
            data: {
                corteCaja,
                ticketFormat: ticketJSON
            }
        });

    } catch (error) {
        console.error('Error al generar ticket de corte de caja:', error);
        res.status(500).json({
            status: 2,
            message: 'Error al generar el ticket de corte de caja',
            data: error.message
        });
    }
};

const obtenerTotalesCorteGeneral = async (req, res = response) => {
    const { 
        idSucursal
    } = req.body;

    try {
        // Validar parámetros requeridos
        if (!idSucursal) {
            return res.status(400).json({
                status: 1,
                message: 'Se requiere idSucursal',
                data: null
            });
        }

        // Importar el modelo CortescajaGeneral
        const CortescajaGeneral = require('../models/cortescaja/cortescajageneral');

        // Buscar el corte general activo (con fechacierre null)
        const corteGeneralActivo = await CortescajaGeneral.findOne({
            where: {
                idSucursal: idSucursal,
                fechacierre: null
            },
            order: [['fechainicio', 'DESC']]
        });

        if (!corteGeneralActivo) {
            return res.status(200).json({
                status: 1,
                message: 'No se encontró un corte general activo para esta sucursal',
                data: null
            });
        }

        // Obtener fechas del corte general activo
        const fechaInicio = moment(corteGeneralActivo.fechainicio).format('YYYY-MM-DD HH:mm:ss'); // Formato con moment
        const fechaFin = moment().format('YYYY-MM-DD HH:mm:ss'); // Fecha actual con moment

        // Query para obtener totales de ventas agrupados por vendedor
        const totalesVentas = await dbConnection.query(`
            SELECT 
                v.idVendedor,
                vend.nombre as nombreVendedor,
                COUNT(v.idVenta) as totalTransacciones,
                SUM(v.total) as totalVentas,
                SUM(CASE WHEN v.idTipoVenta = ${VENTA_CONTADO} THEN v.total ELSE 0 END) as ventasContado,
                SUM(CASE WHEN v.idTipoVenta = ${VENTA_CREDITO} THEN v.total ELSE 0 END) as ventasCredito,
                
                -- Totales por método de pago desde metodos_pago_detalle
                SUM(COALESCE(mpd.efectivo, 0)) as totalEfectivo,
                SUM(COALESCE(mpd.tarjeta, 0)) as totalTarjeta,
                SUM(COALESCE(mpd.transferencia, 0)) as totalTransferencia
                
            FROM ventas v
            LEFT JOIN vendedores vend ON v.idVendedor = vend.idVendedor
            LEFT JOIN pagos p ON v.idVenta = p.idVenta AND p.active = 1
            LEFT JOIN metodos_pago_detalle mpd ON p.idMetodosPagoDetalle = mpd.idMetodosPagoDetalle
            WHERE v.idSucursal = :idSucursal
            AND v.active = 1
            AND v.bClosed = 1
            AND v.createDate >= :fechaInicio AND v.createDate <= :fechaFin
            GROUP BY v.idVendedor, vend.nombre
            ORDER BY vend.nombre
        `, {
            replacements: { 
                idSucursal, 
                fechaInicio, 
                fechaFin 
            },
            type: Sequelize.QueryTypes.SELECT
        });

        // Query para obtener movimientos de efectivo (entradas y salidas) agrupados por vendedor/usuario
        const movimientosEfectivo = await dbConnection.query(`
            SELECT 
                mc.idUser as idVendedor,
                u.name as nombreVendedor,
                SUM(CASE WHEN mc.tipo = 'INGRESO' THEN mc.monto ELSE 0 END) as totalIngresos,
                SUM(CASE WHEN mc.tipo = 'EGRESO' THEN mc.monto ELSE 0 END) as totalEgresos,
                SUM(CASE WHEN mc.tipo = 'INGRESO' THEN mc.monto ELSE -mc.monto END) as netMovimientos,
                COUNT(*) as totalMovimientos
            FROM movimientos_caja mc
            LEFT JOIN users u ON mc.idUser = u.idUser
            LEFT JOIN cajas c ON mc.idcajas = c.idcajas
            WHERE c.idSucursal = :idSucursal
            AND STR_TO_DATE(mc.fecha, '%Y-%m-%d %H:%i:%s') >= :fechaInicio AND STR_TO_DATE(mc.fecha, '%Y-%m-%d %H:%i:%s') <= :fechaFin
            AND mc.idformaspago = 1  -- Asumiendo que 1 es efectivo
            GROUP BY mc.idUser, u.name
            ORDER BY u.name
        `, {
            replacements: { 
                idSucursal, 
                fechaInicio, 
                fechaFin 
            },
            type: Sequelize.QueryTypes.SELECT
        });

        // Query para obtener totales agrupados por caja
        const totalesPorCaja = await dbConnection.query(`
            SELECT
                v.idCaja,
                c.nombre AS nombreCaja,
                COUNT(v.idVenta) as totalTransacciones,
                SUM(v.total) as totalVentas,
                SUM(COALESCE(mpd.efectivo, 0)) AS totalEfectivo,
                SUM(COALESCE(mpd.tarjeta, 0)) AS totalTarjeta,
                SUM(COALESCE(mpd.transferencia, 0)) AS totalTransferencia
            FROM ventas v
            INNER JOIN cajas c ON v.idCaja = c.idcajas
            LEFT JOIN pagos p ON p.idVenta = v.idVenta AND p.active = 1
            LEFT JOIN metodos_pago_detalle mpd ON p.idMetodosPagoDetalle = mpd.idMetodosPagoDetalle
            WHERE v.idSucursal = :idSucursal
            AND v.active = 1
            AND v.bClosed = 1
            AND v.createDate >= :fechaInicio AND v.createDate <= :fechaFin
            GROUP BY v.idCaja, c.nombre
            ORDER BY v.idCaja
        `, {
            replacements: { 
                idSucursal, 
                fechaInicio, 
                fechaFin 
            },
            type: Sequelize.QueryTypes.SELECT
        });

        // Combinar los resultados y calcular totales generales
        const resultadosCombinados = [];
        const vendedoresMap = new Map();

        // Procesar totales de ventas
        totalesVentas.forEach(venta => {
            const idVendedor = venta.idVendedor || 0;
            vendedoresMap.set(idVendedor, {
                idVendedor,
                nombreVendedor: venta.nombreVendedor || 'Sin asignar',
                totalTransacciones: parseInt(venta.totalTransacciones) || 0,
                totalVentas: parseFloat(venta.totalVentas) || 0,
                ventasContado: parseFloat(venta.ventasContado) || 0,
                ventasCredito: parseFloat(venta.ventasCredito) || 0,
                totalEfectivo: parseFloat(venta.totalEfectivo) || 0,
                totalTarjeta: parseFloat(venta.totalTarjeta) || 0,
                totalTransferencia: parseFloat(venta.totalTransferencia) || 0,
                // Inicializar movimientos de efectivo
                totalIngresos: 0,
                totalEgresos: 0,
                netMovimientos: 0,
                totalMovimientos: 0
            });
        });

        // Procesar movimientos de efectivo
        movimientosEfectivo.forEach(movimiento => {
            const idVendedor = movimiento.idVendedor || 0;
            if (vendedoresMap.has(idVendedor)) {
                const vendedor = vendedoresMap.get(idVendedor);
                vendedor.totalIngresos = parseFloat(movimiento.totalIngresos) || 0;
                vendedor.totalEgresos = parseFloat(movimiento.totalEgresos) || 0;
                vendedor.netMovimientos = parseFloat(movimiento.netMovimientos) || 0;
                vendedor.totalMovimientos = parseInt(movimiento.totalMovimientos) || 0;
            } else {
                // Vendedor que solo tiene movimientos de efectivo pero no ventas
                vendedoresMap.set(idVendedor, {
                    idVendedor,
                    nombreVendedor: movimiento.nombreVendedor || 'Sin asignar',
                    totalTransacciones: 0,
                    totalVentas: 0,
                    ventasContado: 0,
                    ventasCredito: 0,
                    totalEfectivo: 0,
                    totalTarjeta: 0,
                    totalTransferencia: 0,
                    totalIngresos: parseFloat(movimiento.totalIngresos) || 0,
                    totalEgresos: parseFloat(movimiento.totalEgresos) || 0,
                    netMovimientos: parseFloat(movimiento.netMovimientos) || 0,
                    totalMovimientos: parseInt(movimiento.totalMovimientos) || 0
                });
            }
        });

        // Convertir Map a Array
        vendedoresMap.forEach(vendedor => {
            resultadosCombinados.push(vendedor);
        });

        // Procesar totales por caja
        const totalesCajas = totalesPorCaja.map(caja => ({
            idCaja: parseInt(caja.idCaja) || 0,
            nombreCaja: caja.nombreCaja || 'Sin nombre',
            totalTransacciones: parseInt(caja.totalTransacciones) || 0,
            totalVentas: parseFloat(caja.totalVentas) || 0,
            totalEfectivo: parseFloat(caja.totalEfectivo) || 0,
            totalTarjeta: parseFloat(caja.totalTarjeta) || 0,
            totalTransferencia: parseFloat(caja.totalTransferencia) || 0
        }));

        // Calcular totales generales
        const totalesGenerales = {
            totalVendedores: resultadosCombinados.length,
            totalTransacciones: resultadosCombinados.reduce((sum, v) => sum + v.totalTransacciones, 0),
            totalVentas: resultadosCombinados.reduce((sum, v) => sum + v.totalVentas, 0),
            ventasContado: resultadosCombinados.reduce((sum, v) => sum + v.ventasContado, 0),
            ventasCredito: resultadosCombinados.reduce((sum, v) => sum + v.ventasCredito, 0),
            totalEfectivo: resultadosCombinados.reduce((sum, v) => sum + v.totalEfectivo, 0),
            totalTarjeta: resultadosCombinados.reduce((sum, v) => sum + v.totalTarjeta, 0),
            totalTransferencia: resultadosCombinados.reduce((sum, v) => sum + v.totalTransferencia, 0),
            totalIngresos: resultadosCombinados.reduce((sum, v) => sum + v.totalIngresos, 0),
            totalEgresos: resultadosCombinados.reduce((sum, v) => sum + v.totalEgresos, 0),
            netMovimientos: resultadosCombinados.reduce((sum, v) => sum + v.netMovimientos, 0),
            totalMovimientos: resultadosCombinados.reduce((sum, v) => sum + v.totalMovimientos, 0)
        };

        res.json({
            status: 0,
            message: 'Totales de corte general obtenidos correctamente',
            data: {
                corteGeneral: {
                    idcortescajageneral: corteGeneralActivo.idcortescajageneral,
                    fechainicio: corteGeneralActivo.fechainicio,
                    fechacierre: corteGeneralActivo.fechacierre
                },
                fechaInicio,
                fechaFin,
                idSucursal,
                totalesGenerales,
                detalleVendedores: resultadosCombinados,
                detalleCajas: totalesCajas
            }
        });

    } catch (error) {
        console.error('Error al obtener totales de corte general:', error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener los totales de corte general',
            data: error.message
        });
    }
};

const finalizarCorteGeneral = async (req, res = response) => {
    const { 
        idCortescajaGeneral,
        idUser 
    } = req.body;

    try {
        // Validar parámetros requeridos
        if (!idCortescajaGeneral || !idUser) {
            return res.status(400).json({
                status: 1,
                message: 'Se requieren idCortescajaGeneral e idUser',
                data: null
            });
        }

        // Importar el modelo CortescajaGeneral
        const CortescajaGeneral = require('../models/cortescaja/cortescajageneral');

        // Buscar el corte general activo
        const corteGeneralActivo = await CortescajaGeneral.findByPk(idCortescajaGeneral);

        if (!corteGeneralActivo) {
            return res.status(404).json({
                status: 1,
                message: 'No se encontró el corte general especificado',
                data: null
            });
        }

        if (corteGeneralActivo.fechacierre) {
            return res.status(400).json({
                status: 1,
                message: 'Este corte general ya ha sido finalizado',
                data: null
            });
        }

        // Validar que no haya cortescaja abiertos en la sucursal
        const cortescajaAbiertos = await Cortescaja.findAll({
            where: {
                idSucursal: corteGeneralActivo.idSucursal,
                estatus: 'ABIERTO'
            }
        });

        if (cortescajaAbiertos.length > 0) {
            return res.status(200).json({
                status: 1,
                message: `No se puede finalizar el corte general. Hay ${cortescajaAbiertos.length} corte(s) de caja abierto(s) en la sucursal`,
                data: {
                    cortescajaAbiertos: cortescajaAbiertos.map(corte => ({
                        idcortescaja: corte.idcortescaja,
                        idcajas: corte.idcajas,
                        fecha: corte.fecha,
                        horaapertura: corte.horaapertura
                    }))
                }
            });
        }

        // Obtener los totales usando la función existente desde la fecha de inicio del corte
        const fechaInicio = moment(corteGeneralActivo.fechainicio).format('YYYY-MM-DD HH:mm:ss');
        const fechaFin = moment().format('YYYY-MM-DD HH:mm:ss');
        
        const totalesData = await obtenerDatosCorteGeneral(corteGeneralActivo.idSucursal, fechaInicio, fechaFin);

        // Actualizar el registro del corte general con los totales finales
        await corteGeneralActivo.update({
            fechacierre: dbConnection.literal(`'${fechaFin}'`), // Formato con moment
            totalefectivo: totalesData.totalesGenerales.totalEfectivo,
            totaltarjeta: totalesData.totalesGenerales.totalTarjeta,
            totaltransferencia: totalesData.totalesGenerales.totalTransferencia,
            totalventas: totalesData.totalesGenerales.totalVentas,
            totalgastos: totalesData.totalesGenerales.totalEgresos,
            saldofinal: totalesData.totalesGenerales.totalEfectivo + totalesData.totalesGenerales.netMovimientos,
            idUser: idUser
        });

        res.json({
            status: 0,
            message: 'Corte general finalizado correctamente',
            data: {
                corteGeneral: corteGeneralActivo,
                totalesDetallados: totalesData
            }
        });

    } catch (error) {
        console.error('Error al finalizar corte general:', error);
        res.status(500).json({
            status: 2,
            message: 'Error al finalizar el corte general',
            data: error.message
        });
    }
};

/**
 * Validar si existe un corte general activo para una sucursal
 * Esta función verifica si hay un período de corte general iniciado y sin finalizar
 * Se usa para validar si se pueden realizar movimientos de caja
 * 
 * @param {Object} req - Request object
 * @param {Object} req.params - Parámetros de la URL
 * @param {number} req.params.idSucursal - ID de la sucursal a validar
 * @param {Object} res - Response object
 * @returns {Object} Respuesta con información del corte activo o estado de validación
 */
const validarCorteGeneralActivo = async (req, res = response) => {
    const { idSucursal } = req.params;

    try {
        // Validar parámetro requerido
        if (!idSucursal) {
            return res.status(400).json({
                status: 1,
                message: 'Se requiere el ID de la sucursal',
                data: null
            });
        }

        // Importar el modelo CortescajaGeneral y cargar asociaciones
        const CortescajaGeneral = require('../models/cortescaja/cortescajageneral');
        
        // Cargar las asociaciones
        require('../models/cortescaja/asociaciones');

        // Buscar corte general activo (sin fecha de cierre) para la sucursal
        const corteGeneralActivo = await CortescajaGeneral.findOne({
            where: {
                idSucursal: parseInt(idSucursal),
                fechacierre: null
            },
            order: [['fechainicio', 'DESC']]
        });

        if (corteGeneralActivo) {
            // Buscar información adicional del usuario y sucursal por separado
            let usuario = null;
            let sucursal = null;

            if (corteGeneralActivo.idUser) {
                usuario = await User.findByPk(corteGeneralActivo.idUser, {
                    attributes: ['idUser', 'name']
                });
            }

            if (corteGeneralActivo.idSucursal) {
                sucursal = await Sucursales.findByPk(corteGeneralActivo.idSucursal, {
                    attributes: ['idSucursal', 'name']
                });
            }

            // Calcular duración del corte activo
            const fechaInicio = new Date(corteGeneralActivo.fechainicio);
            const ahora = new Date();
            const duracionMs = ahora - fechaInicio;
            const duracionHoras = Math.floor(duracionMs / (1000 * 60 * 60));
            const duracionMinutos = Math.floor((duracionMs % (1000 * 60 * 60)) / (1000 * 60));

            res.json({
                status: 0,
                message: 'Existe un corte general activo para esta sucursal',
                data: {
                    tieneCorteActivo: true,
                    puedeRealizarMovimientos: true,
                    corteActivo: {
                        idcortescajageneral: corteGeneralActivo.idcortescajageneral,
                        fechainicio: corteGeneralActivo.fechainicio,
                        idSucursal: corteGeneralActivo.idSucursal,
                        idUser: corteGeneralActivo.idUser,
                        duracion: {
                            horas: duracionHoras,
                            minutos: duracionMinutos,
                            texto: `${duracionHoras}h ${duracionMinutos}m`
                        },
                        usuario: usuario ? {
                            idUser: usuario.idUser,
                            nombre: usuario.name
                        } : null,
                        sucursal: sucursal ? {
                            idSucursal: sucursal.idSucursal,
                            nombre: sucursal.name
                        } : null
                    }
                }
            });
        } else {
            res.json({
                status: 0,
                message: 'No existe un corte general activo para esta sucursal',
                data: {
                    tieneCorteActivo: false,
                    puedeRealizarMovimientos: false,
                    corteActivo: null,
                    recomendacion: 'Debe iniciar un corte general antes de realizar movimientos en caja'
                }
            });
        }

    } catch (error) {
        console.error('Error al validar corte general activo:', error);
        res.status(500).json({
            status: 2,
            message: 'Error al validar el estado del corte general',
            data: error.message
        });
    }
};

// Función auxiliar para usar en otros controladores (sin respuesta HTTP)
const validarCorteGeneralActivoParaOperacion = async (idSucursal) => {
    try {
        // Importar el modelo CortescajaGeneral y cargar asociaciones
        const CortescajaGeneral = require('../models/cortescaja/cortescajageneral');
        require('../models/cortescaja/asociaciones');

        const corteGeneralActivo = await CortescajaGeneral.findOne({
            where: {
                idSucursal: parseInt(idSucursal),
                fechacierre: null
            }
        });

        return {
            valido: !!corteGeneralActivo,
            corteActivo: corteGeneralActivo,
            mensaje: corteGeneralActivo ? 
                'Corte general activo encontrado' : 
                'No existe un corte general activo para esta sucursal'
        };

    } catch (error) {
        console.error('Error al validar corte general:', error);
        return {
            valido: false,
            corteActivo: null,
            mensaje: 'Error al validar el corte general'
        };
    }
};

/**
 * Iniciar un nuevo período de corte general de caja
 * Esta función crea un registro inicial en CortescajaGeneral marcando el inicio del período
 * Maneja fechas con hora específica para casos de turnos nocturnos o períodos especiales
 * 
 * @param {Object} req - Request object
 * @param {Object} req.body - Datos para iniciar el corte
 * @param {number} req.body.idSucursal - ID de la sucursal
 * @param {number} req.body.idUser - ID del usuario que inicia el corte
 * @param {string} [req.body.fechaInicio] - Fecha y hora de inicio del período
 *   Formatos aceptados:
 *   - 'YYYY-MM-DD' -> Se agrega ' 00:00:00'
 *   - 'YYYY-MM-DD HH:mm:ss' -> Se usa tal como está
 *   - 'YYYY-MM-DD HH:mm' -> Se agrega ':00'
 *   - Si no se proporciona, se usa la fecha y hora actual
 * @param {Object} res - Response object
 */
const iniciarCorteGeneral = async (req, res = response) => {
    const { 
        idSucursal,
        idUser
    } = req.body;

    try {
        // Validar parámetros requeridos
        if (!idSucursal || !idUser) {
            return res.status(400).json({
                status: 1,
                message: 'Se requieren idSucursal e idUser',
                data: null
            });
        }

        // Generar fecha de inicio automáticamente en el servidor
        const fechaInicioCorte = moment().format('YYYY-MM-DD HH:mm:ss'); // Formato con moment

        // Importar el modelo CortescajaGeneral
        const CortescajaGeneral = require('../models/cortescaja/cortescajageneral');

        // Verificar si ya existe un corte general activo (sin fecha de cierre) para esta sucursal
        const corteActivoExistente = await CortescajaGeneral.findOne({
            where: {
                idSucursal: idSucursal,
                fechacierre: null
            }
        });

        if (corteActivoExistente) {
            return res.status(400).json({
                status: 1,
                message: 'Ya existe un corte general activo para esta sucursal. Debe finalizarlo primero.',
                data: {
                    corteActivo: corteActivoExistente
                }
            });
        }



        // Crear el registro inicial del corte general
        // Para evitar problemas de timezone, usamos sequelize.literal con el string directo
        const nuevoCorteGeneral = await CortescajaGeneral.create({
            fechainicio: dbConnection.literal(`'${fechaInicioCorte}'`),
            fechacierre: null, // Se mantendrá null hasta que se finalice
            idSucursal: idSucursal,
            totalefectivo: 0,
            totaltarjeta: 0,
            totaltransferencia: 0,
            totalventas: 0,
            totalgastos: 0,
            saldofinal: 0,
            idUser: idUser
        });

        res.json({
            status: 0,
            message: 'Corte general iniciado correctamente',
            data: {
                corteGeneral: nuevoCorteGeneral,
                fechaInicio: fechaInicioCorte,
                sucursal: {
                    idSucursal: idSucursal
                },
                usuario: {
                    idUser: idUser
                },
                configuracion: {
                    fechaGeneradaEnServidor: true,
                    formatoUtilizado: fechaInicioCorte,
                    permiteTurnosNocturnos: true,
                    descripcion: 'Período de corte iniciado automáticamente con fecha y hora del servidor'
                }
            }
        });

    } catch (error) {
        console.error('Error al iniciar corte general:', error);
        res.status(500).json({
            status: 2,
            message: 'Error al iniciar el corte general',
            data: error.message
        });
    }
};

// Función auxiliar para obtener datos sin crear respuesta HTTP
const obtenerDatosCorteGeneral = async (idSucursal, fechaInicio, fechaFin) => {
    // Query para obtener totales de ventas agrupados por vendedor
    const totalesVentas = await dbConnection.query(`
        SELECT 
            v.idVendedor,
            vend.nombre as nombreVendedor,
            COUNT(v.idVenta) as totalTransacciones,
            SUM(v.total) as totalVentas,
            SUM(CASE WHEN v.idTipoVenta = ${VENTA_CONTADO} THEN v.total ELSE 0 END) as ventasContado,
            SUM(CASE WHEN v.idTipoVenta = ${VENTA_CREDITO} THEN v.total ELSE 0 END) as ventasCredito,
            
            -- Totales por método de pago desde metodos_pago_detalle
            SUM(COALESCE(mpd.efectivo, 0)) as totalEfectivo,
            SUM(COALESCE(mpd.tarjeta, 0)) as totalTarjeta,
            SUM(COALESCE(mpd.transferencia, 0)) as totalTransferencia
            
        FROM ventas v
        LEFT JOIN vendedores vend ON v.idVendedor = vend.idVendedor
        LEFT JOIN pagos p ON v.idVenta = p.idVenta AND p.active = 1
        LEFT JOIN metodos_pago_detalle mpd ON p.idMetodosPagoDetalle = mpd.idMetodosPagoDetalle
        WHERE v.idSucursal = :idSucursal
        AND v.active = 1
        AND v.bClosed = 1
        AND DATE(v.createDate) BETWEEN :fechaInicio AND :fechaFin
        GROUP BY v.idVendedor, vend.nombre
        ORDER BY vend.nombre
    `, {
        replacements: { 
            idSucursal, 
            fechaInicio, 
            fechaFin 
        },
        type: Sequelize.QueryTypes.SELECT
    });

    // Query para obtener movimientos de efectivo
    const movimientosEfectivo = await dbConnection.query(`
        SELECT 
            mc.idUser as idVendedor,
            u.name as nombreVendedor,
            SUM(CASE WHEN mc.tipo = 'INGRESO' THEN mc.monto ELSE 0 END) as totalIngresos,
            SUM(CASE WHEN mc.tipo = 'EGRESO' THEN mc.monto ELSE 0 END) as totalEgresos,
            SUM(CASE WHEN mc.tipo = 'INGRESO' THEN mc.monto ELSE -mc.monto END) as netMovimientos,
            COUNT(*) as totalMovimientos
        FROM movimientos_caja mc
        LEFT JOIN users u ON mc.idUser = u.idUser
        LEFT JOIN cajas c ON mc.idcajas = c.idcajas
        WHERE c.idSucursal = :idSucursal
        AND DATE(STR_TO_DATE(mc.fecha, '%Y-%m-%d %H:%i:%s')) BETWEEN :fechaInicio AND :fechaFin
        AND mc.idformaspago = 1  -- Asumiendo que 1 es efectivo
        GROUP BY mc.idUser, u.name
        ORDER BY u.name
    `, {
        replacements: { 
            idSucursal, 
            fechaInicio, 
            fechaFin 
        },
        type: Sequelize.QueryTypes.SELECT
    });

    // Query para obtener totales agrupados por caja
    const totalesPorCaja = await dbConnection.query(`
        SELECT
            v.idCaja,
            c.nombre AS nombreCaja,
            COUNT(v.idVenta) as totalTransacciones,
            SUM(v.total) as totalVentas,
            SUM(COALESCE(mpd.efectivo, 0)) AS totalEfectivo,
            SUM(COALESCE(mpd.tarjeta, 0)) AS totalTarjeta,
            SUM(COALESCE(mpd.transferencia, 0)) AS totalTransferencia
        FROM ventas v
        INNER JOIN cajas c ON v.idCaja = c.idcajas
        LEFT JOIN pagos p ON p.idVenta = v.idVenta AND p.active = 1
        LEFT JOIN metodos_pago_detalle mpd ON p.idMetodosPagoDetalle = mpd.idMetodosPagoDetalle
        WHERE v.idSucursal = :idSucursal
        AND v.active = 1
        AND v.bClosed = 1
        AND DATE(v.createDate) BETWEEN :fechaInicio AND :fechaFin
        GROUP BY v.idCaja, c.nombre
        ORDER BY v.idCaja
    `, {
        replacements: { 
            idSucursal, 
            fechaInicio, 
            fechaFin 
        },
        type: Sequelize.QueryTypes.SELECT
    });

    // Combinar los resultados
    const resultadosCombinados = [];
    const vendedoresMap = new Map();

    // Procesar totales de ventas
    totalesVentas.forEach(venta => {
        const idVendedor = venta.idVendedor || 0;
        vendedoresMap.set(idVendedor, {
            idVendedor,
            nombreVendedor: venta.nombreVendedor || 'Sin asignar',
            totalTransacciones: parseInt(venta.totalTransacciones) || 0,
            totalVentas: parseFloat(venta.totalVentas) || 0,
            ventasContado: parseFloat(venta.ventasContado) || 0,
            ventasCredito: parseFloat(venta.ventasCredito) || 0,
            totalEfectivo: parseFloat(venta.totalEfectivo) || 0,
            totalTarjeta: parseFloat(venta.totalTarjeta) || 0,
            totalTransferencia: parseFloat(venta.totalTransferencia) || 0,
            totalIngresos: 0,
            totalEgresos: 0,
            netMovimientos: 0,
            totalMovimientos: 0
        });
    });

    // Procesar movimientos de efectivo
    movimientosEfectivo.forEach(movimiento => {
        const idVendedor = movimiento.idVendedor || 0;
        if (vendedoresMap.has(idVendedor)) {
            const vendedor = vendedoresMap.get(idVendedor);
            vendedor.totalIngresos = parseFloat(movimiento.totalIngresos) || 0;
            vendedor.totalEgresos = parseFloat(movimiento.totalEgresos) || 0;
            vendedor.netMovimientos = parseFloat(movimiento.netMovimientos) || 0;
            vendedor.totalMovimientos = parseInt(movimiento.totalMovimientos) || 0;
        } else {
            vendedoresMap.set(idVendedor, {
                idVendedor,
                nombreVendedor: movimiento.nombreVendedor || 'Sin asignar',
                totalTransacciones: 0,
                totalVentas: 0,
                ventasContado: 0,
                ventasCredito: 0,
                totalEfectivo: 0,
                totalTarjeta: 0,
                totalTransferencia: 0,
                totalIngresos: parseFloat(movimiento.totalIngresos) || 0,
                totalEgresos: parseFloat(movimiento.totalEgresos) || 0,
                netMovimientos: parseFloat(movimiento.netMovimientos) || 0,
                totalMovimientos: parseInt(movimiento.totalMovimientos) || 0
            });
        }
    });

    // Convertir Map a Array
    vendedoresMap.forEach(vendedor => {
        resultadosCombinados.push(vendedor);
    });

    // Procesar totales por caja
    const totalesCajas = totalesPorCaja.map(caja => ({
        idCaja: parseInt(caja.idCaja) || 0,
        nombreCaja: caja.nombreCaja || 'Sin nombre',
        totalTransacciones: parseInt(caja.totalTransacciones) || 0,
        totalVentas: parseFloat(caja.totalVentas) || 0,
        totalEfectivo: parseFloat(caja.totalEfectivo) || 0,
        totalTarjeta: parseFloat(caja.totalTarjeta) || 0,
        totalTransferencia: parseFloat(caja.totalTransferencia) || 0
    }));

    // Calcular totales generales
    const totalesGenerales = {
        totalVendedores: resultadosCombinados.length,
        totalTransacciones: resultadosCombinados.reduce((sum, v) => sum + v.totalTransacciones, 0),
        totalVentas: resultadosCombinados.reduce((sum, v) => sum + v.totalVentas, 0),
        ventasContado: resultadosCombinados.reduce((sum, v) => sum + v.ventasContado, 0),
        ventasCredito: resultadosCombinados.reduce((sum, v) => sum + v.ventasCredito, 0),
        totalEfectivo: resultadosCombinados.reduce((sum, v) => sum + v.totalEfectivo, 0),
        totalTarjeta: resultadosCombinados.reduce((sum, v) => sum + v.totalTarjeta, 0),
        totalTransferencia: resultadosCombinados.reduce((sum, v) => sum + v.totalTransferencia, 0),
        totalIngresos: resultadosCombinados.reduce((sum, v) => sum + v.totalIngresos, 0),
        totalEgresos: resultadosCombinados.reduce((sum, v) => sum + v.totalEgresos, 0),
        netMovimientos: resultadosCombinados.reduce((sum, v) => sum + v.netMovimientos, 0),
        totalMovimientos: resultadosCombinados.reduce((sum, v) => sum + v.totalMovimientos, 0)
    };

    return {
        fechaInicio,
        fechaFin,
        idSucursal,
        totalesGenerales,
        detalleVendedores: resultadosCombinados,
        detalleCajas: totalesCajas
    };
};


const obtenerUltimoFolioCorte = async (req, res = response) => {
    const { idSucursal, idcajas } = req.params;

    try {
        // Buscar el último corte de caja para esta sucursal y caja con estatus CERRADO
        const ultimoCorte = await Cortescaja.findOne({
            where: {
                idSucursal,
                idcajas,
                estatus: 'CERRADO'
            },
            order: [['idcortescaja', 'DESC']],
            attributes: ['idcortescaja', 'fecha', 'horacierre', 'estatus']
        });

        if (!ultimoCorte) {
            return res.status(400).json({
                status: 1,
                message: 'No se encontró ningún corte de caja para esta sucursal y caja',
                data: {
                    ultimoFolio: null,
                    siguienteFolio: 1
                }
            });
        }

        // Calcular el siguiente folio
        const siguienteFolio = ultimoCorte.idcortescaja + 1;

        res.json({
            status: 0,
            message: 'Último folio de corte obtenido correctamente',
            data: {
                ultimoFolio: ultimoCorte.idcortescaja,
                siguienteFolio: siguienteFolio,
                ultimoCorte: {
                    idcortescaja: ultimoCorte.idcortescaja,
                    fecha: ultimoCorte.fecha,
                    horacierre: ultimoCorte.horacierre,
                    estatus: ultimoCorte.estatus
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener el último folio de corte:', error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener el último folio de corte',
            data: null
        });
    }
};

module.exports = {
    obtenerCorteCajaIndividual,
    iniciarTurnoCaja,
    verificarTurnoActivo,
    validarTurnoActivoParaOperacion,
    RealizarCorteIndividual,
    obtenerTurnosActivos,
    obtenerCortesCajaPorFecha,
    obtenerCajerosConTurnosActivos,
    obtenerSaldoInicialSugerido,
    obtenerTotalesCorte,
    generarTicketCorteCaja,
    imprimirTicketCorteCaja,
    obtenerTotalesCorteGeneral,
    iniciarCorteGeneral,
    finalizarCorteGeneral,
    validarCorteGeneralActivo,
    validarCorteGeneralActivoParaOperacion,
    obtenerUltimoFolioCorte
}
