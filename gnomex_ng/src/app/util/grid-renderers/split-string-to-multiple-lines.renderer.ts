import { Component, ElementRef, ViewChild } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height cursor" (click)="invokeParentMethod()">
				<div class="tr">
					<div #totalHeightSource class="td vertical-center">
						<div *ngFor="let displayString of displayStrings" class="full-width string-container {{displayString.classes}} ">
							{{displayString.display}}
						</div>
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
			
		.error { color: red; }
	`]
})
export class SplitStringToMultipleLinesRenderer implements ICellRendererAngularComp {
	public params: any;
	public displayStrings: any[];
	protected onClick;
    protected rendererOptions: any[];

    protected rendererOptionDisplayField: string;
    protected rendererOptionValueField: string;

	value: string;

	@ViewChild('totalHeightSource') totalHeightSource: ElementRef;

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
		this.requestResizeRow();
	}

	findDisplayValues() {
		this.displayStrings = [];

		let tokens: string[] = this.value.split(',');

		for (let token of tokens) {
			if (!token || token === '') {
				continue;
			}

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
				this.displayStrings.push({display: userName, classes: '' });
			} else {
				this.displayStrings.push({display: "FAILED LOOKUP " + token, classes: ' error ' });
			}
		}

		this.displayStrings = this.displayStrings.sort((a, b) => {
			if (a.display.toLowerCase() === b.display.toLowerCase()) {
				return 0;
			} else if (a.display.toLowerCase() > b.display.toLowerCase()) {
				return 1;
			} else {
				return -1;
			}
		});
	}

	requestResizeRow(): void {
		setTimeout(() => {
			if (this.params
					&& this.params.api
					&& this.params.node
					&& this.params.node.rowHeight
					&& this.totalHeightSource.nativeElement
					&& this.totalHeightSource.nativeElement.offsetHeight > this.params.node.rowHeight) {
				// The + 4 comes from the AgGrid's default cell padding.
				this.params.node.setRowHeight(this.totalHeightSource.nativeElement.offsetHeight + 4);
				// Unfortunately, we have to call this for each of the n cells using this renderer, rather than once total...
				this.params.api.onRowHeightChanged();
				this.params.api.sizeColumnsToFit();
			}
		});
	}

	refresh(params: any): boolean {
		return false;
	}

	invokeParentMethod(): void {
		if (this.onClick && this.params && this.params.context && this.params.context.componentParent) {
			this.params.context.componentParent[this.onClick](this.params.node.rowIndex);
			// this.onClick(this.params.node.rowIndex);
		}
	}
}
