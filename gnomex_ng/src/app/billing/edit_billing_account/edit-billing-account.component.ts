import { Component, OnDestroy, OnInit, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { FormControl, FormGroupDirective, NgForm, Validators } from "@angular/forms";

import {MatDialogRef, MatDialog, ErrorStateMatcher, MatDialogConfig, MAT_DIALOG_DATA} from "@angular/material";
import {Subscription} from "rxjs/Subscription";

import { EditBillingAccountErrorDialogComponent } from "./dialogs/edit-billing-account-error-dialog.component";
import { EditBillingAccountSuccessDialogComponent } from "./dialogs/edit-billing-account-success-dialog.component";

import { BillingUsersSelectorComponent } from "../../usersGroups/billingAccountTab/billingUsersSelector/billing-users-selector.component";

import { DateParserComponent } from "../../util/parsers/date-parser.component";

import { AccountFieldsConfigurationService } from "../../services/account-fields-configuration.service";
import { DictionaryService } from "../../services/dictionary.service";
import { LabListService } from "../../services/lab-list.service";
import { PropertyService } from "../../services/property.service";


@Component({
	selector: "edit-billing-account-launcher",
	template: `<div></div>`,
	styles: [``]
})
export class EditBillingAccountLauncher {

	constructor(private dialog: MatDialog,
				private router: Router) {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = '60em';
        configuration.panelClass = 'no-padding-dialog';

		let dialogRef = this.dialog.open(EditBillingAccountComponent, configuration);

		dialogRef.afterClosed().subscribe((result) => {
			// After closing the dialog, route away from this component so that the dialog could
			// potentially be reopened.
			this.router.navigate([{ outlets: {modal: null}}]);
		});
	}
}

export class EditBillingAccountStateMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		return !!(control && control.invalid && control.touched && (control.dirty || (form && form.submitted)));
	}
}

@Component({
	selector: "edit-billing-account-window",
	templateUrl: "./edit-billing-account.component.html",
	styles: [`		
		.mat-dialog-title {  
			margin: 0;  
			padding: 0;  
		}  
		.mat-dialog-content {  
			margin: 0;  
			padding: 0;  
		}  
		.mat-dialog-actions {  
			margin: 0;  
			padding: 0;  
		}
		
		div.t  { display: table; }  
		div.tr { display: table-row; }  
		div.td { display: table-cell; }
		
		p { margin: 1em 0.5em; }
		
		.full-height { height: 100%; }  
		.full-width  { width: 100%;  }
		
		.center { text-align: center; }
		
		.font-small { font-size: small; }
		
		.cell-label {  
			width: 8rem;  
			height: 2.6em;  
			vertical-align: middle;  
			font-style: italic;  
			font-size: x-small;  
			color: #1601db;  
		}
		
		.radio-button {  
			margin: 0 4em 0 0;  
			padding: 0;  
		}
		
		.background {  
			display: block;  
			position: relative;  
			background-color: white;  
			border: #d2d2d2 solid 1px;
			
			width: calc(100% - 8px);  
			margin: 3px 4px;  
		}  
		.background-sideless {  
			display: block;  
			position: relative;  
			background-color: white;  
			border-color: #d2d2d2;  
			border-style: solid;  
			border-top-width: 1px;  
			border-bottom-width: 1px;  
			border-left-width: 0;  
			border-right-width: 0;  
		}
		
		.padded {  
			position:relative;  
			width:calc(100% - 1.6em);  
			margin:0.4em 0.8em;  
		}
		
		.inline-block { display: inline-block; }  
		.top-vertical-align    { vertical-align: top; }  
		.center-vertical-align { vertical-align: middle; }
		
		.row-spacer {  
			height: 0.7em;  
		}
		
		.checkbox-container {  
			display: inline-block;  
			vertical-align: middle;  
			width: fit-content;  
		}
		
		.horizontal-break {  
			display: inline-block;  
			vertical-align: middle;  
			height: 3em;  
			width: 1px;  
			background-color: #c4cccc;  
			margin: 0.5em 0.5em 0.5em 0.5em;  
		}
		
		.mat-dialog-content {  
			background-color: #eeeeeb;  
			overflow: auto;  
			font-size: small;  
		}
	  
		.long-input    { width: 100%; }
		.medium-input  { width: 18em; }
		.short-input   { width: 4.5rem; }
		.shorter-input { width: 3rem; }
		
		.button-container {
            text-align:right; 
			padding:0.4em;
		}
		
		.header {
            background-color: #84b278; 
			color: white; 
		}
		
		.header-image {
            margin-right:0.2em;
		}
		
		.internal-account-field {
            width: 15%;
		}
		
		.date-picker-wrapper {
            display:inline-block;
			overflow:visible;
        }
		
		.date-horizontal-spacer {
            width:7em;
		}  
	`]
})
export class EditBillingAccountComponent implements OnInit, OnDestroy {

	readonly CHARTFIELD:  string = 'chartfield';
	readonly PO:          string = 'po';
	readonly CREDIT_CARD: string = 'creditCard';

	showField: string = this.CHARTFIELD;

	usesCustomChartfields: string = '';

    accountName: string = '';
	accountNameFormControl_Chartfield = new FormControl('', []);
	accountNameStateMatcher_Chartfield = new EditBillingAccountStateMatcher();
	accountNameFormControl_po = new FormControl('', []);
	accountNameStateMatcher_po = new EditBillingAccountStateMatcher();
	accountNameFormControl_creditCard = new FormControl('', []);
	accountNameStateMatcher_creditCard = new EditBillingAccountStateMatcher();

	shortAccountName: string = '';
    requireShortAcct: boolean = false;
    shortNameFormControl_Chartfield = new FormControl('', []);
    shortNameStateMatcher_Chartfield = new EditBillingAccountStateMatcher();
	shortNameFormControl_po = new FormControl('', []);
	shortNameStateMatcher_po = new EditBillingAccountStateMatcher();

