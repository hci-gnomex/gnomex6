import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {ErrorStateMatcher, MatDialog, MatDialogRef} from "@angular/material";

import {DictionaryService} from "../../services/dictionary.service";
import {PropertyService} from "../../services/property.service";

import {EditBillingAccountComponent} from "../../billing/edit_billing_account/edit-billing-account.component";

import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {DateEditor} from "../../util/grid-editors/date.editor";
import {DateRenderer} from "../../util/grid-renderers/date.renderer";
import {IconLinkButtonRenderer} from "../../util/grid-renderers/icon-link-button.renderer";
import {SplitStringToMultipleLinesRenderer} from "../../util/grid-renderers/split-string-to-multiple-lines.renderer";
import {RemoveLinkButtonRenderer} from "../../util/grid-renderers/remove-link-button.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignRightMiddleRenderer} from "../../util/grid-renderers/text-align-right-middle.renderer";
import {UploadViewRemoveRenderer} from "../../util/grid-renderers/upload-view-remove.renderer";

import * as _ from "lodash";
import {BillingUsersSelectorComponent} from "./billing-users-selector/billing-users-selector.component";
import {DateParserComponent} from "../../util/parsers/date-parser.component";
import {AccountFieldsConfigurationService} from "../../services/account-fields-configuration.service";
import {Subscription} from "rxjs/Subscription";
import {FormControl, FormGroupDirective, NgForm, Validators} from "@angular/forms";


export class EditBillingAccountStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control && control.invalid && control.touched && (control.dirty || (form && form.submitted)));
    }
}

@Component({
    selector: "billing-account-tab",
    templateUrl: "./billing-account-tab.component.html",
    styles: [`
        .flex-base {
            display: flex;
            flex-direction: column;
        }

        .flex-header {
        }

        .flex-stretch {
            display: flex;
            flex: 1;
        }

        .flex-footer {
        }

        .border {
            width: 50%;
            margin-bottom: 0.8em;
            padding: 0.5em;
            border: 1px solid lightgrey;
            border-radius: 3px;
        }

        .t {
            display: table;
        }

        .tr {
            display: table-row;
        }

        .td {
            display: table-cell;
        }

        .block {
            display: block;
        }

        .inline-block {
            display: inline-block;
        }

        .full-width {
            width: 100%;
        }

        .full-height {
            height: 100%;
        }
    `]
})
export class BillingAccountTabComponent implements OnInit, OnDestroy {

    readonly CHARTFIELD: string = 'CHARTFIELD';
    readonly PO: string = 'PO';
    readonly CREDIT_CARD: string = 'CREDIT_CARD';

    private _labInfo: any;

    context;

    @Input()
    set labInfo(value: any) {
        this._labInfo = value;
        this.onLabChanged();
    }

    coreFacilities: any[];
    selectedCoreFacility: any;

    labActiveSubmitters: any[];

    showAddAccountBox: boolean = false;
    accountType: string = this.CHARTFIELD;

    newAccountName: string;

    chartfieldGridApi: any;
    poGridApi: any;
    creditCardGridApi: any;

    chartfieldGridColumnApi: any;
    poGridColumnApi: any;
    creditCardGridColumnApi: any;

    fundingAgencies: any[];
    creditCardCompanies: any[];

    includeInCustomField_shortAccount      : boolean = false;
    includeInCustomField_fundingAgency     : boolean = false;
    includeInCustomField_startDate         : boolean = false;
    includeInCustomField_expirationDate    : boolean = false;
    includeInCustomField_totalDollarAmount : boolean = false;

    requireShortAcct      : boolean = false;
    requireFundingAgency  : boolean = false;
    requireStartDate      : boolean = false;
    requireExpirationDate : boolean = false;
    requireDollarAmount   : boolean = false;

    // In GNomEx, it is possible to customize how the chartfield billing accounts appear.
    // This requires the "usesCustomChartfields" property to be 'Y'.
    // If it is 'Y', then startDate, endDate and all the account number fields are automatically
    // excluded from the forms and grids.
    private usesCustomChartfields: string = '';

