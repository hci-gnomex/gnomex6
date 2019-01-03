import {Component, Input, OnInit, ViewChild} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { forkJoin } from 'rxjs';
import {UploadFileService} from "../../services/upload-file.service";
import {IFileParams} from "../interfaces/file-params.model";

@Component({
    selector: 'upload-file',
    templateUrl: './upload-file.component.html',
    styles: [`
        .add-files-btn {
            float: right;
        }

        :host {
            height: 100%;
            display: flex;
            flex: 1;
            flex-direction: column;
        }
    
    `]
})
export class UploadFileComponent implements OnInit {
    @ViewChild('file') file;
    @Input('manageData') manageData: IFileParams;
    progressGroup:any;
    canBeClosed = true;
    primaryButtonText = 'Upload';
    showCancelButton = true;
    uploading = false;
    uploadSuccessful = false;


    public files: Set<File> = new Set();

    constructor(public dialogRef: MatDialogRef<UploadFileComponent>, public uploadService: UploadFileService) {}

    ngOnInit() {
        if(!this.manageData){
            this.canBeClosed = false;
        }
    }



    onFilesAdded() {
        const files: { [key: string]: File } = this.file.nativeElement.files;
        for (let key in files) {
            if (!isNaN(parseInt(key))) {
                this.files.add(files[key]);
            }
        }
    }

    addFile() {
        this.file.nativeElement.click();
    }

    closeDialog() {

        // if everything was uploaded already, just close the dialog

        if (this.uploadSuccessful) {
            return this.dialogRef.close();
        }

        // set the component state to "uploading"
        this.uploading = true;

        // start the upload and save the progress map


        this.progressGroup = this.uploadService.upload(this.files,this.manageData.uploadURL, this.manageData.id );
        console.log(this.progressGroup);
        for (const key in this.progressGroup) {
            this.progressGroup[key].progress.subscribe(val => console.log(val));
        }

        // convert the progress map into an array
        let allProgressObservables = [];
        for (let key in this.progressGroup) {
            allProgressObservables.push(this.progressGroup[key].progress);
        }

        // Adjust the state variables

        // The OK-button should have the text "Finish" now
        this.primaryButtonText = 'Finish';

        // The dialog should not be closed while uploading
        this.canBeClosed = false;
        this.dialogRef.disableClose = true;

        // Hide the cancel-button
        this.showCancelButton = false;

        // When all progress-observables are completed...
        forkJoin(allProgressObservables).subscribe(end => {
            // ... the dialog can be closed again...
            this.canBeClosed = true;
            this.dialogRef.disableClose = false;

            // ... the upload was successful...
            this.uploadSuccessful = true;

            // ... and the component is no longer uploading
            this.uploading = false;
        });
    }
}