import {Component, Input, OnInit} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';

import {BillingUsageReportComponent} from "../billing-usage-report.component";
import {DialogsService, DialogType} from "../popup/dialogs.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {InvoiceEmailWindowComponent} from "../../billing/invoice-email-window.component";
import {BillingGlInterfaceViewComponent} from "../../billing/billing-gl-interface-view.component";
import {NotesToCoreComponent} from "../../billing/notes-to-core.component";
import {BillingService} from "../../services/billing.service";
import {ConstantsService} from "../../services/constants.service";
import {ActionType} from "../interfaces/generic-dialog-action.model";

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
                private dialogsService: DialogsService,
                private billingService: BillingService,
                private constantsService: ConstantsService) {
    }

    ngOnInit() {
    }

    public showGeneralLedgerInterface(): void {
        if (this.filterByOrderType && this.filterByOrderType !== "All") {
            this.dialogsService.alert("Please select 'Show All' for Billing Items before running the GL interface", null, DialogType.FAILED);
            return;
        }
        if (!this.idBillingPeriod) {
            this.dialogsService.alert("Please select a billing period", null, DialogType.FAILED);
            return;
        }
        if (this.showRelatedCharges) {
            this.dialogsService.alert("Please hide Related Charges before running the GL interface", null, DialogType.FAILED);
            return;
        }
        if (!this.selectedItem || this.selectedItem.data.name !== "Status" || this.selectedItem.data.status !== "APPROVED") {
            this.dialogsService.alert("Please select the approved folder before running the GL interface", null, DialogType.FAILED);
            return;
        }

        let title: string = this.billingPeriodString + " GL Interface " + this.totalPrice.toLocaleString("en-US", {style: "currency", currency: "USD"});

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "35em";
        config.data = {
            totalPrice: this.totalPrice,
            idBillingPeriod: this.idBillingPeriod,
            idCoreFacility: this.idCoreFacility,
            billingPeriodString: this.billingPeriodString
        };
        this.dialogsService.genericDialogContainer(BillingGlInterfaceViewComponent, title, null, config,
            {actions: [
                    {type: ActionType.PRIMARY, name: "OK", internalAction: "send"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]});
    }

    public showBillingInvoice(sendEmail: boolean): void {
        if (!this.idBillingPeriod) {
            this.dialogsService.alert("Please select a billing period", null, DialogType.FAILED);
            return;
        }
        if (this.isDirty) {
            this.dialogsService.alert("Please save or discard unsaved changes", null, DialogType.FAILED);
            return;
        }
        if (!this.selectedItem) {
            this.dialogsService.alert("Please select a lab folder", null, DialogType.FAILED);
            return;
        }

        let labNode: ITreeNode = null;
        if (this.selectedItem.data.name === "Request") {
            if (this.selectedItem.parent.data.name === "Lab") {
                labNode = this.selectedItem.parent;
            } else {
                this.dialogsService.alert("Please complete the billing item(s) first", null, DialogType.FAILED);
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
                window.open(url, '_blank');
            }
        } else if (!sendEmail && this.selectedItem.data.name === "Status" && (this.selectedItem.data.status === "APPROVED" || this.selectedItem.data.status === "APPROVEDEX" || this.selectedItem.data.status === "APPROVEDCC" || this.selectedItem.data.status === "COMPLETE")) {
            this.dialogsService.confirm("Print all invoices for this folder?").subscribe((result: boolean) => {
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
                    window.open(url, '_blank');
                }
            });
        } else {
            this.dialogsService.alert("Please select a lab folder", null, DialogType.FAILED);
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
        this.dialogsService.genericDialogContainer(InvoiceEmailWindowComponent, "Email Invoice", this.constantsService.EMAIL_GO_LINK, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constantsService.EMAIL_GO_LINK, name: "Send", internalAction: "send"},
                    {type: ActionType.SECONDARY, name: "Close", internalAction: "onClose"}
                ]});
    }

    public showMonthendBillingReport(uMergeFormat: boolean = false): void {
        if (!this.idBillingPeriod) {
            this.dialogsService.alert("Please select a billing period", null, DialogType.FAILED);
            return;
        }

        let statusNode: any;
        if (this.selectedItem && this.selectedItem.data.name === "Lab") {
            statusNode = this.selectedItem.parent.data;
        } else if (this.selectedItem && this.selectedItem.data.name === "Status") {
            statusNode = this.selectedItem.data;
        }

        if (!statusNode || !(statusNode.status === "APPROVED" || statusNode.status === "APPROVEDEX" || statusNode.status === "APPROVEDCC")) {
            this.dialogsService.alert("Please select an approved folder", null, DialogType.FAILED);
            return;
        }

        let controller: string = uMergeFormat ? "ShowBillingMonthendReportUMergeFormat.gx" : "ShowBillingMonthendReport.gx";
        let url: string = controller +
            '?codeBillingStatus=' + statusNode.status +
            '&idCoreFacility=' + this.idCoreFacility +
            '&idBillingPeriod=' + this.idBillingPeriod;
        window.open(url, '_blank');
    }

    public showBillingByLabReport(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "35em";
        config.height = "12em";
        config.autoFocus = false;
        config.data = {
            mode: "Total Billing by Lab",
            idCoreFacility: this.idCoreFacility
        };
        this.dialogsService.genericDialogContainer(BillingUsageReportComponent, "Total Billing by Lab Report for Bioinformatics", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, name: "OK", internalAction: "submit"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]});
    }

    public showUsageReport(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "35em";
        config.height = "12em";
        config.autoFocus = false;
        config.data = {
            mode: "Lab Usage",
            idCoreFacility: this.idCoreFacility
        };
        this.dialogsService.genericDialogContainer(BillingUsageReportComponent, "Lab Usage Report for Bioinformatics", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, name: "OK", internalAction: "submit"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]});
    }

    public showNotesToCore(): void {
        if (!this.idBillingPeriod) {
            this.dialogsService.alert("Please select a billing period", null, DialogType.FAILED);
            return;
        }

        let config: MatDialogConfig = new MatDialogConfig();
        config.disableClose = true;
        config.autoFocus = false;
        config.data = {
        };
        this.dialogsService.genericDialogContainer(NotesToCoreComponent, "Billing Item Notes to Core", null, config,
            {actions: [
                    {type: ActionType.SECONDARY, name: "Close", internalAction: "onClose"}
                ]});
    }

    public refresh(): void {
        if (this.isDirty) {
            this.dialogsService.confirm("Unsaved changes will be discarded. Proceed?").subscribe((result: boolean) => {
                if (result) {
                    this.billingService.requestBillingScreenRefresh();
                }
            });
        } else {
            this.billingService.requestBillingScreenRefresh();
        }
    }

}
