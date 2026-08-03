import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/Shared.module';
import { MaterialModule } from '../../../shared/material.module';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ServicesGService } from '../../../servicesG/servicesG.service';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [SharedModule, MaterialModule],
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.css']
})
export default class PerfilComponent implements OnInit {

    private accountService = inject(AccountService);
    private authService = inject(AuthService);
    private servicesGServ = inject(ServicesGService);

    loading: boolean = true;
    bGuardandoDatos: boolean = false;

    myAccount: any = { name: '', userName: '', email: '', telefono: '' };

    addresses: any[] = [];
    loadingAddresses: boolean = true;
    showAddressForm: boolean = false;
    editingAddressId: number | null = null;
    addressForm: any = this.addressFormVacio();

    hidePwdActual: boolean = true;
    hidePwdNueva: boolean = true;
    hidePwdNueva2: boolean = true;
    myPasswords: any = { pwdActual: '', pwdNueva: '', pwdNueva2: '' };
    bGuardandoPassword: boolean = false;

    ngOnInit(): void {
        if (this.authService.getIdUserSession() === 0) {
            this.servicesGServ.changeRoute('/auth/login');
            return;
        }
        this.cargarCuenta();
        this.cargarDirecciones();
    }

    cargarCuenta() {
        this.loading = true;
        this.accountService.getMyAccount().subscribe({
            next: (resp) => {
                if (resp.status === 0) {
                    this.myAccount = resp.data;
                } else {
                    this.servicesGServ.showSnakbar(resp.message);
                }
                this.loading = false;
            },
            error: () => {
                this.servicesGServ.showSnakbar('Error al cargar tu cuenta');
                this.loading = false;
            }
        });
    }

    guardarDatosPersonales() {
        if (!this.myAccount.name) {
            return;
        }
        this.bGuardandoDatos = true;
        this.accountService.updateMyAccount({
            name: this.myAccount.name,
            email: this.myAccount.email,
            telefono: this.myAccount.telefono
        }).subscribe({
            next: (resp) => {
                this.bGuardandoDatos = false;
                this.servicesGServ.showSnakbar(
                    resp.status === 0 ? 'Datos actualizados correctamente' : resp.message
                );
            },
            error: () => {
                this.bGuardandoDatos = false;
                this.servicesGServ.showSnakbar('Error al actualizar tus datos');
            }
        });
    }

    cargarDirecciones() {
        this.loadingAddresses = true;
        this.accountService.getMyAddresses().subscribe({
            next: (resp) => {
                if (resp.status === 0) {
                    this.addresses = resp.data;
                }
                this.loadingAddresses = false;
            },
            error: () => {
                this.loadingAddresses = false;
            }
        });
    }

    addressFormVacio() {
        return {
            codigoPostal: '', calle: '', numExt: '', numInt: '', entreCalles: '',
            colonia: '', ciudad: '', municipio: '', estado: '', bPrincipal: false
        };
    }

    abrirNuevaDireccion() {
        this.editingAddressId = null;
        this.addressForm = this.addressFormVacio();
        this.showAddressForm = true;
    }

    editarDireccion(dir: any) {
        this.editingAddressId = dir.idAddress;
        this.addressForm = { ...dir, bPrincipal: !!dir.bPrincipal };
        this.showAddressForm = true;
    }

    cancelarFormularioDireccion() {
        this.showAddressForm = false;
        this.editingAddressId = null;
    }

    get direccionFormValida(): boolean {
        return !!this.addressForm.codigoPostal
            && !!this.addressForm.calle
            && !!this.addressForm.colonia
            && !!this.addressForm.ciudad
            && !!this.addressForm.municipio
            && !!this.addressForm.estado;
    }

    guardarDireccion() {
        if (!this.direccionFormValida) {
            return;
        }

        const payload = { ...this.addressForm };
        const obs = this.editingAddressId
            ? this.accountService.updateAddress({ ...payload, idAddress: this.editingAddressId })
            : this.accountService.addAddress(payload);

        obs.subscribe({
            next: (resp) => {
                if (resp.status === 0) {
                    this.servicesGServ.showSnakbar(this.editingAddressId ? 'Dirección actualizada' : 'Dirección agregada');
                    this.cancelarFormularioDireccion();
                    this.cargarDirecciones();
                } else {
                    this.servicesGServ.showSnakbar(resp.message);
                }
            },
            error: () => this.servicesGServ.showSnakbar('Error al guardar la dirección')
        });
    }

    eliminarDireccion(dir: any) {
        this.accountService.deleteAddress(dir.idAddress).subscribe({
            next: (resp) => {
                if (resp.status === 0) {
                    this.servicesGServ.showSnakbar('Dirección eliminada');
                    this.cargarDirecciones();
                } else {
                    this.servicesGServ.showSnakbar(resp.message);
                }
            },
            error: () => this.servicesGServ.showSnakbar('Error al eliminar la dirección')
        });
    }

    marcarPrincipal(dir: any) {
        this.accountService.setAddressPrincipal(dir.idAddress).subscribe({
            next: (resp) => {
                if (resp.status === 0) {
                    this.cargarDirecciones();
                } else {
                    this.servicesGServ.showSnakbar(resp.message);
                }
            },
            error: () => this.servicesGServ.showSnakbar('Error al marcar como principal')
        });
    }

    get passwordsNuevasCoinciden(): boolean {
        return this.myPasswords.pwdNueva.length > 0
            && this.myPasswords.pwdNueva === this.myPasswords.pwdNueva2;
    }

    get passwordFormValido(): boolean {
        return this.myPasswords.pwdActual.length > 0
            && this.myPasswords.pwdNueva.length >= 6
            && this.passwordsNuevasCoinciden;
    }

    cambiarPassword() {
        if (!this.passwordFormValido) {
            return;
        }
        this.bGuardandoPassword = true;
        this.accountService.changePassword(this.myPasswords).subscribe({
            next: (resp) => {
                this.bGuardandoPassword = false;
                this.servicesGServ.showSnakbar(resp.message);
                if (resp.status === 0) {
                    this.myPasswords = { pwdActual: '', pwdNueva: '', pwdNueva2: '' };
                }
            },
            error: () => {
                this.bGuardandoPassword = false;
                this.servicesGServ.showSnakbar('Error al cambiar la contraseña');
            }
        });
    }
}
