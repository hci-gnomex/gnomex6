import {
	Component, ElementRef, OnDestroy, OnInit, AfterViewInit, ViewChild,
	ChangeDetectorRef, Inject
} from "@angular/core";
import { URLSearchParams } from "@angular/http";

import { jqxButtonComponent } from "../../../assets/jqwidgets-ts/angular_jqxbuttons"
import { jqxCheckBoxComponent } from "../../../assets/jqwidgets-ts/angular_jqxcheckbox"
import { jqxComboBoxComponent } from "../../../assets/jqwidgets-ts/angular_jqxcombobox"
import { jqxInputComponent } from "../../../assets/jqwidgets-ts/angular_jqxinput"
import { jqxWindowComponent } from "../../../assets/jqwidgets-ts/angular_jqxwindow";

import { LabListService } from "../../services/lab-list.service";
import { CreateSecurityAdvisorService } from "../../services/create-security-advisor.service";

import { MultipleSelectorComponent } from "../../util/multipleSelector/multiple-selector.component";

import { GnomexStyledDatePickerComponent } from "../../util/gnomexStyledDatePicker/gnomex-styled-date-picker.component";
import { NumberJqxInputComponent } from "./number-jqxinput/number-jqxinput.component";

import { Subscription } from "rxjs/Subscription";
import { DictionaryService } from "../../services/dictionary.service";

import { AccountFieldsConfigurationService } from "./account-fields-configuration.service";
import { NewBillingAccountService } from "./new-billing-account.service";

// This component is a container for a jqxgrid given a specific style, and equipped to modify the
// grid's size on the page correctly automatically.

