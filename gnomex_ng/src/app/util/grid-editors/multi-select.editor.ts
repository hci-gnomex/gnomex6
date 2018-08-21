import {Component, Input, OnDestroy} from "@angular/core";

import { ICellEditorAngularComp } from "ag-grid-angular";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {MultipleSelectDialogComponent} from "./popups/multiple-select-dialog.component";

@Component({
    templateUrl: "./multi-select.editor.html",
    styles: [`
      .full-width  { width:  100%; } 
			.full-height { height: 100%; }
			
			.flex-column-container {
					display: flex;
					flex-direction: row;
			}
			.flex-row  {
					display: flex;
			}
			.flex-stretch { 
					display:flex; 
					flex: 1; 
			}
	`]
}) export class MultiSelectEditor implements ICellEditorAngularComp, OnDestroy {
    params: any;
    value: any;
    options: any;
    optionsValueField: string;
    optionsDisplayField: string;
    gridValueField: string;

    constructor(private dialog: MatDialog) { }

    agInit(params: any): void {
        this.params = params;
        this.options = [];
        this.optionsValueField = "";
        this.optionsDisplayField = "";

        if (this.params && this.params.column && this.params.column.colDef) {
            this.gridValueField = this.params.column.colDef.field;

            this.options             = this.params.column.colDef.selectOptions;
            this.optionsValueField   = this.params.column.colDef.selectOptionsValueField;
            this.optionsDisplayField = this.params.column.colDef.selectOptionsDisplayField;
        }

        if (this.params) {
            this.value = "" + this.params.value;
        }
        let data: any = {
            value: '' + this.value,
            optionName: this.optionsDisplayField,
            allowMultipleSelection: true,
            displayField: 'display',
            valueField: 'value',
            options: this.options
        };

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.data = data;
        configuration.height = '30em';
        configuration.width = '40em';

        let dialogRef: MatDialogRef<MultipleSelectDialogComponent> = this.dialog.open(MultipleSelectDialogComponent, configuration);

        dialogRef.afterClosed().subscribe(() => {
            this.value = dialogRef.componentInstance.getValue();
            this.params.column.gridApi.stopEditing();
        })

    }

    ngOnDestroy(): void {
        if (this.params && this.params.node && this.params.node[(this.gridValueField + "_originalValue")]) {
            this.value = this.params.node[(this.gridValueField + "_originalValue")];
        }
    }

    onChange(event: any): void {
        if (event && event.currentTarget) {

            if (this.params && this.params.node && !this.params.node[(this.gridValueField + "_originalValue")]) {
                this.params.node[(this.gridValueField + "_originalValue")] = this.value;
            }

            // This looks unnecessary, since this.value is linked to the value of the select component, but
            // because this also ends editing, it also queues the destruction of this component and the call to getValue.
            // The problem was that this.value isn't updated with the new value before this event fires,
            // so we need to update it manually here.
            this.value = event.currentTarget.value;
            this.params.node.setDataValue(this.gridValueField, this.value);
        }
        if (this.params) {

            //  If the fill button, which is part of the editor, is activated, don't stop editing
            // immediately after making a selection.
        }
    }

    getValue(): any {
        return this.value;
    }

    isPopup(): boolean {
        return false;
    }

}
