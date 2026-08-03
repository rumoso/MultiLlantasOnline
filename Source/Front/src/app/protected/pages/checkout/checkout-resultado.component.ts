import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../shared/Shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { environment } from '../../../../environments/environment';
import { CheckoutService } from '../../services/checkout.service';
import { CartService } from '../../services/cart.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';

/**
 * Pantalla a la que regresa el navegador despues de pagar.
 *
 * ES PURAMENTE INFORMATIVA: solo consulta y muestra el estado que la orden YA
 * tiene en la base de datos. NO marca nada como pagado — eso solo lo hace el
 * webhook firmado de Mercado Pago. Entrar a esta URL a mano no cambia nada.
 */
@Component({
    selector: 'app-checkout-resultado',
    standalone: true,
    imports: [SharedModule, MaterialModule],
    templateUrl: './checkout-resultado.component.html',
    styleUrls: ['./checkout-resultado.component.css']
})
export default class CheckoutResultadoComponent implements OnInit {

    private checkoutService = inject(CheckoutService);
    private cartService = inject(CartService);
    private servicesGServ = inject(ServicesGService);
    private route = inject(ActivatedRoute);

    private _appMain: string = environment.appMain;

    loading: boolean = true;
    orden: any = null;
    idOrder: number | null = null;

    ngOnInit(): void {
        // Mercado Pago regresa con external_reference (nuestro idOrder) en la URL.
        const params = this.route.snapshot.queryParams;
        const ref = params['external_reference'] || params['idOrder'];
        this.idOrder = ref ? parseInt(ref, 10) : null;

        if (!this.idOrder) {
            this.loading = false;
            return;
        }

        this.checkoutService.getEstadoOrden(this.idOrder).subscribe({
            next: (resp) => {
                this.loading = false;
                if (resp.status === 0) {
                    this.orden = resp.data;
                    // Si ya quedo pagada, refrescar el carrito (el backend lo vacio).
                    if (this.orden.codigoPago === 'APROBADO') {
                        this.cartService.getCart().subscribe();
                    }
                }
            },
            error: () => { this.loading = false; }
        });
    }

    get esAprobado(): boolean {
        return this.orden?.codigoPago === 'APROBADO';
    }

    get esPendiente(): boolean {
        return this.orden?.codigoPago === 'PENDIENTE' || this.orden?.codigoPago === 'EN_PROCESO';
    }

    get esFallido(): boolean {
        return ['RECHAZADO', 'CANCELADO', 'EXPIRADO'].includes(this.orden?.codigoPago);
    }

    irAMisCompras(): void {
        this.servicesGServ.changeRoute(`/${this._appMain}/my-purchases`);
    }

    irAlCatalogo(): void {
        this.servicesGServ.changeRoute(`/${this._appMain}/dashboard`);
    }
}
