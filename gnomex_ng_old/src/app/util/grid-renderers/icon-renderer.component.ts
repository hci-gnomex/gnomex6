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
    public noIconDefault:boolean = false;

    constructor() {
    }

    ngOnInit() {
    }

    agInit(params: any): void {
        this.noIconDefault = <boolean>params.noIconDefault;
        this.setIcon(params);

    }

    refresh(params: ICellRendererParams): boolean {
        this.setIcon(params);
        return true;
    }

    private setIcon(params: ICellRendererParams): void {
        if(this.noIconDefault){ // allows the option to have no icon if the field is an empty string without looking up icon property
            this.iconSource = params.value;
        }else if (params.value) {
            this.iconSource = params.value;
        } else if (params.data && params.data.icon) {
            this.iconSource = params.data.icon;
        } else {
            this.iconSource = "";
        }
    };

}
