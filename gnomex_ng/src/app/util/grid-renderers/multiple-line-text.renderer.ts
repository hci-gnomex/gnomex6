import { Component, ElementRef, ViewChild } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
    template: `
		<div class="full-width full-height">
			<div class="t full-width full-height fix-table" (click)="invokeParentMethod()">
				<div class="tr">
					<div #totalHeightSource class="td vertical-center">
						<div *ngFor="let line of value" class="full-width word-wrap">
							{{ line }}
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
    styleUrls: ['./multiple-line-text.renderer.scss']
})
export class MultipleLineTextRenderer implements ICellRendererAngularComp {
    public params: any;
    public displayStrings: any[];
    protected onClick;

    value: string[];

    @ViewChild('totalHeightSource', {static: false}) totalHeightSource: ElementRef;

    agInit(params: any): void {
        this.params = params;
        this.value = [];

        if (this.params) {
            if (this.params.value && !Array.isArray(this.params.value)) {
                this.value = [this.params.value];
            } else if (this.params.value && Array.isArray(this.params.value)) {
                this.value = this.params.value;
            }
        }

        if (this.params && this.params.colDef) {
            this.onClick = this.params.colDef.onClick;
        }

        this.requestResizeRow();
    }

    requestResizeRow(): void {
        setTimeout(() => {
            if (this.params
                && this.params.api
                && this.params.node
                && this.params.node.rowHeight
                && this.totalHeightSource
                && this.totalHeightSource.nativeElement
                && this.totalHeightSource.nativeElement.offsetHeight > this.params.node.rowHeight) {
                // The + 4 comes from the AgGrid's default cell padding.
                this.params.node.setRowHeight(this.totalHeightSource.nativeElement.offsetHeight + 4);
                // Unfortunately, we have to call this for each of the n cells using this renderer, rather than once total...
                this.params.api.onRowHeightChanged();
                this.params.api.sizeColumnsToFit();
            }
        });
    }

    refresh(params: any): boolean {
        return false;
    }

    invokeParentMethod(): void {
        if (this.onClick && this.params && this.params.context && this.params.context.componentParent) {
            this.params.context.componentParent[this.onClick](this.params.node.rowIndex);
        }
    }
}
