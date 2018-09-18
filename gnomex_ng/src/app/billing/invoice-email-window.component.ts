import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material";
import {BillingService} from "../services/billing.service";
import {FormControl, Validators} from "@angular/forms";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {ConstantsService} from "../services/constants.service";
import {HttpParams} from "@angular/common/http";

@Component({
    selector: 'invoice-email-window',
    template: `
        <h6 mat-dialog-title>Email Invoice</h6>
        <mat-dialog-content>
            <div class="email-address-box">
                <mat-form-field class="full-width">
                    <textarea matInput placeholder="Email Address(es)" [formControl]="this.addressFC"
                          matTextareaAutosize matAutosizeMinRows="3" matAutosizeMaxRows="3"></textarea>
                </mat-form-field>
                <label>*Please separate multiple email addresses with a comma</label>
            </div>
            <div *ngIf="this.emailSent" class="email-sent-box">
                <div>
                    <label class="underline" *ngIf="this.controllerResponse?.note">Email Sent</label>
                </div>
                <div>
                    <label>{{this.controllerResponse?.title}}</label>
                </div>
                <div>
                    <label *ngIf="this.controllerResponse?.note">({{this.controllerResponse?.note}})</label>
                </div>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button color="primary" [disabled]="this.addressFC.invalid || this.showError || this.emailSent" (click)="this.send()"><img src="../../assets/email_go.png" class="icon">Send</button>
            <button mat-button mat-dialog-close>Close</button>
            <label class="error-warning" *ngIf="this.showError">***Email address(es) are malformed***</label>
        </mat-dialog-actions>
    `,
    styles: [`
        div.email-address-box {
            width: 500px;
        }
        label.error-warning {
            color: red;
        }
        .underline {
            text-decoration: underline;
        }
        div.email-sent-box {
            border: 1px solid black;
            padding: 10px;
        }
    `]
})

export class InvoiceEmailWindowComponent implements OnInit {

    public addressFC: FormControl;
    private idBillingPeriod: string;
    private labNode: ITreeNode;
    private idCoreFacility: string;

    public showError: boolean = false;
    public emailSent: boolean = false;
    public controllerResponse: any;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                private billingService: BillingService) {
    }

    ngOnInit() {
        this.idBillingPeriod = this.data.idBillingPeriod;
        this.labNode = this.data.labNode;
        this.idCoreFacility = this.data.idCoreFacility;

        this.addressFC = new FormControl(this.labNode.data.billingNotificationEmail ? this.labNode.data.billingNotificationEmail : "", Validators.required);
        this.addressFC.valueChanges.subscribe(() => {
            this.showError = false;
        });
    }

    public send(): void {
        let addressesString: string = (this.addressFC.value as string).replace(" ", "");
        let addresses: string[] = addressesString.split(",");
        if (addresses.length > 0) {
            for (let address of addresses) {
                if (!ConstantsService.emailRegex.test(address)) {
                    this.showError = true;
                    return;
                }
            }

            let params: HttpParams = new HttpParams()
                .set("idBillingPeriod", this.idBillingPeriod)
                .set("idLab", this.labNode.data.idLab)
                .set("idBillingAccount", this.labNode.data.idBillingAccount)
                .set("idCoreFacility", this.idCoreFacility)
                .set("emailAddress", addressesString);
            this.billingService.sendBillingInvoiceEmail(params).subscribe((result: any) => {
                this.emailSent = true;
                this.controllerResponse = result;
                this.addressFC.disable();
            });
        }
    }

}
