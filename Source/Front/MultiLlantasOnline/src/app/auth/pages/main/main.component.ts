import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SharedModule } from '../../../shared/Shared.module';
import { MaterialModule } from '../../../shared/material.module';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  imports: [
    SharedModule,
    MaterialModule,
  ]
})
export default class MainComponent {

  public _IconApp: string = environment.iconApp;

  constructor( private router: Router ) { }

  ngOnInit(): void {
    this.router.navigate( ['./auth/login'] )
  }

  logout() {
    localStorage.setItem('token', '')
    localStorage.setItem('user', '')
    localStorage.setItem('idUser', '')
    localStorage.setItem('config', '')
    this.router.navigate( ['./auth'] );
  }

}
