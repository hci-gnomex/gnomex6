import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'two-button',
    template: `
        <div class="full-width full-height">
            <div class="t full-width full-height">
                <div class="tr">
                    <div class="td vertical-center button-container" (click)="invokeParentMethod1()">
                        <button class="link-button"><div class="message inline-block">{{button1Name}}</div></button>
                    </div>
                    <div class="td vertical-center button-container" (click)="invokeParentMethod2()">
                        <button class="link-button"><div class="message inline-block">{{button2Name}}</div></button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`

        .t  { display: table; }
        .tr { display: table-row; }
        .td { display: table-cell; }

        .inline-block { display: inline-block; }

        .vertical-center { vertical-align: middle; }
        
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

        .button-container {
            padding-left: 0.3rem;
        }
        
        .message {
            padding-left: 0.5rem;
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