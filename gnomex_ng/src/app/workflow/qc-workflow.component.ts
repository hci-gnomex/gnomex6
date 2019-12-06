import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    ViewChild
} from "@angular/core";
import {WorkflowService, qcModes} from "../services/workflow.service";
import {GnomexService} from "../services/gnomex.service";
import {GridApi, GridSizeChangedEvent} from "ag-grid-community";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {DialogsService} from "../util/popup/dialogs.service";
import {GridColumnValidateService} from "../services/grid-column-validate.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {UtilService} from "../services/util.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: "qc-workflow",
    templateUrl: "qc-workflow.html",
    styles: [`


        .request-number-width {
            min-width: 4em;
            width: fit-content;
            max-width: 6em;
        }
        .core-facility-width {
            min-width: 15em;
            width: fit-content;
            max-width: 15em;
        }

        .grid-min-height { min-height: 8em; }
        
        .no-height { height: 0; }

        .single-em { width: 1em; }
        
        
    `]
})

export class QcWorkflowComponent implements OnInit, OnChanges {
    @ViewChild("requestInput") requestInput: ElementRef;
    @ViewChild("coreFacility") coreFacilityInput: ElementRef;
    @ViewChild("oneEmWidth") oneEmWidth: ElementRef;

    @Input() mode: string;

    private emToPxConversionRate: number = 13;

    public requestIds: any[] = [];
    public workingWorkItemList: any[] = [];

    private workItemList: any[] = [];
    private coreIds: any[] = [];
    private coreFacilityAppMap: Map<string, any[]> = new Map<string, any[]>();
    private changedRowMap: Map<string, any> = new Map<string, any>();
    private emptyRequest = {requestNumber: ""};
    public dirty: boolean = false;
    public showSpinner: boolean = false;
    public workItem: any;
    public core: any;
    private preSelectedCore: any;
    private hide260230: boolean = true;
    private gridApi: GridApi;
    private label: string = "Combined Sample Quality";
    private codeStepNext: string = "ALL";

    public allRequestCategories: any[] = [];


    private _cores: any[] = [];

    public get cores(): any[] {
        return this._cores;
    }

