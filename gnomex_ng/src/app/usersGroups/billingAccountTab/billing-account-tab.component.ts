import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ErrorStateMatcher, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";

import {DictionaryService} from "../../services/dictionary.service";
import {PropertyService} from "../../services/property.service";

import {EditBillingAccountComponent} from "../../billing/edit_billing_account/edit-billing-account.component";

import { ApproveButtonRenderer } from "../../util/grid-renderers/approve-button.renderer";
import { CheckboxRenderer } from "../../util/grid-renderers/checkbox.renderer";
import { DateEditor } from "../../util/grid-editors/date.editor";
import { DateRenderer } from "../../util/grid-renderers/date.renderer";
import { IconLinkButtonRenderer } from "../../util/grid-renderers/icon-link-button.renderer";
import { SplitStringToMultipleLinesRenderer } from "../../util/grid-renderers/split-string-to-multiple-lines.renderer";
import { RemoveLinkButtonRenderer } from "../../util/grid-renderers/remove-link-button.renderer";
import { SelectEditor } from "../../util/grid-editors/select.editor";
import { SelectRenderer } from "../../util/grid-renderers/select.renderer";
import { TextAlignLeftMiddleRenderer } from "../../util/grid-renderers/text-align-left-middle.renderer";
import { TextAlignRightMiddleRenderer } from "../../util/grid-renderers/text-align-right-middle.renderer";
import { UploadViewRemoveRenderer } from "../../util/grid-renderers/upload-view-remove.renderer";


import * as _ from "lodash";
import {DateParserComponent} from "../../util/parsers/date-parser.component";
import {AccountFieldsConfigurationService} from "../../services/account-fields-configuration.service";
import {Subscription} from "rxjs";
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from "@angular/forms";

import { BillingUsersSelectorComponent } from "./billingUsersSelector/billing-users-selector.component";
import {DialogsService} from "../../util/popup/dialogs.service";
import {CopyAccountsDialogComponent} from "./dialogs/copy-accounts-dialog.component";
import {UniqueIdGeneratorService} from "../../services/unique-id-generator.service";

export class EditBillingAccountStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control && control.invalid && control.touched && (control.dirty || (form && form.submitted)));
    }
}

@Component ({
	selector: "billing-account-tab",
	templateUrl: "./billing-account-tab.component.html",
	styles: [`
        
        .border {  
            width: 50%;  
            margin-bottom: 0.8em;  
            padding: 0.5em;  
            border: 1px solid lightgrey;  
            border-radius: 3px;  
        }
        
        .t  { display: table;      }  
        .tr { display: table-row;  }  
        .td { display: table-cell; }
        
        .block        { display: block;        }  
        .inline-block { display: inline-block; }
        
        
        .padded { padding: 0.3em; }
        
        .padded-not-bottom { 
            padding-top:   0.3em;
            padding-left:  0.3em;
            padding-right: 0.3em; 
        }

        .medium-width    { width:  20em;  }
        .vertical-spacer { height: 0.3em; }
        
        .small-font { font-size: x-small; }

        .no-height { height: 0;   }
        .single-em { width:  1em; }
        
	`]
})
export class BillingAccountTabComponent implements AfterViewInit, OnInit, OnDestroy {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

	readonly CHARTFIELD:  string = 'CHARTFIELD';
	readonly PO:          string = 'PO';
	readonly CREDIT_CARD: string = 'CREDIT_CARD';

	private _labInfo: any;

	public tabFormGroup: FormGroup = new FormGroup({});

	context;

