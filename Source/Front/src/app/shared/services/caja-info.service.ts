import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CajaInfoService {
  private cajaInfoSubject = new BehaviorSubject<any>(this.getInitialCajaInfo());
  public cajaInfo$: Observable<any> = this.cajaInfoSubject.asObservable();

  constructor() { }

  private getInitialCajaInfo(): any {
    const info = localStorage.getItem('infoSucursal');
    return info ? JSON.parse(info) : null;
  }

  updateCajaInfo(newInfo: any): void {
    localStorage.setItem('infoSucursal', JSON.stringify(newInfo));
    this.cajaInfoSubject.next(newInfo);
  }

  getCurrentCajaNombre(): string {
    const currentInfo = this.cajaInfoSubject.getValue();
    return currentInfo && currentInfo.nombre ? currentInfo.nombre : '';
  }
}
