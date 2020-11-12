import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

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
import {MultiSelectEditor} from "./multi-select.editor";
import {NumericEditor} from "./numeric-editor.component";
import {UrlAnnotEditor} from "./url-annot-editor";
import {UrlAnnotDialogComponent} from "./popups/url-annot-dialog.component";
import {UtilModule} from "../util.module";
import {AgGridRendererModule} from "../grid-renderers";
import {ImprovedSelectEditor} from "./improved-select.editor";


@NgModule({
    imports: [
        AgGridModule.withComponents([
            DateEditor,
            SelectEditor,
            MultiSelectEditor,
            UrlAnnotEditor
        ]),
        AngularMaterialModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UtilModule,
        AgGridRendererModule
    ],
    declarations: [
        BarcodeSelectEditor,
        DateEditor,
        FillLikeEditor,
        MultipleSelectDialogComponent,
        ImprovedSelectEditor,
        SelectEditor,
        SeqlaneSelectEditor,
        TextAlignLeftMiddleEditor,
        TextAlignRightMiddleEditor,
        TextSelectXorMultiselectEditor,
        MultiSelectEditor,
        NumericEditor,
        UrlAnnotEditor,
        UrlAnnotDialogComponent
    ],
    entryComponents: [
        MultipleSelectDialogComponent,
        UrlAnnotDialogComponent
    ],
    exports: [
        BarcodeSelectEditor,
        DateEditor,
        FillLikeEditor,
        MultipleSelectDialogComponent,
        SelectEditor,
        TextAlignLeftMiddleEditor,
        TextAlignRightMiddleEditor,
        TextSelectXorMultiselectEditor,
        MultiSelectEditor,
        NumericEditor,
        UrlAnnotEditor,
        UrlAnnotDialogComponent
    ]
})
export class AgGridEditorModule { }