    // The "InternalAccountFieldsConfiguration" table has records for customizable fields
    // (though it will read no more than 5).
    // It also contains type infomation, validation information and where each field is stored.
    private internalAccountFieldsConfiguration: any[];
    private internalAccountsFieldsConfigurationSubscription: Subscription;
    private internalCustomFieldsFormControl: FormControl[] = [];
    private internalCustomFieldsStateMatcher: ErrorStateMatcher[] = [];

    // In contrast, the "OtherAccountFieldsConfiguration" table holds records which direct GNomEx to
    // add back in fields that were removed because the "usesCustomChartfields" property is 'Y'.
    private otherAccountFieldsConfiguration: any[];
    private otherAccountsFieldsConfigurationSubscription: Subscription;

    constructor(private dictionaryService: DictionaryService,
                private propertyService: PropertyService,
                private accountFieldsConfigurationService: AccountFieldsConfigurationService,
                private dialog: MatDialog) {
        this.context = {componentParent: this};
    }

    ngOnInit(): void {

        this.usesCustomChartfields = this.propertyService.getExactProperty('configurable_billing_accounts').propertyValue;

        if (this.usesCustomChartfields === 'Y') {
            for (let i = 0; i < 5; i++) {
                this.internalCustomFieldsFormControl[i] = new FormControl('', []);
                this.internalCustomFieldsStateMatcher[i] = new EditBillingAccountStateMatcher();
            }

            this.internalAccountsFieldsConfigurationSubscription =
                this.accountFieldsConfigurationService.getInternalAccountFieldsConfigurationObservable().subscribe((response) => {
                    this.processInternalAccountFieldsConfigurations(response);
                    this.assignChartfieldGridContents(this.selectedCoreFacility);
                });

            this.otherAccountsFieldsConfigurationSubscription =
                this.accountFieldsConfigurationService.getOtherAccountFieldsConfigurationObservable().subscribe((response) => {
                    this.processOtherAccountFieldsConfigurations(response);
                    this.assignChartfieldGridContents(this.selectedCoreFacility);
                });

            this.accountFieldsConfigurationService.publishAccountFieldConfigurations();
        }

        this.onLabChanged();
    }

    ngOnDestroy(): void {
        this.internalAccountsFieldsConfigurationSubscription.unsubscribe();
        this.otherAccountsFieldsConfigurationSubscription.unsubscribe();
    }

    // All the data on this component needs to be updated when the selected lab is changed (auto-detected
    // when the input "labInfo" changes).
    private onLabChanged() {
        this.selectedCoreFacility = this.getDefaultCoreFacility();
        this.labActiveSubmitters = this.getActiveSubmitters();

        this.assignChartfieldGridContents(this.selectedCoreFacility);
        this.assignPoGridContents(this.selectedCoreFacility);
        this.assignCreditCardGridContents(this.selectedCoreFacility);

        this.showAddAccountBox = false;
        this.creditCardCompanies = this.dictionaryService.getEntries(DictionaryService.CREDIT_CARD_COMPANY);
        this.fundingAgencies = this.dictionaryService.getEntries(DictionaryService.FUNDING_AGENCY);
        //this.userList = this.dictionaryService.getEntries(DictionaryService.USE)
    }


    private getDefaultCoreFacility(): any {
        if (!!this._labInfo.coreFacilities && this._labInfo.coreFacilities.length > 0) {
            this.coreFacilities = _.cloneDeep(this._labInfo.coreFacilities);

            this.coreFacilities = this.coreFacilities.sort((a, b) => {
                if (a.sortOrder && a.sortOrder != "") {
                    if (b.sortOrder && b.sortOrder != "") {
                        return parseInt(a.sortOrder) - parseInt(b.sortOrder);
                    } else {
                        return -1;
                    }
                } else {
                    if (b.sortOrder && b.sortOrder != "") {
                        return 1;
                    } else {
                        if (a.display && b.display && a.display.toLowerCase() > b.display.toLowerCase()) {
                            return 1;
                        } else if (a.display && b.display && a.display.toLowerCase() === b.display.toLowerCase()) {
                            return 0
                        } else {
                            return -1;
                        }
                    }
                }
            });

            return this.coreFacilities[0];
        } else {
            return null;
        }

    }

