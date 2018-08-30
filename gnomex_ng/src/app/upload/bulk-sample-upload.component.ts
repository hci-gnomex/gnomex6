import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material";
import {Router} from "@angular/router";
import {DialogsService} from "../util/popup/dialogs.service";
import {SampleUploadService} from "./sample-upload.service";

@Component({
    selector: 'bulk-sample-upload-launcher',
    template: `
        <div></div>
    `,
    styles: [`
        
        .no-padding-dialog .mat-dialog-container {
            padding: 0;
        }
        .no-padding-dialog .mat-dialog-container .mat-dialog-actions {
            background-color: #eeeeeb;
        }
        
    `]
}) export class BulkSampleUploadLauncherComponent {

    constructor (private dialog: MatDialog,
                 private router: Router) {

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = '60em';
        config.panelClass = 'no-padding-dialog';

        let dialogRef = this.dialog.open(BulkSampleUploadComponent, config);

        dialogRef.afterClosed().subscribe((result) => {
            // After closing the dialog, route away from this component so that the dialog could
            // potentially be reopened.
            this.router.navigate([{ outlets: {modal: null}}]);
        });
    }
}

@Component({
    selector: 'bulk-sample-upload',
    templateUrl: 'bulk-sample-upload.component.html',
    styles: [`

        .hidden { display: none; }
        
        .inline-block { display: inline-block; }

        .padded { padding: 0.3em; } 
        
        .no-margin    { margin: 0; }
        .margin-right { margin-right: 0.3em; }


        .title {
            background-color: #84b278;
            color: white;
            font-size: larger;
        }
    
    `]
}) export class BulkSampleUploadComponent {

    @ViewChild('fileInput') fileInput: ElementRef;

    public file: any;


    constructor(private dialog: MatDialog,
                private dialogService: DialogsService,
                private sampleUploadService: SampleUploadService) { }


    public onFileSelected(event: any) {
        if (event.target.files && event.target.files.length > 0) {
            this.file = event.target.files[0];

            let formData: FormData = new FormData();
            formData.append("filename", this.file.name);
            formData.append("filetype", this.file.type == "text/html" ? "html" : "text");
            formData.append("value", this.file, this.file.name);

            this.sampleUploadService.uploadBulkSampleSheet(formData).subscribe((result) => {
                if (result) {
                    this.dialogService.alert("File uploaded successfully");
                } else {
                    this.dialogService.alert("File failed to upload.");
                }
            });
        }
    }

    public openFileChooser() {
        setTimeout(() => {
            if (this.fileInput && this.fileInput.nativeElement) {
                this.fileInput.nativeElement.value = null;
                this.fileInput.nativeElement.click();
            }
        });
    }
}