import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {AnalysisService} from "../services/analysis.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserPreferencesService} from "../services/user-preferences.service";
import {ConstantsService} from "../services/constants.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {first} from "rxjs/operators";
import {DialogsService} from "../util/popup/dialogs.service";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";

@Component({
    selector: "create-analysis-group-dialog",
    templateUrl: "create-analysis-group-dialog.html",
    styles: [`
        .inlineComboBox {
            display: inline-block;
        }
        div.inlineDiv {
            display: inline-block;
            margin: 0.3rem 0.8rem 0.3rem 0.8rem;
        }
        .full-width {
            width: 100%;
        }
        .label-width {
            width: 10em;
        }

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

export class CreateAnalysisGroupComponent extends BaseGenericContainerDialog implements OnInit, AfterViewInit {
    @ViewChild("descEditorRef") descEditor: AngularEditorComponent;

    public createAnalysisGroupForm: FormGroup;
    public labList: any[];
    public primaryDisable: (action?: GDAction) => boolean;
    public newAnalysisGroupId: string = "";

    editorConfig: AngularEditorConfig = {
        height: "20em",
        minHeight: "5em",
        maxHeight: "20em",
        width: "100%",
        minWidth: "5em",
        enableToolbar: true,
        defaultFontName: "Arial",
        defaultFontSize: "2",
        showToolbar: true,
        editable: true
    };
    private readonly selectedLab: any;
    private idLabString: string;

    public labDisplayField: string = this.prefService.labDisplayField;



    constructor(private dialogRef: MatDialogRef<CreateAnalysisGroupComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private analysisService: AnalysisService,
                private formBuilder: FormBuilder,
                public constantsService: ConstantsService,
                private dialogsService: DialogsService,
                private changeDetectorRef: ChangeDetectorRef,
                public prefService: UserPreferencesService) {

        super();
        this.labList = data.labList;
        if (this.labList && this.labList.length) {
            if (!this.labList[0][this.labDisplayField]) {
                this.labDisplayField = "labName";
            }
        }
        this.selectedLab = data.selectedLab;
    }

    ngOnInit() {
        this.createAnalysisGroupForm = this.formBuilder.group({
            selectedLab: ["", [Validators.required]],
            analysisGroupName: ["", [Validators.required,
                                     Validators.maxLength(this.constantsService.MAX_LENGTH_500)]],
            description: ["", [Validators.maxLength(this.constantsService.MAX_LENGTH_500)]],
        });
        this.createAnalysisGroupForm.markAsPristine();
        this.primaryDisable = (action) => {
            return this.createAnalysisGroupForm.invalid;
        };

    }

    ngAfterViewInit() {
        if(this.selectedLab) {
            this.createAnalysisGroupForm.get("selectedLab").setValue(this.selectedLab);
            this.onLabSelect(this.selectedLab);
        }

        this.changeDetectorRef.detectChanges();

    }

    onLabSelect(event: any) {
        if (event) {
            this.idLabString = event;
        }
    }

    /**
     * Save a new analysis group.
     */
    createAnalysisGroup() {
        let analysisGroupName = this.createAnalysisGroupForm.get("analysisGroupName").value.trim();
        if(!analysisGroupName) {
            this.dialogsService.alert("Please enter a valid name", "Invalid");
            this.createAnalysisGroupForm.get("analysisGroupName").setErrors(Validators.required);
            this.changeDetectorRef.detectChanges();
            return;
        }

        this.dialogsService.startDefaultSpinnerDialog();

        let idAnalysisGroup: any = 0;
        let analysisGroupDescription = this.createAnalysisGroupForm.get("description").value;
        let params: HttpParams = new HttpParams()
            .set("idLab", this.idLabString)
            .set("idAnalysisGroup", idAnalysisGroup)
            .set("name", analysisGroupName)
            .set("description", analysisGroupDescription);

        this.analysisService.saveAnalysisGroup(params).pipe(first()).subscribe(response => {
            if(response && response.idAnalysisGroup) {
                this.newAnalysisGroupId = response.idAnalysisGroup;
                this.dialogRef.close(this.newAnalysisGroupId);
                setTimeout(() => {
                    this.analysisService.refreshAnalysisGroupList_fromBackend();
                    this.dialogsService.stopAllSpinnerDialogs();
                });
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });

    }

    cancel() {
        this.dialogRef.close();
    }
}

