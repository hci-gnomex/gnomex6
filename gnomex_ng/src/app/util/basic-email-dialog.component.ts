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
    styleUrls: ["./basic-email-dialog.component.scss"]
})
export class BasicEmailDialogComponent extends BaseGenericContainerDialog implements OnInit {

    @ViewChild("emailEditorRef", {static: true}) emailEditor: AngularEditorComponent;

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
