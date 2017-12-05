import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";

import {ExperimentsService} from "../experiments.service";
import {Subscription} from "rxjs/Subscription";
import {NgModel} from "@angular/forms"
import {URLSearchParams} from "@angular/http";

import {jqxComboBoxComponent} from "../../../assets/jqwidgets-ts/angular_jqxcombobox";
import {jqxWindowComponent} from "../../../assets/jqwidgets-ts/angular_jqxwindow";

import {BrowseFilterComponent} from "../../util/browse-filter.component";
import {DictionaryService} from "../../services/dictionary.service";
import {EmailRelatedUsersPopupComponent} from "../../util/emailRelatedUsersPopup/email-related-users-popup.component"
import {GnomexStyledGridComponent} from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.component"
import {PropertyService} from "../../services/property.service";
import {Alert} from "selenium-webdriver";
/**
 *	This component represents the screen you get pulled to by selecting "Experiment -> Orders" from
 *	the navigation bar.
 *
 *	The purpose of this page is to summarize all the experiments at specific points in the workflow
 *	and allows the user to move items to other stages.
 *
 * @since 7/20/2017.
 */
@Component({
	selector: "ExperimentOrders",
	templateUrl: "./experiment-orders.component.html",
	styles: [`
      div.t {
          display: table;
      }

      div.tr {
          display: table-row;
          vertical-align: middle;
      }

      div.td {
          display: table-cell;
          vertical-align: middle;
      }

      div.background {
          width: 100%;
          height: 100%;
          background-color: #EEEEEE;
          padding: 0.3em;
          border-radius: 0.3em;
          border: 1px solid darkgrey;
          position: relative;
          display: flex;
          flex-direction: column;
      }

      .title {
          text-align: left;
          font-size: medium;
          width: 12em;
      }

      div.filter-bar label {
          margin-bottom: 0;
      }

      div.radioGroup input {
          margin-left: 0.7rem;
      }

      div.lower-panel {
          height: 100%;
          width: 100%;
          border: 1px solid darkgrey;
          background-color: white;
          padding: 0.3em;
          display: block;
      }

      div.grid-footer {
          display: block;
          width: 100%;
          margin-top: 0.3em;
          padding: 0em 0.8em;
      }

      div.button-container {
          padding: 0.2em 0em 0.2em 0.6em;
      }
	`]
})
export class ExperimentOrdersComponent implements OnInit, OnDestroy {

	@ViewChild('myGrid') myGrid: GnomexStyledGridComponent;
	@ViewChild('statusComboBox') statusCombobox: jqxComboBoxComponent;
	@ViewChild('errorPopup') errorPopup: jqxWindowComponent;
	@ViewChild('warningPopup') warningPopup: jqxWindowComponent;
	@ViewChild('confirmationPopup') confirmationPopup: jqxWindowComponent;
	@ViewChild('windowReference') window: EmailRelatedUsersPopupComponent;

	private errorMessage: string = '';
	private warningMessage: string = '';

	private dictionary: any;

	private experimentsSubscription: Subscription;
	private statusChangeSubscription: Subscription;

	private selectedRequestNumbers: string[];
	private changeStatusResponsesRecieved: number;


	private actionCellsRenderer = (row: number, column: any, value: any): any => {
		return `<div style="display:inline-block; width: 80%; padding-left: 10%; padding-right:10%; text-align: center;">
							<div style="display:inline-block; width: 35%; text-align: center;">
								<a>View</a>
							</div>
							<div style="display:inline-block; width: 35%; padding-left:10%; text-align: center;">
								<a>Edit</a>
							</div>
						</div>`;
	};

	private experimentNumberCellsRenderer = (row: number, column: any, value: any): any => {
		let imgSource = this.source.localdata[row].icon;
		return `<div style="display: block; text-align: left; padding: 0.3rem 0.5rem;">
							<img src="` + imgSource +`" alt=""/>` + value +
					 `</div>`;
	};

