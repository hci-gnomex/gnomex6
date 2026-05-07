import {Component, Inject, Input} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
    selector: 'spinner-dialog',
    templateUrl: 'spinner-dialog.component.html',
    styleUrls: ["./spinner-dialog.component.scss"]
})
export class SpinnerDialogComponent {
    @Input("strokeWidth") strokeWidth: number = 3;
    @Input("diameter") diameter: number = 30;

    @Input("message") message: string = 'Loading...';

    constructor(private dialogRef: MatDialogRef<SpinnerDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (this.data) {
            if (!!this.data.message) {
                this.message = this.data.message;
            }
            if (!!this.data.diameter) {
                this.diameter = this.data.diameter;
            }
            if (!!this.data.strokeWidth) {
                this.strokeWidth = this.data.strokeWidth;
            }
        }
    }


}