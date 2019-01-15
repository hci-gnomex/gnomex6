import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {HttpClient, HttpEvent, HttpEventType, HttpParams, HttpRequest} from "@angular/common/http";
import {Subscription} from "rxjs";
import {saveAs} from "file-saver";

@Component({
    template: `
        <h6 mat-dialog-title>Downloading {{this.filename}}</h6>
        <mat-dialog-content>
            <mat-progress-bar mode="determinate" [value]="this.progressValue"></mat-progress-bar>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button (click)="this.close()">{{this.endButtonLabel}}</button>
        </mat-dialog-actions>
    `,
    styles:[`
    `]
})
export class DownloadProgressComponent implements OnInit {

    public filename: string = "";
    public progressValue: number = 0;
    public endButtonLabel: string = "Cancel";

    private url: string = "";
    private estimatedDownloadSize: number = 0;
    private httpParams: HttpParams;
    private suggestedFilename: string = "";
    private fileType: string = "";

    private downloadSubscription: Subscription;

    constructor(private dialogRef: MatDialogRef<DownloadProgressComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private httpClient: HttpClient) {
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
                        this.endButtonLabel = "Close";
                        saveAs(event.body, this.filename);
                }
            });
        }
    }

    public close(): void {
        if (this.downloadSubscription) {
            this.downloadSubscription.unsubscribe();
        }
        this.dialogRef.close();
    }

}
