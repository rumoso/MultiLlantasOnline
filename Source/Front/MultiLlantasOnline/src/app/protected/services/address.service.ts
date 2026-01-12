import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { Estados } from '../../interfaces/addresses/estados';
import { Observable } from 'rxjs';
import { ResponseGet } from '../interfaces/global.interfaces';
import { Colonias } from '../../interfaces/addresses/colonias';
import { Ciudades } from '../../interfaces/addresses/ciudades';
import { Municipios } from '../../interfaces/addresses/municipios';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private baseURL: string = environment.baseUrl;
    _api: string = 'api/addresses';

  constructor(private http: HttpClient, private authServ: AuthService) { }

    GetEstados(search:string, estado:Estados): Observable<ResponseGet>{
      const data = {
        search,
        codigoestado: estado.codigoestado,
        start:0,
        limiter:1000
      };
      return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/estados`,data);
    }

    GetMunicipios(search:string, municipio: Municipios): Observable<ResponseGet>{

      const data = {
        search,
        municipio,
        start:0,
        limiter:1000
      };
      return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/municipios`, data);
    }

    GetCiudades(search:string, ciudad:Ciudades): Observable<ResponseGet>{
      const data = {
        search,
        ciudad,
        start:0,
        limiter:1000
      };
      return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/ciudades`,data);
    }

    GetColonias(search:string, colonia:Colonias): Observable<ResponseGet>{
      const data = {
        search,
        codigoPostal:colonia.codigopostal,
        codigociudad:colonia.codigociudad,
        codigomunicipio: colonia.codigomunicipio,
        codigoestado: colonia.codigoestado,
        start:0,
        limiter:1000
      };
      return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/colonias`, data);
    }

    GetCodigoPostal(codigoPostal:string =""): Observable<ResponseGet>{
      const data = {
        codigoPostal
      };
      return this.http.post<ResponseGet>( `${ this.baseURL }/${ this._api }/codigopostal`, data);
    }

    GetColoniaById(codigocolonia: number): Observable<ResponseGet>{

      return this.http.get<ResponseGet>( `${ this.baseURL }/${ this._api }/colonia/${codigocolonia}`);
    }
}
