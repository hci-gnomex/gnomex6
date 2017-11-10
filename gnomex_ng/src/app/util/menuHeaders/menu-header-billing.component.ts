import {Component, Input, OnInit} from '@angular/core';
import {MatDialogRef, MatDialog} from '@angular/material';

import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {BillingUsageReportComponent} from "../billing-usage-report.component";

@Component({
    selector: 'menu-header-billing',
    templateUrl: "./menu-header-billing.component.html"
})

export class MenuHeaderBillingComponent implements OnInit {
    private _showMenuBilling: boolean = false;
    public get showMenuBilling(): boolean {
        return this._showMenuBilling;
    }

    @Input() private idBillingPeriodString: string = "";
    @Input() private idCoreFacilityString: string = "";
    @Input() private isDirty: boolean = false;
    @Input() private selectedItem: any = null;

    constructor(private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        let isAdminState: boolean = this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin;
        let isBillingAdminState: boolean = this.createSecurityAdvisorService.isBillingAdmin;

        if (isAdminState || isBillingAdminState) {
            this._showMenuBilling = true;
        }
    }

    public showGeneralLedgerInterface(): void {
        // TODO
    }

    public showBillingInvoice(sendEmail: boolean): void {
        // TODO
        if (this.idBillingPeriodString === "") {
            // TODO Alert.show("Please select a billing period");
            return;
        }
        if (this.isDirty) {
            // TODO Alert.show("Please save or discard unsaved changes");
            return;
        }
        if (this.selectedItem === null) {
            // TODO Alert.show("Please select a lab folder");
            return;
        }
    }

    public showInvoiceReport(): void {
        // TODO
    }

    public showMonthendBillingReport(): void {
        // TODO
    }

    public showBillingByLabReport(): void {
        let dialogRef: MatDialogRef<BillingUsageReportComponent> = this.dialog.open(BillingUsageReportComponent, {
            data: {
                mode: "Total Billing by Lab",
                idCoreFacility: this.idCoreFacilityString
            }
        });
    }

    public showUsageReport(): void {
        let dialogRef: MatDialogRef<BillingUsageReportComponent> = this.dialog.open(BillingUsageReportComponent, {
            data: {
                mode: "Lab Usage",
                idCoreFacility: this.idCoreFacilityString
            }
        });
    }

    public showNotesToCore(): void {
        // TODO
    }

}
