export interface Cat_Tipo_Venta {
  idTipoVenta: number,
  name: string,
  description: string,
  active: boolean
}

export function initCatTipoVenta(): Cat_Tipo_Venta{
    return {
        idTipoVenta: 0,
        name: '',
        description: '',
        active: true
    };
 }