	accountNumberBus_Chartfield: string = '';
	accountNumberBusFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberBusStateMatcher_chartfield = new EditBillingAccountStateMatcher();

	accountNumberOrg_Chartfield: string = '';
	accountNumberOrgFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberOrgStateMatcher_chartfield = new EditBillingAccountStateMatcher();

	accountNumberFund_Chartfield: string = '';
	accountNumberFundFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberFundStateMatcher_chartfield = new EditBillingAccountStateMatcher();

	accountNumberActivity_Chartfield: string = '';
	accountNumberActivityFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberActivityStateMatcher_chartfield = new EditBillingAccountStateMatcher();

	accountNumberProject_Chartfield: string = '';
	accountNumberProjectFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberProjectStateMatcher_chartfield = new EditBillingAccountStateMatcher();

	accountNumberAccount_Chartfield: string = '64300';
	accountNumberAccountFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberAccountStateMatcher_chartfield = new EditBillingAccountStateMatcher();

	accountNumberAU_Chartfield: string = '1';

    startDate: string = '';
    requireStartDate: boolean = true;

    effectiveUntilDate: string;
    requireExpirationDate: boolean = true;

    totalDollarAmount: string = '';
    totalDollarAmountFormControl = new FormControl('', [ Validators.pattern(/^\d*\.\d{2}$/) ]);
    totalDollarAmountStateMatcher = new EditBillingAccountStateMatcher();

	// The definition of valid email addresses can be found at
	//     https://en.wikipedia.org/wiki/Email_address#Domain
	//   at the time of writing, which this does not fully support...
	private emailPatternValidator = Validators.pattern(/^[a-zA-Z][a-zA-Z\d]*(\.[a-zA-Z\d]+)*@\d*[a-zA-Z](([a-zA-Z\d]*)|([\-a-zA-Z\d]+[a-zA-Z\d]))(\.[a-zA-Z\d]+)+$/);

    _approvedUsersValue: string = '';
    private _approvedUsersDisplay: string = '';

    submitterEmail: string = '';
    submitterEmailFormControl = new FormControl('', [ this.emailPatternValidator ]);
    submitterEmailStateMatcher = new EditBillingAccountStateMatcher();

    activeCheckBox: boolean = false;

	labList: any[] = [];
	coreFacilityReducedList: any[] = [];

	selectedLab: any = null;
	selectedCoreFacilities: any[] = [];
	selectedCreditCardCompany: any;

	private labListSubscription: Subscription = null;

	fundingAgencies: any;

	selectedFundingAgency_chartfield: any;
	selectedFundingAgency_po: any;
	selectedFundingAgency_creditCard: any;

	creditCardCompanies: any;

	showFundingAgencies: boolean = false;
	requireFundingAgency: boolean = false;

	zipCodeInput_creditCard: string = "";
	zipCodeInputFormControl_creditCard  = new FormControl('', [ Validators.pattern(/^\d{5}((\s*|(\s*-\s*))(\d{4}))?$/) ]);
	zipCodeInputStateMatcher_creditCard = new EditBillingAccountStateMatcher();

	private selectedCoreFacilitiesString: string = "";

	private internalAccountFieldsConfigurationSubscription: Subscription;
	private otherAccountFieldsConfigurationSubscription: Subscription;

	requireDollarAmount: boolean = false;

	successMessage: string = '';
	errorMessage: string = '';

	isActivity: boolean = false;
	disableCoreFacilitiesSelector = true;

	private _rowData: any;

	internalAccountFieldsConfiguration: any = [
		{
			displayName : 'customField1 default name',
			value       : '',
			isRequired  : 'N',
			minLength   : 1,
			maxLength   : 20,
			isNumber    : 'N',
			sortOrder   : 0
		},
		{
			displayName : 'customField2 default name',
			value       : '',
			isRequired  : 'N',
			minLength   : 10,
			maxLength   : 20,
			isNumber    : 'N',
			sortOrder   : 0
		},
		{
			displayName : 'customField3 default name',
			value       : '',
			isRequired  : 'N',
			minLength   : 20,
			maxLength   : 20,
			isNumber    : 'N',
			sortOrder   : 0
		},
		{
			displayName : 'customField4 default name',
			value       : '',
			isRequired  : 'N',
			minLength   : 1,
			maxLength   : 20,
			isNumber    : 'N',
			sortOrder   : 0
		},
		{
			displayName : 'customField5 default name',
			value       : '',
			isRequired  : 'N',
			minLength   : 1,
			maxLength   : 20,
			isNumber    : 'N',
			sortOrder   : 0
		}
	];

	InternalCustomFieldsFormControl: FormControl[] = [];
	InternalCustomFieldsStateMatcher: ErrorStateMatcher[] = [];

	includeInCustomField_shortAccount: boolean      = false;
	includeInCustomField_startDate: boolean         = false;
	includeInCustomField_expirationDate: boolean    = false;
	includeInCustomField_fundingAgency: boolean     = false;
	includeInCustomField_totalDollarAmount: boolean = false;

    labActiveSubmitters: any[] = [];

	constructor(private accountFieldsConfigurationService: AccountFieldsConfigurationService,
				private dialog: MatDialog,
				private dialogRef: MatDialogRef<EditBillingAccountComponent>,
				private dictionaryService: DictionaryService,
				private labListService: LabListService,
				private propertyService: PropertyService,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (data) {
            this.labActiveSubmitters = data.labActiveSubmitters;
		}
	}

