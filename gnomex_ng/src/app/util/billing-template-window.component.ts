import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {BillingService} from "../services/billing.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService, DialogType} from "./popup/dialogs.service";
import {GridApi, GridReadyEvent, GridSizeChangedEvent, RowSelectedEvent} from "ag-grid-community";
import {CheckboxRenderer} from "./grid-renderers/checkbox.renderer";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";
import {formatCurrency} from "@angular/common";
import {PropertyService} from "../services/property.service";
import {Validators} from "@angular/forms";
import {TextAlignLeftMiddleEditor} from "./grid-editors/text-align-left-middle.editor";

@Component({
    selector: 'billing-template-window',
    templateUrl: "./billing-template-window.component.html",
    styles: [`
        .children-margin-right > *:not(:last-child) {
            margin-right: 1em;
        }
        div.accounts-grid-div {
            height: 300px;
        }
        .custom-mat-radio .mat-radio-label-content {
            padding-left: 4px;
            padding-right: 8px;
        }
    `]
})

export class BillingTemplateWindowComponent extends BaseGenericContainerDialog implements OnInit {

    public readonly SPLIT_BY_PERCENT: string = "Percent";
    public readonly SPLIT_BY_DOLLAR: string = "Dollar";

    public idCoreFacility: string = "";
    public codeRequestCategory: string = "";
    private idBillingTemplate: string = "0";
    private targetClassName: string = "";
    private targetClassIdentifier: string = "";

    public labList: any[] = [];
    public selectedLab: any;
    public accountList: any[] = [];
    public showInactiveAccounts: boolean = false;
    public selectedAccount: any;
    public currentAccountsList: BillingTemplateItem[] = [];

    public gridColumnDefs: any[];
    private gridApi: GridApi;
    public selectedRowIndex: any = null;

    public splitBy: string = "";
    private defaultBillingSplitBy: string = "";
    private usingPercentSplit: string = "";
    public totalAmount: number = 0;

    constructor(private dialogRef: MatDialogRef<BillingTemplateWindowComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private billingService: BillingService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                private propertyService: PropertyService,
                public createSecurityAdvisorService: CreateSecurityAdvisorService) {
        super();

        if (data && data.params) {
            let params: BillingTemplateWindowParams = data.params as BillingTemplateWindowParams;
            if (params.idCoreFacility) {
                this.idCoreFacility = params.idCoreFacility;
            }
            if (params.codeRequestCategory) {
                this.codeRequestCategory = params.codeRequestCategory;
            }
            if (params.billingTemplate) {
                this.idBillingTemplate = params.billingTemplate.idBillingTemplate;
                this.targetClassName = params.billingTemplate.targetClassName;
                this.targetClassIdentifier = params.billingTemplate.targetClassIdentifier;
                this.currentAccountsList = params.billingTemplate.items;
                this.usingPercentSplit = params.billingTemplate.usingPercentSplit;
            }

            let defaultBillingSplitType = this.propertyService.getProperty(PropertyService.PROPERTY_BILLING_ACCOUNT_SPLIT_TYPE, this.idCoreFacility, this.codeRequestCategory);
            this.defaultBillingSplitBy = defaultBillingSplitType && defaultBillingSplitType.propertyValue ? defaultBillingSplitType.propertyValue : "";

            if(!this.usingPercentSplit) {
                this.usingPercentSplit = this.defaultBillingSplitBy ? ((this.defaultBillingSplitBy === this.SPLIT_BY_PERCENT || this.defaultBillingSplitBy === "%") ? "true" : "false") : "true";
            }
            this.splitBy = this.usingPercentSplit === "true" ? this.SPLIT_BY_PERCENT : this.SPLIT_BY_DOLLAR;

            if(data.totalAmount) {
                this.totalAmount = data.totalAmount;
            }

        }
    }

    private percentParser(params: any): number {
        let parsedValue: number = Number(params.newValue);
        if (parsedValue && !isNaN(parsedValue) && parsedValue > 0) {
            return Math.round(parsedValue);
        } else {
            return 0;
        }
    }

    private dollarParser(params: any): string {
        let parsedValue: number = Number(params.newValue);
        if (parsedValue && !isNaN(parsedValue) && parsedValue > 0) {
            return "" + parsedValue;
        } else {
            return "";
        }
    }

    private percentValueFormatter(params: any): string {
        if(!isNaN(Number(params.value))) {
            return "" + params.value + "%";
        } else {
            return "0";
        }
    }

