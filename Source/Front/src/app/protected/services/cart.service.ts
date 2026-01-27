import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ResponseGet } from '../interfaces/global.interfaces';
import { AuthService } from '../../auth/services/auth.service';
import { GuestService } from '../../shared/services/guest.service';

@Injectable({
    providedIn: 'root'
})
export class CartService {

    private baseURL: string = environment.baseUrl;
    private _api: string = 'api/cart';

    private cartSubject = new BehaviorSubject<any[]>([]);
    public cart$ = this.cartSubject.asObservable();

    private toggleCartSubject = new BehaviorSubject<boolean>(false);
    public toggleCart$ = this.toggleCartSubject.asObservable();

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private guestService = inject(GuestService);

    constructor() {
        this.getCart().subscribe();
    }

    /**
     * Obtiene los productos del carrito actual
     */
    getCart(): Observable<ResponseGet> {
        const idUser = this.authService.getIdUserSession();
        const data = { idUser };

        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/get`, data, { withCredentials: true }).pipe(
            tap(resp => {
                console.log('CartService getCart response:', resp); // DEBUG
                if (resp.status === 0 && resp.data) {
                    console.log('CartService updating subject with:', resp.data); // DEBUG
                    this.cartSubject.next(resp.data);
                }
            })
        );
    }

    addToCart(idProducto: number, cantidad: number): Observable<ResponseGet> {
        const idUser = this.authService.getIdUserSession();
        const data = { idProducto, cantidad, idUser };

        return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/add`, data, { withCredentials: true }).pipe(
            tap(resp => {
                if (resp.status === 0) {
                    this.getCart().subscribe();
                    this.openCart(); // Abrir el carrito automáticamente
                }
            })
        );
    }

    openCart(): void {
        this.toggleCartSubject.next(true);
    }

    updateQuantity(idItem: number, cantidad: number): Observable<ResponseGet> {
        const data = { idItem, cantidad };
        return this.http.put<ResponseGet>(`${this.baseURL}/${this._api}/update`, data, { withCredentials: true }).pipe(
            tap(resp => {
                if (resp.status === 0) {
                    this.getCart().subscribe();
                }
            })
        );
    }

    removeFromCart(idItem: number): Observable<ResponseGet> {
        return this.http.delete<ResponseGet>(`${this.baseURL}/${this._api}/remove`, {
            body: { idItem },
            withCredentials: true
        }).pipe(
            tap(resp => {
                if (resp.status === 0) {
                    this.getCart().subscribe();
                }
            })
        );
    }

    /**
     * Limpia el estado local del carrito
     */
    clearLocalCart(): void {
        this.cartSubject.next([]);
    }
}
