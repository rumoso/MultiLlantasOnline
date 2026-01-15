import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../auth/services/auth.service';
import { CajasService } from '../../../services/cajas.service';
import { CortesCajaService } from '../../../services/cortes-caja.service';
import { DateUtilsService } from '../../../../utils/date-utils.service';
import { Cajas } from '../../../interfaces/cajas/cajas';
import { SharedModule } from '../../../../shared/Shared.module';
import { MaterialModule } from '../../../../shared/material.module';

@Component({
  selector: 'app-iniciar-turno-dialog',
  templateUrl: './iniciar-turno-dialog.component.html',
  styleUrls: ['./iniciar-turno-dialog.component.css'],
  imports: [
    SharedModule,
    MaterialModule,
  ]
})
export class IniciarTurnoDialogComponent implements OnInit {

  iniciarTurnoForm: FormGroup;
  loading = false;
  cajas: Cajas[] = [];
  nombreUsuario = '';
  fechaActual = new Date();
  idUserLogON = 0;
  saldoSugerido: number = 0;
  mostrarSugerencia: boolean = false;
  cargandoSugerencia: boolean = false;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<IniciarTurnoDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private cajasService = inject(CajasService);
  private cortesCajaService = inject(CortesCajaService);
  private dateUtilsService = inject(DateUtilsService);

  constructor() {
    this.iniciarTurnoForm = this.fb.group({
      idcajas: [null, [Validators.required]], // Cambiado de '' a null para mejor manejo
      saldoinicial: [0, [Validators.required, Validators.min(0)]]
    });
  }

  async ngOnInit() {
    try {
      this.idUserLogON = this.authService.getIdUserSession();

      // Obtener el nombre del usuario del localStorage
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      this.nombreUsuario = userInfo.nombre || userInfo.username || 'Usuario';

      // Obtener información de sucursal y cajas disponibles
      await this.loadCajas();
      
      // Cargar saldo sugerido si se proporcionó en los datos
      if (this.data && this.data.saldoSugerido !== undefined) {
        this.saldoSugerido = this.data.saldoSugerido;
        this.mostrarSugerencia = this.saldoSugerido > 0;
        
        // Prellenar el campo con el saldo sugerido
        if (this.mostrarSugerencia) {
          this.iniciarTurnoForm.patchValue({
            saldoinicial: this.saldoSugerido
          });
        }
      }
    } catch (error) {
      console.error('Error al inicializar el diálogo:', error);
      this.snackBar.open('Error al cargar la información inicial', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private async loadCajas() {
    try {
      // Primero obtener la configuración para saber qué caja preseleccionar
      const config = JSON.parse(localStorage.getItem('config') || '{}');
      const idCajaPreseleccionada = config?.idCaja || null;

      // Obtener la información de la sucursal desde localStorage
      const infoSucursal = JSON.parse(localStorage.getItem('infoSucursal') || '{}');

      if (infoSucursal && infoSucursal.idSucursal) {
        // Obtener las cajas de la sucursal
        this.cajasService.getCajas(infoSucursal.idSucursal).subscribe({
          next: (response: any) => {
            if (response.status === 0) {
              this.cajas = response.data.filter((caja: Cajas) => caja.active);

              // Preseleccionar la caja basándose en la configuración
              if (idCajaPreseleccionada) {
                // Verificar si la caja de configuración está en la lista
                const cajaEncontrada = this.cajas.find(caja => caja.idcajas === idCajaPreseleccionada);
                if (cajaEncontrada) {
                  this.iniciarTurnoForm.patchValue({
                    idcajas: idCajaPreseleccionada
                  });
                  console.log(`Caja preseleccionada desde config: ${cajaEncontrada.nombre}`);
                }
              } else if (this.cajas.length === 1) {
                // Si solo hay una caja y no hay preselección, seleccionarla automáticamente
                this.iniciarTurnoForm.patchValue({
                  idcajas: this.cajas[0].idcajas
                });
              }
            }
          },
          error: (error: any) => {
            console.error('Error al cargar las cajas:', error);
            this.snackBar.open('Error al cargar las cajas disponibles', 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else if (config && config.idCaja) {
        // Si no hay info de sucursal, usar la configuración local
        this.cajasService.getCajasByID(config.idCaja).subscribe({
          next: (response: any) => {
            if (response.status === 0) {
              this.cajas = [response.data];
              this.iniciarTurnoForm.patchValue({
                idcajas: response.data.idcajas
              });
              console.log(`Caja cargada desde config por ID: ${response.data.nombre}`);
            }
          },
          error: (error: any) => {
            console.error('Error al cargar la caja por ID:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar las cajas:', error);
    }
  }

  onIniciarTurno() {
    if (this.iniciarTurnoForm.valid && !this.loading) {
      this.loading = true;

      const turnoData = {
        idcajas: parseInt(this.iniciarTurnoForm.value.idcajas),
        idUser: this.idUserLogON,
        fecha: this.dateUtilsService.formatearFechaYYYYMMDD(new Date()),
        horaActual: this.dateUtilsService.formatearSoloHoraHHmmss(new Date()),
        saldoinicial: Number(this.iniciarTurnoForm.value.saldoinicial)
      };

      console.log('Datos del turno a enviar:', turnoData);
      console.log('Validación del formulario:', this.iniciarTurnoForm.valid);
      console.log('Valores del formulario:', this.iniciarTurnoForm.value);

      this.cortesCajaService.iniciarTurno(turnoData).subscribe({
        next: (response) => {
          this.loading = false;

          if (response.status === 0) {
            this.snackBar.open('Turno iniciado exitosamente', 'Cerrar', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });

            // Cerrar el diálogo y pasar los datos del turno iniciado
            this.dialogRef.close({
              success: true,
              turno: response.data
            });
          } else {
            this.snackBar.open(response.message || 'Error al iniciar el turno', 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al iniciar turno:', error);

          let errorMessage = 'Error al iniciar el turno';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Formulario inválido o ya está cargando
      console.log('❌ No se puede iniciar turno:');
      console.log('- Formulario válido:', this.iniciarTurnoForm.valid);
      console.log('- Ya está cargando:', this.loading);
      console.log('- Errores del formulario:', this.iniciarTurnoForm.errors);

      // Mostrar errores específicos de campos
      Object.keys(this.iniciarTurnoForm.controls).forEach(key => {
        const control = this.iniciarTurnoForm.get(key);
        if (control && control.errors) {
          console.log(`- Error en ${key}:`, control.errors);
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close({ success: false });
  }

  /**
   * Obtiene el nombre completo de la caja seleccionada para mostrar en el input readonly
   * @returns string con el nombre y descripción de la caja
   */
  getNombreCajaSeleccionada(): string {
    const idCajaSeleccionada = this.iniciarTurnoForm.get('idcajas')?.value;
    if (idCajaSeleccionada && this.cajas.length > 0) {
      const cajaEncontrada = this.cajas.find(caja => caja.idcajas === idCajaSeleccionada);
      if (cajaEncontrada) {
        return `${cajaEncontrada.nombre}`;
      }
    }
    return 'Caja no seleccionada';
  }

  /**
   * Aplica el saldo sugerido al campo de saldo inicial
   */
  aplicarSugerencia() {
    if (this.saldoSugerido > 0) {
      this.iniciarTurnoForm.patchValue({
        saldoinicial: this.saldoSugerido
      });
    }
  }
}
