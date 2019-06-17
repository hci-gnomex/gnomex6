import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {BaseGenericContainerDialog} from "../popup/base-generic-container-dialog";


@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div style="padding:0.5em;" class="full-height full-width flex-container-col">
                <mat-form-field>
                    <input matInput [placeholder]="placeHolder" [(ngModel)]="name">
                </mat-form-field>
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
export class NameFileDialogComponent extends BaseGenericContainerDialog implements OnInit {

    placeHolder: string = "Folder Name";
    name: string;

    constructor(private dialogRef: MatDialogRef<NameFileDialogComponent>,
                public constService: ConstantsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        super();
        if (this.data) {
            this.placeHolder = this.data.placeHolder;
        }
    }

    ngOnInit(){

    }
    applyChanges(){
        this.dialogRef.close(this.name);
    }
    cancel(): void {
        this.dialogRef.close();
    }
}
