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

import { jqxWindowComponent } from "../../../assets/jqwidgets-ts/angular_jqxwindow";

import { LabListService } from "../../services/lab-list.service";
import { CreateSecurityAdvisorService } from "../../services/create-security-advisor.service";

import { MultipleSelectorComponent } from "../../util/multipleSelector/multiple-selector.component";

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

	readonly CHARTFIELD: string = 'chartfield';
	readonly PO:         string = 'po';
	readonly CREDITCARD: string = 'creditCard';

	showField: string = this.CHARTFIELD;

	usesCustomChartfields: string = '';

	accountName_Chartfield: string = '';
	accountNameFormControl_Chartfield = new FormControl('', []);
	accountNameStateMatcher_Chartfield = new NewBillingAccountStateMatcher();

	accountName_po: string = '';
	accountNameFormControl_po = new FormControl('', []);
	accountNameStateMatcher_po = new NewBillingAccountStateMatcher();

	accountName_creditCard: string = '';
	accountNameFormControl_creditCard = new FormControl('', []);
	accountNameStateMatcher_creditCard = new NewBillingAccountStateMatcher();

	shortAccountName_Chartfield: string = '';
	shortNameFormControl_Chartfield = new FormControl('', []);
	shortNameStateMatcher_Chartfield = new NewBillingAccountStateMatcher();
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

	startDate_chartfield = new Date();
	startDate_po = new Date();
	startDate_creditcard = new Date();

	requireStartDate: boolean = true;

	effectiveUntilDate_chartfield: Date;
	expirationDate_po: Date;
	expirationDate_creditcard: Date;

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
	private emailPatternValidator = Validators.pattern(/^[a-zA-Z][a-zA-Z\d]*(\.[a-zA-Z\d]+)*@\d*[a-zA-Z](([a-zA-Z\d]*)|([\-a-zA-Z\d]+[a-zA-Z\d]))(\.[a-zA-Z\d]+)+$/);

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

	selectedLab: any;
	selectedCoreFacilities: any[] = [];
	selectedCreditCardCompany: any;

	private labListSubscription: Subscription = null;

	fundingAgencies: any;
	selectedFundingAgency: any;
	creditCardCompanies: any;

	showFundingAgencies: boolean = false;
	requireFundingAgency: boolean = false;

	zipCodeInput_creditCard: string = "";
	zipCodeInputFormControl_creditCard  = new FormControl('', [ Validators.pattern(/^\d{5}((\s*|(\s*-\s*))(\d{4}))?$/) ]);
	zipCodeInputStateMatcher_creditCard = new NewBillingAccountStateMatcher();

	private selectedCoreFacilitiesString: string = "";

	private internalAccountFieldsConfigurationSubscription: Subscription;
	private otherAccountFieldsConfigurationSubscription: Subscription;

	requireDollarAmount: boolean = false;

	successMessage: string = '';
	errorMessage: string = '';

	isActivity: boolean = false;
	disableCoreFacilitiesSelector = true;

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


	constructor(private accountFieldsConfigurationService: AccountFieldsConfigurationService,
							private createSecurityAdvisorService: CreateSecurityAdvisorService,
							private dialogRef: MatDialogRef<NewBillingAccountComponent>,
							private dictionaryService: DictionaryService,
							private labListService: LabListService,
							private newBillingAccountService: NewBillingAccountService,
							private propertyService: PropertyService) { }

	ngOnInit(): void {
		this.labListSubscription = this.labListService.getLabList().subscribe((response: any[]) => {
			this.labList = response;
		});

		this.submitterEmail_chartfield = this.createSecurityAdvisorService.userEmail;
		this.submitterEmail_po         = this.createSecurityAdvisorService.userEmail;
		this.submitterEmail_creditcard = this.createSecurityAdvisorService.userEmail;

		this.submitterEmailFormControl_chartfield.reset();
		this.submitterEmailFormControl_po.reset();
		this.submitterEmailFormControl_creditcard.reset();

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
		originalCreditCardCompanies.sort((a, b) => { return a.sortOrder - b.sortOrder; });
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

	private onSaveButtonClicked(): void {
		this.errorMessage = '';

		if (this.showField == this.CHARTFIELD) {
			this.saveChartfield();
		} else if (this.showField == this.PO) {
			this.savePo();
		} else if (this.showField == this.CREDITCARD) {
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

		if (this.activeCheckBox_chartfield != null) {
			if (this.activeCheckBox_chartfield) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (!!this.selectedFundingAgency && (this.showFundingAgencies && this.usesCustomChartfields !== 'Y' || this.includeInCustomField_fundingAgency)) {
			idFundingAgency = this.selectedFundingAgency;
		}

		console.log("" +
				"You clicked the save button with parameters : \n" +
				"    idLab                    : " + idLab + "\n" +
				"    coreFacilitiesXMLString  : " + coreFacilitiesXMLString + "\n" +
				"    accountName              : " + this.accountName_Chartfield + "\n" +
				"    shortAcct                : " + this.shortAccountName_Chartfield + "\n" +
				"    accountNumberBus         : " + this.accountNumberBus_Chartfield + "\n" +
				"    accountNumberOrg         : " + this.accountNumberOrg_Chartfield + "\n" +
				"    accountNumberFund        : " + this.accountNumberFund_Chartfield + "\n" +
				"    accountNumberActivity    : " + this.accountNumberActivity_Chartfield + "\n" +
				"    accountNumberProject     : " + this.accountNumberProject_Chartfield + "\n" +
				"    accountNumberAccount     : " + this.accountNumberAccount_Chartfield + "\n" +
				"    accountNumberAu          : " + (this.accountNumberActivity_Chartfield.length > 0 ? this.accountNumberAU_Chartfield : '')+ "\n" +
				"    idFundingAgency          : " + idFundingAgency + "\n" +
				"    custom1                  : " + custom1 + "\n" +
				"    custom2                  : " + custom2 + "\n" +
				"    custom3                  : " + custom3 + "\n" +
				"    submitterEmail           : " + this.submitterEmail_chartfield + "\n" +
				"    startDate                : " + this.startDate_chartfield.toLocaleDateString() + "\n" +
				"    expirationDate           : " + (this.effectiveUntilDate_chartfield ? this.effectiveUntilDate_chartfield.toLocaleDateString() : '') + "\n" +
				"    totalDollarAmountDisplay : " + this.totalDollarAmount_Chartfield + "\n" +
				"    activeAccount            : " + activeAccount + "\n" +
				"    isPO                     : " + isPO + "\n"
		);

		if (this.areChartfieldValuesValid()) {
			let parameters: URLSearchParams = new URLSearchParams();

			parameters.set('idLab', idLab);
			parameters.set('coreFacilitiesXMLString', coreFacilitiesXMLString);
			parameters.set('accountName', this.accountName_Chartfield);
			parameters.set('shortAcct', this.shortAccountName_Chartfield);
			parameters.set('accountNumberBus', this.accountNumberBus_Chartfield);
			parameters.set('accountNumberOrg', this.accountNumberOrg_Chartfield);
			parameters.set('accountNumberFund', this.accountNumberFund_Chartfield);
			parameters.set('accountNumberActivity', this.accountNumberActivity_Chartfield);
			parameters.set('accountNumberProject', this.accountNumberProject_Chartfield);
			parameters.set('accountNumberAccount', this.accountNumberAccount_Chartfield);
			parameters.set('accountNumberAu', (this.accountNumberActivity_Chartfield.length > 0 ? this.accountNumberAU_Chartfield : ''));
			parameters.set('idFundingAgency', idFundingAgency);
			parameters.set('custom1', custom1);
			parameters.set('custom2', custom2);
			parameters.set('custom3', custom3);
			parameters.set('submitterEmail', this.submitterEmail_chartfield);
			parameters.set('startDate', this.startDate_chartfield.toLocaleDateString());
			parameters.set('expirationDate', (this.effectiveUntilDate_chartfield ? this.effectiveUntilDate_chartfield.toLocaleDateString() : ''));
			parameters.set('totalDollarAmountDisplay', this.totalDollarAmount_Chartfield);
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

			this.successMessage = 'Billing Account \"' + this.accountName_Chartfield + '\" has been submitted to ' + this.selectedCoreFacilitiesString + '.';

			//this.window.close();
			this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe((response) => {
				this.successWindow.open();
			});
		} else {
			// validation has caught problems - report them.
			this.errorWindow.open();
		}
	}

	private areChartfieldValuesValid(): boolean {

		this.errorMessage = '';
		let errorFound: boolean = false;

		// let isLabInvalid: boolean = !(this.selectedLab != undefined && this.selectedLab != null && this.selectedLab !== '');
		// let isCoreFacilitiesInvalid: boolean = !(this.selectedCoreFacilities.length > 0);
		//
		// console.log("selectedLab                                   invalid : " + isLabInvalid);
		// console.log("selectedCoreFacilitiesString                  invalid : " + isCoreFacilitiesInvalid);
		//
		// console.log("accountNameFormControl_Chartfield             invalid : " + this.accountNameFormControl_Chartfield.invalid);
		// console.log("shortNameFormControl_Chartfield               invalid : " + this.shortNameFormControl_Chartfield.invalid);
		//
		// console.log("accountNumberBusFormControl_chartfield        invalid : " + this.accountNumberBusFormControl_chartfield.invalid);
		// console.log("accountNumberOrgFormControl_chartfield        invalid : " + this.accountNumberOrgFormControl_chartfield.invalid);
		// console.log("accountNumberFundFormControl_chartfield       invalid : " + this.accountNumberFundFormControl_chartfield.invalid);
		// console.log("accountNumberActivityFormControl_chartfield   invalid : " + this.accountNumberActivityFormControl_chartfield.invalid);
		// console.log("accountNumberProjectFormControl_chartfield    invalid : " + this.accountNumberProjectFormControl_chartfield.invalid);
		// console.log("accountNumberAccountFormControl_chartfield    invalid : " + this.accountNumberAccountFormControl_chartfield.invalid);
		//
		// for (let i: number = 0; i < this.InternalCustomFieldsFormControl.length; i++) {
		// 	console.log("InternalCustomFieldsFormControl[" + i + "]            invalid : " + this.InternalCustomFieldsFormControl[i].invalid);
		// }
		//
		// console.log("startDate_chartfield                          invalid : " + !(this.startDate_chartfield && this.startDate_chartfield.toLocaleDateString() != ''));
		// console.log("effectiveUntilDate_chartfield                 invalid : " + !(this.effectiveUntilDate_chartfield && this.effectiveUntilDate_chartfield.toLocaleDateString() != ''));
		//
		// console.log("submitterEmailFormControl_chartfield          invalid : " + this.submitterEmailFormControl_chartfield.invalid);
		//
		// console.log("activeCheckBox_chartfield                     invalid : " + (false && this.activeCheckBox_chartfield));
		//
		// console.log("agreementCheckbox                             invalid : " + !this.agreementCheckbox.valueOf());

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

		if (!(this.startDate_chartfield && this.startDate_chartfield.toLocaleDateString() != '')) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please pick a start date\n';
		}
		if (!(this.effectiveUntilDate_chartfield && this.effectiveUntilDate_chartfield.toLocaleDateString() != '')) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please pick an expiration date\n';
		}

		if (this.submitterEmailFormControl_chartfield.invalid) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please enter an email address you can be reached at\n';
		}

		if (!this.agreementCheckbox.valueOf()) {
			errorFound = errorFound || true;
			this.errorMessage += '- Please agree to the terms and conditions.\n';
		}

		return !errorFound;
	}

	private savePo(): void {
		this.errorMessage = '';

		let shortAcct: string = "";

		let isPO: string = (this.showField === this.PO) ? 'Y' : 'N';
		let isCreditCard: string = (this.showField === this.CREDITCARD) ? 'Y' : 'N';
		let idLab: string = !this.selectedLab ? '' : '' + this.selectedLab;
		let idLabRegex = /^\d+$/;

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let startDate: string = "";
		let expirationDate: string = "";

		let totalDollarAmountDisplay: string = "";
		let submitterEmail: string = "";
		let submitterEmailRegex = /^[A-z]([.\dA-z]*)@([A-z]+)((\.[A-z]+)+)$/;
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

		// if (this.accountName_po != null) {
		// 	this.accountName = this.accountName_po;
		// 	if (this.accountName_po == '') {
		// 		this.errorMessage += '- Please provide a name for your account\n';
		// 	}
		// }

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
			startDate = this.startDate_po.toLocaleDateString();
		}
		if (this.expirationDate_po != null) {
			expirationDate = (this.expirationDate_po ? this.expirationDate_po.toLocaleDateString() : '');

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
			parameters.set('accountName', this.accountName_po);
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

			this.successMessage = 'Billing Account \"' + this.accountName_po + '\" has been submitted to ' + this.selectedCoreFacilitiesString + '.';

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

		let isPO: string = (this.showField === this.PO) ? 'Y' : 'N';
		let isCreditCard: string = (this.showField === this.CREDITCARD) ? 'Y' : 'N';
		let idLab: string = !this.selectedLab ? '' : '' + this.selectedLab;
		let idLabRegex = /^\d+$/;

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let idCreditCardCompany: string;
		let zipCode: string;
		let zipCodeRegex = /^(\d{5})|(\d{5}-\d{4})$/;

		let startDate: string = "";
		let expirationDate: string = "";

		let totalDollarAmountDisplay: string = "";
		let submitterEmail: string = "";
		let submitterEmailRegex = /^[A-z]([.\dA-z]*)@([A-z]+)((\.[A-z]+)+)$/;
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

		// if (this.accountName_creditCard != null) {
		// 	this.accountName = this.accountName_creditCard;
		// 	if (this.accountName == '') {
		// 		this.errorMessage += '- Please provide a name for your account\n';
		// 	}
		// }

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

		if (this.selectedCreditCardCompany != null) {
			idCreditCardCompany = this.selectedCreditCardCompany.value;
		}

		if (this.zipCodeInput_creditCard != null) {
			if (this.zipCodeInput_creditCard.match(zipCodeRegex)) {
				zipCode = this.zipCodeInput_creditCard;
			}
		}

		if (this.startDate_creditcard != null) {
			startDate = this.startDate_creditcard.toLocaleDateString();
		}
		if (this.expirationDate_creditcard != null) {
			expirationDate = (this.expirationDate_creditcard ? this.expirationDate_creditcard.toLocaleDateString() : '');

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
			parameters.set('accountName', this.accountName_creditCard);
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

			this.successMessage = 'Billing Account \"' + this.accountName_creditCard + '\" has been submitted to ' + this.selectedCoreFacilitiesString + '.';

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
		let coreFacilityApplicable: any[] = [];

		if (event && event.value && event.value.coreFacilities) {
			let coreFacilities = event.value.coreFacilities;

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
			// Look through for core facilities which use funding agencies, if there are any, show that dropdown
			for (let i: number = 0; i < event.value.length; i++) {
				if (this.propertyService.getExactProperty(this.propertyService.SHOW_FUNDING_AGENCY, event.value[i].idCoreFacility) === 'Y') {
					this.showFundingAgencies = true;
					break;
				}
			}
		} else {
			this.showFundingAgencies = false;
		}
	}

	private onCancelButtonClicked(): void {
		console.log('onCancelButtonClicked entered!');
		console.log('' + this.selectedCreditCardCompany);
		this.dialogRef.close();
	}

	private successOkButtonClicked(): void {
		this.successWindow.close();
	}

	private errorOkButtonClicked(): void {
		this.errorWindow.close();
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

}