const { response } = require('express');
const bcryptjs = require('bcryptjs');
const moment = require('moment');

const { dbConnection } = require('../database/config');

function agruparCarrito(carrito, detalleKey = 'idPedidoDetalle') {
    const agrupados = {};

    carrito.forEach(item => {
        const key = `${item.idProducto}|${item.valorMedida}|${item.idUnidadMedida}`;
        if (!agrupados[key]) {
            agrupados[key] = {
                idProducto: item.idProducto,
                cantidad: parseFloat(item.cantidad),
                valorMedida: item.valorMedida,
                idUnidadMedida: item.idUnidadMedida,
                precioUnitario: parseFloat(item.precioUnitarioOLD),
                bCanEnvase: item.bCanEnvase,
                // Mantiene el idDetalle solo si cumple la condición, si no, pone 0
                [detalleKey]: (
                    item.idUnidadMedida !== 2 ||
                    (Number(item.valorMedida) !== 20 && Number(item.valorMedida) !== 4)
                ) ? item[detalleKey] : 0
            };
        } else {
            agrupados[key].cantidad += parseFloat(item.cantidad);
        }
    });

    return Object.values(agrupados);
}

/**
 * Prorratea los envases por valorMedida e idUnidadMedida usando una lista simplificada y agrupada.
 * Prorratea primero a los productos con menor precioUnitario.
 * Solo productos con bCanEnvase=1 pueden recibir envase (si bAllbEnvase=false).
 * 
 * @param {boolean} bAllbEnvase - Si true, ignora bCanEnvase; si false, solo productos con bCanEnvase=1 pueden recibir envase.
 * @param {Array} productosAgrupados - Lista agrupada y simplificada [{idProducto, cantidad, valorMedida, idUnidadMedida, precioUnitario, idPedidoDetalle}]
 * @param {Array} envasesPedido - Array de objetos { valorMedida, cantidad }
 * @returns {Array} prorrateados - Lista de productos prorrateados con bEnvase y cantidad
 */
function prorratearEnvases(bAllbEnvase, productosAgrupados, envasesPedido, detalleKey = 'idPedidoDetalle') {
    // Agrupa envases por presentación
    const envasesPorPresentacion = {};
    for (const env of envasesPedido) {
        envasesPorPresentacion[`${env.valorMedida}`] = Number(env.cantidad);
    }

    // Ordena los productos de menor a mayor precioUnitario
    const productosOrdenados = [...productosAgrupados].sort((a, b) => parseFloat(a.precioUnitario) - parseFloat(b.precioUnitario));

    const prorrateados = [];

    for (const prod of productosOrdenados) {
        const valorMedida = `${prod.valorMedida}`;
        const puedeCanjearEnvase = bAllbEnvase || prod.bCanEnvase == 1;
        let cantidad = parseFloat(prod.cantidad);
        let envasesDisponibles = envasesPorPresentacion.hasOwnProperty(valorMedida) ? envasesPorPresentacion[valorMedida] : 0;

        // Si no puede canjear envase o no hay envases disponibles, todo sin envase
        if (!puedeCanjearEnvase || envasesDisponibles <= 0) {
            prorrateados.push({
                ...prod,
                bEnvase: 0,
                total: cantidad * parseFloat(prod.precioUnitario),
                bChange: prod.bEnvase !== 0
            });
            continue;
        }

        // Si hay envases suficientes para toda la cantidad
        if (cantidad <= envasesDisponibles) {
            prorrateados.push({
                ...prod,
                bEnvase: 1,
                total: cantidad * parseFloat(prod.precioUnitario),
                bChange: prod.bEnvase != 1
            });
            envasesPorPresentacion[valorMedida] -= cantidad;
        } else {
            // Parte con envase
            if (envasesDisponibles > 0) {
                prorrateados.push({
                    ...prod,
                    cantidad: envasesDisponibles,
                    bEnvase: 1,
                    total: envasesDisponibles * parseFloat(prod.precioUnitario),
                    [detalleKey]: prod.bEnvase == 1 ? prod[detalleKey] : 0,
                    bChange: true
                });
            }
            // Parte sin envase
            const cantidadSinEnvase = cantidad - envasesDisponibles;
            if (cantidadSinEnvase > 0) {
                prorrateados.push({
                    ...prod,
                    cantidad: cantidadSinEnvase,
                    bEnvase: 0,
                    total: cantidadSinEnvase * parseFloat(prod.precioUnitario),
                    [detalleKey]: prod.bEnvase == 0 ? prod[detalleKey] : 0,
                    bChange: true
                });
            }
            envasesPorPresentacion[valorMedida] = 0;
        }
    }

    return { prorrateados };
}

