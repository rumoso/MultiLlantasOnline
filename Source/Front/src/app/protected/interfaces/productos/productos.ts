import { Familias } from './familias';
import { CatTipoProducto } from './cattipoproducto';
import { Descripciones } from './descripciones';
import { UnidadMedida } from './unidadmedida';

export interface Productos {
  idProducto:number,
  createDate:Date,
  sku:string,
  idDescription:number | null,
  valorMedida:number | null,
  idUnidadMedida:number,
  idCatTipoProducto:number,
  idProductoRelacion:number,
  productoRelacionDesc:string,
  porcentajeRelation: number | null,

  idcatcategoriaproducto:number,
  idproductocategoria:number,
  existencias:number | null,
  cantidad:number,
  costo:number | null,
  precio:number | null,
  active:boolean,
  descripciones:Descripciones,
  productobase:Productos | null,
  tipoproducto:CatTipoProducto | null,
  unidadmedida: UnidadMedida,
  imageUrl?: string | null,
  descripcion?: string
  familia:Familias,
  idFamilia: number,
  bEnvase:boolean,
  precioEcoAgr: number,
  porcentDineroElectronico: number,
  porcentDineroElectronicoEnvase: number,
}
