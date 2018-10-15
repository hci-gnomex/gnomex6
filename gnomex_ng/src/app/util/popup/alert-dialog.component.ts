import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: "alert-dialog",
    templateUrl: "alert-dialog.component.html",
    styles: [`
        .full-width  { width:  100%; } 
        .full-height { height: 100%; } 
        
        .centered-text { text-align: center; }
    `]
}) export class AlertDialogComponent {

    public message: string = '';
    public title: string = '';

    constructor(public dialogRef: MatDialogRef<AlertDialogComponent>) { }

    onClickYes(): void {
        this.dialogRef.close(true);
    }
}