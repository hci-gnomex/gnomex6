import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from "@angular/material";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ConstantsService} from "../services/constants.service";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";
import {GDAction} from "./interfaces/generic-dialog-action.model";
import {DialogsService} from "./popup/dialogs.service";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";

@Component({
    templateUrl: "./basic-email-dialog.component.html",
    styles: [`
        mat-form-field.formField {
            width: 100%;
            margin: 0.25rem 0;
        }

        :host /deep/ angular-editor#emailEditor #editor {
            resize: none;
        }

        :host /deep/ angular-editor#emailEditor .angular-editor-button[title="Insert Image"],
        :host /deep/ angular-editor#emailEditor .angular-editor-button[title="Unlink"],
        :host /deep/ angular-editor#emailEditor .angular-editor-button[title="Horizontal Line"],
        :host /deep/ angular-editor#emailEditor #strikeThrough-emailEditor,
        :host /deep/ angular-editor#emailEditor #subscript-emailEditor,
        :host /deep/ angular-editor#emailEditor #superscript-emailEditor,
        :host /deep/ angular-editor#emailEditor #link-emailEditor,
        :host /deep/ angular-editor#emailEditor #underline-emailEditor,
        :host /deep/ angular-editor#emailEditor #justifyLeft-emailEditor,
        :host /deep/ angular-editor#emailEditor #justifyCenter-emailEditor,
        :host /deep/ angular-editor#emailEditor #justifyRight-emailEditor,
        :host /deep/ angular-editor#emailEditor #justifyFull-emailEditor,
        :host /deep/ angular-editor#emailEditor #foregroundColorPicker-emailEditor,
        :host /deep/ angular-editor#emailEditor #backgroundColorPicker-emailEditor,
        :host /deep/ angular-editor#emailEditor #toggleEditorMode-emailEditor,
        :host /deep/ angular-editor#emailEditor #customClassSelector-emailEditor {
            display: none;
        }
    `]
})
export class BasicEmailDialogComponent extends BaseGenericContainerDialog implements OnInit {

    @ViewChild("emailEditorRef") emailEditor: AngularEditorComponent;

    public emailGroup: FormGroup;
    public subjectText: string = "";
    public primaryDisable: (action?: GDAction) => boolean;
    emailEditorConfig: AngularEditorConfig = {
        height: "12em",
        minHeight: "5em",
        maxHeight: "12em",
        width: "100%",
        minWidth: "5em",
        editable: true,
        defaultFontName: "Arial",
        defaultFontSize: "2",
    };
    private readonly action: string = "";
    private readonly parentComponent: string = "";


    constructor(private dialogRef: MatDialogRef<BasicEmailDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private fb: FormBuilder,
                private secAdvisor: CreateSecurityAdvisorService,
                public constService: ConstantsService,
                private dialogsService: DialogsService,
                private snackBar: MatSnackBar) {
        super();
        this.parentComponent = data.parentComponent;
        this.subjectText = data.subjectText;
        this.action = data.action;

    }

    ngOnInit() {
        this.emailGroup = this.fb.group({
            subject: ["", Validators.required],
            fromAddress: [this.secAdvisor.userEmail, [Validators.required, Validators.email]],
            body: ["", Validators.required],

        });

        if(this.parentComponent && this.parentComponent === "Experiment") {
            this.emailGroup.get("subject").setValue(this.subjectText);
            this.emailGroup.get("subject").disable();
        }

        this.emailGroup.markAsPristine();
        this.primaryDisable = (action) => {
            return this.emailGroup.invalid;
        };

    }

    public send() {
        if(this.emailGroup) {
            this.dialogsService.startDefaultSpinnerDialog();
            let emailData: any = {value: {}};
            emailData.value.subject = this.emailGroup.get("subject").value;
            emailData.value.fromAddress = this.emailGroup.get("fromAddress").value;
            emailData.value.body = this.emailGroup.get("body").value;
            this.data.saveFn(emailData.value).subscribe((success: boolean) => {
                this.dialogsService.stopAllSpinnerDialogs();
                if (success) {
                    this.dialogRef.close();
                    this.snackBar.open("Email successfully sent", this.action, {
                        duration: 2000
                    });
                }
            }, () => {
                this.dialogsService.stopAllSpinnerDialogs();
            });
        }

    }

}
