import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'two-button',
    template: `
        <div class="full-width full-height">
            <div class="full-width full-height flex-container-row align-center">
                <div class="half-width horizontal-center" (click)="invokeParentMethod1()">
                    <button class="link-button"><div class="message inline-block">{{button1Name}}</div></button>
                </div>
                <div class="flex-grow horizontal-center" (click)="invokeParentMethod2()">
                    <button class="link-button"><div class="message inline-block">{{button2Name}}</div></button>
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
export class TwoButtonRenderer implements ICellRendererAngularComp {

    protected button1Name: string = 'View';
    protected button2Name: string = 'Edit';

    protected params: any;

    protected onClickButton1FunctionName: string = '';
    protected onClickButton2FunctionName: string = '';

    agInit(params: any): void {
        this.params = params;

        if (this.params && this.params.colDef) {
            this.onClickButton1FunctionName = this.params.colDef.onClickButton1;
            this.onClickButton2FunctionName = this.params.colDef.onClickButton2;

            if (this.params.colDef.button1Label) {
                this.button1Name = this.params.colDef.button1Label;
            }
            if (this.params.colDef.button2Label) {
                this.button2Name = this.params.colDef.button2Label;
            }
        }
    }

    refresh(params: any): boolean {
        return false;
    }

    invokeParentMethod1(): void {
        if (this.onClickButton1FunctionName && this.params && this.params.context && this.params.context) {
            this.params.context[this.onClickButton1FunctionName](this.params.node.rowIndex);
        }
    }

    invokeParentMethod2(): void {
        if (this.onClickButton2FunctionName && this.params && this.params.context && this.params.context) {
            this.params.context[this.onClickButton2FunctionName](this.params.node.rowIndex);
        }
    }
}