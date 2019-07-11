import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ConstantsService} from "../services/constants.service";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";
import {WINDOW} from "../services/window.service";

@Component({
    template: `
        <div class="full-width full-height flex-container-col padded">
            <input disabled [(ngModel)]="link"/>
        </div>
    `,
    styles: [`
    `]
})
export class ShareLinkDialogComponent extends BaseGenericContainerDialog implements OnInit {

    public link: string = "";
    private number: string = "";
    private type: string = "";


    constructor(private dialogRef: MatDialogRef<ShareLinkDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                public constService: ConstantsService,
                @Inject(WINDOW) private _window: Window) {
        super();
    }

    ngOnInit() {
        if (!this.data || !this.data.number) {
            this.dialogRef.close();
        }

        this.number = this.data.number;
        this.type = this.data.type;
        this.link = this.makeURL(this.type, this.number);

    }

    public copyToClipboard(): void {
        //native javascript
        let event = (e: ClipboardEvent) => {
            e.clipboardData.setData("text/plain", this.link);
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