	private dateCellsRenderer = (row: number, column: any, value: any): any => {
		let tokens:string[] = ('' + value).split(' ');
		let error:boolean = false;

		error = error || tokens.length != 9;

		if(error) {
			return "";
		} else {
			let month: string;
			let day: string;
			let year: string;

			let time: string;

			switch(tokens[1]) {
				case 'Jan' : month = '01'; break;
				case 'Feb' : month = '02'; break;
				case 'Mar' : month = '03'; break;
				case 'Apr' : month = '04'; break;
				case 'May' : month = '05'; break;
				case 'Jun' : month = '06'; break;
				case 'Jul' : month = '07'; break;
				case 'Aug' : month = '08'; break;
				case 'Sep' : month = '09'; break;
				case 'Oct' : month = '10'; break;
				case 'Nov' : month = '11'; break;
				case 'Dec' : month = '12'; break;
				default : error = true;
			}

			day = tokens[2];
			year = tokens[3];
			time = tokens[4];

			if (error) {
				return "";
			} else {
				return `<div style="display: block; text-align: right; padding: 0.3rem 0.5rem;">` +
									month + '-' + day + '-' + year + ' ' + time +
							 `</div>`;

			}
		}
	};

	private textCellsRenderer = (row: number, column: any, value: any): any => {
		return `<div style="display: block; text-align: left; padding: 0.3rem 0.5rem;">` + value + `</div>`;
	};

	private numberCellsRenderer = (row: number, column: any, value: any): any => {
		return `<div style="display: block; text-align: right; padding: 0.3rem 0.5rem;">` + value + `</div>`;
	};

	private dropdownChoices: any[] = [
		{value: "", label: ""},
		{value: "COMPLETE", label: "COMPLETE"},
		{value: "FAILED", label: "FAILED"},
		{value: "NEW", label: "NEW"},
		{value: "PROCESSING", label: "PROCESSING"},
		{value: "SUBMITTED", label: "SUBMITTED"}
	];

	private columns: any[] = [
		{text: "# ", 							datafield: "requestNumber", 	width: "4%",	cellsrenderer: this.experimentNumberCellsRenderer},
		{text: "Name", 						datafield: "name", 						width: "6%", 	cellsrenderer: this.textCellsRenderer},
		{text: "Action", 																				width: "5%", 	cellsrenderer: this.actionCellsRenderer},
		{text: "Samples",					datafield: "numberOfSamples", width: "4%", 	cellsrenderer: this.numberCellsRenderer},
		{text: "Status", 					datafield: "requestStatus", 	width: "4%", 	cellsrenderer: this.textCellsRenderer},
		{text: "Type", 																					width: "7%", 	cellsrenderer: this.textCellsRenderer},
		{text: "Submitted on", 		datafield: "createDate", 			width: "7%", 	cellsrenderer: this.dateCellsRenderer},
		{text: "Container", 			datafield: "container", 			width: "4%", 	cellsrenderer: this.textCellsRenderer},
		{text: "Submitter", 			datafield: "ownerName", 			width: "6%", 	cellsrenderer: this.textCellsRenderer},
		{text: "Lab", 						datafield: "labName", 				width: "8%",	cellsrenderer: this.textCellsRenderer},
		{text: "Notes for core", 	datafield: "corePrepInstructions", 					cellsrenderer: this.textCellsRenderer}
	];

	private source = {
		datatype: "json",
		localdata: [],
		datafields: [
			{name: "name", type: "string"},
			{name: "icon", type: "string"},
			{name: "requestNumber", type: "string"},
			{name: "requestStatus", type: "string"},
			{name: "codeRequestCategory", type: "string"},
			{name: "container", type: "string"},
			{name: "ownerName", type: "string"},
			{name: "labName", type: "string"},
			{name: "createDate", type: "date"},
			{name: "numberOfSamples", type: "string"},
			{name: "corePrepInstructions", type: "string"}
		]
	};


