/**
 * Enum para los status de pagos
 * Sincronizado con la tabla cat_status_pagos en la base de datos
 */
export enum StatusPago {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  EN_PROCESO = 'EN_PROCESO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO',
  REEMBOLSADO = 'REEMBOLSADO',
  EXPIRADO = 'EXPIRADO',
  EN_MEDIACION = 'EN_MEDIACION'
}

/**
 * Configuración de colores para cada status de pago
 * Útil para mostrar badges en la UI
 */
export const StatusPagoColors: Record<StatusPago, string> = {
  [StatusPago.PENDIENTE]: 'yellow',
  [StatusPago.APROBADO]: 'green',
  [StatusPago.EN_PROCESO]: 'blue',
  [StatusPago.RECHAZADO]: 'red',
  [StatusPago.CANCELADO]: 'orange',
  [StatusPago.REEMBOLSADO]: 'purple',
  [StatusPago.EXPIRADO]: 'gray',
  [StatusPago.EN_MEDIACION]: 'cyan'
};

/**
 * Etiquetas legibles para cada status de pago
 */
export const StatusPagoLabels: Record<StatusPago, string> = {
  [StatusPago.PENDIENTE]: 'Pendiente',
  [StatusPago.APROBADO]: 'Aprobado',
  [StatusPago.EN_PROCESO]: 'En Proceso',
  [StatusPago.RECHAZADO]: 'Rechazado',
  [StatusPago.CANCELADO]: 'Cancelado',
  [StatusPago.REEMBOLSADO]: 'Reembolsado',
  [StatusPago.EXPIRADO]: 'Expirado',
  [StatusPago.EN_MEDIACION]: 'En Mediación'
};

/**
 * Descripciones para cada status de pago
 */
export const StatusPagoDescriptions: Record<StatusPago, string> = {
  [StatusPago.PENDIENTE]: 'Pago iniciado, esperando confirmación',
  [StatusPago.APROBADO]: 'Pago aprobado y confirmado',
  [StatusPago.EN_PROCESO]: 'Pago en proceso de verificación',
  [StatusPago.RECHAZADO]: 'Pago rechazado por la entidad financiera',
  [StatusPago.CANCELADO]: 'Pago cancelado por el usuario o sistema',
  [StatusPago.REEMBOLSADO]: 'Pago reembolsado al cliente',
  [StatusPago.EXPIRADO]: 'Pago expirado por tiempo de espera',
  [StatusPago.EN_MEDIACION]: 'Pago en proceso de mediación o disputa'
};

/**
 * Interface para el catálogo de status de pagos
 */
export interface CatStatusPago {
  idStatusPago: number;
  codigo: StatusPago;
  nombre: string;
  descripcion: string;
  color: string;
  orden: number;
  activo: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Función helper para obtener el label de un status de pago
 */
export function getStatusPagoLabel(status: StatusPago): string {
  return StatusPagoLabels[status] || status;
}

/**
 * Función helper para obtener el color de un status de pago
 */
export function getStatusPagoColor(status: StatusPago): string {
  return StatusPagoColors[status] || 'gray';
}

/**
 * Función helper para obtener la descripción de un status de pago
 */
export function getStatusPagoDescription(status: StatusPago): string {
  return StatusPagoDescriptions[status] || '';
}

/**
 * Función para verificar si un pago es exitoso
 */
export function esPagoExitoso(status: StatusPago): boolean {
  return status === StatusPago.APROBADO;
}

/**
 * Función para verificar si un pago falló
 */
export function esPagoFallido(status: StatusPago): boolean {
  return [
    StatusPago.RECHAZADO,
    StatusPago.CANCELADO,
    StatusPago.EXPIRADO
  ].includes(status);
}

/**
 * Función para verificar si un pago está en proceso
 */
export function estaPagoEnProceso(status: StatusPago): boolean {
  return [
    StatusPago.PENDIENTE,
    StatusPago.EN_PROCESO
  ].includes(status);
}

/**
 * Función para verificar si un pago puede ser reembolsado
 */
export function puedeSerReembolsado(status: StatusPago): boolean {
  return status === StatusPago.APROBADO;
}