    public get columnDefs(): any[] {

        let result: any[] = [];

        result.push({
            headerName: "Sample #",
            editable: false,
            field: "sampleNumber",
            width:    1,
            minWidth: 5 * this.emToPxConversionRate
        });
        result.push({
            headerName: "Sample Type",
            editable: false,
            field: "sampleType",
            width:    1,
            minWidth: 12 * this.emToPxConversionRate
        });
        result.push({
            headerName: "Client",
            editable: false,
            field: "appUserName",
            width:    600,
            minWidth: 8 * this.emToPxConversionRate
        });
        result.push({
            headerName: "QC Protocol",
            editable:  true,
            width:    900,
            minWidth: 9 * this.emToPxConversionRate,
            field: "qualCodeBioanalyzerChipType",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.BioanalyzerChipType"),
            selectOptionsDisplayField: "bioanalyzerChipType",
            selectOptionsValueField: "datakey",
            selectOptionsPerRowFilterFunction: (context, rowData, option) => {
                if (!context || !rowData || !option) {
                    return true;
                }

                if (option.value === "") {
                    return true;
                }

                if (option.isActive === "Y" && rowData) {
                    let appCodes: any[] = context.coreFacilityAppMap.get(rowData.idCoreFacility);

                    if (appCodes && appCodes.length > 0) {
                        for (var code of appCodes) {
                            if (option.codeApplication === code) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            },
            context: this,
            showFillButton: true,
            fillGroupAttribute: "idRequest",
        });
        result.push({
            headerName: "Conc. ng/uL",
            editable: true,
            width:    1,
            minWidth: 6 * this.emToPxConversionRate,
            field: "qualCalcConcentration",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            valueSetter: QcWorkflowComponent.qualCalcValueSetter,
            validateService: this.gridColumnValidatorService,
            maxValue: 99999,
            minValue: 0,
            allowNegative: false
        });
        result.push({
            headerName: "260/230",
            editable: true,
            width:    1,
            minWidth: 6 * this.emToPxConversionRate,
            field: "qual260nmTo230nmRatio",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            hide: this.hide260230,  // TODO Hide for now until I can get the core facility property
            valueSetter: QcWorkflowComponent.qualCalcValueSetter,
            validateService: this.gridColumnValidatorService,
            maxValue: 99999,
            minValue: 0,
            allowNegative: false
        });
        result.push({
            headerName: "RIN #",
            editable: true,
            width:    1,
            minWidth: 6 * this.emToPxConversionRate,
            field: "qualRINNumber",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
        });
        result.push({
            headerName: "Status",
            editable:  true,
            width:    1,
            minWidth: 10 * this.emToPxConversionRate,
            field: "qualStatus",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.workflowService.workflowCompletionStatus,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            showFillButton: true,
            fillGroupAttribute: "idRequest",
        });

        return result;
    }

    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private gridColumnValidatorService: GridColumnValidateService,
                private dictionaryService: DictionaryService) { }

    ngOnInit() {
        this.allRequestCategories = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
    }

    ngOnChanges() {
        switch(this.mode) {
            case qcModes.All:
                this.onClickAll();
                break;
            case qcModes.Illumina :
                this.onClickIlluminaQC();
                break;
            case qcModes.Samplequality :
                this.onClickSampleQualityQC();
                break;
            case qcModes.Nanostring :
                this.onClickNanostringQC();
                break;
        }
    }

    initialize(refreshMode?: boolean) {
        this.dialogsService.startDefaultSpinnerDialog();

        this._cores = [];
        this.workItem = "";

        let params: HttpParams = new HttpParams().set("codeStepNext", this.workflowService.QC);

        this.workflowService.getWorkItemList(params).subscribe((response: any) => {
            this.workItemList = response ? UtilService.getJsonArray(response, response.WorkItem) : [];

            this.coreIds = [...new Set(this.workItemList.map(item => item.idCoreFacility))];

            for (let coreId of this.coreIds) {
                let coreObj = {idCoreFacility: coreId,
                    display: this.gnomexService.getCoreFacilityName(coreId)};
                this._cores.push(coreObj);
                this.coreFacilityAppMap.set(coreId, this.gnomexService.getQCAppCodesForCore(coreId));
            }

            this.workingWorkItemList = this.workItemList;

            if (this._cores.length > 0) {
                if(this.preSelectedCore) {
                    this.core = this._cores.find((core: any) => {return core.idCoreFacility === this.preSelectedCore.idCoreFacility});
                } else if(this.preSelectedCore === undefined) {
                    this.core = this._cores[0];
                } else {
                    this.core = null;
                }
            }

            this.preSelectedCore = this.core;

            if (this.codeStepNext === this.workflowService.ALL) {
                this.workingWorkItemList = this.filterWorkItems();
            } else if (this.codeStepNext === this.workflowService.ILLUMINA_SEQQC){
                this.workingWorkItemList = this.filterByCodeStepNext(this.workflowService.ILLUMINA_SEQQC);
            } else {
                this.workingWorkItemList = this.filterByRequestCategory(this.codeStepNext);
            }

            this.workingWorkItemList = this.workingWorkItemList.sort(this.workflowService.sortSampleNumber);

            if(refreshMode) {
                this.ngOnChanges();
            }

            this.gridApi.setColumnDefs(this.columnDefs);
            this.gridApi.setRowData(this.workingWorkItemList);
            this.gridApi.sizeColumnsToFit();

            this.requestIds = Array.from(this.workingWorkItemList.reduce((m, t) => m.set(t.requestNumber, t), new Map()).values());
            this.requestIds.unshift(this.emptyRequest);

            this.dialogsService.stopAllSpinnerDialogs();
            // TODO Need to get hide260230 and hide that column appropriately
            // var hide260230:String = parentApplication.getCoreFacilityProperty(selectedIdCoreFacility, parentApplication.PROPERTY_HIDE_260_230_QC_WORKFLOW);
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    private filterWorkItems(): any[] {
        let items: any[] = [];

        if (this.workItem) {
            items = this.workItemList.filter((request) => { return request.requestNumber === this.workItem; });
        } else {
            items = this.workItemList;
        }

        if (this.core) {
            items = items.filter((request) => { return request.idCoreFacility === this.core.idCoreFacility; });
        }

        if (this.codeStepNext && this.codeStepNext !== this.workflowService.ALL) {
            items = items.filter((request) => { return request.codeStepNext === this.codeStepNext; });
        }

        this.workflowService.assignBackgroundColor(items, "idRequest");

        return items;
    }

    private filterByRequestCategory(type: string): any[] {
        let items: any[] = [];

        if (this.core) {
            items = this.workItemList.filter((workItem) => { return workItem.idCoreFacility === this.core.idCoreFacility; });
        } else {
            items = this.workItemList;
        }
        
        items = items.filter((request) => {
            return request.codeStepNext === this.workflowService.QC
                && ((type === this.workflowService.MICROARRAY && request.requestCategoryType !== this.workflowService.QC)
                    || (type === this.workflowService.QC && request.requestCategoryType === this.workflowService.QC)
                    || (type === this.workflowService.NANOSTRING && request.requestCategoryType === this.workflowService.NANOSTRING));
        });

        this.workflowService.assignBackgroundColor(items, "idRequest");

        return items;
    }

    private filterByCodeStepNext(code: string): any[] {
        let items: any[] = [];

        if (this.core) {
            items = this.workItemList.filter((workItem) => { return workItem.idCoreFacility === this.core.idCoreFacility; });
        } else {
            items = this.workItemList;
        }

        items = items.filter((workItem) => { return workItem.codeStepNext === code; });

        this.workflowService.assignBackgroundColor(items, "idRequest");
        return items;
    }

    private buildRequestIds(items: any[], mode: string): void {
        let wItems: any[] = [];

        if (mode === "main") {
            if (this.core) {
                wItems = items.filter((request) => { return request.idCoreFacility === this.core.idCoreFacility; });
            } else {
                wItems = items;
            }
        } else {
            wItems = items;
        }

        this.requestIds = Array.from(wItems.reduce((m, t) => m.set(t.requestNumber, t), new Map()).values());
        this.requestIds.unshift(this.emptyRequest);
    }

    public selectRequestOption(): void {
        this.workingWorkItemList = this.filterWorkItems();

        this.gridApi.setRowData(this.workingWorkItemList);
    }

    public selectCoreOption(): void {
        if(this.preSelectedCore === this.core) {
            return;
        }
    
        this.workItem = "";
    
        if (this.codeStepNext === this.workflowService.ALL) {
            this.workingWorkItemList = this.filterWorkItems();
        } else if (this.codeStepNext === this.workflowService.ILLUMINA_SEQQC){
            this.workingWorkItemList = this.filterByCodeStepNext(this.workflowService.ILLUMINA_SEQQC);
        } else {
            this.workingWorkItemList = this.filterByRequestCategory(this.codeStepNext);
        }
        this.buildRequestIds(this.workingWorkItemList, "main");
        this.preSelectedCore = this.core;

        this.gridApi.setRowData(this.workingWorkItemList);
    }

    public onNotifyGridRowDataChanged(event): void {
        if (this.gridApi) {
            this.gridApi.hideOverlay();
        }
    }

    public onCellValueChanged(event): void {
        this.changedRowMap.set(event.data.key, event.data);
        this.dirty = true;
    }

    public onGridReady(params): void {
        this.gridApi = params.api;

        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this.initialize();
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        event.api.sizeColumnsToFit();
    }

    public save(): void {
        this.gridApi.stopEditing();

        setTimeout(() => {
            let workItems: any[] = [];

            for(let value of Array.from( this.changedRowMap.values()) ) {
                this.setQualCodeApplication(value);
                workItems.push(value);
            }

            let params: HttpParams = new HttpParams().set("workItemXMLString", JSON.stringify(workItems));

            this.showSpinner = true;

            this.workflowService.saveCombinedWorkItemQualityControl(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.changedRowMap = new Map<string, any>();
                this.dirty = false;
                this.workItem = "";
                this.initialize(true);
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        });
    }

    public static qualCalcValueSetter(params: any) {
        return params.colDef.validateService.validate(params);
    }

    private setQualCodeApplication(item: any): void {
        let warningMessage: string = "";
        if (item.qualCodeBioanalyzerChipType) {
            item.qualCodeApplication = this.gnomexService.getCodeApplicationForBioanalyzerChipType(item.qualCodeBioanalyzerChipType);
        } else if (item.qualStatus === "Completed" || item.qualStatus === "Terminated") {
            warningMessage = item.sampleNumber + " is completed or terminated and does not have a QC Protocol specified.";
            this.dialogsService.confirm(warningMessage, null);
        }
    }

    private onClickAll(): void {
        this.workItem = "";
        this.label = "Combined Sample Quality";
        this.codeStepNext = this.workflowService.ALL;
        this.workingWorkItemList = this.filterWorkItems();
        this.buildRequestIds(this.workItemList, "main");

        this.gridApi.setRowData(this.workingWorkItemList);
    }

    private onClickIlluminaQC(): void {
        this.workItem = "";
        this.label = "Illumina Sample Quality";
        this.codeStepNext = this.workflowService.ILLUMINA_SEQQC;
        this.workingWorkItemList = this.filterByCodeStepNext(this.workflowService.ILLUMINA_SEQQC);
        this.buildRequestIds(this.workingWorkItemList, "");

        this.gridApi.setRowData(this.workingWorkItemList);
    }

    private onClickSampleQualityQC(): void {
        this.workItem = "";
        this.label = "Sample Quality";
        this.codeStepNext = this.workflowService.QC;
        this.workingWorkItemList = this.filterByRequestCategory(this.workflowService.QC);
        this.buildRequestIds(this.workingWorkItemList, "");

        this.gridApi.setRowData(this.workingWorkItemList);
    }

    private onClickNanostringQC(): void {
        this.workItem = "";
        this.label = "Nanostring";
        this.codeStepNext = this.workflowService.NANOSTRING;
        this.workingWorkItemList = this.filterByRequestCategory(this.workflowService.NANOSTRING);
        this.buildRequestIds(this.workingWorkItemList, "");

        this.gridApi.setRowData(this.workingWorkItemList);
    }

    public refreshWorklist(event): void {
        this.initialize(true);
    }
}
