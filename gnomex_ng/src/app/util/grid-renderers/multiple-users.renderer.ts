import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height cursor" (click)="invokeParentMethod()">
				<div class="tr">
					<div class="td vertical-center string-container">
						{{usersString}}
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
      .string-container {
					padding-left: 0.3rem;
			}
			
			.cursor { cursor: pointer; }
			
			.full-width  { width:  100% }
			.full-height { height: 100% }
			
			.t  { display: table; }
			.tr { display: table-row; }
			.td { display: table-cell; }
			
			.inline-block { display: inline-block; }
			
			.vertical-center { vertical-align: middle; }
	`]
})
export class MultipleUsersRenderer implements ICellRendererAngularComp {
	public params: any;
	public usersString: string;
	public errorString: string;
	private onClick;
	private rendererOptions: any[];

	private rendererOptionDisplayField: string;
	private rendererOptionValueField: string;

	value: string;

	// set value(value: string) {
	// 	this._value = value;
	// 	this.findDisplayValues();
	// }

	agInit(params: any): void {
		this.params = params;
		this.value = "";

		this.rendererOptions = [];
		this.rendererOptionDisplayField = 'display';
		this.rendererOptionValueField = 'value';

		if (this.params) {
			this.value = "" + this.params.value;
		}

		if (this.params && this.params.colDef) {
			this.onClick = this.params.colDef.onClick;

			if (this.params.colDef.rendererOptions && Array.isArray(this.params.colDef.rendererOptions)) {
				this.rendererOptions = this.params.colDef.rendererOptions;
			}
			if (this.params.colDef.rendererOptionDisplayField) {
				this.rendererOptionDisplayField = '' + this.params.colDef.rendererOptionDisplayField;
			}
			if (this.params.colDef.rendererOptionValueField) {
				this.rendererOptionValueField = '' + this.params.colDef.rendererOptionValueField;
			}
		}

		this.findDisplayValues();
	}

	refresh(params: any): boolean {
		return false;
	}

	findDisplayValues() {
		this.usersString = "";
		this.errorString = "";

		let tokens: string[] = this.value.split(',');
		let foundOnePlus: boolean = false;

		for (let token of tokens) {
			let found: boolean = false;
			let userName: string = "";

			token = token.trim();

			for (let option of this.rendererOptions) {
				if (token === option[this.rendererOptionValueField]) {
					userName = option[this.rendererOptionDisplayField];
					found = true;
					break;
				}
			}

			if (found) {
				if (foundOnePlus) {
					this.usersString += ", "
				}
				this.usersString += userName;
				foundOnePlus = true;
			} else {
				this.usersString += " " + token;
			}
		}
	}

	invokeParentMethod(): void {
		if (this.onClick && this.params && this.params.context && this.params.context.componentParent) {
			this.params.context.componentParent[this.onClick](this.params.node.rowIndex);
			// this.onClick(this.params.node.rowIndex);
		}
	}
}
