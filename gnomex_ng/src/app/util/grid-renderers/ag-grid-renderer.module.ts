import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AngularMaterialModule } from '../../../modules/angular-material.module'
import {IconTextRendererComponent} from "./index"





@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],

    declarations: [
        IconTextRendererComponent
    ],
    providers: [
    ],
    exports: [IconTextRendererComponent]
})
export class AgGridRendererModule { }