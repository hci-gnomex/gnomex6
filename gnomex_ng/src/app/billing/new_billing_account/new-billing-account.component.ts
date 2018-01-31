import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild,
	ChangeDetectorRef,
	Inject
} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {Router} from "@angular/router";

import { jqxButtonComponent } from "../../../assets/jqwidgets-ts/angular_jqxbuttons"
import { jqxCheckBoxComponent } from "../../../assets/jqwidgets-ts/angular_jqxcheckbox"
import { jqxComboBoxComponent } from "../../../assets/jqwidgets-ts/angular_jqxcombobox"
import { jqxInputComponent } from "../../../assets/jqwidgets-ts/angular_jqxinput"
import { jqxWindowComponent } from "../../../assets/jqwidgets-ts/angular_jqxwindow";

import { LabListService } from "../../services/lab-list.service";
import { CreateSecurityAdvisorService } from "../../services/create-security-advisor.service";

import { MultipleSelectorComponent } from "../../util/multipleSelector/multiple-selector.component";

import { GnomexStyledDatePickerComponent } from "../../util/gnomexStyledDatePicker/gnomex-styled-date-picker.component";

import { DictionaryService } from "../../services/dictionary.service";

import { AccountFieldsConfigurationService } from "./account-fields-configuration.service";
import { NewBillingAccountService } from "./new-billing-account.service";

import {ControlValueAccessor, FormBuilder, FormControl, FormGroupDirective, FormGroup, NgForm, Validators} from "@angular/forms";

import {MatDialogRef, MatDialog, ErrorStateMatcher} from "@angular/material";
import {Subscription} from "rxjs/Subscription";
import {PropertyService} from "../../services/property.service";

@Component({
	selector: "new-billing-account-launcher",
	template: `<div></div>`,
	styles: [``]
})
export class NewBillingAccountLauncher {

	constructor(private dialog: MatDialog, private router: Router) {
		let dialogRef = this.dialog.open(NewBillingAccountComponent, { width: '60em', panelClass: 'no-padding-dialog' });

		dialogRef.afterClosed().subscribe((result) => {
			console.log('Test dialog closed!');
			// After closing the dialog, route away from this component so that the dialog could
			// potentially be reopened.
			this.router.navigate([{ outlets: {modal: null}}]);
		});
	}
}

export class NewBillingAccountStateMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		return !!(control && control.invalid && control.touched && (control.dirty || (form && form.submitted)));
	}
}

