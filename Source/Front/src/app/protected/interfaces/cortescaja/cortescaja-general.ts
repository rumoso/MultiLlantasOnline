// Interfaz principal para los cortes de caja generales (consolidados)
export interface CortescajaGeneral {
  idcortescajageneral?: number;     // PK autoincremental (opcional para nuevos registros)
  fecha: Date | string;             // Fecha del corte general (DATEONLY en backend)
  idSucursal: number;               // ID de la sucursal (SMALLINT)
  totalefectivo: number;            // Total consolidado de efectivo
  totaltarjeta: number;             // Total consolidado de pagos con tarjeta
  totaltransferencia: number;       // Total consolidado de transferencias
  totalventas: number;              // Total consolidado de ventas
  totalgastos: number;              // Total consolidado de gastos
  saldofinal: number;               // Saldo final consolidado
  idUser?: number;                  // ID del usuario que generó el corte general
}

// Interfaz para consultas y filtros de cortes generales
export interface FiltroCortescajaGeneral {
  fecha?: Date | string;
  fechaInicio?: Date | string;
  fechaFin?: Date | string;
  idSucursal?: number;
  idUser?: number;
}

