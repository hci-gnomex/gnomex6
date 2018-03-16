import {Component, Input, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {PropertyService} from "../../services/property.service";

import * as _ from "lodash";

import {ICellEditorAngularComp, ICellRendererAngularComp} from "ag-grid-angular";


@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td cell-text-container">
						{{display}}
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
			.t  { display: table;      }
			.tr { display: table-row;  }
			.td { display: table-cell; }
			
			.cell-text-container { 
					vertical-align: middle;
					padding-left: 0.3rem;
			}
			
      .full-width  { width:  100%; } 
			.full-height { height: 100%; }
	`]
}) export class SelectCellRenderer implements ICellRendererAngularComp{
	private params: any;
	value: string;
	display: string;
	options: any;
	optionsValueField: string;
	optionsDisplayField: string;

	agInit(params: any): void {
		this.params = params;
		this.options = [];
		this.value = "";
		this.optionsValueField = "";
		this.optionsDisplayField = "";

		if (this.params) {
			this.value = this.params.valueFormatted;
		}

		if (this.params && this.params.column && this.params.column.colDef) {
			this.options             = this.params.column.colDef.selectOptions;
			this.optionsValueField   = this.params.column.colDef.selectOptionsValueField;
			this.optionsDisplayField = this.params.column.colDef.selectOptionsDisplayField;
		}

		if (this.value && this.value != ""
				&& this.options && this.options.length > 0
				&& this.optionsValueField && this.optionsValueField != ""
				&& this.optionsDisplayField && this.optionsDisplayField != "") {

			for (let option of this.options) {
				if (option[this.optionsValueField] && option[this.optionsValueField] === this.value) {
					if (option[this.optionsDisplayField]) {
						this.display = option[this.optionsDisplayField]
					} else {
						this.display = this.value;
					}
					break;
				}
			}
		} else {
			this.display = this.value;
		}
	}

	callParentFunction(): void {
		if (this.params && this.params.context && this.params.context.componentParent) {
			this.params.context.componentParent.testingFunction("");

			if (this.params && this.params.column && this.params.column.colDef) {
				this.params.context.componentParent.testingFunction(this.params.column.colDef.selectOptions);
			}
		}
	}

	refresh(): boolean {
		return false;
	}
}

@Component({
	template: `
		<div class="full-width full-height">
			<select class="full-width full-height" [(value)]="value" (change)="onChange($event)">
				<option 
						*ngFor="let option of options" 
						value="{{option.hasOwnProperty(optionsValueField) ? option[optionsValueField] : (option.value) ? option.value : option }}">
					{{option.hasOwnProperty(optionsDisplayField) ? option[optionsDisplayField] : (option.display) ? option.display : option }}
				</option>
			</select>
		</div>
	`,
	styles: [`
      .full-width  { width:  100%; } 
			.full-height { height: 100%; }
	`]
}) export class SelectCellEditor implements ICellEditorAngularComp{
	private params: any;
	value: any;
	options: any;
	optionsValueField: string;
	optionsDisplayField: string;

	agInit(params: any): void {
		this.params = params;
		this.options = [];
		this.optionsValueField = "";
		this.optionsDisplayField = "";

		if (this.params && this.params.column && this.params.column.colDef) {
			this.options             = this.params.column.colDef.selectOptions;
			this.optionsValueField   = this.params.column.colDef.selectOptionsValueField;
			this.optionsDisplayField = this.params.column.colDef.selectOptionsDisplayField;
		}

		if (this.params) {
			this.value = "" + this.params.value;
		}
	}

	onChange(event: any): void {
		if(event && event.currentTarget) {
			// This looks unnecessary, since this.value is linked to the value of the select component, but
			// because this also ends editing, it also queues the destruction of this component and the call to getValue.
			// The problem was that this.value isn't updated with the new value before this event fires,
			// so we need to update it manually here.
			this.value = event.currentTarget.value;
		}
		if (this.params) {
			this.params.stopEditing();
		}
	}

	callParentFunction(): void {
		if (this.params && this.params.context && this.params.context.componentParent) {
			this.params.context.componentParent.testingFunction("");

			if (this.params && this.params.column && this.params.column.colDef) {
				this.params.context.componentParent.testingFunction(this.params.column.colDef.selectOptions);
			}
		}
	}

	getValue(): any {
		return this.value;
	}

	isPopup(): boolean {
		return false;
	}
}

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height cursor" (click)="invokeParentMethod()">
				<div class="tr">
					<div class="td vertical-center button-container">
						<button class="link-button {{classes}}"><img *ngIf="showIcon" src="{{icon}}" alt=""/><div class="name inline-block">{{value}}</div></button>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
			button.link-button {
					background: none;
					background-color: inherit;
					border: none;
					padding: 0;
					text-decoration: underline;
					cursor: pointer;
			}
      
			button.link-button:focus {
					outline: none;
      }
			
      .button-container {
					padding-left: 0.3rem;
			}
			
			.cursor { cursor: pointer; }
			
			.full-width  { width:  100% }
			.full-height { height: 100% }
			
			.t  { display: table; }
			.tr { display: table-row; }
			.td { display: table-cell; }
			
			.inline-block { display: inline-block; }
			
			.vertical-center { vertical-align: middle; }
			
			.name {
					padding-left: 0.5rem;
          text-decoration: underline;
			}
			.is-active {
					color: #0000FF;
					font-weight: bold;
					font-style: normal;
			}
      .is-not-active {
          color: #6a6b6e;
          font-weight: normal;
          font-style: italic;
      }
	`]
})
export class NameRenderer implements ICellRendererAngularComp {
	public params: any;
	public static readonly ACTIVE: string = "is-active";
	public static readonly INACTIVE: string = "is-not-active";
	public classes: string;
	public icon: string;
	public showIcon: boolean;
	public value: string;
	private onClick;

