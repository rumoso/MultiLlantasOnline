import { initSucursales, Sucursales } from '../sucursales/sucursales';

export interface Cajas {
  idcajas: number;
  idSucursal: number;
  nombre: string;
  descripcion: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  activeuuid: string;
  ultimouso: string;
  esgeneral: boolean;
  estatus: EstatusCaja.ABIERTA | EstatusCaja.CERRADA;
  sucursales:Sucursales
}


export enum EstatusCaja {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
}

export function initCajas(): Cajas {
  return {
    idcajas: 0,
    idSucursal: 0,
    nombre: '',
    descripcion: '',
    active: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    activeuuid: '',
    ultimouso: '',
    esgeneral: false,
    estatus: EstatusCaja.CERRADA, // Estado por defecto
    sucursales: initSucursales()
  };
}

export enum TipoMovimiento{
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO',
  AMBOS = 'AMBOS'
}

export interface CatTipoMovimientoCaja {
  idcatmovimientoscaja:number;
  descripcion: string;
  activo: boolean;
  tipo_movimiento: TipoMovimiento;
}
export function initCatTipoMovimientoCaja(): CatTipoMovimientoCaja {
  return {
    idcatmovimientoscaja: 0,
    descripcion: '',
    activo: true,
    tipo_movimiento: TipoMovimiento.AMBOS
  };
}

export interface FormasPago {
  idformaspago: number;
  descripcion: string;
  activo: boolean;
}
export function initFormasPago(): FormasPago {
  return {
    idformaspago: 0,
    descripcion: '',
    activo: true
  };
}


export interface MovimientosCaja {
  idmovimientoscaja: number;
  fecha: string;
  tipo: 'INGRESO' | 'EGRESO';
  monto: number;
  idcatmovimientos: number;
  idformaspago: number;
  idUser: number;
  idturnoscaja: number;
  idcajas: number;
  observaciones: string;
  updatedAt: Date;
  createdAt: Date;
}
export function initMovimientosCaja(): MovimientosCaja {
  return {
    idmovimientoscaja: 0,
    fecha: '',
    tipo: 'INGRESO',
    monto: 0,
    idcatmovimientos: 0,
    idformaspago: 0,
    idUser: 0,
    idturnoscaja: 0,
    idcajas: 0,
    observaciones: '',
    updatedAt: new Date(),
    createdAt: new Date()
  };
}

