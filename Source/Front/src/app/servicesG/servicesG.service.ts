import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Overlay } from '@angular/cdk/overlay';
import { DDialog } from '../interfaces/general.interfaces';
import { AlertComponent } from '../components/alert/alert.component';
import { ConfirmComponent } from '../components/confirm/confirm.component';

@Injectable({
  providedIn: 'root'
})
export class ServicesGService {

  constructor(
    private _snackBar: MatSnackBar
    , private router: Router
    , public dialog: MatDialog
    , private overlay: Overlay
  ) { }

  _dDialog: DDialog = {
    header: '',
    message: '',
    question: '',
    buttonYes: '',
    buttonNo: ''
  }

  showSnakbar(text: string, action: string | undefined = 'Close', duration: number = 2500): void {
    this._snackBar.open(text, action, {
      duration: duration
    })
  }

  changeRoute(route: string): void {
    this.router.navigate([route]);
  }

  changeRouteWithParameter(route: string, parameter: number): void {
    this.router.navigate([route, parameter]);
  }

  disableEnableButton(idHtml: string, bDisable: boolean): void {
    const myButton = document.getElementById(idHtml) as HTMLButtonElement | null;
    if (myButton) {
      myButton.disabled = bDisable;
    }
  }

  showDialog(header: string, message: string, question: string, buttonYes: string, buttonNo: string, sWidth: string = '500px') {

    this._dDialog.header = header;
    this._dDialog.message = message;
    this._dDialog.question = question;
    this._dDialog.buttonYes = buttonYes;
    this._dDialog.buttonNo = buttonNo;

    const dialog = this.dialog.open(ConfirmComponent, {
      width: sWidth,
      data: this._dDialog
    })

    return dialog;
  }

  showModalWithParams(component: any, params: any, width: string) {
    const scrollStrategy = this.overlay.scrollStrategies.reposition();
    const dialog = this.dialog.open(component, {
      width: width,
      data: params,
      autoFocus: false,
      maxHeight: '100vh', //you can adjust the value as per your view
      maxWidth: '190vh'
    })

    return dialog;
  }

  showModalWithParamsFullScrean(component: any, params: any, config = {}) {
    const scrollStrategy = this.overlay.scrollStrategies.reposition();
    const dialog = this.dialog.open(component, {
      data: params,
      ...config
    })

    return dialog;
  }

  showMDL(header: string, message: string, question: string, buttonYes: string, buttonNo: string) {

    this._dDialog.header = header;
    this._dDialog.message = message;
    this._dDialog.question = question;
    this._dDialog.buttonYes = buttonYes;
    this._dDialog.buttonNo = buttonNo;

    const dialog = this.dialog.open(ConfirmComponent, {
      width: '250px',
      data: this._dDialog
    })

    return dialog;
  }

  private lastAlertMessage: string = '';

  showAlert(type: string, header: string, message: string, showNavBar: boolean = false) {
    // Solo muestra el alert si el mensaje es diferente al último mostrado
    if (message === this.lastAlertMessage) {
      return null;
    }
    this.lastAlertMessage = message;

    let paramsAlert: any = {
      type: type,
      header: header,
      message: message
    };

    const dialog = this.dialog.open(AlertComponent, {
      width: 'auto',
      data: paramsAlert
    });

    dialog.afterClosed().subscribe(() => {
      this.lastAlertMessage = '';
    });

    return dialog;
  }

  showAlertIA(resp: any, bShowTrue: boolean = true) {

    var type = resp.status == 0 ? 'S' : 'W';
    var header = resp.status == 0 ? 'OK!' : 'Alerta!';
    var message = resp.message;

    let paramsAlert: any = {
      type: type,
      header: header,
      message: message
    }

    if (resp.status != 0 || bShowTrue) {
      const dialog = this.dialog.open(AlertComponent, {
        width: 'auto',
        data: paramsAlert
      })

      return dialog;
    }
    else {
      return false;
    }

  }

  public nextInputFocus(idInput: any, milliseconds: number) {
    setTimeout(() => {
      idInput.nativeElement.focus();
    }, milliseconds);
  }

}
