import {AfterViewInit, Component, Inject, OnInit} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import {
    MatDialog,
    MatDialogRef,
} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridOptions} from "ag-grid-community";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {DialogsService} from "../util/popup/dialogs.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DateRange} from "../util/date-range-filter.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {DOCUMENT} from "@angular/common";
import {EditFlowcellDialogComponent} from "./edit-flowcell-dialog.component";


@Component({
    selector: 'flowcell-workflow',
    templateUrl: 'flowcell-workflow.html',
    styles: [`
        .flex-column-container-workflow {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 94%;
            width: 100%;
        }
        .flex-row-container {
            display: flex;
            flex-direction: row;
        }
        mat-form-field.formField {
            width: 20%;
            margin: 0 0.5%;
        }
        .row-one {
            display: flex;
            flex-grow: 1;
        }
        .row-one-right {
            display: flex;
            flex-grow: 1;
            margin-left: 85em;
        }
        .flow-cell-counter {
            margin-top: 1.1em;
        }
        .filter-by-date {
            margin-top: .75em;
            width: 20%
        }
    `]
})

export class FlowcellWorkflowComponent implements OnInit, AfterViewInit {
    private showSpinner: boolean = false;

    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private sequenceProtocolsList: any[] = [];
    private editFlowCellDialogRef: MatDialogRef<EditFlowcellDialogComponent>;
    private gridOptions:GridOptions = {};
    private changedRowMap: Map<string, any> = new Map<string, any>();
    private columnDefs;
    private searchText: string;
    private dirty: boolean = false;
    private gridApi;
    private gridColumnApi;
    private libraryPrepQCProtocols: any[] =[];
    public filterForm: FormGroup;
    private selectedFlowCell: any;

    constructor(@Inject(FormBuilder) private fb: FormBuilder,
                @Inject(DOCUMENT) private document: Document,
                public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private dialog: MatDialog,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService) {

        this.filterForm = fb.group({
            date: ['', [
                Validators.required
            ]],
        });

    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(proto =>
            (proto.codeRequestCategory ===  "HISEQ" || proto.codeRequestCategory === "MISEQ" || proto.codeRequestCategory === "NOSEQ") && proto.isActive === 'Y'
        );
    }

    initialize() {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams();
        if (this.filterForm.controls['date'].value) {
            let dateRange: DateRange = this.filterForm.controls['date'].value;
            if (dateRange.from && dateRange.to) {
                params = params.set("createDateFrom", dateRange.from.toLocaleDateString());
                params = params.set("createDateTo", dateRange.to.toLocaleDateString());
            }
        }

        this.workflowService.getFlowCellList(params).subscribe((response: any) => {
            if (response && response.result !== "INVALID") {
                this.workItemList = response;
                if (!this.securityAdvisor.isArray(response)) {
                    this.workItemList = [response.WorkItem];
                } else {
                    this.workItemList = response;
                }

                this.workingWorkItemList = this.workItemList;

                this.columnDefs = [
                    {
                        headerName: "Flow Cell",
                        editable: false,
                        width: 120,
                        field: "number",
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
                    },
                    {
                        headerName: "Barcode",
                        editable: false,
                        width: 120,
                        field: "barcode",
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
                    },
                    {
                        headerName: "Cluster Gen Date",
                        editable: false,
                        width: 150,
                        field: "createDate",
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
                    },
                    {
                        headerName: "Sequencing Protocol",
                        editable: false,
                        width: 450,
                        field: "idNumberSequencingCyclesAllowed",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: SelectEditor,
                        selectOptions: this.sequenceProtocolsList,
                        selectOptionsDisplayField: "name",
                        selectOptionsValueField: "idNumberSequencingCyclesAllowed",
                        showFillButton: true,
                        fillGroupAttribute: 'idRequest',
                    },
                    {
                        headerName: "Content",
                        editable: false,
                        width: 555,
                        field: "notes",
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
                    },

                ];
            }
            this.showSpinner = false;
        });
    }

    ngAfterViewInit() {

    }

    selectedRow(event) {
        if(event.node.selected) {
            this.selectedFlowCell = event.data;
        }
    }

    public dateRangeChange(event: DateRange): void {
        this.filterForm.controls['date'].setValue(event);
        this.initialize();
    }

    onNotifyGridRowDataChanged(event) {
        if (this.gridApi) {
            this.gridApi.hideOverlay();
        }
    }

    onCellValueChanged(event) {
        this.changedRowMap.set(event.data.key, event.data);
        this.dirty = true;
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
        this.initialize();
    }

    search() {
        this.gridOptions.api.setQuickFilter(this.searchText);
    }


    refreshWorklist(event) {
        this.initialize();
    }

    onClickPrepReport() {
        let url: string = this.document.location.href;
        url = url.substring(0,url.lastIndexOf('/'));
        url += "/ShowFlowCellPrepForm.gx?idFlowCell=" + this.selectedFlowCell.idFlowCell;
        window.open(url, "_blank");
    }

    onClickRunReport() {
        let url: string = this.document.location.href;
        url = url.substring(0,url.lastIndexOf('/'));
        url += "/ShowFlowCellForm.gx?idFlowCell=" + this.selectedFlowCell.idFlowCell;
        window.open(url, "_blank");
    }

    onClickEditFlowCell() {
        let params: HttpParams = new HttpParams();
        let editFlowCell: any;
        params = params.set("id", this.selectedFlowCell.idFlowCell);
        this.workflowService.getFlowCell(params).subscribe((response: any) => {
            editFlowCell = response;
            this.editFlowCellDialogRef = this.dialog.open(EditFlowcellDialogComponent, {
                height: '50em',
                width: '60em',
                data: {
                    flowCell: editFlowCell.FlowCell
                }

            });
            this.editFlowCellDialogRef.afterClosed()
                .subscribe(result => {
                    if (this.editFlowCellDialogRef.componentInstance.rebuildFlowCells) {
                        this.initialize();
                    }
                })
        })
    }

    launchEditFlowCell(event) {
        this.onClickEditFlowCell();
    }

}
