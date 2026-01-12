export interface TicketLine {
  text?: string;
  aling?: "Left" | "Center" | "Right" | "Justify";
  size?: number;
  style?: "Bold" | "Normal";
  type?: "Helvetica";
  iWith?: number;
  color?: string;
  bImage?: boolean;
  base64Image?: string;
  iHeight?: number;
  ticketWidth?: number;
}

export interface TicketSection {
  oLines: TicketLine[];
}

export interface PrinterConfig {
  printerName: string;
  maxWidth: number;
  maxMargen: number;
  sBarCode: string;
}

export interface TicketFormat {
  oPrinter: PrinterConfig;
  oLinesP: TicketSection[];
}

export interface TicketCorteResponse {
  corteCaja: any;
  ticketFormat: TicketFormat;
}

export interface CorteCajaTicketRequest {
  impresora?: string;
}
