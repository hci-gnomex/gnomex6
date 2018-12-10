import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
    template: `
		<div class="full-height full-width">
            <button class="viewer-link-button" *ngIf="this.allow" (click)="this.onLinkClick()"><img [src]="this.icon"></button>
        </div>
	`,
    styles: [`
        button.viewer-link-button {
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            cursor: pointer;
            outline: none;
        }
	`]
})
export class ViewerLinkRenderer implements ICellRendererAngularComp {
    public allow: boolean = false;
    public icon: string;
    private function: (data: any) => void;
    private data: any;

    agInit(params: any): void {
        this.allow = params.value && params.value === 'Y';
        this.icon = params.icon;
        this.data = params.data;
        this.function = params.clickFunction;
    }

    refresh(params: any): boolean {
        return true;
    }

    public onLinkClick(): void {
        this.function(this.data);
    }
}
