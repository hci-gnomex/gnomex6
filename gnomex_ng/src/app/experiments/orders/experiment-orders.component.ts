import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {URLSearchParams} from "@angular/http";

import {Subscription} from "rxjs";

import {EmailRelatedUsersPopupComponent} from "../../util/emailRelatedUsersPopup/email-related-users-popup.component";
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {MultipleLineTextRenderer} from "../../util/grid-renderers/multiple-line-text.renderer";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignRightMiddleRenderer} from "../../util/grid-renderers/text-align-right-middle.renderer";
import {TwoButtonRenderer} from "../../util/grid-renderers/two-button.renderer";

import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ExperimentsService} from "../experiments.service";
import {PropertyService} from "../../services/property.service";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {Validators} from "@angular/forms";
import {LinkButtonRenderer} from "../../util/grid-renderers/link-button.renderer";
import {GnomexService} from "../../services/gnomex.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";

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
		
		.most-width { width: 80%; }
		
		.t  { display: table;      }  
		.tr { display: table-row;  }  
		.td { display: table-cell; }  
		
		.vertical-center { vertical-align: middle; }

        .right-align { text-align: right; }
		
        .small-font { font-size: small; }
		
		.background {  
			background-color: #EEEEEE;  
			padding: 0.3em;  
			border-radius: 0.3em;  
			border: 1px solid darkgrey;  
			position: relative;  
		}
		
		.flex-column-container {  
			display: flex;  
			flex-direction: column;  
		}  
		.flex-row-container {  
			display: flex;  
			flex-direction: row;  
		}  
		.flex-stretch {  
			flex: 1;  
		}
		
		.vertical-spacer {  
			height:0.3em;  
			width:0;  
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
          border: 1px solid darkgrey;
          background-color: white;
          padding: 0.3em;
          display: block;
      }

      div.grid-footer {
          display: block;
          width: 100%;
          margin-top: 0.3em;
          padding: 0 0.8em;
      }

      div.button-container {
          padding: 0.2em 0 0.2em 0.6em;
      }
        
        .no-height  { height: 0; }
        .single-em  { width: 1em;}

        .small-font { font-size:x-small; }
        
	`]
})
export class ExperimentOrdersComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    protected gridApi;
    protected gridColumnApi;

    protected experiments: any[] = [];

	private messageSubscription: Subscription;
	private experimentsSubscription: Subscription;
	private statusChangeSubscription: Subscription;

    private idCoreFacilityFilter: string;

	private selectedRequestNumbers: string[];
	private changeStatusResponsesReceived: number;

	private enableChanges: boolean = false;

    private changeStatus: string;

    private requestCategories: any[] = [];

    public context: any = this;

    public message: string = '';

    private emToPxConversionRate: number = 1;

	private dropdownChoices: any[] = [
		{value: "", label: ""},
		{value: "COMPLETE", label: "COMPLETE"},
		{value: "FAILED", label: "FAILED"},
		{value: "NEW", label: "NEW"},
		{value: "PROCESSING", label: "PROCESSING"},
		{value: "SUBMITTED", label: "SUBMITTED"}
	];

	get columnDefinitions(): any[] {
	    let columnDefinitions: any[] = [];

        columnDefinitions.push({
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width:    17,
            maxWidth: 17,
            minWidth: 17,
            suppressSizeToFit: true
        });
        columnDefinitions.push({
            headerName: "#",
            editable: false,
            width:     7 * this.emToPxConversionRate,
            minWidth:  7 * this.emToPxConversionRate,
            maxWidth: 10 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            cellRendererFramework: IconTextRendererComponent,
            field: "requestNumber"
        });
        columnDefinitions.push({
            headerName: "Name",
            width: 600,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            editable: false,
            // editable: true,
            // errorMessageHeader: 'TestingTestingTesting',
            // setErrors: (value: any,
            //             data: any,
            //             node: any,
            //             colDef: any,
            //             rowIndex: any,
            //             gridApi: any) => {
            //     return (value && value === 'TEST') ? 'Invalid name' : '';
            // },
            // validators: [ Validators.minLength(10) ],
            // errorNameErrorMessageMap: [
            //     { errorName: 'minlength', errorMessage: 'Name is too short' }
            // ],
            field: "name"
        });
        columnDefinitions.push({
            headerName: "Action",
            editable: false,
            width:    5 * this.emToPxConversionRate,
            minWidth: 5 * this.emToPxConversionRate,
            maxWidth: 5 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            cellRendererFramework: LinkButtonRenderer,
            buttonLabel: 'View',
            onClickButton: 'onClickView',
            field: ""
        });
        columnDefinitions.push({
            headerName: "Samples",
            editable: false,
            width:    6 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
            maxWidth: 6 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            field: "numberOfSamples"
        });
        columnDefinitions.push({
            headerName: "Status",
            editable: false,
            width:    8 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            maxWidth: 8 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "requestStatus"
        });
        columnDefinitions.push({
            headerName: "Type",
            editable: false,
            width: 300,
            cellRendererFramework: SelectRenderer,
            selectOptions: this.requestCategories,
            selectOptionsValueField: 'value',
            selectOptionsDisplayField: 'display',
            field: "codeRequestCategory"
        });
        columnDefinitions.push({
            headerName: "Submitted on",
            editable: false,
            width:    12 * this.emToPxConversionRate,
            minWidth: 12 * this.emToPxConversionRate,
            maxWidth: 12 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            field: "createDate"
        });
        columnDefinitions.push({
            headerName: "Container",
            editable: false,
            width:    8 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            maxWidth: 8 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "container"
        });
        columnDefinitions.push({
            headerName: "Submitter",
            editable: false,
            width: 400,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "ownerName"
        });
        columnDefinitions.push({
            headerName: "Lab",
            editable: false,
            width: 300,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "labName"
        });

        if (this.idCoreFacilityFilter && this.idCoreFacilityFilter !== '') {
            columnDefinitions.push({

                headerName: "Notes for core",
                editable: false,
                width: 2400,
                cellRendererFramework: MultipleLineTextRenderer,
                field: "corePrepInstructions_processed"
            });

            this.debug = this.propertyService.getExactProperty(PropertyService.SHOW_ADMIN_NOTES_ON_REQUEST, this.idCoreFacilityFilter);

            if (this.propertyService.getExactProperty(PropertyService.SHOW_ADMIN_NOTES_ON_REQUEST, this.idCoreFacilityFilter)
                && this.propertyService.getExactProperty(PropertyService.SHOW_ADMIN_NOTES_ON_REQUEST, this.idCoreFacilityFilter).propertyValue
                && this.propertyService.getExactProperty(PropertyService.SHOW_ADMIN_NOTES_ON_REQUEST, this.idCoreFacilityFilter).propertyValue === 'Y') {
                columnDefinitions.push({
                    headerName: "Notes for Admin",
                    editable: false,
                    width: 600,
                    cellRendererFramework: MultipleLineTextRenderer,
                    field: "adminNotes"
                });
            }
        }

        return columnDefinitions;
	}

	debug: string;

	constructor (private createSecurityAdvisorService: CreateSecurityAdvisorService,
                 private dialog: MatDialog,
                 private dialogService: DialogsService,
                 private dictionaryService: DictionaryService,
				 private experimentsService: ExperimentsService,
				 private gnomexService: GnomexService,
				 private propertyService: PropertyService) {
	}

	ngOnInit(): void {
		this.context = this;

		this.messageSubscription = this.experimentsService.getExperimentsOrdersMessageObservable().subscribe((value: string) => {
            this.message = value;
        });

		this.experimentsSubscription = this.experimentsService.getExperimentsObservable().subscribe((response) => {
			this.experiments = response;

			if (this.experiments && !Array.isArray(this.experiments)) {
                if (response.requestCount && response.requestCount === '0') {
                    this.experiments = [];
                } else {
                    this.experiments = [this.experiments];
                }
			}

			this.idCoreFacilityFilter = this.experimentsService.getPreviousURLParamsCoreFacilityFilter();

			if (this.experiments && this.experiments.length > 0) {
                for (let experiment of this.experiments) {
                    experiment.corePrepInstructions_processed = [];

                    if (experiment.corePrepInstructions) {
                        experiment.corePrepInstructions_processed = experiment.corePrepInstructions.split('\n');
                    }
                }
            }

			this.assignGridContents();
			this.dialogService.stopAllSpinnerDialogs();
		});

		this.requestCategories = this.dictionaryService.getEntries(DictionaryService.REQUEST_CATEGORY);

		// When we get a response from the backend that the status of an experiment has changed
		this.statusChangeSubscription = this.experimentsService.getChangeExperimentStatusObservable().subscribe((response) => {
			for (let i: number = 0; i < this.selectedRequestNumbers.length; i++) {
				if (this.selectedRequestNumbers[i] === response.idRequest) {
					// count the changes made
					this.changeStatusResponsesReceived++;

					// when the changes are all made, reload the grid data
					if (this.changeStatusResponsesReceived === this.selectedRequestNumbers.length) {
						this.experimentsService.repeatGetExperiments_fromBackend();
					}

					break;
				}
			}
		});

		this.enableChanges = this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin;

		let params: HttpParams = new HttpParams().append("status", "SUBMITTED");


        setTimeout(() => {
			this.dialogService.startDefaultSpinnerDialog();

            setTimeout(() => {
                this.experimentsService.getExperiments_fromBackend(params);
            });
		});
	}

	ngAfterViewInit(): void {
	    if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }
    }

	ngOnDestroy(): void {
		// When the component dies, avoid memory leaks and stop listening to the service

		this.messageSubscription.unsubscribe();
		this.experimentsSubscription.unsubscribe();
		this.statusChangeSubscription.unsubscribe();
	}

    onClickView(rowId: any): void {
	    let temp = this.gridApi.getRowNode(rowId);
	    if (temp && temp.data && temp.data.requestNumber) {
            this.gnomexService.navByNumber(temp.data.requestNumber);
        }
    }

	goButtonClicked(): void {
		// The "go" button should be disabled in this case, but if we get a click without a valid status,
		// stop.
		if (!this.enableChanges || this.changeStatus === "") {
			return;
		}

		if (this.gridApi && this.gridApi.getSelectedRows() && Array.isArray(this.gridApi.getSelectedRows())) {
		    this.dialogService.startDefaultSpinnerDialog();

		    setTimeout(() => {
                this.changeStatusResponsesReceived = 0;
                this.selectedRequestNumbers = [];

                for (let selectedRow of this.gridApi.getSelectedRows()) {
                    let idRequest = ('' + selectedRow.requestNumber).trim();
                    let cleanedIdRequest: string = idRequest.slice(0, idRequest.indexOf("R") >= 0 ? idRequest.indexOf("R") : idRequest.length);

                    this.selectedRequestNumbers.push(cleanedIdRequest);
                    this.experimentsService.changeExperimentStatus(cleanedIdRequest, this.changeStatus);
                }
            });
        }
	}

	deleteButtonClicked(): void {

		if (!this.enableChanges) {
			return;
		}

        let experimentHasBeenRun: boolean = false;

		if (this.gridApi && Array.isArray(this.gridApi.getSelectedRows())) {
            for (let selectedRow of this.gridApi.getSelectedRows()) {
                if (('' + selectedRow.requestStatus).toLowerCase() != 'new'
                    && ('' + selectedRow.requestStatus).toLowerCase() != 'submitted') {
                    experimentHasBeenRun = true;
                    break;
                }
            }

            if (experimentHasBeenRun) {
                console.log("One or more of the selected orders has already been added to an instrument run.\"\n" +
                    "\t\t\t+ \" The order(s) cannot be deleted.");

                let errorMessage = "One or more of the selected orders has already been added to an " +
                    "instrument run. The order(s) cannot be deleted.";

                this.dialogService.alert(errorMessage);
            } else {
                let warningMessage = 'Are you sure you want to delete these orders?';
                let usedProducts: boolean = false;

                for (let selectedRow of this.gridApi.getSelectedRows()) {
                    // Most of the time, requests are not given the below property, so the if is skipped.
                    let statusToUseProducts: string = this.propertyService.getProperty('status_to_use_products', selectedRow.idCoreFacility, selectedRow.codeRequestCategory);

                    if (statusToUseProducts != undefined
                        && statusToUseProducts != null
                        && statusToUseProducts != ''
                        && selectedRow.codeRequestStatus != undefined
                        && selectedRow.codeRequestStatus != null
                        && selectedRow.codeRequestStatus != '') {
                        if (this.compareStatuses(selectedRow.codeRequestStatus, statusToUseProducts) >= 0) {
                            usedProducts = true;
                            break;
                        }
                    }
                }

                if (usedProducts) {
                    warningMessage += "\n\n" +
                        "WARNING: One or more of the selected orders may have used products. " +
                        "If the products were not actually consumed, please revert the status " +
                        "of the order to an earlier status or manually return the products to " +
                        "the lab before deleting.\n\n";
                }

                this.dialogService.yesNoDialog(warningMessage, this, 'onConfirmDelete');
            }
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
	    let formattingRemovedSelectedRows: any[] = [];

        for (let selectedRow of this.gridApi.getSelectedRows()) {
            formattingRemovedSelectedRows.push(selectedRow);
        }
        for (let selectedRow of formattingRemovedSelectedRows) {
            selectedRow.corePrepInstructions_processed = '';  // This is done to fix the translation back to XML.
        }

	    let stringified: string = JSON.stringify(formattingRemovedSelectedRows);
        let parameters: HttpParams = new HttpParams()
            .set('requestsToDeleteXMLString', stringified);

        this.experimentsService.deleteExperiment(parameters).subscribe((response) => {
        	this.experimentsService.repeatGetExperiments_fromBackend();
        },(err:IGnomexErrorResponse) => {
        });
	}

	emailButtonClicked(): void {
	    if (this.gridApi && this.gridApi.getSelectedRows()) {
            let idRequests: number[] = [];

            for(let selectedRow of this.gridApi.getSelectedRows()) {
                let requestNumber = ('' + selectedRow.requestNumber);
                idRequests.push(Number.parseInt(requestNumber.slice(0, requestNumber.length - 1)));
            }

            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.panelClass = 'no-padding-dialog';
            configuration.width  = '40%';
            configuration.data   = { idRequests: idRequests };

            this.dialog.open(EmailRelatedUsersPopupComponent, configuration);
        }
	}

    assignGridContents(): void {
		if (this.gridApi) {
			this.gridApi.setColumnDefs(this.columnDefinitions);
            this.gridApi.setRowData(this.experiments);

            this.gridApi.sizeColumnsToFit();
		}
	}

    onGridSizeChanged(event: any): void {
        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }
    }

    onGridReady(event: any): void {
        this.gridApi = event.api;
        this.gridColumnApi = event.columnApi;

        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this.assignGridContents();
        this.onGridSizeChanged(event)
    }
}