	constructor (private experimentsService: ExperimentsService,
							 private dictionaryService: DictionaryService,
							 private propertyService: PropertyService) {
	}

	ngOnInit(): void {
		this.myGrid.setColumns(this.columns);
		this.myGrid.setDataAdapterSource(this.source);

		this.experimentsSubscription = this.experimentsService.getExperimentsObservable().subscribe((response) => {
			this.updateGridData(response);
		});

		this.dictionary = this.dictionaryService.getDictionary(DictionaryService.REQUEST_CATEGORY);

		// When we get a response from the backend that the status of an experiment has changed
		this.statusChangeSubscription = this.experimentsService.getChangeExperimentStatusObservable().subscribe((response) => {
			for (let i: number = 0; i < this.selectedRequestNumbers.length; i++) {
				if (this.selectedRequestNumbers[i] === response.idRequest) {
					// count the changes made
					this.changeStatusResponsesRecieved++;

					// when the changes are all made, reload the grid data
					if (this.changeStatusResponsesRecieved === this.selectedRequestNumbers.length) {
						this.experimentsService.repeatGetExperiments_fromBackend();
					}

					break;
				}
			}
		});

		let params: URLSearchParams = new URLSearchParams();
		params.append("status", "SUBMITTED");

		this.experimentsService.getExperiments_fromBackend(params);
	}

	ngOnDestroy(): void {
		// When the component dies, avoid memory leaks and stop listening to the service

		this.experimentsSubscription.unsubscribe();
		this.statusChangeSubscription.unsubscribe();
	}

	goButtonClicked(): void {
		// The "go" button should be disabled in this case, but if we get a click without a valid status,
		// stop.
		if (this.statusCombobox.getSelectedItem().value === "") {
			return;
		}

		// grab all the selected rows, and the new status
		let gridSelectedIndexes: Array<Number> = this.myGrid.getselectedrowindexes();
		let statusSelectedIndex: number = this.statusCombobox.getSelectedIndex();

		// note that we have no responses from the backend yet
		this.changeStatusResponsesRecieved = 0;

		// get the actual experiment identifiers from the grid
		this.selectedRequestNumbers = [];

		for (let i: number = 0; i < gridSelectedIndexes.length; i++) {
			let idRequest: string = "" + this.myGrid.getcell(gridSelectedIndexes[i].valueOf(), "requestNumber").value;
			let cleanedIdRequest: string = idRequest.slice(0, idRequest.indexOf("R") >= 0 ? idRequest.indexOf("R") : idRequest.length);
			this.selectedRequestNumbers.push(cleanedIdRequest);

			// send a change experiment status request to the backend for each of the selected experiments
			// Note : See "statusChangeSubscription" in ngOnInit for processing these requests.
			this.experimentsService.changeExperimentStatus(cleanedIdRequest, this.statusCombobox.getSelectedItem().value)
		}
	}

