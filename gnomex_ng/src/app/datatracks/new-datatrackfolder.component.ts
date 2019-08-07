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
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: 'new-datatrack-folder',
    template: `
        <form [formGroup]="this.form" class="full-height full-width flex-container-col double-padded-left-right">
            <div class="dialogDiv">
                <mat-form-field class="full-width">
                    <input matInput formControlName="name" placeholder="Folder Name">
                </mat-form-field>
            </div>
            <div class="dialogDiv">
                <custom-combo-box class="full-width" placeholder="Lab" [options]="this.labList"
                                  valueField="idLab" [displayField]="this.prefService.labDisplayField"
                                  [formControl]="this.form.get('idLab')">
                </custom-combo-box>
            </div>
        </form>
    `,
})

export class NewDataTrackFolderComponent extends BaseGenericContainerDialog implements OnInit {

    public label: string = "";
    public form: FormGroup;
    public labList: any[] = [];
    public primaryDisable: (action?: GDAction) => boolean;

    private selectedItem: ITreeNode;

    constructor(public dialogRef: MatDialogRef<NewDataTrackFolderComponent>,
                private dataTrackService: DataTrackService,
                private dialogsService: DialogsService,
                private labListService: LabListService,
                public prefService: UserPreferencesService,
                public constantsService: ConstantsService,
                private formBuilder: FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
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

        this.primaryDisable = () => {
            return this.form.invalid;
        };
    }

    public save(): void {
        this.dialogsService.addSpinnerWorkItem();
        let params: HttpParams = new HttpParams()
            .set("idLab", this.form.get("idLab").value)
            .set("idGenomeBuild", this.selectedItem.data.idGenomeBuild)
            .set("name", this.form.get("name").value);
        if (this.selectedItem.data.idDataTrackFolder) {
            params = params.set("idParentDataTrackFolder", this.selectedItem.data.idDataTrackFolder)
        }

        this.dataTrackService.saveDataTrackFolder(params).subscribe((response: any) => {
            if (response.idDataTrackFolder) {
                this.dialogsService.removeSpinnerWorkItem();
                this.dialogRef.close(response.idDataTrackFolder);
            } else {
                this.dialogsService.stopAllSpinnerDialogs();
            }
        },(err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

}