    private currencyValueFormatter(params: any): string {
        if(!isNaN(Number(params.value)) && Number(params.value) >= 0) {
            return formatCurrency(Number(params.value), "en", "$", "USN", "1.2-2");
        } else {
            return formatCurrency(0, "en", "$", "USN", "1.2-2");
        }
    }

    ngOnInit() {
        this.gridColumnDefs = this.getGridColumnDefs();
        if (this.splitBy === this.SPLIT_BY_PERCENT) {
            this.updatePercentTotal();
        } else if (this.splitBy === this.SPLIT_BY_DOLLAR) {
            this.checkTotalAmount();
        }

        this.loadLabs();
    }

    private getGridColumnDefs(): any[] {
        let tempColumnDefs: any[] = [
            {headerName: "Group", field: "labName", width: 100},
            {headerName: "Billing Account", field: "accountNumberDisplay", width: 100}];
        if(this.splitBy === this.SPLIT_BY_PERCENT) {
            tempColumnDefs.push(
                {headerName: "%", field: "percentSplit", width: 100, editable: true,
                    valueParser: this.percentParser,
                    valueFormatter: this.percentValueFormatter,
                    validators: [Validators.pattern(/^\d{1,3}$/), Validators.min(1), Validators.max(100)],
                    errorNameErrorMessageMap: [
                        { errorName: 'pattern',  errorMessage: 'Expects an integer number between 1-100' },
                        {errorName: 'min',  errorMessage: 'Expects an integer number between 1-100' },
                        {errorName: 'max',  errorMessage: 'Expects an integer number between 1-100' }]},
            );
        } else if(this.splitBy === this.SPLIT_BY_DOLLAR) {
            tempColumnDefs.push(
                {headerName: "$", field: "dollarAmount", width: 100, editable: true,
                    cellEditorFramework: TextAlignLeftMiddleEditor,
                    valueParser: this.dollarParser,
                    valueFormatter: this.currencyValueFormatter,
                    validators: [Validators.pattern(/^\$\d{1,10}(\.\d{0,2})?$/)],
                    errorNameErrorMessageMap: [{ errorName: 'pattern',  errorMessage: 'Expects a currency number' }]},
            );
        }
        tempColumnDefs.push(
            {headerName: "Accept Balance", field: "acceptBalance", width: 100, cellRendererFramework: CheckboxRenderer,
                editable: false, checkboxEditable: true},
        );
        return tempColumnDefs;
    }

    public loadLabs(): void {
        this.selectedLab = null;
        this.selectedAccount = null;
        this.labList = [];
        this.accountList = [];

        let params: HttpParams = new HttpParams();
        if (this.showInactiveAccounts) {
            params = params.set("includeOnlyUnexpiredAccounts", "false");
        }
        if (this.idCoreFacility) {
            params = params.set("idCoreFacility", this.idCoreFacility);
        }

        this.billingService.getAuthorizedBillingAccounts(params).subscribe((response: any) => {
            if (response && response.Lab && Array.isArray(response.Lab)) {
                this.labList = response.Lab;
            } else if (response && response.Lab) {
                this.labList = [response.Lab];
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.error("An error occurred while retrieving lab list" + message);
            }
            this.labList.sort((a: any, b: any) => {
                return (a.name as string).localeCompare((b.name as string));
            });
        });
    }

    public loadAccountsForLab(): void {
        this.selectedAccount = null;
        this.accountList = [];
        if (this.selectedLab && this.selectedLab.BillingAccount) {
            if (Array.isArray(this.selectedLab.BillingAccount)) {
                this.accountList = this.selectedLab.BillingAccount;
            } else {
                this.accountList = [this.selectedLab.BillingAccount];
            }
            if (this.idCoreFacility) {
                this.accountList = this.accountList.filter((item: any) => {
                    return item.idCoreFacility && item.idCoreFacility === this.idCoreFacility;
                });
            } else if (this.codeRequestCategory) {
                let requestCategory = this.dictionaryService.getEntry(DictionaryService.REQUEST_CATEGORY, this.codeRequestCategory);
                if (requestCategory && requestCategory.idCoreFacility) {
                    this.accountList = this.accountList.filter((item: any) => {
                        return item.idCoreFacility && item.idCoreFacility === requestCategory.idCoreFacility;
                    });
                }
            }
            this.accountList.sort((a: any, b: any) => {
                return (a.accountNumberDisplay as string).localeCompare((b.accountNumberDisplay as string));
            });
        }
    }

