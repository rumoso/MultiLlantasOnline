import { Component, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { SharedModule } from '../../../shared/Shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { CartService } from '../../../protected/services/cart.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    SharedModule,
    MaterialModule,
  ]
})
export default class LoginComponent {

  private _appMain: string = environment.appMain;

  public dialogRef = inject(MatDialogRef<LoginComponent>, { optional: true });

  hidePwd: boolean = true;

  bShowSpinner: boolean = false;

  myLogin: any = {
    username: '',
    pwd: ''
  };

  constructor(private fb: FormBuilder
    , private authServ: AuthService
    , private servicesGServ: ServicesGService
    , private cartService: CartService // Inyección correcta
  ) {
    // Como dialogo (abierto sobre la pantalla actual) no hace falta este
    // bootstrap de ruta - solo aplica cuando /auth/login se visita directo.
    if (!this.dialogRef) {
      var idUserLogOn = this.authServ.getIdUserSession();

      if (idUserLogOn > 0) {
        this.servicesGServ.changeRoute(`/${this._appMain}/dashboard`);
      } else {
        this.authServ.logout(false);
      }
    }

  }

  ngAfterViewInit() {
    this.focusNext('tbxUsuario')
  }

  focusNext(field: string) {
    setTimeout(() => {
      const iInput = document.getElementById(field);
      if (iInput) {
        iInput.focus();
      }
    }, 300);
  }

  irARegistro() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.servicesGServ.changeRoute('/auth/register');
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  fn_login() {

    if (this.myLogin.username.length > 0 && this.myLogin.pwd.length > 0) {
      this.bShowSpinner = true;

      //console.log(this.myLogin.value)
      //this.servicesGService.showSnakbar( this.myLogin.value.username + ", " + this.myLogin.value.pwd);

      this.authServ.CLogin(this.myLogin)
        .subscribe({
          next: (resp) => {
            if (resp.status === 0) {
              // Actualizar carrito
              this.cartService.getCart().subscribe();

              if (this.dialogRef) {
                // Como dialogo: cerrar y quedarse en la pantalla actual
                this.dialogRef.close(true);
              } else {
                this.servicesGServ.changeRoute(`/${this._appMain}/dashboard`);
              }
            } else {
              this.servicesGServ.showSnakbar(resp.message);
            }
            this.bShowSpinner = false;
          },
          error: (ex) => {
            console.log(ex)
            this.servicesGServ.showSnakbar("Problemas con el servicio");
            this.bShowSpinner = false;
          }
        })
    }
  }

}
