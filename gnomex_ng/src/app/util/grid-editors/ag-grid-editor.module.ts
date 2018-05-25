import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from "@angular/forms";

import { AgGridModule } from "ag-grid-angular";
import { AngularMaterialModule } from "../../../modules/angular-material.module";

import { BarcodeSelectEditor } from "./barcode-select.editor";
import { DateEditor } from './date.editor'
import { MultipleSelectDialogComponent } from "./popups/multiple-select-dialog.component";
import { SelectEditor } from './select.editor';
import { TextSelectXorMultiselectEditor } from "./text-select-xor-multiselect.editor";

@NgModule({
    imports: [
        AgGridModule.withComponents([
            DateEditor,
            SelectEditor,
        ]),
        AngularMaterialModule,
        CommonModule,
        FormsModule
    ],
    declarations: [
        BarcodeSelectEditor,
        DateEditor,
        MultipleSelectDialogComponent,
        SelectEditor,
        TextSelectXorMultiselectEditor
    ],
    entryComponents: [
        MultipleSelectDialogComponent,
    ],
    exports: [
        BarcodeSelectEditor,
        DateEditor,
        MultipleSelectDialogComponent,
        SelectEditor,
        TextSelectXorMultiselectEditor
    ]
})
export class AgGridEditorModule { }