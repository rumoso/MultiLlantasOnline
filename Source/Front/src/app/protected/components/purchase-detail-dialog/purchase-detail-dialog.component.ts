import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { OrdersService } from '../../services/orders.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-purchase-detail-dialog',
    standalone: true,
    imports: [CommonModule, MaterialModule],
    templateUrl: './purchase-detail-dialog.component.html',
    styleUrls: ['./purchase-detail-dialog.component.css']
})
export class PurchaseDetailDialogComponent implements OnInit {

    ordersService = inject(OrdersService);
    servicesGServ = inject(ServicesGService);

    details: any[] = [];
    loading: boolean = true;
    baseUrl = environment.baseUrl;

    constructor(
        public dialogRef: MatDialogRef<PurchaseDetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { idOrder: number, total: number, date: string }
    ) { }

    ngOnInit(): void {
        this.loadDetails();
    }

    loadDetails() {
        this.loading = true;
        this.ordersService.getOrderDetails(this.data.idOrder).subscribe({
            next: (resp) => {
                this.loading = false;
                if (resp.status === 0) {
                    this.details = resp.data || [];
                } else {
                    this.servicesGServ.showSnakbar('Error al cargar detalles', undefined, 2000);
                }
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                this.servicesGServ.showSnakbar('Error al cargar detalles', undefined, 2000);
            }
        });
    }

    close() {
        this.dialogRef.close();
    }
}
