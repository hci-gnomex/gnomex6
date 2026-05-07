import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height" role="gridcell">
			<div *ngIf="showRemoveButton" class="t full-width full-height cursor" (click)="invokeParentMethod()" role="button" tabindex="0" aria-label="Remove item" (keydown.enter)="invokeParentMethod()">
				<div class="tr">
					<div class="td vertical-center button-container">
						<button class="link-button" aria-label="Remove item">Remove</button>
					</div>
				</div>
			</div>
		</div>
	`,
	styleUrls: ['./remove-link-button.renderer.scss']
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