    getActiveSubmitters(): any[] {
        let results = new Map();

        // First, add this lab's users
        if (this._labInfo && this._labInfo.activeSubmitters) {
            if (Array.isArray(this._labInfo.activeSubmitters)) {
                let tempArray = _.cloneDeep(this._labInfo.activeSubmitters);

                for (let activeSubmitter of tempArray) {
                    if (activeSubmitter.value && activeSubmitter.value !== '') {
                        results.set(activeSubmitter.value, activeSubmitter);
                    }
                }
            } else {
                if (this._labInfo.activeSubmitters.AppUser.value && this._labInfo.activeSubmitters.AppUser.value !== '') {
                    results.set(this._labInfo.activeSubmitters.AppUser.value, _.cloneDeep([this._labInfo.activeSubmitters.AppUser]));
                }
            }
        }

        // Then, add in any extra users who were added to various accounts
        if (this._labInfo.billingAccounts) {
            let tempArray = this.getApprovedUsersFromBillingAccount(this._labInfo.billingAccounts);

            for (let user of tempArray) {
                if (user.value && user.value !== '') {
                    results.set(user.value, user);
                }
            }
        }
        if (this._labInfo.poBillingAccounts) {
            let tempArray = this.getApprovedUsersFromBillingAccount(this._labInfo.poBillingAccounts);

            for (let user of tempArray) {
                if (user.value && user.value !== '') {
                    results.set(user.value, user);
                }
            }
        }
        if (this._labInfo.creditCardBillingAccounts) {
            let tempArray = this.getApprovedUsersFromBillingAccount(this._labInfo.creditCardBillingAccounts);

            for (let user of tempArray) {
                if (user.value && user.value !== '') {
                    results.set(user.value, user);
                }
            }
        }

        let list: any[] = [];
        for (let result of results.values()) {
            list.push(result);
        }

        return list;
    }

    /* getApprovedUsersFromBillingAccount - this function is necessary because billing accounts are allowed to have external users.
     * The purpose of this function is to look through lists(?) of billing accounts for additional users.
     * FAQ :
     *
     */
    private getApprovedUsersFromBillingAccount(billingAccountList): Set<any> {
        let temp: Set<any> = new Set();

        if (Array.isArray(billingAccountList)) {
            for (let billingAccount of billingAccountList) {
                if (billingAccount.AppUser) {
                    if (Array.isArray(billingAccount.AppUser)) {
                        for (let user of billingAccount.AppUser) {
                            temp.add(_.cloneDeep(user));
                        }
                    } else {
                        temp.add(_.cloneDeep(billingAccount.AppUser));
                    }
                }
            }
        } else if (billingAccountList.billingAccount && billingAccountList.billingAccount.AppUser) {
            if (Array.isArray(billingAccountList.billingAccount.AppUser)) {
                for (let user of billingAccountList.billingAccount.AppUser) {
                    temp.add(_.cloneDeep(user));
                }
            } else {
                temp.add(_.cloneDeep(billingAccountList.billingAccount.AppUser));
            }
        }

        return temp;
    }

