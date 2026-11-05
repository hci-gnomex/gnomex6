import {Component, Inject} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ReportIssueService} from "../../services/report-issue.service";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {UtilService} from "../../services/util.service";

@Component({
    selector: "report-problem",
    template: `
        <div class="report-problem flex-container-col full-width full-height double-padded" role="dialog" aria-label="Report a Problem">
            <div class="keep-size">
                <mat-form-field class="dialogFormField">
                    <input matInput [(ngModel)]="emailAddress" placeholder="Email Address" aria-label="Email address" [formControl]="fromFormControl" aria-describedby="emailHint">
                    <mat-error *ngIf="fromFormControl.hasError('email') && emailAddress">Please enter a valid email address</mat-error>
                    <mat-hint id="emailHint" align="end">Leave blank to submit feedback anonymously</mat-hint>
                </mat-form-field>
            </div>
            <div class="keep-size" style="height: 15em">
                <mat-form-field class="full-width" >
                    <textarea matInput rows="7" columns="120" [(ngModel)]="feedback" name="feedback" placeholder="Enter feedback here" aria-label="Feedback" aria-describedby="feedbackHint"> </textarea>
                    <mat-hint id="feedbackHint" align="end">Please enter your feedback. A member of the GNomEx help team will respond right away.</mat-hint>
                </mat-form-field>
            </div>
            <div class="screenshot">
                <img [src]="smallImgData" alt="Screenshot of the reported issue" />
            </div>
            <div class="keep-size" style="font-size:.79em" aria-live="polite">
                All information will be encrypted to protect health information and proprietary research data.
            </div>
        </div>
    `,
    styles: [`
        /* Leave room for the dialog's title bar and Send/Cancel footer so they stay on screen.
           The screenshot shrinks first; on very short windows the form scrolls. */
        .report-problem {
            box-sizing: border-box;
            max-height: calc(100vh - 12em);
            overflow-y: auto;
        }
        .keep-size {
            flex: none;
        }
        .screenshot {
            box-sizing: border-box;
            flex: 1 1 20em;
            min-height: 6em;
            max-height: 20em;
            width: 100%;
            margin-bottom: .7em;
            border: 1px solid #333;
            position: relative;
        }
        /* Absolutely positioned so it scales to whatever height the box ends up with. */
        .screenshot img {
            position: absolute;
            top: 0;
            left: 0;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            padding: .3em;
            object-fit: contain;
            object-position: left top;
        }
    `]
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
            if(response && response.url) {
                this.url = UtilService.getUrlString(response.url);

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
                this.dialogsService.alert("Issue has been submitted. Thank you.", null, DialogType.SUCCESS);
                }, (err: IGnomexErrorResponse) => {
            });
            }
        }, (err: IGnomexErrorResponse) => {
        });
    }

}


