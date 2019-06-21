import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { URLSearchParams } from "@angular/http";

import { TextAlignLeftMiddleRenderer } from "../../../util/grid-renderers/text-align-left-middle.renderer";

import * as _ from "lodash";
import {GetLabService} from "../../../services/get-lab.service";
import {LabListService} from "../../../services/lab-list.service";
import {UserPreferencesService} from "../../../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";

@Component({
	selector: "billing-users-selector",
	templateUrl: "billing-users-selector.component.html",
	styles: [`
			.full-width  { width  : 100%; }
			.full-height { height : 100%; }
			
			.t  { display: table;      }
			.tr { display: table-row;  }
			.td { display: table-cell; }
			
			.flex-vertical-container {
					display: flex;
					flex-direction: column;
			}
			
			.stretch {
					flex: 1;
			}
			
			.vertical-center { vertical-align: middle; }
			.center { text-align: center; }

      .inline-block { display: inline-block; }
			
			.no-margin { margin : 0; }

			.horizontal-padding { padding: 0 1em; }
			
			.left-align  { text-align: left;  }
			.right-align { text-align: right; }
			
			.error-message { color: red; }
	`]
})
export class BillingUsersSelectorComponent {

	value: string;
	okWasClicked: boolean = false;

	displayField: string;
	valueField: string;

	options: any[];
	optionName: string;

	columnDefinitions: any[];

	gridApi: any;
	gridColumnApi: any;

	addingUser: boolean = false;

	selectedLab: any;
	labList: any[];

	selectedUser: any;
	userList: any[];

	userListLoading: boolean = false;

	constructor(private dialogRef: MatDialogRef<BillingUsersSelectorComponent>,
							private labListService: LabListService,
							private getLabService: GetLabService,
							public prefService: UserPreferencesService,
							@Inject(MAT_DIALOG_DATA) private data) {
		this.optionName   = 'Option';
		this.displayField = 'display';
		this.valueField   = 'value';
		this.options      = [];

		if (this.data) {
			this.value        = "" + this.data.value;
			this.optionName   = "" + this.data.optionName;
			this.displayField = "" + this.data.displayField;
			this.valueField   = "" + this.data.valueField;

			if (this.data.options) {
				if (Array.isArray(this.data.options)) {
					this.options = this.data.options;
				} else {
					this.options = [this.data.options];
				}
			}

			this.columnDefinitions = [
				{
					width: 25,
					checkboxSelection: true,
					headerCheckboxSelection: true,
					headerCheckboxSelectionFilteredOnly: false
				},
				{
					headerName: this.optionName,
					editable:  false,
					width:  100,
					cellRendererFramework: TextAlignLeftMiddleRenderer,
					field: this.displayField
				}
			];

			this.labListService.getAllLabs().subscribe(response => {
				this.labList = response;
			});
		}
	}

	assignGridContents(): void {
		if (this.gridApi) {
			// Because the filtering can be time intensive, it is important to make local variables to
			// store this information, so that we don't get null pointer exceptions if users click between labs quickly.
			let shownGridData;
			let idSelectedCore: string;

			if (this.options) {
				shownGridData = _.cloneDeep(this.options);

				if (!shownGridData) {
					shownGridData = [];
				} else if (!Array.isArray(shownGridData)) {
					shownGridData = [ shownGridData.BillingAccount ];
				}
			} else {
				shownGridData = [];
			}

			this.gridApi.setRowData(shownGridData);
			this.gridApi.setColumnDefs(this.columnDefinitions);
			this.gridApi.sizeColumnsToFit();

			this.selectRowData();
		}
	}

	selectRowData(): void {
		if (this.gridApi && this.valueField) {
			this.gridApi.forEachNode((node) => {
				if(node.data) {
					let tokens = this.value.trim().split(/,/);

					for (let token of tokens) {
						if (token === node.data[this.valueField]) {
							node.setSelected(true);
						}
					}
				}
			});
		}
	}

	getValue(): string {
		if (!this.okWasClicked) {
			return this.value;
		}

		let result: string = '';
		if (this.gridApi) {
			let first: boolean = true;

			for (let node of this.gridApi.getSelectedNodes()) {
				if (node && node.data) {
					if (first) {
						first = false;
						result += node.data.value;
					} else {
						result += ',' + node.data.value;
					}
				}
			}
		}

		return result;
	}

	addUserFromOtherLabButtonClicked(): void {
		this.addingUser = true;
	}

	updateButtonClicked(): void {
		this.okWasClicked = true;

		this.value = this.getValue();

		this.dialogRef.close();
	}

	cancelButtonClicked(): void {
		this.dialogRef.close();
	}

	addUserButtonClicked(): void {
		this.options.push(this.selectedUser);
		this.value.length > 0 ? this.value += ',' + this.selectedUser[this.valueField] : this.value = this.selectedUser[this.valueField];

		this.addingUser = false;
		this.selectRowData();
	}

	backButtonClicked(): void {
		this.selectedLab  = null;
		this.selectedUser = null;

		this.addingUser = false;
		this.selectRowData();
	}

	onLabListSelection(): void {
		this.userListLoading = true;
		this.userList = [];

		let params: HttpParams = new HttpParams()
			.set("idLab", this.selectedLab.idLab);
		this.getLabService.getLab(params).subscribe((response: any) => {
			if (response && response.Lab && response.Lab.activeSubmitters) {
				if (Array.isArray(response.Lab.activeSubmitters)) {
					this.userList = response.Lab.activeSubmitters.filter((a) => { return a.display && a.display !== ''; });
				} else {
					if (response.Lab.activeSubmitters.AppUser
							&& response.Lab.activeSubmitters.AppUser.display
							&& response.Lab.activeSubmitters.AppUser.display !== '') {
						this.userList.push(response.Lab.activeSubmitters.AppUser);
					}
				}

				this.userListLoading = false;
			}
		});
	}

	onGridSizeChanged(): void {
		if (this.gridApi) {
			this.gridApi.sizeColumnsToFit();
		}
	}

	onGridReady(event: any): void {
		this.gridApi = event.api;
		this.gridColumnApi = event.columnApi;

		this.assignGridContents();
		this.onGridSizeChanged()
	}
}