import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import {GnomexService} from "../services/gnomex.service";
import {GridApi} from "ag-grid-community";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {DialogsService} from "../util/popup/dialogs.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {HttpParams} from "@angular/common/http";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {GridColumnValidateService} from "../services/grid-column-validate.service";
import {UtilService} from "../services/util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'pipeline-workflow',
    templateUrl: 'pipeline-workflow.html',
    styles: []
})

export class PipelineWorkflowComponent implements OnInit {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    private emToPxConversionRate: number = 13;


    public get columnDefs(): any[] {
        let results: any[] = [];

        results.push({
            headerName: "Flow Cell Lane #",
            editable: false,
            field: "flowCellNumber",
            valueFormatter: this.getFullFlowCellChannelNumber,
            width: 1,
            minWidth: 7 * this.emToPxConversionRate
        });
        results.push({
            headerName: "Flow Cell Sample #",
            editable: false,
            field: "number",
            width: 1000,
            minWidth: 6 * this.emToPxConversionRate
        });
        results.push({
            headerName: "Requested # Cycles",
            editable: false,
            field: "idNumberSequencingCycles",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            valueFormatter: this.getNumberSequencingCycles.bind(this),
            width: 1,
            minWidth: 8 * this.emToPxConversionRate,
            hide: true
        });
        results.push({
            headerName: "Actual # Cycles",
            editable: false,
            field: "numberSequencingCyclesActual",
            width: 1,
            minWidth: 6 * this.emToPxConversionRate,
            hide: true
        });
        results.push({
            headerName: "Folder name",
            editable: false,
            field: "fileName",
            width: 300,
            minWidth: 7 * this.emToPxConversionRate
        });
        results.push({
            headerName: "Reads PF (M)",
            editable: true,
            field: "read1ClustersPassedFilterM",
            width: 1,
            minWidth: 7 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            valueSetter: PipelineWorkflowComponent.qualCalcValueSetter,
            validateService: this.gridColumnValidatorService,
            maxValue: 9999,
            minValue: 0,
            allowNegative: false
        });
        results.push({
            headerName: "Q30 % (eg 88.5)",
            editable: true,
            field: "q30PercentForDisplay",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            width: 1,
            minWidth: 7 * this.emToPxConversionRate
        });
        results.push({
            headerName: "Pipeline Protocol",
            editable: false,
            width: 1,
            minWidth: 12 * this.emToPxConversionRate,
            field: "idPipelineProtocol",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.pipelineProtoList,
            selectOptionsDisplayField: "protocol",
            selectOptionsValueField: "idPipelineProtocol",
            fillGroupAttribute: 'idRequest'
        });
        results.push({
            headerName: "Status",
            editable: true,
            width: 1,
            minWidth: 8 * this.emToPxConversionRate,
            field: "pipelineStatus",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.workflowService.pipelineCompletionStatus,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            showFillButton: true,
            fillGroupAttribute: 'flowCellNumber'
        });

        return results;
    }


    private workItemList: any[] = [];
    public workingWorkItemList: any[] = [];
    private changedRowMap: Map<string, any> = new Map<string, any>();
    private dirty: boolean = false;
    private showSpinner: boolean = false;
    private workItem: any;
    private core: any;
    public gridApi: GridApi;
    private gridColumnApi;
    private pipelineProtoList: any[] = [];

    private label = "Illumina Data Pipeline";

    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private gridColumnValidatorService: GridColumnValidateService,
                private dictionaryService: DictionaryService) { }

    ngOnInit() {
        this.pipelineProtoList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.PipelineProtocol");
    }


    private initialize(): void {
        this.dialogsService.startDefaultSpinnerDialog();

        let params: HttpParams = new HttpParams().set("codeStepNext", this.workflowService.ALL_DATA_PIPELINE);
        this.workflowService.getWorkItemList(params).subscribe((response: any) => {
            this.workItemList = response ? UtilService.getJsonArray(response, response.WorkItem) : [];
            this.workingWorkItemList = this.workItemList;
            this.workingWorkItemList = this.filterWorkItems();
            this.workingWorkItemList = this.workingWorkItemList.sort(this.workflowService.sortSampleNumber);

            this.gridApi.setColumnDefs(this.columnDefs);
            this.gridApi.sizeColumnsToFit();

            this.workflowService.assignBackgroundColor(this.workingWorkItemList, "flowCellNumber");
            this.dialogsService.stopAllSpinnerDialogs();
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    public getFullFlowCellChannelNumber(params): string {
        return params.data.flowCellNumber + "-" + params.data.channelNumber;
    }

    public getNumberSequencingCycles(params): string {
        if (this.dictionaryService) {
            return this.dictionaryService.getEntryDisplay("hci.gnomex.model.NumberSequencingCycles", params.data.idNumberSequencingCycles);
        } else {
            return "";
        }
    }

    private filterWorkItems(): any[] {
        let items: any[] = [];

        if (this.workItem) {
            items = this.workItemList.filter(request =>
                request.requestNumber === this.workItem
            );
        } else {
            items = this.workItemList;
        }
        if (this.core) {
            items = items.filter(request =>
                request.idCoreFacility === this.core.idCoreFacility
            );
        }
        this.workflowService.assignBackgroundColor(items, "idRequest");
        return items;
    }

    public onNotifyGridRowDataChanged(event) {
        if (this.gridApi) {
            this.gridApi.hideOverlay();
        }
    }

    public onCellValueChanged(event) {
        this.changedRowMap.set(event.data.key, event.data);
        this.dirty = true;
    }

    public onGridReady(params) {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.initialize();
    }


    public save() {
        this.gridApi.stopEditing();

        setTimeout(() => {
            let workItems: any[] = [];
            for(let value of Array.from( this.changedRowMap.values()) ) {
                workItems.push(value);
            }

            this.showSpinner = true;

            let params: HttpParams = new HttpParams().set("workItemXMLString", JSON.stringify(workItems));

            this.workflowService.SaveWorkItemSolexaPipeline(params).subscribe((response: any) => {
                if (response && response.result && response.result === 'SUCCESS') {
                    if (response.message) {
                        this.dialogsService.confirm(response.message, null);
                    }
                }
                this.showSpinner = false;
                this.changedRowMap = new Map<string, any>();
                this.dirty = false;
                this.workItem = "";
                this.initialize();
            }, (err: IGnomexErrorResponse) => {
                // just warning that it couldn't send an email still saved
                if(err.gError.result === "SUCCESS") {
                    this.changedRowMap = new Map<string, any>();
                    this.dirty = false;
                    this.workItem = "";
                    this.initialize();
                }

                this.showSpinner = false;
            });
        });
    }

    static qualCalcValueSetter(params: any) {
        return params.colDef.validateService.validate(params);
    }

    public refreshWorkItemList(event: any) {
        this.initialize();
    }

    public onGridSizeChanged(event: any): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }
}
