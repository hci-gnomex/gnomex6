import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExperimentsService} from "./experiments.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";
import {first} from "rxjs/operators";
import {ConstantsService} from "../services/constants.service";
import {LabListService} from "../services/lab-list.service";

@Component({
    selector: "create-project-component",
    template: `
        <h6 mat-dialog-title><img [src]="this.constantsService.ICON_FOLDER_ADD" class="icon">{{this.isEditMode ? 'Edit' : 'New'}} Project</h6>
        <div mat-dialog-content class="content-div">
            <custom-combo-box class="half-width" placeholder="Lab" [options]="this.labList"
                                valueField="idLab" [displayField]="this.prefService.labDisplayField"
                                [formControl]="this.form.get('idLab')">
            </custom-combo-box>
            <mat-form-field class="full-width">
                <input matInput placeholder="Project name" [formControl]="this.form.get('name')">
                <mat-error *ngIf="this.form.get('name').hasError('required')">Project name is <strong>required</strong></mat-error>
            </mat-form-field>
            <mat-form-field class="full-width">
                <textarea matInput placeholder="Project description" [formControl]="this.form.get('description')"
                          matTextareaAutosize [matAutosizeMinRows]="8" [matAutosizeMaxRows]="8"></textarea>
            </mat-form-field>
        </div>
        <mat-dialog-actions class="justify-flex-end">
            <mat-spinner *ngIf="showSpinner" [strokeWidth]="3" [diameter]="30"></mat-spinner>
            <button mat-button [disabled]="this.form.invalid || showSpinner" (click)="this.save()">
                <img [src]="this.constantsService.ICON_SAVE" class="icon">Save
            </button>
            <button mat-button [disabled]="this.showSpinner" mat-dialog-close>Cancel</button>
        </mat-dialog-actions>
    `,
    styles: [`
        div.content-div {
            display: flex !important;
            flex-direction: column;
            width: 40em;
        }
    `]
})

export class CreateProjectComponent implements OnInit {
    public isEditMode: boolean = false;
    public form: FormGroup;
    public showSpinner: boolean = false;
    public labList: any[] = [];
    public newProjectId: string = "";

    private idProject: string = "";
    private project: any = null;
    private items: any[] = [];

    constructor(public prefService: UserPreferencesService,
                public constantsService: ConstantsService,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private dialogRef: MatDialogRef<CreateProjectComponent>,
                private experimentsService: ExperimentsService,
                private formBuilder: FormBuilder,
                private dialogsService: DialogsService,
                private labListService: LabListService) {
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            idLab: ["", [Validators.required]],
            name: ["", [Validators.required]],
            description: ["", []],
        });

        if (this.data) {
            if (this.data.idProject) {
                this.isEditMode = true;
                this.idProject = this.data.idProject;
                this.form.get("idLab").disable();
            }
            if (this.data.labList) {
                this.labList = this.data.labList.sort(this.prefService.createLabDisplaySortFunction());
            }
            if (this.data.items) {
                this.items = this.data.items;
            }
            if (this.data.selectedLabItem) {
                this.form.get("idLab").setValue(this.data.selectedLabItem);
            }
        }

        if (this.labList.length === 0) {
            this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
                this.labList = response.sort(this.prefService.createLabDisplaySortFunction());
            });
        }

        if (this.isEditMode) {
            let params: HttpParams = new HttpParams()
                .set("idProject", this.idProject);
            this.experimentsService.getProject(params).pipe(first()).subscribe((response: any) => {
                this.project = response.Project;
                this.project.requests = [];
                this.form.get("idLab").setValue(this.project.idLab);
                this.form.get("name").setValue(this.project.name);
                this.form.get("description").setValue(this.project.description);
            }, () => {
            });
        }
    }

    public save(): void {
        if (this.isEditMode) {
            this.saveProject();
        } else {
            let params: HttpParams = new HttpParams()
                .set("idLab", this.form.get("idLab").value)
                .set("idProject", "0");
            this.experimentsService.getProject(params).pipe(first()).subscribe((response: any) => {
                this.project = response.Project;
                this.saveProject();
            }, () => {
            });
        }
    }

    private saveProject() {
        this.showSpinner = true;

        this.project.name = this.form.get("name").value;
        this.project.description = this.form.get("description").value;
        let params: HttpParams = new HttpParams()
            .set("projectXMLString", JSON.stringify(this.project))
            .set("parseEntries", "Y");
        this.experimentsService.saveProject(params).pipe(first()).subscribe((response: any) => {
            this.showSpinner = false;
            this.newProjectId = response.idProject;
            if (this.items.length > 0) {
                this.experimentsService.refreshProjectRequestList_fromBackend();
            }
            this.dialogRef.close(this.newProjectId);
        }, () => {
            this.showSpinner = false;
        });
    }

}

