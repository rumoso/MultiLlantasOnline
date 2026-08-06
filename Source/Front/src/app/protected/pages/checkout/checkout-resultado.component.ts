import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
 *
 * CARRERA REDIRECT vs WEBHOOK: el navegador suele regresar antes de que el
 * webhook confirme el pago, asi que al llegar la orden puede seguir PENDIENTE
 * aunque ya se pago. Para no mostrarle al cliente "pendiente" en falso, si la
 * URL dice que el pago fue aprobado y la orden aun no lo refleja, se vuelve a
 * consultar cada pocos segundos por un rato ("Confirmando tu pago...").
 */
@Component({
    selector: 'app-checkout-resultado',
    standalone: true,
    imports: [SharedModule, MaterialModule],
    templateUrl: './checkout-resultado.component.html',
    styleUrls: ['./checkout-resultado.component.css']
})
export default class CheckoutResultadoComponent implements OnInit, OnDestroy {

    private checkoutService = inject(CheckoutService);
    private cartService = inject(CartService);
    private servicesGServ = inject(ServicesGService);
    private route = inject(ActivatedRoute);

    private _appMain: string = environment.appMain;

    // Cuantas veces reintentar y cada cuanto, mientras esperamos al webhook.
    private readonly MAX_INTENTOS = 8;
    private readonly INTERVALO_MS = 2000;

    private intentos = 0;
    private pollTimer: any = null;

    loading: boolean = true;
    confirmando: boolean = false; // esperando que el webhook confirme
    orden: any = null;
    idOrder: number | null = null;

    // Lo que Mercado Pago dice en la URL de retorno (pista, NO fuente de verdad).
    private mpStatusUrl: string | null = null;

    ngOnInit(): void {
        const params = this.route.snapshot.queryParams;
        const ref = params['external_reference'] || params['idOrder'];
        this.idOrder = ref ? parseInt(ref, 10) : null;
        this.mpStatusUrl = params['status'] || params['collection_status'] || null;

        if (!this.idOrder) {
            this.loading = false;
            return;
        }

        this.consultar(true);
    }

    ngOnDestroy(): void {
        if (this.pollTimer) clearTimeout(this.pollTimer);
    }

    private consultar(primera: boolean): void {
        this.checkoutService.getEstadoOrden(this.idOrder!).subscribe({
            next: (resp) => {
                if (resp.status === 0) {
                    this.orden = resp.data;

                    if (this.orden.codigoPago === 'APROBADO') {
                        // Confirmado: refrescar el carrito (el backend lo vacio) y parar.
                        this.cartService.getCart().subscribe();
                        this.detener();
                        return;
                    }

                    // La orden aun no esta aprobada. Si MP dijo en la URL que el
                    // pago fue aprobado, es la carrera con el webhook: reintentar.
                    const mpDiceAprobado = this.mpStatusUrl === 'approved';
                    if (mpDiceAprobado && this.intentos < this.MAX_INTENTOS) {
                        this.intentos++;
                        this.loading = false;
                        this.confirmando = true;
                        this.pollTimer = setTimeout(() => this.consultar(false), this.INTERVALO_MS);
                        return;
                    }
                }
                // Estado final (o se agotaron los reintentos): mostrar lo que haya.
                this.detener();
            },
            error: () => {
                if (primera) this.detener();
                // en reintentos, un error puntual no rompe el sondeo: se deja
                // el timer para el siguiente intento si aun quedan.
                else if (this.intentos >= this.MAX_INTENTOS) this.detener();
            }
        });
    }

    private detener(): void {
        this.loading = false;
        this.confirmando = false;
        if (this.pollTimer) { clearTimeout(this.pollTimer); this.pollTimer = null; }
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
