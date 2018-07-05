import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from "@angular/forms";

import { AgGridModule } from "ag-grid-angular";
import { AngularMaterialModule } from "../../../modules/angular-material.module";

import { BarcodeSelectEditor } from "./barcode-select.editor";
import { DateEditor } from './date.editor'
import { FillLikeEditor } from "./filllike-select.editor";
import { MultipleSelectDialogComponent } from "./popups/multiple-select-dialog.component";
import { SelectEditor } from './select.editor';
import { SeqlaneSelectEditor } from "./seqlane-select.editor";
import { TextSelectXorMultiselectEditor } from "./text-select-xor-multiselect.editor";
import { TextAlignLeftMiddleEditor } from "./text-align-left-middle.editor";
import {TextAlignRightMiddleEditor} from "./text-align-right-middle.editor";


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
        FillLikeEditor,
        MultipleSelectDialogComponent,
        SelectEditor,
        SeqlaneSelectEditor,
        TextAlignLeftMiddleEditor,
        TextAlignRightMiddleEditor,
        TextSelectXorMultiselectEditor
    ],
    entryComponents: [
        MultipleSelectDialogComponent,
    ],
    exports: [
        BarcodeSelectEditor,
        DateEditor,
        FillLikeEditor,
        MultipleSelectDialogComponent,
        SelectEditor,
        TextAlignLeftMiddleEditor,
        TextAlignRightMiddleEditor,
        TextSelectXorMultiselectEditor
    ]
})
export class AgGridEditorModule { }