import { Cart } from "../ventas/cart";

export interface Impresoratickets {
  idimpresoratickets: number,
  nombrenegocio:string,
  razonsocial:string,
  rfc:string,
  direccion:string,
  telefono:string,
  agradecimiento:string,
  infoadicional:string,
  idSucursal:number
 }


 export function initPrintInfo(): Impresoratickets {
   return {
    idimpresoratickets: 0,
    nombrenegocio: '',
    razonsocial:'',
    rfc:'',
    direccion:'',
    telefono:'',
    agradecimiento:'',
    infoadicional:'',
    idSucursal:0
   };
 }