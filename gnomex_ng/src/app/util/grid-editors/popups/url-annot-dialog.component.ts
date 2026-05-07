import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {UrlAnnotationComponent} from "../../url-annotation.component";
import {FormControl} from "@angular/forms";

@Component({
    selector: "url-annot-dialog",
    templateUrl: "url-annot-dialog.component.html",
    styleUrls: ['./url-annot-dialog.component.scss']
})
export class UrlAnnotDialogComponent {
    gridApi: any;
    gridColumnApi: any;
    urlFormControl: FormControl;
    annot: any;

    value: string;
    okWasClicked: boolean = false;

    constructor(private dialogRef: MatDialogRef<UrlAnnotDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (data) {
            this.annot = data.annot;
            if (data.propertyValue) {
                this.annot.PropertyEntryValue = data.propertyValue.PropertyEntryValue;
            }
        }

        this.urlFormControl = new FormControl(this.annot);
    }

    onGridSizeChanged(): void {
        if (this.gridApi) {
            this.gridApi.sizeColumnsToFit();
        }
    }

    onGridReady(event: any): void {
        this.gridApi = event.api;
        this.gridColumnApi = event.columnApi;

        setTimeout(() => {
            if (this.gridApi) {
                this.gridApi.sizeColumnsToFit();
            }
        });
   }

    updateButtonClicked() {
        console.log("update");
        this.okWasClicked = true;

        this.value = this.getValue();

        this.dialogRef.close();

    }

    cancelButtonClicked() {
        this.dialogRef.close();
    }

    getValue(): string {
        return "";
    }
}