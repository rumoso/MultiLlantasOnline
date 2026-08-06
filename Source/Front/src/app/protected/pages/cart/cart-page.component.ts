import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { SharedModule } from '../../../shared/Shared.module';
import { CartService } from '../../services/cart.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [CommonModule, MaterialModule, SharedModule],
    templateUrl: './cart-page.component.html',
    styleUrls: ['./cart-page.component.css']
})
export default class CartPageComponent implements OnInit {

    cartService = inject(CartService);
    servicesGServ = inject(ServicesGService);

    cartItems: any[] = [];
    loading: boolean = false;
    private _appMain: string = environment.appMain;

    ngOnInit(): void {
        // Subscribe to cart changes
        this.cartService.cart$.subscribe(items => {
            this.cartItems = items;
        });
    }

    get total(): number {
        return this.cartItems.reduce((acc: number, item: any) => acc + (item.precio * item.cantidad), 0);
    }

    /** Medida (ej. "205/55 R16") extraida del nombre del producto. */
    medida(item: any): string | null {
        const m = (item?.descripcion || '').match(/(\d{3})\s*\/\s*(\d{2})\s*R\s*(\d{2})/i);
        return m ? `${m[1]}/${m[2]} R${m[3]}` : null;
    }

    updateQuantity(item: any, change: number): void {
        const newQuantity = item.cantidad + change;
        if (newQuantity < 1) return;

        const itemId = item.idItem;
        this.loading = true;
        this.cartService.updateQuantity(itemId, newQuantity).subscribe({
            next: () => this.loading = false,
            error: () => {
                this.loading = false;
                this.servicesGServ.showAlert('E', 'Error', 'No se pudo actualizar la cantidad');
            }
        });
    }

    removeItem(item: any): void {
        const itemId = item.idItem;
        this.loading = true;
        this.cartService.removeFromCart(itemId).subscribe({
            next: () => this.loading = false,
            error: () => {
                this.loading = false;
                this.servicesGServ.showAlert('E', 'Error', 'No se pudo eliminar el producto');
            }
        });
    }

    processCheckout(): void {
        if (!this.cartItems.length) return;
        // La compra ya no se procesa aqui: se va a la pantalla de checkout,
        // que calcula el total en el servidor y manda al pago real.
        this.servicesGServ.changeRoute(`/${this._appMain}/checkout`);
    }

    goBack(): void {
        window.history.back();
    }
}
