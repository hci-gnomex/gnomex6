import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectEditor } from './select.editor';


@NgModule({
    imports: [
        CommonModule
    ],

    declarations: [
        SelectEditor
    ],
    exports: [
        SelectEditor
    ]
})
export class AgGridEditorModule { }