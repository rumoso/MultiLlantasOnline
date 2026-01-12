// src/app/core/utils/date-utils.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {

  /**
   * Formatea una fecha al formato "YYYY-MM-DD HH:mm:ss" sin timezone
   * @param fecha Fecha a formatear
   * @returns String con formato "2025-07-18 07:14:00"
   */
  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Obtiene la fecha actual formateada
   * @returns String con la fecha actual en formato "2025-07-18 07:14:00"
   */
  obtenerFechaActual(): string {
    return this.formatearFecha(new Date());
  }

  /**
   * Formatea una fecha a solo fecha (YYYY-MM-DD)
   * @param fecha Fecha a formatear
   * @returns String con formato "2025-07-18"
   */
  formatearSoloFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Formatea una fecha al formato yyyymmdd (sin guiones)
   * @param fecha Fecha a formatear
   * @returns String con formato "20250802"
   */
  formatearFechaYYYYMMDD(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
  }

  /**
   * Formatea una fecha al formato yyyyMMddHHmmss (sin guiones ni separadores)
   * @param fecha Fecha a formatear
   * @returns String en formato "20250802143045"
   */
  formatearFechaYYYYMMDDHHmmss(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Formatea una fecha para obtener solo la hora en formato HHmmss
   * @param fecha Fecha a formatear
   * @returns String en formato "143045"
   */
  formatearSoloHoraHHmmss(fecha: Date): string {
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `${hours}${minutes}${seconds}`;
  }
}
