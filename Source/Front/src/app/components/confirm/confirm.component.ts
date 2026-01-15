import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DDialog } from '../../interfaces/general.interfaces';
import { SharedModule } from '../../shared/Shared.module';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';

// Interface para datos flexibles del diálogo
interface FlexibleDialogData {
  // Estructura nueva (para corte general)
  title?: string;
  message?: string;
  details?: string[];
  confirmText?: string;
  cancelText?: string;

  // Estructura antigua (DDialog)
  header?: string;
  question?: string;
  buttonYes?: string;
  buttonNo?: string;
}

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css'],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
  ],
})
export class ConfirmComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FlexibleDialogData
  ) { }

  ngOnInit(): void {
  }

  delete(){
    this.dialogRef.close(true);
  }

  close(){
    this.dialogRef.close(false);
  }

  // Métodos para obtener datos de manera flexible
  getTitle(): string {
    return this.data.title || this.data.header || 'Confirmación';
  }

  getMessage(): string {
    return this.data.message || '';
  }

  getQuestion(): string {
    return this.data.question || '';
  }

  getDetails(): string[] {
    return this.data.details || [];
  }

  getConfirmText(): string {
    return this.data.confirmText || this.data.buttonYes || 'Confirmar';
  }

  getCancelText(): string {
    return this.data.cancelText || this.data.buttonNo || 'Cancelar';
  }

  getIconName(): string {
    // Ícono dinámico según el título o contenido
    if (this.data.title?.toLowerCase().includes('finaliza')) {
      return 'assignment_turned_in';
    }
    if (this.data.title?.toLowerCase().includes('eliminar') || this.data.title?.toLowerCase().includes('borrar')) {
      return 'delete';
    }
    if (this.data.title?.toLowerCase().includes('warning') || this.data.title?.toLowerCase().includes('advertencia')) {
      return 'warning';
    }
    return 'help_outline';
  }

  getIconClass(): string {
    // Clase CSS dinámica según el tipo de diálogo
    if (this.data.title?.toLowerCase().includes('finaliza')) {
      return 'dialog-icon-success';
    }
    if (this.data.title?.toLowerCase().includes('eliminar') || this.data.title?.toLowerCase().includes('borrar')) {
      return 'dialog-icon-danger';
    }
    if (this.data.title?.toLowerCase().includes('warning') || this.data.title?.toLowerCase().includes('advertencia')) {
      return 'dialog-icon-warning';
    }
    return 'dialog-icon-info';
  }

  isSuccessAction(): boolean {
    // Determina si la acción es de tipo "éxito" (como finalizar algo)
    return this.data.title?.toLowerCase().includes('finaliza') ||
           this.data.confirmText?.toLowerCase().includes('finalizar') ||
           this.data.buttonYes?.toLowerCase().includes('finalizar') ||
           false;
  }
}