	agInit(params: any): void {
		this.params = params;
		this.value = "";
		this.icon = "";
		this.showIcon = false;

		this.classes = "";
		this.checkIfActive();

		if (this.params) {
			this.value = "" + this.params.value;
		}

		if (this.params && this.params.colDef) {
			this.onClick = this.params.colDef.onClick;
			this.icon = this.params.colDef.icon;
			if (this.icon) {
				this.showIcon = true;
			}
		}
	}

	refresh(params: any): boolean {
		return false;
	}

	checkIfActive(): void {
		if (this.params && this.params.data && this.params.data.isActive && this.params.data.isActive.toLowerCase() == 'y') {
			this.classes = this.classes + " " + NameRenderer.ACTIVE;
		} else {
			this.classes = this.classes + " " + NameRenderer.INACTIVE;
		}
	}

	invokeParentMethod(): void {
		if (this.onClick && this.params && this.params.context && this.params.context.componentParent) {
			//this.params.context.componentParent[this.onClick](this.params.node.rowIndex);
			this.onClick(this.params.node.rowIndex);
		}
	}
}

@Component({
	template: `
		<div class="full-width full-height">
			<div *ngIf="showRemoveButton" class="t full-width full-height cursor" (click)="invokeParentMethod()">
				<div class="tr">
					<div class="td vertical-center button-container">
						<button class="link-button">Remove</button>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
			button.link-button {
					background: none;
					background-color: inherit;
					color: #0a4894;
					border: none;
					padding: 0;
					font: inherit;
					text-decoration: underline;
					cursor: pointer;
			}
      
			button.link-button:focus {
					outline: none;
      }
			
      .button-container {
					padding-left: 0.3rem;
			}
			
			.cursor { cursor: pointer; }
			
			.full-width  { width:  100% }
			.full-height { height: 100% }
			
			.t  { display: table; }
			.tr { display: table-row; }
			.td { display: table-cell; }
			
			.vertical-center { vertical-align: middle; }
	`]
})
export class ChartfieldRemoveRenderer implements ICellRendererAngularComp {
	public params: any;
	showRemoveButton: boolean;

	agInit(params: any): void {
		this.params = params;
		this.checkIfShowRemove();
	}

	refresh(params: any): boolean {
		return false;
	}

	checkIfShowRemove(): void {
		if (this.params && this.params.data) {
			this.showRemoveButton = ChartfieldRemoveRenderer.canRemoveRow(this.params.data);
		} else {
			this.showRemoveButton = true;
		}
	}

	static canRemoveRow(row: any): boolean {
		return !(row && row.totalChargesToDateDisplay && row.totalChargesToDateDisplay !== '');
	}

