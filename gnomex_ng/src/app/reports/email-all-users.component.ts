import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {BroadcastEmailService} from "../services/broadcast-email.service";
import {HttpParams} from "@angular/common/http";
import {MatDialogRef} from "@angular/material";
import {AngularEditorConfig} from "@kolkov/angular-editor";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'email-all-users',
    templateUrl: "./email-all-users.component.html",
    styles: [`
        :host /deep/ angular-editor #editor {
            resize: none;
        }
        :host /deep/ angular-editor .angular-editor-button[title="Insert Image"] {
            display: none;
        }

        .formField {
            width: 100%;
            margin: 0.25rem 0;
        }
        mat-radio-group.radio {
            width: 100%;
            margin: 0.25rem 0;
        }
        mat-radio-button.radioOption {
            margin: 0 0.25rem;
        }
        div.formField {
            width: 100%;
            margin: 0.25rem 0;
            display: flex;
            flex-direction: row;
        }
        img.icon {
            margin-right: 0.5rem;
        }
    `]
})

export class EmailAllUsersComponent extends BaseGenericContainerDialog implements OnInit {
    public readonly SHOW_BODY: string = "b";
    public readonly SHOW_FILE_UPLOAD: string = "f";

    public formGroup: FormGroup;
    public coresFormControl: FormControl;
    public subjectFormControl: FormControl;
    public fromFormControl: FormControl;
    public bodyFormControl: FormControl;

    public coreFacilities: any[] = [];
    private uploadFile: File = null;
    public fileSize: string = "";
    public showSpinner: boolean = false;
    public editorConfig: AngularEditorConfig;

    public bodyType: string = this.SHOW_BODY;
    private uploadURL: string = null;

    constructor(private dialogRef: MatDialogRef<EmailAllUsersComponent>,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private broadcastEmailService: BroadcastEmailService) {
        super();
        this.coresFormControl = new FormControl("", Validators.required);
        this.subjectFormControl = new FormControl("", Validators.required);
        this.fromFormControl = new FormControl(this.createSecurityAdvisorService.userEmail, [Validators.required, Validators.email]);
        this.bodyFormControl = new FormControl("", Validators.required);
        this.formGroup = new FormGroup({
            cores: this.coresFormControl,
            subject: this.subjectFormControl,
            from: this.fromFormControl,
            body: this.bodyFormControl,
        });

        this.editorConfig = {
            spellcheck: true,
            height: '13rem',
            editable: true,
            enableToolbar: true,
            showToolbar: true,
        };

        this.coreFacilities = this.createSecurityAdvisorService.coreFacilitiesICanManage;

        this.broadcastEmailService.getUploadURL().subscribe((result: any) => {
            if (result && result.name && result.name === "UploadAndBroadcastEmailURLServlet") {
                this.uploadURL = result.url;
            }
        }, (err: IGnomexErrorResponse) => {});
    }

    ngOnInit(): void {
        this.primaryDisable = (action) => this.formGroup.invalid;
    }

    public fileChange(event: any): void {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.uploadFile = fileList[0];
            this.fileSize = this.uploadFile.size.toLocaleString();
            this.bodyFormControl.setValue(this.uploadFile.name);
        } else {
            this.resetFileUpload();
        }
    }

    private resetFileUpload(): void {
        this.uploadFile = null;
        this.fileSize = "";
        this.bodyFormControl.reset();
    }

    public radioChange(): void {
        this.resetFileUpload();
    }

    private handleResponse(response: any): void {
        if (response) {
            let resultWindow = window.open('', '_blank', "height=200, width=500");
            resultWindow.document.open();
            resultWindow.document.write(response);
            resultWindow.document.close();
        }
        this.showSpinner = false;
        this.dialogRef.close();
    }

    public send(): void {
        this.showSpinner = true;
        if (this.uploadFile) {
            let formData: FormData = new FormData();
            formData.append("Filename", this.uploadFile.name);
            formData.append("format", this.uploadFile.type === "text/html" ? "html" : "text");
            formData.append("subject", this.subjectFormControl.value);
            formData.append("coreFacilityIds", this.coresFormControl.value);
            formData.append("Filedata", this.uploadFile, this.uploadFile.name);
            formData.append("Upload", "Submit Query");
            formData.append("fromAddress", this.fromFormControl.value);
            this.broadcastEmailService.sendBroadcastEmailWithFile(formData).subscribe((response: any) => {
                this.handleResponse(response);
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        } else {
            let params: HttpParams = new HttpParams()
                .set("subject", this.subjectFormControl.value)
                .set("format", "html")
                .set("fromAddress", this.fromFormControl.value)
                .set("body", this.bodyFormControl.value)
                .set("coreFacilityIds", this.coresFormControl.value);
            this.broadcastEmailService.sendBroadcastEmail(params).subscribe((response: any) => {
                this.handleResponse(response);
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        }
    }

}
