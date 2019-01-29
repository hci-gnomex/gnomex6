import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {PropertyService} from "../services/property.service";

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
    private static readonly SIZE_GB: number = Math.pow(2, 30);
    private static readonly SIZE_MB: number = Math.pow(2, 20);
    private static readonly SIZE_KB: number = Math.pow(2, 10);

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
                this.estimatedDownloadSize = DownloadPickerComponent.formatFileSize(parseInt(this.data.estimatedDownloadSize));
            }
            if (sizesAreDifferent && this.data.uncompressedDownloadSize) {
                this.uncompressedDownloadSize = DownloadPickerComponent.formatFileSize(parseInt(this.data.uncompressedDownloadSize));
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

    public static formatFileSize(size: number): string {
        let sizeFormatted: number;
        if (size > DownloadPickerComponent.SIZE_GB) {
            sizeFormatted = Math.round((size / DownloadPickerComponent.SIZE_GB) * 10) / 10;
            if (sizeFormatted === 0) {
                sizeFormatted = 1;
            }
            return "" + sizeFormatted + " GB"
        } else if (size > DownloadPickerComponent.SIZE_MB) {
            sizeFormatted = Math.round(size / DownloadPickerComponent.SIZE_MB);
            if (sizeFormatted === 0) {
                sizeFormatted = 1;
            }
            return "" + sizeFormatted + " MB";
        } else if (size > DownloadPickerComponent.SIZE_KB) {
            sizeFormatted = Math.round(size / DownloadPickerComponent.SIZE_KB);
            if (sizeFormatted === 0) {
                sizeFormatted = 1;
            }
            return "" + sizeFormatted + " KB";
        } else {
            sizeFormatted = Math.round(size);
            if (sizeFormatted === 0) {
                sizeFormatted = 1;
            }
            return "" + sizeFormatted + " bytes";
        }
    }

}