    private processInternalAccountFieldsConfigurations(internalAccountFieldsConfiguration: any[]): void {
        if (!Array.isArray(internalAccountFieldsConfiguration)) {
            return;
        }

        this.internalAccountFieldsConfiguration = internalAccountFieldsConfiguration
            .filter((a) => { return a.include === 'Y'; })
            .sort((a, b) => { return a.sortOrder - b.sortOrder; });

        for (let i = 0; i < this.internalAccountFieldsConfiguration.length; i++) {
            let validators = [];

            if (this.internalAccountFieldsConfiguration[i].maxLength) {
                validators.push(Validators.maxLength(this.internalAccountFieldsConfiguration[i].maxLength));
            } else {
                validators.push(Validators.maxLength(20));
            }

            if (this.internalAccountFieldsConfiguration[i].minLength) {
                validators.push(Validators.minLength(this.internalAccountFieldsConfiguration[i].minLength));
            } else {
                validators.push(Validators.minLength(1));
            }

            if (this.internalAccountFieldsConfiguration[i].isNumber === 'Y') {
                validators.push(Validators.pattern(/^\d*$/));
            }

            if (this.internalAccountFieldsConfiguration[i].isRequired === 'Y') {
                validators.push(Validators.required);
            }

            this.internalCustomFieldsFormControl[i].setValidators(validators);
            this.internalCustomFieldsFormControl[i].setErrors({'pattern':null});
            this.internalCustomFieldsFormControl[i].updateValueAndValidity();
        }
    }

    private processOtherAccountFieldsConfigurations(otherAccountFieldsConfiguration: any[]): void {
        if (!otherAccountFieldsConfiguration.length) {
            return;
        }

        this.includeInCustomField_shortAccount      = false;
        this.includeInCustomField_fundingAgency     = false;
        this.includeInCustomField_startDate         = false;
        this.includeInCustomField_expirationDate    = false;
        this.includeInCustomField_totalDollarAmount = false;

        for (let i = 0; i < otherAccountFieldsConfiguration.length; i++) {
            if (otherAccountFieldsConfiguration[i].include === 'Y') {
                switch(otherAccountFieldsConfiguration[i].fieldName) {
                    case 'shortAcct' :
                        this.includeInCustomField_shortAccount      = true;
                        this.requireShortAcct = otherAccountFieldsConfiguration[i].isRequired === 'Y';
                        break;
                    case 'idFundingAgency' :
                        this.includeInCustomField_fundingAgency     = true;
                        this.requireFundingAgency = otherAccountFieldsConfiguration[i].isRequired === 'Y';
                        break;
                    case 'startDate' :
                        this.includeInCustomField_startDate         = true;
                        this.requireStartDate = otherAccountFieldsConfiguration[i].isRequired === 'Y';
                        break;
                    case 'expirationDate' :
                        this.includeInCustomField_expirationDate    = true;
                        this.requireExpirationDate = otherAccountFieldsConfiguration[i].isRequired === 'Y';
                        break;
                    case 'totalDollarAmount' :
                        this.includeInCustomField_totalDollarAmount = true;
                        this.requireDollarAmount = otherAccountFieldsConfiguration[i].isRequired === 'Y';
                        break;
                    default : // Do nothing.
                }
            }
        }
    }

