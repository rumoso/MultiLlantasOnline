import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { SharedModule } from '../../../shared/Shared.module';
import { FavoritesService } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-my-favorites',
    standalone: true,
    imports: [CommonModule, MaterialModule, SharedModule],
    templateUrl: './my-favorites.component.html',
    styleUrls: ['./my-favorites.component.css']
})
export default class MyFavoritesComponent implements OnInit {

    favoritesService = inject(FavoritesService);
    cartService = inject(CartService);
    servicesGServ = inject(ServicesGService);

    favorites: any[] = [];
    loading: boolean = false;
    private _appMain: string = environment.appMain;

    ngOnInit(): void {
        this.favoritesService.favorites$.subscribe(items => {
            this.favorites = items;
        });
    }

    removeFavorite(product: any) {
        this.favoritesService.toggleFavorite(product);
        this.servicesGServ.showSnakbar('Eliminado de favoritos', undefined, 2000);
    }

    addToCart(product: any) {
        this.cartService.addToCart(product.idProducto, 1).subscribe({
            next: (resp) => {
                if (resp.status === 0) {
                    this.servicesGServ.showSnakbar('Agregado al carrito', undefined, 2000);
                }
            }
        });
    }

    goToCatalog() {
        this.servicesGServ.changeRoute(`/${this._appMain}/dashboard`);
    }
}
