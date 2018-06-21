import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import {TextAlignLeftMiddleRenderer} from "./text-align-left-middle.renderer";

@Component({
    template: `
		<div class="full-width full-height">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td vertical-center left-align padded">
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
			
			.vertical-center { vertical-align: middle;   }
			.left-align      { text-align:     left;     }
			.padded          { padding:        0 0.3rem; }
	`]
})
export class FilllikeTextRendererComponent extends TextAlignLeftMiddleRenderer {
    fillLikeAttribute: string;

    agInit(params: any): void {
        super.agInit(params);

        this.fillLikeAttribute = this.params.column.colDef.fillLikeAttribute;

        this.params.column.gridApi.forEachNode((rowNode, index) => {
            console.log("init");

        });


    }

    onChange(event: any): void {
        console.log("event");
        this.params.column.gridApi.forEachNode((rowNode, index) => {
            console.log("init");

        });

    }

    refresh(params: any): boolean {
        return false;
    }
}