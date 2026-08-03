import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ResponseGet } from '../interfaces/global.interfaces';

@Injectable({
    providedIn: 'root'
})
export class CheckoutService {

    private baseURL: string = environment.baseUrl;
    private _api: string = 'api/checkout';

    private http = inject(HttpClient);

    constructor() { }

    /**
     * Pide al servidor el resumen del pedido. Nunca se mandan montos:
     * el subtotal, el envio y el total los calcula el backend.
     */
    getResumen(metodoEntrega: string, idAddress?: number | null): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/resumen`, {
            metodoEntrega,
            idAddress: idAddress || null
        });
    }

    getSucursales(): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/sucursales`, {});
    }

    crearOrden(metodoEntrega: string, idAddress?: number | null, idSucursal?: number | null): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/crear-orden`, {
            metodoEntrega,
            idAddress: idAddress || null,
            idSucursal: idSucursal || null
        });
    }

    getEstadoOrden(idOrder: number): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/estado-orden`, { idOrder });
    }
}
