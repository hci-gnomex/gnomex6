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
	`]
})
export class NewBillingAccountComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild('windowRef') window: jqxWindowComponent;
	@ViewChild('successWindow') successWindow: jqxWindowComponent;

	@ViewChild('windowHeader') windowHeader: ElementRef;
	@ViewChild('windowBody') windowBody: ElementRef;

	@ViewChild('labListComboBox') labListComboBox: jqxComboBoxComponent;
	@ViewChild('coreFacilitiesSelector')      coreFacilitiesSelector:      MultipleSelectorComponent;
	@ViewChild('accountNameInput_chartfield') accountNameInput_chartfield: jqxInputComponent;
	@ViewChild('shortNameInput_chartfield')   shortNameInput_chartfield:   jqxInputComponent;

	@ViewChild('accountNumberBusInput')      accountNumberBusInput:      NumberJqxInputComponent;
	@ViewChild('accountNumberOrgInput')      accountNumberOrgInput:      NumberJqxInputComponent;
	@ViewChild('accountNumberFundInput')     accountNumberFundInput:     NumberJqxInputComponent;
	@ViewChild('accountNumberActivityInput') accountNumberActivityInput: NumberJqxInputComponent;
	@ViewChild('accountNumberProjectInput')  accountNumberProjectInput:  NumberJqxInputComponent;
	@ViewChild('accountNumberAccountInput')  accountNumberAccountInput:  NumberJqxInputComponent;
	@ViewChild('accountNumberAUInput')       accountNumberAUInput:       jqxInputComponent;

	@ViewChild('startDatePicker_chartfield') startDatePicker_chartfield: GnomexStyledDatePickerComponent;
	@ViewChild('effectiveUntilDatePicker_chartfield') effectiveUntilDatePicker_chartfield: GnomexStyledDatePickerComponent;

	@ViewChild('fundingAgencyCombobox_chartfield') fundingAgencyCombobox_chartfield: jqxComboBoxComponent;

	@ViewChild('totalDollarAmountInput_chartfield') totalDollarAmountInput_chartfield: jqxInputComponent;
	@ViewChild('submitterEmailInput_chartfield')    submitterEmailInput_chartfield:    jqxInputComponent;

	@ViewChild('activeCheckBox_chartfield') activeCheckBox_chartfield: jqxCheckBoxComponent;

	private showField: string = 'chartfield';

	private labList: any[] = [];
	private coreFacilityList: any[] = [];
	private labUsersList: any[] = [];

	private labListSubscription: Subscription = null;

	private fundingAgencies: any;

	private showFundingAgencies: boolean = false;

	private accountName: string = "";
	private selectedCoreFacilitiesString: string = "";

	private internalAccountFieldsConfiguration: any;
	private internalAccountFieldsConfigurationSubscription: any;

	private successMessage: string = '';

	private usersEmail: string;

	private errorTitle: string;
	private errorMessage: string;

	constructor(@Inject(ChangeDetectorRef) private changeDetectorRef: ChangeDetectorRef,
							private dictionaryService: DictionaryService,
							private labListService: LabListService,
							private createSecurityAdvisorService: CreateSecurityAdvisorService,
							private accountFieldsConfigurationService: AccountFieldsConfigurationService,
							private newBillingAccountService: NewBillingAccountService
	) { }

	ngOnInit(): void {
		this.labListSubscription = this.labListService.getLabList().subscribe((response: any[]) => {
			this.labList = response;
		});

		this.coreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;

		this.usersEmail = this.createSecurityAdvisorService.userEmail;

		// Also need to load the list of funding agencies from dictionary, in flex, the XMLCollection is
		// source="{parentApplication.dictionaryManager.xml.Dictionary.(@className=='hci.gnomex.model.FundingAgency').DictionaryEntry}"

		let originalFundingAgencies = this.dictionaryService.getEntries('hci.gnomex.model.FundingAgency');
		this.fundingAgencies = [];

		if (originalFundingAgencies.length != undefined && originalFundingAgencies.length != null) {
			for (let i = 0; i < originalFundingAgencies.length; i++) {
				if (originalFundingAgencies[i].fundingAgency != null && originalFundingAgencies[i].value != null) {
					this.fundingAgencies.push(originalFundingAgencies[i]);
				}
			}
		}

		this.internalAccountFieldsConfigurationSubscription =
				this.accountFieldsConfigurationService.getInternalAccountFieldsConfigurationObservable().subscribe((response) => {
					this.internalAccountFieldsConfiguration = response;
				});

		// this.accountNumberBusInput.warningActive(true);
	}

	ngAfterViewInit(): void {
		this.window.height(this.windowHeader.nativeElement.offsetHeight + this.windowBody.nativeElement.offsetHeight + 12);
	}

	ngOnDestroy(): void {
		this.labListSubscription.unsubscribe();
		this.internalAccountFieldsConfigurationSubscription.unsubscribe();
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

		let shortAcct: string = "";

		let isPO: string = (this.showField === 'po') ? 'Y' : 'N';
		let idLab: string = this.labListComboBox.val();

		let coreFacilitiesXMLString: string = "";
		let coreFacilities:any[] = [];

		let accountNumberBus: string = "";
		let accountNumberOrg: string = "";
		let accountNumberFund: string = "";
		let accountNumberActivity: string = "";
		let accountNumberProject: string = "";
		let accountNumberAccount: string = "";
		let accountNumberAu: string = "";

		let startDate: string = "";
		let expirationDate: string = "";

		let idFundingAgency: string = "";

		let totalDollarAmountDisplay: string = "";
		let submitterEmail: string = "";
		let activeAccount: string = "";

		// The custom fields only displayed in the flex version of GNomEx if there were certain entries in the
		// "InternalAccountFieldsConfiguration" or "OtherAccountFieldsConfiguration" tables.  However, at time
		// of development this feature seems to be unused, so its implementation is delayed.
		// As a note for the future, the "AccountFieldsConfigurationService" is intended to provide access to
		// those fields.
		let custom1: string = '';
		let custom2: string = '';
		let custom3: string = '';

		if (this.accountNameInput_chartfield != null) {
			this.accountName = this.accountNameInput_chartfield.val();
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

				// coreFacilities.push(possibleCoreFacilities[selectedIndices[i].valueOf()]);
				// TODO : Last change
				coreFacilities.push(coreFacility);

				if (i > 0 && i + 1 < selectedIndices.length) {
					this.selectedCoreFacilitiesString += ', ';
				} else if (i + 1 === selectedIndices.length) {
					this.selectedCoreFacilitiesString += ' and ';
				}

				this.selectedCoreFacilitiesString += possibleCoreFacilities[selectedIndices[i].valueOf()].display;
			}

			if (coreFacilities.length == 0) {
				this.errorTitle = 'Please fix the following errors with this form before proceeding:';
				this.errorMessage = '- Please select at least one core facility';
			}

			coreFacilitiesXMLString = JSON.stringify(coreFacilities);
		}

		if (this.accountNumberBusInput != null && this.accountNumberBusInput.numberInput != null) {
			accountNumberBus = this.accountNumberBusInput.numberInput.val();
		}
		if (this.accountNumberOrgInput!= null && this.accountNumberOrgInput.numberInput != null) {
			accountNumberOrg = this.accountNumberOrgInput.numberInput.val();
		}
		if (this.accountNumberFundInput!= null && this.accountNumberFundInput.numberInput != null) {
			accountNumberFund = this.accountNumberFundInput.numberInput.val();
		}
		if (this.accountNumberActivityInput!= null && this.accountNumberActivityInput.numberInput != null) {
			accountNumberActivity = this.accountNumberActivityInput.numberInput.val();
		}
		if (this.accountNumberProjectInput!= null && this.accountNumberProjectInput.numberInput != null) {
			accountNumberProject = this.accountNumberProjectInput.numberInput.val();
		}
		if (this.accountNumberAccountInput!= null && this.accountNumberAccountInput.numberInput != null) {
			accountNumberAccount = this.accountNumberAccountInput.numberInput.val();
		}
		if (this.accountNumberAUInput!= null) {
			accountNumberAu = this.accountNumberAUInput.val();
		}


		if (this.startDatePicker_chartfield != null) {
			startDate = this.startDatePicker_chartfield.inputReference.val();
		}
		if (this.effectiveUntilDatePicker_chartfield != null) {
			expirationDate = this.effectiveUntilDatePicker_chartfield.inputReference.val();
		}

		if(this.totalDollarAmountInput_chartfield != null) {
			totalDollarAmountDisplay = this.totalDollarAmountInput_chartfield.val();
		}


		if (this.submitterEmailInput_chartfield != null) {
			submitterEmail = this.submitterEmailInput_chartfield.val();
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

		let parameters: URLSearchParams = new URLSearchParams();

		parameters.set('idLab',                    idLab);
		parameters.set('coreFacilitiesXMLString',  coreFacilitiesXMLString);
		parameters.set('accountName',              this.accountName);
		parameters.set('shortAcct',                shortAcct);
		parameters.set('accountNumberBus',         accountNumberBus);
		parameters.set('accountNumberOrg',         accountNumberOrg);
		parameters.set('accountNumberFund',        accountNumberFund);
		parameters.set('accountNumberActivity',    accountNumberActivity);
		parameters.set('accountNumberProject',     accountNumberProject);
		parameters.set('accountNumberAccount',     accountNumberAccount);
		parameters.set('accountNumberAu',          accountNumberAu);
		parameters.set('idFundingAgency',          idFundingAgency);
		parameters.set('custom1',                  custom1);
		parameters.set('custom2',                  custom2);
		parameters.set('custom3',                  custom3);
		parameters.set('submitterEmail',           submitterEmail);
		parameters.set('startDate',                startDate);
		parameters.set('expirationDate',           expirationDate);
		parameters.set('totalDollarAmountDisplay', totalDollarAmountDisplay);
		parameters.set('activeAccount',            activeAccount);
		parameters.set('isPO',                     isPO);


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

		this.successMessage = 'Billing Account ' + this.accountName + ' has been submitted to ' + this.selectedCoreFacilitiesString + '.';

		this.window.close();
		this.newBillingAccountService.submitWorkAuthForm_chartfield(parameters).subscribe((response) => {
			this.successWindow.open();
		});
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
	}

	private onCoreFacilitiesSelected(event: any): void {
		this.showFundingAgencies = true;

		this.resizeWindow();
	}

	private onLabListUnselect():void {
		this.coreFacilitiesSelector.setLocalData([{display: 'No lab selected'}]);
	}

	private onCancelButtonClicked(): void {
		this.window.destroy();
	}

	private successOkButtonClicked(): void {
		this.successWindow.close();
	}

	private clearAccountNumberActivityInput(): void {
		if (this.accountNumberActivityInput && this.accountNumberActivityInput.numberInput
				&& this.accountNumberProjectInput && this.accountNumberProjectInput.numberInput
				&& this.accountNumberProjectInput.numberInput.val() != '') {
			this.accountNumberActivityInput.clearData();
		}
	}

	private clearAccountNumberProjectInput(): void {
		if (this.accountNumberProjectInput && this.accountNumberProjectInput.numberInput
				&& this.accountNumberActivityInput && this.accountNumberActivityInput.numberInput
				&& this.accountNumberActivityInput.numberInput.val() != '')  {
			this.accountNumberProjectInput.clearData();
		}
	}
}