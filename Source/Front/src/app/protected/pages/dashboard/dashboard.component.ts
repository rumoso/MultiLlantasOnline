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
import { SearchService } from '../../services/search.service';
import { skip } from 'rxjs';
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

  // Filtros del catalogo
  // El SP getProductsPag ya busca dentro de un texto que concatena
  // nombre/marca/modelo/descripcion/ancho/perfil/rin, asi que tanto el
  // buscador por medida como el filtro por marca se resuelven armando un
  // termino de busqueda y reutilizando el mismo endpoint (sin backend extra).
  medidas: { anchos: any[]; perfiles: any[]; rines: any[] } = { anchos: [], perfiles: [], rines: [] };
  marcas: string[] = [];
  filtroAncho: string | null = null;
  filtroPerfil: string | null = null;
  filtroRin: string | null = null;
  filtroMarca: string | null = null;
  textoBusqueda: string = '';   // termino que llega del buscador del header

  constructor(
    private servicesGServ: ServicesGService
    , private authServ: AuthService
    , private productosService: ProductosService
    , private cartService: CartService
    , private favoritesService: FavoritesService
    , private searchService: SearchService
  ) { }

  async ngOnInit() {
    // this.authServ.checkSession(); // Removed to allow guest access
    this.idUserLogON = this.authServ.getIdUserSession();

    // Marcar validaciones como completas para mostrar elementos UI
    this.validacionesCompletas = true;
    this.cdr.detectChanges();

    // Cargar catalogo + opciones de filtros
    this.loadProductos();
    this.loadMedidas();
    this.loadMarcas();

    // Reaccionar a búsquedas emitidas desde el buscador del header (skip(1)
    // para no repetir la carga inicial con el valor por defecto del BehaviorSubject)
    this.searchService.search$.pipe(skip(1)).subscribe(term => {
      this.textoBusqueda = term || '';
      this.aplicarFiltros();
    });
  }

  loadMedidas(): void {
    this.productosService.getMedidas().subscribe({
      next: (resp: any) => {
        if (resp?.ok && resp.data) {
          this.medidas = {
            anchos: resp.data.anchos || [],
            perfiles: resp.data.perfiles || [],
            rines: resp.data.rines || []
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error al cargar medidas:', err)
    });
  }

  loadMarcas(): void {
    this.productosService.getMarcas().subscribe({
      next: (resp: any) => {
        if (resp?.ok && resp.data) {
          this.marcas = resp.data.map((m: any) => m.marca).filter((m: any) => !!m);
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error al cargar marcas:', err)
    });
  }

  /**
   * Arma el termino de busqueda combinando texto libre + medida + marca.
   * Cada token calza contra el texto concatenado que arma el SP.
   */
  private construirBusqueda(): string {
    const tokens: string[] = [];
    if (this.textoBusqueda && this.textoBusqueda.trim()) {
      tokens.push(this.textoBusqueda.trim());
    }
    if (this.filtroAncho && this.filtroPerfil) {
      tokens.push(`${this.filtroAncho}/${this.filtroPerfil}`);
    } else {
      if (this.filtroAncho) tokens.push(this.filtroAncho);
      if (this.filtroPerfil) tokens.push(this.filtroPerfil);
    }
    if (this.filtroRin) tokens.push(`R${this.filtroRin}`);
    if (this.filtroMarca) tokens.push(this.filtroMarca);
    return tokens.join(' ');
  }

  aplicarFiltros(): void {
    this.pagination.search = this.construirBusqueda();
    this.pagination.pageIndex = 0;
    this.loadProductos();
  }

  seleccionarMarca(marca: string): void {
    this.filtroMarca = this.filtroMarca === marca ? null : marca;
    this.aplicarFiltros();
  }

  get hayFiltrosActivos(): boolean {
    return !!(this.filtroAncho || this.filtroPerfil || this.filtroRin || this.filtroMarca);
  }

  limpiarFiltros(): void {
    this.filtroAncho = null;
    this.filtroPerfil = null;
    this.filtroRin = null;
    this.filtroMarca = null;
    this.aplicarFiltros();
  }

  onPageChange(event: any): void {
    this.pagination.pageIndex = event.pageIndex;
    this.pagination.pageSize = event.pageSize;
    this.loadProductos();
    // Al cambiar de pagina, subir al inicio del catalogo
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            p.isFavorite = this.favoritesService.isFavorite(p.sIdP);
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
          p.isFavorite = this.favoritesService.isFavorite(p.sIdP);
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

    this.cartService.addToCart(producto.sIdP, 1).subscribe({
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
