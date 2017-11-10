import {
	Component, ElementRef, OnDestroy, OnInit, AfterViewInit, ViewChild,
	ChangeDetectorRef, Inject
} from "@angular/core";

import { jqxButtonComponent } from "../../../assets/jqwidgets-ts/angular_jqxbuttons"
import { jqxCheckBoxComponent } from "../../../assets/jqwidgets-ts/angular_jqxcheckbox"
import { jqxComboBoxComponent } from "../../../assets/jqwidgets-ts/angular_jqxcombobox"
import { jqxInputComponent } from "../../../assets/jqwidgets-ts/angular_jqxinput"
import { jqxWindowComponent } from "../../../assets/jqwidgets-ts/angular_jqxwindow";

import { LabListService } from "../../../app/services/lab-list.service";
import { CreateSecurityAdvisorService } from "../../../app/services/create-security-advisor.service";

import { MultipleSelectorComponent } from "../../util/multipleSelector/multiple-selector.component";

import { GnomexStyledDatePickerComponent } from "../../util/gnomexStyledDatePicker/gnomex-styled-date-picker.component";

import { Subscription } from "rxjs/Subscription";

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
          overflow: auto;
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
	`]
})
export class NewBillingAccountComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild('windowRef') window: jqxWindowComponent;

	@ViewChild('windowHeader') windowHeader: ElementRef;
	@ViewChild('windowBody') windowBody: ElementRef;

	@ViewChild('labListComboBox') labListComboBox: jqxComboBoxComponent;
	@ViewChild('coreFacilitiesSelector')      coreFacilitiesSelector:      MultipleSelectorComponent;
	@ViewChild('accountNameInput_chartfield') accountNameInput_chartfield: jqxInputComponent;
	@ViewChild('shortNameInput_chartfield')   shortNameInput_chartfield:   jqxInputComponent;

	@ViewChild('accountNumberBusInput')      accountNumberBusInput:      jqxInputComponent;
	@ViewChild('accountNumberOrgInput')      accountNumberOrgInput:      jqxInputComponent;
	@ViewChild('accountNumberFundInput')     accountNumberFundInput:     jqxInputComponent;
	@ViewChild('accountNumberActivityInput') accountNumberActivityInput: jqxInputComponent;
	@ViewChild('accountNumberProjectInput')  accountNumberProjectInput:  jqxInputComponent;
	@ViewChild('accountNumberAccountInput')  accountNumberAccountInput:  jqxInputComponent;
	@ViewChild('accountNumberAUInput')       accountNumberAUInput:       jqxInputComponent;

	@ViewChild('startDatePicker_chartfield') startDatePicker_chartfield: GnomexStyledDatePickerComponent;
	@ViewChild('effectiveUntilDatePicker_chartfield') effectiveUntilDatePicker_chartfield: GnomexStyledDatePickerComponent;

	@ViewChild('totalDollarAmountInput_chartfield') totalDollarAmountInput_chartfield: jqxInputComponent;
	@ViewChild('submitterEmailInput_checkbox')      submitterEmailInput_checkbox:      jqxInputComponent;

	@ViewChild('activeCheckBox_chartfield') activeCheckBox_chartfield: jqxCheckBoxComponent;

	private showField: string = 'chartfield';

	private labList: any[] = [];
	private coreFacilityList: any[] = [];

	private labListSubscription: Subscription = null;

	constructor(@Inject(ChangeDetectorRef) private changeDetectorRef: ChangeDetectorRef,
							private labListService: LabListService,
							private createSecurityAdvisorService: CreateSecurityAdvisorService
	) {

	}

	ngOnInit(): void {
		this.labListSubscription = this.labListService.getLabList().subscribe((response: any[]) => {
			this.labList = response;
		});

		this.coreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;
		// Also need to load the list of funding agencies from dictionary, in flex, the XMLCollection is
		// source="{parentApplication.dictionaryManager.xml.Dictionary.(@className=='hci.gnomex.model.FundingAgency').DictionaryEntry}"
	}

	ngAfterViewInit(): void {
		this.window.height(this.windowHeader.nativeElement.offsetHeight + this.windowBody.nativeElement.offsetHeight + 12);
	}

	ngOnDestroy(): void {
		this.labListSubscription.unsubscribe();
	}

	changeShowField(showField: string) {
		this.showField = showField;
		this.changeDetectorRef.detectChanges();

		this.window.height(this.windowHeader.nativeElement.offsetHeight + this.windowBody.nativeElement.offsetHeight + 12);
	}

	private onSaveButtonClicked(): void {

		let accountName: string = "";
		let shortAcct: string = "";

		let isPO: boolean = false;
		let idLab: string = this.labListComboBox.val();
		let coreFacilitiesXMLString: string = "";

		let accountNumberBus: string = "";
		let accountNumberOrg: string = "";
		let accountNumberFund: string = "";
		let accountNumberActivity: string = "";
		let accountNumberProject: string = "";
		let accountNumberAccount: string = "";
		let accountNumberAu: string = "";

		let startDate: string = "";
		let expirationDate: string = "";

		let totalDollarAmountDisplay: string = "";
		let submitterEmail: string = "";
		let activeAccount: string = "";

		if (this.accountNameInput_chartfield != null) {
			accountName = this.accountNameInput_chartfield.val();
		}
		if (this.shortNameInput_chartfield != null) {
			shortAcct = this.shortNameInput_chartfield.val();
		}


		if (this.accountNumberBusInput!= null) {
			accountNumberBus = this.accountNumberBusInput.val();
		}
		if (this.accountNumberOrgInput!= null) {
			accountNumberOrg = this.accountNumberOrgInput.val();
		}
		if (this.accountNumberFundInput!= null) {
			accountNumberFund = this.accountNumberFundInput.val();
		}
		if (this.accountNumberActivityInput!= null) {
			accountNumberActivity = this.accountNumberActivityInput.val();
		}
		if (this.accountNumberProjectInput!= null) {
			accountNumberProject = this.accountNumberProjectInput.val();
		}
		if (this.accountNumberAccountInput!= null) {
			accountNumberAccount = this.accountNumberAccountInput.val();
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


		if (this.submitterEmailInput_checkbox != null) {
			submitterEmail = this.submitterEmailInput_checkbox.val();
		}

		if (this.activeCheckBox_chartfield != null && this.activeCheckBox_chartfield.val() != null) {
			if (this.activeCheckBox_chartfield.val()) {
				activeAccount = 'Y';
			} else {
				activeAccount = 'N';
			}
		}

		console.log("" +
				"You clicked the save button with parameters : \n" +
				"    isPO                     : " + isPO + "\n" +
				"    idLab                    : " + idLab + "\n" +
				"    accountName              : " + accountName + "\n" +
				"    shortAcct                : " + shortAcct + "\n" +
				"    coreFacilitiesXMLString  : " + "This should probably be replaced, possibly idCoreFacility?" + "\n" +
				"    accountNumberBus         : " + accountNumberBus + "\n" +
				"    accountNumberOrg         : " + accountNumberOrg + "\n" +
				"    accountNumberFund        : " + accountNumberFund + "\n" +
				"    accountNumberActivity    : " + accountNumberActivity + "\n" +
				"    accountNumberProject     : " + accountNumberProject + "\n" +
				"    accountNumberAccount     : " + accountNumberAccount + "\n" +
				"    accountNumberAU          : " + accountNumberAu + "\n" +
				"    startDate                : " + startDate + "\n" +
				"    expirationDate           : " + expirationDate + "\n" +
				"    totalDollarAmountDisplay : " + totalDollarAmountDisplay + "\n" +
				"    submitterEmail           : " + submitterEmail + "\n" +
				"    activeAccount            : " + activeAccount + "\n"
		);


		// in original, called SubmitWorkAuthForm.gx with params :
		//   x  accountNumberProject: ""
		//   x  accountNumberBus: "01"
		//     idFundingAgency: ""
		//     custom1: ""
		//   x  accountNumberOrg: "12345"
		//     custom2: ""
		//   x  accountName: "tempAccount"
		//   x  submitterEmail: "John.Hofer@hci.utah.edu"
		//     custom3: ""
		//   x  accountNumberActivity: "12345"
		//   x  accountNumberAu: "1"
		//   x  accountNumberFund: "1234"
		//   x  isPO: "N"
		//   x  activeAccount: "Y"
		//   x  shortAcct: ""
		//   ?  coreFacilitiesXMLString: "<coreFacilities> <CoreFacility ... /> </coreFacilities>"
		//   x  idLab: "1507"
		//   x  startDate: "11/01/2017"
		//   x  expirationDate: "03/01/2018"
		//     totalDollarAmountDisplay: ""
		//   x  accountNumberAccount: "64300"

		//  On the groups screen, the saving is done by SaveLab.gx

	}

	private onLabListSelection(event: any): void {
		let coreFacilityGridLocalData: any[] = [];

		let args = event.args;
		if (args != undefined && args != null
				&& args.item != undefined && args.item != null
				&& args.item.originalItem != undefined && args.item.originalItem != null) {

			let item = event.args.item.originalItem;
			if (item.coreFacilities != undefined && item.coreFacilities != null) {
				if (item.coreFacilities[0] != undefined && item.coreFacilities[0] != null) {
					for (let i: number = 0; i < item.coreFacilities.length; i++) {
						coreFacilityGridLocalData.push({name: item.coreFacilities[i].display});
					}
				} else {
					if (item.coreFacilities.CoreFacility != undefined && item.coreFacilities.CoreFacility != null) {
						coreFacilityGridLocalData.push({name: item.coreFacilities.CoreFacility.display});
					}
				}
			}
		}

		this.coreFacilitiesSelector.setLocalData(coreFacilityGridLocalData);

		// if (this.labListComboBox != null
		// 		&& this.labListComboBox.getSelectedItem() != null
		// 		&& this.labListComboBox.getSelectedItem().originalItem != null
		// 		&& this.labListComboBox.getSelectedItem().originalItem.coreFacilities != null
		// ) {
		//
		// 	// if the coreFacilities element is an array, that is to say there are 2+ entries
		// 	if (this.labListComboBox.getSelectedItem().originalItem.coreFacilities.length != null) {
		// 		for (let i: number = 0; i < this.labListComboBox.getSelectedItem().originalItem.coreFacilities.length; i++) {
		// 			coreFacilityGridLocalData.push({name: this.labListComboBox.getSelectedItem().originalItem.coreFacilities[i].display});
		// 		}
		// 		this.coreFacilitiesSelector.setLocalData(coreFacilityGridLocalData);
		// 	} // There is 1 entry
		// 	else if (this.labListComboBox.getSelectedItem().originalItem.coreFacilities.coreFacility != null) {
		// 		coreFacilityGridLocalData.push({name: this.labListComboBox.getSelectedItem().originalItem.coreFacilities.display});
		// 		this.coreFacilitiesSelector.setLocalData(coreFacilityGridLocalData);
		// 	} // There are no entries (shouldn't be reachable?)
		// 	else {
		// 		// Either error or do nothing, there are no core facilities
		// 	}
		// }
	}

	private onLabListUnselect():void {
		this.coreFacilitiesSelector.setLocalData([{name: 'No lab selected'}]);
	}

	private onCancelButtonClicked(): void {
		this.window.destroy();
	}
}