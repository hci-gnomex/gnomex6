import {Component, Input, OnInit} from "@angular/core";
import {MatDialog, MatDialogRef} from "@angular/material";

import {DictionaryService} from "../../services/dictionary.service";
import {PropertyService} from "../../services/property.service";

import { EditBillingAccountComponent } from "../../billing/edit_billing_account/edit-billing-account.component";

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
import { BillingUsersSelectorComponent } from "./billingUsersSelector/billing-users-selector.component";

@Component ({
	selector: "billing-account-tab",
	templateUrl: "./billing-account-tab.component.html",
	styles: [`
      .flex-base {  
					display: flex;
					flex-direction: column;
			}
			.flex-header { }
			.flex-stretch {
					display: flex;
					flex: 1;
			}
			.flex-footer { }
			
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
			
			.full-width  { width: 100%;  }
			.full-height { height: 100%; }
	`]
})
export class BillingAccountTabComponent implements OnInit{

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

	creditCardCompanies: any[];

	constructor(private dictionaryService: DictionaryService,
							private propertyService: PropertyService,
							private dialog: MatDialog) {
		this.context = { componentParent: this };
	}

	ngOnInit():void {
		// this.selectedCoreFacility = this.getDefaultCoreFacility();
		// this.chartfieldColumnDefs = this.getChartfieldColumnDefs();
		//
		// this.assignChartfieldGridContents(this.selectedCoreFacility);

		this.onLabChanged();
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
		if (this._labInfo.poBillingAccounts) {
			let tempArray = this.getApprovedUsersFromBillingAccount(this._labInfo.poBillingAccounts);

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
				width: 100,
				cellRendererFramework: ApproveButtonRenderer,
				onClick: "onApproveButtonClicked_chartfield",
				field: "isApproved"
			});
		}

		columnDefinitions.push({
			headerName: "Account name",
			editable: false,
			width: 300,
			cellRendererFramework: IconLinkButtonRenderer,
			icon: "../../../assets/pricesheet.png",
			onClick: "openChartfieldEditor",
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
			headerName: "Bus",
			editable:  true,
			width:  40,
			cellRendererFramework: TextAlignLeftMiddleRenderer,
			field: "accountNumberBus"
		});
		columnDefinitions.push({
			headerName: "Org",
			editable:  true,
			width:  60,
			cellRendererFramework: TextAlignLeftMiddleRenderer,
			field: "accountNumberOrg"
		});
		columnDefinitions.push({ headerName: "Fund",
			editable:  true,
			width:  50,
			cellRendererFramework: TextAlignLeftMiddleRenderer,
			field: "accountNumberFund"
		});
		columnDefinitions.push({
			headerName: "Activity",
			editable:  true,
			width:  70,
			cellRendererFramework: TextAlignLeftMiddleRenderer,
			field: "accountNumberActivity"
		});
		columnDefinitions.push({
			headerName: "Project",
			editable:  true,
			width:  90,
			cellRendererFramework: TextAlignLeftMiddleRenderer,
			field: "accountNumberProject"
		});
		columnDefinitions.push({ headerName: "Acct",
			editable:  true,
			width:  50,
			cellRendererFramework: TextAlignLeftMiddleRenderer,
			field: "accountNumberAccount"
		});
		columnDefinitions.push({
			headerName: "AU",
			editable:  true,
			width:  35,
			cellRendererFramework: TextAlignLeftMiddleRenderer,
			field: "accountNumberAu"
		});
		columnDefinitions.push({
			headerName: "Submitter email",
			editable:  true,
			width: 200,
			cellRendererFramework: TextAlignLeftMiddleRenderer,
			field: "submitterEmail"
		});
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
			width:  50,
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

		let gridShowRemove:boolean = false;
		for (let row of shownGridData) {
			if (RemoveLinkButtonRenderer.canRemoveRow(row)) {
				gridShowRemove = true;
				break;
			}
		}

		if (gridShowRemove) {
			columnDefinitions.push({ headerName: "",                editable: false, width: 100, cellRendererFramework: RemoveLinkButtonRenderer });
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
			columnDefinitions.push({ headerName: "",                    editable: false, width: 100, cellRendererFramework: RemoveLinkButtonRenderer });
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
			columnDefinitions.push({ headerName: "",                          editable: false, width: 100, cellRendererFramework: RemoveLinkButtonRenderer });
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


	openChartfieldEditor(rowIndex: string) {
		let dialogRef = this.dialog.open(EditBillingAccountComponent, { width: '60em', panelClass: 'no-padding-dialog' });

		dialogRef.afterClosed().subscribe((result) => {
			console.log("Editor closed!");
		});
	}

	openPoEditor(rowIndex: string) {
		let dialogRef = this.dialog.open(EditBillingAccountComponent, { width: '60em', panelClass: 'no-padding-dialog' });

		dialogRef.afterClosed().subscribe((result) => {
			console.log("Editor closed!");
		});
	}

	openCreditCardEditor(rowIndex: string) {
		let dialogRef = this.dialog.open(EditBillingAccountComponent, { width: '60em', panelClass: 'no-padding-dialog' });

		dialogRef.afterClosed().subscribe((result) => {
			console.log("Editor closed!");
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

			let dialogRef = this.dialog.open(BillingUsersSelectorComponent, { data: data, width: '60em', height: '45em', panelClass: 'no-padding-dialog' });

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

			let dialogRef = this.dialog.open(BillingUsersSelectorComponent, { data: data, width: '60em', height: '45em', panelClass: 'no-padding-dialog' });

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

			let dialogRef = this.dialog.open(BillingUsersSelectorComponent, { data: data, width: '60em', height: '45em', panelClass: 'no-padding-dialog' });

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