	ngOnInit(): void {
		this.selectedLab = null;
		this.selectedCoreFacilities = [];

        this.submitterEmailFormControl.reset();

		let originalCreditCardCompanies = this.dictionaryService.getEntries('hci.gnomex.model.CreditCardCompany');
		originalCreditCardCompanies.sort((a, b) => { return a.sortOrder - b.sortOrder; });
		this.creditCardCompanies = [];

		if (originalCreditCardCompanies.length != undefined && originalCreditCardCompanies.length != null) {
			for (let i = 0; i < originalCreditCardCompanies.length; i++) {
				if (originalCreditCardCompanies[i].display != null && originalCreditCardCompanies[i].display != '') {
					this.creditCardCompanies.push(originalCreditCardCompanies[i]);
				}
			}
		}

		this.initializeCustomElements();
	}

	private initializeCustomElements(): void {
		if (!this.usesCustomChartfields || this.usesCustomChartfields === '') {
            this.usesCustomChartfields = this.propertyService.getExactProperty('configurable_billing_accounts').propertyValue;
		}

        if (this.usesCustomChartfields === 'Y') {
            for (let i = 0; i < 5; i++) {
            	if (!this.InternalCustomFieldsFormControl[i]) {
                    this.InternalCustomFieldsFormControl[i] = new FormControl('', []);
				}
                if (!this.InternalCustomFieldsStateMatcher[i]) {
                    this.InternalCustomFieldsStateMatcher[i] = new EditBillingAccountStateMatcher();
				}
            }

            if (!this.internalAccountFieldsConfigurationSubscription) {
                this.internalAccountFieldsConfigurationSubscription =
                    this.accountFieldsConfigurationService.getInternalAccountFieldsConfigurationObservable().subscribe((response) => {
                        this.processInternalAccountFieldsConfigurations(response);
                    });
			}
			if (!this.otherAccountFieldsConfigurationSubscription) {
                this.otherAccountFieldsConfigurationSubscription =
                    this.accountFieldsConfigurationService.getOtherAccountFieldsConfigurationObservable().subscribe((response) => {
                        this.processOtherAccountFieldsConfigurations(response);
                    });
			}

            this.accountFieldsConfigurationService.publishAccountFieldConfigurations();
        }
	}

	ngOnDestroy(): void {
		if(this.labListSubscription) {
			this.labListSubscription.unsubscribe();
		}
		if(this.internalAccountFieldsConfigurationSubscription) {
			this.internalAccountFieldsConfigurationSubscription.unsubscribe();
		}
		if(this.otherAccountFieldsConfigurationSubscription) {
			this.otherAccountFieldsConfigurationSubscription.unsubscribe();
		}
	}

	/**
	 * This function is responsible for cleaning up any custom fields being used and arranging them
	 *   correctly, as well as hooking up their validation.
	 * @param {any[]} internalAccountFieldsConfiguration
	 */
	processInternalAccountFieldsConfigurations(internalAccountFieldsConfiguration: any[]): void {
		if (!internalAccountFieldsConfiguration.length) {
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

			this.InternalCustomFieldsFormControl[i].setValidators(validators);
			this.InternalCustomFieldsFormControl[i].setErrors({'pattern':null});
			this.InternalCustomFieldsFormControl[i].updateValueAndValidity();
		}
	}

