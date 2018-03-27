import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td vertical-center right-align padded cursor">
						{{ valueFormatted }}
					</div>
					<!--<div class="td vertical-center">-->
						<!--<button class="full-height"><img src="../../../assets/calendar_date.png" alt=""/></button>-->
					<!--</div>-->
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
			
			.vertical-center { vertical-align: middle;   }
			.right-align     { text-align:     right;    }
			.padded          { padding:        0 0.3rem; }
			
			.cursor { cursor: pointer; }
	`]
})
export class DateRenderer implements ICellRendererAngularComp {
	params: any;
	value: any;
	valueFormatted: string;

	agInit(params: any): void {
		this.params = params;
		this.value = this.params.value;
		this.valueFormatted = "";

		if (this.value && this.value !== '') {
			this.valueFormatted = new Date(Date.parse(this.value)).toLocaleDateString();

			if (this.valueFormatted === 'Invalid Date') {
				this.valueFormatted = this.value;
			}
		}
	}

	refresh(params: any): boolean {
		return false;
	}
}