import {Component, ElementRef, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import {GnomexService} from "../services/gnomex.service";
import {GridSizeChangedEvent, GridApi} from "ag-grid-community";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {DialogsService} from "../util/popup/dialogs.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {UtilService} from "../services/util.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'libprepqc-workflow',
    templateUrl: 'libprepqc-workflow.html',
    styles: [`

        .request-number-width {
            min-width: 4em;
            width: fit-content;
            max-width: 6em;
        }

        .experiment-type-width {
            min-width: 15em;
            width: fit-content;
            max-width: 15em;
        }

        .grid-min-height {
            min-height: 8em;
        }


        .no-height {
            height: 0;
        }

        .single-em {
            width: 1em;
        }

    `]
})

export class LibprepQcWorkflowComponent {
    @ViewChild("requestInput") requestInput: ElementRef;
    @ViewChild("coreFacility") coreFacilityInput: ElementRef;
    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    private emToPxConversionRate: number = 13;

    public  requestIds: any[] = [];

    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private changedRowMap: Map<string, any> = new Map<string, any>();
    private emptyRequest = {requestNumber: ""};
    private dirty: boolean = false;
    private showSpinner: boolean = false;
    private workItem: any;
    private gridApi: GridApi;
    private gridColumnApi;
    private label: string = "Illumina Library Prep QC";
    private codeStepNext: string = "";
    private preCodeStepNext: string = "";

    private get columnDefs(): any[] {

        let result: any[] = [];

        result.push({
            headerName: "Sample #",
            editable: false,
            field: "sampleNumber",
            width:    1,
            minWidth: 4.5 * this.emToPxConversionRate,
            maxWidth: 9 * this.emToPxConversionRate
        });
        result.push({
            headerName: "Client",
            editable: false,
            field: "appUserName",
            width:    500,
            minWidth: 9 * this.emToPxConversionRate,
        });
        result.push({
            headerName: "Library QC Protocol",
            editable:  true,
            width:    500,
            minWidth: 12 * this.emToPxConversionRate,
            field: "idLibPrepQCProtocol",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.LibraryPrepQCProtocol"),
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idLibPrepQCProtocol",
            showFillButton: true,
            fillGroupAttribute: 'idRequest',
        });
        result.push({
            headerName: "Library QC Conc.",
            editable: true,
            width:    500,
            minWidth: 9 * this.emToPxConversionRate,
            field: "qcLibConcentration",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
        });
        result.push({
            headerName: "Status",
            editable:  true,
            width:    1,
            minWidth: 10 * this.emToPxConversionRate,
            field: "seqPrepQCStatus",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.workflowService.workflowCompletionStatus,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            showFillButton: true,
            fillGroupAttribute: 'idRequest',
        });

        return result;
    }

    // left to have nova, hi, mi until we phase them out
    public readonly codeStepArray: any[] = [
        { label: "Illumina Seq ", codeStepNext: this.workflowService.ILLSEQ_PREP_QC  },
        { label: "Illumina NovaSeq", codeStepNext: this.workflowService.NOSEQ_PREP_QC},
        { label: "Illumina HiSeq", codeStepNext: this.workflowService.HSEQ_PREP_QC },
        { label: "Illumina MiSeq", codeStepNext: this.workflowService.MISEQ_PREP_QC}
    ];


    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService) { }


    initialize() {
        this.dialogsService.startDefaultSpinnerDialog();

        if(!this.codeStepNext) {
            this.codeStepNext = this.workflowService.ALL_PREP_QC;
        }
        
        this.preCodeStepNext = this.codeStepNext;
        this.workItem = "";
        
        let params: HttpParams = new HttpParams().set("codeStepNext", this.codeStepNext );

        this.workflowService.getWorkItemList(params).subscribe((response: any) => {
            this.workItemList = response ? UtilService.getJsonArray(response, response.WorkItem) : [];
            this.workingWorkItemList = this.workItemList;
            this.workingWorkItemList = this.filterWorkItems();
            this.workingWorkItemList = this.workingWorkItemList.sort(this.workflowService.sortSampleNumber);

            this.gridApi.setColumnDefs(this.columnDefs);
            this.gridApi.setRowData(this.workingWorkItemList);
            this.gridApi.sizeColumnsToFit();

            this.requestIds = Array.from(this.workingWorkItemList.reduce((m, t) => m.set(t.requestNumber, t), new Map()).values());
            this.requestIds.unshift(this.emptyRequest);
            this.dialogsService.stopAllSpinnerDialogs();
        },(err:IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    filterWorkItems(): any[] {
        let items: any[] = [];

        if (this.workItem) {
            items = this.workItemList.filter(request =>
                request.requestNumber === this.workItem
            )
        } else {
            items = this.workItemList;
        }
        this.workflowService.assignBackgroundColor(items, "idRequest");
        return items;
    }

    selectRequestOption() {
        this.workingWorkItemList = this.filterWorkItems();

        this.gridApi.setRowData(this.workingWorkItemList);
    }

    selectCodeOption() {
        if(!this.codeStepNext) {
            this.codeStepNext = this.workflowService.ALL_PREP_QC;
        }
        if(this.codeStepNext === this.preCodeStepNext) {
            return;
        }
        
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
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        this.initialize();
    }

    onGridSizeChanged(event: GridSizeChangedEvent) {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        event.api.sizeColumnsToFit();
    }

    save() {
        this.gridApi.stopEditing();
        setTimeout(() => {
            let params: HttpParams = new HttpParams();
            let workItems: any[] = [];
            for(let value of Array.from( this.changedRowMap.values()) ) {
                workItems.push(value);
            }
            params = params.set("workItemXMLString", JSON.stringify(workItems));
            this.showSpinner = true;
            this.workflowService.saveWorkItemSolexaPrepQC(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.changedRowMap = new Map<string, any>();
                this.dirty = false;
                this.workItem = "";
                this.initialize();
            });
        })
    }

    refreshWorklist(event) {
        this.initialize();
    }
}
