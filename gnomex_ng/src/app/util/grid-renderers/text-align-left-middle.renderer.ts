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
					<div class="td vertical-center left-align padded ellipsis">
						{{ value }}
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`		
		
		.t  { display: table; }
		.tr { display: table-row; }
		.td { display: table-cell; }
			
		.vertical-center { vertical-align: middle;   }
		.left-align      { text-align:     left;     }
		.padded          { padding:        0 0.3rem; }

		.error {
			background: linear-gradient(rgba(255,0,0,0.25), rgba(255,0,0,0.25), rgba(255,0,0,0.25));
			border: solid red 2px;
		}
			
		.fix-table { table-layout:fixed; }

		.ellipsis {
			overflow: hidden;
			text-overflow: ellipsis;
		}
		
	`]
})
export class TextAlignLeftMiddleRenderer extends CellRendererValidation {
    value: string;

    errorMessage: string = '';

	agInit2(params: any): void {
		this.value = (this.params && this.params.value) ? this.params.value : "";
	}

	refresh(params: any): boolean {
		return false;
	}
}