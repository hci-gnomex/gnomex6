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
    styleUrls: ['./filllike-text-renderer.component.scss']
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