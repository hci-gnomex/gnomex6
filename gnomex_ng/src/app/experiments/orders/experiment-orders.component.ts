import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";

import {ExperimentsService} from "../experiments.service";
import {Subscription} from "rxjs/Subscription";
import {NgModel} from "@angular/forms"
import {URLSearchParams} from "@angular/http";

import {BrowseFilterComponent} from "../../util/browse-filter.component";
import {jqxComboBoxComponent} from "../../../assets/jqwidgets-ts/angular_jqxcombobox";
import {jqxGridComponent} from "../../../assets/jqwidgets-ts/angular_jqxgrid";
import {GnomexStyledGridComponent} from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.component"
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
	template: `
		<div class="background">
			<div class="t" style="height: 100%; width: 100%;">
				<div class="tr" style="width: 100%;">
					<div class="td" style="width: 100%;">
						<browse-filter [label]="'Orders'" [iconSource]="'assets/review.png'"
													 [mode]="'orderBrowse'"></browse-filter>
					</div>
				</div>
				<div class="tr" style="height:0.3em; width:0;">
				</div>
				<div class="tr" style="width: 100%;">
					<div class="td" style="width: 100%; height: 100%">
						<div class="lower-panel">
							<div class="t" style="height: 100%; width: 100%;">
								<div class="tr" style="width: 100%;">
									<div class="td" style="width: 100%; height: 100%;">
										<div style="display:block; height:100%; width:100%;">
											<GnomexStyledGrid #myGrid></GnomexStyledGrid>
										</div>
									</div>
								</div>
								<div class="tr" style="width:100%">
									<div class="td" style="width: 100%">
										<div class="grid-footer">
											<div class="t" style="width: 100%">
												<div class="tr" style="width:100%">
													<div class="td">
														<div class="t">
															<div class="tr">
																<div class="td">
																	<div class="title">{{myGrid.getselectedrowindexes().length}} selected</div>
																</div>
																<div class="td">
																	<jqxComboBox #statusComboBox
																							 [source]="dropdownChoices"
																							 [placeHolder]="'- Change Status -'"
																							 [dropDownVerticalAlignment]="'top'"
																							 [autoDropDownHeight]="true"></jqxComboBox>
																</div>
																<div class="td button-container">
																	<jqxButton
																			[disabled]="myGrid.getselectedrowindexes().length === 0 || (this.statusCombobox.getSelectedItem() === null || this.statusCombobox.getSelectedItem().value === '')"
																			[template]="'link'"
																			(onClick)="goButtonClicked()">
																		<img
																				*ngIf="myGrid.getselectedrowindexes().length  != 0 && (this.statusCombobox.getSelectedItem()  != null && this.statusCombobox.getSelectedItem().value  != '')"
																				src="assets/bullet_go.png" alt=""
																				style="margin-right:0.2em;"/>
																		<img
																				*ngIf="myGrid.getselectedrowindexes().length === 0 || (this.statusCombobox.getSelectedItem() === null || this.statusCombobox.getSelectedItem().value === '')"
																				src="assets/bullet_go_disable.png" alt=""
																				style="margin-right:0.2em;"/>
																		Go
																	</jqxButton>
																</div>
																<div class="td button-container">
																	<jqxButton
																			[disabled]="myGrid.getselectedrowindexes().length === 0"
																			[template]="'link'"
																			(onClick)="deleteButtonClicked()">
																		<img *ngIf="myGrid.getselectedrowindexes().length != 0" src="assets/delete.png" alt="" style="margin-right:0.2em;"/>
																		<img *ngIf="myGrid.getselectedrowindexes().length === 0" src="assets/delete_disable.png" alt="" style="margin-right:0.2em;"/>
																		Delete
																	</jqxButton>
																</div>
																<div class="td button-container">
																	<jqxButton
																			[disabled]="myGrid.getselectedrowindexes().length === 0"
																			[template]="'link'"
																			(onClick)="emailButtonClicked()">
																		<img *ngIf="myGrid.getselectedrowindexes().length != 0" src="assets/email_go.png" alt="" style="margin-right:0.2em;"/>
																		<img *ngIf="myGrid.getselectedrowindexes().length === 0" src="assets/email_go_disable.png" alt="" style="margin-right:0.2em;"/>
																		Email
																	</jqxButton>
																</div>
															</div>
														</div>
													</div>
													<td style="text-align: right">
														<div>({{(source.localdata.length === null) ? 0 : source.localdata.length + (source.localdata.length != 1 ? " orders" : " order")}})
														</div>
													</td>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
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

	private orders: Array<any>;


	private actionCellsRenderer = (row: number, column: any, value: any): any => {
		return `<div style="display:inline-block; width: 80%; padding-left: 10%; padding-right:10%; text-align: center; font-size: x-small">
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
		return `<div style="display: block; text-align: left; padding: 0.3rem 0.5rem; font-size: x-small;">
							<img src="` + imgSource +`" alt="NO ICON"/>` + value +
					 `</div>`;
	};

	private textCellsRenderer = (row: number, column: any, value: any): any => {
		return `<div style="display: block; text-align: left; padding: 0.3rem 0.5rem; font-size: x-small;">` + value + `</div>`;
	};

	private numberCellsRenderer = (row: number, column: any, value: any): any => {
		return `<div style="display: block; text-align: right; padding: 0.3rem 0.5rem; font-size: x-small;">` + value + `</div>`;
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
		{text: "Submitted on", 		datafield: "createDate", 			width: "7%", 	cellsrenderer: this.textCellsRenderer},
		{text: "Container", 			datafield: "container", 			width: "4%", 	cellsrenderer: this.textCellsRenderer},
		{text: "Submitter", 			datafield: "ownerName", 			width: "6%", 	cellsrenderer: this.textCellsRenderer},
		{text: "Lab", 						datafield: "labName", 				width: "8%",	cellsrenderer: this.textCellsRenderer},
		{text: "Notes for core", 	datafield: "corePrepInstructions", 					cellsrenderer: this.textCellsRenderer}
	];

	private source = {
		datatype: "json",
		localdata: [
			{name: "", icon: "", requestNumber: "", requestStatus: "", container: "", ownerName: "", labName: "", createDate: "", numberOfSamples: "", corePrepInstructions: ""},
			{name: "", icon: "", requestNumber: "", requestStatus: "", container: "", ownerName: "", labName: "", createDate: "", numberOfSamples: "", corePrepInstructions: ""},
			{name: "", icon: "", requestNumber: "", requestStatus: "", container: "", ownerName: "", labName: "", createDate: "", numberOfSamples: "", corePrepInstructions: ""},
			{name: "", icon: "", requestNumber: "", requestStatus: "", container: "", ownerName: "", labName: "", createDate: "", numberOfSamples: "", corePrepInstructions: ""},
			{name: "", icon: "", requestNumber: "", requestStatus: "", container: "", ownerName: "", labName: "", createDate: "", numberOfSamples: "", corePrepInstructions: ""}
		],
		datafields: [
			{name: "name", type: "string"},
			{name: "icon", type: "string"},
			{name: "requestNumber", type: "string"},
			{name: "requestStatus", type: "string"},
			{name: "container", type: "string"},
			{name: "ownerName", type: "string"},
			{name: "labName", type: "string"},
			{name: "createDate", type: "string"},
			{name: "numberOfSamples", type: "string"},
			{name: "corePrepInstructions", type: "string"}
		]
	};

	private dataAdapter: any = new jqx.dataAdapter(this.source);

	private experimentsSubscription: Subscription;
	private statusChangeSubscription: Subscription;

	private radioString_workflowState: String = 'submitted';
	private redosEnabled: boolean = false;

	private numberSelected: number = 0;

	@ViewChild(BrowseFilterComponent)
	private _browseFilterComponent: BrowseFilterComponent;

	private selectedRequestNumbers: string[];
	private changeStatusResponsesRecieved: number;


	constructor(private experimentsService: ExperimentsService) {
	}


	goButtonClicked(): void {

		if (this.statusCombobox.getSelectedItem().value === "") {
			return;
		}

		// console.log("You clicked \"Go\"!");
		let gridSelectedIndexes: Array<Number> = this.myGrid.getselectedrowindexes();
		let statusSelectedIndex: number = this.statusCombobox.getSelectedIndex();

		this.selectedRequestNumbers = [];
		this.changeStatusResponsesRecieved = 0;

		for (let i: number = 0; i < gridSelectedIndexes.length; i++) {
			let idRequest: string = "" + this.myGrid.getcell(gridSelectedIndexes[i].valueOf(), "requestNumber").value;
			let cleanedIdRequest: string = idRequest.slice(0, idRequest.indexOf("R") >= 0 ? idRequest.indexOf("R") : idRequest.length);
			this.selectedRequestNumbers.push(cleanedIdRequest);

			this.experimentsService.changeExperimentStatus(cleanedIdRequest, this.statusCombobox.getSelectedItem().value)
		}
	}

	deleteButtonClicked(): void {
		console.log("You clicked \"Delete\"!");
	}

	emailButtonClicked(): void {
		console.log("You clicked \"Email\"!");
	}

	updateGridData(data: Array<any>) {
		this.source.localdata = Array.isArray(data) ? data : [data];
		this.myGrid.setDataAdapterSource(this.source);
		this.myGrid.selectedrowindexes([]);
	}

	ngOnInit(): void {
		this.myGrid.setColumns(this.columns);
		this.myGrid.setDataAdapterSource(this.source);

		this.experimentsSubscription = this.experimentsService.getExperimentsObservable()
				.subscribe((response) => {
					this.orders = response;
					this.updateGridData(response);
				});

		this.statusChangeSubscription = this.experimentsService.getChangeExperimentStatusObservable().subscribe((response) => {
			for (let i: number = 0; i < this.selectedRequestNumbers.length; i++) {
				// console.log("SelectedGridValues: " + this.selectedRequestNumbers[i] + "    idRequest: " + response.idRequest);

				if (this.selectedRequestNumbers[i] === response.idRequest) {
					this.changeStatusResponsesRecieved++;

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
		this.experimentsSubscription.unsubscribe();
		this.statusChangeSubscription.unsubscribe();
	}
}