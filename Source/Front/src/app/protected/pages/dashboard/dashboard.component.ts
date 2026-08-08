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

  // Filtros del catalogo — MULTISELECCION.
  // El endpoint getProductsFiltered recibe arreglos y arma `col IN (...)` por
  // dimension: OR dentro de cada grupo, AND entre grupos.
  medidas: { anchos: any[]; perfiles: any[]; rines: any[] } = { anchos: [], perfiles: [], rines: [] };
  marcas: string[] = [];
  filtroAnchos: string[] = [];
  filtroPerfiles: string[] = [];
  filtroRines: string[] = [];
  filtroMarcas: string[] = [];
  textoBusqueda: string = '';   // termino que llega del buscador del header

  // Mini-buscador encima de cada grupo de tags (filtra las opciones visibles)
  textoFiltroAncho: string = '';
  textoFiltroPerfil: string = '';
  textoFiltroRin: string = '';
  mostrarFiltrosMobile: boolean = false;   // panel de filtros en mobile

  // Cada grupo muestra pocas opciones y un "ver mas" para desplegar el resto
  limiteTags: number = 4;
  expandidoAncho: boolean = false;
  expandidoPerfil: boolean = false;
  expandidoRin: boolean = false;

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

  aplicarFiltros(): void {
    this.pagination.search = (this.textoBusqueda || '').trim();
    this.pagination.pageIndex = 0;
    this.loadProductos();
  }

  /** Agrega o quita un valor del arreglo (multiseleccion) y recarga. */
  private toggleEn(arr: string[], v: string): void {
    const i = arr.indexOf(v);
    if (i >= 0) arr.splice(i, 1); else arr.push(v);
    this.aplicarFiltros();
  }

  toggleAncho(v: string): void { this.toggleEn(this.filtroAnchos, v); }
  togglePerfil(v: string): void { this.toggleEn(this.filtroPerfiles, v); }
  toggleRin(v: string): void { this.toggleEn(this.filtroRines, v); }
  seleccionarMarca(marca: string): void { this.toggleEn(this.filtroMarcas, marca); }

  // Filtra las opciones de un grupo segun el texto de su mini-buscador
  private filtrarOpciones(lista: any[], texto: string): any[] {
    const t = (texto || '').trim().toLowerCase();
    if (!t) return lista;
    return lista.filter(x => String(x).toLowerCase().includes(t));
  }

  get anchosFiltrados(): any[] { return this.filtrarOpciones(this.medidas.anchos, this.textoFiltroAncho); }
  get perfilesFiltrados(): any[] { return this.filtrarOpciones(this.medidas.perfiles, this.textoFiltroPerfil); }
  get rinesFiltrados(): any[] { return this.filtrarOpciones(this.medidas.rines, this.textoFiltroRin); }

  get hayFiltrosActivos(): boolean {
    return this.filtroAnchos.length > 0 || this.filtroPerfiles.length > 0
      || this.filtroRines.length > 0 || this.filtroMarcas.length > 0;
  }

  limpiarFiltros(): void {
    this.filtroAnchos = [];
    this.filtroPerfiles = [];
    this.filtroRines = [];
    this.filtroMarcas = [];
    this.textoFiltroAncho = '';
    this.textoFiltroPerfil = '';
    this.textoFiltroRin = '';
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

    this.productosService.getProductsFiltered(this.pagination, {
      marcas: this.filtroMarcas,
      anchos: this.filtroAnchos,
      perfiles: this.filtroPerfiles,
      rines: this.filtroRines
    }).subscribe({
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
