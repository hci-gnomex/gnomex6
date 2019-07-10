import {AfterViewInit, Component, Inject, OnInit} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import {MatDialogConfig} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridApi, GridOptions} from "ag-grid-community";
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
import {UtilService} from "../services/util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {ConstantsService} from "../services/constants.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";


@Component({
    selector: 'flowcell-workflow',
    templateUrl: 'flowcell-workflow.html',
    styles: [`
        
        mat-form-field.formField {
            width: 20%;
            margin: 0 0.5%;
        }
        .row-one-right {
            display: flex;
            flex-grow: 1;
            margin-left: 85em;
        }
        .filter-by-date {
            width: 20%
        }
    `]
})

export class FlowcellWorkflowComponent implements OnInit, AfterViewInit {

    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private sequenceProtocolsList: any[] = [];
    private gridOptions:GridOptions = {};
    private changedRowMap: Map<string, any> = new Map<string, any>();
    public label:string = "Flow Cells";
    private searchText: string;
    private dirty: boolean = false;
    private gridApi:GridApi;
    private gridColumnApi;
    private libraryPrepQCProtocols: any[] =[];
    public filterForm: FormGroup;
    private selectedFlowCell: any;
    public columnDefs:any[];



    constructor(@Inject(FormBuilder) private fb: FormBuilder,
                @Inject(DOCUMENT) private document: Document,
                public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService,
                public constService:ConstantsService ) {

        this.filterForm = fb.group({
            date: ['', [
                Validators.required
            ]],
        });

    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(proto =>
            (proto.codeRequestCategory ===  "HISEQ" || proto.codeRequestCategory === "MISEQ" ||
                proto.codeRequestCategory === "NOSEQ" || proto.codeRequestCategory === "ILLSEQ") && proto.isActive === 'Y'
        );
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

    initialize() {
        this.dialogsService.startDefaultSpinnerDialog();
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
                this.workItemList = response ? UtilService.getJsonArray(response, response.WorkItem) : [];
                this.workingWorkItemList = this.workItemList;
                this.gridApi.setRowData(this.workingWorkItemList);
                if(this.searchText){
                    this.gridOptions.api.setQuickFilter(this.searchText);
                }
            }
            this.dialogsService.stopAllSpinnerDialogs();
        },(err:IGnomexErrorResponse) =>{
            this.dialogsService.stopAllSpinnerDialogs();
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
    onFind(event){
        this.initialize();
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.setColumnDefs(this.columnDefs);
        params.api.sizeColumnsToFit();
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
            let config: MatDialogConfig = new MatDialogConfig();
            config.width = "60em";
            config.height = "50em";
            config.data = {
                flowCell: editFlowCell.FlowCell
            };
            this.dialogsService.genericDialogContainer(EditFlowcellDialogComponent, null, null, config,
                {actions: [
                        {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "saveFlowCell"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]}).subscribe((result: any) => {
                        if(result) {
                            this.searchText = "";
                            this.initialize();
                        }
            });
        });
    }

    launchEditFlowCell(event) {
        this.onClickEditFlowCell();
    }

}