	@Input() set labInfo(value :any) {
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

    private emToPxConversionRate: number = 1;

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

    private chartfieldRowNode_LastSelected;
    private poRowNode_LastSelected;
    private creditCardRowNode_LastSelected;

    private hasReceivedInternalAccountFieldsConfiguration: boolean = false;
    private hasReceivedOtherAccountFieldsConfiguration: boolean = false;


    constructor(private dictionaryService: DictionaryService,
                private dialogsService: DialogsService,
                private propertyService: PropertyService,
                private accountFieldsConfigurationService: AccountFieldsConfigurationService,
                private dialog: MatDialog,
                private idGenerator: UniqueIdGeneratorService) {
		this.context = { componentParent: this };
	}

    ngOnInit(): void {
        this.initializeCustomizedFields();
        this.onLabChanged();
    }

    private initializeCustomizedFields() {
        this.usesCustomChartfields = this.propertyService.getExactProperty('configurable_billing_accounts').propertyValue;

        if (this.usesCustomChartfields === 'Y') {
            for (let i = 0; i < 5; i++) {
                if (!this.internalCustomFieldsFormControl[i]) {
                    this.internalCustomFieldsFormControl[i] = new FormControl('', []);
                }
                if (!this.internalCustomFieldsStateMatcher[i]) {
                    this.internalCustomFieldsStateMatcher[i] = new EditBillingAccountStateMatcher();
                }
            }

            if (!this.internalAccountsFieldsConfigurationSubscription) {
                this.internalAccountsFieldsConfigurationSubscription =
                    this.accountFieldsConfigurationService.getInternalAccountFieldsConfigurationObservable().subscribe((response) => {
                        if (!this.hasReceivedInternalAccountFieldsConfiguration) {
                            this.hasReceivedInternalAccountFieldsConfiguration = true;
                            this.processInternalAccountFieldsConfigurations(response);

                            if (this.hasReceivedOtherAccountFieldsConfiguration) {
                                this.assignChartfieldGridContents(this.selectedCoreFacility);
                            }
                        }
                    });
            }

            if (!this.otherAccountsFieldsConfigurationSubscription) {
                this.otherAccountsFieldsConfigurationSubscription =
                    this.accountFieldsConfigurationService.getOtherAccountFieldsConfigurationObservable().subscribe((response) => {
                        if (!this.hasReceivedOtherAccountFieldsConfiguration) {
                            this.hasReceivedOtherAccountFieldsConfiguration = true;
                            this.processOtherAccountFieldsConfigurations(response);

                            if (this.hasReceivedInternalAccountFieldsConfiguration) {
                                this.assignChartfieldGridContents(this.selectedCoreFacility);
                            }
                        }
                    });
            }

            this.accountFieldsConfigurationService.publishAccountFieldConfigurations();
        }
    }

    ngAfterViewInit(): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }
    }

    ngOnDestroy(): void {
        if (this.internalAccountsFieldsConfigurationSubscription) {
            this.internalAccountsFieldsConfigurationSubscription.unsubscribe();
        }
        if (this.otherAccountsFieldsConfigurationSubscription) {
            this.otherAccountsFieldsConfigurationSubscription.unsubscribe();
        }
    }

	// All the data on this component needs to be updated when the selected lab is changed (auto-detected
	// when the input "labInfo" changes).
	private onLabChanged() {
		this.selectedCoreFacility = this.getDefaultCoreFacility();
		this.labActiveSubmitters = this.getActiveSubmitters();

		if (this.chartfieldGridApi) {
            this.chartfieldGridApi.formGroup = null;
        }
        if (this.chartfieldGridApi) {
            this.poGridApi.formGroup = null;
        }
        if (this.chartfieldGridApi) {
            this.creditCardGridApi.formGroup = null;
        }

        this.assignChartfieldGridContents(this.selectedCoreFacility);
		this.assignPoGridContents(this.selectedCoreFacility);
		this.assignCreditCardGridContents(this.selectedCoreFacility);

		this.showAddAccountBox = false;
		this.creditCardCompanies = this.dictionaryService.getEntries(DictionaryService.CREDIT_CARD_COMPANY);
        this.fundingAgencies = this.dictionaryService.getEntries(DictionaryService.FUNDING_AGENCY);
		//this.userList = this.dictionaryService.getEntries(DictionaryService.USE)

        this.tabFormGroup.removeControl("chartfieldGridFormControl");
        this.tabFormGroup.removeControl("poGridFormControl");
        this.tabFormGroup.removeControl("creditCardGridFormControl");
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
						if (a.display && b.display && a.display.toLowerCase() > b.display.toLowerCase()){
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
					if (activeSubmitter.value && activeSubmitter.value !== '' && activeSubmitter.display && activeSubmitter.display !== '') {
						results.set(activeSubmitter.value, activeSubmitter);
					}
				}
			} else {
				if (this._labInfo.activeSubmitters.AppUser.value && this._labInfo.activeSubmitters.AppUser.value !== ''
						&& this._labInfo.activeSubmitters.AppUser.display && this._labInfo.activeSubmitters.AppUser.display !== '') {
					results.set(this._labInfo.activeSubmitters.AppUser.value, _.cloneDeep([this._labInfo.activeSubmitters.AppUser]));
				}
			}
		}

		// Then, add in any extra users who were added to various accounts
		if (this._labInfo.billingAccounts) {
			let tempArray = this.getApprovedUsersFromBillingAccount(this._labInfo.billingAccounts);

			for (let user of tempArray) {
				if (user.value && user.value !== '' && user.display && user.display !== '') {
					results.set(user.value, user);
				}
			}
		}
		if (this._labInfo.pOBillingAccounts) {
			let tempArray = this.getApprovedUsersFromBillingAccount(this._labInfo.pOBillingAccounts);

			for (let user of tempArray) {
				if (user.value && user.value !== '' && user.display && user.display !== '') {
					results.set(user.value, user);
				}
			}
		}
		if (this._labInfo.creditCardBillingAccounts) {
			let tempArray = this.getApprovedUsersFromBillingAccount(this._labInfo.creditCardBillingAccounts);

			for (let user of tempArray) {
				if (user.value && user.value !== '' && user.display && user.display !== '') {
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

        let anyAccountsNeedApproval: boolean = false;
        for (let row of shownGridData) {
            if (row.isApproved && row.isApproved.toLowerCase() === 'n') {
                anyAccountsNeedApproval = true;
                break;
            }
        }

        if (anyAccountsNeedApproval) {
            columnDefinitions.push({
                headerName: "",
                editable: false,
                width:    4 * this.emToPxConversionRate,
                maxWidth: 4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                cellRendererFramework: ApproveButtonRenderer,
                onClick: "onApproveButtonClicked_chartfield",
                field: "isApproved"
            });
        }
        columnDefinitions.push({
            headerName: "Account name",
            editable: false,
            width: 200,
            minWidth: 10 * this.emToPxConversionRate,
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
                    width:    4 * this.emToPxConversionRate,
                    maxWidth: 6 * this.emToPxConversionRate,
                    minWidth: 4 * this.emToPxConversionRate,
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
                    width:    4 * this.emToPxConversionRate,
                    maxWidth: 4 * this.emToPxConversionRate,
                    minWidth: 4 * this.emToPxConversionRate,
                    cellRendererFramework: DateRenderer,
                    cellEditorFramework: DateEditor,
                    dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                    field: "expirationDate"
                });
            }

            if (Array.isArray(this.internalAccountFieldsConfiguration)) {
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
                            minWidth: (item.displayName ? (('' + item.displayName).length / 2.6) : 3) * this.emToPxConversionRate,
                            cellRendererFramework: TextAlignLeftMiddleRenderer,
                            field: fieldName
                        });
                    }
                }
            }

            if (this.includeInCustomField_fundingAgency) {
                columnDefinitions.push({
                    headerName: "Funding Agency",
                    editable: true,
                    width:    10 * this.emToPxConversionRate,
                    maxWidth: 10 * this.emToPxConversionRate,
                    minWidth: 10 * this.emToPxConversionRate,
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
                width:    4 * this.emToPxConversionRate,
                maxWidth: 4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                cellRendererFramework: DateRenderer,
                cellEditorFramework: DateEditor,
                dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                field: "startDate"
            });
            columnDefinitions.push({
                headerName: "Expires",
                editable: true,
                width:    4 * this.emToPxConversionRate,
                maxWidth: 4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                cellRendererFramework: DateRenderer,
                cellEditorFramework: DateEditor,
                dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                field: "expirationDate"
            });
        //        setErrors: (value: any,
        //                    data: any,
        //                    node: any,
        //                    colDef: any,
        //                    rowIndex: any,
        //                    gridApi: any) => {
        //            return (value && value === 'TEST') ? 'Invalid name' : '';
        //        },
        //        validators: [ Validators.minLength(10) ],
        //        errorMessageHeader: 'TestingTestingTesting',
        //        errorNameErrorMessageMap: [
        //            { errorName: 'minlength', errorMessage: 'Name is too short' }
        //        ],
            columnDefinitions.push({
                headerName: "Bus",
                editable: true,
                width:    2 * this.emToPxConversionRate,
                maxWidth: 2 * this.emToPxConversionRate,
                minWidth: 2 * this.emToPxConversionRate,
                validators: [
                    Validators.pattern(/^\d{2}$/)
                ],
                errorMessageHeader: 'Warning :',
                errorNameErrorMessageMap: [
                    { errorName: 'pattern', errorMessage: 'Bus should be two digits' }
                ],
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberBus"
            });
            columnDefinitions.push({
                headerName: "Org",
                editable: true,
                width:    3 * this.emToPxConversionRate,
                maxWidth: 3 * this.emToPxConversionRate,
                minWidth: 3 * this.emToPxConversionRate,
                validators: [
                    Validators.pattern(/^\d{5}$/)
                ],
                errorMessageHeader: 'Warning :',
                errorNameErrorMessageMap: [
                    { errorName: 'pattern', errorMessage: 'Org should be five digits' }
                ],
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberOrg"
            });
            columnDefinitions.push({
                headerName: "Fund",
                editable: true,
                width:    3 * this.emToPxConversionRate,
                maxWidth: 3 * this.emToPxConversionRate,
                minWidth: 3 * this.emToPxConversionRate,
                validators: [
                    Validators.pattern(/^\d{4}$/)
                ],
                errorMessageHeader: 'Warning :',
                errorNameErrorMessageMap: [
                    { errorName: 'pattern', errorMessage: 'Fund should be four digits' }
                ],
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberFund"
            });
            columnDefinitions.push({
                headerName: "Activity",
                editable: true,
                width:    3 * this.emToPxConversionRate,
                maxWidth: 3 * this.emToPxConversionRate,
                minWidth: 3 * this.emToPxConversionRate,
                validators: [
                    Validators.pattern(/^\d{5}$/)
                ],
                errorMessageHeader: 'Warning :',
                errorNameErrorMessageMap: [
                    { errorName: 'pattern', errorMessage: 'Activity should be five digits' }
                ],
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberActivity"
            });
            columnDefinitions.push({
                headerName: "Project",
                editable: true,
                width:    4.5 * this.emToPxConversionRate,
                maxWidth: 4.5 * this.emToPxConversionRate,
                minWidth: 4.5 * this.emToPxConversionRate,
                validators: [
                    Validators.pattern(/^\d{8}$/)
                ],
                errorMessageHeader: 'Warning :',
                errorNameErrorMessageMap: [
                    { errorName: 'pattern', errorMessage: 'Project should be eight digits' }
                ],
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberProject"
            });
            columnDefinitions.push({
                headerName: "Acct",
                editable: true,
                width:    3 * this.emToPxConversionRate,
                maxWidth: 3 * this.emToPxConversionRate,
                minWidth: 3 * this.emToPxConversionRate,
                validators: [
                    Validators.pattern(/^\d{5}$/)
                ],
                errorMessageHeader: 'Warning :',
                errorNameErrorMessageMap: [
                    { errorName: 'pattern', errorMessage: 'Acct should be five digits' }
                ],
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberAccount"
            });
            columnDefinitions.push({
                headerName: "AU",
                editable: true,
                width:    1.5 * this.emToPxConversionRate,
                maxWidth: 1.5 * this.emToPxConversionRate,
                minWidth: 1.5 * this.emToPxConversionRate,
                validators: [
                    Validators.pattern(/^\d{1}$/)
                ],
                errorMessageHeader: 'Warning :',
                errorNameErrorMessageMap: [
                    { errorName: 'pattern', errorMessage: 'Bus should be one digit' }
                ],
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberAu"
            });
        }

        columnDefinitions.push({
            headerName: "Submitter email",
            editable: true,
            width:    10 * this.emToPxConversionRate,
            maxWidth: 10 * this.emToPxConversionRate,
            minWidth: 10 * this.emToPxConversionRate,
            validators: [
                Validators.pattern(/^[a-zA-Z][a-zA-Z\d]*(\.[a-zA-Z\d]+)*@\d*[a-zA-Z](([a-zA-Z\d]*)|([\-a-zA-Z\d]+[a-zA-Z\d]))(\.[a-zA-Z\d]+)+$/)
            ],
            errorMessageHeader: 'Warning :',
            errorNameErrorMessageMap: [
                { errorName: 'pattern', errorMessage: 'Please enter a valid email address.' }
            ],
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "submitterEmail"
        });

        if (this.usesCustomChartfields === 'Y') {
            if (this.includeInCustomField_totalDollarAmount) {
                columnDefinitions.push({
                    headerName: "Total $ Amt",
                    editable: true,
                    width:    4 * this.emToPxConversionRate,
                    maxWidth: 4 * this.emToPxConversionRate,
                    minWidth: 4 * this.emToPxConversionRate,
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                    field: "totalDollarAmount"
                });
            }
            if (this.includeInCustomField_shortAccount) {
                columnDefinitions.push({
                    headerName: "Short acct",
                    editable: true,
                    width:    4 * this.emToPxConversionRate,
                    maxWidth: 4 * this.emToPxConversionRate,
                    minWidth: 4 * this.emToPxConversionRate,
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                    field: "shortAcct"
                });
            }
        }

        columnDefinitions.push({
            headerName: "Users",
            editable: false,
            width: 200,
            maxWidth: 12 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
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
            checkboxEditable: true,
            width:    2.5 * this.emToPxConversionRate,
            maxWidth: 2.5 * this.emToPxConversionRate,
            minWidth: 2.5 * this.emToPxConversionRate,
            cellRendererFramework: CheckboxRenderer,
            field: "activeAccount"
        });
        columnDefinitions.push({
            headerName: "$ Billed",
            editable: false,
            width:    5 * this.emToPxConversionRate,
            maxWidth: 5 * this.emToPxConversionRate,
            minWidth: 5 * this.emToPxConversionRate,
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
                width:    4 * this.emToPxConversionRate,
                maxWidth: 4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                cellRendererFramework: RemoveLinkButtonRenderer,
                onRemoveClicked: "removeChartfieldRow"
            });
        }

        return columnDefinitions;
    }

	private getPoColumnDefs(shownGridData: any[]): any[] {
		let columnDefinitions = [];

		let anyAccountsNeedApproval: boolean = false;
		for (let row of shownGridData) {
			if (row.isApproved && row.isApproved.toLowerCase() === 'n') {
				anyAccountsNeedApproval = true;
				break;
			}
		}

		if (anyAccountsNeedApproval) {
			columnDefinitions.push({
				headerName: "",
				editable: false,
                width:    4 * this.emToPxConversionRate,
                maxWidth: 4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
				cellRendererFramework: ApproveButtonRenderer,
				onClick: "onApproveButtonClicked_po",
				field: "isApproved"
			});
		}

		columnDefinitions.push({
			headerName: "PO",
			editable: false,
			width: 200,
            minWidth: 10 * this.emToPxConversionRate,
            maxWidth: 15 * this.emToPxConversionRate,
			cellRendererFramework: IconLinkButtonRenderer,
			icon: "../../../assets/email_open.png",
			onClick: "openPoEditor",
			field: "accountName"
		});
		columnDefinitions.push({
			headerName: "Starts",
			editable:  true,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
			cellRendererFramework: DateRenderer,
			cellEditorFramework: DateEditor,
			dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
			field: "startDate"
		});
		columnDefinitions.push({
			headerName: "Expires",
			editable:  true,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
			cellRendererFramework: DateRenderer,
			cellEditorFramework: DateEditor,
			dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
			field: "expirationDate"
		});
		columnDefinitions.push({
			headerName: "Purchase Order Form",
			editable:  false,
			cellRendererFramework: UploadViewRemoveRenderer,
            width:    12 * this.emToPxConversionRate,
            maxWidth: 12 * this.emToPxConversionRate,
            minWidth: 12 * this.emToPxConversionRate,
			field: "purchaseOrderForm"
		});
		columnDefinitions.push({
			headerName: "Users",
			editable: false,
            width: 200,
            maxWidth: 12 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
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
            checkboxEditable: true,
            width:    2.5 * this.emToPxConversionRate,
            maxWidth: 2.5 * this.emToPxConversionRate,
            minWidth: 2.5 * this.emToPxConversionRate,
            field: "activeAccount",
			cellRendererFramework: CheckboxRenderer
		});
		columnDefinitions.push({
			headerName: "$ Billed",
			editable: false,
            width:    5 * this.emToPxConversionRate,
            maxWidth: 5 * this.emToPxConversionRate,
            minWidth: 5 * this.emToPxConversionRate,
			field: "totalChargesToDateDisplay",
			cellRendererFramework: TextAlignRightMiddleRenderer
		});

		let gridShowRemove:boolean = false;
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
                width:    4 * this.emToPxConversionRate,
                maxWidth: 4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                cellRendererFramework: RemoveLinkButtonRenderer,
                onRemoveClicked: "removePoRow"
            });
        }

		return columnDefinitions;
	}

	private getCreditCardColumnDefs(shownGridData): any[] {
		let columnDefinitions = [];

		let anyAccountsNeedApproval: boolean = false;
		for (let row of shownGridData) {
			if (row.isApproved && row.isApproved.toLowerCase() === 'n') {
				anyAccountsNeedApproval = true;
				break;
			}
		}

		if (anyAccountsNeedApproval) {
			columnDefinitions.push({
				headerName: "",
				editable: false,
                width:    4 * this.emToPxConversionRate,
                maxWidth: 4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
				cellRendererFramework: ApproveButtonRenderer,
				onClick: "onApproveButtonClicked_creditCard",
				field: "isApproved"
			});
		}

		columnDefinitions.push({
			headerName: "Credit Card Last 4 digits",
			editable: false,
            width: 200,
            minWidth: 10 * this.emToPxConversionRate,
            maxWidth: 15 * this.emToPxConversionRate,
			cellRendererFramework: IconLinkButtonRenderer,
			icon: "../../../assets/creditcards.png",
			onClick: "openCreditCardEditor",
			field: "accountName"
		});
		columnDefinitions.push({
			headerName: "Expires",
			editable:  true,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
			cellRendererFramework: DateRenderer,
			cellEditorFramework: DateEditor,
			dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
			field: "expirationDate"
		});
		columnDefinitions.push({
			headerName: "Credit Card Company",
			editable:  true,
            width:    8 * this.emToPxConversionRate,
            maxWidth: 8 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
			field: "idCreditCardCompany",
			cellRendererFramework: SelectRenderer,
			cellEditorFramework: SelectEditor,
			selectOptions: this.creditCardCompanies,
			selectOptionsDisplayField: "display",
			selectOptionsValueField: "idCreditCardCompany"
		});
		columnDefinitions.push({
			headerName: "Zip",
			editable:  true,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
			field: "zipCode"
		});
		columnDefinitions.push({
			headerName: "Users",
			editable: false,
            width: 200,
            maxWidth: 12 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
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
            checkboxEditable: true,
            width:    2.5 * this.emToPxConversionRate,
            maxWidth: 2.5 * this.emToPxConversionRate,
            minWidth: 2.5 * this.emToPxConversionRate,
			field: "activeAccount",
			cellRendererFramework: CheckboxRenderer
		});
		columnDefinitions.push({
			headerName: "$ Billed",
			editable: false,
            width:    5 * this.emToPxConversionRate,
            maxWidth: 5 * this.emToPxConversionRate,
            minWidth: 5 * this.emToPxConversionRate,
			field: "totalChargesToDateDisplay",
			cellRendererFramework: TextAlignRightMiddleRenderer
		});

		let gridShowRemove:boolean = false;
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
                width:    4 * this.emToPxConversionRate,
                maxWidth: 4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                cellRendererFramework: RemoveLinkButtonRenderer,
                onRemoveClicked: "removeCreditCardRow"
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
		this.onGridSizeChanged(event);

        this.chartfieldGridApi.hideOverlay();
	}
	onPoGridReady(event: any): void {
		this.poGridApi = event.api;
		this.poGridColumnApi = event.columnApi;

		// set the data
		this.assignPoGridContents(this.selectedCoreFacility);
		this.onGridSizeChanged(event);
        this.poGridApi.hideOverlay();
	}
	onCreditCardGridReady(event: any): void {
		this.creditCardGridApi = event.api;
		this.creditCardGridColumnApi = event.columnApi;

		// set the data
		this.assignCreditCardGridContents(this.selectedCoreFacility);
        this.onGridSizeChanged(event);
        this.creditCardGridApi.hideOverlay();
	}


	assignChartfieldGridContents(selectedCore: any): void {
		if (this.chartfieldGridApi) {
			// Because the filtering can be time intensive, it is important to make local variables to
			// store this information, so that we don't get null pointer exceptions if users click between labs quickly.
			let shownGridData;
			let idSelectedCore: string;

			if (this._labInfo && selectedCore) {
                idSelectedCore = selectedCore.value;

                if (!this._labInfo.internalBillingAccounts) {
                    this._labInfo.internalBillingAccounts = [];
                } else if (!Array.isArray(this._labInfo.internalBillingAccounts)) {
                    this._labInfo.internalBillingAccounts = [ this._labInfo.internalBillingAccounts.BillingAccount ];
                }

                this.attachUniqueIdsIfNeeded(this._labInfo.internalBillingAccounts);

                shownGridData = this._labInfo.internalBillingAccounts;
				shownGridData = shownGridData.filter((a, b) => {
					return (selectedCore) ? a.idCoreFacility === idSelectedCore : false;
				});
			} else {
				shownGridData = [];
			}

			this.chartfieldGridApi.setRowData(shownGridData);
			this.chartfieldGridApi.setColumnDefs(this.getChartfieldColumnDefs(shownGridData));
			this.chartfieldGridApi.sizeColumnsToFit();

			if (this.tabFormGroup && this.chartfieldGridApi && this.chartfieldGridApi.formGroup) {
                this.tabFormGroup.addControl("chartfieldGridFormControl", this.chartfieldGridApi.formGroup);
            }
		}
	}

	assignPoGridContents(selectedCore: any): void {
		if (this.poGridApi) {
			// Because the filtering can be time intensive, it is important to make local variables to
			// store this information, so that we don't get null pointer exceptions if users click between labs quickly.
			let shownGridData;
			let idSelectedCore: string;

			if (this._labInfo && selectedCore) {
				idSelectedCore = selectedCore.value;

				if (!this._labInfo.pOBillingAccounts) {
                    this._labInfo.pOBillingAccounts = [];
				} else if (!Array.isArray(this._labInfo.pOBillingAccounts)) {
                    this._labInfo.pOBillingAccounts = [ this._labInfo.pOBillingAccounts.BillingAccount ];
				}

                this.attachUniqueIdsIfNeeded(this._labInfo.pOBillingAccounts);

                shownGridData = this._labInfo.pOBillingAccounts;
				shownGridData = shownGridData.filter((a, b) => {
					return (selectedCore) ? a.idCoreFacility === idSelectedCore : false;
				});
			} else {
				shownGridData = [];
			}

			this.poGridApi.setRowData(shownGridData);
			this.poGridApi.setColumnDefs(this.getPoColumnDefs(shownGridData));
			this.poGridApi.sizeColumnsToFit();

            if (this.tabFormGroup && this.poGridApi && this.poGridApi.formGroup) {
                this.tabFormGroup.addControl("poGridFormControl", this.poGridApi.formGroup);
            }
		}
	}

	assignCreditCardGridContents(selectedCore: any): void {
		if (this.creditCardGridApi) {
			// because the filtering can be time intensive, it is important to make local variables to
			// store this information, so that we don't get null pointer exceptions if users click between labs quickly.
			let shownGridData;
			let idSelectedCore: string;

			if (this._labInfo && selectedCore) {
				idSelectedCore = selectedCore.value;

				if (!this._labInfo.creditCardBillingAccounts) {
                    this._labInfo.creditCardBillingAccounts = [];
				} else if (!Array.isArray(this._labInfo.creditCardBillingAccounts)) {
                    this._labInfo.creditCardBillingAccounts = [ this._labInfo.creditCardBillingAccounts.BillingAccount ];
				}

                this.attachUniqueIdsIfNeeded(this._labInfo.creditCardBillingAccounts);

                shownGridData = this._labInfo.creditCardBillingAccounts;
				shownGridData = shownGridData.filter((a, b) => {
					return (selectedCore) ? a.idCoreFacility === idSelectedCore : false;
				});
			} else {
				shownGridData = [];
			}

			this.creditCardGridApi.setColumnDefs(this.getCreditCardColumnDefs(shownGridData));
			this.creditCardGridApi.setRowData(shownGridData);
			this.creditCardGridApi.sizeColumnsToFit();

            if (this.tabFormGroup && this.creditCardGridApi && this.creditCardGridApi.formGroup) {
                this.tabFormGroup.addControl("creditCardGridFormControl", this.creditCardGridApi.formGroup);
            }
		}
	}


	onApproveButtonClicked_chartfield(node: any) {
        if (node && node.data) {
            node.data.isApproved = 'Y';
        }

        this.translateChangesOntoAccountRecords(node);

        this.assignChartfieldGridContents(this.selectedCoreFacility);
	}

	onApproveButtonClicked_po(node: any) {
        if (node && node.data) {
            node.data.isApproved = 'Y';
        }

        this.translateChangesOntoAccountRecords(node);

        this.assignPoGridContents(this.selectedCoreFacility);
	}

	onApproveButtonClicked_creditCard(node: any) {
        if (node && node.data) {
            node.data.isApproved = 'Y';
        }

        this.translateChangesOntoAccountRecords(node);

        this.assignCreditCardGridContents(this.selectedCoreFacility);
	}


    openChartfieldEditor(rowNode: any) {
        this.chartfieldRowNode_LastSelected = rowNode.id;

        let data = { labActiveSubmitters: this.labActiveSubmitters };

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = '60em';
        configuration.panelClass = 'no-padding-dialog';
        configuration.data = data;

        let dialogRef = this.dialog.open(EditBillingAccountComponent, configuration);
        dialogRef.componentInstance.rowData = rowNode.data;

        dialogRef.afterClosed().subscribe((result) => {
            // We only expect a result back if the popup's "OK" button was clicked.
            if (!result) {
                return;
            }

            this.updateAccount(this.chartfieldGridApi, this.chartfieldRowNode_LastSelected, result);

            this.dialogsService.alert('Screen has been updated. Click the save button to update the accounts in the database.');

            this.translateChangesOntoAccountRecords(rowNode);
        });
    }

    openPoEditor(rowNode: any) {
        this.poRowNode_LastSelected = rowNode.id;

        let data = { labActiveSubmitters: this.labActiveSubmitters };

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = '60em';
        configuration.panelClass = 'no-padding-dialog';
        configuration.data = data;

        let dialogRef = this.dialog.open(EditBillingAccountComponent, configuration);
        dialogRef.componentInstance.rowData = rowNode.data;

        dialogRef.afterClosed().subscribe((result) => {
            // We only expect a result back if the popup's "OK" button was clicked.
            if (!result) {
                return;
            }
            this.updateAccount(this.chartfieldGridApi, this.chartfieldRowNode_LastSelected, result);

            this.dialogsService.alert('Screen has been updated. Click the save button to update the accounts in the database.');

            this.translateChangesOntoAccountRecords(rowNode);
        });
    }

    openCreditCardEditor(rowNode: any) {
        this.creditCardRowNode_LastSelected = rowNode.id;

        let data = { labActiveSubmitters: this.labActiveSubmitters };

	    let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = '60em';
        configuration.panelClass = 'no-padding-dialog';
        configuration.data = data;

        let dialogRef = this.dialog.open(EditBillingAccountComponent, configuration);
        dialogRef.componentInstance.rowData = rowNode.data;

        dialogRef.afterClosed().subscribe((result) => {
            // We only expect a result back if the popup's "OK" button was clicked.
            if (!result) {
                return;
            }
            this.updateAccount(this.chartfieldGridApi, this.chartfieldRowNode_LastSelected, result);

            this.dialogsService.alert('Screen has been updated. Click the save button to update the accounts in the database.');

            this.translateChangesOntoAccountRecords(rowNode);
        });
    }

    private updateAccount(originalGridApi: any, lastSelectedId: any, account: any): void {
        if (!originalGridApi || !lastSelectedId || !account
            || !(originalGridApi.getRowNode(lastSelectedId))
            || account.isPO === undefined
            || account.isCreditCard === undefined) {
            return;
        }

        if (account._uniqueId === undefined) {
            account._uniqueId = this.idGenerator.generateNextId();
        }

        if (originalGridApi === this.chartfieldGridApi) {
            this._labInfo.internalBillingAccounts = this._labInfo.internalBillingAccounts.filter((a, b) => {
                return a._uniqueId !== account._uniqueId;
            });
        } else if (originalGridApi === this.poGridApi) {
            this._labInfo.pOBillingAccounts = this._labInfo.pOBillingAccounts.filter((a, b) => {
                return a._uniqueId !== account._uniqueId;
            });
        } else if (originalGridApi === this.creditCardGridApi) {
            this._labInfo.creditCardBillingAccounts = this._labInfo.creditCardBillingAccounts.filter((a, b) => {
                return a._uniqueId !== account._uniqueId;
            });
        } else {
            return;
        }

        // let deleteTransaction = { remove: [originalGridApi.getRowNode(lastSelectedId).data] };
        // originalGridApi.updateRowData(deleteTransaction);

        if (account.isPO !== 'Y' && account.isCreditCard !== 'Y') {
            if (this._labInfo && this._labInfo.internalBillingAccounts) {
                this._labInfo.internalBillingAccounts.push(account);
            }
        } else if (account.isPO === 'Y') {
            if (this._labInfo && this._labInfo.pOBillingAccounts) {
                this._labInfo.pOBillingAccounts.push(account);
            }
        } else {
            if (this._labInfo && this._labInfo.creditCardBillingAccounts) {
                this._labInfo.creditCardBillingAccounts.push(account);
            }
        }

        this.assignChartfieldGridContents(this.selectedCoreFacility);
        this.assignPoGridContents(this.selectedCoreFacility);
        this.assignCreditCardGridContents(this.selectedCoreFacility);
    }


	onChartfieldUsersClicked(rowIndex: string): void {
		if (this.chartfieldGridApi && this.chartfieldGridApi.getDisplayedRowAtIndex(rowIndex) && this.chartfieldGridApi.getDisplayedRowAtIndex(rowIndex).data) {
			let data = {
				options: this.labActiveSubmitters,
				optionName: "Users",
				value: this.chartfieldGridApi.getDisplayedRowAtIndex(rowIndex).data.acctUsers,
				valueField: "value",
				displayField: "display"
			};

            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = '60em';
            configuration.height = '45em';
            configuration.panelClass = 'no-padding-dialog';
            configuration.data = data;

			let dialogRef = this.dialog.open(BillingUsersSelectorComponent, configuration);

			dialogRef.afterClosed().subscribe((result) => {
				if (dialogRef
                    && dialogRef.componentInstance
                    && this.chartfieldGridApi
                    && this.chartfieldGridApi.getDisplayedRowAtIndex(rowIndex)
                    && this.chartfieldGridApi.getDisplayedRowAtIndex(rowIndex).data) {
					this.chartfieldGridApi.getDisplayedRowAtIndex(rowIndex).data.acctUsers = dialogRef.componentInstance.value;
					this.chartfieldGridApi.refreshCells();
				}
			});
		}
	}

	onPoUsersClicked(rowIndex: string): void {
		if (this.poGridApi && this.poGridApi.getDisplayedRowAtIndex(rowIndex) && this.poGridApi.getDisplayedRowAtIndex(rowIndex).data) {
			let data = {
				options: this.labActiveSubmitters,
				optionName: "Users",
				value: this.poGridApi.getDisplayedRowAtIndex(rowIndex).data.acctUsers,
				valueField: "value",
				displayField: "display"
			};

            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = '60em';
            configuration.height = '45em';
            configuration.panelClass = 'no-padding-dialog';
            configuration.data = data;

			let dialogRef = this.dialog.open(BillingUsersSelectorComponent, configuration);

			dialogRef.afterClosed().subscribe((result) => {
				if (dialogRef
                    && dialogRef.componentInstance
                    && this.poGridApi
                    && this.poGridApi.getDisplayedRowAtIndex(rowIndex)
                    && this.poGridApi.getDisplayedRowAtIndex(rowIndex).data) {
					this.poGridApi.getDisplayedRowAtIndex(rowIndex).data.acctUsers = dialogRef.componentInstance.value;
					this.poGridApi.refreshCells();
				}
			});
		}
	}

	onCreditCardUsersClicked(rowIndex: string): void {
		if (this.creditCardGridApi && this.creditCardGridApi.getDisplayedRowAtIndex(rowIndex) && this.creditCardGridApi.getDisplayedRowAtIndex(rowIndex).data) {
			let data = {
				options: this.labActiveSubmitters,
				optionName: "Users",
				value: this.creditCardGridApi.getDisplayedRowAtIndex(rowIndex).data.acctUsers,
				valueField: "value",
				displayField: "display"
			};

            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = '60em';
            configuration.height = '45em';
            configuration.panelClass = 'no-padding-dialog';
            configuration.data = data;

			let dialogRef = this.dialog.open(BillingUsersSelectorComponent, configuration);

			dialogRef.afterClosed().subscribe((result) => {
				if (dialogRef
                    && dialogRef.componentInstance
                    && this.creditCardGridApi
                    && this.creditCardGridApi.getDisplayedRowAtIndex(rowIndex)
                    && this.creditCardGridApi.getDisplayedRowAtIndex(rowIndex).data) {
					this.creditCardGridApi.getDisplayedRowAtIndex(rowIndex).data.acctUsers = dialogRef.componentInstance.value;
					this.creditCardGridApi.refreshCells();
				}
			});
		}
	}

    removeChartfieldRow (node: any) {
	    if (node && node.data && node.data.idBillingAccount && this._labInfo.internalBillingAccounts) {
	        if (!Array.isArray(this._labInfo.internalBillingAccounts)) {
                this._labInfo.internalBillingAccounts = [this._labInfo.internalBillingAccounts];
            }

            this._labInfo.internalBillingAccounts = this._labInfo.internalBillingAccounts.filter((a, b) => {
	            return a.idBillingAccount != node.data.idBillingAccount;
            });

            this.assignChartfieldGridContents(this.selectedCoreFacility);
        }
    }
    removePoRow (node: any) {
        if (node && node.data && node.data.idBillingAccount && this._labInfo.pOBillingAccounts) {
            if (!Array.isArray(this._labInfo.pOBillingAccounts)) {
                this._labInfo.pOBillingAccounts = [this._labInfo.pOBillingAccounts];
            }

            this._labInfo.pOBillingAccounts = this._labInfo.pOBillingAccounts.filter((a, b) => {
                return a.idBillingAccount != node.data.idBillingAccount;
            });

            this.assignPoGridContents(this.selectedCoreFacility);
        }
    }
    removeCreditCardRow (node: any) {
        if (node && node.data && node.data.idBillingAccount && this._labInfo.creditCardBillingAccounts) {
            if (!Array.isArray(this._labInfo.creditCardBillingAccounts)) {
                this._labInfo.creditCardBillingAccounts = [this._labInfo.creditCardBillingAccounts];
            }

            this._labInfo.creditCardBillingAccounts = this._labInfo.creditCardBillingAccounts.filter((a, b) => {
                return a.idBillingAccount != node.data.idBillingAccount;
            });

            this.assignCreditCardGridContents(this.selectedCoreFacility);
        }
    }

	onGridSizeChanged(event: any): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

		if (event && event.api) {
            event.api.sizeColumnsToFit();
		}
	}

	onAddAccountBeginClicked(): void {
		this.showAddAccountBox = true;
	}

    onAddAccountConfirmClicked(): void {
        if (!this.newAccountName
            || !this.accountType
            || !this._labInfo
            || !this.selectedCoreFacility
            || !this.selectedCoreFacility.value) {
            return;
        }

        let newAccount: any = {
            accountName: ('' + this.newAccountName),
            idBillingAccount: ('BillingAccountNN' + ('' + this.newAccountName)),
            idLab: ('' + this._labInfo.idLab),
            idCoreFacility: this.selectedCoreFacility.value,
            isApproved: 'N',
            acctUsers: ''
        };

        if (this.accountType === this.CHARTFIELD) {
            if (!this._labInfo.internalBillingAccounts) {
                this._labInfo.internalBillingAccounts = [];
            }

            newAccount.isPO         = 'N';
            newAccount.isCreditCard = 'N';
            this._labInfo.internalBillingAccounts.push(newAccount);
            this.assignChartfieldGridContents(this.selectedCoreFacility);
        } else if (this.accountType === this.PO) {
            if (!this._labInfo.pOBillingAccounts) {
                this._labInfo.pOBillingAccounts = [];
            }

            newAccount.isPO         = 'Y';
            newAccount.isCreditCard = 'N';
            this._labInfo.pOBillingAccounts.push(newAccount);
            this.assignPoGridContents(this.selectedCoreFacility);
        } else if (this.accountType === this.CREDIT_CARD) {
            if (!this._labInfo.creditCardBillingAccounts) {
                this._labInfo.creditCardBillingAccounts = [];
            }

            newAccount.isPO         = 'N';
            newAccount.isCreditCard = 'Y';
            this._labInfo.creditCardBillingAccounts.push(newAccount);
            this.assignCreditCardGridContents(this.selectedCoreFacility);
        } else {
            // Do nothing
        }
    }

    onCopyAccountsClicked(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width  = '60em';
        config.panelClass = 'no-padding-dialog';
        config.data = {
            labInfo: this._labInfo,
            creditCardCompanies: this.creditCardCompanies,
            selectedCoreFacility: this.selectedCoreFacility,
            coreFacilities: this.coreFacilities
        };

        let dialogRef = this.dialog.open(CopyAccountsDialogComponent, config);
        dialogRef.afterClosed().subscribe((data) => {
            if (!data || !data.saveButtonClicked) {
                return;
            }

            for (let account of data.chartfieldAccountRowsToCopy) {
                this._labInfo.internalBillingAccounts.push(account);
                this._labInfo.billingAccounts.push(account);
            }
            for (let account of data.poAccountRowsToCopy) {
                this._labInfo.pOBillingAccounts.push(account);
                this._labInfo.billingAccounts.push(account);
            }
            for (let account of data.creditCardAccountRowsToCopy) {
                this._labInfo.creditCardBillingAccounts.push(account);
                this._labInfo.billingAccounts.push(account);
            }

            this.assignChartfieldGridContents(this.selectedCoreFacility);
            this.assignPoGridContents(this.selectedCoreFacility);
            this.assignCreditCardGridContents(this.selectedCoreFacility);
        });
    }

    private attachUniqueIdsIfNeeded(array: any[]): void {
	    if (!array || !Array.isArray(array)) {
	        return;
        }

        for (let element of array) {
	        if (element._uniqueId === undefined) {
                element._uniqueId = this.idGenerator.generateNextId();
            }
        }
    }

    onHideClicked(): void {
        this.showAddAccountBox = false;
    }

    /**
     * This function is needed because the format we need to use to save includes all the different
     * accounts, whereas the grid is not guaranteed to do so.
     *
     * That is, it is the _labInfo's information that will be saved, not the copy in the grid. Therefore,
     * we need to transcribe changes into the full record.
     * @param eventOrDataHaver
     */
    private translateChangesOntoAccountRecords(eventOrDataHaver: any): void {
        if (!eventOrDataHaver || !eventOrDataHaver.data || !this._labInfo) {
            return;
        }

        // There should never be more than one row with the same _uniqueId, (depending on how
        // the copy account function is implemented) but this should be able to handle the changes either way.

	    let chartfieldRowsToChange: any[] = [];
        let poRowsToChange: any[] = [];
        let creditCardRowsToChange: any[] = [];

        for (let billingAccount of this._labInfo.internalBillingAccounts) {
            if (billingAccount._uniqueId === eventOrDataHaver.data._uniqueId) {
                chartfieldRowsToChange.push(billingAccount);
            }
        }
        for (let billingAccount of this._labInfo.pOBillingAccounts) {
            if (billingAccount._uniqueId === eventOrDataHaver.data._uniqueId) {
                poRowsToChange.push(billingAccount);
            }
        }
        for (let billingAccount of this._labInfo.creditCardBillingAccounts) {
            if (billingAccount._uniqueId === eventOrDataHaver.data._uniqueId) {
                creditCardRowsToChange.push(billingAccount);
            }
        }

        for (let newRow of chartfieldRowsToChange) {
            for (let rowToReplace of this._labInfo.internalBillingAccounts) {
                if (rowToReplace._uniqueId === newRow._uniqueId) {
                    rowToReplace = newRow;
                }
            }
        }
        for (let newRow of poRowsToChange) {
            for (let rowToReplace of this._labInfo.pOBillingAccounts) {
                if (rowToReplace._uniqueId === newRow._uniqueId) {
                    rowToReplace = newRow;
                }
            }
        }
        for (let newRow of creditCardRowsToChange) {
            for (let rowToReplace of this._labInfo.creditCardBillingAccounts) {
                if (rowToReplace._uniqueId === newRow._uniqueId) {
                    rowToReplace = newRow;
                }
            }
        }
    }

    testFunction(): void {
	    console.log('Changed detected');
    }
}