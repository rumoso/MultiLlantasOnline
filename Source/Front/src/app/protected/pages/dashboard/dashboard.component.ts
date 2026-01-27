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
  }


  onSearchProducts(searchTerm: string): void {
    this.pagination.search = searchTerm;
    this.pagination.pageIndex = 0;
    this.loadProductos();
  }

  verDetalleProducto(producto: any): void {
    console.log('Ver detalle producto:', producto);
    // Aquí puedes implementar la navegación a detalle del producto
  }

  agregarAlCarrito(producto: any): void {
    // this.loadingProductos = false;

    this.cartService.addToCart(producto.idProducto, 1).subscribe({
      next: (response: any) => {
        if (response.status == 0) {
          this.servicesGServ.showAlert('S', 'Éxito', 'Producto agregado al carrito');
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
