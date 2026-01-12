export interface Promociones {
  idPromocion: number;
  nombre: string;
  descripcion: string | null;
  tipoPromocion: TipoPromocion; // Usar enum para tipos de promoción
  valor: number | null;
  fechaInicio: Date;
  fechaFin: Date;
  activo: boolean;
  prioridad: number;
  requiereCodigoCupon: boolean;
  codigoCupon: string | null;
  maxUsosTotal: number | null;
  maxUsosPorCliente: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  condiciones?: PromocionCondicion[];
  acciones?: PromocionAccion[];
}

// Tipos de promoción
export enum TipoPromocion {
  PORCENTAJE_ITEM = 'PERCENTAGE_ITEM',
  MONTO_FIJO_ITEM = 'FIXED_AMOUNT_ITEM',
  PORCENTAJE_CARRITO = 'PERCENTAGE_CART',
  MONTO_FIJO_CARRITO = 'FIXED_AMOUNT_CART',
  COMPRA_X_LLEVA_Y = 'BUY_X_GET_Y_FREE',
  PRECIO_PAQUETE = 'BUNDLE_PRICE'
}

// Tipos de condiciones
export enum TipoCondicion {
  PRODUCTO_EN_CARRITO = 'PRODUCT_IN_CART',
  FAMILIA_EN_CARRITO = 'FAMILY_IN_CART', // Mantenemos el valor CATEGORY_IN_CART para compatibilidad con BD
  MIN_SUBTOTAL_CARRITO = 'MIN_CART_SUBTOTAL',
  MIN_CANTIDAD_ITEM = 'MIN_ITEM_QUANTITY',
  GRUPO_CLIENTE = 'CUSTOMER_GROUP'
}

// Operadores para condiciones
export enum OperadorCondicion {
  MAYOR_IGUAL = 'GREATER_THAN_OR_EQUAL',
  IGUAL = 'EQUALS',
  MENOR_IGUAL = 'LESS_THAN_OR_EQUAL',
  MAYOR = 'GREATER_THAN',
  MENOR = 'LESS_THAN'
}

// Entidades objetivo
export enum EntidadObjetivo {
  PRODUCTO = 'producto',
  FAMILIA = 'familia', // Mantenemos el valor 'category' para compatibilidad con BD
  CLIENTE = 'customer_group'
}

// Condiciones de promoción
export interface PromocionCondicion {
  idPromocionCondicion?: number;
  idPromocion: number;
  tipoCondicion: TipoCondicion;
  entidadObjetivo: EntidadObjetivo | null;
  idObjetivo: number | null;
  operador: OperadorCondicion | null;
  valor: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;
}

// Tipos de acciones
export enum TipoAccion {
  DESCUENTO_ITEM_ESPECIFICO = 'DISCOUNT_SPECIFIC_ITEM',
  AGREGAR_ITEM_GRATIS = 'ADD_FREE_ITEM'
}

// Acciones de promoción
export interface PromocionAccion {
  idPromocionAccion?: number;
  idPromocion: number;
  tipoAccion: TipoAccion;
  entidadObjetivo: EntidadObjetivo | null;
  idObjetivo: number | null;
  valor: number | null;
  createdAt?: Date;
  updatedAt?: Date | null;
}
