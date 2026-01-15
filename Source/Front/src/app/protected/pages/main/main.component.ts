import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../auth/services/auth.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';
import { SharedModule } from '../../../shared/Shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { Subscription } from 'rxjs';
import { CajaInfoService } from '../../../shared/services/caja-info.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ResponseGet } from '../../interfaces/global.interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  imports: [
    SharedModule,
    MaterialModule,
    FormsModule
  ]
})
export default class MainComponent implements OnInit, OnDestroy {

  private _appMain: string = environment.appMain;
  public _IconApp: string = environment.iconApp;
  public _appName: string = environment.appName;
  public _cajaInfo: any = null;
  private cdref = inject(ChangeDetectorRef);
  private cajaInfoService = inject(CajaInfoService);
  private cajaInfoSubscription!: Subscription;

  public configLocal: any = {};

  constructor(
    private authService: AuthService,
    private servicesGServ: ServicesGService
  ) { }

  get userLogin() {
    return this.authService.userLogin;
  }

  _userLogin: any;
  _menuList: any = [];

  MenusList: any[] = [];
  nombreCaja: string = '';

  // Propiedad para el buscador
  searchQuery: string = '';

  async ngOnInit() {
    this.authService.checkSession();

    // Carga inicial del nombre de la caja
    this.getInfoCaja();

    // Suscribirse a los cambios de información de la caja
    this.cajaInfoSubscription = this.cajaInfoService.cajaInfo$.subscribe(cajaInfo => {
      if (cajaInfo && cajaInfo.nombre) {
        this.nombreCaja = cajaInfo.nombre;
      } else {
        this.nombreCaja = '';
      }
      this.cdref.detectChanges();
    });

    var idUserLogOn = localStorage.getItem('idUser');
    if (!(idUserLogOn?.length! > 0)) {
      this.servicesGServ.changeRoute('/');
    }

  }

  ngOnDestroy(): void {
    if (this.cajaInfoSubscription) {
      this.cajaInfoSubscription.unsubscribe();
    }
  }

  getInfoCaja() {
    const storedInfo = localStorage.getItem('infoSucursal');
    if (storedInfo) {
      this._cajaInfo = JSON.parse(storedInfo);
      if (this._cajaInfo && this._cajaInfo.nombre) {
        this.nombreCaja = this._cajaInfo.nombre;
      } else {
        this.nombreCaja = '';
      }
    } else {
      this.nombreCaja = '';
    }
  }

  changeRoute(route: string): void {
    this.servicesGServ.changeRoute(`/${this._appMain}/${route}`);
  }

  logout() {
    this.authService.logout(true);
  }

  // Método para buscar productos
  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
      // TODO: Implementar lógica de búsqueda
      // this.router.navigate(['/DiprolimWeb/productos'], {
      //   queryParams: { q: this.searchQuery }
      // });
    }
  }

  getMenuByPermissions(idUser: any) {
    this.authService.getMenuByPermissions(idUser)
      .subscribe(data => {
        if (data.status == 0) {
          this._menuList = data.data;
        }
      });
  }

}
