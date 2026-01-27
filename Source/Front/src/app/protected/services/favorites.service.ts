import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { ResponseGet } from '../interfaces/global.interfaces';
import { GuestService } from '../../shared/services/guest.service';

@Injectable({
    providedIn: 'root'
})
export class FavoritesService {

    private baseURL: string = environment.baseUrl;
    private _api: string = 'api/favorites';

    private favoritesSubject = new BehaviorSubject<any[]>([]);
    public favorites$ = this.favoritesSubject.asObservable();

    private toggleFavoritesSubject = new BehaviorSubject<boolean>(false);
    public toggleFavorites$ = this.toggleFavoritesSubject.asObservable();

    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private guestService = inject(GuestService);

    constructor() {
        // Load initial favorites (works for both user and guest)
        this.loadFavorites();
    }

    private getHeaders() {
        const tokenString = localStorage.getItem('token');
        const token = tokenString ? JSON.parse(tokenString) : '';
        return {
            'x-token': token,
            'x-guest-id': this.guestService.getGuestId()
        };
    }

    public loadFavorites() {
        const idUser = this.authService.getIdUserSession();
        // Allow if user is logged in OR if there is a guest session (guest-id always exists via service)

        const requestBody = { idUser };
        // Note: backend expects idUser in body, and checks guest-id from header/body

        this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/get`, requestBody, {
            withCredentials: true,
            headers: this.getHeaders()
        }).subscribe(resp => {
            if (resp.status === 0 && resp.data) {
                // Mapear para asegurar que isFavorite está presente
                const favs = resp.data.map((f: any) => ({ ...f, isFavorite: true }));
                this.favoritesSubject.next(favs);
            }
        });
    }

    getFavoritesValue(): any[] {
        return this.favoritesSubject.value;
    }

    toggleFavorite(product: any): boolean {
        const idUser = this.authService.getIdUserSession();
        const guestId = this.guestService.getGuestId();

        if (idUser <= 0 && !guestId) {
            console.warn('Usuario no logueado y sin guest-id');
            return false;
        }

        // Optimistic UI Update first
        const currentFavorites = this.favoritesSubject.value || [];
        const index = currentFavorites.findIndex(f => f.idProducto === product.idProducto);
        let newFavorites;
        let added = false;

        if (index === -1) {
            newFavorites = [...currentFavorites, { ...product, isFavorite: true }];
            added = true;
        } else {
            newFavorites = currentFavorites.filter(f => f.idProducto !== product.idProducto);
            added = false;
        }
        this.favoritesSubject.next(newFavorites);

        // Call API
        this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/toggle`, { idUser, idProducto: product.idProducto }, {
            withCredentials: true,
            headers: this.getHeaders()
        }).subscribe({
            next: (resp) => {
                if (resp.status !== 0) {
                    // Rollback if failed (simple reload)
                    console.error('Error toggling favorite');
                    this.loadFavorites();
                }
            },
            error: () => this.loadFavorites() // Reload on error
        });

        return added;
    }

    isFavorite(idProducto: number): boolean {
        const currentFavorites = this.favoritesSubject.value || [];
        return currentFavorites.some(f => f.idProducto === idProducto);
    }

    openFavorites() {
        this.toggleFavoritesSubject.next(true);
    }
}
