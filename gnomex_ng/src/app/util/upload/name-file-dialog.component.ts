

import {Component, Inject, OnInit} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";


@Component({
    template:`
        <div class="full-height full-width flex-container-col">
            <div mat-dialog-title class="padded-outer">
                <div class="dialog-header-colors padded-inner">
                    <img [src]="imgIcon"> {{this.title}}
                </div>
            </div>
            <div mat-dialog-content class="full-height" style="margin: 0; padding: 0;">
                <div style="padding:0.5em;" class="full-height full-width flex-container-col">
                    <mat-form-field >
                        <input matInput [placeholder]="placeHolder" [(ngModel)]="name">
                    </mat-form-field>
                </div>
            </div>
            <div class="padded-outer" mat-dialog-actions align="end">
                <div class="padded-inner">
                    <button mat-button color="primary" (click)="applyChanges()">
                        <img class="icon" [src]="constService.ICON_SAVE" > OK
                    </button>
                    <button mat-button mat-dialog-close color="accent" > Cancel </button>
                </div>
            </div>
            
        </div>

    `,
    styles: [`

        .padded-outer{
            margin:0;
            padding:0;
        }
        .padded-inner{
            padding:0.3em;

        }
        mat-form-field.medium-form-input{
            width: 20em;
            margin-right: 1em;
        }
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }




    `]
})
export class NameFileDialogComponent implements OnInit{

    imgIcon: string ="";
    title: string = "";
    placeHolder: string = "Folder Name";
    name: string;

    constructor(private dialogRef: MatDialogRef<NameFileDialogComponent>,
                public constService:ConstantsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (this.data) {
            this.imgIcon = this.data.imgIcon;
            this.title = this.data.title;
            this.placeHolder = this.data.placeHolder;
        }
    }

    ngOnInit(){

    }
    applyChanges(){
        this.dialogRef.close(this.name);
    }
    onCloseDialog(){
        this.dialogRef.close();
    }


}