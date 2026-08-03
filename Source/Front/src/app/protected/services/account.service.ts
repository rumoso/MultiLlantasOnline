import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ResponseGet } from '../interfaces/global.interfaces';

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    private baseURL: string = environment.baseUrl;
    private _api: string = 'api/account';

    private http = inject(HttpClient);

    constructor() { }

    getMyAccount(): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/get`, {});
    }

    updateMyAccount(data: { name: string, email: string, telefono: string }): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/update`, data);
    }

    changePassword(data: { pwdActual: string, pwdNueva: string, pwdNueva2: string }): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/change-password`, data);
    }

    getMyAddresses(): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/addresses/get`, {});
    }

    addAddress(data: any): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/addresses/add`, data);
    }

    updateAddress(data: any): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/addresses/update`, data);
    }

    deleteAddress(idAddress: number): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/addresses/delete`, { idAddress });
    }

    setAddressPrincipal(idAddress: number): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/addresses/set-principal`, { idAddress });
    }
}