	deleteButtonClicked(): void {
		let gridSelectedIndexes: Array<Number> = this.myGrid.getselectedrowindexes();

		let experimentHasBeenRun: boolean = false;

		for (let i: number = 0; i < gridSelectedIndexes.length; i++) {
			let j:number = gridSelectedIndexes[i].valueOf();

			if (this.source.localdata[j].requestStatus != 'new' && this.source.localdata[j].requestStatus != 'submitted') {
				experimentHasBeenRun = true;
				break;
			}
		}

		if (experimentHasBeenRun) {
			console.log("One or more of the selected orders has already been added to an instrument run.\"\n" +
					"\t\t\t+ \" The order(s) cannot be deleted.");

			this.errorMessage = "One or more of the selected orders has already been added to an " +
					"instrument run. The order(s) cannot be deleted.";

			this.errorPopup.open();
		} else {
			this.warningMessage = 'Are you sure you want to delete these orders?';
			let usedProducts: boolean = false;

			for (let i: number = 0; i < gridSelectedIndexes.length; i++) {
				let j: number = gridSelectedIndexes[i].valueOf();

				let request = this.source.localdata[j];

				// Most of the time, requests are not given the below property, so the if is skipped.

				var statusToUseProducts: string = this.propertyService.getProperty('status_to_use_products', request.idCoreFacility, request.codeRequestCategory);

				if (statusToUseProducts != undefined
						&& statusToUseProducts != null
						&& statusToUseProducts != ''
						&& request.codeRequestStatus != undefined
						&& request.codeRequestStatus != null
						&& request.codeRequestStatus != '') {
					if (this.compareStatuses(request.codeRequestStatus, statusToUseProducts) >= 0) {
						usedProducts = true;
						break;
					}
				}
			}

			if (usedProducts) {
				this.warningMessage += "\n\n" +
						"WARNING: One or more of the selected orders may have used products. " +
						"If the products were not actually consumed, please revert the status " +
						"of the order to an earlier status or manually return the products to " +
						"the lab before deleting.\n\n";
			}

			this.confirmationPopup.open();
		}
	}

	private compareStatuses (status1: string, status2: string) {
		let value1 = this.compareStatusesHelper(status1);
		let value2 = this.compareStatusesHelper(status2);

		if (value1 == -1 && value2 == -1) {
			return 0;
		} else if (value1 == -1 && value2 != -1) {
			return -1;
		} else if (value1 != -1 && value2 == -1) {
			return 1;
		} else {
			return value1 - value2;
		}
	}

	private compareStatusesHelper (status: string): number {
		var value: number = -1;

		if (status != null && status != undefined && status != '') {
			switch (status) {
				case 'NEW'       : value = 0; break;
				case 'SUBMITTED' : value = 1; break;
				case 'PROCESSING': value = 2; break;
				case 'COMPLETE'  : value = 3; break;
				case 'FAILED'    : value = 3; break;
			}
		}

		return value;
	}

	private onConfirmDelete(): void {
		let selectedIndices: Number[] = this.myGrid.getselectedrowindexes();
		let selectedOrders: any[] = [];

		for (let i: number = 0; i < selectedIndices.length; i++) {
			let j: number = selectedIndices[i].valueOf();

			let Request = this.source.localdata[j];
			selectedOrders.push(Request);
		}

		// let wrapper: any = {requests: selectedOrders};
		// let stringified: string = JSON.stringify(wrapper);

		let stringified: string = JSON.stringify(selectedOrders);

		let parameters: URLSearchParams = new URLSearchParams();

		parameters.set('requestsToDeleteXMLString', stringified);

		this.experimentsService.deleteExperiment(parameters).subscribe((response) => {
			this.experimentsService.repeatGetExperiments_fromBackend();

			this.confirmationPopup.close();
		});
	}

	private onCancelDelete(): void {
		this.confirmationPopup.close();
	}

	errorPopupOkClicked(): void {
		this.errorPopup.close();
	}

	emailButtonClicked(): void {
		console.log("You clicked \"Email\"!");
		let selectedIndices: Number[] = this.myGrid.getselectedrowindexes();
		let idRequests: number[] = [];

		if(selectedIndices.length > 0 && selectedIndices[0] != null) {

			for(let selectedIndex in selectedIndices) {
				let requestNumber = this.source.localdata[selectedIndex].requestNumber;
				idRequests.push(Number.parseInt(requestNumber.slice(0, requestNumber.length - 1)));
			}

			this.window.setIdRequests(idRequests);
			// this.window.open();
			this.window.window.open();
		}
	}

	updateGridData(data: Array<any>) {
		// rebuild the grid's data
		this.source.localdata = Array.isArray(data) ? data : [data];
		// send the grid data to the grid to trigger screen refresh
		this.myGrid.setDataAdapterSource(this.source);
		// clear all selected items.
		this.myGrid.selectedrowindexes([]);
	}
}