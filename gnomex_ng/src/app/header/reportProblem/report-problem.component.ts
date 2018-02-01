import {Component, Inject, ViewChild, ElementRef} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import {ReportIssueService} from "../../services/report-issue.service";
import {DialogsService} from "../../util/popup/dialogs.service";

@Component({
    selector: 'report-problem',
    templateUrl: "./report-problem.component.html",
    styles: [`
        .full-width {
            width: 100%;
        }
    `]
})

export class ReportProblemComponent {
    private emailAddress: string;
    private feedback: string;

    private uploadFile: Blob = null;

    private smallImgData: any;
    private bigImgData: any;
    private origImgData: any;
    private url: any;
    public formGroup: FormGroup;

    public fromFormControl: FormControl;

    constructor(public dialogRef: MatDialogRef<ReportProblemComponent>,
                private reportIssueService: ReportIssueService,
                private dialogsService: DialogsService,
                private securityAdvisorService: CreateSecurityAdvisorService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
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
            setTimeout(() =>this.dialogRef.close());
            this.reportIssueService.sendReportIssueEmail(this.url, formData).subscribe((response: any) => {
                this.dialogsService.confirm("Issue has been submitted. Thank you.", null);
            });
        });
    }

}


