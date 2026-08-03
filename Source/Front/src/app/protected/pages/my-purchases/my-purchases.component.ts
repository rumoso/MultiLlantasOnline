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
    styles: [`
        .order-card {
            margin-bottom: 20px;
            border-radius: 8px;
            overflow: hidden;
        }
        .order-header {
            background-color: #f5f5f5;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
        }
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
            color: white;
            white-space: nowrap;
        }
        .aviso-pendiente {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            background: #fff8e1;
            color: #8d6e00;
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 12px;
            font-size: 0.85rem;
            line-height: 1.35;
        }
        .aviso-pendiente mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            flex-shrink: 0;
        }
        @media (max-width: 480px) {
            .order-header {
                padding: 12px;
            }
        }
    `]
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

    openDetail(order: any) {
        this.dialog.open(PurchaseDetailDialogComponent, {
            data: {
                idOrder: order.idOrder,
                total: order.total,
                date: order.createDate
            },
            width: '600px'
        });
    }
}
