import {Component} from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
    selector: 'url-annot-renderer',
    template: `
        <div class="full-height full-width fix-table ellipsis">
            <span class="padding-right" *ngFor="let entry of this.value; let i = index " >
                <a [href]="entry.url" target="_blank"> {{entry.urlAlias}}</a>
            </span>
        </div>
	`,
    styles: [`
            .padding-right {padding-right: 1em} 
            .fix-table { table-layout:fixed; }
            .ellipsis {
                overflow: hidden;
                text-overflow: ellipsis;
            }
	`]
}) export class UrlAnnotRenderer implements ICellRendererAngularComp {
    private params: any;
    value: string;

    agInit(params: any): void {
        this.params = params;
        this.value = "";
        if (this.params && this.params.value) {
            this.value = this.params.value.PropertyEntryValue;
        }
    }

    refresh(): boolean {
        return false;
    }
}
