import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {DataTrackService} from "../services/data-track.service";
import {LabListService} from "../services/lab-list.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DictionaryService} from "../services/dictionary.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {ConstantsService} from "../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: 'new-datatrack-folder',
    template: `
        <form [formGroup]="this.form" class="full-width full-height flex-container-col double-padded-left-right">
            <div class="dialogDiv">
                <mat-form-field class="full-width">
                    <input matInput formControlName="name" placeholder="Name">
                </mat-form-field>
            </div>
            <div class="dialogDiv">
                <custom-combo-box class="full-width" placeholder="Lab" [options]="this.labList"
                                  valueField="idLab" [displayField]="this.prefService.labDisplayField"
                                  [formControl]="this.form.get('idLab')">
                </custom-combo-box>
            </div>
            <div class="dialogDiv">
                <custom-combo-box class="full-width" placeholder="Visibility" [options]="this.visibilityList"
                                  valueField="value" displayField="display"
                                  [formControl]="this.form.get('codeVisibility')">
                </custom-combo-box>
            </div>
        </form>
    `,
})

export class NewDataTrackComponent extends BaseGenericContainerDialog implements OnInit {
    private selectedItem: ITreeNode;

    public folder: string = "";
    public form: FormGroup;
    public visibilityList: any[] = [];
    public labList: any[] = [];
    public showSpinner: boolean = false;
    public primaryDisable: (action?: GDAction) => boolean;

    constructor(public dialogRef: MatDialogRef<NewDataTrackComponent>,
                public constantsService: ConstantsService,
                private dataTrackService: DataTrackService,
                private labListService: LabListService,
                private dictionaryService: DictionaryService,
                private dialogsService: DialogsService,
                public prefService: UserPreferencesService,
                private formBuilder: FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            name: ["", [Validators.required, Validators.maxLength(2000)]],
            idLab: ["", Validators.required],
            codeVisibility: ["", Validators.required]
        });

        this.selectedItem = this.data.selectedItem;
        this.folder = this.selectedItem.data.label;
        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response.sort(this.prefService.createLabDisplaySortFunction());
        });
        this.visibilityList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.VISIBILITY).filter((vis: any) => {
            return vis.value !== "INST";
        });

        this.primaryDisable = (action) => {
            return this.form.invalid;
        };
    }

    public save(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("idLab", this.form.get("idLab").value)
            .set("idGenomeBuild", this.selectedItem.data.idGenomeBuild)
            .set("name", this.form.get("name").value)
            .set("codeVisibility", this.form.get("codeVisibility").value);
        if (this.selectedItem.data.idDataTrackFolder) {
            params = params.set("idDataTrackFolder", this.selectedItem.data.idDataTrackFolder);
        }

        this.dataTrackService.saveDataTrack(params).subscribe((response: any) => {
            this.showSpinner = false;
            if (response && response.result && response.result === 'SUCCESS') {
                this.dialogRef.close(response.idDataTrack);
            }
        },(err:IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

}
