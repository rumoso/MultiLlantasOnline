import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ]
})
export class SpinnerComponent implements OnInit {

  // VARIABLES PARA EL SPINNER
  diameter: number = 100;
  strokeWidth : number = 10;
  bProgressSpinner: boolean = true;
  color: string = "success";
  //-------------------------------

  constructor() { }

  ngOnInit(): void {
  }

}
