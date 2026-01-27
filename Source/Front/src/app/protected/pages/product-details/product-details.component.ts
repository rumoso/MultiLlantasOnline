import { Component, inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { SharedModule } from '../../../shared/Shared.module';
import { ProductosService } from '../../services/productos.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, MaterialModule, SharedModule],
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.css']
})
export default class ProductDetailsComponent implements OnInit {

    public dialogRef = inject(MatDialogRef<ProductDetailsComponent>, { optional: true });
    public data = inject(MAT_DIALOG_DATA, { optional: true });

    private route = inject(ActivatedRoute);
    private productosService = inject(ProductosService);
    private cartService = inject(CartService);
    private favoritesService = inject(FavoritesService);
    private servicesGServ = inject(ServicesGService);

    producto: any = null;
    loading: boolean = true;
    idProducto: number = 0;
    cantidad: number = 1;

    ngOnInit(): void {
        if (this.data && this.data.producto) {
            this.producto = this.formatProductData(this.data.producto);
            this.producto.isFavorite = this.favoritesService.isFavorite(this.producto.idProducto);
            this.loading = false;
        } else if (this.data && this.data.idProducto) {
            this.idProducto = this.data.idProducto;
            this.loadProductDetails(this.idProducto);
        } else {
            this.route.params.subscribe(params => {
                this.idProducto = +params['id'];
                if (this.idProducto) {
                    this.loadProductDetails(this.idProducto);
                }
            });
        }
    }

    loadProductDetails(id: number): void {
        this.loading = true;
        this.productosService.getProductById(id).subscribe({
            next: (resp: any) => {
                if (resp.status === 0 && resp.data) {
                    this.producto = this.formatProductData(resp.data);
                    this.producto.isFavorite = this.favoritesService.isFavorite(this.producto.idProducto);
                } else {
                    this.servicesGServ.showAlert('E', 'Error', 'No se encontró el producto');
                    this.goBack();
                }
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.servicesGServ.showAlert('E', 'Error', 'Error al cargar el producto');
            }
        });
    }

    updateQuantity(change: number): void {
        const newVal = this.cantidad + change;
        if (newVal >= 1 && newVal <= (this.producto?.stock || 99)) {
            this.cantidad = newVal;
        }
    }

    addToCart(): void {
        if (!this.producto) return;

        this.cartService.addToCart(this.producto.idProducto, this.cantidad).subscribe({
            next: (resp: any) => {
                if (resp.status === 0) {
                    this.servicesGServ.showSnakbar('Producto agregado al carrito', 'Cerrar', 3000);
                }
            }
        });
    }

    toggleFavorite(): void {
        if (!this.producto) return;

        const isAdded = this.favoritesService.toggleFavorite(this.producto);
        this.producto.isFavorite = isAdded;

        if (isAdded) {
            this.servicesGServ.showSnakbar('Agregado a favoritos', undefined, 2000);
        } else {
            this.servicesGServ.showSnakbar('Eliminado de favoritos', undefined, 2000);
        }
    }

    goBack(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        } else {
            window.history.back();
        }
    }

    private formatProductData(data: any): any {
        if (!data) return null;
        const formatted = { ...data };
        const fieldsToFix = ['descripcion', 'detalles', 'nombre', 'modelo', 'marca'];

        fieldsToFix.forEach(field => {
            if (formatted[field] && typeof formatted[field] === 'string') {
                formatted[field] = formatted[field].replace(/\?\?/g, 'ñ').replace(/\?\/n/g, 'ñ');
            }
        });

        return formatted;
    }
}
