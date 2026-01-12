

const constantes = {
    ESTADO_ACTIVO: 1,
    ESTADO_INACTIVO: 0,
    TIPOS_MOVIMIENTO: {
        INGRESO: 'INGRESO',
        EGRESO: 'EGRESO',
        AMBOS: 'AMBOS'
    },
    // Catálogo de status para órdenes
    STATUS_ORDEN: {
        PENDIENTE: 'PENDIENTE',
        PAGADA: 'PAGADA',
        EN_PROCESO: 'EN_PROCESO',
        ENVIADA: 'ENVIADA',
        ENTREGADA: 'ENTREGADA',
        CANCELADA: 'CANCELADA',
        DEVUELTA: 'DEVUELTA',
        REEMBOLSADA: 'REEMBOLSADA'
    },
    // Catálogo de status para pagos
    STATUS_PAGO: {
        PENDIENTE: 'PENDIENTE',
        APROBADO: 'APROBADO',
        EN_PROCESO: 'EN_PROCESO',
        RECHAZADO: 'RECHAZADO',
        CANCELADO: 'CANCELADO',
        REEMBOLSADO: 'REEMBOLSADO',
        EXPIRADO: 'EXPIRADO',
        EN_MEDIACION: 'EN_MEDIACION'
    }
};

module.exports = constantes;