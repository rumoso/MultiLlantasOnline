import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { Pagination, ResponseDB_CRUD, ResponseGet } from '../interfaces/global.interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private baseURL: string = environment.baseUrl;

  _api: string = 'api/users';

  constructor(
    private http: HttpClient
    , private authServ: AuthService
  ) { }

  CGetUsersListWithPage( pagination: Pagination ): Observable<ResponseGet> {

    let start = pagination.pageIndex * pagination.pageSize;
    let limiter = pagination.pageSize;

    const data = {
      search: pagination.search
      ,start: start
      ,limiter: limiter
    };

    return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/getUsersListWithPage`, data);

  }

  CGetUserByID( id: number ): Observable<ResponseGet> {
    var data = {
      idUser: id
    }
    return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/getUserByID`, data);
  }

  CInsertUser( data : any ): Observable<ResponseDB_CRUD> {
    data.idUserLogON = this.authServ.getIdUserSession();
    return this.http.post<ResponseDB_CRUD>( `${ this.baseURL }/${ this._api }/insertUser`, data );
  }

  CUpdateUser( data : any ): Observable<ResponseDB_CRUD> {
    return this.http.post<ResponseDB_CRUD>( `${ this.baseURL }/${ this._api }/updateUser`, data );
  }

  CChangePassword( data : any ): Observable<ResponseDB_CRUD> {
    return this.http.post<ResponseDB_CRUD>( `${ this.baseURL }/${ this._api }/changePassword`, data );
  }

  CDisabledUser( idUser : any ): Observable<ResponseDB_CRUD> {
    var data = {
      idUser: idUser
    }
    return this.http.post<ResponseDB_CRUD>( `${ this.baseURL }/${ this._api }/disabledUser`, data );
  }

  CCbxGetSellersCombo( search: string, idUser: number ): Observable<ResponseGet> {
    var data = {
      idUser: idUser,
      search: search
    }
    return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/cbxGetSellersCombo`, data);
  }

  CUpdateAuthorizationCode( data : any ): Observable<ResponseDB_CRUD> {
    return this.http.post<ResponseDB_CRUD>( `${ this.baseURL }/${ this._api }/updateAuthorizationCode`, data );
  }

  CGetCatStatusUser( data: any ): Observable<ResponseGet> {
    return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/getCatStatusUser`, data);
  }

  cbxGetEmployeesForOrigen( data: any ): Observable<ResponseGet> {
    return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/cbxGetEmployeesForOrigen`, data);
  }

  cbxGetUsersByVendedor( data: any ): Observable<ResponseGet> {
    return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/cbxGetUsersByVendedor`, data);
  }

}
