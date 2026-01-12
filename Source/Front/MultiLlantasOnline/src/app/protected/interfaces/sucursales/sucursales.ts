export interface Sucursales {
  idSucursal: number,
  createDate: Date,
  name: string,
  calle: string,
  numExt: string,
  numInt: string,
  entreCalles: string,
  codigocolonia: number,
  telefono: string,
  email: string,
  lat: string,
  long: string,
  active: boolean
}

// Interfaz específica para la respuesta del endpoint CGetSucursalByID
export interface SucursalResponse {
  idSucursal: number;
  createDate: string;
  name: string;
  calle: string;
  entreCalles: string;
  codigocolonia: number;
  colonia: string;
  municipio: string;
  estado: string;
  codigopostal: string;
  telefono: string;
  email: string;
  numExt: string;
  numInt: string;
  lat: string;
  long: string;
  active: number;
}

export function initSucursales(): Sucursales {
  return {
    idSucursal: 0,
    createDate: new Date(),
    name: '',
    calle: '',
    numExt: '',
    numInt: '',
    entreCalles: '',
    codigocolonia: 0,
    telefono: '',
    email: '',
    lat: '',
    long: '',
    active: true
  };
}
