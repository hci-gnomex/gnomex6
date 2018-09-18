import {Component, Input, OnInit} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';

import {BillingUsageReportComponent} from "../billing-usage-report.component";
import {DialogsService} from "../popup/dialogs.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {InvoiceEmailWindowComponent} from "../../billing/invoice-email-window.component";
import {BillingGlInterfaceViewComponent} from "../../billing/billing-gl-interface-view.component";

@Component({
    selector: 'menu-header-billing',
    templateUrl: "./menu-header-billing.component.html"
})

export class MenuHeaderBillingComponent implements OnInit {

    @Input() private idBillingPeriod: string = "";
    @Input() private idCoreFacility: string = "";
    @Input() private isDirty: boolean = false;
    @Input() private selectedItem: ITreeNode = null;
    @Input() private filterByOrderType: string;
    @Input() private showRelatedCharges: boolean;
    @Input() private totalPrice: number;
    @Input() private billingPeriodString: string;

    constructor(private dialog: MatDialog,
                private dialogsService: DialogsService) {
    }

    ngOnInit() {
    }

    public showGeneralLedgerInterface(): void {
        if (this.filterByOrderType && this.filterByOrderType !== "All") {
            this.dialogsService.confirm("Please select 'Show All' for Billing Items before running the GL interface", null);
            return;
        }
        if (!this.idBillingPeriod) {
            this.dialogsService.confirm("Please select a billing period", null);
            return;
        }
        if (this.showRelatedCharges) {
            this.dialogsService.confirm("Please hide Related Charges before running the GL interface", null);
            return;
        }
        if (!this.selectedItem || this.selectedItem.data.name !== "Status" || this.selectedItem.data.status !== "APPROVED") {
            this.dialogsService.confirm("Please select the approved folder before running the GL interface", null);
            return;
        }

        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            totalPrice: this.totalPrice,
            idBillingPeriod: this.idBillingPeriod,
            idCoreFacility: this.idCoreFacility,
            billingPeriodString: this.billingPeriodString
        };
        this.dialog.open(BillingGlInterfaceViewComponent, config);
    }

    public showBillingInvoice(sendEmail: boolean): void {
        if (!this.idBillingPeriod) {
            this.dialogsService.confirm("Please select a billing period", null);
            return;
        }
        if (this.isDirty) {
            this.dialogsService.confirm("Please save or discard unsaved changes", null);
            return;
        }
        if (!this.selectedItem) {
            this.dialogsService.confirm("Please select a lab folder", null);
            return;
        }

        let labNode: ITreeNode = null;
        if (this.selectedItem.data.name === "Request") {
            if (this.selectedItem.parent.data.name === "Lab") {
                labNode = this.selectedItem.parent;
            } else {
                this.dialogsService.confirm("Please complete the billing item(s) first", null);
                return;
            }
        } else if (this.selectedItem.data.name === "Lab") {
            labNode = this.selectedItem;
        }
        if (labNode) {
            if (sendEmail) {
                this.showBillingInvoiceEmailWindow(labNode);
            } else {
                let url: string = 'ShowBillingInvoiceForm.gx' +
                    '?idBillingPeriod=' + this.idBillingPeriod +
                    '&idLab=' + labNode.data.idLab +
                    '&idBillingAccount=' + labNode.data.idBillingAccount +
                    '&idCoreFacility=' + this.idCoreFacility;
                let resultWindow = window.open(url, '_blank');
            }
        } else if (!sendEmail && this.selectedItem.data.name === "Status" && (this.selectedItem.data.status === "APPROVED" || this.selectedItem.data.status === "APPROVEDEX" || this.selectedItem.data.status === "APPROVEDCC" || this.selectedItem.data.status === "COMPLETE")) {
            this.dialogsService.confirm("Print all invoices for this folder?", " ").subscribe((result: boolean) => {
                if (result) {
                    let idLabs: string = "";
                    let idBillingAccounts: string = "";
                    for (let lab of this.selectedItem.children) {
                        idLabs += lab.data.idLab + ",";
                        idBillingAccounts += lab.data.idBillingAccount + ",";
                    }
                    let url: string = 'ShowBillingInvoiceForm.gx' +
                        '?idBillingPeriod=' + this.idBillingPeriod +
                        '&idLabs=' + idLabs +
                        '&idBillingAccounts=' + idBillingAccounts +
                        '&idCoreFacility=' + this.idCoreFacility;
                    let resultWindow = window.open(url, '_blank');
                }
            });
        } else {
            this.dialogsService.confirm("Please select a lab folder", null);
            return;
        }
    }

    private showBillingInvoiceEmailWindow(labNode: ITreeNode): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            idBillingPeriod: this.idBillingPeriod,
            labNode: labNode,
            idCoreFacility: this.idCoreFacility
        };
        this.dialog.open(InvoiceEmailWindowComponent, config);
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
