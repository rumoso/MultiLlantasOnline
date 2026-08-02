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

  hidePwd2: boolean = true;

  myRegister: any = {
    name: '',
    userName: '',
    pwd: '',
    pwd2: ''
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

  get usuarioEsValido(): boolean {
    const valor = (this.myRegister.userName || '').trim();
    const esCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    const esCelular = /^\d{7,15}$/.test(valor);
    return esCorreo || esCelular;
  }

  get passwordsCoinciden(): boolean {
    return this.myRegister.pwd.length > 0
      && this.myRegister.pwd === this.myRegister.pwd2;
  }

  get formValido(): boolean {
    return this.myRegister.name.length > 0
      && this.usuarioEsValido
      && this.myRegister.pwd.length >= 6
      && this.passwordsCoinciden;
  }

  fn_register() {

    if (this.formValido) {
      this.bShowSpinner = true;

      const payload = {
        name: this.myRegister.name,
        userName: this.myRegister.userName.trim(),
        pwd: this.myRegister.pwd
      };

      this.authServ.CRegister(payload)
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

  cancelar() {
    this.servicesGServ.changeRoute(`/${this._appMain}/dashboard`);
  }

}
