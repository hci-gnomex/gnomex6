import {Component, Input, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {PropertyService} from "../../services/property.service";

import { CheckboxRenderer } from "../../util/grid-renderers/checkbox.renderer";
import { IconLinkButtonRenderer } from "../../util/grid-renderers/icon-link-button.renderer";
import { RemoveLinkButtonRenderer } from "../../util/grid-renderers/remove-link-button.renderer";
import { SelectEditor } from "../../util/grid-editors/select.editor";
import { SelectRenderer } from "../../util/grid-renderers/select.renderer";
import { TextAlignLeftMiddleRenderer } from "../../util/grid-renderers/text-align-left-middle.renderer";
import { TextAlignRightMiddleRenderer } from "../../util/grid-renderers/text-align-right-middle.renderer";
import { UploadViewRemoveRenderer } from "../../util/grid-renderers/upload-view-remove.renderer";

import * as _ from "lodash";

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
							private propertyService: PropertyService) {
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

		this.assignChartfieldGridContents(this.selectedCoreFacility);
		this.assignPoGridContents(this.selectedCoreFacility);
		this.assignCreditCardGridContents(this.selectedCoreFacility);

		this.showAddAccountBox = false;
		this.creditCardCompanies = this.dictionaryService.getEntries(DictionaryService.CREDIT_CARD_COMPANY);
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

	private getChartfieldColumnDefs(shownGridData: any[]): any[] {
		let columnDefinitions = [];

		columnDefinitions.push({
			headerName: "Account name",
			editable: false,
			width: 300,
			cellRendererFramework: IconLinkButtonRenderer,
			icon: "../../../assets/pricesheet.png",
			onClick: this.openChartfieldEditor,
			field: "accountName"
		});
		columnDefinitions.push({
			headerName: "Starts",
			editable:  true,
			width: 100,
			field: "startDate"
		});
		columnDefinitions.push({
			headerName: "Expires",
			editable:  true,
			width: 100,
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
			field: "acctUsers"
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
		for (let row in shownGridData) {
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

		columnDefinitions.push({
			headerName: "PO",
			editable: false,
			width: 200,
			cellRendererFramework: IconLinkButtonRenderer,
			icon: "../../../assets/email_open.png",
			onClick: this.openPoEditor,
			field: "accountName"
		});
		columnDefinitions.push({
			headerName: "Starts",
			editable:  true,
			width: 100,
			field: "startDate"
		});
		columnDefinitions.push({
			headerName: "Expires",
			editable:  true,
			width: 100,
			field: "expirationDate"
		});
		columnDefinitions.push({
			headerName: "Purchase Order Form",
			editable:  false,
			cellRendererFramework: UploadViewRemoveRenderer,
			onClickUpload: this.onPoUploadClicked,
			onClickView: this.onPoViewClicked,
			onClickRemove: this.onPoRemoveClicked,
			width: 200,
			field: "purchaseOrderForm"
		});
		columnDefinitions.push({
			headerName: "Users",
			editable: false,
			width: 100,
			field: "acctUsers"
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

		columnDefinitions.push({
			headerName: "Credit Card Last 4 digits",
			editable: false,
			width: 200,
			cellRendererFramework: IconLinkButtonRenderer,
			icon: "../../../assets/creditcards.png",
			onClick: this.openCreditCardEditor,
			field: "accountName"
		});
		columnDefinitions.push({
			headerName: "Expires",
			editable:  true,
			width: 100,
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
			field: "acctUsers"
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


	openChartfieldEditor(rowIndex: string) {
		console.log("Should open editor for chartfield and index: " + rowIndex);
	}

	openPoEditor(rowIndex: string) {
		console.log("Should open editor for po and index: " + rowIndex);
	}

	openCreditCardEditor(rowIndex: string) {
		console.log("Should open editor for credit card and index: " + rowIndex);
	}

	onPoUploadClicked(rowIndex: string)	{
		console.log("Should open uploader for po and index: " + rowIndex);
	}

	onPoViewClicked(rowIndex: string)	{
		console.log("Should view po and index: " + rowIndex);
	}

	onPoRemoveClicked(rowIndex: string)	{
		console.log("Should remove po and index: " + rowIndex);
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