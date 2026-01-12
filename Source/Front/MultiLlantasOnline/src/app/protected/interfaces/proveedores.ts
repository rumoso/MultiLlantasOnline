export interface Proveedores {
    idProveedor: number,
    createDate: Date,
    nombre: string,
    calle: string,
    numExt: string,
    numInt?: string,
    entreCalles: string,
    codigocolonia: number,
    rfc: string,
    telefono: string,
    email: string,
    lat: number,
    long: number,
    active: boolean
}
