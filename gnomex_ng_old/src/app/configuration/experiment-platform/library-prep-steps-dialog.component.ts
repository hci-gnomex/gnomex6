import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ProtocolService} from "../../services/protocol.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";



@Component({
    template: `
        <form [formGroup]="formGroup">
            <div class="flex-container-col full-width full-height">
                <div class="flex-container-row" style="margin: 0.5em;">
                    <div class="flex-grow flex-container-col" style="margin-right: 0.5em; max-width: 100%; width: 100%;">
                        <label class="gx-label" style="margin-bottom:0.5em;" for="coreStepsId" > Core Steps </label>
                        <angular-editor #csEditorRef id="coreStepsId" formControlName="coreSteps" [config]="this.editorConfig">
                        </angular-editor>
                        <mat-error *ngIf="this.formGroup.get('coreSteps').hasError('maxlength')">
                            Core Steps can be at maximum of {{this.constService.MAX_LENGTH_5000}} characters.
                            Character count: {{this.formGroup.get('coreSteps').value.toString().length}}
                        </mat-error>
                    </div>
                    <div class="flex-grow flex-container-col" style="max-width: 100%; width: 100%;">

                        <label class="gx-label" style="margin-bottom:0.5em;" for="labStepsLabel" > Core Steps(No Lib Prep) </label>

                        <angular-editor   #csNoLibPrepEditorRef id="coreStepsNoLibPrepId" formControlName="coreStepsNoLibPrep" [config]="this.editorConfigNoPrep">
                        </angular-editor>
                        <mat-error *ngIf="this.formGroup.get('coreStepsNoLibPrep').hasError('maxlength')">
                            Core Steps(No Lib Prep) can be at maximum of {{this.constService.MAX_LENGTH_5000}} characters.
                            Character count: {{this.formGroup.get('coreStepsNoLibPrep').value.toString().length}}
                        </mat-error>

                    </div>

                </div>
            </div>
        </form>
    `,
    styles: [`
        :host /deep/ angular-editor #editor {
            resize: none;
        }
        :host /deep/ angular-editor .angular-editor-button[title="Insert Image"] {
            display: none;
        }
    `]
})
export class LibraryPrepStepsDialogComponent extends BaseGenericContainerDialog implements OnInit{

    applyStepsFn:any;
    formGroup:FormGroup;
    rowData:any;
    @ViewChild("csEditorRef") csEditor: AngularEditorComponent;
    @ViewChild("csNoLibPrepEditorRef") csNoPrepEditor: AngularEditorComponent;
    public editorConfig: AngularEditorConfig;
    public editorConfigNoPrep: AngularEditorConfig;



    constructor(private dialogRef: MatDialogRef<LibraryPrepStepsDialogComponent>,
                public constService:ConstantsService, private fb: FormBuilder,
                private expPlatformService: ExperimentPlatformService,
                private dictionaryService: DictionaryService,
                private protocolService:ProtocolService,
                private dialogService:DialogsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        super();
        if (this.data) {
            this.rowData = this.data.rowData;
            this.applyStepsFn = this.data.applyStepsFn;
        }
    }

    ngOnInit(){

        this.editorConfig = {
            spellcheck: true,
            height: "15em",
            minHeight: "10em",
            maxHeight: "15em",
            width: "32em",
            enableToolbar: true,
            placeholder: "Core Steps",
            editable: true
        };
        this.editorConfigNoPrep = {
            spellcheck: true,
            height: "15em",
            minHeight: "10em",
            maxHeight: "15em",
            width: "32em",
            enableToolbar: true,
            placeholder: "Core Steps(No Lib Prep)",
            editable: true
        };

        this.formGroup = this.fb.group({
                coreSteps:['', Validators.maxLength(this.constService.MAX_LENGTH_5000)],
                coreStepsNoLibPrep: ['', Validators.maxLength(this.constService.MAX_LENGTH_5000)]
            }
        );
        this.formGroup.get("coreSteps").setValue( this.rowData.coreSteps ? this.rowData.coreSteps : '');
        this.formGroup.get("coreStepsNoLibPrep").setValue( this.rowData.coreStepsNoLibPrep ? this.rowData.coreStepsNoLibPrep : '');

        this.primaryDisable = (action) => {return this.formGroup.invalid || !this.formGroup.dirty; }
        this.dirty = () => {return this.formGroup.dirty; };
    }
    applyChanges(){
        this.applyStepsFn(this.formGroup.get("coreSteps").value, this.formGroup.get("coreStepsNoLibPrep").value);
        this.dialogRef.close();
    }

}
