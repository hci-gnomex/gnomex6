import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height" role="gridcell">
			<div *ngIf="value && value === 'n'" class="t full-width full-height cursor" (click)="invokeParentMethod()" role="button" tabindex="0" aria-label="Approve" (keydown.enter)="invokeParentMethod()">
				<div class="tr">
					<div class="td vertical-center button-container">
						<button class="link-button" aria-label="Approve item"><div class="message inline-block">Approve</div></button>
					</div>
				</div>
			</div>
		</div>
	`,
	styleUrls: ['./approve-button.renderer.scss']
})
export class ApproveButtonRenderer implements ICellRendererAngularComp {
	public params: any;
	public static readonly ACTIVE: string = "is-active";
	public static readonly INACTIVE: string = "is-not-active";
	public classes: string;
	public value: string;
	private onClick;

	agInit(params: any): void {
		this.params = params;
		this.value = "";

		if (this.params) {
			this.value = ("" + this.params.value).toLowerCase();
		}

		if (this.params && this.params.colDef) {
			this.onClick = this.params.colDef.onClick;
		}
	}

	refresh(params: any): boolean {
		return false;
	}

	invokeParentMethod(): void {
		if (this.onClick && this.params && this.params.context && this.params.context.componentParent) {
            if (this.params.node && this.params.node.formGroup) {
                this.params.node.formGroup.markAsDirty();
			}

			this.params.context.componentParent[this.onClick](this.params.node);
			this.params.value = 'Y';
		}
	}
}
