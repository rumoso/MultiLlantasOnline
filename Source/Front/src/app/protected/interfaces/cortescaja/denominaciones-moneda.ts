// Interfaz principal para las denominaciones de moneda en cortes de caja
export interface DenominacionesMoneda {
  idcortescajadenominaciones?: number;  // PK autoincremental (opcional para nuevos registros)
  idcortescaja: number;                 // FK al corte de caja
  tipo: TipoDenominacion;               // Tipo de denominación (BILLETE o MONEDA)
  valor: number;                        // Valor de la denominación (ej: 1000, 500, 100, etc.)
  cantidad: number;                     // Cantidad de billetes/monedas de esta denominación
  total: number;                        // Total calculado (valor * cantidad)
}

// Enum para los tipos de denominación
export enum TipoDenominacion {
  BILLETE = 'BILLETE',
  MONEDA = 'MONEDA'
}

// Interfaz para crear una nueva denominación
export interface NuevaDenominacionMoneda {
  idcortescaja: number;
  tipo: TipoDenominacion;
  valor: number;
  cantidad: number;
  total: number;
}

// Interfaz para actualizar una denominación existente
export interface ActualizarDenominacionMoneda {
  idcortescajadenominaciones: number;
  cantidad?: number;
  total?: number;
}

// Interfaz para el conjunto completo de denominaciones de un corte
export interface DenominacionesCompletas {
  idcortescaja: number;
  denominaciones: DenominacionesMoneda[];
  totalEfectivo: number;              // Suma de todos los totales
  totalBilletes: number;              // Suma solo de billetes
  totalMonedas: number;               // Suma solo de monedas
}

// Interfaz para denominaciones predefinidas del sistema
export interface DenominacionPredefinida {
  tipo: TipoDenominacion;
  valor: number;
  nombre: string;                     // Nombre descriptivo (ej: "Billete de $1000")
  orden: number;                      // Orden de visualización
}
