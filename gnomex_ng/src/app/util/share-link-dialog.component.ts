import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ConstantsService} from "../services/constants.service";

@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div mat-dialog-title class="dialog-header-colors no-padding no-margin">
                <div class="flex-container-row">
                    <div class="full-height padded title-size" style="width: 95%;">
                        Web Link for {{name.length > 35 ? (name | slice:0:35) + "..." : name}}
                    </div>
                    <div class="right-align">
                        <button mat-button color="link" mat-dialog-close>
                            <img class="icon" [src]="this.constService.ICON_CLOSE_BLACK">
                        </button>
                    </div>
                </div>
            </div>
            <div mat-dialog-content class="no-padding no-margin">
                <div class="full-width full-height flex-container-col padded">
                    <input disabled [(ngModel)]="link"/>
                </div>
                <div class="full-width right-align flex-container-row padded">
                    <div class="full-height flex-grow">
                    </div>
                    <div>
                        <button mat-button (click)="copyToClipboard(link)">Copy To Clipboard</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .no-padding {
            padding: 0;
        }
        .no-margin {
            margin: 0;
        }
    `]
})
export class ShareLinkDialogComponent implements OnInit {

    public name: string = "";
    public link: string = "";
    private number: string = "";
    private type: string = "";


    constructor(private dialogRef: MatDialogRef<ShareLinkDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                public constService: ConstantsService,
                @Inject(Window) private _window: Window) {
    }

    ngOnInit() {
        if (!this.data || !this.data.number) {
            this.dialogRef.close();
        }

        this.name = this.data.name;
        this.number = this.data.number;
        this.type = this.data.type;
        this.link = this.makeURL(this.type, this.number);

        if (this.name) {
            this.name = this.type === "topicNumber" ? "Topic T" + this.number + " - " + this.name
                : this.name + " " + this.number;
        }
    }

    public copyToClipboard(text: string): void {
        //native javascript
        let event = (e: ClipboardEvent) => {
            e.clipboardData.setData("text/plain", text);
            e.preventDefault();
            document.removeEventListener("copy", event);
        };
        document.addEventListener("copy", event);
        document.execCommand("copy");
    }

    private makeURL(orderType: string, number: string): string {
        // native javascript
        return `${this._window.location.origin}/gnomex/?${orderType + "=" + number}`;
    }
}

