import {Component, Input, OnInit} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';

import {BillingUsageReportComponent} from "../billing-usage-report.component";
import {DialogsService} from "../popup/dialogs.service";

@Component({
    selector: 'menu-header-billing',
    templateUrl: "./menu-header-billing.component.html"
})

export class MenuHeaderBillingComponent implements OnInit {

    @Input() private idBillingPeriod: string = "";
    @Input() private idCoreFacility: string = "";
    @Input() private isDirty: boolean = false;
    @Input() private selectedItem: any = null;

    constructor(private dialog: MatDialog,
                private dialogsService: DialogsService) {
    }

    ngOnInit() {
    }

    public showGeneralLedgerInterface(): void {
        // TODO
    }

    public showBillingInvoice(sendEmail: boolean): void {
        if (this.idBillingPeriod === "") {
            this.dialogsService.confirm("Please select a billing period", null);
            return;
        }
        if (this.isDirty) {
            this.dialogsService.confirm("Please save or discard unsaved changes", null);
            return;
        }
        if (this.selectedItem === null) {
            this.dialogsService.confirm("Please select a lab folder", null);
            return;
        }
        // TODO
    }

    public showInvoiceReport(): void {
        // TODO
    }

    public showMonthendBillingReport(): void {
        // TODO
    }

    public showBillingByLabReport(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            mode: "Total Billing by Lab",
            idCoreFacility: this.idCoreFacility
        };
        this.dialog.open(BillingUsageReportComponent, config);
    }

    public showUsageReport(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            mode: "Lab Usage",
            idCoreFacility: this.idCoreFacility
        };
        this.dialog.open(BillingUsageReportComponent, config);
    }

    public showNotesToCore(): void {
        // TODO
    }

}