    private getChartfieldColumnDefs(shownGridData: any[]): any[] {
        let columnDefinitions = [];


        this.usesCustomChartfields = this.propertyService.getExactProperty('configurable_billing_accounts').propertyValue;

        columnDefinitions.push({
            headerName: "Account name",
            editable: false,
            width: 300,
            cellRendererFramework: IconLinkButtonRenderer,
            icon: "../../../assets/pricesheet.png",
            onClick: "openChartfieldEditor",
            field: "accountName"
        });

        if (this.usesCustomChartfields === 'Y') {
            if (this.includeInCustomField_startDate) {
                columnDefinitions.push({
                    headerName: "Starts",
                    editable: true,
                    width: 100,
                    cellRendererFramework: DateRenderer,
                    cellEditorFramework: DateEditor,
                    dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                    field: "startDate"
                });
            }
            if (this.includeInCustomField_expirationDate) {
                columnDefinitions.push({
                    headerName: "Expires",
                    editable: true,
                    width: 100,
                    cellRendererFramework: DateRenderer,
                    cellEditorFramework: DateEditor,
                    dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                    field: "expirationDate"
                });
            }

            for (let item of this.internalAccountFieldsConfiguration) {
                if(item.include && item.include.toLowerCase() !== 'n') {
                    let fieldName: string = "";

                    switch(item.fieldName) {
                        case 'project' : fieldName = 'accountNumberProject'; break;
                        case 'account' : fieldName = 'accountNumberAccount'; break;
                        case 'custom1' : fieldName = 'custom1'; break;
                        case 'custom2' : fieldName = 'custom2'; break;
                        case 'custom3' : fieldName = 'custom3'; break;
                        default : // do nothing.
                    }

                    columnDefinitions.push({
                        headerName: item.displayName,
                        editable: true,
                        width: 100,
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
                        field: fieldName
                    });
                }
            }

            if (this.includeInCustomField_fundingAgency) {
                columnDefinitions.push({
                    headerName: "Funding Agency",
                    editable: true,
                    width: 200,
                    field: "idFundingAgency",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: this.fundingAgencies,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "idFundingAgency"
                });
            }
        } else {
            columnDefinitions.push({
                headerName: "Starts",
                editable: true,
                width: 100,
                cellRendererFramework: DateRenderer,
                cellEditorFramework: DateEditor,
                dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                field: "startDate"
            });
            columnDefinitions.push({
                headerName: "Expires",
                editable: true,
                width: 100,
                cellRendererFramework: DateRenderer,
                cellEditorFramework: DateEditor,
                dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                field: "expirationDate"
            });
            columnDefinitions.push({
                headerName: "Bus",
                editable: true,
                width: 40,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberBus"
            });
            columnDefinitions.push({
                headerName: "Org",
                editable: true,
                width: 60,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberOrg"
            });
            columnDefinitions.push({
                headerName: "Fund",
                editable: true,
                width: 50,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberFund"
            });
            columnDefinitions.push({
                headerName: "Activity",
                editable: true,
                width: 70,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberActivity"
            });
            columnDefinitions.push({
                headerName: "Project",
                editable: true,
                width: 90,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberProject"
            });
            columnDefinitions.push({
                headerName: "Acct",
                editable: true,
                width: 50,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberAccount"
            });
            columnDefinitions.push({
                headerName: "AU",
                editable: true,
                width: 35,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberAu"
            });
        }

        columnDefinitions.push({
            headerName: "Submitter email",
            editable: true,
            width: 200,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "submitterEmail"
        });

        if (this.usesCustomChartfields === 'Y') {
            if (this.includeInCustomField_totalDollarAmount) {
                columnDefinitions.push({
                    headerName: "Total $ Amt",
                    editable: true,
                    width: 80,
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                    field: "totalDollarAmount"
                });
            }
            if (this.includeInCustomField_shortAccount) {
                columnDefinitions.push({
                    headerName: "Short acct",
                    editable: true,
                    width: 100,
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                    field: "shortAcct"
                });
            }
        }

        columnDefinitions.push({
            headerName: "Users",
            editable: false,
            width: 200,
            field: "acctUsers",
            rendererOptions: this.labActiveSubmitters,
            rendererOptionDisplayField: "display",
            rendererOptionValueField: "value",
            onClick: "onChartfieldUsersClicked",
            cellRendererFramework: SplitStringToMultipleLinesRenderer
        });
        columnDefinitions.push({
            headerName: "Active",
            editable: false,
            width: 50,
            cellRendererFramework: CheckboxRenderer,
            field: "activeAccount"
        });
        columnDefinitions.push({
            headerName: "$ Billed",
            editable: false,
            width: 100,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            field: "totalChargesToDateDisplay"
        });

        let gridShowRemove: boolean = false;
        for (let row of shownGridData) {
            if (RemoveLinkButtonRenderer.canRemoveRow(row)) {
                gridShowRemove = true;
                break;
            }
        }

        if (gridShowRemove) {
            columnDefinitions.push({
                headerName: "",
                editable: false,
                width: 100,
                cellRendererFramework: RemoveLinkButtonRenderer
            });
        }

        return columnDefinitions;
    }

