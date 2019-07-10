import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {HttpClient, HttpEvent, HttpEventType, HttpParams, HttpRequest} from "@angular/common/http";
import {Subscription} from "rxjs";
import {saveAs} from "file-saver";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";

@Component({
    template: `
        <div class="flex-container-row full-height full-width double-padded">
            <mat-progress-bar mode="determinate" [value]="this.progressValue"></mat-progress-bar>
        </div>
    `,
    styles:[`
    `]
})
export class DownloadProgressComponent extends BaseGenericContainerDialog implements OnInit {

    public filename: string = "";
    public progressValue: number = 0;

    private url: string = "";
    private estimatedDownloadSize: number = 0;
    private httpParams: HttpParams;
    private suggestedFilename: string = "";
    private fileType: string = "";

    private downloadSubscription: Subscription;

    constructor(private dialogRef: MatDialogRef<DownloadProgressComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private httpClient: HttpClient) {
        super();
    }

    ngOnInit() {
        if (this.data) {
            this.url = this.data.url;
            this.estimatedDownloadSize = this.data.estimatedDownloadSize;
            this.httpParams = this.data.params;
            this.suggestedFilename = this.data.suggestedFilename;
            this.fileType = this.data.fileType;

            let today: Date = new Date();
            this.filename = this.suggestedFilename + "-" + today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + this.fileType;

            const request: HttpRequest<any> = new HttpRequest<any>("GET", "/gnomex/" + this.url, {
                params: this.httpParams,
                responseType: "blob",
                reportProgress: true
            });

            this.downloadSubscription = this.httpClient.request(request).subscribe((event: HttpEvent<any>) => {
                switch (event.type) {
                    case HttpEventType.DownloadProgress:
                        this.progressValue = Math.round((event.loaded / this.estimatedDownloadSize) * 100);
                        break;
                    case HttpEventType.Response:
                        this.progressValue = 100;
                        saveAs(event.body, this.filename);
                }
            });
            this.innerTitle = "Downloading " + (this.filename.length > 30 ? this.filename.substr(0, 29) + "..." : this.filename);
        }
    }

    public close(): void {
        if (this.downloadSubscription) {
            this.downloadSubscription.unsubscribe();
        }
        this.dialogRef.close();
    }

}
