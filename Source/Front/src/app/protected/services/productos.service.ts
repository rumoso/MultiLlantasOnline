import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Pagination, ResponseGet } from '../interfaces/global.interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private baseURL: string = environment.baseUrl;
  private _api: string = 'api/productos';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene lista de productos con paginación
   * @param pagination Objeto con pageIndex, pageSize y search
   * @returns Observable con la respuesta del servidor
   */
  getProductById(id: any): Observable<ResponseGet> {
    return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/getProductById`, { idProducto: id });
  }

  getProductsPag(pagination: Pagination): Observable<ResponseGet> {
    const start = pagination.pageIndex * pagination.pageSize;
    const limiter = pagination.pageSize;

    const data = {
      search: pagination.search || '',
      start: start,
      limiter: limiter
    };

    return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/getProductsPag`, data);
  }

  /**
   * Catalogo con filtros multiseleccion. Recibe arreglos de
   * marcas/anchos/perfiles/rines (ademas del texto libre y la paginacion).
   */
  getProductsFiltered(pagination: Pagination, filtros: {
    marcas?: string[]; anchos?: string[]; perfiles?: string[]; rines?: string[];
  }): Observable<ResponseGet> {
    const data = {
      search: pagination.search || '',
      marcas: filtros.marcas || [],
      anchos: filtros.anchos || [],
      perfiles: filtros.perfiles || [],
      rines: filtros.rines || [],
      start: pagination.pageIndex * pagination.pageSize,
      limiter: pagination.pageSize
    };

    return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/getProductsFiltered`, data);
  }



  /**
   * Obtiene productos por marca
   * @param marca Nombre de la marca
   * @param pagination Paginación
   * @returns Observable con la respuesta del servidor
   */
  getProductsByMarca(marca: string, pagination: Pagination): Observable<ResponseGet> {
    const start = pagination.pageIndex * pagination.pageSize;
    const limiter = pagination.pageSize;

    const data = {
      marca: marca,
      search: pagination.search || '',
      start: start,
      limiter: limiter
    };

    return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/getProductsByMarca`, data);
  }

  /**
   * Obtiene las marcas disponibles
   * @returns Observable con la lista de marcas
   */
  getMarcas(): Observable<ResponseGet> {
    return this.http.get<ResponseGet>(`${this.baseURL}/${this._api}/getMarcas`);
  }

  /**
   * Obtiene las medidas distintas (ancho/perfil/rin) para el buscador por medida
   */
  getMedidas(): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/${this._api}/getMedidas`);
  }

  agregarAlCarrito(data: any): Observable<ResponseGet> {
    return this.http.post<ResponseGet>(`${this.baseURL}/${this._api}/agregarAlCarrito`, data);
  }

}