    private getPoColumnDefs(shownGridData: any[]): any[] {
        let columnDefinitions = [];

        columnDefinitions.push({
            headerName: "PO",
            editable: false,
            width: 200,
            cellRendererFramework: IconLinkButtonRenderer,
            icon: "../../../assets/email_open.png",
            onClick: "openPoEditor",
            field: "accountName"
        });
        columnDefinitions.push({
            headerName: "Starts",
            editable: true,
            width: 100,
            cellRendererFramework: DateRenderer,
            cellEditorFramework: DateEditor,
            dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
            field: "startDate"
        });
        columnDefinitions.push({
            headerName: "Expires",
            editable: true,
            width: 100,
            cellRendererFramework: DateRenderer,
            cellEditorFramework: DateEditor,
            dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
            field: "expirationDate"
        });
        columnDefinitions.push({
            headerName: "Purchase Order Form",
            editable: false,
            cellRendererFramework: UploadViewRemoveRenderer,
            onClickUpload: this.onPoUploadClicked,
            onClickView: this.onPoViewClicked,
            onClickRemove: this.onPoRemoveClicked,
            width: 200,
            field: "purchaseOrderForm"
        });
        columnDefinitions.push({
            headerName: "Users",
            editable: false,
            width: 100,
            field: "acctUsers",
            rendererOptions: this.labActiveSubmitters,
            rendererOptionDisplayField: "display",
            rendererOptionValueField: "value",
            onClick: "onPoUsersClicked",
            cellRendererFramework: SplitStringToMultipleLinesRenderer
        });
        columnDefinitions.push({
            headerName: "Active",
            editable: false,
            width: 50,
            field: "activeAccount",
            cellRendererFramework: CheckboxRenderer
        });
        columnDefinitions.push({
            headerName: "$ Billed",
            editable: false,
            width: 100,
            field: "totalChargesToDateDisplay",
            cellRendererFramework: TextAlignRightMiddleRenderer
        });

        let gridShowRemove: boolean = false;
        for (let row of shownGridData) {
            if (RemoveLinkButtonRenderer.canRemoveRow(row)) {
                gridShowRemove = true;
                break;
            }
        }

        if (gridShowRemove) {
            columnDefinitions.push({
                headerName: "",
                editable: false,
                width: 100,
                cellRendererFramework: RemoveLinkButtonRenderer
            });
        }

        return columnDefinitions;
    }

    private getCreditCardColumnDefs(shownGridData): any[] {
        let columnDefinitions = [];

        columnDefinitions.push({
            headerName: "Credit Card Last 4 digits",
            editable: false,
            width: 200,
            cellRendererFramework: IconLinkButtonRenderer,
            icon: "../../../assets/creditcards.png",
            onClick: "openCreditCardEditor",
            field: "accountName"
        });
        columnDefinitions.push({
            headerName: "Expires",
            editable: true,
            width: 100,
            cellRendererFramework: DateRenderer,
            cellEditorFramework: DateEditor,
            dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
            field: "expirationDate"
        });
        columnDefinitions.push({
            headerName: "Credit Card Company",
            editable: true,
            width: 200,
            field: "idCreditCardCompany",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.creditCardCompanies,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idCreditCardCompany"
        });
        columnDefinitions.push({
            headerName: "Zip",
            editable: true,
            width: 200,
            field: "zipCode"
        });
        columnDefinitions.push({
            headerName: "Users",
            editable: false,
            width: 100,
            field: "acctUsers",
            rendererOptions: this.labActiveSubmitters,
            rendererOptionDisplayField: "display",
            rendererOptionValueField: "value",
            onClick: "onCreditCardUsersClicked",
            cellRendererFramework: SplitStringToMultipleLinesRenderer
        });
        columnDefinitions.push({
            headerName: "Active",
            editable: false,
            width: 50,
            field: "activeAccount",
            cellRendererFramework: CheckboxRenderer
        });
        columnDefinitions.push({
            headerName: "$ Billed",
            editable: false,
            width: 100,
            field: "totalChargesToDateDisplay",
            cellRendererFramework: TextAlignRightMiddleRenderer
        });

        let gridShowRemove: boolean = false;
        for (let row of shownGridData) {
            if (RemoveLinkButtonRenderer.canRemoveRow(row)) {
                gridShowRemove = true;
                break;
            }
        }

        if (gridShowRemove) {
            columnDefinitions.push({
                headerName: "",
                editable: false,
                width: 100,
                cellRendererFramework: RemoveLinkButtonRenderer
            });
        }

        return columnDefinitions;
    }


