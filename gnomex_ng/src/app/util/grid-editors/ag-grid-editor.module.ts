import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from "@angular/forms";

import { AngularMaterialModule } from "../../../modules/angular-material.module";
import { DateEditor } from './date.editor'
import { SelectEditor } from './select.editor';
import {BarcodeSelectEditor} from "./barcode-select.editor";


@NgModule({
    imports: [
			  AngularMaterialModule,
        CommonModule,
			  FormsModule
    ],

    declarations: [
        DateEditor,
        SelectEditor,
        BarcodeSelectEditor
    ],
    exports: [
        DateEditor,
        SelectEditor,
        BarcodeSelectEditor
    ]
})
export class AgGridEditorModule { }