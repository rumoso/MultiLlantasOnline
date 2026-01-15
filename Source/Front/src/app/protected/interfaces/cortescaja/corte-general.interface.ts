// Interfaces para el corte de caja general

export interface TotalesGenerales {
  totalVendedores: number;
  totalTransacciones: number;
  totalVentas: number;
  ventasContado: number;
  ventasCredito: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  totalIngresos: number;
  totalEgresos: number;
  netMovimientos: number;
  totalMovimientos: number;
}

export interface DetalleVendedor {
  idVendedor: number;
  nombreVendedor: string;
  totalTransacciones: number;
  totalVentas: number;
  ventasContado: number;
  ventasCredito: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  totalIngresos: number;
  totalEgresos: number;
  netMovimientos: number;
  totalMovimientos: number;
}

export interface DetalleCaja {
  idCaja: number;
  nombreCaja: string;
  totalTransacciones: number;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
}

export interface CorteGeneralData {
  fechaInicio: string;
  fechaFin: string;
  idSucursal: number;
  totalesGenerales: TotalesGenerales;
  detalleVendedores: DetalleVendedor[];
  detalleCajas: DetalleCaja[];
}

export interface CorteGeneralResponse {
  status: number;
  message: string;
  data: CorteGeneralData;
}

export interface CorteGeneralRequest {
  idSucursal: number;
  fechaInicio: string;
  fechaFin: string;
}

// Interfaces para el endpoint de finalizar corte general

export interface FinalizarCorteGeneralRequest {
  idCortescajaGeneral: number;
  idUser: number;
  fechaCierre?: string; // Opcional - formato: "2025-08-15 18:00:00" o ISO
  observaciones?: string;
}

// Interfaces para el endpoint de iniciar corte general

export interface IniciarCorteGeneralRequest {
  idSucursal: number;
  idUser: number;
  fechaInicio?: string; // Opcional - formato: "2025-08-15 08:00:00" o ISO
  observaciones?: string;
}

export interface SucursalInfo {
  idSucursal: number;
  name: string;
}

export interface IniciarCorteGeneralResponse {
  corteGeneral: CorteGeneralInfo;
  sucursal: SucursalInfo;
  usuario: UsuarioInfo;
}

export interface ErrorCorteActivo {
  corteActivo: {
    idcortescajageneral: number;
    fechainicio: string;
    estatus: string;
  };
  sucursal: SucursalInfo;
}

// Interfaces para el endpoint de validar corte general

export interface CorteGeneralExpandido extends CorteGeneralInfo {
  User: UsuarioInfo;
  Sucursale: SucursalInfo;
}

export interface ValidarCorteGeneralResponse {
  corteActivo: CorteGeneralExpandido | null;
  sucursal: SucursalInfo;
  mensaje: string;
}

// Interfaces compartidas entre iniciar y finalizar

export interface CorteGeneralInfo {
  idcortescajageneral: number;
  idSucursal: number;
  idUser: number;
  fechainicio: string;
  fechacierre: string | null;
  observaciones: string;
  estatus: 'ACTIVO' | 'CERRADO';
  createDate: string;
  updateDate: string;
}

export interface ResumenFinalizacion {
  duracionPeriodo: string;
  fechaInicio: string;
  fechaCierre: string;
}

export interface UsuarioInfo {
  idUser: number;
  name: string;
}

export interface FinalizarCorteGeneralResponse {
  corteGeneral: CorteGeneralInfo;
  resumen: ResumenFinalizacion;
  usuario: UsuarioInfo;
}

// Interface para el endpoint de último folio
export interface UltimoCorte {
  idcortescaja: number;
  fecha: string;
  horacierre: string;
  estatus: string;
}

export interface UltimoFolioData {
  ultimoFolio: number;
  siguienteFolio: number;
  ultimoCorte: UltimoCorte;
}

export interface UltimoFolioResponse {
  status: number;
  message: string;
  data: UltimoFolioData;
}