    onCoreFacilitySelected(event: any): void {
        this.assignChartfieldGridContents(event.value);
        this.assignPoGridContents(event.value);
        this.assignCreditCardGridContents(event.value);
    }


    onChartfieldGridReady(event: any): void {
        this.chartfieldGridApi = event.api;
        this.chartfieldGridColumnApi = event.columnApi;

        this.assignChartfieldGridContents(this.selectedCoreFacility);
        this.onChartfieldGridSizeChanged()
    }

    onPoGridReady(event: any): void {
        this.poGridApi = event.api;
        this.poGridColumnApi = event.columnApi;

        // set the data
        this.assignPoGridContents(this.selectedCoreFacility);
    }

    onCreditCardGridReady(event: any): void {
        this.creditCardGridApi = event.api;
        this.creditCardGridColumnApi = event.columnApi;

        // set the data
        this.assignCreditCardGridContents(this.selectedCoreFacility);
    }


    assignChartfieldGridContents(selectedCore: any): void {
        if (this.chartfieldGridApi) {
            // Because the filtering can be time intensive, it is important to make local variables to
            // store this information, so that we don't get null pointer exceptions if users click between labs quickly.
            let shownGridData;
            let idSelectedCore: string;

            if (this._labInfo && this._labInfo && selectedCore) {

                shownGridData = _.cloneDeep(this._labInfo.internalBillingAccounts);
                idSelectedCore = selectedCore.value;

                if (!shownGridData) {
                    shownGridData = [];
                } else if (!Array.isArray(shownGridData)) {
                    shownGridData = [shownGridData.BillingAccount];
                }

                shownGridData = shownGridData.filter((a, b) => {
                    return (selectedCore) ? a.idCoreFacility === idSelectedCore : false;
                });
            } else {
                shownGridData = [];
            }

            this.chartfieldGridApi.setRowData(shownGridData);
            this.chartfieldGridApi.setColumnDefs(this.getChartfieldColumnDefs(shownGridData));
            this.chartfieldGridApi.sizeColumnsToFit();
        }
    }

    assignPoGridContents(selectedCore: any): void {
        if (this.poGridApi) {
            // Because the filtering can be time intensive, it is important to make local variables to
            // store this information, so that we don't get null pointer exceptions if users click between labs quickly.
            let shownGridData;
            let idSelectedCore: string;

            if (this._labInfo && this._labInfo && selectedCore) {

                shownGridData = _.cloneDeep(this._labInfo.pOBillingAccounts);
                idSelectedCore = selectedCore.value;

                if (!shownGridData) {
                    shownGridData = [];
                } else if (!Array.isArray(shownGridData)) {
                    shownGridData = [shownGridData.BillingAccount];
                }

                shownGridData = shownGridData.filter((a, b) => {
                    return (selectedCore) ? a.idCoreFacility === idSelectedCore : false;
                });
            } else {
                shownGridData = [];
            }

            this.poGridApi.setRowData(shownGridData);
            this.poGridApi.setColumnDefs(this.getPoColumnDefs(shownGridData));
            this.poGridApi.sizeColumnsToFit();
        }
    }

