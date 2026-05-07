import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height" role="gridcell">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td vertical-center center-align">
						<input type="checkbox" [checked]="checked" [disabled]="!editable" (change)="onChange($event)" [attr.aria-checked]="checked" aria-label="Toggle selection">
					</div>
				</div>
			</div>
		</div>
	`,
	styleUrls: ['./checkbox.renderer.scss']
})
export class CheckboxRenderer implements ICellRendererAngularComp {
	params: any;
	checked: boolean;
	editable: boolean = false;

	agInit(params: any): void {
		this.params = params;

		this.checked = (this.params && this.params.value && this.params.value === 'Y') ? true : false;

		if (this.params && this.params.colDef && this.params.colDef.checkboxEditable) {
			if (this.params.colDef.checkboxEditable === true) {
				this.editable = true;
			} else {
                this.editable = this.params.colDef.checkboxEditable(this.params);
			}
		}
	}

	refresh(params: any): boolean {
		return false;
	}

	onChange(event: any): void {
		if (this.editable) {
            let oldValue = this.params.data[this.params.colDef.field];
            this.params.data[this.params.colDef.field] = event.currentTarget.checked ? "Y" : "N";
            let newValue = this.params.data[this.params.colDef.field];
            this.params.api.dispatchEvent({
				api:this.params.api,
				node:this.params.node,
				column: this.params.column,
				type:'cellValueChanged',
				rowPinned:'',
				oldValue: oldValue,
				newValue: newValue });
		}
	}
}