import { Component, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SharedModule } from '../../../shared/Shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { environment } from '../../../../environments/environment';
import { ServicesGService } from '../../../servicesG/servicesG.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductosService } from '../../services/productos.service';
import { Pagination } from '../../interfaces/global.interfaces';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import ProductDetailsComponent from '../product-details/product-details.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    SharedModule,
    MaterialModule,
  ]
})
export default class DashboardComponent {

  private _appMain: string = environment.appMain;
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  cdr = inject(ChangeDetectorRef);
  _menuList: any = [];
  idUserLogON: number = 0;
  hayTurnoActivo: boolean = false;
  hayCorteGeneralActivo: boolean = false;
  validacionesCompletas: boolean = false;

  // Productos
  productos: any[] = [];
  loadingProductos: boolean = false;
  totalProductos: number = 0;
  pagination: Pagination = {
    pageIndex: 0,
    pageSize: 12,
    search: '',
    length: 0,
    pageSizeOptions: [12, 24, 36, 48]
  };

  constructor(
    private servicesGServ: ServicesGService
    , private authServ: AuthService
    , private productosService: ProductosService
    , private cartService: CartService
    , private favoritesService: FavoritesService
  ) { }

  async ngOnInit() {
    // this.authServ.checkSession(); // Removed to allow guest access
    this.idUserLogON = this.authServ.getIdUserSession();

    // Marcar validaciones como completas para mostrar elementos UI
    this.validacionesCompletas = true;
    this.cdr.detectChanges();

    // Cargar productos
    this.loadProductos();
  }

  loadProductos(): void {
    this.loadingProductos = true;

    this.productosService.getProductsPag(this.pagination).subscribe({
      next: (response: any) => {
        if (response.status == 0) {
          this.productos = response.data.rows || [];
          this.totalProductos = response.data.count || 0;

          // Verify initial favorites state
          this.productos.forEach(p => {
            p.isFavorite = this.favoritesService.isFavorite(p.idProducto);
          });
        }
        this.loadingProductos = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.loadingProductos = false;
        this.servicesGServ.showAlert('E', 'Error', 'No se pudieron cargar los productos');
      }
    });

    // Subscribe to favorites changes to update UI real-time
    this.favoritesService.favorites$.subscribe(() => {
      if (this.productos.length > 0) {
        this.productos.forEach(p => {
          p.isFavorite = this.favoritesService.isFavorite(p.idProducto);
        });
        this.cdr.detectChanges();
      }
    });
  }


  onSearchProducts(searchTerm: string): void {
    this.pagination.search = searchTerm;
    this.pagination.pageIndex = 0;
    this.loadProductos();
  }

  verDetalleProducto(producto: any): void {
    const dialogRef = this.dialog.open(ProductDetailsComponent, {
      width: '100%',
      maxWidth: '100vw',
      panelClass: 'product-details-dialog-panel',
      position: { top: '0' },
      data: { producto }
    });
  }


  toggleFavorite(producto: any): void {
    const isAdded = this.favoritesService.toggleFavorite(producto);
    producto.isFavorite = isAdded;

    // Use non-blocking snackbar (no action, shorter duration)
    if (isAdded) {
      this.servicesGServ.showSnakbar('Agregado a favoritos', undefined, 2000);
    } else {
      this.servicesGServ.showSnakbar('Eliminado de favoritos', undefined, 2000);
    }
  }

  agregarAlCarrito(producto: any): void {
    // this.loadingProductos = false;

    this.cartService.addToCart(producto.idProducto, 1).subscribe({
      next: (response: any) => {
        if (response.status == 0) {
          // Changed from intrusive alert to subtle snackbar
          this.servicesGServ.showSnakbar('Producto agregado al carrito', 'Cerrar', 3000);
        }
        this.loadingProductos = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
        this.loadingProductos = false;
        this.servicesGServ.showAlert('E', 'Error', 'No se pudo agregar el producto al carrito');
      }
    });
  }


  changeRoute(route: string): void {
    // Rutas que requieren turno activo
    const rutasRestringidas = ['cajaPuntoVenta', 'ventaClientes', 'cobranzaCredito', 'corteIndividual'];

    // Verificar si la ruta requiere turno activo
    if (rutasRestringidas.includes(route)) {
      if (!this.hayTurnoActivo) {
        // Mostrar modal indicando que es necesario iniciar turno
        this.servicesGServ.showAlert(
          'W',
          'Turno Requerido',
          'Es necesario iniciar un turno para acceder a esta función.'
        );
        return; // No navegar
      }
    }

    // Verificar si la ruta requiere corte general activo
    if (route === 'corteGeneral') {
      if (!this.hayCorteGeneralActivo) {
        // Mostrar modal indicando que es necesario iniciar la jornada
        this.servicesGServ.showAlert(
          'W',
          'Jornada Requerida',
          'Es necesario iniciar la jornada para acceder a esta función.'
        );
        return; // No navegar
      }
    }

    // Navegar normalmente si no hay restricciones o si hay turno activo
    this.servicesGServ.changeRoute(`/${this._appMain}/${route}`);
  }

}
