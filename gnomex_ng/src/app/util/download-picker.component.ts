import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {PropertyService} from "../services/property.service";
import {FileService} from "../services/file.service";

@Component({
    template: `
        <h6 mat-dialog-title>Confirm Download</h6>
        <mat-dialog-content>
            <div>
                Ready to download approximately {{this.downloadSizeLabel}}.
            </div>
            <div *ngIf="this.isFDTSupported">
                Which download mechanism do you want to use?
            </div>
            <div *ngIf="this.isFDTSupported">
                (FDT download is recommended for downloads > 300 MB)
            </div>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button (click)="this.selectNormalDownload()">Normal Download</button>
            <button mat-button *ngIf="this.isFDTSupported" (click)="this.selectFDTDownload()">FDT Download</button>
            <button mat-button mat-dialog-close>Cancel</button>
        </mat-dialog-actions>
    `,
    styles:[`
    `]
})
export class DownloadPickerComponent implements OnInit {

    public static readonly DOWNLOAD_NORMAL: string = "normal";
    public static readonly DOWNLOAD_FDT: string = "fdt";

    public isFDTSupported: boolean = false;
    private estimatedDownloadSize: string = "";
    private uncompressedDownloadSize: string = "";
    public downloadSizeLabel: string = "";

    constructor(private dialogRef: MatDialogRef<DownloadPickerComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private propertyService: PropertyService) {
    }

    ngOnInit() {
        if (this.data) {
            let sizesAreDifferent: boolean = this.data.estimatedDownloadSize !== this.data.uncompressedDownloadSize;

            if (this.data.estimatedDownloadSize) {
                this.estimatedDownloadSize = FileService.formatFileSize(parseInt(this.data.estimatedDownloadSize));
            }
            if (sizesAreDifferent && this.data.uncompressedDownloadSize) {
                this.uncompressedDownloadSize = FileService.formatFileSize(parseInt(this.data.uncompressedDownloadSize));
            }

            this.downloadSizeLabel = this.estimatedDownloadSize;
            if (sizesAreDifferent) {
                 this.downloadSizeLabel += " - " + this.uncompressedDownloadSize;
            }
        }

        this.isFDTSupported = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_FDT_SUPPORTED);
    }

    public selectNormalDownload(): void {
        this.dialogRef.close(DownloadPickerComponent.DOWNLOAD_NORMAL);
    }

    public selectFDTDownload(): void {
        this.dialogRef.close(DownloadPickerComponent.DOWNLOAD_FDT);
    }

}