async function validarPromociones(oData, detalleKey = 'idPedidoDetalle', bSinPromocion = false) {
    try
    {
        var { oHeader, productosList } = oData;
        //console.log('oHeader', oHeader);

        productosList.forEach((prod, idx) => {
            prod[detalleKey] = prod[detalleKey],
            prod.idLine = idx + 1;
            prod.descuento = parseFloat( "0.00" );
            prod.precioConDescuento = parseFloat( prod.precioUnitario );
            prod.total = parseFloat(prod.precioUnitario) * parseFloat(prod.cantidad);
            prod.aplicaPromo = false;
            prod.idPromocion = 0,
            prod.promoName = '';
        });

        const oGetDateNow = moment().format('YYYY-MM-DD');

        // 1. Obtiene promociones activas, ordenadas por prioridad DESC
        const [promocionesSQL] = await dbConnection.query(`
            SELECT * FROM promociones 
            WHERE activo = 1
            AND ( fechaInicio IS NULL OR CAST( fechaInicio AS DATE ) <= '${ oGetDateNow }' )
            AND ( fechaFin IS NULL OR CAST( fechaFin AS DATE ) >= '${ oGetDateNow }' )
            ORDER BY prioridad DESC
        `);
        if (!promocionesSQL.length || bSinPromocion) return { productosList: productosList, promosAplicadas: [] };

        // console.log(`
        //     SELECT * FROM promociones 
        //     WHERE activo = 1
        //     AND ( fechaInicio IS NULL OR CAST( fechaInicio AS DATE ) <= '${ oGetDateNow }' )
        //     AND ( fechaFin IS NULL OR CAST( fechaFin AS DATE ) >= '${ oGetDateNow }' )
        //     ORDER BY prioridad DESC
        // `)

        const promoIds = promocionesSQL.map(p => p.idPromocion).join(',');
        const [condicionesSQL] = await dbConnection.query(`SELECT * FROM promocioncondicion WHERE idPromocion IN (${promoIds})`);
        const [accionesSQL] = await dbConnection.query(`SELECT * FROM promocionaccion WHERE idPromocion IN (${promoIds})`);

        

        var promosAplicaPorCantidad = [];
        // --- NUEVO BLOQUE PARA PROMOS ACUMULABLES POR PRESENTACIÓN Y ENVASE ---
        for (const promo of promocionesSQL) {
            // Busca condiciones de cantidad mínima y presentaciones
            const conds = condicionesSQL.filter(c => c.idPromocion === promo.idPromocion);
            const presentacionesPermitidas = conds
                .filter(c => c.tipoCondicion === 'catalogo' && c.entidadObjetivo === 'cat_unidad_medida')
                .map(c => parseFloat(c.valor)); // Ejemplo: [0.5, 1, 4]
            //console.log('conds', conds);
            //console.log('presentacionesPermitidas: ' + promo.idPromocion, presentacionesPermitidas);

            const envaseCond = conds.find(c => c.tipoCondicion === 'envase_cambio');
            const cantidadMinCond = conds.find(c => c.tipoCondicion === 'cantidadMinima');
            //console.log('envaseCond: ' + promo.idPromocion, envaseCond);
            //console.log('cantidadMinCond: ' + promo.idPromocion, cantidadMinCond);

            if (cantidadMinCond && presentacionesPermitidas.length > 0) {
                // Suma cantidades de todos los productos que cumplen con la presentación y el envase (si aplica)
                const productosPromo = productosList.filter(prod =>
                    conds
                        .filter(c => c.tipoCondicion === 'catalogo' && c.entidadObjetivo === 'cat_unidad_medida')
                        .some(c =>
                            parseFloat(prod.idUnidadMedida) == parseFloat(c.idObjetivo) &&
                            parseFloat(prod.valorMedida) == parseFloat(c.valor)
                        )
                    &&
                    (
                        !envaseCond // Si no hay condición de envase, no valida
                        || Number(prod.bEnvase) === Number(envaseCond.valor) // Si hay, debe cumplir
                    )
                );
                //console.log('productosList', productosList)
                //console.log('productosPromo: ' + promo.idPromocion, productosPromo)

                const sumaCantidad = productosPromo.reduce((sum, prod) => sum + parseFloat(prod.cantidad), 0);
                //console.log('sumaCantidad: ' + promo.idPromocion, sumaCantidad);

                if (sumaCantidad >= parseFloat(cantidadMinCond.valor)) {
                    // Agrega cada producto involucrado al array promosCandidatasPorProducto (sin duplicados)
                    for (const prod of productosPromo) {
                        const yaExiste = promosAplicaPorCantidad.some(p =>
                            p.idLine === prod.idLine && p.idPromocion === promo.idPromocion
                        );
                        if (!yaExiste) {
                            promosAplicaPorCantidad.push({
                                idLine: prod.idLine,
                                idPromocion: promo.idPromocion
                            });
                        }
                    }
                }
            }
        }
        // --- FIN BLOQUE MODIFICADO ---

        //console.log('promosAplicaPorCantidad', promosAplicaPorCantidad);

        var promosCandidatasPorProducto = [];
        var productosParaPromocion = productosList.filter(prod => {

            //console.log('prod', prod.articuloName);

            for (const promo of promocionesSQL)
            {
                // Condiciones y acciones de esta promo
                const conds = condicionesSQL.filter(c => c.idPromocion === promo.idPromocion);

                // Agrupa condiciones por grupoCondicion
                const grupos = {};
                for (const c of conds) {
                    if (!grupos[c.grupoCondicion]) grupos[c.grupoCondicion] = [];
                    grupos[c.grupoCondicion].push(c);
                }
                let cumplenTodosGrupos = false;
                // Aplica condiciones por grupo (AND entre grupos, OR/AND dentro del grupo)
                var grupoKeys = Object.keys(grupos);
                for (let grupoLine = 0; grupoLine < grupoKeys.length; grupoLine++) {
                    var grupoId = grupoKeys[grupoLine];
                    var esUltimoGrupo = grupoLine === grupoKeys.length - 1;

                    const condicionesGrupo = grupos[grupoId];
                    //console.log('grupoKeys', grupoKeys);
                    //console.log('grupoId', grupoId);
                    //console.log('condicionesGrupo', condicionesGrupo);
                    
                    let cumpleGrupo = false;
                    for (let i = 0; i < condicionesGrupo.length; i++) {
                        const cond = condicionesGrupo[i];
                        let cumpleCond = false;
                        switch (cond.tipoCondicion) {

                            case 'cantidadMinima':
                            switch (cond.operador) {
                                case '>=':
                                    //console.log('cantidadMinima');
                                    cumpleCond = parseFloat( prod.cantidad ) >= parseFloat( cond.valor );
                                    if( !cumpleCond ) {
                                        // Verifica si el producto ya está en la lista promosAplicaPorCantidad
                                        var yaCumplioCantidadMinima = promosAplicaPorCantidad.some(p =>
                                            p.idLine === prod.idLine && p.idPromocion === promo.idPromocion
                                        );
                                        cumpleCond = yaCumplioCantidadMinima;
                                    }
                                    
                                    break;
                                }
                            break;
                            case 'catalogo':
                                switch (cond.entidadObjetivo) {
                                    case 'cat_unidad_medida':
                                        cumpleCond = prod.idUnidadMedida == cond.idObjetivo;
                                        //console.log('cat_unidad_medida');
                                        cumpleCond = !cumpleCond ? false : parseFloat( prod.valorMedida ) == parseFloat( cond.valor );

                                    break;
                                    case 'cat_tipo_cliente':
                                        cumpleCond = oHeader.idTipoCliente == cond.valor;
                                        //console.log('cat_tipo_cliente!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', oHeader.idTipoCliente == cond.valor);
                                    break;
                                    case 'cat_producto':
                                        //console.log('cat_producto');
                                        cumpleCond = Number( prod.idProducto ) == Number(cond.idObjetivo);
                                    break;
                                }
                            break;
                            // case 'presentacion':
                            //   cumpleCond = Number(prod.valorMedida) == Number(cond.valor);
                            //   break;
                            // case 'envase_cambio':
                            //   // Ahora bEnvase=1 es "a cambio"
                            //   cumpleCond = Number(prod.bEnvase) === 1;
                            //   break;
                            case 'envase_cambio':
                                //console.log('envase_cambio');
                                //console.log('cond.valor', cond.valor);
                                //console.log('prod.bEnvase', prod.bEnvase);
                            cumpleCond = Number( prod.bEnvase ) == Number( cond.valor );
                            //console.log('cumpleCond_envase_cambio', cumpleCond);
                            break;
                            
                            default:
                            cumpleCond = false;
                        }

                        if (cond.operacion === 'OR') {
                            if (cumpleCond){
                                cumpleGrupo = true;
                                //console.log('cumpleCond', cumpleCond);
                                //console.log('cumpleGrupo', cumpleGrupo);
                                break;
                            }
                        } 
                        else { // AND
                            if(!cumpleCond){
                                cumpleGrupo = false;
                                //console.log('cumpleCond', cumpleCond);
                                //console.log('cumpleGrupo', cumpleGrupo);
                                break;
                            }else{
                                var esUltima = ( i === condicionesGrupo.length - 1 );
                                // Si es la última condición del grupo, se mantiene el estado
                                if (esUltima)
                                    cumpleGrupo = true;
                                else
                                    cumpleGrupo = false;
                            }
                        }

                        //console.log('cumpleCond', cumpleCond);
                        //console.log('cumpleGrupo', cumpleGrupo);
                    }

                    if(!cumpleGrupo){
                        cumplenTodosGrupos = false;
                        grupoLine = grupoKeys.length;
                        break;
                    }

                    if( cumpleGrupo && esUltimoGrupo ) {
                        cumplenTodosGrupos = true;

                        const yaExiste = promosCandidatasPorProducto.some(p =>
                            p.idLine === prod.idLine && p.idPromocion === promo.idPromocion
                        );
                        if (!yaExiste) {
                            promosCandidatasPorProducto.push({
                                idLine: prod.idLine,
                                idPromocion: promo.idPromocion,
                                prioridad: promo.prioridad
                            });
                        }
                    }
                }
            }
            return promosCandidatasPorProducto.filter(p => p.idLine == prod.idLine).length > 0;

        });

        //console.log('productosParaPromocion', productosParaPromocion);
        //console.log('promosCandidatasPorProducto', promosCandidatasPorProducto);

        for (const prod of productosParaPromocion) {
            // Filtra las promos del producto
            const promos = promosCandidatasPorProducto.filter(p => p.idLine === prod.idLine);
            if (promos.length > 0) {
                // Busca la promo con mayor prioridad
                const promoMax = promos.reduce((max, p) => p.prioridad > max.prioridad ? p : max, promos[0]);
                if( promoMax ){
                    prod.aplicaPromo = true;
                    prod.idPromocion = promoMax.idPromocion;

                    var promocion = promocionesSQL.filter(p => p.idPromocion === promoMax.idPromocion)[0] || {};

                    const accionesPromo = accionesSQL.filter(a => a.idPromocion === promoMax.idPromocion);
                    const accion = accionesPromo[0]; // Asumiendo que solo hay una acción por promoción
                    switch (accion.tipoAccion) {
                        case 'descuento_porcentaje':
                            prod.descuento = ( parseFloat(accion.valor) / 100 ) * parseFloat( prod.precioUnitario );
                            prod.precioConDescuento = parseFloat(prod.precioUnitario) * (1 - Number(accion.valor) / 100);
                            prod.total = parseFloat(prod.precioConDescuento) * parseFloat(prod.cantidad);
                            if( 
                                ( oHeader.idTipoCliente == 1 || oHeader.idTipoCliente == 2 ) // CLIENTE Y CIENTE GENERAL
                                && prod.bEnvase == 1
                                && prod.idUnidadMedida == 2
                            ) {
                                prod.promoName = `Envase a cambio`;
                            }else{
                                prod.promoName = `${ Number( accion.valor ) }% de descuento`;
                            }
                            
                        break;
                        case 'descuento_agranel_porcentaje':
                            var productoRelacionPrecio = ( parseFloat( prod.precioEcoAgr ) > 0 ? parseFloat( prod.precioEcoAgr ) : parseFloat( prod.productoRelacionPrecio ) ) || 0;
                            prod.precioUnitario = parseFloat(productoRelacionPrecio) * parseFloat(prod.valorMedida);
                            prod.descuento = ( parseFloat(accion.valor) / 100 ) * parseFloat( prod.precioUnitario );
                            prod.precioConDescuento = parseFloat(prod.precioUnitario) * (1 - Number(accion.valor) / 100);
                            prod.total = parseFloat(prod.precioConDescuento) * parseFloat(prod.cantidad);
                            if( 
                                ( oHeader.idTipoCliente == 1 || oHeader.idTipoCliente == 2 ) // CLIENTE Y CIENTE GENERAL
                                && prod.bEnvase == 1
                                && prod.idUnidadMedida == 2
                            ) {
                                prod.promoName = `Envase a cambio`;
                            }else{
                                prod.promoName = `${ Number( accion.valor ) }% de descuento`;
                            }
                            
                        break;
                        case 'precio_agranel':
                            prod.precioUnitario = parseFloat(prod.productoRelacionPrecio) * parseFloat(prod.valorMedida);
                            prod.descuento = 0;
                            prod.precioConDescuento = parseFloat(prod.precioUnitario);
                            prod.total = parseFloat(prod.precioConDescuento) * parseFloat(prod.cantidad);

                            if( 
                                ( oHeader.idTipoCliente == 1 || oHeader.idTipoCliente == 2 ) // CLIENTE Y CIENTE GENERAL
                                && prod.bEnvase == 1
                                && prod.idUnidadMedida == 2
                            ) {
                                prod.promoName = `Envase a cambio`;
                            }else{
                                prod.promoName = `Precio agranel`;
                            }
                            
                        break;
                        case 'precio_fijo':
                            // Busca la condición que corresponde al producto actual
                            const condPrecioFijo = condicionesSQL.find(c =>
                                c.idPromocion === promoMax.idPromocion &&
                                c.tipoCondicion === 'catalogo' &&
                                c.entidadObjetivo === 'cat_producto' &&
                                Number(c.idObjetivo) === Number(prod.idProducto)
                            );
                            if (condPrecioFijo) {
                                prod.precioUnitario = parseFloat(condPrecioFijo.valor);
                                prod.descuento = 0;
                                prod.precioConDescuento = parseFloat(prod.precioUnitario);
                                prod.total = parseFloat(prod.precioConDescuento) * parseFloat(prod.cantidad);

                                if(
                                ( oHeader.idTipoCliente == 1 || oHeader.idTipoCliente == 2 ) // CLIENTE Y CIENTE GENERAL
                                    && prod.bEnvase == 1
                                    && prod.idUnidadMedida == 2
                                ) {
                                    prod.promoName = `Envase a cambio`;
                                }else{
                                    prod.promoName = `Precio con promoción`;
                                }
                            }
                        break;
                        case 'descuento_porcentaje_p_agranel':
                            var productoRelacionPrecio = ( parseFloat( prod.precioEcoAgr ) > 0 ? parseFloat( prod.precioEcoAgr ) : parseFloat( prod.productoRelacionPrecio ) ) || 0;
                            prod.precioUnitario = parseFloat(productoRelacionPrecio) * parseFloat(prod.valorMedida);
                            prod.descuento = ( parseFloat(accion.valor) / 100 ) * parseFloat( prod.precioUnitario );
                            prod.precioConDescuento = parseFloat(prod.precioUnitario) * (1 - Number(accion.valor) / 100);
                            prod.total = parseFloat(prod.precioConDescuento) * parseFloat(prod.cantidad);

                            if( 
                                ( oHeader.idTipoCliente == 1 || oHeader.idTipoCliente == 2 ) // CLIENTE Y CIENTE GENERAL
                                && prod.bEnvase == 1
                                && prod.idUnidadMedida == 2
                            ) {
                                prod.promoName = `Envase a cambio`;
                            }else{
                                prod.promoName = `${ Number( accion.valor ) }% de descuento agranel`;
                            }

                        break;
                    }
                }
            }
        }

        return { productosList };

    } catch (error) {
            console.log('error', { error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...error // incluye otros campos si existen
        } })
    }
  

}

module.exports = {
    agruparCarrito,
    prorratearEnvases,
    validarPromociones
};