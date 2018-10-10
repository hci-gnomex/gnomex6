import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td vertical-center center-align">
						<input type="checkbox" [checked]="checked" [disabled]="!editable" (change)="onChange($event)">
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`

      .full-width  { width:  100% }
      .full-height { height: 100% }

      .t  { display: table; }
      .tr { display: table-row; }
      .td { display: table-cell; }

      .vertical-center { vertical-align: middle; }
      .center-align    { text-align:     center; }
	`]
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