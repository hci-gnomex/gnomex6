import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: "yes-no-dialog",
    templateUrl: "yes-no-dialog.component.html",
    styles: [`
        .full-width  { width:  100%; } 
        .full-height { height: 100%; } 
        
        .centered-text { text-align: center; }
    `]
}) export class YesNoDialogComponent {

    public title: string = '';
    public message: string = '';
    public parent: any = null;
    public onYesFunctionName: string = '';
    public onNoFunctionName: string = '';
    public lines: string[] = null;

    constructor(public dialogRef: MatDialogRef<YesNoDialogComponent>) { }

    onClickYes(): void {
        if (this.parent && this.onYesFunctionName && this.onYesFunctionName !== '') {
            this.parent[this.onYesFunctionName]();
        }

        this.dialogRef.close(true);
    }

    onClickNo(): void {
        if (this.parent && this.onNoFunctionName && this.onNoFunctionName !== '') {
            this.parent[this.onNoFunctionName]();
        }

        this.dialogRef.close(false);
    }
}