import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { FavoritesService } from '../../services/favorites.service';
import { FavoritesOverlayComponent } from '../../components/favorites-overlay/favorites-overlay.component';
import { CartService } from '../../services/cart.service';
import { CartOverlayComponent } from '../../components/cart-overlay/cart-overlay.component';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  imports: [
    SharedModule,
    MaterialModule,
    FormsModule,
    CartOverlayComponent,
    FavoritesOverlayComponent
  ]
})
export default class MainComponent implements OnInit, OnDestroy {

  @ViewChild('cartSidenav') cartSidenav!: MatSidenav;
  @ViewChild('favoritesSidenav') favoritesSidenav!: MatSidenav;

  public isCartOpen: boolean = false;

  private _appMain: string = environment.appMain;
  public _IconApp: string = environment.iconApp;
  public _appName: string = environment.appName;
  public _cajaInfo: any = null;
  private cdref = inject(ChangeDetectorRef);
  private cajaInfoService = inject(CajaInfoService);
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);
  private cajaInfoSubscription!: Subscription;
  private cartSubscription!: Subscription;
  private cartToggleSubscription!: Subscription;
  private favoritesToggleSubscription!: Subscription;

  public cartCount: number = 0;
  public cartAnimated: boolean = false;

  // Control de backdrop para sidenavs
  public showBackdrop: boolean = true;

  public configLocal: any = {};

  constructor(
    private authService: AuthService,
    private servicesGServ: ServicesGService
  ) { }

  get userLogin() {
    return this.authService.userLogin;
  }

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

    // Suscribirse al conteo del carrito
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartCount = items.length;
      this.cdref.detectChanges();
    });

    // Subscribe to favorites toggle
    this.favoritesToggleSubscription = this.favoritesService.toggleFavorites$.subscribe(open => {
      if (open) {
        this.toggleFavorites();
      }
    });

    this.cartToggleSubscription = this.cartService.toggleCart$.subscribe(open => {
      if (open) {
        this.animateCart();
      }
    });

    // var idUserLogOn = localStorage.getItem('idUser');
    // if (!(idUserLogOn?.length! > 0)) {
    //   this.servicesGServ.changeRoute('/');
    // }

  }

  ngOnDestroy(): void {
    if (this.cajaInfoSubscription) {
      this.cajaInfoSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.cartToggleSubscription) {
      this.cartToggleSubscription.unsubscribe();
    }
    if (this.favoritesToggleSubscription) {
      this.favoritesToggleSubscription.unsubscribe();
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

  toggleCart(): void {
    if (this.cartSidenav) {
      this.showBackdrop = true; // El carrito sí usa backdrop
      // Pequeño timeout para asegurar que el cambio de propiedad se detecte antes de abrir
      setTimeout(() => this.cartSidenav.toggle(), 0);
    }
  }

  toggleFavorites(): void {
    if (this.favoritesSidenav) {
      this.showBackdrop = false; // Favoritos no usa backdrop (click outside permitido)
      setTimeout(() => this.favoritesSidenav.toggle(), 0);
    }
  }

  animateCart(): void {
    this.cartAnimated = true;
    setTimeout(() => {
      this.cartAnimated = false;
      this.cdref.detectChanges();
    }, 1000);
    this.cdref.detectChanges();
  }

  handleUserAction() {
    if (this.userLogin) {
      // Si está logueado, ir al perfil (o menú de usuario)
      this.servicesGServ.changeRoute(`/${this.configLocal.sRutaInicial}/usuario`);
    } else {
      // Si no, ir al login
      this.servicesGServ.changeRoute('/auth/login');
    }
  }

  logout() {
    this.authService.logout(true);
  }

  // Método para buscar productos
  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
      // TODO: Implementar lógica de búsqueda
      // this.router.navigate(['/Multillantas/productos'], {
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
