import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'two-button',
    template: `
        <div class="full-width full-height">
            <div class="full-width full-height flex-container-row align-center">
                <div class="flex-grow horizontal-center" (click)="invokeParentMethod()">
                    <button class="link-button"><div class="message inline-block">{{buttonName}}</div></button>
                </div>
            </div>
        </div>
    `,
    styles: [`

        .half-width { width: 50%; }
        
        .inline-block { display: inline-block; }

        .horizontal-center { text-align: center;     }
        
        button.link-button {
            background: none;
            background-color: inherit;
            border: none;
            padding: 0;
            text-decoration: underline;
            cursor: pointer;
        }

        button.link-button:focus {
            outline: none;
        }
        
        .message {
            text-decoration: underline;
            color: blue;
        }
    `]
})
export class LinkButtonRenderer implements ICellRendererAngularComp {

    protected buttonName: string = 'View';

    protected params: any;

    protected onClickButtonFunctionName: string = '';

    agInit(params: any): void {
        this.params = params;

        if (this.params && this.params.colDef) {
            this.onClickButtonFunctionName = this.params.colDef.onClickButton;

            if (this.params.colDef.buttonLabel) {
                this.buttonName = this.params.colDef.buttonLabel;
            } else if (this.params.colDef.buttonValueLabel && this.params.node && this.params.node.data) {
                this.buttonName = this.params.node.data[this.params.colDef.buttonValueLabel];
            }
        }
    }

    public refresh(params: any): boolean {
        return false;
    }

    public invokeParentMethod(): void {
        if (this.onClickButtonFunctionName && this.params && this.params.context && this.params.context) {
            this.params.context[this.onClickButtonFunctionName](this.params.node);
        }
    }
}