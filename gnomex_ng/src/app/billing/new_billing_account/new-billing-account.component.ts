import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {HttpParams} from "@angular/common/http";
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import {MatDialogRef, MatDialog, ErrorStateMatcher, MatDialogConfig, MAT_DIALOG_DATA } from "@angular/material";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";

import {NewBillingAccountErrorDialogComponent} from "./dialogs/new-billing-account-error-dialog.component";
import {NewBillingAccountSuccessDialogComponent} from "./dialogs/new-billing-account-success-dialog.component";
import {AccountFieldsConfigurationService} from "../../services/account-fields-configuration.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DictionaryService} from "../../services/dictionary.service";
import {LabListService} from "../../services/lab-list.service";
import {NewBillingAccountService} from "../../services/new-billing-account.service";
import {PropertyService} from "../../services/property.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {UserPreferencesService} from "../../services/user-preferences.service";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {ConstantsService} from "../../services/constants.service";
import {thisOrThat} from "../../util/validators/this-or-that.validator";
import {UtilService} from "../../services/util.service";

@Component({
	selector: "new-billing-account-launcher",
	template: `<div></div>`,
	styles: [``]
})
export class NewBillingAccountLauncher {

	constructor(private dialogsService: DialogsService, private router: Router,
				public createSecurityAdvisorService: CreateSecurityAdvisorService,
				private constService: ConstantsService) {
		let config: MatDialogConfig = new MatDialogConfig();
		config.width = "60em";
		config.autoFocus = false;

		this.dialogsService.genericDialogContainer(NewBillingAccountComponent, "Submit Campus Billing Account", this.constService.ICON_WORK_AUTH_FORM, config,
			{actions: [
					{type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "onSaveButtonClicked"},
					{type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
				]}).subscribe((result: any) => {
			this.router.navigate([{ outlets: {modal: null}}]);
		});
	}
}

export class NewBillingAccountStateMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		return !!((control && control.invalid && control.touched) || ((control.invalid && form.submitted)));
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
			font-size: small;
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

		.row-spacer {
			height: 0.7em;
		}

