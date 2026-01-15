import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ServicesGService } from '../../servicesG/servicesG.service';
import { Login, ResponseGet } from '../../interfaces/general.interfaces';
import { firstValueFrom, Observable, of, tap } from 'rxjs';
import { ResponseDB_CRUD } from '../../protected/interfaces/global.interfaces';
import { GuestService } from '../../shared/services/guest.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseURL: string = environment.baseUrl;

  _api: string = 'api/auth';

  private _userLogin: any | undefined;

  constructor(
    private http: HttpClient
    , private servicesGServ: ServicesGService
    , private guestService: GuestService
  ) { }

  CLogin(login: any): Observable<ResponseGet> {

    return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/login`, login)
      .pipe(
        tap(async userLogin => {
          if (userLogin.status == 0) {
            this._userLogin = userLogin.data!.user;
            localStorage.setItem('idUser', JSON.stringify(userLogin.data.user.idUser));
            localStorage.setItem('sIdU', JSON.stringify(userLogin.data.user.sIdU));
            localStorage.setItem('user', JSON.stringify(userLogin.data.user));
            localStorage.setItem('token', JSON.stringify(userLogin.data.token));
            localStorage.setItem('idSucursalPrincipal', JSON.stringify(userLogin.data.user.idSucursalPrincipal));
            localStorage.setItem('countSucursales', JSON.stringify(userLogin.data.user.countSucursales));

            var oActions = await this.CGetActionsPermissionPromise(userLogin.data.user.idUser)
            if (oActions)
              localStorage.setItem('oActions', JSON.stringify(oActions));

            var oRoles = await this.getRolesByIDUserPromise(userLogin.data.user.idUser)
            if (oRoles)
              localStorage.setItem('oRoles', JSON.stringify(oRoles));

            // Limpiar guest_id después de login exitoso
            this.guestService.clearGuestId();
          }
        })
      );
  }

  get userLogin(): any | undefined {

    if (localStorage.getItem('user')) {
      let u: any = JSON.parse(localStorage.getItem('user')!.toString());
      return u;
    }

    return undefined;
  }



  logout(bRedirect: boolean) {
    localStorage.removeItem('user');
    localStorage.removeItem('idUser');
    localStorage.removeItem('token');
    localStorage.removeItem('idSucursalPrincipal');
    localStorage.removeItem('countSucursales');
    localStorage.removeItem('oActions');
    localStorage.removeItem('config');
    localStorage.removeItem('infoSucursal');
    localStorage.removeItem('turnoActivo');

    if (bRedirect)
      this.servicesGServ.changeRoute('/login');
  }

  validaAuth(): Observable<boolean> {
    if (!localStorage.getItem('user')) {
      return of(false);
    }

    return of(true);
  }

  getMenuByPermissions(idUser: number): Observable<ResponseGet> {
    const data = {
      idUser: idUser
    };
    return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/getMenuByPermissions`, data);
  }

  async checkSession() {

    let idUser = this.getIdUserSession();

    if (idUser == 0) {
      this.logout(false);
      this.servicesGServ.changeRoute('/');
    }
  }

  getIdUserSession(): number {
    if (localStorage.getItem('idUser')) {
      let idUser: number = + localStorage.getItem('idUser')!.toString();
      return idUser;
    }

    return 0;
  }

  getIdSucursalPrincipal(): number {
    if (localStorage.getItem('idSucursalPrincipal')) {
      let idSucursalPrincipal: number = + localStorage.getItem('idSucursalPrincipal')!.toString();
      return idSucursalPrincipal;
    }

    return 0;
  }

  async CGetActionsPermissionPromise(idUser: number): Promise<any> {
    var data: any = {
      idUser: idUser
    }

    data.idUserLogON = this.getIdUserSession();

    return new Promise((resolve, reject) => {

      this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/getActionsPermissionByUser`, data)
        .subscribe({
          next: (resp: ResponseGet) => {
            resolve(resp.data);
          }
          , error: (err: any) => {
            reject(err);
          }
        });

    });

  }

  async getRolesByIDUserPromise(idUser: number): Promise<any> {
    var data: any = {
      idUser: idUser
    }

    data.idUserLogON = this.getIdUserSession();

    return new Promise((resolve, reject) => {

      this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/getRolesByIdUser`, data)
        .subscribe({
          next: (resp: ResponseGet) => {
            resolve(resp.data);
          }
          , error: (err: any) => {
            reject(err);
          }
        });

    });

  }

  async getIdVendedorByIDUser(idUser: number): Promise<any> {
    var data: any = {
      idUser: idUser
    }

    data.idUserLogON = this.getIdUserSession();

    return new Promise((resolve, reject) => {

      this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/getIdVendedorByIDUser`, data)
        .subscribe({
          next: (resp: ResponseGet) => {
            resolve(resp.data);
          }
          , error: (err: any) => {
            reject(err);
          }
        });

    });

  }

  async getIdVendedorByIDUserPromise(idUser: number): Promise<any> {
    var data: any = {
      idUser: idUser
    }

    data.idUserLogON = this.getIdUserSession();

    return new Promise((resolve, reject) => {

      this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/getIdVendedorByIDUser`, data)
        .subscribe({
          next: (resp: ResponseGet) => {
            resolve(resp.data);
          }
          , error: (err: any) => {
            reject(err);
          }
        });

    });

  }

  hasPermissionAction(name: string): boolean {
    if (localStorage.getItem('oActions')) {
      var oActions = JSON.parse(localStorage.getItem('oActions')!);
      return oActions?.some((action: any) => action.name === name);
    }

    return false;
  }

  CGetMenuForPermissions(data: any): Observable<ResponseGet> {

    data.idUserLogON = this.getIdUserSession();

    return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/getMenuForPermissions`, data);

  }

  CInsertMenusPermisionsByIdRelation(data: any): Observable<ResponseDB_CRUD> {

    data.idUserLogON = this.getIdUserSession();

    return this.http.post<ResponseDB_CRUD>(`${this.baseURL}/${this._api}/insertMenusPermisionsByIdRelation`, data);
  }

}
