import { CartDetail } from "./cart-detail";

export interface Cart {
  idcart: number,
  productos: CartDetail[],
  idUser: number,
  idCliente:number,
  idSucursal:number,
  idTipoVenta:number
  createDate:Date,
}

export function initCart(): Cart {
  return {
    idcart: 0,
    productos: [],
    idUser: 0,
    idCliente: 0,
    idSucursal: 0,
    idTipoVenta: 0,
    createDate: new Date(),
  };
}
