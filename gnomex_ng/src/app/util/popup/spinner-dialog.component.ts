import {Component, Inject, Input} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
    selector: 'spinner-dialog',
    templateUrl: 'spinner-dialog.component.html',
    styles: [`
        .t  { display: table; }
        .tr { display: table-row; }
        .td { display: table-cell; }
        
        .full-height { height: 100%; }
        .full-width  { width:  100%; }
        
        .vertical-center { vertical-align: middle; }
        
        .padded { 
            padding-top: 0.4em;
            padding-bottom: 0.4em; 
        }
        
        .not-rendered {
            padding: 0;
            margin:  0;
            
            min-height: 0;
            max-height: 0;
            height:     0;
        }
        
    `]
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