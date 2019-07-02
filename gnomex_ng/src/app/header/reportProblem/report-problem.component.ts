import {Component, Inject} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ReportIssueService} from "../../services/report-issue.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";

@Component({
    selector: "report-problem",
    template: `
        <div class="flex-container-col full-width full-height double-padded">
            <div>
                <mat-form-field class="dialogFormField">
                    <input matInput [(ngModel)]="emailAddress" placeholder="Email Address" [formControl]="fromFormControl">
                    <mat-error *ngIf="fromFormControl.hasError('email') && emailAddress">Please enter a valid email address</mat-error>
                    <mat-hint align="end">Leave blank to submit feedback anonomously</mat-hint>
                </mat-form-field>
            </div>
            <div style="height: 15em">
                <mat-form-field class="full-width" >
                    <textarea matInput rows="7" columns="120" [(ngModel)]="feedback" name="feedback" placeholder="Enter feedback here"> </textarea>
                    <mat-hint align="end">Please enter your feedback. A member of the GNomEx help team will respond right away.</mat-hint>
                </mat-form-field>
            </div>
            <div class="padded" style="width: 100%; height: 20em; margin-bottom:.7em;border: 1px solid #333">
                <img [src]="smallImgData" />
            </div>
            <div style="font-size:.79em">
                All information will be encripted to protect health information and proprietary research data.
            </div>
        </div>
    `,
    styles: [``]
})

export class ReportProblemComponent extends BaseGenericContainerDialog {
    public emailAddress: string;
    public feedback: string;
    public smallImgData: any;
    public formGroup: FormGroup;
    public fromFormControl: FormControl;

    private uploadFile: Blob = null;
    private readonly bigImgData: any;
    private origImgData: any;
    private url: any;

    constructor(public dialogRef: MatDialogRef<ReportProblemComponent>,
                private reportIssueService: ReportIssueService,
                private dialogsService: DialogsService,
                private securityAdvisorService: CreateSecurityAdvisorService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
        this.smallImgData = data.smallImgData;
        this.bigImgData = data.bigImgData;
        this.origImgData = data.origImgData;
        this.emailAddress = this.securityAdvisorService.userEmail;
        this.fromFormControl = new FormControl(this.emailAddress, [Validators.email]);
        this.formGroup = new FormGroup({
            from: this.fromFormControl
        });

    }

    convertDataURIToBinary(dataURI): Uint8Array {
        let BASE64_MARKER = ';base64,';

        let base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        let base64 = dataURI.substring(base64Index);
        let raw = window.atob(base64);
        let rawLength = raw.length;
        let array = new Uint8Array(new ArrayBuffer(rawLength));
        let i: number;
        for(i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    }

    public send() {
        let binaryData = this.convertDataURIToBinary(this.bigImgData);
        this.uploadFile = new Blob([binaryData], {type: "image/png"});
        let formData: FormData = new FormData();

        this.reportIssueService.reportIssueServletGetURL().subscribe((response: any) => {
            let urlString = response.url.substring(0, response.url.indexOf(';'));
            this.url = urlString.substring(urlString.indexOf('gnomex')-1, urlString.length);
            formData.append("fromAddress", this.fromFormControl.value);
            if (this.feedback) {
                formData.append("body", this.feedback);
            } else {
                formData.append("body", "");
            }
            formData.append("format", "binary");
            formData.append("Filename",  "test.png");
            formData.append("IdAppUser", this.securityAdvisorService.idAppUser.toString());
            formData.append("AppUserName", this.securityAdvisorService.userName);
            formData.append("UNID", this.securityAdvisorService.uID);
            formData.append("Filedata", this.uploadFile, "testfile.png");
            setTimeout(() => this.dialogRef.close());
            this.reportIssueService.sendReportIssueEmail(this.url, formData).subscribe((response: any) => {
                this.dialogsService.confirm("Issue has been submitted. Thank you.", null);
            });
        });
    }

}


