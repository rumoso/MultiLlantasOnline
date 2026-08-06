import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/Shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { environment } from '../../../../environments/environment';
import { CheckoutService } from '../../services/checkout.service';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';

const METODO_ENVIO = 'ENVIO';
const METODO_RETIRO = 'RETIRO';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [SharedModule, MaterialModule],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export default class CheckoutComponent implements OnInit {

    private checkoutService = inject(CheckoutService);
    private accountService = inject(AccountService);
    private authService = inject(AuthService);
    private servicesGServ = inject(ServicesGService);

    private _appMain: string = environment.appMain;

    readonly ENVIO = METODO_ENVIO;
    readonly RETIRO = METODO_RETIRO;

    loading: boolean = true;
    procesando: boolean = false;

    metodoEntrega: string = METODO_ENVIO;
    direcciones: any[] = [];
    sucursales: any[] = [];
    idAddressSel: number | null = null;
    idSucursalSel: number | null = null;

    // Todo esto viene del servidor; el Front no suma nada por su cuenta.
    resumen: any = null;

    ngOnInit(): void {
        if (this.authService.getIdUserSession() === 0) {
            this.servicesGServ.changeRoute('/auth/login');
            return;
        }
        this.cargarDatosIniciales();
    }

    private cargarDatosIniciales(): void {
        this.loading = true;

        this.accountService.getMyAddresses().subscribe({
            next: (resp) => {
                if (resp.status === 0) {
                    this.direcciones = resp.data || [];
                    const principal = this.direcciones.find(d => d.bPrincipal);
                    this.idAddressSel = principal ? principal.idAddress
                        : (this.direcciones.length > 0 ? this.direcciones[0].idAddress : null);
                }
                if (!this.idAddressSel) {
                    // Sin direcciones guardadas: arrancar en retiro en tienda.
                    this.metodoEntrega = METODO_RETIRO;
                }
                this.cargarSucursales();
            },
            error: () => { this.cargarSucursales(); }
        });
    }

    private cargarSucursales(): void {
        this.checkoutService.getSucursales().subscribe({
            next: (resp) => {
                if (resp.status === 0) {
                    this.sucursales = resp.data || [];
                    if (this.sucursales.length > 0) {
                        this.idSucursalSel = this.sucursales[0].idSucursal;
                    }
                }
                this.refrescarResumen();
            },
            error: () => { this.refrescarResumen(); }
        });
    }

    /**
     * Cada vez que cambia la entrega o la direccion se vuelve a pedir el
     * resumen al servidor. El Front nunca recalcula el total.
     */
    refrescarResumen(): void {
        this.loading = true;
        this.checkoutService.getResumen(this.metodoEntrega, this.idAddressSel).subscribe({
            next: (resp) => {
                this.loading = false;
                if (resp.status === 0) {
                    this.resumen = resp.data;
                } else {
                    this.resumen = null;
                    this.servicesGServ.showSnakbar(resp.message);
                    if (resp.message && resp.message.indexOf('carrito') >= 0) {
                        this.servicesGServ.changeRoute(`/${this._appMain}/dashboard`);
                    }
                }
            },
            error: () => {
                this.loading = false;
                this.resumen = null;
                this.servicesGServ.showSnakbar('No se pudo calcular el resumen');
            }
        });
    }

    cambiarMetodo(metodo: string): void {
        if (this.metodoEntrega === metodo) return;
        this.metodoEntrega = metodo;
        this.refrescarResumen();
    }

    cambiarDireccion(idAddress: number): void {
        this.idAddressSel = idAddress;
        this.refrescarResumen();
    }

    irAMisDirecciones(): void {
        this.servicesGServ.changeRoute(`/${this._appMain}/perfil`);
    }

    get puedePagar(): boolean {
        if (!this.resumen || this.resumen.vacio) return false;
        if (this.procesando) return false;
        if (this.metodoEntrega === METODO_ENVIO) {
            return !!this.idAddressSel && this.resumen.envioDisponible;
        }
        return !!this.idSucursalSel;
    }

    pagar(): void {
        if (!this.puedePagar) return;

        this.procesando = true;
        this.checkoutService.crearOrden(
            this.metodoEntrega,
            this.metodoEntrega === METODO_ENVIO ? this.idAddressSel : null,
            this.metodoEntrega === METODO_RETIRO ? this.idSucursalSel : null
        ).subscribe({
            next: (resp) => {
                if (resp.status === 0 && resp.data) {
                    // Se usa SIEMPRE initPoint. Con el esquema de usuarios de
                    // prueba, la cuenta de prueba YA es el sandbox y el
                    // sandbox_init_point falla ("No pudimos procesar tu pago").
                    // El init_point (www.mercadopago.com.mx) funciona para
                    // prueba y para produccion por igual.
                    const url = resp.data.initPoint || resp.data.sandboxInitPoint;
                    if (url) {
                        window.location.href = url;
                        return;
                    }
                    this.procesando = false;
                    this.servicesGServ.showSnakbar('No se recibio el enlace de pago');
                } else {
                    this.procesando = false;
                    this.servicesGServ.showSnakbar(resp.message || 'No se pudo crear la orden');
                    this.refrescarResumen();
                }
            },
            error: (err) => {
                this.procesando = false;
                const msg = err?.error?.message || 'No se pudo iniciar el pago. Intenta de nuevo.';
                this.servicesGServ.showSnakbar(msg);
            }
        });
    }
}