    assignCreditCardGridContents(selectedCore: any): void {
        if (this.creditCardGridApi) {
            // because the filtering can be time intensive, it is important to make local variables to
            // store this information, so that we don't get null pointer exceptions if users click between labs quickly.
            let shownGridData;
            let idSelectedCore: string;

            if (this._labInfo && this._labInfo && selectedCore) {

                shownGridData = _.cloneDeep(this._labInfo.creditCardBillingAccounts);
                idSelectedCore = selectedCore.value;

                if (!shownGridData) {
                    shownGridData = [];
                } else if (!Array.isArray(shownGridData)) {
                    shownGridData = [shownGridData.BillingAccount];
                }

                shownGridData = shownGridData.filter((a, b) => {
                    return (selectedCore) ? a.idCoreFacility === idSelectedCore : false;
                });
            } else {
                shownGridData = [];
            }

            this.creditCardGridApi.setColumnDefs(this.getCreditCardColumnDefs(shownGridData));
            this.creditCardGridApi.setRowData(shownGridData);
            this.creditCardGridApi.sizeColumnsToFit();
        }
    }


    openChartfieldEditor(rowData: any) {
        let dialogRef = this.dialog.open(EditBillingAccountComponent, {
            width: '60em',
            panelClass: 'no-padding-dialog'
        });
        dialogRef.componentInstance.rowData = rowData;

        dialogRef.afterClosed().subscribe((result) => {
            console.log("Editor closed!");
        });
    }

    openPoEditor(rowData: any) {
        let dialogRef = this.dialog.open(EditBillingAccountComponent, {
            width: '60em',
            panelClass: 'no-padding-dialog'
        });
        dialogRef.componentInstance.rowData = rowData;

        dialogRef.afterClosed().subscribe((result) => {
            console.log("Editor closed!");
        });
    }

    openCreditCardEditor(rowData: any) {
        let dialogRef = this.dialog.open(EditBillingAccountComponent, {
            width: '60em',
            panelClass: 'no-padding-dialog'
        });
        dialogRef.componentInstance.rowData = rowData;

        dialogRef.afterClosed().subscribe((result) => {
            console.log("Editor closed!");
        });
    }


    onChartfieldUsersClicked(rowIndex: string): void {
        let dialogRef = this.dialog.open(BillingUsersSelectorComponent, {
            width: '60em',
            panelClass: 'no-padding-dialog'
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log("Editor closed!");
        });
    }

    onPoUsersClicked(rowIndex: string): void {
        let dialogRef = this.dialog.open(BillingUsersSelectorComponent, {
            width: '60em',
            panelClass: 'no-padding-dialog'
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log("Editor closed!");
        });
    }

    onCreditCardUsersClicked(rowIndex: string): void {
        let dialogRef = this.dialog.open(BillingUsersSelectorComponent, {
            width: '60em',
            panelClass: 'no-padding-dialog'
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log("Editor closed!");
        });
    }


    onPoUploadClicked(rowIndex: string) {
        console.log("Should open uploader for po and index: " + rowIndex);
    }

    onPoViewClicked(rowIndex: string) {
        console.log("Should view po and index: " + rowIndex);
    }

    onPoRemoveClicked(rowIndex: string) {
        console.log("Should remove po and index: " + rowIndex);
    }

    removeChartfieldRow(rowIndex: string) {
        console.log("Should remove index: " + rowIndex);
    }


    onChartfieldGridSizeChanged(): void {
        if (this.chartfieldGridApi) {
            this.chartfieldGridApi.sizeColumnsToFit();
        }
    }

    onPoGridSizeChanged(): void {
        if (this.poGridApi) {
            this.poGridApi.sizeColumnsToFit();
        }
    }

    onCreditCardGridSizeChanged(): void {
        if (this.creditCardGridApi) {
            this.creditCardGridApi.sizeColumnsToFit();
        }
    }


    onAddAccount1Clicked(): void {
        this.showAddAccountBox = true;
    }

    onCopyAccountsClicked(): void {

    }

    onHideClicked(): void {
        this.showAddAccountBox = false;
    }


    testingFunction(message: string): void {
        console.log("testing function reached with message: \n" + message);
    }

    onClickDebug(): void {
        console.log("_labInfo : " + this._labInfo);
        // this.chartfieldGridApi.sizeColumnsToFit();

        this.assignChartfieldGridContents(this.selectedCoreFacility);
        this.assignPoGridContents(this.selectedCoreFacility);
        this.assignCreditCardGridContents(this.selectedCoreFacility);

    }
}