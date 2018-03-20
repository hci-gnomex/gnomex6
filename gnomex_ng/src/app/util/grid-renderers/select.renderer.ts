import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td cell-text-container">
						{{display}}
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
			.t  { display: table;      }
			.tr { display: table-row;  }
			.td { display: table-cell; }
			
			.cell-text-container { 
					vertical-align: middle;
					padding-left: 0.3rem;
			}
			
      .full-width  { width:  100%; } 
			.full-height { height: 100%; }
	`]
}) export class SelectRenderer implements ICellRendererAngularComp{
	private params: any;
	value: string;
	display: string;
	options: any;
	optionsValueField: string;
	optionsDisplayField: string;

	agInit(params: any): void {
		this.params = params;
		this.options = [];
		this.value = "";
		this.optionsValueField = "";
		this.optionsDisplayField = "";

		if (this.params) {
			this.value = this.params.valueFormatted;
		}

		if (this.params && this.params.column && this.params.column.colDef) {
			this.options             = this.params.column.colDef.selectOptions;
			this.optionsValueField   = this.params.column.colDef.selectOptionsValueField;
			this.optionsDisplayField = this.params.column.colDef.selectOptionsDisplayField;
		}

		if (this.value && this.value != ""
				&& this.options && this.options.length > 0
				&& this.optionsValueField && this.optionsValueField != ""
				&& this.optionsDisplayField && this.optionsDisplayField != "") {

			for (let option of this.options) {
				if (option[this.optionsValueField] && option[this.optionsValueField] === this.value) {
					if (option[this.optionsDisplayField]) {
						this.display = option[this.optionsDisplayField]
					} else {
						this.display = this.value;
					}
					break;
				}
			}
		} else {
			this.display = this.value;
		}
	}

	refresh(): boolean {
		return false;
	}
}