import {Component, Input, OnDestroy, OnInit} from "@angular/core";
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
import {Subscription} from "rxjs/Subscription";
import {FormControl, FormGroupDirective, NgForm, Validators} from "@angular/forms";

import { BillingUsersSelectorComponent } from "./billingUsersSelector/billing-users-selector.component";
import {DialogsService} from "../../util/popup/dialogs.service";
import {CopyAccountsDialogComponent} from "./dialogs/copy-accounts-dialog.component";

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
        
	`]
})
export class BillingAccountTabComponent implements OnInit, OnDestroy {

	readonly CHARTFIELD:  string = 'CHARTFIELD';
	readonly PO:          string = 'PO';
	readonly CREDIT_CARD: string = 'CREDIT_CARD';

	private _labInfo: any;

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
                private dialog: MatDialog) {
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
				width: 100,
				cellRendererFramework: ApproveButtonRenderer,
				onClick: "onApproveButtonClicked_po",
				field: "isApproved"
			});
		}

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
			editable:  true,
			width: 100,
			cellRendererFramework: DateRenderer,
			cellEditorFramework: DateEditor,
			dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
			field: "startDate"
		});
		columnDefinitions.push({
			headerName: "Expires",
			editable:  true,
			width: 100,
			cellRendererFramework: DateRenderer,
			cellEditorFramework: DateEditor,
			dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
			field: "expirationDate"
		});
		columnDefinitions.push({
			headerName: "Purchase Order Form",
			editable:  false,
			cellRendererFramework: UploadViewRemoveRenderer,
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
			width:  50,
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
                width: 100,
                cellRendererFramework: RemoveLinkButtonRenderer
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
				width: 100,
				cellRendererFramework: ApproveButtonRenderer,
				onClick: "onApproveButtonClicked_creditCard",
				field: "isApproved"
			});
		}

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
			editable:  true,
			width: 100,
			cellRendererFramework: DateRenderer,
			cellEditorFramework: DateEditor,
			dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
			field: "expirationDate"
		});
		columnDefinitions.push({
			headerName: "Credit Card Company",
			editable:  true,
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
			editable:  true,
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
			width:  50,
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
		this.onChartfieldGridSizeChanged();

        this.chartfieldGridApi.hideOverlay();
	}
	onPoGridReady(event: any): void {
		this.poGridApi = event.api;
		this.poGridColumnApi = event.columnApi;

		// set the data
		this.assignPoGridContents(this.selectedCoreFacility);
		this.onPoGridSizeChanged();
        this.poGridApi.hideOverlay();
	}
	onCreditCardGridReady(event: any): void {
		this.creditCardGridApi = event.api;
		this.creditCardGridColumnApi = event.columnApi;

		// set the data
		this.assignCreditCardGridContents(this.selectedCoreFacility);
        this.onCreditCardGridSizeChanged();
        this.creditCardGridApi.hideOverlay();
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
					shownGridData = [ shownGridData.BillingAccount ];
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
					shownGridData = [ shownGridData.BillingAccount ];
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
					shownGridData = [ shownGridData.BillingAccount ];
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


	onApproveButtonClicked_chartfield(rowIndex: string) {
		// this.chartfieldGridApi.getrowdatabyid(rowIndex).isApproved = 'Y';
		console.log("Approved clicked!");
	}

	onApproveButtonClicked_po(rowIndex: string) {
		console.log("Approved clicked!");
	}

	onApproveButtonClicked_creditCard(rowIndex: string) {
		console.log("Approved clicked!");
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
            this.chartfieldGridApi.getRowNode(this.chartfieldRowNode_LastSelected).setData(result);
            this.dialogsService.alert('Screen has been updated. Click the save button to update the accounts in the database.');
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
            this.poGridApi.getRowNode(this.poRowNode_LastSelected).setData(result);
            this.dialogsService.alert('Screen has been updated. Click the save button to update the accounts in the database.');
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
            this.creditCardGridApi.getRowNode(this.creditCardRowNode_LastSelected).setData(result);
            this.dialogsService.alert('Screen has been updated. Click the save button to update the accounts in the database.');
        });
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

    onHideClicked(): void {
        this.showAddAccountBox = false;
    }
}