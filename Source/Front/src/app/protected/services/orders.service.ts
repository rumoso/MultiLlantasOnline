import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ResponseGet } from '../interfaces/global.interfaces';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {

    private baseURL: string = environment.baseUrl;
    private _api: string = 'api/orders';

    private http = inject(HttpClient);
    private authService = inject(AuthService);

    constructor() { }

    private getHeaders() {
        const tokenString = localStorage.getItem('token');
        const token = tokenString ? JSON.parse(tokenString) : '';
        return {
            'x-token': token
        };
    }

    getMyPurchases(): Observable<ResponseGet> {
        const idUser = this.authService.getIdUserSession();
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/my-purchases`, { idUser }, {
            withCredentials: true,
            headers: this.getHeaders()
        });
    }

    getOrderDetails(idOrder: number): Observable<ResponseGet> {
        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/get-details`, { idOrder }, {
            withCredentials: true,
            headers: this.getHeaders()
        });
    }
}
