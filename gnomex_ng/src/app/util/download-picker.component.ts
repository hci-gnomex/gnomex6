import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {PropertyService} from "../services/property.service";
import {FileService} from "../services/file.service";
import {ActionType} from "./interfaces/generic-dialog-action.model";

@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div class="full-height full-width flex-container-col padded">
                <div>
                    Ready to download approximately {{this.downloadSizeLabel}}.
                </div>
                <div *ngIf="this.isFDTSupported">
                    Which download mechanism do you want to use?
                </div>
                <div *ngIf="this.isFDTSupported">
                    (FDT download is recommended for downloads > 300 MB)
                </div>
            </div>
            <mat-dialog-actions class="justify-flex-end no-margin no-padding generic-dialog-footer-colors">
                <save-footer (saveClicked)="selectNormalDownload()" name="Normal Download"></save-footer>
                <save-footer *ngIf="this.isFDTSupported" (saveClicked)="selectFDTDownload()" name="FDT Download"></save-footer>
                <save-footer [actionType]="actionType.SECONDARY"(saveClicked)="onClose()" name="Cancel"></save-footer>
            </mat-dialog-actions>
        </div>
    `,
    styles:[``]
})
export class DownloadPickerComponent implements OnInit {

    public static readonly DOWNLOAD_NORMAL: string = "normal";
    public static readonly DOWNLOAD_FDT: string = "fdt";

    public isFDTSupported: boolean = false;
    private estimatedDownloadSize: string = "";
    private uncompressedDownloadSize: string = "";
    public downloadSizeLabel: string = "";
    public actionType: any = ActionType;

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

    onClose(): void {
        this.dialogRef.close();
    }

}
