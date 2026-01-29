import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height">
			<div *ngIf="showRemoveButton" class="t full-width full-height cursor" (click)="invokeParentMethod()">
				<div class="tr">
					<div class="td vertical-center button-container">
						<button class="link-button">Remove</button>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
			button.link-button {
					background: none;
					background-color: inherit;
					color: #0a4894;
					border: none;
					padding: 0;
					font: inherit;
					text-decoration: underline;
					cursor: pointer;
			}
      
			button.link-button:focus {
					outline: none;
      }
			
      .button-container {
					padding-left: 0.3rem;
			}
			
			.cursor { cursor: pointer; }
			
			.full-width  { width:  100% }
			.full-height { height: 100% }
			
			.t  { display: table; }
			.tr { display: table-row; }
			.td { display: table-cell; }
			
			.vertical-center { vertical-align: middle; }
	`]
})
export class RemoveLinkButtonRenderer implements ICellRendererAngularComp {
	public params: any;
	showRemoveButton: boolean;

	private onRemoveClicked: string;

	agInit(params: any): void {
		this.params = params;
		this.checkIfShowRemove();

		if (this.params && this.params.column && this.params.column.colDef) {
            this.onRemoveClicked = this.params.column.colDef.onRemoveClicked;
		}
	}

	refresh(params: any): boolean {
		return false;
	}

	checkIfShowRemove(): void {
		if (this.params && this.params.data) {
			this.showRemoveButton = RemoveLinkButtonRenderer.canRemoveRow(this.params.data);
		} else {
			this.showRemoveButton = true;
		}
	}

	static canRemoveRow(row: any): boolean {
		return !(row && row.totalChargesToDateDisplay && row.totalChargesToDateDisplay !== '');
	}

	invokeParentMethod(): void {
		if (this.params && this.params.context && this.params.context.componentParent && this.onRemoveClicked) {
			this.params.context.componentParent[this.onRemoveClicked](this.params.node);
		}
	}
}