import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { SharedModule } from '../../../shared/Shared.module';
import { CartService } from '../../services/cart.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, MaterialModule, SharedModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export default class CartComponent implements OnInit {

    private _appMain: string = environment.appMain;
    cartService = inject(CartService);
    servicesGServ = inject(ServicesGService);

    cartItems: any[] = [];
    loading: boolean = false;

    ngOnInit(): void {
        this.cartService.cart$.subscribe(items => {
            this.cartItems = items;
        });
    }

    get total(): number {
        return this.cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    }

    updateQuantity(item: any, change: number): void {
        const newQuantity = item.cantidad + change;
        if (newQuantity < 1) return;

        const itemId = item.idItem || item.idcartDetail || item.keyx;
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
        const itemName = item.descripcion || item.nombre || 'este producto';
        if (!confirm(`¿Estás seguro de que deseas eliminar "${itemName}" del carrito?`)) {
            return;
        }

        const itemId = item.idItem || item.idcartDetail || item.keyx;
        this.loading = true;
        this.cartService.removeFromCart(itemId).subscribe({
            next: () => this.loading = false,
            error: () => {
                this.loading = false;
                this.servicesGServ.showAlert('E', 'Error', 'No se pudo eliminar el producto');
            }
        });
    }

    continueShopping(): void {
        this.servicesGServ.changeRoute(`/${this._appMain}/dashboard`);
    }

    processCheckout(): void {
        if (!this.cartItems.length) return;

        if (!confirm('¿Estás seguro de procesar la compra?')) return;

        this.loading = true;
        this.cartService.processPurchase().subscribe({
            next: (resp) => {
                this.loading = false;
                if (resp.status === 0) {
                    this.servicesGServ.showAlert('S', 'Éxito', 'Compra procesada correctamente');
                    this.cartService.openCart(); // O cerrar el carrito si se prefiere
                    this.servicesGServ.changeRoute(`/${this._appMain}/my-purchases`); // Redirigir a mis compras
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

}
