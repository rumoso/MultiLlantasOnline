import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { SharedModule } from '../../../shared/Shared.module';
import { FavoritesService } from '../../services/favorites.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-favorites-overlay',
    standalone: true,
    imports: [CommonModule, MaterialModule, SharedModule],
    templateUrl: './favorites-overlay.component.html',
    styleUrls: ['./favorites-overlay.component.css']
})
export class FavoritesOverlayComponent implements OnInit {

    @Output() close = new EventEmitter<void>();

    favoritesService = inject(FavoritesService);
    cartService = inject(CartService);
    servicesGServ = inject(ServicesGService);

    favorites: any[] = [];
    private _appMain: string = environment.appMain;

    ngOnInit(): void {
        this.favoritesService.favorites$.subscribe(items => {
            this.favorites = items;
        });
    }

    /** Medida (ej. "205/55 R16"): usa los campos del producto o, si faltan,
     *  la extrae del nombre. Devuelve null si no hay datos. */
    medida(item: any): string | null {
        if (item?.ancho && item?.perfil && item?.rin) {
            return `${item.ancho}/${item.perfil} R${item.rin}`;
        }
        const m = (item?.nombre || '').match(/(\d{3})\s*\/\s*(\d{2})\s*R\s*(\d{2})/i);
        return m ? `${m[1]}/${m[2]} R${m[3]}` : null;
    }

    removeFavorite(product: any) {
        this.favoritesService.toggleFavorite(product);
        this.servicesGServ.showSnakbar('Eliminado de favoritos', undefined, 2000);
    }

    addToCart(product: any) {
        this.cartService.addToCart(product.sIdP, 1).subscribe({
            next: (resp) => {
                if (resp.status === 0) {
                    this.servicesGServ.showSnakbar('Agregado al carrito', undefined, 2000);
                }
            }
        });
    }

    viewAll() {
        this.closeSidebar();
        this.servicesGServ.changeRoute(`/${this._appMain}/favorites`);
    }

    closeSidebar() {
        this.close.emit();
    }
}
