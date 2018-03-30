import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td vertical-center right-align padded">
						{{ valueFormatted }}
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
			.right-align     { text-align: right;      }
      .padded          { padding:        0 0.3rem; }
	`]
})
export class TextAlignRightMiddleRenderer implements ICellRendererAngularComp {
	params: any;
	valueFormatted: string;

	agInit(params: any): void {
		this.params = params;

		this.valueFormatted = (this.params && this.params.valueFormatted) ? this.params.valueFormatted : "";
	}

	refresh(params: any): boolean {
		return false;
	}
}