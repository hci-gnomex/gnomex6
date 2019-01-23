import {Component, OnInit} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";
import {ICellRendererParams} from "ag-grid-community";

@Component({
    template: `
        <div>
            <img [src]="iconSource" alt=""/>
        </div>
    `,
    styles: [`        
    `]
})
export class IconRendererComponent implements ICellRendererAngularComp, OnInit {

    public iconSource: string = "";

    constructor() {
    }

    ngOnInit() {
    }

    agInit(params: ICellRendererParams): void {
        this.setIcon(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.setIcon(params);
        return true;
    }

    private setIcon(params: ICellRendererParams): void {
        if (params.value) {
            this.iconSource = params.value;
        } else if (params.data && params.data.icon) {
            this.iconSource = params.data.icon;
        } else {
            this.iconSource = "";
        }
    };

}
