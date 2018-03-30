import { Component } from "@angular/core";

import { ICellEditorAngularComp } from "ag-grid-angular";

@Component({
	templateUrl: "./select.editor.html",
	styles: [`
      .full-width  { width:  100%; } 
			.full-height { height: 100%; }
	`]
}) export class SelectEditor implements ICellEditorAngularComp{
	private params: any;
	value: any;
	options: any;
	optionsValueField: string;
	optionsDisplayField: string;

	agInit(params: any): void {
		this.params = params;
		this.options = [];
		this.optionsValueField = "";
		this.optionsDisplayField = "";

		if (this.params && this.params.column && this.params.column.colDef) {
			this.options             = this.params.column.colDef.selectOptions;
			this.optionsValueField   = this.params.column.colDef.selectOptionsValueField;
			this.optionsDisplayField = this.params.column.colDef.selectOptionsDisplayField;
		}

		if (this.params) {
			this.value = "" + this.params.value;
		}
	}

	onChange(event: any): void {
		if(event && event.currentTarget) {
			// This looks unnecessary, since this.value is linked to the value of the select component, but
			// because this also ends editing, it also queues the destruction of this component and the call to getValue.
			// The problem was that this.value isn't updated with the new value before this event fires,
			// so we need to update it manually here.
			this.value = event.currentTarget.value;
		}
		if (this.params) {
			this.params.stopEditing();
		}
	}

	getValue(): any {
		return this.value;
	}

	isPopup(): boolean {
		return false;
	}
}
