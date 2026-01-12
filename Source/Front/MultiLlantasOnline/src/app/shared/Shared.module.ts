import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { NGX_MASK_CONFIG, provideNgxMask, NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@NgModule({
    imports:[

        SpinnerComponent
        , PaginationComponent

    ],
    exports: [
        CommonModule
        , FormsModule
        , RouterModule
        , ReactiveFormsModule

        , SpinnerComponent
        , PaginationComponent

    ],
})
export class SharedModule {}
