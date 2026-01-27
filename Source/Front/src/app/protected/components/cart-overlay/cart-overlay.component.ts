import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { SharedModule } from '../../../shared/Shared.module';
import { CartService } from '../../services/cart.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';
import { GuestService } from '../../../shared/services/guest.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-cart-overlay',
    standalone: true,
    imports: [CommonModule, MaterialModule, SharedModule],
    templateUrl: './cart-overlay.component.html',
    styleUrls: ['./cart-overlay.component.css']
})
export class CartOverlayComponent implements OnInit {

    @Output() close = new EventEmitter<void>();

    private _appMain: string = environment.appMain;

    cartService = inject(CartService);
    servicesGServ = inject(ServicesGService);
    guestService = inject(GuestService);

    get isGuest(): boolean {
        return this.guestService.isGuest();
    }

    cartItems: any[] = [];
    loading: boolean = false;

    ngOnInit(): void {
        this.cartService.cart$.subscribe(items => {
            this.cartItems = items;
        });
    }

    get total(): number {
        return this.cartItems.reduce((acc: number, item: any) => acc + (item.precio * item.cantidad), 0);
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
        const itemName = item.descripcion || 'este producto';
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

    closeCart(): void {
        this.close.emit();
    }

    processCheckout(): void {
        if (!this.cartItems.length) return;

        if (this.isGuest) {
            if (confirm('Debes iniciar sesión para procesar tu compra. ¿Quieres ir al login?')) {
                this.closeCart();
                this.servicesGServ.changeRoute('/login');
            }
            return;
        }

        if (!confirm('¿Estás seguro de procesar la compra?')) return;

        this.loading = true;
        this.cartService.processPurchase().subscribe({
            next: (resp) => {
                this.loading = false;
                if (resp.status === 0) {
                    this.servicesGServ.showAlert('S', 'Éxito', 'Compra procesada correctamente');
                    this.cartService.openCart();
                    this.closeCart();
                    this.servicesGServ.changeRoute(`/${this._appMain}/my-purchases`);
                } else {
                    this.servicesGServ.showAlert('E', 'Error', resp.message || 'Error al procesar la compra');
                }
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                this.servicesGServ.showAlert('E', 'Error', 'Ocurrió un error al procesar la compra');
            }
        });
    }

    goToFullCart(): void {
        this.closeCart();
        this.servicesGServ.changeRoute(`/${this._appMain}/cart`);
    }

}
