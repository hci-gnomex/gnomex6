import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
	template: `
		<div class="full-width full-height {{this.errorMessage && this.errorMessage !== '' ? 'error' : ''}}">
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
			
			.full-width  { width:  100% }
			.full-height { height: 100% }
			
			.t  { display: table; }
			.tr { display: table-row; }
			.td { display: table-cell; }
			
			.vertical-center { vertical-align: middle;   }
			.left-align      { text-align:     left;     }
			.padded          { padding:        0 0.3rem; }

            .error {
                background: radial-gradient(rgba(255,0,0,0.10), rgba(255,0,0,0.25), rgba(255,0,0,0.90));
            }
			
            .fix-table { table-layout:fixed; }

            .ellipsis {
                overflow: hidden;
                text-overflow: ellipsis;
            }
	`]
})
export class TextAlignLeftMiddleRenderer implements ICellRendererAngularComp {
	params: any;
    value: string;

    errorMessage: string = '';

	agInit(params: any): void {
		this.params = params;

		this.value = (this.params && this.params.value) ? this.params.value : "";

        if (this.params
            && this.params.column
            && this.params.column.colDef
            && this.params.column.colDef.tooltip
            && this.params.data) {
            this.errorMessage = this.params.column.colDef.tooltip(
                this.params.value,
                this.params.valueFormatted,
                this.params.data,
                this.params.node,
                this.params.column.colDef,
                this.params.rowIndex,
                this.params.node.gridApi
            );
        }
	}

	refresh(params: any): boolean {
		return false;
	}
}