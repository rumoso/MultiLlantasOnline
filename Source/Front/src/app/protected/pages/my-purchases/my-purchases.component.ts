import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { SharedModule } from '../../../shared/Shared.module';
import { OrdersService } from '../../services/orders.service';
import { MatDialog } from '@angular/material/dialog';
import { PurchaseDetailDialogComponent } from '../../components/purchase-detail-dialog/purchase-detail-dialog.component';
import { ServicesGService } from '../../../servicesG/servicesG.service';

@Component({
    selector: 'app-my-purchases',
    standalone: true,
    imports: [CommonModule, MaterialModule, SharedModule],
    templateUrl: './my-purchases.component.html',
    styleUrls: ['./my-purchases.component.css']
})
export default class MyPurchasesComponent implements OnInit {

    ordersService = inject(OrdersService);
    servicesGServ = inject(ServicesGService);
    dialog = inject(MatDialog);

    orders: any[] = [];
    loading: boolean = true;

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading = true;
        this.ordersService.getMyPurchases().subscribe({
            next: (resp) => {
                this.loading = false;
                if (resp.status === 0) {
                    this.orders = resp.data || [];
                } else {
                    this.servicesGServ.showAlert('E', 'Error', 'Error al cargar las compras');
                }
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                this.servicesGServ.showAlert('E', 'Error', 'Ocurrió un error al cargar las compras');
            }
        });
    }

    /** Clase de estado a partir del codigo/nombre del status de pago. */
    estadoClase(order: any): string {
        const s = (order.statusPago || '').toLowerCase();
        if (s.includes('aprob')) return 'estado-aprobado';
        if (s.includes('pend') || s.includes('proceso')) return 'estado-pendiente';
        if (s.includes('rechaz') || s.includes('cancel') || s.includes('expir')) return 'estado-fallido';
        if (s.includes('reembol') || s.includes('media')) return 'estado-neutro';
        return 'estado-neutro';
    }

    esPendiente(order: any): boolean {
        const s = (order.statusPago || '').toLowerCase();
        return s.includes('pend') || s.includes('proceso');
    }

    iconoEstado(order: any): string {
        const c = this.estadoClase(order);
        if (c === 'estado-aprobado') return 'check_circle';
        if (c === 'estado-pendiente') return 'schedule';
        if (c === 'estado-fallido') return 'cancel';
        return 'info';
    }

    openDetail(order: any) {
        this.dialog.open(PurchaseDetailDialogComponent, {
            data: {
                idOrder: order.idOrder,
                total: order.total,
                date: order.createDate
            },
            width: '600px',
            maxWidth: '95vw'
        });
    }
}
