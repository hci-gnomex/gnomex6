import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AngularMaterialModule } from '../../../modules/angular-material.module'
import {SelectEditorComponent} from './index'




@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AngularMaterialModule
    ],

    declarations: [
        SelectEditorComponent
    ],
    providers: [
    ],
    exports: [SelectEditorComponent]
})
export class AgGridEditorModule { }