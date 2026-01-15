/**
 * Enum para los status de órdenes
 * Sincronizado con la tabla cat_status_ordenes en la base de datos
 */
export enum StatusOrden {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  EN_PROCESO = 'EN_PROCESO',
  ENVIADA = 'ENVIADA',
  ENTREGADA = 'ENTREGADA',
  CANCELADA = 'CANCELADA',
  DEVUELTA = 'DEVUELTA',
  REEMBOLSADA = 'REEMBOLSADA'
}

/**
 * Configuración de colores para cada status de orden
 * Útil para mostrar badges en la UI
 */
export const StatusOrdenColors: Record<StatusOrden, string> = {
  [StatusOrden.PENDIENTE]: 'yellow',
  [StatusOrden.PAGADA]: 'blue',
  [StatusOrden.EN_PROCESO]: 'orange',
  [StatusOrden.ENVIADA]: 'purple',
  [StatusOrden.ENTREGADA]: 'green',
  [StatusOrden.CANCELADA]: 'red',
  [StatusOrden.DEVUELTA]: 'gray',
  [StatusOrden.REEMBOLSADA]: 'cyan'
};

/**
 * Etiquetas legibles para cada status de orden
 */
export const StatusOrdenLabels: Record<StatusOrden, string> = {
  [StatusOrden.PENDIENTE]: 'Pendiente',
  [StatusOrden.PAGADA]: 'Pagada',
  [StatusOrden.EN_PROCESO]: 'En Proceso',
  [StatusOrden.ENVIADA]: 'Enviada',
  [StatusOrden.ENTREGADA]: 'Entregada',
  [StatusOrden.CANCELADA]: 'Cancelada',
  [StatusOrden.DEVUELTA]: 'Devuelta',
  [StatusOrden.REEMBOLSADA]: 'Reembolsada'
};

/**
 * Descripciones para cada status de orden
 */
export const StatusOrdenDescriptions: Record<StatusOrden, string> = {
  [StatusOrden.PENDIENTE]: 'Orden creada, esperando confirmación de pago',
  [StatusOrden.PAGADA]: 'Pago confirmado y procesado exitosamente',
  [StatusOrden.EN_PROCESO]: 'Orden en preparación para envío',
  [StatusOrden.ENVIADA]: 'Orden despachada y en tránsito',
  [StatusOrden.ENTREGADA]: 'Orden entregada al cliente',
  [StatusOrden.CANCELADA]: 'Orden cancelada por el cliente o sistema',
  [StatusOrden.DEVUELTA]: 'Orden devuelta por el cliente',
  [StatusOrden.REEMBOLSADA]: 'Orden con reembolso procesado'
};

/**
 * Interface para el catálogo de status de órdenes
 */
export interface CatStatusOrden {
  idStatusOrden: number;
  codigo: StatusOrden;
  nombre: string;
  descripcion: string;
  color: string;
  orden: number;
  activo: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Función helper para obtener el label de un status
 */
export function getStatusOrdenLabel(status: StatusOrden): string {
  return StatusOrdenLabels[status] || status;
}

/**
 * Función helper para obtener el color de un status
 */
export function getStatusOrdenColor(status: StatusOrden): string {
  return StatusOrdenColors[status] || 'gray';
}

/**
 * Función helper para obtener la descripción de un status
 */
export function getStatusOrdenDescription(status: StatusOrden): string {
  return StatusOrdenDescriptions[status] || '';
}

/**
 * Función para verificar si un status permite cancelación
 */
export function puedeSerCancelada(status: StatusOrden): boolean {
  return [StatusOrden.PENDIENTE, StatusOrden.PAGADA, StatusOrden.EN_PROCESO].includes(status);
}

/**
 * Función para verificar si un status permite devolución
 */
export function puedeSerDevuelta(status: StatusOrden): boolean {
  return [StatusOrden.ENTREGADA].includes(status);
}

/**
 * Función para verificar si un status es final (no puede cambiar)
 */
export function esStatusFinal(status: StatusOrden): boolean {
  return [
    StatusOrden.ENTREGADA,
    StatusOrden.CANCELADA,
    StatusOrden.DEVUELTA,
    StatusOrden.REEMBOLSADA
  ].includes(status);
}
