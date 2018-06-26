import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Component, Inject, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';

@Component({
    selector: 'confirm-dialog',
    templateUrl: 'custom-dialog.component.html'
})

export class CustomDialogComponent {
    public title: string;
    private tempRef:TemplateRef<any>;
    @ViewChild('anchor', { read: ViewContainerRef }) _vcr;


    constructor(public dialogRef: MatDialogRef<CustomDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        this.title = data.title;
        this.tempRef = data.templateRef;
    }

    ngOnInit(){
        this._vcr.createEmbeddedView(this.tempRef);
    }





}