	invokeParentMethod(): void {
		if (this.params && this.params.context && this.params.context.componentParent) {
			this.params.context.componentParent.removeChartfieldRow(this.params.node.rowIndex);
		}
	}
}

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td vertical-center right-align padded">
						{{ valueFormatted }}
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
			
			.full-width  { width:  100% }
			.full-height { height: 100% }
			
			.t  { display: table; }
			.tr { display: table-row; }
			.td { display: table-cell; }
			
			.vertical-center { vertical-align: middle; }
			.right-align     { text-align: right;      }
      .padded          { padding:        0 0.3rem; }
	`]
})
export class ChartfieldRightMiddleRenderer implements ICellRendererAngularComp {
	params: any;
	valueFormatted: string;

	agInit(params: any): void {
		this.params = params;

		this.valueFormatted = (this.params && this.params.valueFormatted) ? this.params.valueFormatted : "";
	}

	refresh(params: any): boolean {
		return false;
	}
}

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td vertical-center center-align">
						<input type="checkbox" [checked]="checked">
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`

      .full-width  { width:  100% }
      .full-height { height: 100% }

      .t  { display: table; }
      .tr { display: table-row; }
      .td { display: table-cell; }

      .vertical-center { vertical-align: middle; }
      .center-align    { text-align:     center; }
	`]
})
export class CheckboxRenderer implements ICellRendererAngularComp {
	params: any;
	checked: boolean;

	agInit(params: any): void {
		this.params = params;

		this.checked = (this.params && this.params.value && this.params.value === 'Y') ? true : false;
	}

	refresh(params: any): boolean {
		return false;
	}
}

@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height">
				<div class="tr">
					<div class="td vertical-center left-align padded">
						{{ valueFormatted }}
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
			
			.full-width  { width:  100% }
			.full-height { height: 100% }
			
			.t  { display: table; }
			.tr { display: table-row; }
			.td { display: table-cell; }
			
			.vertical-center { vertical-align: middle;   }
			.left-align      { text-align:     left;     }
			.padded          { padding:        0 0.3rem; }
	`]
})
export class ChartfieldLeftMiddleRenderer implements ICellRendererAngularComp {
	params: any;
	valueFormatted: string;

	agInit(params: any): void {
		this.params = params;

		this.valueFormatted = (this.params && this.params.valueFormatted) ? this.params.valueFormatted : "";
	}

	refresh(params: any): boolean {
		return false;
	}
}


@Component({
	template: `
		<div class="full-width full-height">
			<div class="t full-width full-height cursor">
				<div class="tr">
					<div class="td vertical-center button-container">
						<button class="link-button" (click)="invokeParentOnClickUpload()">
							<img src="../../../assets/upload.png" alt=""/>
							<div class="name inline-block">
								Upload
							</div>
						</button>
						<button class="link-button" (click)="invokeParentOnClickView()">
							<img *ngIf="hasPoForm" src="../../../assets/page_find.gif" alt=""/>
							<div class="name inline-block">
								View
							</div>
						</button>
						<button class="link-button" (click)="invokeParentOnClickRemove()">
							<img *ngIf="showIcon" src="../../../assets/page_cross.gif" alt=""/>
							<div class="name inline-block">
								Remove
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
			button.link-button {
					background: none;
					background-color: inherit;
          color: #0000FF;
					border: none;
					padding: 0;
					text-decoration: underline;
					cursor: pointer;
					margin-right: 0.6rem;
			}
      
			button.link-button:focus {
					outline: none;
      }
			
      .button-container {
					padding-left: 0.3rem;
			}
			
			.cursor { cursor: pointer; }
			
			.full-width  { width:  100% }
			.full-height { height: 100% }
			
			.t  { display: table; }
			.tr { display: table-row; }
			.td { display: table-cell; }
			
			.inline-block { display: inline-block; }
			
			.vertical-center { vertical-align: middle; }
			
			.name {
					padding-left: 0.5rem;
          text-decoration: underline;
			}
	`]
})
export class PurchaseOrderRenderer implements ICellRendererAngularComp {
	public params: any;
	public hasPoForm: boolean;
	private onClickUpload;
	private onClickView;
	private onClickRemove;

	agInit(params: any): void {
		this.params = params;
		this.hasPoForm = false;

		this.checkIfHasPoForm();

		if (this.params && this.params.colDef) {
			this.onClickUpload = this.params.colDef.onClickUpload;
			this.onClickView   = this.params.colDef.onClickView;
			this.onClickRemove = this.params.colDef.onClickRemove;
		}
	}

	refresh(params: any): boolean {
		return false;
	}

	checkIfHasPoForm(): void {
		if (this.params && this.params.data && this.params.data.isActive && this.params.data.isActive.toLowerCase() == 'y') {
			this.hasPoForm = true;
		} else {
			this.hasPoForm = false;
		}
	}

	invokeParentOnClickUpload(): void {
		if (this.onClickUpload && this.params && this.params.context && this.params.context.componentParent) {
			//this.params.context.componentParent[this.onClick](this.params.node.rowIndex);
			this.onClickUpload(this.params.node.rowIndex);
		}
	}