@Component({
	selector: "new-billing-account-window",
	templateUrl: "./new-billing-account.component.html",
	styles: [`
			button {
          height: 1.6em;
          width: 4.5em;
          border-radius: 4px;
          text-align: center;
					
					font-size: small;

          background: #e4e0e0;
          background: -webkit-linear-gradient(white, #e4e0e0);
          background: -o-linear-gradient(white, #e4e0e0);
          background: -moz-linear-gradient(white, #e4e0e0);
          background: linear-gradient(white, #e4e0e0);
			}
			
			.save-button {
					
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
					color: #1601db;
			}

      .radio-button {
          min-width: 3em;
          padding: 0.5em;
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
			
			.inline-block {
					display: inline-block;
			}
			
			.sub-header {
					font-size: small;
					padding-bottom: 0.2rem;
			}
			
			.row-content {
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
					height: 5em;
					width: 1px;
					background-color: #c4cccc;
					margin: 0 0.5em;
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
export class NewBillingAccountComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild('windowRef')     window:        jqxWindowComponent;
	@ViewChild('successWindow') successWindow: jqxWindowComponent;
	@ViewChild('errorWindow')   errorWindow:   jqxWindowComponent;

	@ViewChild('windowHeader') windowHeader: ElementRef;
	@ViewChild('windowBody')   windowBody:   ElementRef;

	@ViewChild('labListComboBox') labListComboBox: jqxComboBoxComponent;
	@ViewChild('coreFacilitiesSelector')      coreFacilitiesSelector:      MultipleSelectorComponent;

	@ViewChild('accountNameInput_chartfield') accountNameInput_chartfield: jqxInputComponent;
	@ViewChild('accountName_po')              accountName_po:              jqxInputComponent;
	@ViewChild('accountName_creditCard')      accountName_creditCard:      jqxInputComponent;

	@ViewChild('shortNameInput_chartfield')   shortNameInput_chartfield:   jqxInputComponent;

	@ViewChild('submitterEmailInput_chartfield') submitterEmailInput_chartfield: jqxInputComponent;
	@ViewChild('submitterEmailInput_po')         submitterEmailInput_po:         jqxInputComponent;
	@ViewChild('submitterEmailInput_creditcard') submitterEmailInput_creditcard: jqxInputComponent;

	@ViewChild('accountNumberBusInput')      accountNumberBusInput:      NumberJqxInputComponent;
	@ViewChild('accountNumberOrgInput')      accountNumberOrgInput:      NumberJqxInputComponent;
	@ViewChild('accountNumberFundInput')     accountNumberFundInput:     NumberJqxInputComponent;
	@ViewChild('accountNumberActivityInput') accountNumberActivityInput: NumberJqxInputComponent;
	@ViewChild('accountNumberProjectInput')  accountNumberProjectInput:  NumberJqxInputComponent;
	@ViewChild('accountNumberAccountInput')  accountNumberAccountInput:  NumberJqxInputComponent;
	@ViewChild('accountNumberAUInput')       accountNumberAUInput:       jqxInputComponent;

	@ViewChild('zipCodeInput_creditCard')           zipCodeInput_creditCard:           jqxInputComponent;

	@ViewChild('totalDollarAmountInput_chartfield') totalDollarAmountInput_chartfield: jqxInputComponent;
	@ViewChild('totalDollarAmountInput_po')         totalDollarAmountInput_po:         jqxInputComponent;
	@ViewChild('totalDollarAmountInput_creditCard') totalDollarAmountInput_creditCard: jqxInputComponent;

	@ViewChild('startDatePicker_chartfield') startDatePicker_chartfield: GnomexStyledDatePickerComponent;
	@ViewChild('startDatePicker_po')         startDatePicker_po:         GnomexStyledDatePickerComponent;
	@ViewChild('startDatePicker_creditcard') startDatePicker_creditcard: GnomexStyledDatePickerComponent;

	@ViewChild('effectiveUntilDatePicker_chartfield') effectiveUntilDatePicker_chartfield: GnomexStyledDatePickerComponent;
	@ViewChild('expirationDatePicker_po')             expirationDatePicker_po:             GnomexStyledDatePickerComponent;
	@ViewChild('expirationDatePicker_creditcard')     expirationDatePicker_creditcard:     GnomexStyledDatePickerComponent;

	@ViewChild('fundingAgencyCombobox_chartfield')     fundingAgencyCombobox_chartfield:     jqxComboBoxComponent;
	@ViewChild('creditCardCompanyComboBox_creditCard') creditCardCompanyComboBox_creditCard: jqxComboBoxComponent;

	@ViewChild('activeCheckBox_chartfield') activeCheckBox_chartfield: jqxCheckBoxComponent;
	@ViewChild('activeCheckBox_po')         activeCheckBox_po:         jqxCheckBoxComponent;
	@ViewChild('activeCheckBox_creditcard') activeCheckBox_creditcard: jqxCheckBoxComponent;

	@ViewChild('agreementCheckbox')         agreementCheckbox:         jqxCheckBoxComponent;

	showField: string = 'chartfield';

	labList: any[] = [];
	private coreFacilityList: any[] = [];
	private labUsersList: any[] = [];

	private labListSubscription: Subscription = null;

	fundingAgencies: any;
	creditCardCompanies: any;

	showFundingAgencies: boolean = false;

	private accountName: string = "";
	private selectedCoreFacilitiesString: string = "";

	private internalAccountFieldsConfiguration: any;
	private internalAccountFieldsConfigurationSubscription: any;

	private lastValid_zipCodeCreditCard: string = '';

	private lastValid_totalDollarAmountChartfield: string = '';
	private lastValid_totalDollarAmountPo: string = '';
	private lastValid_totalDollarAmountCreditCard: string = '';

	successMessage: string = '';

	usersEmail: string;

	errorMessage: string = '';

	isActivity: boolean = false;

	disableCoreFacilitiesSelector = true;

	private isOpen = false;

	constructor(@Inject(ChangeDetectorRef) private changeDetectorRef: ChangeDetectorRef,
							private dictionaryService: DictionaryService,
							private labListService: LabListService,
							private createSecurityAdvisorService: CreateSecurityAdvisorService,
							private accountFieldsConfigurationService: AccountFieldsConfigurationService,
							private newBillingAccountService: NewBillingAccountService
	) { }

	ngOnInit(): void {
		// this.labListSubscription = this.labListService.getLabList().subscribe((response: any[]) => {
		// 	this.labList = response;
		// });
		//
		// this.coreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;
		//
		// this.usersEmail = this.createSecurityAdvisorService.userEmail;
		//
		// let originalFundingAgencies = this.dictionaryService.getEntries('hci.gnomex.model.FundingAgency');
		// this.fundingAgencies = [];
		//
		// if (originalFundingAgencies.length != undefined && originalFundingAgencies.length != null) {
		// 	for (let i = 0; i < originalFundingAgencies.length; i++) {
		// 		if (originalFundingAgencies[i].fundingAgency != null && originalFundingAgencies[i].value != null) {
		// 			this.fundingAgencies.push(originalFundingAgencies[i]);
		// 		}
		// 	}
		// }
		//
		// let originalCreditCardCompanies = this.dictionaryService.getEntries('hci.gnomex.model.CreditCardCompany');
		// this.creditCardCompanies = [];
		//
		// if (originalCreditCardCompanies.length != undefined && originalCreditCardCompanies.length != null) {
		// 	for (let i = 0; i < originalCreditCardCompanies.length; i++) {
		// 		if (originalCreditCardCompanies[i].display != null) {
		// 			this.creditCardCompanies.push(originalCreditCardCompanies[i]);
		// 		}
		// 	}
		// }
		//
		// this.internalAccountFieldsConfigurationSubscription =
		// 		this.accountFieldsConfigurationService.getInternalAccountFieldsConfigurationObservable().subscribe((response) => {
		// 			this.internalAccountFieldsConfiguration = response;
		// 		});
	}

	ngAfterViewInit(): void {
		this.window.height(this.windowHeader.nativeElement.offsetHeight + this.windowBody.nativeElement.offsetHeight + 12);
	}

	ngOnDestroy(): void {
		this.labListSubscription.unsubscribe();
		this.internalAccountFieldsConfigurationSubscription.unsubscribe();
	}

	open(): void {

		if (this.isOpen) {
			return;
		}

		this.labListSubscription = this.labListService.getLabList().subscribe((response: any[]) => {
			this.labList = response;
		});

		this.coreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;

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
				if (originalCreditCardCompanies[i].display != null) {
					this.creditCardCompanies.push(originalCreditCardCompanies[i]);
				}
			}
		}

		this.internalAccountFieldsConfigurationSubscription =
				this.accountFieldsConfigurationService.getInternalAccountFieldsConfigurationObservable().subscribe((response) => {
					this.internalAccountFieldsConfiguration = response;
				});

		this.isOpen = true;
		this.window.open();

		this.window.height(this.windowHeader.nativeElement.offsetHeight + this.windowBody.nativeElement.offsetHeight + 12);
	}

	close(): void {
		this.isOpen = false;
		this.window.close();
		this.successWindow.close();
		this.errorWindow.close();
	}

	changeShowField(showField: string) {
		this.showField = showField;
		this.resizeWindow();
	}

	private resizeWindow(): void {
		this.changeDetectorRef.detectChanges();

		this.window.height(this.windowHeader.nativeElement.offsetHeight + this.windowBody.nativeElement.offsetHeight + 12);
	}

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
		let idLab: string = this.labListComboBox.val();
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

		if (this.labListComboBox != null) {
			idLab = this.labListComboBox.val();

			if (!idLab.match(idLabRegex)) {
				if (idLab.length == 0) {
					this.errorMessage += '- Please select a lab\n';
				} else {
					this.errorMessage += '- Unknown error reading lab\n';
				}
			}
		}

		if (this.accountNameInput_chartfield != null) {
			this.accountName = this.accountNameInput_chartfield.val();
			if (this.accountName == '') {
				this.errorMessage += '- Please provide a name for your account\n';
			}
		}
		if (this.shortNameInput_chartfield != null) {
			shortAcct = this.shortNameInput_chartfield.val();
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

		if (this.accountNumberBusInput != null && this.accountNumberBusInput.numberInput != null) {
			accountNumberBus = this.accountNumberBusInput.numberInput.val();
			if (!accountNumberBus.match(accountNumberBusRegex)) {
				this.errorMessage += "- The \"Bus\" entry must be two digits\n";
			}
		}
		if (this.accountNumberOrgInput != null && this.accountNumberOrgInput.numberInput != null) {
			accountNumberOrg = this.accountNumberOrgInput.numberInput.val();
			if (!accountNumberOrg.match(accountNumberOrgRegex)) {
				this.errorMessage += "- The \"Org\" entry must be five digits\n";
			}
		}
		if (this.accountNumberFundInput != null && this.accountNumberFundInput.numberInput != null) {
			accountNumberFund = this.accountNumberFundInput.numberInput.val();
			if (!accountNumberFund.match(accountNumberFundRegex)) {
				this.errorMessage += "- The \"Fund\" entry must be four digits\n";
			}
		}
		if (this.accountNumberActivityInput != null && this.accountNumberActivityInput.numberInput != null) {
			accountNumberActivity = this.accountNumberActivityInput.numberInput.val();
			if (accountNumberProject.length == 0) {
				if (!accountNumberActivity.match(accountNumberActivityRegex)) {
					this.errorMessage += "- The \"Activity\" entry must be five digits\n";
				}
			}
		}
		if (this.accountNumberProjectInput != null && this.accountNumberProjectInput.numberInput != null) {
			accountNumberProject = this.accountNumberProjectInput.numberInput.val();
			if (accountNumberActivity.length == 0) {
				if (!accountNumberProject.match(accountNumberProjectRegex)) {
					this.errorMessage += "- The \"Project\" entry must be eight digits\n";
				}
			}
		}
		if (this.accountNumberAccountInput != null && this.accountNumberAccountInput.numberInput != null) {
			accountNumberAccount = this.accountNumberAccountInput.numberInput.val();
			if (!accountNumberAccount.match(accountNumberAccountRegex)) {
				this.errorMessage += "- The \"Account\" entry must be five digits\n";
			}
		}
		if (this.accountNumberAUInput != null) {
			accountNumberAu = this.accountNumberAUInput.val();
		}

		if (this.startDatePicker_chartfield != null && this.startDatePicker_chartfield.inputReference != null) {
			startDate = this.startDatePicker_chartfield.inputReference.val();
		}
		if (this.effectiveUntilDatePicker_chartfield != null) {
			expirationDate = this.effectiveUntilDatePicker_chartfield.inputReference.val();

			if (expirationDate.length == 0) {
				this.errorMessage += '- Please pick an expiration date.\n';
			}
		}

		if(this.totalDollarAmountInput_chartfield != null) {
			totalDollarAmountDisplay = this.totalDollarAmountInput_chartfield.val();
		}


		if (this.submitterEmailInput_chartfield != null) {
			submitterEmail = '' + this.submitterEmailInput_chartfield.val();
			if (!submitterEmail.match(submitterEmailRegex)) {
				this.errorMessage += '- Please enter a valid email address.\n'
			}
		}

		if (this.activeCheckBox_chartfield != null && this.activeCheckBox_chartfield.val() != null) {
			if (this.activeCheckBox_chartfield.val()) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (this.fundingAgencyCombobox_chartfield != undefined
				&& this.fundingAgencyCombobox_chartfield != null
				&& this.fundingAgencyCombobox_chartfield.val() != null) {
			idFundingAgency = '' + this.fundingAgencyCombobox_chartfield.val();
		}

		if (this.agreementCheckbox != null) {
			if (!this.agreementCheckbox.val()) {
				this.errorMessage += '- Please agree to the terms and conditions'
			}
		}

		// console.log("" +
		// 		"You clicked the save button with parameters : \n" +
		// 		"    idLab                    : " + idLab + "\n" +
		// 		"    coreFacilitiesXMLString  : " + coreFacilitiesXMLString + "\n" +
		// 		"    accountName              : " + this.accountName + "\n" +
		// 		"    shortAcct                : " + shortAcct + "\n" +
		// 		"    accountNumberBus         : " + accountNumberBus + "\n" +
		// 		"    accountNumberOrg         : " + accountNumberOrg + "\n" +
		// 		"    accountNumberFund        : " + accountNumberFund + "\n" +
		// 		"    accountNumberActivity    : " + accountNumberActivity + "\n" +
		// 		"    accountNumberProject     : " + accountNumberProject + "\n" +
		// 		"    accountNumberAccount     : " + accountNumberAccount + "\n" +
		// 		"    accountNumberAu          : " + accountNumberAu + "\n" +
		// 		"    idFundingAgency          : " + idFundingAgency + "\n" +
		// 		"    custom1                  : " + custom1 + "\n" +
		// 		"    custom2                  : " + custom2 + "\n" +
		// 		"    custom3                  : " + custom3 + "\n" +
		// 		"    submitterEmail           : " + submitterEmail + "\n" +
		// 		"    startDate                : " + startDate + "\n" +
		// 		"    expirationDate           : " + expirationDate + "\n" +
		// 		"    totalDollarAmountDisplay : " + totalDollarAmountDisplay + "\n" +
		// 		"    activeAccount            : " + activeAccount + "\n" +
		// 		"    isPO                     : " + isPO + "\n"
		// );

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
			//   x  idLab: "1507"
			//   x? coreFacilitiesXMLString: "<coreFacilities> <CoreFacility ... /> </coreFacilities>"
			//   x  accountName: "tempAccount"
			//   x  shortAcct: ""
			//   x  accountNumberBus: "01"
			//   x  accountNumberOrg: "12345"
			//   x  accountNumberFund: "1234"
			//   x  accountNumberActivity: "12345"
			//   x  accountNumberProject: ""
			//   x  accountNumberAccount: "64300"
			//   x  accountNumberAu: "1"
			//   x  idFundingAgency: ""
			//   x  custom1: ""
			//   x  custom2: ""
			//   x  custom3: ""
			//   x  submitterEmail: "John.Hofer@hci.utah.edu"
			//   x  startDate: "11/01/2017"
			//   x  expirationDate: "03/01/2018"
			//   x  totalDollarAmountDisplay: ""
			//   x  activeAccount: "Y"
			//   x  isPO: "N"

			//  On the groups screen, the saving is done by SaveLab.gx

			this.successMessage = 'Billing Account \"' + this.accountName + '\" has been submitted to ' + this.selectedCoreFacilitiesString + '.';

			this.window.close();
			this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe((response) => {
				this.successWindow.open();
			});
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
		let idLab: string = this.labListComboBox.val();
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

		if (this.labListComboBox != null) {
			idLab = this.labListComboBox.val();

			if (!idLab.match(idLabRegex)) {
				if (idLab.length == 0) {
					this.errorMessage += '- Please select a lab\n';
				} else {
					this.errorMessage += '- Unknown error reading lab\n';
				}
			}
		}

		if (this.accountName_po != null) {
			this.accountName = this.accountName_po.val();
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

		if (this.startDatePicker_po != null && this.startDatePicker_po.inputReference != null) {
			startDate = this.startDatePicker_po.inputReference.val();
		}
		if (this.expirationDatePicker_po != null) {
			expirationDate = this.expirationDatePicker_po.inputReference.val();

			if (expirationDate.length == 0) {
				this.errorMessage += '- Please pick an expiration date.\n';
			}
		}

		if(this.totalDollarAmountInput_po != null) {
			totalDollarAmountDisplay = this.totalDollarAmountInput_po.val();
		}

		if (this.submitterEmailInput_po != null) {
			submitterEmail = '' + this.submitterEmailInput_po.val();
			if (!submitterEmail.match(submitterEmailRegex)) {
				this.errorMessage += '- Please enter a valid email address.\n'
			}
		}

		if (this.activeCheckBox_po != null && this.activeCheckBox_po.val() != null) {
			if (this.activeCheckBox_po.val()) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (this.agreementCheckbox != null) {
			if (!this.agreementCheckbox.val()) {
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

			this.window.close();
			this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe((response) => {
				this.successWindow.open();
			});
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
		let idLab: string = this.labListComboBox.val();
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

		if (this.labListComboBox != null) {
			idLab = this.labListComboBox.val();

			if (!idLab.match(idLabRegex)) {
				if (idLab.length == 0) {
					this.errorMessage += '- Please select a lab\n';
				} else {
					this.errorMessage += '- Unknown error reading lab\n';
				}
			}
		}

		if (this.accountName_creditCard != null) {
			this.accountName = this.accountName_creditCard.val();
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

		if (this.zipCodeInput_creditCard != null && this.zipCodeInput_creditCard.val() != null) {
			if (this.zipCodeInput_creditCard.val().match(zipCodeRegex)) {
				zipCode = this.zipCodeInput_creditCard.val();
			}
		}

		if (this.startDatePicker_creditcard != null && this.startDatePicker_creditcard.inputReference != null) {
			startDate = this.startDatePicker_creditcard.inputReference.val();
		}
		if (this.expirationDatePicker_creditcard != null) {
			expirationDate = this.expirationDatePicker_creditcard.inputReference.val();

			if (expirationDate.length == 0) {
				this.errorMessage += '- Please pick an expiration date.\n';
			}
		}

		if(this.totalDollarAmountInput_creditCard != null) {
			totalDollarAmountDisplay = this.totalDollarAmountInput_creditCard.val();
		}


		if (this.submitterEmailInput_creditcard != null) {
			submitterEmail = '' + this.submitterEmailInput_creditcard.val();
			if (!submitterEmail.match(submitterEmailRegex)) {
				this.errorMessage += '- Please enter a valid email address.\n'
			}
		}

		if (this.activeCheckBox_creditcard != null && this.activeCheckBox_creditcard.val() != null) {
			if (this.activeCheckBox_creditcard.val()) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		if (this.agreementCheckbox != null) {
			if (!this.agreementCheckbox.val()) {
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

			this.window.close();
			this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe((response) => {
				this.successWindow.open();
			});
		} else {
			// validation has caught problems - report them.
			this.errorWindow.open();
		}
	}

	private onLabListSelection(event: any): void {
		this.coreFacilitiesSelector.clearSelection();

		let coreFacilityGridLocalData: any[] = [];

		let args = event.args;
		if (args != undefined && args != null
				&& args.item != undefined && args.item != null
				&& args.item.originalItem != undefined && args.item.originalItem != null) {

			let item = event.args.item.originalItem;
			if (item.coreFacilities != undefined && item.coreFacilities != null) {
				if (item.coreFacilities[0] != undefined && item.coreFacilities[0] != null) {
					for (let i: number = 0; i < item.coreFacilities.length; i++) {
						if (item.coreFacilities[i].acceptOnlineWorkAuth != null
								&& item.coreFacilities[i].acceptOnlineWorkAuth != undefined
								&& item.coreFacilities[i].acceptOnlineWorkAuth === 'Y') {
							coreFacilityGridLocalData.push(item.coreFacilities[i]);
						}
					}
				} else {
					if (item.coreFacilities.CoreFacility != undefined && item.coreFacilities.CoreFacility != null) {
						if (item.coreFacilities.CoreFacility.acceptOnlineWorkAuth != null
								&& item.coreFacilities.CoreFacility.acceptOnlineWorkAuth != undefined
								&& item.coreFacilities.CoreFacility.acceptOnlineWorkAuth === 'Y') {
							coreFacilityGridLocalData.push(item.coreFacilities.CoreFacility);
						}
					}
				}
			}
		}

		this.coreFacilitiesSelector.setLocalData(coreFacilityGridLocalData);

		if (this.coreFacilitiesSelector
				&& this.coreFacilitiesSelector.grid
				&& this.coreFacilitiesSelector.grid.theGrid) {
			this.coreFacilitiesSelector.grid.theGrid.sortby('display', "asc");
		}

		this.labUsersList = event.target;

		if (coreFacilityGridLocalData.length > 0) {
			this.disableCoreFacilitiesSelector = false;
		} else {
			this.disableCoreFacilitiesSelector = true;
		}
	}

	private onCoreFacilitiesSelected(event: any): void {
		this.showFundingAgencies = true;

		this.resizeWindow();
	}

	private onLabListUnselect():void {
		this.coreFacilitiesSelector.setLocalData([{display: 'No lab selected'}]);
		this.disableCoreFacilitiesSelector = true;
	}

	private onLabListClosed(): void {
		if (this.labListComboBox != null
				&& this.labListComboBox.val() != null
				&& this.labListComboBox.val() === '') {
			this.disableCoreFacilitiesSelector = true;
		}
	}

	private onCancelButtonClicked(): void {
		this.close();
	}

	private successOkButtonClicked(): void {
		this.successWindow.close();
	}

	private errorOkButtonClicked(): void {
		this.errorWindow.close();
	}

	private clearAccountNumberActivityInput(): void {
		if (this.accountNumberActivityInput && this.accountNumberActivityInput.numberInput
				&& this.accountNumberProjectInput && this.accountNumberProjectInput.numberInput
				&& this.accountNumberProjectInput.numberInput.val() != '') {
			this.accountNumberActivityInput.clearData();
			this.isActivity = false;
		}
	}

	private clearAccountNumberProjectInput(): void {
		if (this.accountNumberProjectInput && this.accountNumberProjectInput.numberInput
				&& this.accountNumberActivityInput && this.accountNumberActivityInput.numberInput
				&& this.accountNumberActivityInput.numberInput.val() != '')  {
			this.accountNumberProjectInput.clearData();
			this.isActivity = true;
		}
	}

	private onChartfieldTotalDollarAmountSelected(): void {
		if (this.totalDollarAmountInput_chartfield != null) {
			this.lastValid_totalDollarAmountChartfield = '' + this.totalDollarAmountInput_chartfield.val();
		}
	}

	private onChartfieldTotalDollarAmountChanged(): void {
		if (this.totalDollarAmountInput_chartfield == null) {
			return;
		}

		let dollarAmountRegex = /^\d*(\.\d{0,2})?$/;

		if (this.totalDollarAmountInput_chartfield.val().match(dollarAmountRegex)) {
			this.lastValid_totalDollarAmountChartfield = this.totalDollarAmountInput_chartfield.val();
		}
		else {
			this.totalDollarAmountInput_chartfield.val(this.lastValid_totalDollarAmountChartfield);
		}
	}

	private onPoTotalDollarAmountSelected(): void {
		if (this.totalDollarAmountInput_po != null) {
			this.lastValid_totalDollarAmountPo = '' + this.totalDollarAmountInput_po.val();
		}
	}

	private onPoTotalDollarAmountChanged(): void {
		if (this.totalDollarAmountInput_po == null) {
			return;
		}

		let dollarAmountRegex = /^\d*(\.\d{0,2})?$/;

		if (this.totalDollarAmountInput_po.val().match(dollarAmountRegex)) {
			this.lastValid_totalDollarAmountPo = this.totalDollarAmountInput_po.val();
		}
		else {
			this.totalDollarAmountInput_po.val(this.lastValid_totalDollarAmountPo);
		}
	}

	private onCreditCardZipCodeSelected(): void {
		if (this.zipCodeInput_creditCard != null) {
			this.lastValid_zipCodeCreditCard = '' + this.zipCodeInput_creditCard.val();
		}
	}

	private onCreditCardZipCodeChanged(): void {
		if (this.zipCodeInput_creditCard == null) {
			return;
		}

		let zipCodeRegex = /^\d{0,5}(-\d{0,4})?$/;

		if (this.zipCodeInput_creditCard.val().match(zipCodeRegex)) {
			this.lastValid_zipCodeCreditCard = this.zipCodeInput_creditCard.val();
		}
		else {
			this.zipCodeInput_creditCard.val(this.lastValid_zipCodeCreditCard);
		}
	}

	private onCreditCardTotalDollarAmountSelected(): void {
		if (this.totalDollarAmountInput_creditCard != null) {
			this.lastValid_totalDollarAmountCreditCard = '' + this.totalDollarAmountInput_creditCard.val();
		}
	}

	private onCreditCardTotalDollarAmountChanged(): void {
		if (this.totalDollarAmountInput_creditCard == null) {
			return;
		}

		let dollarAmountRegex = /^\d*(\.\d{0,2})?$/;

		if (this.totalDollarAmountInput_creditCard.val().match(dollarAmountRegex)) {
			this.lastValid_totalDollarAmountCreditCard = this.totalDollarAmountInput_creditCard.val();
		}
		else {
			this.totalDollarAmountInput_creditCard.val(this.lastValid_totalDollarAmountCreditCard);
		}
	}
}