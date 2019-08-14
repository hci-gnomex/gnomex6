import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExperimentsService} from "./experiments.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";
import {first} from "rxjs/operators";
import {ConstantsService} from "../services/constants.service";
import {LabListService} from "../services/lab-list.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";

@Component({
    selector: "create-project-component",
    template: `
        <div class="full-width full-height flex-container-col double-padded-left-right">
            <custom-combo-box class="full-width" placeholder="Lab" [options]="this.labList"
                                valueField="idLab" [displayField]="this.prefService.labDisplayField"
                                [formControl]="this.form.get('idLab')">
            </custom-combo-box>
            <mat-form-field class="full-width">
                <input matInput placeholder="Project name" [formControl]="this.form.get('name')">
                <mat-error *ngIf="this.form.get('name').hasError('required')">Project name is <strong>required</strong></mat-error>
                <mat-error *ngIf="this.form.get('name').hasError('maxlength')">
                    Project name can be at most {{this.constantsService.MAX_LENGTH_200}} characters
                </mat-error>
            </mat-form-field>
            <label for="descEditor">Project description</label>
            <angular-editor class="full-width" #descEditorRef id="descEditor"
                            [formControl]="this.form.get('description')"
                            [config]="descEditorConfig">
            </angular-editor>
            <mat-error *ngIf="this.form.get('description').hasError('maxlength')">
                Project description can be at most {{this.constantsService.MAX_LENGTH_4000}}
                characters
                including HTML code formatting and styles. Character count: {{this.form.get(
                    'description').value.toString().length}}
            </mat-error>
        </div>
    `,
    styles: [`

        :host /deep/ angular-editor#descEditor #editor {
            resize: none;
        }

        :host /deep/ angular-editor#descEditor .angular-editor-button[title="Insert Image"],
        :host /deep/ angular-editor#descEditor .angular-editor-button[title="Unlink"],
        :host /deep/ angular-editor#descEditor .angular-editor-button[title="Horizontal Line"],
        :host /deep/ angular-editor#descEditor #strikeThrough-descEditor,
        :host /deep/ angular-editor#descEditor #subscript-descEditor,
        :host /deep/ angular-editor#descEditor #superscript-descEditor,
        :host /deep/ angular-editor#descEditor #link-descEditor,
        :host /deep/ angular-editor#descEditor #underline-descEditor,
        :host /deep/ angular-editor#descEditor #justifyLeft-descEditor,
        :host /deep/ angular-editor#descEditor #justifyCenter-descEditor,
        :host /deep/ angular-editor#descEditor #justifyRight-descEditor,
        :host /deep/ angular-editor#descEditor #justifyFull-descEditor,
        :host /deep/ angular-editor#descEditor #foregroundColorPicker-descEditor,
        :host /deep/ angular-editor#descEditor #backgroundColorPicker-descEditor,
        :host /deep/ angular-editor#descEditor #toggleEditorMode-descEditor,
        :host /deep/ angular-editor#descEditor #customClassSelector-descEditor {
            display: none;
        }
    `]
})

export class CreateProjectComponent extends BaseGenericContainerDialog implements OnInit {
    public isEditMode: boolean = false;
    public form: FormGroup;
    public primaryDisable: (action?: GDAction) => boolean;
    public labList: any[] = [];
    public newProjectId: string = "";
    @ViewChild("descEditorRef") descEditor: AngularEditorComponent;
    descEditorConfig: AngularEditorConfig = {
        height: "20em",
        minHeight: "5em",
        maxHeight: "20em",
        width: "100%",
        minWidth: "5em",
        editable: true,
        defaultFontName: "Arial",
        defaultFontSize: "2",
    };

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
        super();
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            idLab: ["", [Validators.required]],
            name: ["", [Validators.required, Validators.maxLength(this.constantsService.MAX_LENGTH_200)]],
            description: ["", [Validators.maxLength(this.constantsService.MAX_LENGTH_4000)]],
        });

        if (this.data) {
            if (this.data.idProject) {
                this.isEditMode = true;
                this.idProject = this.data.idProject;
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
            if(this.data.disableLab) {
                this.form.get("idLab").disable();
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
            }, (err: IGnomexErrorResponse) => {
            });
        }

        this.primaryDisable = (action) => {
            return this.form.invalid;
        };
    }

    public cancel(): void {
        this.dialogRef.close();
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
            }, (err: IGnomexErrorResponse) => {
            });
        }
    }

    private saveProject() {
        this.dialogsService.startDefaultSpinnerDialog();

        this.project.name = this.form.get("name").value;
        this.project.description = this.form.get("description").value;
        let params: HttpParams = new HttpParams()
            .set("projectJSONString", JSON.stringify(this.project))
            .set("noJSONToXMLConversionNeeded", "Y")
            .set("parseEntries", "Y");
        this.experimentsService.saveProject(params).pipe(first()).subscribe((response: any) => {
            this.dialogsService.stopAllSpinnerDialogs();
            this.newProjectId = response.idProject;
            if (this.items.length > 0) {
                this.experimentsService.refreshProjectRequestList_fromBackend();
            }
            this.dialogRef.close(this.newProjectId);
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

}

