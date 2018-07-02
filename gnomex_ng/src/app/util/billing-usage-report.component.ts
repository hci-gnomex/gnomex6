import {Component, Inject} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {BillingPeriod} from "./billing-period-selector.component";

@Component({
    selector: 'billing-usage-report',
    templateUrl: "./billing-usage-report.component.html",
    styles: [`
        .margin-right {
            margin-right: 1em;
        }
    `]
})

export class BillingUsageReportComponent {
    readonly MODE_TOTAL_BILLING_BY_LAB: string = "Total Billing by Lab";
    readonly MODE_LAB_USAGE: string = "Lab Usage";

    public showIsExternalRadioGroup: boolean = false;
    public title:string = "";
    private mode:string = "";
    private idCoreFacilityString:string = "";

    public startDate: string = "";
    public endDate: string = "";
    public isExternalString: string = "N";

    constructor(public dialogRef: MatDialogRef<BillingUsageReportComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                @Inject(DOCUMENT) private document: Document) {
        this.mode = data.mode;
        if (this.mode === this.MODE_LAB_USAGE) {
            this.showIsExternalRadioGroup = true;
        }
        this.idCoreFacilityString = data.idCoreFacility;
        this.title = this.mode + " Report for Bioinformatics";
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