	invokeParentOnClickView(): void {
		if (this.onClickView && this.params && this.params.context && this.params.context.componentParent) {
			//this.params.context.componentParent[this.onClick](this.params.node.rowIndex);
			this.onClickView(this.params.node.rowIndex);
		}
	}

	invokeParentOnClickRemove(): void {
		if (this.onClickRemove && this.params && this.params.context && this.params.context.componentParent) {
			//this.params.context.componentParent[this.onClick](this.params.node.rowIndex);
			this.onClickRemove(this.params.node.rowIndex);
		}
	}
}


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
			cellRendererFramework: NameRenderer,
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
			cellRendererFramework: ChartfieldLeftMiddleRenderer,
			field: "accountNumberBus"
		});
		columnDefinitions.push({
			headerName: "Org",
			editable:  true,
			width:  60,
			cellRendererFramework: ChartfieldLeftMiddleRenderer,
			field: "accountNumberOrg"
		});
		columnDefinitions.push({ headerName: "Fund",
			editable:  true,
			width:  50,
			cellRendererFramework: ChartfieldLeftMiddleRenderer,
			field: "accountNumberFund"
		});
		columnDefinitions.push({
			headerName: "Activity",
			editable:  true,
			width:  70,
			cellRendererFramework: ChartfieldLeftMiddleRenderer,
			field: "accountNumberActivity"
		});
		columnDefinitions.push({
			headerName: "Project",
			editable:  true,
			width:  90,
			cellRendererFramework: ChartfieldLeftMiddleRenderer,
			field: "accountNumberProject"
		});
		columnDefinitions.push({ headerName: "Acct",
			editable:  true,
			width:  50,
			cellRendererFramework: ChartfieldLeftMiddleRenderer,
			field: "accountNumberAccount"
		});
		columnDefinitions.push({
			headerName: "AU",
			editable:  true,
			width:  35,
			cellRendererFramework: ChartfieldLeftMiddleRenderer,
			field: "accountNumberAu"
		});
		columnDefinitions.push({
			headerName: "Submitter email",
			editable:  true,
			width: 200,
			cellRendererFramework: ChartfieldLeftMiddleRenderer,
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
			cellRendererFramework: ChartfieldRightMiddleRenderer,
			field: "totalChargesToDateDisplay"
		});

		let gridShowRemove:boolean = false;
		for (let row in shownGridData) {
			if (ChartfieldRemoveRenderer.canRemoveRow(row)) {
				gridShowRemove = true;
				break;
			}
		}

		if (gridShowRemove) {
			columnDefinitions.push({ headerName: "",                editable: false, width: 100, cellRendererFramework: ChartfieldRemoveRenderer });
		}

		return columnDefinitions;
	}

	private getPoColumnDefs(shownGridData: any[]): any[] {
		let columnDefinitions = [];

		columnDefinitions.push({
			headerName: "PO",
			editable: false,
			width: 200,
			cellRendererFramework: NameRenderer,
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
			editable:  true,
			cellRendererFramework: PurchaseOrderRenderer,
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
			cellRendererFramework: ChartfieldRightMiddleRenderer
		});

		let gridShowRemove:boolean = false;
		for (let row of shownGridData) {
			if (ChartfieldRemoveRenderer.canRemoveRow(row)) {
				gridShowRemove = true;
				break;
			}
		}

		if (gridShowRemove) {
			columnDefinitions.push({ headerName: "",                    editable: false, width: 100, cellRendererFramework: ChartfieldRemoveRenderer });
		}

		return columnDefinitions;
	}

	private getCreditCardColumnDefs(shownGridData): any[] {
		let columnDefinitions = [];

		columnDefinitions.push({
			headerName: "Credit Card Last 4 digits",
			editable: false,
			width: 200,
			cellRendererFramework: NameRenderer,
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
			cellRendererFramework: SelectCellRenderer,
			cellEditorFramework: SelectCellEditor,
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
			cellRendererFramework: ChartfieldRightMiddleRenderer
		});

		let gridShowRemove:boolean = false;
		for (let row of shownGridData) {
			if (ChartfieldRemoveRenderer.canRemoveRow(row)) {
				gridShowRemove = true;
				break;
			}
		}

		if (gridShowRemove) {
			columnDefinitions.push({ headerName: "",                          editable: false, width: 100, cellRendererFramework: ChartfieldRemoveRenderer });
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