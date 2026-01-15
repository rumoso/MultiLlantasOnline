import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { SharedModule } from '../../shared/Shared.module';
import { MaterialModule } from '../../shared/material.module';
import { Estados } from '../../interfaces/addresses/estados';
import { Municipios } from '../../interfaces/addresses/municipios';
import { Ciudades } from '../../interfaces/addresses/ciudades';
import { Colonias } from '../../interfaces/addresses/colonias';
import { AddressService } from '../../protected/services/address.service';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-address',
  imports: [
    SharedModule,
    MaterialModule,
  ],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressComponent implements OnInit {


    @Input() inColonia!: number;
    @Output() outEstado = new EventEmitter<Estados>();
    @Output() outMunicipio = new EventEmitter<Municipios>();
    @Output() outCiudad = new EventEmitter<Ciudades>();
    @Output() outColonia = new EventEmitter<Colonias>();
    @Output() outIsValid = new EventEmitter<boolean>();

    estado: Estados={} as Estados ;
    municipio: Municipios = {} as Municipios;
    ciudad: Ciudades={} as Ciudades;
    colonia: Colonias={} as Colonias;

    // Form controls para los autocomplete
    estadoControl = new FormControl<Estados | string>('');
    municipioControl = new FormControl<Municipios | string>('');
    ciudadControl = new FormControl<Ciudades | string>('');
    coloniaControl = new FormControl<Colonias | string>('');
    codigoPostal: string = '';
    // estadoReadOnly:boolean = true;
    municipioReadOnly:boolean = true;
    ciudadReadOnly:boolean = true;
    coloniaReadOnly:boolean = true;

    // Arrays para los resultados
    cbxEstados: Estados[] = [];
    cbxMunicipios: Municipios[] = [];
    cbxCiudades: Ciudades[] = [];
    cbxColonias: Colonias[] = [];

    // Variable de validación
    isAddressValid: boolean = false;

    constructor(private addressService: AddressService,
                private cdref:ChangeDetectorRef,) {}

    ngOnInit() {

        this.coloniaControl.valueChanges.pipe(
          tap(value => {
              // Si el valor es string, actualizamos solo el nombre
              if (typeof value === 'string') {
                  const codigoestado = this.estado.codigoestado && this.estado.codigoestado !==""
                                        ? this.estado.codigoestado:'';
                  const codigomunicipio = this.municipio.codigomunicipio && this.municipio.codigomunicipio !== ""
                                          ? this.municipio.codigomunicipio : '';
                  const codigociudad = this.ciudad.codigociudad && this.ciudad.codigociudad !== ""
                                      ? this.ciudad.codigociudad : '';
                  this.colonia = {
                      codigocolonia: 0,
                      codigociudad,
                      codigoestado,
                      nombre: value,
                      codigomunicipio,
                      codigopostal: ''
                  };
                  this.codigoPostal = this.colonia.codigopostal;
                //  this.codigoPostal = '';
                } else if (value) {
                    // Si es un objeto Colonias, lo asignamos directamente
                    this.colonia = value;
                    this.codigoPostal = this.colonia.codigopostal;
                    if(this.colonia.codigociudad && this.colonia.codigociudad !== ""){
                      this.ciudad.codigociudad = this.colonia.codigociudad;
                      this.ciudad.codigomunicipio = this.colonia.codigomunicipio;
                      this.ciudad.codigoestado = this.colonia.codigoestado;
                    }
                }
                this.validateAddress();
            })
          ).subscribe();

          this.ciudadControl.valueChanges.pipe(
            tap(value => {
              if (!value) {
                this.ciudad = {} as Ciudades;
            }else
                // Si el valor es string, actualizamos solo el nombre
                if (typeof value === 'string') {
                    this.ciudad = {
                      idciudades: 0,
                      codigociudad:'',
                      nombre: value,
                      codigoestado:'',
                      codigomunicipio: '',
                    };
                  } else if (value) {
                      this.ciudad = value;
                  }
                  this.validateAddress();
              })
            ).subscribe();
          this.municipioControl.valueChanges.pipe(
            tap(value => {
                // Si el valor es string, actualizamos solo el nombre
                if (typeof value === 'string') {
                    const codigoestado = this.estado.codigoestado && this.estado.codigoestado !==""
                                          ? this.estado.codigoestado:'';

                    this.municipio = {
                        idmunicipios:0,
                        codigoestado,
                        nombre: value,
                        codigomunicipio: ''
                    };
                  } else if (value) {
                      this.municipio = value;
                  }
                  this.validateAddress();
              })
            ).subscribe();

            this.estadoControl.valueChanges.pipe(
              tap(value => {
                  // Si el valor es string, actualizamos solo el nombre
                  if (typeof value === 'string') {
                      this.estado = {
                          codigoestado:'',
                          nombre: value,
                      };
                    } else if (value) {
                        this.estado = value;
                    }
                    this.validateAddress();
                })
              ).subscribe();

        // Configurar los observables de búsqueda para cada campo
        this.estadoControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(value => typeof value === 'string'),
            switchMap(value => this.addressService.GetEstados(value || '', this.estado))
        ).subscribe(response => {
            this.cbxEstados = response.data.rows;
            this.municipio = {} as Municipios;
            this.municipioControl.setValue(this.municipio);
            this.ciudad = {} as Ciudades;
            this.ciudadControl.setValue(this.ciudad);
            this.colonia = {} as Colonias;
            this.coloniaControl.setValue(this.colonia);
            this.municipioReadOnly = this.ciudadReadOnly = this.coloniaReadOnly = true;
            this.cdref.detectChanges();
        });

        this.municipioControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(value => typeof value === 'string'),
            switchMap(value => this.addressService.GetMunicipios(value || '' , this.municipio))
        ).subscribe(response => {
            this.cbxMunicipios = response.data.rows;
            this.Municipios();
            this.ciudad = {} as Ciudades;
            this.ciudadControl.setValue(this.ciudad);
            this.colonia = {} as Colonias;
            this.coloniaControl.setValue(this.colonia);
            this.cdref.detectChanges();
        });

        this.ciudadControl.valueChanges.pipe(
            debounceTime(300),
            tap( value => {
              if(this.municipio && this.municipio.codigoestado !== ""){
                this.ciudad.codigomunicipio = this.municipio.codigomunicipio;
                this.ciudad.codigoestado = this.municipio.codigoestado;
              }
            }),
            distinctUntilChanged(),
            filter(value => typeof value === 'string'),
            switchMap(value => this.addressService.GetCiudades(value || '', this.ciudad))
        ).subscribe(response => {
            this.cbxCiudades = response.data.rows;
            this.colonia = {} as Colonias;
            this.coloniaControl.setValue(this.colonia);
            this.cdref.detectChanges();
        });


        this.coloniaControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap( value =>{
              if(this.codigoPostal !== ""){
                this.colonia.codigopostal = this.codigoPostal;
              }
            }),
            filter(value => typeof value === 'string'),
            switchMap(value => this.addressService.GetColonias(value || '', this.colonia))
        ).subscribe(response => {
            this.cbxColonias = response.data.rows;

            this.Colonias();

            this.cdref.detectChanges();
        });

    }


    ngAfterViewInit() {
      if (this.inColonia) {
          // Consultar la colonia por su código
          this.addressService.GetColoniaById(this.inColonia).subscribe(response => {
              if (response.data) {
                  // Asignar la colonia encontrada
                  this.colonia = response.data;
                  this.codigoPostal = this.colonia.codigopostal;

                  // Asignar valores a los objetos
                  this.estado.codigoestado = this.colonia.codigoestado;
                  this.municipio.codigomunicipio = this.colonia.codigomunicipio;
                  this.municipio.codigoestado = this.colonia.codigoestado;


                  // Actualizar los FormControls
                  this.coloniaControl.setValue(this.colonia);

                  // Cargar datos relacionados
                  this.onFocusEstado();
                  this.onFocusMunicipio();
                  if(this.colonia.codigociudad && this.colonia.codigociudad !== ""){
                    this.ciudad.codigociudad = this.colonia.codigociudad;
                    this.ciudad.codigomunicipio = this.municipio.codigomunicipio;
                    this.ciudad.codigoestado = this.municipio.codigoestado;
                    this.onFocusCiudad();
                  }


                  // Emitir la colonia seleccionada
                  this.emitColonia(this.colonia);
                  this.coloniaReadOnly = this.ciudadReadOnly = this.municipioReadOnly = false;
                  // Forzar la detección de cambios
                  this.cdref.detectChanges();
              }
          });
      }
  }


    emitEstado( event: Estados ) {
        this.estado.codigoestado = event.codigoestado;
        this.estado.nombre = event.nombre;
        this.municipioReadOnly = false;
        this.outEstado.emit( this.estado );
    }


     displayFnEstado(estado:Estados){
        return estado && estado.nombre ? estado.nombre:'';
      }

    emitMunicipio( event: Municipios ) {
        this.municipio.idmunicipios = event.idmunicipios;
        this.municipio.codigomunicipio = event.codigomunicipio;
        this.municipio.codigoestado = event.codigoestado;
        this.municipio.nombre = event.nombre;
        this.coloniaReadOnly = false;
        this.ciudadReadOnly = false;
        this.outMunicipio.emit( this.municipio );
    }

    emitCiudad( event: Ciudades ) {
        this.ciudad.idciudades = event.idciudades;
        this.ciudad.codigociudad = event.codigociudad;
        this.ciudad.codigomunicipio = event.codigomunicipio;
        this.ciudad.codigoestado = event.codigoestado;
        this.ciudad.nombre = event.nombre;
        this.outCiudad.emit( this.ciudad );
    }

    // Función para emitir la colonia seleccionada
    emitColonia( event: Colonias ) {
        this.colonia.codigocolonia = event.codigocolonia;
        this.colonia.codigociudad = event.codigociudad;
        this.colonia.codigoestado = event.codigoestado;
        this.colonia.nombre = event.nombre;
        this.colonia.codigomunicipio = event.codigomunicipio;
        this.colonia.codigopostal = event.codigopostal;
        this.outColonia.emit( this.colonia );
    }

    // Funciones display para los autocomplete
    displayFnMunicipio(municipio: Municipios) {
        return municipio && municipio.nombre ? municipio.nombre : '';
    }

    displayFnCiudad(ciudad: Ciudades) {
        return ciudad && ciudad.nombre ? ciudad.nombre : '';
    }

    displayFnColonia(colonia: Colonias) {
        return colonia && colonia.nombre ? colonia.nombre : '';
    }

    onFocusEstado() {
      // if (this.estado.codigoestado) {
          this.addressService.GetEstados('', this.estado).subscribe(response => {
              this.cbxEstados = response.data.rows;
              if (this.cbxEstados.length > 0) {
                if( this.cbxEstados.length === 1 ){
                  this.estado = this.cbxEstados[0];
                }
                const estadoEncontrado = this.cbxEstados.find(e => e.codigoestado === this.estado.codigoestado);
                if (estadoEncontrado) {
                    this.estadoControl.setValue(estadoEncontrado);
                }

              }
              this.cdref.detectChanges();
          });
      // }
  }

  onFocusMunicipio() {
      // if (this.municipio.codigomunicipio) {
      this.municipio.codigoestado = this.estado.codigoestado;
          this.addressService.GetMunicipios('', this.municipio).subscribe(response => {
              this.cbxMunicipios = response.data.rows;
              if (this.cbxMunicipios.length > 0) {
                  const municipioEncontrado = this.cbxMunicipios.find(m => m.codigomunicipio === this.municipio.codigomunicipio);
                  if (municipioEncontrado) {
                      this.municipioControl.setValue(municipioEncontrado);
                  }
              }
              this.cdref.detectChanges();
          });
      // }
  }

  onFocusCiudad() {
      // if (this.ciudad.codigociudad) {
      this.ciudad.codigoestado = this.municipio.codigoestado;
      this.ciudad.codigomunicipio = this.municipio.codigomunicipio;
          this.addressService.GetCiudades('', this.ciudad).subscribe(response => {
              this.cbxCiudades = response.data.rows;
              if (this.cbxCiudades.length > 0) {
                if(this.cbxCiudades.length === 1){
                  this.ciudad.codigociudad = this.cbxCiudades[0].codigociudad;
                  this.ciudad.codigoestado = this.cbxCiudades[0].codigoestado;
                  this.ciudad.codigomunicipio = this.cbxCiudades[0].codigomunicipio;
                }
                const ciudadEncontrada = this.cbxCiudades.find(c => c.codigociudad === this.ciudad.codigociudad);
                if (ciudadEncontrada) {
                    this.ciudadControl.setValue(ciudadEncontrada);
                }
              }
              this.cdref.detectChanges();
          });
      // }
  }

    onFocusColonia() {
        //this.colonia = {} as Colonias;
        if(this.estado && this.estado.codigoestado !==""){
          this.colonia.codigoestado = this.estado.codigoestado;
        }
        if(this.municipio.codigomunicipio && this.municipio.codigomunicipio !==""){
          this.colonia.codigomunicipio = this.municipio.codigomunicipio;
        }
        // if(this.ciudad && this.ciudad.codigociudad !==""){
        //   this.colonia.codigociudad = this.ciudad.codigociudad;
        // }

        if(this.codigoPostal !== ""){
          this.colonia.codigopostal = this.codigoPostal;
        }
        this.addressService.GetColonias('', this.colonia ).subscribe(response => {
            this.cbxColonias = response.data.rows;
            this.Colonias();
            this.cdref.detectChanges();
        });
    }

      onCodigoPostalEnter(event: any) {
        const cp = event.target.value;
        if (cp) {
            this.addressService.GetCodigoPostal(cp).subscribe(response => {
                if (response.data && response.data.length > 0) {
                    this.cbxColonias = response.data;
                    this.estado.codigoestado = this.cbxColonias[0].codigoestado;
                    this.municipio.codigoestado= this.cbxColonias[0].codigoestado;
                    this.municipio.codigoestado= this.cbxColonias[0].codigoestado;
                   // this.colonia.codigopostal = this.codigoPostal;
                    this.Colonias();
                    this.municipioReadOnly = this.ciudadReadOnly = this.coloniaReadOnly = false;
                    this.cdref.detectChanges();
                }
            });
        }
    }

    Estados(){
      if(this.cbxEstados.length === 1){
        this.estado = this.cbxEstados[0];
        this.emitEstado( this.cbxEstados[0]);
      }
    }
    Municipios(){
      if(this.cbxMunicipios.length === 1){
        this.municipio = this.cbxMunicipios[0];
        this.emitMunicipio( this.cbxMunicipios[0]);
        this.estado.codigoestado = this.municipio.codigoestado;
        if(this.colonia.codigociudad && this.colonia.codigociudad !==""){
          this.ciudad.codigoestado = this.municipio.codigoestado;
          this.ciudad.codigomunicipio = this.municipio.codigomunicipio;
          this.onFocusCiudad();
        }
        this.onFocusEstado();

    }
    }
    Colonias(){
       if (this.cbxColonias.length === 1 ) {
          this.colonia = this.cbxColonias[0];
          this.codigoPostal = this.colonia.codigopostal;
          this.coloniaControl.setValue(this.colonia);
          this.emitColonia(this.cbxColonias[0]);

       }
       const ciudades = this.cbxColonias.filter((colonia, index, self) => index === self.findIndex((c) => c.codigociudad === colonia.codigociudad)
      );
        if(ciudades.length === 1 && this.cbxColonias[0].codigociudad && this.cbxColonias[0].codigociudad !== "" ){
            this.ciudad.codigociudad = this.cbxColonias[0].codigociudad;
          }else{
            this.ciudad = {} as Ciudades;
          }

          this.municipio.codigomunicipio = this.cbxColonias[0].codigomunicipio;
          this.municipio.codigoestado = this.estado.codigoestado =  this.cbxColonias[0].codigoestado;

          if(this.ciudad.codigociudad){
            this.onFocusCiudad();
          }

          if(this.estado.codigoestado){
            this.onFocusEstado();
          }

          if(this.municipio.codigomunicipio){
            this.onFocusMunicipio();
          }

      //  else if(this.coloniaControl.value === ""){
      //   this.colonia = {} as Colonias;
      //   this.coloniaControl.setValue({} as Colonias);
      //  }
    }

    // Método de validación que verifica si todos los campos tienen datos
    validateAddress(): void {
        const isEstadoValid = this.estado && this.estado.codigoestado && this.estado.codigoestado !== '' && this.estado.nombre && this.estado.nombre !== '';
        const isMunicipioValid = this.municipio && this.municipio.codigomunicipio && this.municipio.codigomunicipio !== '' && this.municipio.nombre && this.municipio.nombre !== '';
        const isCiudadValid = this.ciudad && this.ciudad.nombre && this.ciudad.nombre !== '';
        const isColoniaValid = this.colonia && this.colonia.nombre && this.colonia.nombre !== '';
        const isCodigoPostalValid = this.codigoPostal && this.codigoPostal !== '';

        this.isAddressValid = !!(isEstadoValid && isMunicipioValid && isCiudadValid && isColoniaValid && isCodigoPostalValid);
        this.outIsValid.emit(this.isAddressValid);
    }
}
