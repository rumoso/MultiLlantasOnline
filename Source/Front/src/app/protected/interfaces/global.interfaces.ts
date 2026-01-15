//INTERFACES DE COMPOONENTES
export interface DDialog {
    header: string,
    message: string,
    question: string
    buttonYes: string,
    buttonNo: string
}

export interface Pagination{
    search: string;
    length: number;
    pageSize: number;
    pageIndex: number;
    pageSizeOptions: number[];
}

export interface Login {
    username: string,
    pwd: string
}

export interface ResponseGet {
    status:  number;
    message: string;
    data: any;
}

export interface ResponseDB_CRUD {
    status:  number;
    message: string;
    insertID: any;
    data: any;
}

export interface ColumnFormat {
    col: number;
    numberFormat?: string; // Ejemplo: '#,##0'
    currencyFormat?: boolean;
    textAlignment?: 'left' | 'center' | 'right';
  }
