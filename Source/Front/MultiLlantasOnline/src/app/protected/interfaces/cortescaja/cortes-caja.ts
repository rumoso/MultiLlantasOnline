// Interfaz principal para los cortes de caja
export interface CortesCaja {
  idcortescaja?: number;           // PK autoincremental (opcional para nuevos registros)
  fecha: string;            // Fecha del corte (DATEONLY en backend)
  horaapertura?: string;           // Hora de apertura (TIME format: HH:mm:ss)
  horacierre?: string;             // Hora de cierre (TIME format: HH:mm:ss)
  idUser: number;                  // ID del usuario/cajero (BIGINT)
  idSucursal: number;              // ID de la sucursal (SMALLINT)
  idcajas: number;                 // ID de la caja/punto de venta
  idturnoscaja: number;           // ID del turno de caja (opcional, puede ser usado para asociar el corte a un turno específico)
  saldoinicial: number;            // Saldo inicial del corte
  totalefectivo: number;           // Total de efectivo
  totaltarjeta: number;            // Total de pagos con tarjeta
  totaltransferencia: number;      // Total de transferencias
  totalcheque: number;             // Total de pagos con cheque
  totaldineroelectronico: number;  // Total de dinero electrónico
  totalventas: number;             // Total de ventas
  totalgastos: number;             // Total de gastos
  saldofinal: number;              // Saldo final calculado
  efectivocontado: number;         // Efectivo físico contado
  diferencia: number;              // Diferencia entre contado y calculado
  retiroporcorte: number;          // Retiro por corte de caja
  observaciones?: string;          // Observaciones del corte
  estatus: EstatusCorte;           // Estado del corte
  createdAt?: string;              // Fecha y hora de creación del registro
  updatedAt?: string;              // Fecha y hora de última actualización del registro
}

// Función para inicializar un objeto CortesCaja con valores por defecto
export function initCortesCaja(): CortesCaja {
  return {
    idcortescaja: 0,
    fecha: new Date().toISOString().split('T')[0],
    horaapertura: '',
    horacierre: '',
    idUser: 0,
    idSucursal: 0,
    idcajas: 0,
    idturnoscaja: 0,
    saldoinicial: 0,
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
    observaciones: '',
    estatus: EstatusCorte.ABIERTO, // Estado por defecto
    createdAt: '',
    updatedAt: ''
  };
}

export interface CorteGet{
  corteCaja: CortesCaja;
  resumen: Resumen;
}

export function initCorteGet(): CorteGet {
  return {
    corteCaja: initCortesCaja(),
    resumen: initResumen()
  };
}

export interface Resumen{
  totalVentasContado:number;
  totalVentasCredito:number;
  totalOrdenesCompra:number;  // Ahora incluido en la nueva estructura de respuesta
  movimientosCaja:MovimientosCajaCorte; // Resumen de movimientos de caja
  totales: Totales; // Nueva estructura de totales
  desglosePorMetodo: DesglosePorMetodo;
  desglosePorMetodoContado: DesglosePorMetodo;
  desglosePorMetodoCredito: DesglosePorMetodo;
}

// Nueva interfaz para la estructura de totales
export interface Totales {
  totalIngresosCombinados: number;
  totalGastosCombinados: number;
  saldoFinalEfectivo: number;
  calculoSaldoFinal: CalculoSaldoFinal;
}

// Nueva interfaz para el cálculo detallado del saldo final
export interface CalculoSaldoFinal {
  saldoInicial: number;
  ventasEfectivo: number;
  ingresosEfectivo: number;
  egresosEfectivo: number;
  gastosEfectivo: number;
}

// Función para inicializar Totales
export function initTotales(): Totales {
  return {
    totalIngresosCombinados: 0,
    totalGastosCombinados: 0,
    saldoFinalEfectivo: 0,
    calculoSaldoFinal: initCalculoSaldoFinal()
  };
}

// Función para inicializar CalculoSaldoFinal
export function initCalculoSaldoFinal(): CalculoSaldoFinal {
  return {
    saldoInicial: 0,
    ventasEfectivo: 0,
    ingresosEfectivo: 0,
    egresosEfectivo: 0,
    gastosEfectivo: 0
  };
}

export function initResumen(): Resumen {
  return {
    totalVentasContado: 0,
    totalVentasCredito: 0,
    totalOrdenesCompra: 0,
    movimientosCaja: initMovimientosCajaCorte(), // Resumen de movimientos de caja
    totales: initTotales(),
    desglosePorMetodo: initDesglosePorMetodo(),
    desglosePorMetodoContado: initDesglosePorMetodo(),
    desglosePorMetodoCredito: initDesglosePorMetodo()
  };
}

export interface MovimientosCajaCorte{
    totalIngresos: number;
    totalEgresos: number;
    diferencia: number;
    efectivo: {
      totalIngresos: number;
      totalEgresos: number;
      diferencia: number;
    };
    desglosePorFormaPago: {
      ingresos: Record<string, any>;  // Estructura flexible para diferentes formas de pago
      egresos: Record<string, any>;   // Estructura flexible para diferentes formas de pago
    };
  }


export function initMovimientosCajaCorte(): MovimientosCajaCorte {
  return {
    totalIngresos: 0,
    totalEgresos: 0,
    diferencia: 0,
    efectivo: {
      totalIngresos: 0,
      totalEgresos: 0,
      diferencia: 0
    },
    desglosePorFormaPago: {
      ingresos: {},
      egresos: {}
    }
  };
}

export interface DesglosePorMetodo{
    efectivo: number;
    tarjeta: number;
    transferencia: number;
    cheque: number;
    dineroElectronico: number;
  };

export function initDesglosePorMetodo(): DesglosePorMetodo {
  return {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0,
    cheque: 0,
    dineroElectronico: 0
  };
}

// Enum para los posibles estados del corte
export enum EstatusCorte {
  ABIERTO = 'ABIERTO',
  CERRADO = 'CERRADO',
  REVISADO = 'REVISADO'
}

// Interfaz para crear un nuevo corte (campos mínimos requeridos)
export interface NuevoCortesCaja {
  fecha: Date | string;
  idUser: number;
  idSucursal: number;
  idcajas: number;
  saldoinicial: number;
  observaciones?: string;
}

// Interfaz para consultas y filtros
export interface FiltroCortesCaja {
  fecha?: Date | string;
  fechaInicio?: Date | string;
  fechaFin?: Date | string;
  idUser?: number;
  idSucursal?: number;
  idcajas?: number;
  estatus?: EstatusCorte;
}
