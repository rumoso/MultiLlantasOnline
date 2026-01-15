import { SharedModule } from './../../shared/Shared.module';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesGService } from '../../servicesG/servicesG.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material.module';
import { NoErrorStateMatcher } from '../../shared/NoErrorStateMatcher';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { ClientesService } from '../../protected/services/clientes.service';

@Component({
  selector: 'app-cobrar',
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    FormsModule,
    NgxMaskDirective,
  ],
  providers: [
    provideNgxMask()
  ],
  templateUrl: './cobrar.component.html',
  styleUrl: './cobrar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CobrarComponent {
  title: string = 'Cobrar';
  total: number = 0;
  bCredito: boolean = false;
  bVenta: boolean = false;
  totalPagado: number = 0;
  cambio: number = 0;
  montoDiElect: number = 0;
  pagoValido: boolean = false;
  pagoElectronicoExcedido: boolean = false;

  @ViewChild('efectivoInput') efectivoInput!: ElementRef;
  @ViewChild('tarjetaInput') tarjetaInput!: ElementRef;
  @ViewChild('referenciaTarjetaInput') referenciaTarjetaInput!: ElementRef;
  @ViewChild('transferenciaInput') transferenciaInput!: ElementRef;
  @ViewChild('referenciaTransferenciaInput') referenciaTransferenciaInput!: ElementRef;
  @ViewChild('cobrarButton') cobrarButton!: ElementRef;
  @ViewChild('chequeInput') chequeInput!: ElementRef;
  @ViewChild('fechaDepositoInput') fechaDepositoInput!: ElementRef;
  @ViewChild('dineroElectronicoInput') dineroElectronicoInput!: ElementRef;

  efectivoValue: string = '';
  tarjetaValue: string = '';
  transferenciaValue: string = '';
  referenciaTarjeta: string = '';
  referenciaTransferencia: string = '';
  fechaTransferencia: string = '';
  chequeValue: string = '';
  fechaDeposito: string = '';
  dineroElectronicoValue: string = '';

  efectivo: number = 0;
  tarjeta: number = 0;
  transferencia: number = 0;
  cheque: number = 0;
  dineroElectronico: number = 0;

  oCliente: any = {};

  constructor(
    private dialogRef: MatDialogRef<any>,
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private authServ: AuthService,
    private servicesGServ: ServicesGService,
    private cdRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public OData: any,
    private clientesServ: ClientesService
  ) {}

  async ngOnInit() {
    this.authServ.checkSession();

    this._locale = 'mx';
    this._adapter.setLocale(this._locale);

    // Redondear total a dos decimales
    this.OData.total = Math.round(this.OData.total * 100) / 100;
    console.log(this.OData);

    this.title = this.OData.title ? this.OData.title : this.title;
    this.total = Number(this.OData.total) || 0;
    this.bCredito = !!this.OData.bCredito;
    this.bVenta = !!this.OData.bVenta;

    this.efectivoValue = '';
    this.tarjetaValue = '';
    this.transferenciaValue = '';
    this.referenciaTarjeta = '';
    this.referenciaTransferencia = '';
    this.fechaTransferencia = '';
    this.chequeValue = '';
    this.dineroElectronicoValue = '';

    this.efectivo = 0;
    this.tarjeta = 0;
    this.transferencia = 0;
    this.cheque = 0;
    this.dineroElectronico = 0;
    this.cambio = 0;
    this.totalPagado = 0;
    this.montoDiElect = 0;

    this.calcularCambio();

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayLocal = `${yyyy}-${mm}-${dd}`;

    this.fechaTransferencia = `${todayLocal}T10:27:51.000Z`;

    this.fechaDeposito = `${todayLocal}T10:27:51.000Z`;

    if( this.OData.idClienteDiElect > 0 ){
      this.oCliente = (await this.clientesServ.getClienteByIDPromise( this.OData.idClienteDiElect )).data || {};
      this.montoDiElect = this.oCliente.montoDiElect || 0;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.efectivoInput) {
        this.efectivoInput.nativeElement.focus();
      }
    }, 100);
  }

  onEfectivoChange(value: string): void {
    this.efectivoValue = value;
    this.efectivo = value && !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
    this.calcularCambio();
  }

  onTarjetaChange(value: string): void {
    this.tarjetaValue = value;
    const newValue = value && !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
    const transferencia = this.transferencia || 0;
    const maxPermitido = this.total - transferencia;
    if (newValue > maxPermitido) {
      this.tarjeta = maxPermitido;
      this.tarjetaValue = maxPermitido > 0 ? maxPermitido.toString() : '';
      // setTimeout(() => {
      //   if (this.tarjetaInput) {
      //     this.tarjetaInput.nativeElement.value = this.tarjetaValue;
      //   }
      //   this.servicesGServ.showSnakbar('La suma de transferencia y tarjeta no puede exceder el total');
      // }, 0);
    } else {
      this.tarjeta = newValue;
    }
    this.calcularCambio();
  }

  onTransferenciaChange(value: string): void {
    this.transferenciaValue = value;
    const newValue = value && !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
    const tarjeta = this.tarjeta || 0;
    const maxPermitido = this.total - tarjeta;
    if (newValue > maxPermitido) {
      this.transferencia = maxPermitido;
      this.transferenciaValue = maxPermitido > 0 ? maxPermitido.toString() : '';
      // setTimeout(() => {
      //   if (this.transferenciaInput) {
      //     this.transferenciaInput.nativeElement.value = this.transferenciaValue;
      //   }
      //   this.servicesGServ.showSnakbar('La suma de transferencia y tarjeta no puede exceder el total');
      // }, 0);
    } else {
      this.transferencia = newValue;
    }
    this.calcularCambio();
  }

  onChequeChange(value: string): void {
    this.chequeValue = value;
    this.cheque = value && !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
    this.calcularCambio();
  }

  onDineroElectronicoChange(value: string): void {
    // Calcula el pendiente SIN considerar el dinero electrónico actual
    const pendienteSinDineroElectronico = this.total
      - (this.efectivo + this.tarjeta + this.transferencia + this.cheque);

    let newValue = value && !isNaN(parseFloat(value)) ? parseFloat(value) : 0;

    // Limitar al menor entre pendiente y montoDiElect
    const maxPermitido = Math.min(pendienteSinDineroElectronico, this.montoDiElect);

    if (newValue > maxPermitido) {
      newValue = maxPermitido;
      this.dineroElectronicoValue = maxPermitido > 0 ? maxPermitido.toString() : '';
      this.servicesGServ.showSnakbar('El monto de dinero electrónico no puede exceder el pendiente ni el disponible.');
    } else {
      this.dineroElectronicoValue = value;
    }

    this.dineroElectronico = newValue;
    this.calcularCambio();
  }

  onEfectivoKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.pagoValido) {
        this.cerrarMetodosPago();
      } else {
        this.focusElement(this.tarjetaInput);
      }
    }
  }

  // onRecibidoKeyDown(event: KeyboardEvent): void {
  //   if (event.key === 'Enter') {
  //     event.preventDefault();
  //     if (this.recibido < this.efectivo) {
  //       this.servicesGServ.showSnakbar('El monto recibido debe ser igual o mayor al efectivo.');
  //       this.focusElement(this.recibidoInput);
  //       return;
  //     }
  //     if (this.getPendiente() <= 0) {
  //       this.cerrarMetodosPago();
  //     } else {
  //       this.focusElement(this.tarjetaInput);
  //     }
  //   }
  // }

  onTarjetaKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.tarjeta > 0) {
        this.focusElement(this.referenciaTarjetaInput);
      } else {
        this.focusElement(this.transferenciaInput);
      }
    }
  }

  onReferenciaTarjetaKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.pagoValido) {
        this.cerrarMetodosPago();
      } else {
        this.focusElement(this.transferenciaInput);
      }
    }
  }

  onTransferenciaKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.transferencia > 0) {
        this.focusElement(this.referenciaTransferenciaInput);
      } else {
        //this.cerrarMetodosPago();
        this.focusElement(this.chequeInput);
      }
    }
  }

  onReferenciaTransferenciaKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.pagoValido) {
        this.cerrarMetodosPago();
      } else {
        this.focusElement(this.chequeInput);
      }
    }
  }

  onChequeKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.pagoValido) {
        this.cerrarMetodosPago();
      } else {
        this.focusElement(this.dineroElectronicoInput);
      }
    }
  }

  onDineroElectronicoKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.pagoValido) {
        this.cerrarMetodosPago();
      } else {
        this.focusElement(this.cobrarButton);
      }
    }
  }

  getPendiente(): number {
    return this.total - this.totalPagado;
  }

  private focusElement(element: ElementRef | undefined): void {
    if (!element) return;
    setTimeout(() => {
      try {
        if (element.nativeElement) {
          element.nativeElement.focus();
        }
      } catch (error) {
        // Silenciar error de focus
      }
    }, 0);
  }

  calcularCambio(): void {
    const efectivo = this.efectivo || 0;
    const tarjeta = this.tarjeta || 0;
    const transferencia = this.transferencia || 0;
    const cheque = this.cheque || 0;
    const dineroElectronico = this.dineroElectronico || 0;

    this.pagoElectronicoExcedido = (transferencia + tarjeta + cheque + dineroElectronico) > this.total;

    const pendiente = this.total - tarjeta - transferencia - cheque - dineroElectronico;
    this.cambio = efectivo > pendiente ? efectivo - pendiente : 0;
    this.totalPagado = efectivo + tarjeta + transferencia + cheque + dineroElectronico - this.cambio;
    this.cambio = Math.round(this.cambio * 100) / 100;
    this.totalPagado = Math.round(this.totalPagado * 100) / 100;

    if (this.bCredito) {
      this.pagoValido = this.totalPagado > 0 && this.totalPagado <= this.total && !this.pagoElectronicoExcedido && this.totalPagado > 0;
    } else {
      this.pagoValido = this.totalPagado === this.total && !this.pagoElectronicoExcedido && this.totalPagado > 0;
    }

    this.cdRef.detectChanges();
  }

  cerrarMetodosPago(): void {
    if (this.pagoElectronicoExcedido) {
      this.servicesGServ.showSnakbar('La suma de pagos electrónicos no puede exceder el total');
      return;
    }
    if (!this.pagoValido) {
      if (this.bCredito) {
        this.servicesGServ.showSnakbar('En venta a crédito, el pago debe ser mayor a $0 y no exceder el total.');
      } else {
        this.servicesGServ.showSnakbar('El pago debe cubrir exactamente el total de la venta.');
      }
      return;
    }

    var newEfectivo = this.efectivo - this.cambio;

    const metodosPago = {
      efectivo: newEfectivo,
      recibido: this.efectivo,
      cambio: this.cambio,
      tarjeta: this.tarjeta,
      referenciaTarjeta: this.referenciaTarjeta,
      transferencia: this.transferencia,
      referenciaTransferencia: this.referenciaTransferencia,
      fechaTransferencia: this.fechaTransferencia,
      cheque: this.cheque,
      fechaDeposito: this.fechaDeposito,
      dineroElectronico: this.dineroElectronico,
    };
    this.dialogRef.close({ bOK: true, metodosPago });
  }

  cancelar(): void {
    this.dialogRef.close({ bOK: false, metodosPago: null });
  }
}
