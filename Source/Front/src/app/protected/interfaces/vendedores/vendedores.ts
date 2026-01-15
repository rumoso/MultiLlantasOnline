import { Cart } from "../ventas/cart";

export interface Vendedores {
  idVendedor:number,
  createDate:Date,
  nombre:string,
  fechaIngreso:Date,
  fechaNacimiento:Date,
  sexo:string,
  idUser:number,
  idStatusVendedor: number,
  calle:string,
  numExt:string,
  numInt:string,
  entreCalle:string,
  codigocolonia:number,
  rfc:string,
  telefono:string,
  email:string,
  lat:string,
  long:string,
  active:boolean
}


export function initVendedor(): Vendedores {
  return {
    idVendedor: 0,
    createDate: new Date(),
    nombre: '',
    fechaIngreso: new Date(),
    fechaNacimiento: new Date(),
    sexo: '',
    idUser: 0,
    idStatusVendedor: 0,
    calle: '',
    numExt: '',
    numInt: '',
    entreCalle: '',
    codigocolonia: 0,
    rfc: '',
    telefono: '',
    email: '',
    lat: '',
    long: '',
    active: true
  };
}