		.center-vertical-align {
			vertical-align: middle;
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
	`]
})
export class NewBillingAccountComponent extends BaseGenericContainerDialog implements OnInit, OnDestroy {

	readonly CHARTFIELD:  string = 'chartfield';
	readonly PO:          string = 'po';
	readonly CREDIT_CARD: string = 'creditCard';

	showField: string = this.CHARTFIELD;

	usesCustomChartfields: boolean;

	accountStateMatcher = new NewBillingAccountStateMatcher();


	// The definition of valid email addresses can be found at
	//     https://en.wikipedia.org/wiki/Email_address#Domain
	//   at the time of writing, which this does not fully support...
	private emailPatternValidator = Validators.pattern(/^[a-zA-Z][a-zA-Z\d]*(\.[a-zA-Z\d]+)*@\d*[a-zA-Z](([a-zA-Z\d]*)|([\-a-zA-Z\d]+[a-zA-Z\d]))(\.[a-zA-Z\d]+)+$/);

	formGroup:FormGroup;

	labList: any[] = [];
	coreFacilityReducedList: any[] = [];

	selectedCoreFacilities: any[] = [];

	private labListSubscription: Subscription = null;

	fundingAgencies: any;

	creditCardCompanies: any;

	showFundingAgencies: boolean = false;

	private selectedCoreFacilitiesString: string = "";

	private internalAccountFieldsConfigurationSubscription: Subscription;
	private otherAccountFieldsConfigurationSubscription: Subscription;

	successMessage: string = '';
	errorMessage: string = '';

	isActivity: boolean = false;
	disableCoreFacilitiesSelector = true;

	otherAccountFieldsConfiguration: any[] = [];
	internalAccountFieldsConfiguration: any = [
		{
			displayName : 'customField1 default name',
			isRequired  : 'N',
			minLength   : 1,
			maxLength   : 20,
			isNumber    : 'N',
			sortOrder   : 0,
			fieldName: 'customField1'
		},
		{
			displayName : 'customField2 default name',
			isRequired  : 'N',
			minLength   : 10,
			maxLength   : 20,
			isNumber    : 'N',
			sortOrder   : 0,
			fieldName: 'customField2'
		},
		{
			displayName : 'customField3 default name',
			isRequired  : 'N',
			minLength   : 20,
			maxLength   : 20,
			isNumber    : 'N',
			sortOrder   : 0,
			fieldName: 'customField3'
		},
		{
			displayName : 'customField4 default name',
			isRequired  : 'N',
			minLength   : 1,
			maxLength   : 20,
			isNumber    : 'N',
			sortOrder   : 0,
			fieldName: 'customField4'
		},
		{
			displayName : 'customField5 default name',
			isRequired  : 'N',
			minLength   : 1,
			maxLength   : 20,
			isNumber    : 'N',
			sortOrder   : 0,
			fieldName: 'customField5'
		}
	];

	InternalCustomFieldsFormControl: FormControl[] = [];
	InternalCustomFieldsStateMatcher: ErrorStateMatcher[] = [];

	includeInCustomField_shortAccount: boolean      = false;
	includeInCustomField_startDate: boolean         = false;
	includeInCustomField_expirationDate: boolean    = false;
	includeInCustomField_fundingAgency: boolean     = false;
	includeInCustomField_totalDollarAmount: boolean = false;
	private showTotalDollarAmount: boolean;


	constructor(private accountFieldsConfigurationService: AccountFieldsConfigurationService,
				private createSecurityAdvisorService: CreateSecurityAdvisorService,
				private dialogService: DialogsService,
				private dialog: MatDialog,
				private dialogRef: MatDialogRef<NewBillingAccountComponent>,
				private dictionaryService: DictionaryService,
				private labListService: LabListService,
				private newBillingAccountService: NewBillingAccountService,
				private propertyService: PropertyService,
				public prefService: UserPreferencesService,
				public utilService: UtilService,
				private fb:FormBuilder,
				@Inject(MAT_DIALOG_DATA) private data) {
		super();

		this.primaryDisable = (action) => {
			return this.formGroup.invalid;
		};
	}

	ngOnInit(): void {

		this.formGroup = this.fb.group({
			lab: ['', Validators.required],
			accountName: '',
			shortAccountName: '',
			idFundingAgency: '',
			startDate: [(new Date()).toLocaleDateString(),[Validators.required]],
			expirationDate:['',[Validators.required]],
			totalDollarAmount:['',[ Validators.pattern(/^[0-9,]*(\.\d{2})?$/)]],
			active: false,
			email:['', [ this.emailPatternValidator, Validators.required ]],
			agreement:[false, [Validators.requiredTrue] ],
			creditLastFour:['',[Validators.pattern(/^\d{4}$/), Validators.required]],
			creditZipCode: ['', [ Validators.required,  Validators.pattern(/^\d{5}((\s*|(\s*-\s*))(\d{4}))?$/) ]],
			idCreditCardCompany: ['', [Validators.required]]
		});

		if (this.data && this.data.idLab) {
			setTimeout(() => {
				this.dialogService.startDefaultSpinnerDialog();
			});
		}

		this.selectedCoreFacilities = [];

		this.labListSubscription = this.labListService.getLabList().subscribe((response: any[]) => {
			this.labList = response;

			if (this.data && this.data.idLab) {
				let temp: any[] = this.labList.filter((a) => {
					return a.idLab === this.data.idLab;
				});

				if (temp.length === 1) {
					this.formGroup.get('lab').setValue(temp);

					this.onLabListSelection( temp[0] );
				}

				this.dialogService.stopAllSpinnerDialogs();
			}
		});

		this.formGroup.get('email').setValue(this.createSecurityAdvisorService.userEmail);

		let originalFundingAgencies = this.dictionaryService.getEntries('hci.gnomex.model.FundingAgency');
		this.fundingAgencies = [];

		if (originalFundingAgencies.length !== undefined && originalFundingAgencies.length != null) {
			for (let i = 0; i < originalFundingAgencies.length; i++) {
				if (originalFundingAgencies[i].fundingAgency != null && originalFundingAgencies[i].value != null) {
					this.fundingAgencies.push(originalFundingAgencies[i]);
				}
			}
		}

		let originalCreditCardCompanies = this.dictionaryService.getEntries('hci.gnomex.model.CreditCardCompany');
		originalCreditCardCompanies.sort((a, b) => { return a.sortOrder - b.sortOrder; });
		this.creditCardCompanies = [];

		if (originalCreditCardCompanies.length !== undefined && originalCreditCardCompanies.length != null) {
			for (let i = 0; i < originalCreditCardCompanies.length; i++) {
				if (originalCreditCardCompanies[i].display != null && originalCreditCardCompanies[i].display !== '') {
					this.creditCardCompanies.push(originalCreditCardCompanies[i]);
				}
			}
		}

		this.usesCustomChartfields = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_CONFIGURABLE_BILLING_ACCOUNTS);
		this.showTotalDollarAmount = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_SHOW_TOTAL_DOLLAR_AMOUNT);



		if (this.usesCustomChartfields) {

			for (let i = 0;  i < this.internalAccountFieldsConfiguration.length; i++) {
				this.InternalCustomFieldsFormControl[i] = new FormControl('', []);
				this.InternalCustomFieldsStateMatcher[i] = this.accountStateMatcher;
			}

			let customChartfieldValidators = null;

			this.internalAccountFieldsConfigurationSubscription =
				this.accountFieldsConfigurationService.getInternalAccountFieldsConfigurationObservable().subscribe((response) => {
					this.addInternalAccountFieldsConfigurationControls(response);
					customChartfieldValidators = this.addInternalAccountFieldsConfigurationValidators();
					this.handleConditionalValidators(customChartfieldValidators)
				});

			this.otherAccountFieldsConfigurationSubscription =
				this.accountFieldsConfigurationService.getOtherAccountFieldsConfigurationObservable().subscribe((response) => {
					this.processOtherAccountFieldsConfigurations(response);
					this.handleConditionalValidators(customChartfieldValidators)
				});

			this.accountFieldsConfigurationService.publishAccountFieldConfigurations();
		} else {

			this.formGroup.addControl('chartfieldBus', new FormControl(''));
			this.formGroup.addControl('chartfieldOrg', new FormControl(''));
			this.formGroup.addControl('chartfieldFund', new FormControl(''));
			this.formGroup.addControl('chartfieldActivity', new FormControl(''));
			this.formGroup.addControl('chartfieldProject', new FormControl(''));
			this.formGroup.addControl('chartfieldAccountNum', new FormControl(''));
			this.formGroup.addControl('chartfieldAccountAU', new FormControl({value: "1"  , disabled: true}));

			this.handleConditionalValidators();

			this.formGroup.get('chartfieldAccountNum')
				.setValue( this.propertyService.getPropertyValue(PropertyService.PROPERTY_ACCOUNT_NUMBER_ACCOUNT_DEFAULT));
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


	handleConditionalValidators(customChartfieldValidators?:any[]){
		let chartfieldValidators = null;

		if(this.usesCustomChartfields && customChartfieldValidators){
			chartfieldValidators = customChartfieldValidators;
			chartfieldValidators['accountName'] = [];
			chartfieldValidators['shortAccountName'] = [];

		}else{
			chartfieldValidators = {
				chartfieldBus:  [ Validators.pattern(/^\d*$/), Validators.required, Validators.minLength(2), Validators.maxLength(2) ],
				chartfieldOrg: [Validators.pattern(/^\d*$/), Validators.required, Validators.minLength(5), Validators.maxLength(5) ],
				chartfieldFund: [Validators.pattern(/^\d*$/), Validators.required, Validators.minLength(4), Validators.maxLength(4) ],
				chartfieldActivity:  [Validators.pattern(/^\d*$/), thisOrThat('chartfieldActivity', 'chartfieldProject') , Validators.minLength(5),  Validators.maxLength(5) ],
				chartfieldProject:  [Validators.pattern(/^\d*$/), thisOrThat('chartfieldProject','chartfieldActivity'), Validators.minLength(8) , Validators.maxLength(8) ],
				chartfieldAccountNum: [Validators.pattern(/^\d*$/), Validators.required, Validators.minLength(5), Validators.maxLength(5)  ],
				chartfieldAccountAU : []
			};
		}

		let creditCardValidators = {
			creditLastFour: [Validators.required, Validators.pattern(/^\d{4}$/)],
			creditZipCode: [ Validators.required,  Validators.pattern(/^\d{5}((\s*|(\s*-\s*))(\d{4}))?$/) ],
			idCreditCardCompany:  [Validators.required]
		};
		let poValidators = {};
		// overlap shortAcct and Acct only for po and chatfield
		let overlapValidators = {
			accountName : [Validators.required],
			shortAccountName: [Validators.maxLength(10)]
		};


		if(this.usesCustomChartfields && this.otherAccountFieldsConfiguration){
			for(let otherConfig of this.otherAccountFieldsConfiguration){
				if(otherConfig.include === 'Y'){
					if(otherConfig.fieldName === 'shortAcct' && otherConfig.isRequired === 'Y'){
						(<any[]>poValidators['shortAccountName']).push(Validators.required);
						(<any[]>chartfieldValidators['shortAccountName']).push(Validators.required);
					}
				}
			}
		}


		if(this.CHARTFIELD === this.showField){
			this.setConditionalValidators(chartfieldValidators,true);
		}else{
			this.setConditionalValidators(chartfieldValidators,false);
		}
		if ( this.PO === this.showField){
			this.setConditionalValidators(poValidators,true);
		}else{
			this.setConditionalValidators(poValidators,false);
		}

		if(this.CREDIT_CARD === this.showField){
			this.setConditionalValidators(creditCardValidators,true);
			this.setConditionalValidators(overlapValidators, false );
		}else{
			this.setConditionalValidators(creditCardValidators,false);
			this.setConditionalValidators(overlapValidators, true );
		}

		this.formGroup.markAsUntouched();
		this.formGroup.markAsPristine();

	}

	setConditionalValidators(validatorsObj:any, addValidators:boolean): void{
		if(addValidators){
			for(let validatorKey in validatorsObj){
				this.formGroup.get(validatorKey).setValidators(validatorsObj[validatorKey]);
				this.formGroup.get(validatorKey).updateValueAndValidity();
			}
		}else{
			for(let validatorKey in validatorsObj){
				this.formGroup.get(validatorKey).clearValidators();
				this.formGroup.get(validatorKey).updateValueAndValidity();
			}
		}

	}

	/**
	 * This function is responsible for cleaning up any custom fields being used and arranging them
	 *   correctly, as well as hooking up their validation.
	 * @param {any[]} internalAccountFieldsConfiguration
	 */
	addInternalAccountFieldsConfigurationControls(internalAccountFieldsConfiguration: any[]): void {
		if (!internalAccountFieldsConfiguration.length) {
			return;
		}

		this.internalAccountFieldsConfiguration = internalAccountFieldsConfiguration
			.filter((a) => { return a.include === 'Y'; })
			.sort((a, b) => { return a.sortOrder - b.sortOrder; });

		for (let i = 0; i < this.internalAccountFieldsConfiguration.length; i++) {
			this.InternalCustomFieldsFormControl[i].setErrors({'pattern':null});
			this.formGroup.addControl(this.internalAccountFieldsConfiguration[i].fieldName, this.InternalCustomFieldsFormControl[i]);
		}


	}

	addInternalAccountFieldsConfigurationValidators():any{
		// these are also all specific to chartFields thus need to be removed when working with another payment method
		let customChartFieldValidators = {};

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
			customChartFieldValidators[this.internalAccountFieldsConfiguration.fieldName] = validators;
		}
		return customChartFieldValidators;
	}


	processOtherAccountFieldsConfigurations(otherAccountFieldsConfiguration: any[]): void {
		// these validators only need to be determined at Init and remain the same between PO,chartfield,creditcard
		if (!otherAccountFieldsConfiguration.length) {
			return;
		}

		this.includeInCustomField_shortAccount      = false;
		this.includeInCustomField_fundingAgency     = false;
		this.includeInCustomField_startDate         = false;
		this.includeInCustomField_expirationDate    = false;
		this.includeInCustomField_totalDollarAmount = false;
		this.otherAccountFieldsConfiguration = otherAccountFieldsConfiguration;

		for (let i = 0; i < this.otherAccountFieldsConfiguration.length; i++) {
			if (otherAccountFieldsConfiguration[i].include === 'Y') {
				switch(otherAccountFieldsConfiguration[i].fieldName) {
					case 'shortAcct' :
						// set validator in conditional Validators
						this.includeInCustomField_shortAccount      = true;
						break;
					case 'idFundingAgency' :
						this.includeInCustomField_fundingAgency     = true;
						if(otherAccountFieldsConfiguration[i].isRequired === 'Y'){
							this.formGroup.get('idFundingAgency').setValidators([Validators.required]);
						}
						break;
					case 'startDate' :
						this.includeInCustomField_startDate         = true;
						if(otherAccountFieldsConfiguration[i].isRequired === 'Y'){
							this.formGroup.get('startDate').setValidators([Validators.required]);
						}
						break;
					case 'expirationDate' :
						this.includeInCustomField_expirationDate    = true;
						if(otherAccountFieldsConfiguration[i].isRequired === 'Y'){
							this.formGroup.get('expirationDate').setValidators([Validators.required]);
						}
						break;
					case 'totalDollarAmount' :
						this.includeInCustomField_totalDollarAmount = true;
						if(otherAccountFieldsConfiguration[i].isRequired === 'Y'){
							this.formGroup.get('totalDollarAmount').setValidators([Validators.required]);
						}
						break;
					default : // Do nothing.
				}
			}
		}
	}

	private onSaveButtonClicked(): void {
		this.errorMessage = '';

		if (this.showField === this.CHARTFIELD) {
			this.saveChartfield();
		} else if (this.showField === this.PO) {
			this.savePo();
		} else if (this.showField === this.CREDIT_CARD) {
			this.saveCreditCard();
		}
	}

	private saveChartfield(): void {

		let isPO: string = (this.showField === this.PO) ? 'Y' : 'N';
		let idLab: string = !this.formGroup.get('lab').value  ? '' : '' + this.formGroup.get('lab').value.idLab;

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

		if (this.usesCustomChartfields) {
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
			accountNumberProject = this.formGroup.get('chartfieldProject').value;
			accountNumberAccount = this.formGroup.get('chartfieldAccountNum').value;
		}

		if (this.selectedCoreFacilities.length) {
			for (let i: number = 0; i < this.selectedCoreFacilities.length; i++) {
				let coreFacility: any = {
					idCoreFacility: this.selectedCoreFacilities[i].idCoreFacility,
					facilityName:   this.selectedCoreFacilities[i].display
				};
				coreFacilities.push(coreFacility);

				if (i > 0 && i + 1 < this.selectedCoreFacilities.length) {
					this.selectedCoreFacilitiesString += ', ';
				} else if (i + 1 === this.selectedCoreFacilities.length && this.selectedCoreFacilities.length !== 1) {
					this.selectedCoreFacilitiesString += ' and ';
				}
				this.selectedCoreFacilitiesString += this.selectedCoreFacilities[i].display;
			}
			coreFacilitiesXMLString = JSON.stringify(coreFacilities);
		}

		if (this.formGroup.get("active").value != null) {
			if (this.formGroup.get("active").value) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (!!(this.formGroup.get('idFundingAgency').value && (this.showFundingAgencies && !this.usesCustomChartfields || this.includeInCustomField_fundingAgency))) {
			idFundingAgency = this.formGroup.get('idFundingAgency').value;
		}


		let parameters: HttpParams = new HttpParams()
			.set('idLab', idLab)
			.set('coreFacilitiesXMLString', coreFacilitiesXMLString)
			.set('coreFacilitiesJSONString', coreFacilitiesXMLString)
			.set('accountName', this.formGroup.get('accountName').value)
			.set('shortAcct', this.formGroup.get('shortAccountName').value)
			.set('accountNumberBus', this.formGroup.get('chartfieldBus').value)
			.set('accountNumberOrg', this.formGroup.get('chartfieldOrg').value)
			.set('accountNumberFund', this.formGroup.get('chartfieldFund').value)
			.set('accountNumberActivity', this.formGroup.get('chartfieldActivity').value)
			.set('accountNumberProject', accountNumberProject)
			.set('accountNumberAccount', accountNumberAccount)
			.set('accountNumberAu', (this.formGroup.get('chartfieldActivity').value > 0 ? this.formGroup.get('chartfieldAccountAU').value : ''))
			.set('idFundingAgency', idFundingAgency)
			.set('custom1', custom1)
			.set('custom2', custom2)
			.set('custom3', custom3)
			.set('submitterEmail', this.formGroup.get('email').value)
			.set('startDate', this.formGroup.get('startDate').value)
			.set('expirationDate', (this.formGroup.get('expirationDate').value ? this.formGroup.get('expirationDate').value : ''))
			.set('totalDollarAmountDisplay', this.formGroup.get('totalDollarAmount').value)
			.set('activeAccount', activeAccount)
			.set('isPO', isPO);


		//  On the groups screen, the saving is done by SaveLab.gx

		this.successMessage = 'Billing Account \"' + this.formGroup.get('accountName').value + '\" has been submitted to ' + this.selectedCoreFacilitiesString + '.';

		//this.window.close();
		this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe((result) => {
			console.log('testing');
			this.openSuccessDialog();
		},(err:IGnomexErrorResponse) => {
			this.dialogService.stopAllSpinnerDialogs();
		});

	}



	public onAccountTypeChange(event:any ){
		//todo need to clear form and reset validators
		console.log(event);
		this.handleConditionalValidators();

	}

	private savePo(): void {
		let isPO: string = (this.showField === this.PO) ? 'Y' : 'N';
		let isCreditCard: string = (this.showField === this.CREDIT_CARD) ? 'Y' : 'N';
		let idLab: string = !this.formGroup.get('lab').value ? '' : '' +this.formGroup.get('lab').value.idLab;

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let idFundingAgency: string = "";

		let startDate: string = this.formGroup.get('startDate').value;
		let expirationDate: string = this.formGroup.get('expirationDate').value ? this.formGroup.get('expirationDate').value : '' ;

		let activeAccount: string = "";

		// The custom fields only displayed in the flex version of GNomEx if there were certain entries in the
		// "InternalAccountFieldsConfiguration" or "OtherAccountFieldsConfiguration" tables.  However, at time
		// of development this feature seems to be unused, so its implementation is delayed.
		// As a note for the future, the "AccountFieldsConfigurationService" is intended to provide access to
		// those fields.
		let custom1: string = '';
		let custom2: string = '';
		let custom3: string = '';

		if (this.selectedCoreFacilities.length) {
			for (let i: number = 0; i < this.selectedCoreFacilities.length; i++) {
				let coreFacility: any = {
					idCoreFacility: this.selectedCoreFacilities[i].idCoreFacility,
					facilityName:   this.selectedCoreFacilities[i].display
				};
				coreFacilities.push(coreFacility);

				if (i > 0 && i + 1 < this.selectedCoreFacilities.length) {
					this.selectedCoreFacilitiesString += ', ';
				} else if (i + 1 === this.selectedCoreFacilities.length && this.selectedCoreFacilities.length !== 1) {
					this.selectedCoreFacilitiesString += ' and ';
				}
				this.selectedCoreFacilitiesString += this.selectedCoreFacilities[i].display;
			}
			coreFacilitiesXMLString = JSON.stringify(coreFacilities);
		}

		if (!!this.formGroup.get('idFundingAgency').value && this.showFundingAgencies) {
			idFundingAgency = this.formGroup.get('idFundingAgency').value;
		}

		if (this.formGroup.get("active").value != null) {
			if (this.formGroup.get("active").value) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}


		let parameters: HttpParams = new HttpParams()
			.set('idLab', idLab)
			.set('coreFacilitiesXMLString', coreFacilitiesXMLString)
			.set('coreFacilitiesJSONString', coreFacilitiesXMLString)
			.set('accountName', this.formGroup.get('accountName').value)
			.set('shortAcct', this.formGroup.get('shortAccountName').value)
			.set('idFundingAgency', idFundingAgency)
			.set('custom1', custom1)
			.set('custom2', custom2)
			.set('custom3', custom3)
			.set('submitterEmail', this.formGroup.get('email').value)
			.set('startDate', startDate)
			.set('expirationDate', expirationDate)
			.set('totalDollarAmountDisplay', this.formGroup.get('totalDollarAmount').value)
			.set('activeAccount', activeAccount)
			.set('isPO', isPO)
			.set('isCreditCard', isCreditCard);

		this.successMessage = 'Billing Account \"' + this.formGroup.get('accountName').value+ '\" has been submitted to ' + this.selectedCoreFacilitiesString + '.';

		this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe(() => {
			this.openSuccessDialog();
		},(err:IGnomexErrorResponse) => {
			this.dialogService.stopAllSpinnerDialogs();
		});

	}


	private saveCreditCard(): void {
		let isPO: string = (this.showField === this.PO) ? 'Y' : 'N';
		let isCreditCard: string = (this.showField === this.CREDIT_CARD) ? 'Y' : 'N';
		let idLab: string = !this.formGroup.get('lab').value ? '' : '' + this.formGroup.get('lab').value.idLab;

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let shortAcct: string = "";

		let idFundingAgency: string = "";

		let startDate: string = this.formGroup.get('startDate').value;
		let expirationDate: string = this.formGroup.get('expirationDate').value ? this.formGroup.get('expirationDate').value : '';

		let idCreditCardCompany: string = '' + this.formGroup.get('idCreditCardCompany').value;

		let totalDollarAmountDisplay: string = "" + this.formGroup.get('totalDollarAmount').value;
		let submitterEmail: string = this.formGroup.get('email').value;
		let activeAccount: string = "";

		// The custom fields only displayed in the flex version of GNomEx if there were certain entries in the
		// "InternalAccountFieldsConfiguration" or "OtherAccountFieldsConfiguration" tables.  However, at time
		// of development this feature seems to be unused, so its implementation is delayed.
		// As a note for the future, the "AccountFieldsConfigurationService" is intended to provide access to
		// those fields.
		let custom1: string = '';
		let custom2: string = '';
		let custom3: string = '';


		if (this.selectedCoreFacilities.length) {
			for (let i: number = 0; i < this.selectedCoreFacilities.length; i++) {
				let coreFacility: any = {
					idCoreFacility: this.selectedCoreFacilities[i].idCoreFacility,
					facilityName:   this.selectedCoreFacilities[i].display
				};
				coreFacilities.push(coreFacility);

				if (i > 0 && i + 1 < this.selectedCoreFacilities.length) {
					this.selectedCoreFacilitiesString += ', ';
				} else if (i + 1 === this.selectedCoreFacilities.length && this.selectedCoreFacilities.length !== 1) {
					this.selectedCoreFacilitiesString += ' and ';
				}
				this.selectedCoreFacilitiesString += this.selectedCoreFacilities[i].display;
			}
			coreFacilitiesXMLString = JSON.stringify(coreFacilities);
		}

		if (!!this.formGroup.get('idFundingAgency').value && this.showFundingAgencies) {
			idFundingAgency = this.formGroup.get('idFundingAgency').value;
		}

		if (this.formGroup.get("active").value != null) {
			if (this.formGroup.get("active").value) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}


		let parameters: HttpParams = new HttpParams()
			.set('idLab', idLab)
			.set('coreFacilitiesXMLString', coreFacilitiesXMLString)
			.set('coreFacilitiesJSONString', coreFacilitiesXMLString)
			.set('accountName', this.formGroup.get('accountName').value)
			.set('shortAcct', shortAcct)
			.set('idFundingAgency', idFundingAgency)
			.set('custom1', custom1)
			.set('custom2', custom2)
			.set('custom3', custom3)
			.set('submitterEmail', submitterEmail)
			.set('idCreditCardCompany', idCreditCardCompany)
			.set('zipCode', this.formGroup.get('creditZipCode').value)
			.set('startDate', startDate)
			.set('expirationDate', expirationDate)
			.set('totalDollarAmountDisplay', totalDollarAmountDisplay)
			.set('activeAccount', activeAccount)
			.set('isPO', isPO)
			.set('isCreditCard', isCreditCard);

		this.successMessage = 'Billing Account \"' + this.formGroup.get('accountName').value + '\" has been submitted to ' + this.selectedCoreFacilitiesString + '.';

		this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe(() => {
			this.openSuccessDialog();
		}, (err: IGnomexErrorResponse) => {
			this.dialogService.stopAllSpinnerDialogs();
		});

	}


	private onLabListSelection(event: any): void {
		let coreFacilityApplicable: any[] = [];

		if (event && event.coreFacilities) {
			let coreFacilities = event.coreFacilities;

			if (coreFacilities !== undefined && coreFacilities != null) {
				if (coreFacilities[0] !== undefined && coreFacilities[0] != null) {
					for (let i: number = 0; i < coreFacilities.length; i++) {
						if (coreFacilities[i].acceptOnlineWorkAuth != null
							&& coreFacilities[i].acceptOnlineWorkAuth !== undefined
							&& coreFacilities[i].acceptOnlineWorkAuth === 'Y') {
							coreFacilityApplicable.push(coreFacilities[i]);
						}
					}
				} else {
					if (coreFacilities.CoreFacility) {
						if (coreFacilities.CoreFacility.acceptOnlineWorkAuth
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

			if (difference === 0 && a.displayName && b.displayName) {
				difference = a.displayName.localeCompare(b.displayName);
			}

			return difference;
		});

		this.coreFacilityReducedList = coreFacilityApplicable;

		if (coreFacilityApplicable.length > 0) {
			this.disableCoreFacilitiesSelector = false;

			if (this.coreFacilityReducedList.length === 1) {
				this.selectedCoreFacilities = this.coreFacilityReducedList;
			}
		} else {
			this.disableCoreFacilitiesSelector = true;
		}
	}

	private onCoreFacilitiesSelected(): void {
		this.showFundingAgencies = false;
		if (this.selectedCoreFacilities.length) {
			// Look through for core facilities which use funding agencies, if there are any, show that dropdown
			for (let cf of this.selectedCoreFacilities) {
				let showFundingAgency: boolean = this.propertyService.getPropertyAsBoolean(this.propertyService.SHOW_FUNDING_AGENCY, cf.idCoreFacility);
				if (showFundingAgency) {
					this.showFundingAgencies = true;
					break;
				}
			}
		}
	}


	private openSuccessDialog(): void {
		let config: MatDialogConfig = new MatDialogConfig();
		config.width = "40em";
		config.autoFocus = false;
		config.data = {
			successMessage: this.successMessage
		};

		this.dialogService.genericDialogContainer(NewBillingAccountSuccessDialogComponent, "Succeed", null, config,
			{actions: [
					{type: ActionType.SECONDARY, name: "OK", internalAction: "onClose"}
				]}).subscribe(() => {
			this.dialogRef.close();
		});
	}

	private openErrorDialog(): void {
		let config: MatDialogConfig = new MatDialogConfig();
		config.width = "40em";
		config.autoFocus = false;
		config.data = {
			errorMessage: this.errorMessage
		};

		this.dialogService.genericDialogContainer(NewBillingAccountErrorDialogComponent, "Validation Error", null, config,
			{actions: [
					{type: ActionType.SECONDARY, name: "OK", internalAction: "onClose"}
				]});
	}

	private clearAccountNumberActivity(): void {
		if (this.showField === this.CHARTFIELD && this.formGroup.get('chartfieldProject').value !== '') {
			this.formGroup.get('chartfieldActivity').setValue('');
			this.isActivity = false;
		}
	}

	private clearAccountNumberProject(): void {
		if (this.showField === this.CHARTFIELD && this.formGroup.get('chartfieldActivity').value !== '')  {
			this.formGroup.get('chartfieldProject').setValue( '');
			this.isActivity = true;
		}
	}
}