import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';
import { SharedModule } from '../../../shared/Shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { CartService } from '../../../protected/services/cart.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    SharedModule,
    MaterialModule,
  ]
})
export default class RegisterComponent {

  private _appMain: string = environment.appMain;

  hidePwd: boolean = true;

  bShowSpinner: boolean = false;

  myRegister: any = {
    name: '',
    userName: '',
    email: '',
    telefono: '',
    pwd: ''
  };

  constructor(private fb: FormBuilder
    , private authServ: AuthService
    , private servicesGServ: ServicesGService
    , private cartService: CartService
  ) {
    var idUserLogOn = this.authServ.getIdUserSession();

    if (idUserLogOn > 0) {
      this.servicesGServ.changeRoute(`/${this._appMain}/dashboard`);
    }
  }

  ngAfterViewInit() {
    this.focusNext('tbxNombre')
  }

  focusNext(field: string) {
    setTimeout(() => {
      const iInput = document.getElementById(field);
      if (iInput) {
        iInput.focus();
      }
    }, 300);
  }

  get formValido(): boolean {
    return this.myRegister.name.length > 0
      && this.myRegister.userName.length > 0
      && this.myRegister.email.length > 0
      && this.myRegister.pwd.length >= 6;
  }

  fn_register() {

    if (this.formValido) {
      this.bShowSpinner = true;

      this.authServ.CRegister(this.myRegister)
        .subscribe({
          next: (resp) => {
            if (resp.status === 0) {
              // Actualizar carrito (ya fusionado con lo del invitado)
              this.cartService.getCart().subscribe();
              this.servicesGServ.changeRoute(`/${this._appMain}/dashboard`);
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

  irALogin() {
    this.servicesGServ.changeRoute('/auth/login');
  }

}