@Component({
	selector: "new-billing-account-window",
	templateUrl: "./new-billing-account.component.html",
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
			
			.save-button:focus {
					border-style: solid;
					border-color: #009dff;
			}

      div.t {
          display: table;
      }
      div.tr {
          display: table-row;
      }
      div.td {
          display: table-cell;
      }
			
			p {
					margin: 1em 0.5em;
			}
			
			.full-height {
					height: 100%;
			}
			.full-width {
					width: 100%;
			}
			
			.center {
					text-align: center;
			}
			
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

      .vertical-spacer {
          width: 100%;
          height: 3px;
      }

      .background {
          display: block;
          position: relative;
          background-color: white;
          border: #d2d2d2 solid 1px;
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
			
			.inline-block {
					display: inline-block;
			}
			
			.sub-header {
					font-size: small;
					padding-bottom: 0.2rem;
			}
			
      .row-spacer {
					height: 0.4em;
			}
			
			.center-vertical-align {
					vertical-align: middle;
			}
			
			.checkbox-container {
					display: inline-block;
					vertical-align: middle;
					width: fit-content;
			}
			
			.checkbox-label {
          height: 2.6em;
          vertical-align: middle;
          color: #1601db;
			}
			
			.horizontal-break {
					display: inline-block;
					vertical-align: middle;
					height: 3em;
					width: 1px;
					background-color: #c4cccc;
					margin: 0.5em 0.5em 0.5em 0.5em;
			}
			
			.agreement {
          color: #1601db;
					font-weight: bold;
			}
			
			.overflowable {
					overflow: visible;
			}
			
			.error-header {
					font-size: small;
					font-weight: bold;
			}
	`]
})
export class NewBillingAccountComponent implements OnInit, OnDestroy {

	@ViewChild('successWindow') successWindow: jqxWindowComponent;
	@ViewChild('errorWindow')   errorWindow:   jqxWindowComponent;

	@ViewChild('coreFacilitiesSelector')      coreFacilitiesSelector:      MultipleSelectorComponent;

	// @ViewChild('startDatePicker_chartfield') startDatePicker_chartfield: GnomexStyledDatePickerComponent;
	// @ViewChild('startDatePicker_po')         startDatePicker_po:         GnomexStyledDatePickerComponent;
	// @ViewChild('startDatePicker_creditcard') startDatePicker_creditcard: GnomexStyledDatePickerComponent;

	// @ViewChild('effectiveUntilDatePicker_chartfield') effectiveUntilDatePicker_chartfield: GnomexStyledDatePickerComponent;
	// @ViewChild('expirationDatePicker_po')             expirationDatePicker_po:             GnomexStyledDatePickerComponent;
	// @ViewChild('expirationDatePicker_creditcard')     expirationDatePicker_creditcard:     GnomexStyledDatePickerComponent;

	@ViewChild('fundingAgencyCombobox_chartfield')     fundingAgencyCombobox_chartfield:     jqxComboBoxComponent;
	@ViewChild('creditCardCompanyComboBox_creditCard') creditCardCompanyComboBox_creditCard: jqxComboBoxComponent;

	showField: string = 'chartfield';

	usesCustomChartfields: string = '';

	accountName_Chartfield: string = '';
	accountName_po: string = '';
	accountName_creditCard: string = '';

	shortAccountName_Chartfield: string = '';
	requireShortAcct: boolean = false;

	accountNumberBus_Chartfield: string = '';
	accountNumberBusFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberBusStateMatcher_chartfield = new NewBillingAccountStateMatcher();

	accountNumberOrg_Chartfield: string = '';
	accountNumberOrgFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberOrgStateMatcher_chartfield = new NewBillingAccountStateMatcher();

	accountNumberFund_Chartfield: string = '';
	accountNumberFundFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberFundStateMatcher_chartfield = new NewBillingAccountStateMatcher();

	accountNumberActivity_Chartfield: string = '';
	accountNumberActivityFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberActivityStateMatcher_chartfield = new NewBillingAccountStateMatcher();

	accountNumberProject_Chartfield: string = '';
	accountNumberProjectFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberProjectStateMatcher_chartfield = new NewBillingAccountStateMatcher();

	accountNumberAccount_Chartfield: string = '64300';
	accountNumberAccountFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*$/) ]);
	accountNumberAccountStateMatcher_chartfield = new NewBillingAccountStateMatcher();

	accountNumberAU_Chartfield: string = '1';

	startDate_chartfield: string = '';
	startDate_po: string = '';
	startDate_creditcard: string = '';

	requireStartDate: boolean = true;

	effectiveUntilDate_chartfield: string = '';
	expirationDate_po: string = '';
	expirationDate_creditcard: string = '';

	requireExpirationDate: boolean = true;

	totalDollarAmount_Chartfield: string = '';
	totalDollarAmountFormControl_chartfield  = new FormControl('', [ Validators.pattern(/^\d*\.\d{2}$/) ]);
	totalDollarAmountStateMatcher_chartfield = new NewBillingAccountStateMatcher();

	totalDollarAmount_po: string = '';
	totalDollarAmountFormControl_po  = new FormControl('', [ Validators.pattern(/^\d*\.\d{2}$/) ]);
	totalDollarAmountStateMatcher_po = new NewBillingAccountStateMatcher();

	totalDollarAmount_creditCard: string = '';
	totalDollarAmountFormControl_creditCard  = new FormControl('', [ Validators.pattern(/^\d*\.\d{2}$/) ]);
	totalDollarAmountStateMatcher_creditCard = new NewBillingAccountStateMatcher();

	// The definition of valid email addresses can be found at
	//     https://en.wikipedia.org/wiki/Email_address#Domain
	//   at the time of writing, which this does not fully support...
	private emailPatternValidator = Validators.pattern(/^[a-zA-Z][a-zA-Z\d]*(\.[a-zA-Z\d]+)*\@\d*[a-zA-Z](([a-zA-Z\d]*)|([\-a-zA-Z\d]+[a-zA-Z\d]))\.[a-zA-Z\d]+$/);

	submitterEmail_chartfield: string = '';
	submitterEmailFormControl_chartfield  = new FormControl('', [ this.emailPatternValidator ]);
	submitterEmailStateMatcher_chartfield = new NewBillingAccountStateMatcher();

	submitterEmail_po: string = '';
	submitterEmailFormControl_po  = new FormControl('', [ this.emailPatternValidator ]);
	submitterEmailStateMatcher_po = new NewBillingAccountStateMatcher();

	submitterEmail_creditcard: string = '';
	submitterEmailFormControl_creditcard  = new FormControl('', [ this.emailPatternValidator ]);
	submitterEmailStateMatcher_creditcard = new NewBillingAccountStateMatcher();

	activeCheckBox_chartfield: boolean = false;
	activeCheckBox_po: boolean = false;
	activeCheckBox_creditcard: boolean = false;

	agreementCheckbox: boolean = false;

	labList: any[] = [];
	coreFacilityReducedList: any[] = [];
	// private coreFacilityList: any[] = [];
	private labUsersList: any[] = [];
	selectedLab: any;

	private labListSubscription: Subscription = null;

	fundingAgencies: any;
	selectedFundingAgency: any;
	creditCardCompanies: any;

	showFundingAgencies: boolean = false;
	requireFundingAgency: boolean = false;

	zipCodeInput_creditCard: string = "";

	private accountName: string = "";
	private selectedCoreFacilitiesString: string = "";

	private internalAccountFieldsConfigurationSubscription: Subscription;
	private otherAccountFieldsConfigurationSubscription: Subscription;

	private lastValid_zipCodeCreditCard: string = '';

	private lastValid_totalDollarAmountChartfield: string = '';
	private lastValid_totalDollarAmountPo: string = '';
	private lastValid_totalDollarAmountCreditCard: string = '';

	requireDollarAmount: boolean = false;

	successMessage: string = '';
	usersEmail: string;
	errorMessage: string = '';

	isActivity: boolean = false;
	disableCoreFacilitiesSelector = true;

	private isOpen = false;

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


	constructor(private dictionaryService: DictionaryService,
							private labListService: LabListService,
							private propertyService: PropertyService,
							private createSecurityAdvisorService: CreateSecurityAdvisorService,
							private accountFieldsConfigurationService: AccountFieldsConfigurationService,
							private newBillingAccountService: NewBillingAccountService
	) { }

	ngOnInit(): void {
		this.labListSubscription = this.labListService.getLabList().subscribe((response: any[]) => {
			this.labList = response;
		});

		// this.coreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;

		this.usersEmail = this.createSecurityAdvisorService.userEmail;

		let originalFundingAgencies = this.dictionaryService.getEntries('hci.gnomex.model.FundingAgency');
		this.fundingAgencies = [];

		if (originalFundingAgencies.length != undefined && originalFundingAgencies.length != null) {
			for (let i = 0; i < originalFundingAgencies.length; i++) {
				if (originalFundingAgencies[i].fundingAgency != null && originalFundingAgencies[i].value != null) {
					this.fundingAgencies.push(originalFundingAgencies[i]);
				}
			}
		}

		let originalCreditCardCompanies = this.dictionaryService.getEntries('hci.gnomex.model.CreditCardCompany');
		this.creditCardCompanies = [];

		if (originalCreditCardCompanies.length != undefined && originalCreditCardCompanies.length != null) {
			for (let i = 0; i < originalCreditCardCompanies.length; i++) {
				if (originalCreditCardCompanies[i].display != null && originalCreditCardCompanies[i].display != '') {
					this.creditCardCompanies.push(originalCreditCardCompanies[i]);
				}
			}
		}

		this.usesCustomChartfields = this.propertyService.getExactProperty('configurable_billing_accounts').propertyValue;

		if (this.usesCustomChartfields === 'Y') {
			for (let i = 0; i < 5; i++) {
				this.InternalCustomFieldsFormControl[i] = new FormControl('', []);
				this.InternalCustomFieldsStateMatcher[i] = new NewBillingAccountStateMatcher();
			}

			this.internalAccountFieldsConfigurationSubscription =
					this.accountFieldsConfigurationService.getInternalAccountFieldsConfigurationObservable().subscribe((response) => {
						this.processInternalAccountFieldsConfigurations(response);
					});

			this.otherAccountFieldsConfigurationSubscription =
					this.accountFieldsConfigurationService.getOtherAccountFieldsConfigurationObservable().subscribe((response) => {
						this.processOtherAccountFieldsConfigurations(response);
					});

			this.accountFieldsConfigurationService.publishAccountFieldConfigurations();
		}
	}

	ngOnDestroy(): void {
		this.labListSubscription.unsubscribe();
		this.internalAccountFieldsConfigurationSubscription.unsubscribe();
		this.otherAccountFieldsConfigurationSubscription.unsubscribe();
	}

	/**
	 * This function is responsible for cleaning up any custom fields being used and arranging them
	 *   correctly, as well as hooking up their validation.
	 * @param {any[]} internalAccountFieldsConfiguration
	 */
	processInternalAccountFieldsConfigurations(internalAccountFieldsConfiguration: any[]): void {
		if (!internalAccountFieldsConfiguration.length) {
			console.log('Invalid input to processInternalAccountFieldsConfigurations');
			return;
		}

		this.internalAccountFieldsConfiguration = internalAccountFieldsConfiguration
				.filter((a) => { return a.include === 'Y'; })
				.sort((a, b) => { return a.sortOrder - b.sortOrder; });

		for (let i = 0; i < 5; i++) {
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
			console.log('Invalid input to processOtherAccountFieldsConfigurations');
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

	// open(): void {
	// 	if (this.isOpen) {
	// 		return;
	// 	}
	//
	// 	this.labListSubscription = this.labListService.getLabList().subscribe((response: any[]) => {
	// 		this.labList = response;
	// 	});
	//
	// 	// this.coreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;
	//
	// 	this.usersEmail = this.createSecurityAdvisorService.userEmail;
	//
	// 	let originalFundingAgencies = this.dictionaryService.getEntries('hci.gnomex.model.FundingAgency');
	// 	this.fundingAgencies = [];
	//
	// 	if (originalFundingAgencies.length != undefined && originalFundingAgencies.length != null) {
	// 		for (let i = 0; i < originalFundingAgencies.length; i++) {
	// 			if (originalFundingAgencies[i].fundingAgency != null && originalFundingAgencies[i].value != null) {
	// 				this.fundingAgencies.push(originalFundingAgencies[i]);
	// 			}
	// 		}
	// 	}
	//
	// 	let originalCreditCardCompanies = this.dictionaryService.getEntries('hci.gnomex.model.CreditCardCompany');
	// 	this.creditCardCompanies = [];
	//
	// 	if (originalCreditCardCompanies.length != undefined && originalCreditCardCompanies.length != null) {
	// 		for (let i = 0; i < originalCreditCardCompanies.length; i++) {
	// 			if (originalCreditCardCompanies[i].display != null) {
	// 				this.creditCardCompanies.push(originalCreditCardCompanies[i]);
	// 			}
	// 		}
	// 	}
	//
	// 	// this.usesCustomChartfields = this.propertyService.getExactProperty('configurable_billing_accounts').propertyValue;
	// 	//
	// 	// this.internalAccountFieldsConfigurationSubscription =
	// 	// 		this.accountFieldsConfigurationService.getInternalAccountFieldsConfigurationObservable().subscribe((response) => {
	// 	// 			this.internalAccountFieldsConfiguration = response;
	// 	// 		});
	// 	//
	// 	// this.accountFieldsConfigurationService.publishInternalAccountFieldsConfiguration();
	//
	// 	this.isOpen = true;
	// 	// this.window.open();
	// }

	close(): void {
		let temp = this.labList;
		this.isOpen = false;
		// this.window.close();
		this.successWindow.close();
		this.errorWindow.close();
	}

	changeShowField(showField: string) {
		this.showField = showField;
		// this.resizeWindow();
	}

	// private resizeWindow(): void {
	// 	this.changeDetectorRef.detectChanges();
	//
	// 	this.window.height(this.windowHeader.nativeElement.offsetHeight + this.windowBody.nativeElement.offsetHeight + 12);
	// }

	private onSaveButtonClicked(): void {
		this.errorMessage = '';

		if (this.showField == 'chartfield') {
			this.saveChartfield();
		} else if (this.showField == 'po') {
			this.savePo();
		} else if (this.showField == 'creditcard') {
			this.saveCreditCard();
		}
	}

	private saveChartfield(): void {
		this.errorMessage = '';

		let shortAcct: string = "";

		let isPO: string = (this.showField === 'po') ? 'Y' : 'N';
		let idLab: string = this.selectedLab ? '' : '' + this.selectedLab;
		let idLabRegex = /^\d+$/;

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let accountNumberBus: string = "";
		let accountNumberBusRegex = /^\d{2,2}$/;
		let accountNumberOrg: string = "";
		let accountNumberOrgRegex = /^\d{5,5}$/;
		let accountNumberFund: string = "";
		let accountNumberFundRegex = /^\d{4,4}$/;
		let accountNumberActivity: string = "";
		let accountNumberActivityRegex = /^\d{5,5}$/;
		let accountNumberProject: string = "";
		let accountNumberProjectRegex = /^\d{8,8}$/;
		let accountNumberAccount: string = "";
		let accountNumberAccountRegex = /^\d{5,5}$/;
		let accountNumberAu: string = "";

		let startDate: string = "";
		let expirationDate: string = "";

		let idFundingAgency: string = "";

		let totalDollarAmountDisplay: string = "";
		let submitterEmail: string = "";
		let submitterEmailRegex = /^[A-z]([\.\dA-z]*)@([A-z]+)((\.[A-z]+)+)$/;
		let activeAccount: string = "";

		// The custom fields only displayed in the flex version of GNomEx if there were certain entries in the
		// "InternalAccountFieldsConfiguration" or "OtherAccountFieldsConfiguration" tables.  However, at time
		// of development this feature seems to be unused, so its implementation is delayed.
		// As a note for the future, the "AccountFieldsConfigurationService" is intended to provide access to
		// those fields.
		let custom1: string = '';
		let custom2: string = '';
		let custom3: string = '';

		// if (this.labListComboBox != null) {
		// 	idLab = this.labListComboBox.val();
		//
		// 	if (!idLab.match(idLabRegex)) {
		// 		if (idLab.length == 0) {
		// 			this.errorMessage += '- Please select a lab\n';
		// 		} else {
		// 			this.errorMessage += '- Unknown error reading lab\n';
		// 		}
		// 	}
		// }

		if (this.selectedLab) {
			idLab = '' + this.selectedLab;

			if (!idLab.match(idLabRegex)) {
				if (idLab.length == 0) {
					this.errorMessage += '- Please select a lab\n';
				} else {
					this.errorMessage += '- Unknown error reading lab\n';
				}
			}
		}

		if (this.accountName_Chartfield != null) {
			this.accountName = this.accountName_Chartfield;
			if (this.accountName == '') {
				this.errorMessage += '- Please provide a name for your account\n';
			}
		}
		if (this.shortAccountName_Chartfield != null) {
			shortAcct = this.shortAccountName_Chartfield;
		}

		if (this.coreFacilitiesSelector != undefined
				&& this.coreFacilitiesSelector != null
				&& this.coreFacilitiesSelector.grid != undefined
				&& this.coreFacilitiesSelector.grid != null
				&& this.coreFacilitiesSelector.grid.theGrid != undefined
				&& this.coreFacilitiesSelector.grid.theGrid != null
				&& this.coreFacilitiesSelector.grid.getselectedrowindexes() != null) {

			let selectedIndices = this.coreFacilitiesSelector.grid.getselectedrowindexes();
			let possibleCoreFacilities = this.coreFacilitiesSelector.grid.theGrid.source().loadedData;

			this.selectedCoreFacilitiesString = '';

			for (let i: number = 0; i < selectedIndices.length; i++) {
				let coreFacility: any = {
					idCoreFacility: possibleCoreFacilities[selectedIndices[i].valueOf()].idCoreFacility,
					facilityName: possibleCoreFacilities[selectedIndices[i].valueOf()].display
				};

				coreFacilities.push(coreFacility);

				if (i > 0 && i + 1 < selectedIndices.length) {
					this.selectedCoreFacilitiesString += ', ';
				} else if (i + 1 === selectedIndices.length && selectedIndices.length != 1) {
					this.selectedCoreFacilitiesString += ' and ';
				}

				this.selectedCoreFacilitiesString += possibleCoreFacilities[selectedIndices[i].valueOf()].display;
			}

			if (coreFacilities.length == 0) {
				this.errorMessage += '- Please select at least one core facility\n';
			}

			coreFacilitiesXMLString = JSON.stringify(coreFacilities);
		}

		if (this.accountNumberBus_Chartfield != null) {
			accountNumberBus = this.accountNumberBus_Chartfield;
			if (!accountNumberBus.match(accountNumberBusRegex)) {
				this.errorMessage += "- The \"Bus\" entry must be two digits\n";
			}
		}
		if (this.accountNumberOrg_Chartfield != null) {
			accountNumberOrg = this.accountNumberOrg_Chartfield;
			if (!accountNumberOrg.match(accountNumberOrgRegex)) {
				this.errorMessage += "- The \"Org\" entry must be five digits\n";
			}
		}
		if (this.accountNumberFund_Chartfield != null) {
			accountNumberFund = this.accountNumberFund_Chartfield;
			if (!accountNumberFund.match(accountNumberFundRegex)) {
				this.errorMessage += "- The \"Fund\" entry must be four digits\n";
			}
		}
		if (this.accountNumberActivity_Chartfield != null) {
			accountNumberActivity = this.accountNumberActivity_Chartfield;
			if (accountNumberProject.length == 0) {
				if (!accountNumberActivity.match(accountNumberActivityRegex)) {
					this.errorMessage += "- The \"Activity\" entry must be five digits\n";
				}
			}
		}
		if (this.accountNumberProject_Chartfield != null) {
			accountNumberProject = this.accountNumberProject_Chartfield;
			if (accountNumberActivity.length == 0) {
				if (!accountNumberProject.match(accountNumberProjectRegex)) {
					this.errorMessage += "- The \"Project\" entry must be eight digits\n";
				}
			}
		}
		if (this.accountNumberAccount_Chartfield != null) {
			accountNumberAccount = this.accountNumberAccount_Chartfield;
			if (!accountNumberAccount.match(accountNumberAccountRegex)) {
				this.errorMessage += "- The \"Account\" entry must be five digits\n";
			}
		}
		if (this.accountNumberAU_Chartfield != null) {
			accountNumberAu = this.accountNumberAU_Chartfield;
		}

		// if (this.startDatePicker_chartfield != null && this.startDatePicker_chartfield.inputReference != null) {
		// 	startDate = this.startDatePicker_chartfield.inputReference.val();
		// }
		// if (this.effectiveUntilDatePicker_chartfield != null) {
		// 	expirationDate = this.effectiveUntilDatePicker_chartfield.inputReference.val();
		//
		// 	if (expirationDate.length == 0) {
		// 		this.errorMessage += '- Please pick an expiration date.\n';
		// 	}
		// }

		if (this.startDate_chartfield != null) {
			startDate = this.startDate_chartfield;
		}
		if (this.effectiveUntilDate_chartfield != null) {
			expirationDate = this.effectiveUntilDate_chartfield;

			if (expirationDate.length == 0) {
				this.errorMessage += '- Please pick an expiration date.\n';
			}
		}

		if(this.totalDollarAmount_Chartfield != null) {
			totalDollarAmountDisplay = this.totalDollarAmount_Chartfield;
		}

		if (this.submitterEmail_chartfield != null) {
			submitterEmail = '' + this.submitterEmail_chartfield;
			if (!submitterEmail.match(submitterEmailRegex)) {
				this.errorMessage += '- Please enter a valid email address.\n'
			}
		}

		if (this.activeCheckBox_chartfield != null) {
			if (this.activeCheckBox_chartfield) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (this.selectedFundingAgency) {
			idFundingAgency = this.selectedFundingAgency;
		}

		// if (this.fundingAgencyCombobox_chartfield != undefined
		// 		&& this.fundingAgencyCombobox_chartfield != null
		// 		&& this.fundingAgencyCombobox_chartfield.val() != null) {
		// 	idFundingAgency = '' + this.fundingAgencyCombobox_chartfield.val();
		// }

		if (this.agreementCheckbox != null) {
			if (!this.agreementCheckbox) {
				this.errorMessage += '- Please agree to the terms and conditions'
			}
		}

		console.log("" +
				"You clicked the save button with parameters : \n" +
				"    idLab                    : " + idLab + "\n" +
				"    coreFacilitiesXMLString  : " + coreFacilitiesXMLString + "\n" +
				"    accountName              : " + this.accountName + "\n" +
				"    shortAcct                : " + shortAcct + "\n" +
				"    accountNumberBus         : " + accountNumberBus + "\n" +
				"    accountNumberOrg         : " + accountNumberOrg + "\n" +
				"    accountNumberFund        : " + accountNumberFund + "\n" +
				"    accountNumberActivity    : " + accountNumberActivity + "\n" +
				"    accountNumberProject     : " + accountNumberProject + "\n" +
				"    accountNumberAccount     : " + accountNumberAccount + "\n" +
				"    accountNumberAu          : " + accountNumberAu + "\n" +
				"    idFundingAgency          : " + idFundingAgency + "\n" +
				"    custom1                  : " + custom1 + "\n" +
				"    custom2                  : " + custom2 + "\n" +
				"    custom3                  : " + custom3 + "\n" +
				"    submitterEmail           : " + submitterEmail + "\n" +
				"    startDate                : " + startDate + "\n" +
				"    expirationDate           : " + expirationDate + "\n" +
				"    totalDollarAmountDisplay : " + totalDollarAmountDisplay + "\n" +
				"    activeAccount            : " + activeAccount + "\n" +
				"    isPO                     : " + isPO + "\n"
		);

		if (this.errorMessage.length == 0) {
			let parameters: URLSearchParams = new URLSearchParams();

			parameters.set('idLab', idLab);
			parameters.set('coreFacilitiesXMLString', coreFacilitiesXMLString);
			parameters.set('accountName', this.accountName);
			parameters.set('shortAcct', shortAcct);
			parameters.set('accountNumberBus', accountNumberBus);
			parameters.set('accountNumberOrg', accountNumberOrg);
			parameters.set('accountNumberFund', accountNumberFund);
			parameters.set('accountNumberActivity', accountNumberActivity);
			parameters.set('accountNumberProject', accountNumberProject);
			parameters.set('accountNumberAccount', accountNumberAccount);
			parameters.set('accountNumberAu', accountNumberAu);
			parameters.set('idFundingAgency', idFundingAgency);
			parameters.set('custom1', custom1);
			parameters.set('custom2', custom2);
			parameters.set('custom3', custom3);
			parameters.set('submitterEmail', submitterEmail);
			parameters.set('startDate', startDate);
			parameters.set('expirationDate', expirationDate);
			parameters.set('totalDollarAmountDisplay', totalDollarAmountDisplay);
			parameters.set('activeAccount', activeAccount);
			parameters.set('isPO', isPO);


			// in original, called SubmitWorkAuthForm.gx with params :
			//    idLab: "1507"
			//    coreFacilitiesXMLString: "<coreFacilities> <CoreFacility ... /> </coreFacilities>"
			//    accountName: "tempAccount"
			//    shortAcct: ""
			//    accountNumberBus: "01"
			//    accountNumberOrg: "12345"
			//    accountNumberFund: "1234"
			//    accountNumberActivity: "12345"
			//    accountNumberProject: ""
			//    accountNumberAccount: "64300"
			//    accountNumberAu: "1"
			//    idFundingAgency: ""
			//    custom1: ""
			//    custom2: ""
			//    custom3: ""
			//    submitterEmail: "John.Hofer@hci.utah.edu"
			//    startDate: "11/01/2017"
			//    expirationDate: "03/01/2018"
			//    totalDollarAmountDisplay: ""
			//    activeAccount: "Y"
			//    isPO: "N"

			//  On the groups screen, the saving is done by SaveLab.gx

			this.successMessage = 'Billing Account \"' + this.accountName + '\" has been submitted to ' + this.selectedCoreFacilitiesString + '.';

			//this.window.close();
			// this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe((response) => {
			// 	this.successWindow.open();
			// });
		} else {
			// validation has caught problems - report them.
			this.errorWindow.open();
		}
	}

	private savePo(): void {
		this.errorMessage = '';

		let shortAcct: string = "";

		let isPO: string = (this.showField === 'po') ? 'Y' : 'N';
		let isCreditCard: string = (this.showField === 'creditcard') ? 'Y' : 'N';
		let idLab: string = this.selectedLab ? '' : '' + this.selectedLab;
		let idLabRegex = /^\d+$/;

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let startDate: string = "";
		let expirationDate: string = "";

		let totalDollarAmountDisplay: string = "";
		let submitterEmail: string = "";
		let submitterEmailRegex = /^[A-z]([\.\dA-z]*)@([A-z]+)((\.[A-z]+)+)$/;
		let activeAccount: string = "";

		// The custom fields only displayed in the flex version of GNomEx if there were certain entries in the
		// "InternalAccountFieldsConfiguration" or "OtherAccountFieldsConfiguration" tables.  However, at time
		// of development this feature seems to be unused, so its implementation is delayed.
		// As a note for the future, the "AccountFieldsConfigurationService" is intended to provide access to
		// those fields.
		let custom1: string = '';
		let custom2: string = '';
		let custom3: string = '';

		if (this.selectedLab) {
			idLab = '' + this.selectedLab;

			if (!idLab.match(idLabRegex)) {
				if (idLab.length == 0) {
					this.errorMessage += '- Please select a lab\n';
				} else {
					this.errorMessage += '- Unknown error reading lab\n';
				}
			}
		}

		if (this.accountName_po != null) {
			this.accountName = this.accountName_po;
			if (this.accountName == '') {
				this.errorMessage += '- Please provide a name for your account\n';
			}
		}

		if (this.coreFacilitiesSelector != undefined
				&& this.coreFacilitiesSelector != null
				&& this.coreFacilitiesSelector.grid != undefined
				&& this.coreFacilitiesSelector.grid != null
				&& this.coreFacilitiesSelector.grid.theGrid != undefined
				&& this.coreFacilitiesSelector.grid.theGrid != null
				&& this.coreFacilitiesSelector.grid.getselectedrowindexes() != null) {

			let selectedIndices = this.coreFacilitiesSelector.grid.getselectedrowindexes();
			let possibleCoreFacilities = this.coreFacilitiesSelector.grid.theGrid.source().loadedData;

			this.selectedCoreFacilitiesString = '';

			for (let i: number = 0; i < selectedIndices.length; i++) {
				let coreFacility: any = {
					idCoreFacility: possibleCoreFacilities[selectedIndices[i].valueOf()].idCoreFacility,
					facilityName: possibleCoreFacilities[selectedIndices[i].valueOf()].display
				};

				coreFacilities.push(coreFacility);

				if (i > 0 && i + 1 < selectedIndices.length) {
					this.selectedCoreFacilitiesString += ', ';
				} else if (i + 1 === selectedIndices.length && selectedIndices.length != 1) {
					this.selectedCoreFacilitiesString += ' and ';
				}

				this.selectedCoreFacilitiesString += possibleCoreFacilities[selectedIndices[i].valueOf()].display;
			}

			if (coreFacilities.length == 0) {
				this.errorMessage += '- Please select at least one core facility\n';
			}

			coreFacilitiesXMLString = JSON.stringify(coreFacilities);
		}

		if (this.startDate_po != null) {
			startDate = this.startDate_po;
		}
		if (this.expirationDate_po != null) {
			expirationDate = this.expirationDate_po;

			if (expirationDate.length == 0) {
				this.errorMessage += '- Please pick an expiration date.\n';
			}
		}

		if(this.totalDollarAmount_po != null) {
			totalDollarAmountDisplay = this.totalDollarAmount_po;
		}

		if (this.submitterEmail_po != null) {
			submitterEmail = '' + this.submitterEmail_po;
			if (!submitterEmail.match(submitterEmailRegex)) {
				this.errorMessage += '- Please enter a valid email address.\n'
			}
		}

		if (this.activeCheckBox_po != null) {
			if (this.activeCheckBox_po) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (this.agreementCheckbox != null) {
			if (!this.agreementCheckbox) {
				this.errorMessage += '- Please agree to the terms and conditions'
			}
		}

		if (this.errorMessage.length == 0) {
			let parameters: URLSearchParams = new URLSearchParams();

			parameters.set('idLab', idLab);
			parameters.set('coreFacilitiesXMLString', coreFacilitiesXMLString);
			parameters.set('accountName', this.accountName);
			parameters.set('shortAcct', shortAcct);
			parameters.set('custom1', custom1);
			parameters.set('custom2', custom2);
			parameters.set('custom3', custom3);
			parameters.set('submitterEmail', submitterEmail);
			parameters.set('startDate', startDate);
			parameters.set('expirationDate', expirationDate);
			parameters.set('totalDollarAmountDisplay', totalDollarAmountDisplay);
			parameters.set('activeAccount', activeAccount);
			parameters.set('isPO', isPO);
			parameters.set('isCreditCard', isCreditCard);

			this.successMessage = 'Billing Account \"' + this.accountName + '\" has been submitted to ' + this.selectedCoreFacilitiesString + '.';

			//this.window.close();
			// this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe((response) => {
			// 	this.successWindow.open();
			// });
		} else {
			// validation has caught problems - report them.
			this.errorWindow.open();
		}
	}

	private saveCreditCard(): void {
		this.errorMessage = '';

		let shortAcct: string = "";

		let isPO: string = (this.showField === 'po') ? 'Y' : 'N';
		let isCreditCard: string = (this.showField === 'creditcard') ? 'Y' : 'N';
		let idLab: string = this.selectedLab ? '' : '' + this.selectedLab;
		let idLabRegex = /^\d+$/;

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let idCreditCardCompany: string;
		let zipCode: string;
		let zipCodeRegex = /^(\d{5,5})|(\d{5,5}-\d{4,4})$/;

		let startDate: string = "";
		let expirationDate: string = "";

		let totalDollarAmountDisplay: string = "";
		let submitterEmail: string = "";
		let submitterEmailRegex = /^[A-z]([\.\dA-z]*)@([A-z]+)((\.[A-z]+)+)$/;
		let activeAccount: string = "";

		// The custom fields only displayed in the flex version of GNomEx if there were certain entries in the
		// "InternalAccountFieldsConfiguration" or "OtherAccountFieldsConfiguration" tables.  However, at time
		// of development this feature seems to be unused, so its implementation is delayed.
		// As a note for the future, the "AccountFieldsConfigurationService" is intended to provide access to
		// those fields.
		let custom1: string = '';
		let custom2: string = '';
		let custom3: string = '';

		if (this.selectedLab) {
			idLab = '' + this.selectedLab;

			if (!idLab.match(idLabRegex)) {
				if (idLab.length == 0) {
					this.errorMessage += '- Please select a lab\n';
				} else {
					this.errorMessage += '- Unknown error reading lab\n';
				}
			}
		}

		if (this.accountName_creditCard != null) {
			this.accountName = this.accountName_creditCard;
			if (this.accountName == '') {
				this.errorMessage += '- Please provide a name for your account\n';
			}
		}

		if (this.coreFacilitiesSelector != undefined
				&& this.coreFacilitiesSelector != null
				&& this.coreFacilitiesSelector.grid != undefined
				&& this.coreFacilitiesSelector.grid != null
				&& this.coreFacilitiesSelector.grid.theGrid != undefined
				&& this.coreFacilitiesSelector.grid.theGrid != null
				&& this.coreFacilitiesSelector.grid.getselectedrowindexes() != null) {

			let selectedIndices = this.coreFacilitiesSelector.grid.getselectedrowindexes();
			let possibleCoreFacilities = this.coreFacilitiesSelector.grid.theGrid.source().loadedData;

			this.selectedCoreFacilitiesString = '';

			for (let i: number = 0; i < selectedIndices.length; i++) {
				let coreFacility: any = {
					idCoreFacility: possibleCoreFacilities[selectedIndices[i].valueOf()].idCoreFacility,
					facilityName: possibleCoreFacilities[selectedIndices[i].valueOf()].display
				};

				coreFacilities.push(coreFacility);

				if (i > 0 && i + 1 < selectedIndices.length) {
					this.selectedCoreFacilitiesString += ', ';
				} else if (i + 1 === selectedIndices.length && selectedIndices.length != 1) {
					this.selectedCoreFacilitiesString += ' and ';
				}

				this.selectedCoreFacilitiesString += possibleCoreFacilities[selectedIndices[i].valueOf()].display;
			}

			if (coreFacilities.length == 0) {
				this.errorMessage += '- Please select at least one core facility\n';
			}

			coreFacilitiesXMLString = JSON.stringify(coreFacilities);
		}

		if (this.creditCardCompanyComboBox_creditCard != null && this.creditCardCompanyComboBox_creditCard.getSelectedIndex() != null) {
			idCreditCardCompany = this.creditCardCompanies[this.creditCardCompanyComboBox_creditCard.getSelectedIndex().valueOf()].idCreditCardCompany;
		}

		if (this.zipCodeInput_creditCard != null) {
			if (this.zipCodeInput_creditCard.match(zipCodeRegex)) {
				zipCode = this.zipCodeInput_creditCard;
			}
		}

		if (this.startDate_creditcard != null) {
			startDate = this.startDate_creditcard;
		}
		if (this.expirationDate_creditcard != null) {
			expirationDate = this.expirationDate_creditcard;

			if (expirationDate.length == 0) {
				this.errorMessage += '- Please pick an expiration date.\n';
			}
		}

		if(this.totalDollarAmount_creditCard != null) {
			totalDollarAmountDisplay = this.totalDollarAmount_creditCard;
		}


		if (this.submitterEmail_creditcard != null) {
			submitterEmail = '' + this.submitterEmail_creditcard;
			if (!submitterEmail.match(submitterEmailRegex)) {
				this.errorMessage += '- Please enter a valid email address.\n'
			}
		}

		if (this.activeCheckBox_creditcard != null) {
			if (this.activeCheckBox_creditcard) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (this.agreementCheckbox != null) {
			if (!this.agreementCheckbox) {
				this.errorMessage += '- Please agree to the terms and conditions'
			}
		}

		if (this.errorMessage.length == 0) {
			let parameters: URLSearchParams = new URLSearchParams();

			parameters.set('idLab', idLab);
			parameters.set('coreFacilitiesXMLString', coreFacilitiesXMLString);
			parameters.set('accountName', this.accountName);
			parameters.set('shortAcct', shortAcct);
			parameters.set('custom1', custom1);
			parameters.set('custom2', custom2);
			parameters.set('custom3', custom3);
			parameters.set('submitterEmail', submitterEmail);
			parameters.set('idCreditCardCompany', idCreditCardCompany);
			parameters.set('zipCode', zipCode);
			parameters.set('startDate', startDate);
			parameters.set('expirationDate', expirationDate);
			parameters.set('totalDollarAmountDisplay', totalDollarAmountDisplay);
			parameters.set('activeAccount', activeAccount);
			parameters.set('isPO', isPO);
			parameters.set('isCreditCard', isCreditCard);

			this.successMessage = 'Billing Account \"' + this.accountName + '\" has been submitted to ' + this.selectedCoreFacilitiesString + '.';

			//this.window.close();
			// this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe((response) => {
			// 	this.successWindow.open();
			// });
		} else {
			// validation has caught problems - report them.
			this.errorWindow.open();
		}
	}

	private onLabListSelection(event: any): void {
		let coreFacilityGridLocalData: any[] = [];

		if (event && event.value && event.value.coreFacilities) {
			let coreFacilities = event.value.coreFacilities;

			if (coreFacilities != undefined && coreFacilities != null) {
				if (coreFacilities[0] != undefined && coreFacilities[0] != null) {
					for (let i: number = 0; i < coreFacilities.length; i++) {
						if (coreFacilities[i].acceptOnlineWorkAuth != null
								&& coreFacilities[i].acceptOnlineWorkAuth != undefined
								&& coreFacilities[i].acceptOnlineWorkAuth === 'Y') {
							coreFacilityGridLocalData.push(coreFacilities[i]);
						}
					}
				} else {
					if (coreFacilities.CoreFacility != undefined && coreFacilities.CoreFacility != null) {
						if (coreFacilities.CoreFacility.acceptOnlineWorkAuth != null
								&& coreFacilities.CoreFacility.acceptOnlineWorkAuth != undefined
								&& coreFacilities.CoreFacility.acceptOnlineWorkAuth === 'Y') {
							coreFacilityGridLocalData.push(coreFacilities.CoreFacility);
						}
					}
				}
			}
		}

		this.coreFacilityReducedList = coreFacilityGridLocalData;
		this.labUsersList = event.target;

		if (coreFacilityGridLocalData.length > 0) {
			this.disableCoreFacilitiesSelector = false;
		} else {
			this.disableCoreFacilitiesSelector = true;
		}
	}

	private onCoreFacilitiesSelected(event: any): void {
		if (event && event.value && event.value.length > 0) {
			for (let i :number = 0; i < event.value.length; i++) {
				// if (event.value[i].)
				console.log('event.value : ' + event.value[i]);
			}

			this.showFundingAgencies = true;
		} else {
			this.showFundingAgencies = false;
		}
	}

	private onLabListClosed(): void {
		// if (this.labListComboBox != null
		// 		&& this.labListComboBox.val() != null
		// 		&& this.labListComboBox.val() === '') {
		// 	this.disableCoreFacilitiesSelector = true;
		// }
	}

	private onCancelButtonClicked(): void {
		console.log('onCancelButtonClicked entered!');
		console.log('    ' + this.internalAccountFieldsConfiguration);
		// this.requireEmail = !this.requireEmail;
		// this.close();
	}

	private successOkButtonClicked(): void {
		this.successWindow.close();
	}

	private errorOkButtonClicked(): void {
		this.errorWindow.close();
	}

	private clearAccountNumberActivity(): void {
		console.log(this.accountNumberProject_Chartfield);
		if (this.showField === 'chartfield' && this.accountNumberProject_Chartfield != '') {
			this.accountNumberActivity_Chartfield = '';
			this.isActivity = false;
		}
	}

	private clearAccountNumberProject(): void {
		if (this.showField === 'chartfield' && this.accountNumberActivity_Chartfield != '')  {
			this.accountNumberProject_Chartfield = '';
			this.isActivity = true;
		}
	}

	private onChartfieldTotalDollarAmountSelected(): void {
		if (this.totalDollarAmount_Chartfield != null) {
			this.lastValid_totalDollarAmountChartfield = '' + this.totalDollarAmount_Chartfield;
		}
	}

	private onChartfieldTotalDollarAmountChanged(): void {
		if (this.totalDollarAmount_Chartfield == null) {
			return;
		}

		let dollarAmountRegex = /^\d*(\.\d{0,2})?$/;

		if (this.totalDollarAmount_Chartfield.match(dollarAmountRegex)) {
			this.lastValid_totalDollarAmountChartfield = this.totalDollarAmount_Chartfield;
		}
		else {
			this.totalDollarAmount_Chartfield = this.lastValid_totalDollarAmountChartfield;
		}
	}

	private onPoTotalDollarAmountSelected(): void {
		if (this.totalDollarAmount_po != null) {
			this.lastValid_totalDollarAmountPo = '' + this.totalDollarAmount_po;
		}
	}

	private onPoTotalDollarAmountChanged(): void {
		if (this.totalDollarAmount_po == null) {
			return;
		}

		let dollarAmountRegex = /^\d*(\.\d{0,2})?$/;

		if (this.totalDollarAmount_po.match(dollarAmountRegex)) {
			this.lastValid_totalDollarAmountPo = this.totalDollarAmount_po;
		}
		else {
			this.totalDollarAmount_po = this.lastValid_totalDollarAmountPo;
		}
	}

	private onCreditCardZipCodeSelected(): void {
		if (this.zipCodeInput_creditCard != null) {
			this.lastValid_zipCodeCreditCard = '' + this.zipCodeInput_creditCard;
		}
	}

	private onCreditCardZipCodeChanged(): void {
		if (this.zipCodeInput_creditCard == null) {
			return;
		}

		let zipCodeRegex = /^\d{0,5}(-\d{0,4})?$/;

		if (this.zipCodeInput_creditCard.match(zipCodeRegex)) {
			this.lastValid_zipCodeCreditCard = this.zipCodeInput_creditCard;
		}
		else {
			this.zipCodeInput_creditCard = this.lastValid_zipCodeCreditCard;
		}
	}

	private onCreditCardTotalDollarAmountSelected(): void {
		if (this.totalDollarAmount_creditCard != null) {
			this.lastValid_totalDollarAmountCreditCard = '' + this.totalDollarAmount_creditCard;
		}
	}

	private onCreditCardTotalDollarAmountChanged(): void {
		if (this.totalDollarAmount_creditCard == null) {
			return;
		}

		let dollarAmountRegex = /^\d*(\.\d{0,2})?$/;

		if (this.totalDollarAmount_creditCard.match(dollarAmountRegex)) {
			this.lastValid_totalDollarAmountCreditCard = this.totalDollarAmount_creditCard;
		}
		else {
			this.totalDollarAmount_creditCard = this.lastValid_totalDollarAmountCreditCard;
		}
	}

	private testingFn(event?: any): void {
		console.log("Testing reached!\n" + (event ? event.toString() : ''));
	}
}