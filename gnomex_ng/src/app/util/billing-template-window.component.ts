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
    `]
})

export class BillingTemplateWindowComponent extends BaseGenericContainerDialog implements OnInit {

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

    constructor(private dialogRef: MatDialogRef<BillingTemplateWindowComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private billingService: BillingService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
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
            }
        }

        this.gridColumnDefs = [
            {headerName: "Group", field: "labName", width: 100},
            {headerName: "Billing Account", field: "accountNumberDisplay", width: 100},
            {headerName: "%", field: "percentSplit", width: 100, editable: true, valueParser: this.percentParser, valueFormatter: this.percentFormatter},
            {headerName: "Accept Balance", field: "acceptBalance", width: 100, cellRendererFramework: CheckboxRenderer,
                editable: false, checkboxEditable: true},
        ];
    }

    private percentParser(params: any): number {
        let parsedValue: number = Number(params.newValue);
        if (parsedValue && !isNaN(parsedValue)) {
            return Math.round(parsedValue);
        } else {
            return 0;
        }
    }

    private percentFormatter(params: any): string {
        return "" + params.value + "%";
    }

    ngOnInit() {
        this.loadLabs();
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

    public addAccount(): void {
        if (this.selectedLab && this.selectedAccount) {
            for (let alreadyAddedAccount of this.currentAccountsList) {
                if (alreadyAddedAccount.idBillingAccount === this.selectedAccount.idBillingAccount) {
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
        }
    }

    public removeAccount(): void {
        if (this.selectedRowIndex !== null) {
            this.currentAccountsList.splice(this.selectedRowIndex, 1);
            this.gridApi.setRowData(this.currentAccountsList);
            this.selectedRowIndex = null;
        }
    }

    public promptToSave(): void {
        this.gridApi.stopEditing();
        if (this.currentAccountsList.length < 1) {
            this.dialogsService.alert("Please add at least one billing account", null, DialogType.VALIDATION);
            return;
        }
        let acceptBalanceFound: boolean = false;
        let total: number = 0;
        for (let account of this.currentAccountsList) {
            if (account.acceptBalance === 'Y') {
                if (acceptBalanceFound) {
                    this.dialogsService.alert("Only one account can accept balance", null, DialogType.VALIDATION);
                    return;
                }
                acceptBalanceFound = true;
            }
            if (account.percentSplit <= 0) {
                this.dialogsService.alert("All account(s) must have a positive percentage", null, DialogType.VALIDATION);
                return;
            }
            total += account.percentSplit;
        }
        if (!acceptBalanceFound) {
            this.dialogsService.alert("No account is designated to accept remaining balance", null, DialogType.VALIDATION);
            return;
        }
        if (total > 100) {
            this.dialogsService.alert("Percentage total exceeds 100%", null, DialogType.VALIDATION);
            return;
        }
        this.save();
    }

    private save(): void {
        let billingTemplate: BillingTemplate = {
            idBillingTemplate: this.idBillingTemplate,
            usingPercentSplit: "true",
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
