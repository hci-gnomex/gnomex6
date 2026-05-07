import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import {CellRendererValidation} from "./cell-renderer-validation";

@Component({
	template: `
		<div [matTooltip]="this.errorMessage"
             [matTooltipShowDelay]="300"
             [matTooltipHideDelay]="300"
			 class="full-width full-height {{this.errorMessage && this.errorMessage !== '' ? 'error' : ''}}">
			<div class="t full-width full-height fix-table">
				<div class="tr">
					<div *ngIf="showZeroes" class="td vertical-center right-align padded ellipsis">
						{{ value ? value : "0" }}
					</div>
					<div *ngIf="!showZeroes" class="td vertical-center right-align padded ellipsis">
						{{ value }}
					</div>
				</div>
			</div>
		</div>
	`,
	styleUrls: ['./text-align-right-middle.renderer.scss']
})
export class TextAlignRightMiddleRenderer extends CellRendererValidation {
    public value: string;
	public showZeroes: boolean = false;
    context: any;

	agInit2(params: any): void {
		this.value = (this.params && this.params.value) ? this.params.value : "";
		this.showZeroes = (this.params && this.params.colDef  && this.params.colDef.showZeroes) ? !!this.params.colDef.showZeroes : false;
	}

	refresh(params: any): boolean {
		return false;
	}
}