    public onGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.gridColumnDefs);
        event.api.sizeColumnsToFit();
        this.gridApi = event.api;
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        event.api.sizeColumnsToFit();
    }

    public onGridRowSelected(event: RowSelectedEvent): void {
        if (event.node.isSelected()) {
            this.selectedRowIndex = event.node.rowIndex;
        }
    }

    public onCellValueChanged(event: any) {
        if(event.column.colDef.field === "percentSplit") {
            this.updatePercentTotal();
        } else if(event.column.colDef.field === "dollarAmount" && this.data.totalAmount) {
            this.checkTotalAmount();
        } else if(event.column.colDef.field === "acceptBalance") {
            if(event.newValue === "Y") {
                this.checkAcceptBalance();
            }
        }
        if(this.gridApi) {
            this.gridApi.redrawRows();
            this.gridApi.sizeColumnsToFit();
        }
    }

    public addAccount(): void {
        if (this.selectedLab && this.selectedAccount) {
            for (let alreadyAddedAccount of this.currentAccountsList) {
                if (alreadyAddedAccount.idBillingAccount === this.selectedAccount.idBillingAccount) {
                    this.dialogsService.alert("This account is already added. Please add an another account.", "", DialogType.ALERT);
                    return;
                }
            }

            this.selectedRowIndex = null;

            let accountToAdd: BillingTemplateItem = this.selectedAccount;
            accountToAdd.labName = this.selectedLab.name;
            accountToAdd.percentSplit = 0;
            accountToAdd.dollarAmount = "";
            accountToAdd.acceptBalance = "N";

            this.currentAccountsList.push(accountToAdd);
            this.gridApi.setRowData(this.currentAccountsList);

            this.selectedLab = null;
            this.selectedAccount = null;
        }
    }

    public removeAccount(): void {
        if (this.selectedRowIndex !== null) {
            this.currentAccountsList.splice(this.selectedRowIndex, 1);
            this.gridApi.setRowData(this.currentAccountsList);
            this.selectedRowIndex = null;
        }
    }

    public onSplitByChange(): void {
        if (this.splitBy === this.SPLIT_BY_PERCENT) {
            this.usingPercentSplit = "true";
            for (let account of this.currentAccountsList) {
                if(isNaN(Number(account.percentSplit))) {
                    account.percentSplit = 0;
                }
            }
            this.updatePercentTotal();
        } else {
            this.usingPercentSplit = "false";

        }
        if(this.gridApi) {
            this.gridColumnDefs = this.getGridColumnDefs();
            this.gridApi.setColumnDefs(this.gridColumnDefs);
            this.gridApi.sizeColumnsToFit();
        }
    }

    private  updatePercentTotal(): void {
        let total: number = 0;
        for (let account of this.currentAccountsList) {
            if(!isNaN(Number(account.percentSplit)) && Number(account.percentSplit) >= 0 && account.acceptBalance !== "Y") {
                total += Number(account.percentSplit);
            }
        }
        if (total >= 100) {
            this.dialogsService.alert("Percentage total exceeds 100%", null, DialogType.VALIDATION);
            return;
        } else {
            for (let account of this.currentAccountsList) {
                if(account.acceptBalance === "Y") {
                    account.percentSplit = 100 - total;
                    break;
                }
            }
        }

    }
    private checkTotalAmount(): void {
        let totalAmount: number = 0;
        for (let account of this.currentAccountsList) {
            if(!isNaN(Number(account.dollarAmount)) && Number(account.dollarAmount) >= 0 && account.acceptBalance !== "Y") {
                totalAmount += Number(account.dollarAmount);
            }
        }
        if(this.data.totalAmount && totalAmount > this.totalAmount) {
            this.dialogsService.alert("Amount total exceeds the total amount", null, DialogType.VALIDATION);
            return;
        } else if (this.data.totalAmount) {
            for(let account of this.currentAccountsList ) {
                if (account.acceptBalance === "Y") {
                    account.dollarAmount = "" + (this.data.totalAmount - totalAmount);
                    break;
                }
            }
        }
    }
    private checkAcceptBalance(): void {
        let acceptBalanceFound: boolean = false;
        for (let account of this.currentAccountsList) {
            if (account.acceptBalance === "Y") {
                if(acceptBalanceFound) {
                    this.dialogsService.alert("Only one account can accept balance", null, DialogType.VALIDATION);
                    return;
                }
                acceptBalanceFound = true;
            }
        }
    }


    public promptToSave(): void {
        this.gridApi.stopEditing();
        if (this.currentAccountsList.length < 1) {
            this.dialogsService.alert("Please add at least one billing account", null, DialogType.VALIDATION);
            return;
        }
        let acceptBalanceFound: boolean = false;
        let invalidValueFound: boolean = false;
        let total: number = 0;
        let totalAmount: number = 0;
        for (let account of this.currentAccountsList) {
            if (account.acceptBalance === 'Y') {
                if (acceptBalanceFound) {
                    this.dialogsService.alert("Only one account can accept balance", null, DialogType.VALIDATION);
                    return;
                }
                acceptBalanceFound = true;
            }
            if(this.usingPercentSplit === "true") {
                if (account.acceptBalance !== "Y") {
                    if(Number(account.percentSplit) <= 0) {
                        invalidValueFound = true;
                    } else {
                        total += Number(account.percentSplit);
                    }
                } else {
                    if(isNaN(Number(account.percentSplit))) {
                        account.percentSplit = 0;
                    }
                }
                account.dollarAmount = "";
            } else {
                if(!isNaN(Number(account.dollarAmount))) {
                    if (account.acceptBalance !== "Y") {
                        if(Number(account.dollarAmount) <= 0) {
                            invalidValueFound = true;
                        } else {
                            totalAmount += Number(account.dollarAmount);
                        }
                    }
                    account.percentSplit = 0;
                } else {
                    this.dialogsService.alert("Input a valid dollar amount", null, DialogType.VALIDATION);
                    return;
                }
            }

        }
        if (!acceptBalanceFound) {
            this.dialogsService.alert("No account is designated to accept remaining balance", null, DialogType.VALIDATION);
            return;
        }
        if(invalidValueFound) {
            this.dialogsService.alert("All accounts that don't accept balance must have a positive percentage or dollar amount.", null, DialogType.VALIDATION);
            return;
        }
        if(this.usingPercentSplit === "true") {
            if (total >= 100) {
                this.dialogsService.alert("Total percentage of all billing accounts cannot exceed 100%.", null, DialogType.VALIDATION);
                return;
            } else if(total < 100) {
                if(this.currentAccountsList.length === 1) {
                    this.currentAccountsList[0].percentSplit = 100;
                } else {
                    for (let account of this.currentAccountsList) {
                        if(account.acceptBalance === "Y") {
                            account.percentSplit = 100 - total;
                        }
                    }
                }
            }
        } else {
            if(this.data.totalAmount) {
                if (totalAmount > this.totalAmount) {
                    this.dialogsService.alert("Amount total exceeds the total amount", null, DialogType.VALIDATION);
                    return;
                } else if (totalAmount < this.totalAmount) {
                    if(this.currentAccountsList.length === 1) {
                        this.currentAccountsList[0].dollarAmount = "" + this.totalAmount;
                    } else {
                        for (let account of this.currentAccountsList) {
                            if(account.acceptBalance === "Y") {
                                account.dollarAmount = "" + (this.totalAmount - totalAmount);
                            }
                        }
                    }
                }
            }
        }

        this.save();
    }

    private save(): void {
        let billingTemplate: BillingTemplate = {
            idBillingTemplate: this.idBillingTemplate,
            usingPercentSplit: this.usingPercentSplit,
            items: this.currentAccountsList,
            targetClassName: this.targetClassName,
            targetClassIdentifier: this.targetClassIdentifier
        };
        this.dialogRef.close(billingTemplate);
    }

    onClose(){
        this.dialogRef.close();
    }

}

export class BillingTemplateWindowParams {
    idCoreFacility?: string;
    codeRequestCategory?: string;
    billingTemplate?: BillingTemplate;

    constructor() {
    }
}

export interface BillingTemplateItem {
    idBillingAccount: string;
    accountName: string;
    accountNumber: string;
    accountNumberDisplay: string;
    idLab: string;
    labName: string;
    percentSplit: number;
    dollarAmount: string;
    acceptBalance: string;
}

export interface BillingTemplate {
    idBillingTemplate: string;
    usingPercentSplit: string;
    items: BillingTemplateItem[];
    targetClassName: string;
    targetClassIdentifier: string;
}
