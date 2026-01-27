import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { SharedModule } from '../../../shared/Shared.module';
import { CartService } from '../../services/cart.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';

@Component({
    selector: 'app-cart-overlay',
    standalone: true,
    imports: [CommonModule, MaterialModule, SharedModule],
    templateUrl: './cart-overlay.component.html',
    styleUrls: ['./cart-overlay.component.css']
})
export class CartOverlayComponent implements OnInit {

    @Output() close = new EventEmitter<void>();

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
        this.servicesGServ.showAlert('I', 'Próximamente', 'La funcionalidad de pago estará disponible pronto.');
    }

}