	processOtherAccountFieldsConfigurations(otherAccountFieldsConfiguration: any[]): void {
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

	private onUpdateButtonClicked(): void {
		this.errorMessage = '';

		if (this.showField == this.CHARTFIELD) {
			this.saveChartfield();
		} else if (this.showField == this.PO) {
			this.savePo();
		} else if (this.showField == this.CREDIT_CARD) {
			this.saveCreditCard();
		}
	}

	private saveChartfield(): void {

		let isPO: string = (this.showField === this.PO) ? 'Y' : 'N';
		let idLab: string = !this.selectedLab ? '' : '' + this.selectedLab.idLab;

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let idFundingAgency: string = "";

		let activeAccount: string = "";

		// The custom fields only displayed in the flex version of GNomEx if there were certain entries in the
		// "InternalAccountFieldsConfiguration" or "OtherAccountFieldsConfiguration" tables.  However, at time
		// of development this feature seems to be unused, so its implementation is delayed.
		// As a note for the future, the "AccountFieldsConfigurationService" is intended to provide access to
		// those fields.
		let custom1: string = '';
		let custom2: string = '';
		let custom3: string = '';

		let accountNumberProject: string = '';
		let accountNumberAccount: string = '';

		if (this.usesCustomChartfields === 'Y') {
			if (this.internalAccountFieldsConfiguration) {
				for (let i: number = 0; i < this.internalAccountFieldsConfiguration.length; i++) {
					switch(this.internalAccountFieldsConfiguration[i].fieldName) {
						case 'project' : accountNumberProject = this.internalAccountFieldsConfiguration[i].value; break;
						case 'account' : accountNumberAccount = this.internalAccountFieldsConfiguration[i].value; break;
						case 'custom1' : custom1 = this.internalAccountFieldsConfiguration[i].value; break;
						case 'custom2' : custom2 = this.internalAccountFieldsConfiguration[i].value; break;
						case 'custom3' : custom3 = this.internalAccountFieldsConfiguration[i].value; break;
						default : break;
					}
				}
			}
		} else {
			accountNumberProject = this.accountNumberProject_Chartfield;
			accountNumberAccount = this.accountNumberAccount_Chartfield;
		}

		if (this.selectedCoreFacilities != undefined && this.selectedCoreFacilities != null) {
			for (let i: number = 0; i < this.selectedCoreFacilities.length; i++) {
				let coreFacility: any = {
					idCoreFacility: this.selectedCoreFacilities[i].idCoreFacility,
					facilityName:   this.selectedCoreFacilities[i].display
				};
				coreFacilities.push(coreFacility);

				if (i > 0 && i + 1 < this.selectedCoreFacilities.length) {
					this.selectedCoreFacilitiesString += ', ';
				} else if (i + 1 === this.selectedCoreFacilities.length && this.selectedCoreFacilities.length != 1) {
					this.selectedCoreFacilitiesString += ' and ';
				}
				this.selectedCoreFacilitiesString += this.selectedCoreFacilities[i].display;
			}
			coreFacilitiesXMLString = JSON.stringify(coreFacilities);
		}

		if (this.activeCheckBox != null) {
			if (this.activeCheckBox) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (!!this.selectedFundingAgency_chartfield && (this.showFundingAgencies && this.usesCustomChartfields !== 'Y' || this.includeInCustomField_fundingAgency)) {
			idFundingAgency = this.selectedFundingAgency_chartfield;
		}

		if (this.areChartfieldValuesValid() && this._rowData) {

            let valueToDisplayParser: DateParserComponent = new DateParserComponent('YYYY-MM-DD', 'MM/DD/YYYY');
            let startDateOther: string = '';
            let expirationDateOther: string = '';

            if (this.startDate && this.startDate !== '') {
                startDateOther = valueToDisplayParser.parseDateString(this.startDate);
			}
            if (this.effectiveUntilDate && this.effectiveUntilDate !== '') {
                expirationDateOther = valueToDisplayParser.parseDateString(this.effectiveUntilDate);
            }

			this._rowData.idLab                    = idLab;
            this._rowData.coreFacilitiesXMLString  = coreFacilitiesXMLString;
            this._rowData.coreFacilitiesJSONString = coreFacilitiesXMLString;
            this._rowData.accountName              = this.accountName;
            this._rowData.shortAcct                = this.shortAccountName;
            this._rowData.accountNumberBus         = this.accountNumberBus_Chartfield;
            this._rowData.accountNumberOrg         = this.accountNumberOrg_Chartfield;
            this._rowData.accountNumberFund        = this.accountNumberFund_Chartfield;
            this._rowData.accountNumberActivity    = this.accountNumberActivity_Chartfield;
            this._rowData.accountNumberProject     = accountNumberProject;
            this._rowData.accountNumberAccount     = accountNumberAccount;
            this._rowData.accountNumberAu          = (this.accountNumberActivity_Chartfield.length > 0 ? this.accountNumberAU_Chartfield : '');
            this._rowData.idFundingAgency          = idFundingAgency;
            this._rowData.custom1                  = custom1;
            this._rowData.custom2                  = custom2;
            this._rowData.custom3                  = custom3;
            this._rowData.acctUsers                = this.approvedUsersValue;
            this._rowData.submitterEmail           = this.submitterEmail;
            this._rowData.startDate                = this.startDate;
            this._rowData.startDateOther           = startDateOther;
            this._rowData.expirationDate           = this.effectiveUntilDate;
            this._rowData.expirationDateOther      = expirationDateOther;
            this._rowData.totalDollarAmount        = this.totalDollarAmount;
            this._rowData.totalDollarAmountDisplay = '$' + this.totalDollarAmount;
            this._rowData.activeAccount            = activeAccount;
            this._rowData.isPO                     = isPO;

            this.dialogRef.close(this._rowData);
		} else {
			// validation has caught problems - report them.
			this.openErrorDialog();
		}
	}

	private areChartfieldValuesValid(): boolean {

		this.errorMessage = '';
		let errorFound: boolean = false;

		if (!(this.selectedLab != undefined && this.selectedLab != null && this.selectedLab !== '')) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please select a Lab\n';
		}
		if (!(this.selectedCoreFacilities.length > 0)) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please select one or more Core Facilities\n';
		}

		if (this.accountNameFormControl_Chartfield.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please provide a name for your account\n';
		}
		if (this.shortNameFormControl_Chartfield.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Error with short account name\n';
		}

		if (this.usesCustomChartfields !== 'Y') {
			if (this.accountNumberBusFormControl_chartfield.invalid) {
				errorFound = errorFound || true;
				this.errorMessage += '- "Bus" must be 2 digits\n';
			}
			if (this.accountNumberOrgFormControl_chartfield.invalid) {
				errorFound = errorFound || true;
				this.errorMessage += '- "Org" must be 5 digits\n';
			}
			if (this.accountNumberFundFormControl_chartfield.invalid) {
				errorFound = errorFound || true;
				this.errorMessage += '- "Fund" must be 4 digits\n';
			}
			if (this.accountNumberActivity_Chartfield.length == 0 && this.accountNumberProject_Chartfield.length == 0) {
				errorFound = errorFound || true;
				this.errorMessage += '- Please enter either an "Activity" or "Project" number\n';
			} else if (this.accountNumberActivity_Chartfield.length > 0 && this.accountNumberProject_Chartfield.length > 0) {
				errorFound = errorFound || true;
				this.errorMessage += '- Can only have one of "Activity" or "Project" numbers\n';
			} else {
				if (this.accountNumberActivityFormControl_chartfield.invalid) {
					errorFound = errorFound || true;
					this.errorMessage += '- "Activity" must be 5 digits\n';
				}
				if (this.accountNumberProjectFormControl_chartfield.invalid) {
					errorFound = errorFound || true;
					this.errorMessage += '- "Project" must be 5 digits\n';
				}
			}
			if (this.accountNumberAccountFormControl_chartfield.invalid) {
				errorFound = errorFound || true;
				this.errorMessage += '- "Account" must be 5 digits\n';
			}
		} else {
			for (let i: number = 0; i < this.InternalCustomFieldsFormControl.length; i++) {
				if (this.InternalCustomFieldsFormControl[i].invalid) {
					errorFound = errorFound || true;
					this.errorMessage += '- "' + this.internalAccountFieldsConfiguration[i].displayName + '" must be 5 digits\n';
				}
			}
		}

        if (this.requireStartDate
			&& ((!(this.startDate && this.startDate != ''))
			&& (this.usesCustomChartfields !== 'Y' || this.includeInCustomField_startDate))) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please pick a start date\n';
		}
		if (this.requireExpirationDate &&
			((!(this.effectiveUntilDate && this.effectiveUntilDate != ''))
				&& ((this.usesCustomChartfields !== 'Y' ||   this.includeInCustomField_startDate)  && this.includeInCustomField_expirationDate)
				&& ((this.usesCustomChartfields  == 'Y' && (!this.includeInCustomField_startDate)) && this.includeInCustomField_expirationDate))) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please pick an expiration date\n';
		}

		if(this.totalDollarAmountFormControl.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please enter an valid dollar limit\n';
		}

		if (this.submitterEmailFormControl.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please enter an email address you can be reached at\n';
		}

		return !errorFound;
	}

	private savePo(): void {
		let isPO: string = (this.showField === this.PO) ? 'Y' : 'N';
		let isCreditCard: string = (this.showField === this.CREDIT_CARD) ? 'Y' : 'N';
		let idLab: string = !this.selectedLab ? '' : '' + this.selectedLab.idLab;

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let idFundingAgency: string = "";

		let startDate: string = (this.startDate ? this.startDate : '');
		let expirationDate: string = (this.effectiveUntilDate ? this.effectiveUntilDate : '');

		let activeAccount: string = "";

		// The custom fields only displayed in the flex version of GNomEx if there were certain entries in the
		// "InternalAccountFieldsConfiguration" or "OtherAccountFieldsConfiguration" tables.  However, at time
		// of development this feature seems to be unused, so its implementation is delayed.
		// As a note for the future, the "AccountFieldsConfigurationService" is intended to provide access to
		// those fields.
		let custom1: string = '';
		let custom2: string = '';
		let custom3: string = '';

		if (this.selectedCoreFacilities != undefined && this.selectedCoreFacilities != null) {
			for (let i: number = 0; i < this.selectedCoreFacilities.length; i++) {
				let coreFacility: any = {
					idCoreFacility: this.selectedCoreFacilities[i].idCoreFacility,
					facilityName:   this.selectedCoreFacilities[i].display
				};
				coreFacilities.push(coreFacility);

				if (i > 0 && i + 1 < this.selectedCoreFacilities.length) {
					this.selectedCoreFacilitiesString += ', ';
				} else if (i + 1 === this.selectedCoreFacilities.length && this.selectedCoreFacilities.length != 1) {
					this.selectedCoreFacilitiesString += ' and ';
				}
				this.selectedCoreFacilitiesString += this.selectedCoreFacilities[i].display;
			}
			coreFacilitiesXMLString = JSON.stringify(coreFacilities);
		}

		if (!!this.selectedFundingAgency_po && this.showFundingAgencies) {
			idFundingAgency = this.selectedFundingAgency_po;
		}

		if (this.activeCheckBox != null) {
			if (this.activeCheckBox) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (this.arePoValuesValid() && this._rowData) {

            let valueToDisplayParser: DateParserComponent = new DateParserComponent('YYYY-MM-DD', 'MM/DD/YYYY');
            let startDateOther: string = '';
            let expirationDateOther: string = '';

            if (startDate && startDate !== '') {
                startDateOther = valueToDisplayParser.parseDateString(startDate);
            }
            if (expirationDate && expirationDate !== '') {
                expirationDateOther = valueToDisplayParser.parseDateString(expirationDate);
            }

            this._rowData.idLab                    = idLab;
            this._rowData.coreFacilitiesXMLString  = coreFacilitiesXMLString;
            this._rowData.coreFacilitiesJSONString = coreFacilitiesXMLString;
            this._rowData.accountName              = this.accountName;
            this._rowData.shortAcct                = this.shortAccountName;
            this._rowData.idFundingAgency          = idFundingAgency;
            this._rowData.custom1                  = custom1;
            this._rowData.custom2                  = custom2;
            this._rowData.custom3                  = custom3;
            this._rowData.acctUsers                = this.approvedUsersValue;
            this._rowData.submitterEmail           = this.submitterEmail;
            this._rowData.startDate                = startDate;
            this._rowData.startDateOther           = startDateOther;
            this._rowData.expirationDate           = expirationDate;
            this._rowData.expirationDateOther      = expirationDateOther;
            this._rowData.totalDollarAmount        = this.totalDollarAmount;
            this._rowData.totalDollarAmountDisplay = '$' + this.totalDollarAmount;
            this._rowData.activeAccount            = activeAccount;
            this._rowData.isPO                     = isPO;
            this._rowData.isCreditCard             = isCreditCard;

            this.dialogRef.close(this._rowData);
		} else {
			// validation has caught problems - report them.
			this.openErrorDialog();
		}
	}

	private arePoValuesValid(): boolean {
		this.errorMessage = '';
		let errorFound: boolean = false;

		if (!(this.selectedLab != undefined && this.selectedLab != null && this.selectedLab !== '')) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please select a Lab\n';
		}
		if (!(this.selectedCoreFacilities.length > 0)) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please select one or more Core Facilities\n';
		}

		if (this.accountNameFormControl_po.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please provide a name for your account\n';
		}
		if (this.shortNameFormControl_po.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Error with short account name\n';
		}

		if (this.requireStartDate && !(this.startDate && this.startDate != '')) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please pick a start date\n';
		}
		if (this.requireExpirationDate && !(this.effectiveUntilDate && this.effectiveUntilDate != '')) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please pick an expiration date\n';
		}

		if(this.totalDollarAmountFormControl.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please enter an valid dollar limit\n';
		}

		if (this.submitterEmailFormControl.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please enter an email address you can be reached at\n';
		}

		return !errorFound;
	}

	private saveCreditCard(): void {
		let isPO: string = (this.showField === this.PO) ? 'Y' : 'N';
		let isCreditCard: string = (this.showField === this.CREDIT_CARD) ? 'Y' : 'N';
		let idLab: string = !this.selectedLab ? '' : '' + this.selectedLab.idLab;

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let shortAcct: string = "";

		let idFundingAgency: string = "";

		let startDate: string = !!this.startDate ? this.startDate : '';
		let expirationDate: string = !!this.effectiveUntilDate ? this.effectiveUntilDate : '';

		let idCreditCardCompany: string = '' + this.selectedCreditCardCompany;

		let totalDollarAmountDisplay: string = "" + this.totalDollarAmount;
		let submitterEmail: string = "" + this.submitterEmail;
		let activeAccount: string = "";

		// The custom fields only displayed in the flex version of GNomEx if there were certain entries in the
		// "InternalAccountFieldsConfiguration" or "OtherAccountFieldsConfiguration" tables.  However, at time
		// of development this feature seems to be unused, so its implementation is delayed.
		// As a note for the future, the "AccountFieldsConfigurationService" is intended to provide access to
		// those fields.
		let custom1: string = '';
		let custom2: string = '';
		let custom3: string = '';


		if (this.selectedCoreFacilities != undefined && this.selectedCoreFacilities != null) {
			for (let i: number = 0; i < this.selectedCoreFacilities.length; i++) {
				let coreFacility: any = {
					idCoreFacility: this.selectedCoreFacilities[i].idCoreFacility,
					facilityName:   this.selectedCoreFacilities[i].display
				};
				coreFacilities.push(coreFacility);

				if (i > 0 && i + 1 < this.selectedCoreFacilities.length) {
					this.selectedCoreFacilitiesString += ', ';
				} else if (i + 1 === this.selectedCoreFacilities.length && this.selectedCoreFacilities.length != 1) {
					this.selectedCoreFacilitiesString += ' and ';
				}
				this.selectedCoreFacilitiesString += this.selectedCoreFacilities[i].display;
			}
			coreFacilitiesXMLString = JSON.stringify(coreFacilities);
		}

		if (!!this.selectedFundingAgency_creditCard && this.showFundingAgencies) {
			idFundingAgency = this.selectedFundingAgency_creditCard;
		}

		if (this.activeCheckBox != null) {
			if (this.activeCheckBox) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (this.areCreditCardValuesValid()) {

            let valueToDisplayParser: DateParserComponent = new DateParserComponent('YYYY-MM-DD', 'MM/DD/YYYY');
            let startDateOther: string = '';
            let expirationDateOther: string = '';

            if (startDate && startDate !== '') {
                startDateOther = valueToDisplayParser.parseDateString(startDate);
            }
            if (expirationDate && expirationDate !== '') {
                expirationDateOther = valueToDisplayParser.parseDateString(expirationDate);
            }

            this._rowData.idLab                    = idLab;
            this._rowData.coreFacilitiesXMLString  = coreFacilitiesXMLString;
            this._rowData.coreFacilitiesJSONString  = coreFacilitiesXMLString;
            this._rowData.accountName              = this.accountName;
            this._rowData.shortAcct                = shortAcct;
            this._rowData.idFundingAgency          = idFundingAgency;
            this._rowData.custom1                  = custom1;
            this._rowData.custom2                  = custom2;
            this._rowData.custom3                  = custom3;
            this._rowData.submitterEmail           = submitterEmail;
			this._rowData.idCreditCardCompany      = idCreditCardCompany;
            this._rowData.zipCode                  = this.zipCodeInput_creditCard;
            this._rowData.acctUsers                = this.approvedUsersValue;
            this._rowData.startDate                = startDate;
            this._rowData.startDateOther           = startDateOther;
            this._rowData.expirationDate           = expirationDate;
            this._rowData.expirationDateOther      = expirationDateOther;
            this._rowData.totalDollarAmount        = this.totalDollarAmount;
            this._rowData.totalDollarAmountDisplay = '$' + this.totalDollarAmount;
            this._rowData.activeAccount            = activeAccount;
            this._rowData.isPO                     = isPO;
            this._rowData.isCreditCard             = isCreditCard;

            this.dialogRef.close(this._rowData);
		} else {
			// validation has caught problems - report them.
			this.openErrorDialog();
		}
	}

	private areCreditCardValuesValid(): boolean {
		this.errorMessage = '';
		let errorFound: boolean = false;

		if (!(this.selectedLab != undefined && this.selectedLab != null && this.selectedLab !== '')) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please select a Lab\n';
		}
		if (!(this.selectedCoreFacilities.length > 0)) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please select one or more Core Facilities\n';
		}

		if (this.accountNameFormControl_creditCard.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please provide a name for your account\n';
		}

		if (this.requireStartDate && !(this.startDate && this.startDate != '')) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please pick a start date\n';
		}
		if (this.requireExpirationDate && !(this.effectiveUntilDate && this.effectiveUntilDate != '')) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please pick an expiration date\n';
		}

		if (this.zipCodeInputFormControl_creditCard.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please enter an valid zip code\n';
		}

		if (!this.selectedCreditCardCompany) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please choose your credit card company\n';
		}

		if (this.totalDollarAmountFormControl.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please enter an valid dollar limit\n';
		}

		if (this.submitterEmailFormControl.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please enter an email address you can be reached at\n';
		}

		return !errorFound;
	}

	private onLabLoad(lab: any): void {
		let coreFacilityApplicable: any[] = [];

		if (lab && lab.coreFacilities) {
			let coreFacilities = lab.coreFacilities;

			if (coreFacilities != undefined && coreFacilities != null) {
				if (coreFacilities[0] != undefined && coreFacilities[0] != null) {
					for (let i: number = 0; i < coreFacilities.length; i++) {
						if (coreFacilities[i].acceptOnlineWorkAuth != null
							&& coreFacilities[i].acceptOnlineWorkAuth != undefined
							&& coreFacilities[i].acceptOnlineWorkAuth === 'Y') {
							coreFacilityApplicable.push(coreFacilities[i]);
						}
					}
				} else {
					if (coreFacilities.CoreFacility != undefined && coreFacilities.CoreFacility != null) {
						if (coreFacilities.CoreFacility.acceptOnlineWorkAuth != null
							&& coreFacilities.CoreFacility.acceptOnlineWorkAuth != undefined
							&& coreFacilities.CoreFacility.acceptOnlineWorkAuth === 'Y') {
							coreFacilityApplicable.push(coreFacilities.CoreFacility);
						}
					}

				}
			}
		}

		coreFacilityApplicable.sort((a, b) => {
			let difference: number = 0;

			if (a.sortOrder && b.sortOrder) {
				difference = a.sortOrder - b.sortOrder;
			}

			if (difference == 0 && a.displayName && b.displayName) {
				difference = a.displayName.localeCompare(b.displayName);
			}

			return difference;
		});

		this.coreFacilityReducedList = coreFacilityApplicable;

		if (coreFacilityApplicable.length > 0) {
			this.disableCoreFacilitiesSelector = false;

			if (this.coreFacilityReducedList.length == 1) {
				this.selectedCoreFacilities = this.coreFacilityReducedList;
			}
		} else {
			this.disableCoreFacilitiesSelector = true;
		}
	}

	private onCoreFacilitiesSelected(event: any): void {
		if (event && event.value && event.value.length > 0) {
			this.showFundingAgencies = false;
			// Look through for core facilities which use funding agencies, if there are any, show that dropdown
			for (let i: number = 0; i < event.value.length; i++) {
				let showFundingAgency = this.propertyService.getExactProperty(this.propertyService.SHOW_FUNDING_AGENCY, event.value[i].idCoreFacility);
				if (!!showFundingAgency && showFundingAgency.propertyValue === 'Y') {
					this.showFundingAgencies = true;
					break;
				}
			}
		} else {
			this.showFundingAgencies = false;
		}
	}

	private onCancelButtonClicked(): void {
		this.dialogRef.close();
	}

	private openSuccessDialog(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = '60em';
        configuration.panelClass = 'no-padding-dialog';
        configuration.data = { successMessage: this.successMessage };

		let successDialogReference = this.dialog.open(EditBillingAccountSuccessDialogComponent, configuration);

		successDialogReference.afterClosed().subscribe(() => {
			this.dialogRef.close();
		});
	}

	private openErrorDialog(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = '60em';
        configuration.panelClass = 'no-padding-dialog';
        configuration.data = { errorMessage: this.errorMessage };

		let errorDialogReference = this.dialog.open(EditBillingAccountErrorDialogComponent, configuration);
	}

	private clearAccountNumberActivity(): void {
		if (this.showField === this.CHARTFIELD && this.accountNumberProject_Chartfield != '') {
			this.accountNumberActivity_Chartfield = '';
			this.isActivity = false;
		}
	}

	private clearAccountNumberProject(): void {
		if (this.showField === this.CHARTFIELD && this.accountNumberActivity_Chartfield != '')  {
			this.accountNumberProject_Chartfield = '';
			this.isActivity = true;
		}
	}

	set rowData(rowData: any) {
		this._rowData = rowData;
		this.applyRowData();
	}

	get rowData(): any {
		return this._rowData;
	}

	set approvedUsersValue(approvedUsersValue: string) {
        this._approvedUsersValue = approvedUsersValue;

        this._approvedUsersDisplay = '';

        if (!this._approvedUsersValue) {
            this._approvedUsersValue = '';
        	return;
		}

        let idTokens: string[] = this._approvedUsersValue.split(/,/);
        let nameTokens: string[] = [];
        let foundUser: boolean = false;

        for (let id of idTokens) {
        	foundUser = false;
        	for (let user of this.labActiveSubmitters) {
        		if (user.value === id) {
        			foundUser = true;
        			nameTokens.push(user.display);
        			break;
				}
			}
			if (!foundUser) {
        		nameTokens.push(id);
			}
		}

		nameTokens.sort((a, b) => {
        	if (a > b) {
        		return 1;
			} else if (a === b) {
        		return 0;
			} else {
        		return -1;
			}
		});

        this._approvedUsersDisplay = nameTokens.join('    ');
	}
	get approvedUsersValue(): string {
		return this._approvedUsersValue;
	}

	private applyRowData(): void {
        this.initializeCustomElements();

        if (this._rowData) {
            if (this._rowData && this._rowData.isPO === 'Y') {
                this.loadPOAccount();
            } else if (this._rowData && this._rowData.isCreditCard === 'Y') {
                this.loadCreditCardAccount();
            } else {
                this.loadChartfieldAccount();
            }
        }
	}

	private loadLabAndCoreFacilityFromRowData(): void {
        if (!this._rowData) {
            return;
        }

        // Set the selected lab!
        this.labListSubscription = this.labListService.getLabList().subscribe((response: any[]) => {
            this.labList = response;

            this.selectedLab = null;

            for (let lab of this.labList) {
                if (lab.idLab === this._rowData.idLab) {
                    this.selectedLab = lab;
                    this.onLabLoad(lab);
                    break;
                }
            }

            // This timeout is important to the sorting of the Core Facility list, for some reason.
            setTimeout(() => {
                if (!!this.selectedLab) {
                    for (let coreFacility of this.coreFacilityReducedList) {
                        if (coreFacility.idCoreFacility === this._rowData.idCoreFacility) {
                            this.selectedCoreFacilities = [coreFacility];
                            break;
                        }
                    }
                }
            });
        });
	}

    private loadChartfieldAccount(): void {
        this.showField = this.CHARTFIELD;

        if (!this._rowData) {
        	return;
		}

        this.loadLabAndCoreFacilityFromRowData();

        let originalFundingAgencies = this.dictionaryService.getEntries('hci.gnomex.model.FundingAgency');
        this.fundingAgencies = [];

        if (originalFundingAgencies.length != undefined && originalFundingAgencies.length != null) {
            for (let i = 0; i < originalFundingAgencies.length; i++) {
                if (originalFundingAgencies[i].fundingAgency != null && originalFundingAgencies[i].value != null) {
                    this.fundingAgencies.push(originalFundingAgencies[i]);
                }
            }
        }

        this.accountName                      = this._rowData.accountName;
        this.shortAccountName                 = this._rowData.shortAcct;

        this.accountNumberBus_Chartfield      = this._rowData.accountNumberBus;
        this.accountNumberOrg_Chartfield      = this._rowData.accountNumberOrg;
        this.accountNumberFund_Chartfield     = this._rowData.accountNumberFund;
        this.accountNumberActivity_Chartfield = this._rowData.accountNumberActivity;
        this.accountNumberAU_Chartfield       = this._rowData.accountNumberAu;

        this.selectedFundingAgency_chartfield = this._rowData.idFundingAgency;

        if (this.usesCustomChartfields === 'Y') {
            if (this.internalAccountFieldsConfiguration) {
                for (let i: number = 0; i < this.internalAccountFieldsConfiguration.length; i++) {
                    switch(this.internalAccountFieldsConfiguration[i].fieldName) {
                        case 'project' : this.internalAccountFieldsConfiguration[i].value = this._rowData.accountNumberProject; break;
                        case 'account' : this.internalAccountFieldsConfiguration[i].value = this._rowData.accountNumberAccount; break;
                        case 'custom1' : this.internalAccountFieldsConfiguration[i].value = this._rowData.custom1; break;
                        case 'custom2' : this.internalAccountFieldsConfiguration[i].value = this._rowData.custom2; break;
                        case 'custom3' : this.internalAccountFieldsConfiguration[i].value = this._rowData.custom3; break;
                        default : break;
                    }
                }
            }
        } else {
            this.accountNumberProject_Chartfield = this._rowData.accountNumberProject;
            this.accountNumberAccount_Chartfield = this._rowData.accountNumberAccount;
        }

		this.startDate = (this._rowData.startDate && this._rowData.startDate !== '') ? this._rowData.startDate : this._rowData.startDateOther;
        this.effectiveUntilDate = (this._rowData.expirationDate && this._rowData.expirationDate !== '') ? this._rowData.expirationDate : this._rowData.expirationDateOther;

        this.approvedUsersValue = this._rowData.approvedUsers;

        this.submitterEmail = this._rowData.submitterEmail;
        this.submitterEmailFormControl.reset();

        this.totalDollarAmount = this._rowData.totalDollarAmount;
        this.activeCheckBox = this._rowData.activeAccount === 'Y';
    }

    private loadPOAccount(): void {
        this.showField = this.PO;

        if (!this._rowData) {
            return;
        }

        this.loadLabAndCoreFacilityFromRowData();

        this.accountName = this._rowData.accountName;
        this.shortAccountName = this._rowData.shortAcct;
        this.selectedFundingAgency_po = this._rowData.idFundingAgency;
        this.submitterEmail = this._rowData.submitterEmail;
        this.startDate = (this._rowData.startDate && this._rowData.startDate !== '') ? this._rowData.startDate : this._rowData.startDateOther;
        this.effectiveUntilDate = (this._rowData.expirationDate && this._rowData.expirationDate !== '') ? this._rowData.expirationDate : this._rowData.expirationDateOther;
        this.totalDollarAmount = this._rowData.totalDollarAmountDisplay;
        this.activeCheckBox = (this._rowData.activeAccount && this._rowData.activeAccount.toLowerCase() === 'y');

        this.approvedUsersValue = this._rowData.approvedUsers;

        this.submitterEmail = this._rowData.submitterEmail;
        this.submitterEmailFormControl.reset();

        this.totalDollarAmount = this._rowData.totalDollarAmount;
        this.activeCheckBox = this._rowData.activeAccount === 'Y';
    }

    private loadCreditCardAccount(): void {
        this.showField = this.CREDIT_CARD;

        if (!this._rowData) {
            return;
        }

        this.loadLabAndCoreFacilityFromRowData();

        this.accountName = this._rowData.accountName;
        this.selectedFundingAgency_creditCard = this._rowData.idFundingAgency;
        this.startDate = (this._rowData.startDate && this._rowData.startDate !== '') ? this._rowData.startDate : this._rowData.startDateOther;
        this.effectiveUntilDate = (this._rowData.expirationDate && this._rowData.expirationDate !== '') ? this._rowData.expirationDate : this._rowData.expirationDateOther;
        this.zipCodeInput_creditCard = this._rowData.zipCode;
        this.selectedCreditCardCompany = this._rowData.idCreditCardCompany;

        this.approvedUsersValue = this._rowData.acctUsers;

        this.submitterEmail = this._rowData.submitterEmail;
        this.submitterEmailFormControl.reset();

        this.totalDollarAmount = this._rowData.totalDollarAmount;
        this.activeCheckBox = this._rowData.activeAccount === 'Y';
    }

    private onClickApprovedUsers(): void {
		let data = {
			options: this.labActiveSubmitters,
			optionName: "Users",
			value: this.approvedUsersValue,
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
			if (dialogRef && dialogRef.componentInstance) {
				this.approvedUsersValue = !!dialogRef.componentInstance.value ? dialogRef.componentInstance.value : '';
			}
		});
	}
}