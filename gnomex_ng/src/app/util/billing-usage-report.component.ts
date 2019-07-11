import {Component, Inject} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {BillingPeriod} from "./billing-period-selector.component";
import {GDAction} from "./interfaces/generic-dialog-action.model";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";

@Component({
    selector: 'billing-usage-report',
    template: `
        <div class="flex-container-row align-center double-padded-left-right">
            <billing-period-selector (onChange)="this.onStartChange($event)" class="margin-right"></billing-period-selector>
            <label class="margin-right">through</label>
            <billing-period-selector (onChange)="this.onEndChange($event)"></billing-period-selector>
        </div>
        <div *ngIf="showIsExternalRadioGroup" class="full-width double-padded-left-right">
            <input [(ngModel)]="isExternalString" id="radioInternal" value="N" type="radio" name="isExternalRadio">
            <label for="radioInternal" class="margin-right">Internal</label>
            <input [(ngModel)]="isExternalString" id="radioExternal" value="Y" type="radio" name="isExternalRadio">
            <label for="radioExternal">External</label>
        </div>
    `,
    styles: [`
        .margin-right {
            margin-right: 1em;
        }
    `]
})

export class BillingUsageReportComponent extends BaseGenericContainerDialog {
    readonly MODE_TOTAL_BILLING_BY_LAB: string = "Total Billing by Lab";
    readonly MODE_LAB_USAGE: string = "Lab Usage";

    public showIsExternalRadioGroup: boolean = false;
    public primaryDisable: (action?: GDAction) => boolean;
    public isExternalString: string = "N";
    private readonly mode: string = "";
    private readonly idCoreFacilityString: string = "";

    private startDate: string = "";
    private endDate: string = "";


    constructor(public dialogRef: MatDialogRef<BillingUsageReportComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                @Inject(DOCUMENT) private document: Document) {
        super();
        this.mode = data.mode;
        if (this.mode === this.MODE_LAB_USAGE) {
            this.showIsExternalRadioGroup = true;
        }
        this.idCoreFacilityString = data.idCoreFacility;
        this.primaryDisable = (action) => {
            return !this.startDate || !this.endDate;
        };
    }

    public onStartChange(value: BillingPeriod): void {
        if (value && value.startDate) {
            this.startDate = value.startDate;
        } else {
            this.startDate = "";
        }
    }

    public onEndChange(value: BillingPeriod): void {
        if (value && value.startDate) {
            this.endDate = value.endDate;
        } else {
            this.endDate = "";
        }
    }

    public submit(): void {
        if (this.mode === this.MODE_TOTAL_BILLING_BY_LAB) {
            let url: string = this.document.location.href;
            url += "/ShowBillingTotalByLabReport.gx?startDate=" + this.startDate;
            url += "&endDate=" + this.endDate;
            url += "&idCoreFacility=" + this.idCoreFacilityString;
            window.open(url, "_blank");
        } else if (this.mode === this.MODE_LAB_USAGE) {
            let url: string = this.document.location.href;
            url += "/ShowBillingUsageReport.gx?startDate=" + this.startDate;
            url += "&endDate=" + this.endDate;
            url += "&isExternal=" + this.isExternalString;
            url += "&idCoreFacility=" + this.idCoreFacilityString;
            window.open(url, "_blank");
        }
        this.dialogRef.close();
    }

}
