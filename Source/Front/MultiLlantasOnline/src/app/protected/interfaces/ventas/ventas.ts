import { Clientes } from "../clientes/clientes";
import { Sucursales } from "../sucursales/sucursales";
import { Cat_Tipo_Venta } from "./Cat_Tipo_Venta";
import { Ventasdetalle } from "./ventasdetalle";

export interface Ventas {
  idventas: number,
  createDate: Date,
  idUser: number,
  efectivo: number,
  tarjeta: number,
  transferencia: number,
  subtotal: number,
  descuento: number,
  iva: number,
  total: number,
  cambio: number,
  idCliente: number,
  idSucursal: number,
  active: boolean,
  idTipoVenta: number,
  catTipoVenta?: Cat_Tipo_Venta | null,
  cliente?: Clientes | null,
  sucursal?: Sucursales | null,
  ventasdetalle: Ventasdetalle[]
}
