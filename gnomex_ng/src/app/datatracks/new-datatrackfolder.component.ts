import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {DataTrackService} from "../services/data-track.service";
import {LabListService} from "../services/lab-list.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {UserPreferencesService} from "../services/user-preferences.service";
import {ConstantsService} from "../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'new-datatrack-folder',
    template: `
        <h6 mat-dialog-title><img class="icon" [src]="this.constantsService.ICON_FOLDER_GROUP">Add new data track folder to {{label}}</h6>
        <mat-dialog-content>
            <form [formGroup]="this.form">
                <div class="dialogDiv">
                    <mat-form-field class="full-width">
                        <input matInput formControlName="name" placeholder="Folder Name">
                    </mat-form-field>
                </div>
                <div class="dialogDiv">
                    <lazy-loaded-select class="full-width" placeholder="Lab" [options]="this.labList"
                                        valueField="idLab" [displayField]="this.prefService.labDisplayField" [allowNone]="true"
                                        [control]="this.form.get('idLab')">
                    </lazy-loaded-select>
                </div>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions class="justify-flex-end">
            <button mat-button *ngIf="!showSpinner" [disabled]="this.form.invalid" (click)="save()">Save</button>
            <button mat-button *ngIf="!showSpinner" mat-dialog-close>Cancel</button>
            <mat-spinner *ngIf="showSpinner" strokeWidth="3" [diameter]="30"></mat-spinner>
        </mat-dialog-actions>
    `,
})

export class NewDataTrackFolderComponent implements OnInit {

    public label: string = "";
    public form: FormGroup;
    public labList: any[] = [];
    public showSpinner: boolean = false;

    private selectedItem: ITreeNode;

    constructor(public dialogRef: MatDialogRef<NewDataTrackFolderComponent>,
                private dataTrackService: DataTrackService,
                private dialogsService: DialogsService,
                private labListService: LabListService,
                public prefService: UserPreferencesService,
                public constantsService: ConstantsService,
                private formBuilder: FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data: any) {
    }

    ngOnInit(): void {
        this.selectedItem = this.data.selectedItem;
        this.label = this.selectedItem.data.label;
        this.form = this.formBuilder.group({
            name: ["", [Validators.required, Validators.maxLength(2000)]],
            idLab: ["", Validators.required],
        });
        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response.sort(this.prefService.createLabDisplaySortFunction());
        });
    }

    public save(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("idLab", this.form.get("idLab").value)
            .set("idGenomeBuild", this.selectedItem.data.idGenomeBuild)
            .set("name", this.form.get("name").value);
        if (this.selectedItem.data.idDataTrackFolder) {
            params = params.set("idParentDataTrackFolder", this.selectedItem.data.idDataTrackFolder)
        }

        this.dataTrackService.saveDataTrackFolder(params).subscribe((response: any) => {
            this.showSpinner = false;
            this.dialogRef.close(response.idDataTrackFolder);

        },(err: IGnomexErrorResponse) => {
            this.showSpinner = false;
            this.dialogService.alert(err.gError.message);
        });
    }

}
