import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import {CellRendererValidation} from "./cell-renderer-validation";

@Component({
	template: `
		<div [matTooltip]="this.errorMessage"
             [matTooltipShowDelay]="300"
             [matTooltipHideDelay]="300"
			 class="full-width full-height {{ this.errorMessage && this.errorMessage !== '' ? 'error' : '' }}">
			<div class="t full-width full-height fix-table">
				<div class="tr">
					<div class="td vertical-center left-align padded ellipsis {{ this.boldFont ? 'bold' : '' }}">
						{{ this.value }}
					</div>
				</div>
			</div>
		</div>
	`,
	styleUrls: ['./text-align-left-middle.renderer.scss']
})
export class TextAlignLeftMiddleRenderer extends CellRendererValidation {
    value: string;
    boldFont: boolean = false;

	agInit2(params: any): void {
		this.value = (this.params && this.params.value) ? this.params.value : "";
		this.boldFont = this.params
			&& this.params.node
			&& this.params.node.data
            && this.params.node.data.boldDisplay
            && this.params.node.data.boldDisplay === 'Y';
	}

	refresh(params: any): boolean {
		return false;
	}
}