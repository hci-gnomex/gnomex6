import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
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
    selector: 'qc-workflow',
    templateUrl: 'qc-workflow.html',
    styles: [`
        .flex-row-container {
            display: flex;
            flex-direction: row;
        }
        .formField {
            width: 20%;
            margin: 0 0.5%;
        }
    `]
})

export class QcWorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild("requestInput") requestInput: ElementRef;
    @ViewChild("coreFacility") coreFacilityInput: ElementRef;
    @Input() mode: string;

    private workItemList: any[] = [];
    public workingWorkItemList: any[] = [];
    private coreIds: any[] = [];
    private cores: any[] = [];
    private requestIds: any[] = [];
    private qcProtocolList: any[] = [];
    private coreFacilityAppMap: Map<string, any[]> = new Map<string, any[]>();
    private changedRowMap: Map<string, any> = new Map<string, any>();
    public columnDefs;
    private emptyRequest = {requestNumber: ""};
    public dirty: boolean = false;
    public showSpinner: boolean = false;
    public workItem: any;
    public core: any;
    private preSelectedCore: any;
    private hide260230: boolean = true;
    private gridApi:GridApi;
    private gridColumnApi;
    private label: string = "Combined Sample Quality";
    private codeStepNext: string = "ALL";

    public allRequestCategories: any[] = [];

    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private gridColumnValidatorService: GridColumnValidateService,
                private dictionaryService: DictionaryService) {

    }

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
        let params: HttpParams = new HttpParams()
            .set("codeStepNext", this.workflowService.QC);
        this.cores = [];
        this.workItem = "";
        this.workflowService.getWorkItemList(params).subscribe((response: any) => {
            this.workItemList = response ? UtilService.getJsonArray(response, response.WorkItem) : [];

            this.coreIds = [...new Set(this.workItemList.map(item => item.idCoreFacility))];
            for (let coreId of this.coreIds) {
                let coreObj = {idCoreFacility: coreId,
                    display: this.gnomexService.getCoreFacilityName(coreId)};
                this.cores.push(coreObj);
                this.coreFacilityAppMap.set(coreId, this.gnomexService.getQCAppCodesForCore(coreId));
            }
            this.workingWorkItemList = this.workItemList;
            if (this.cores.length > 0) {
                if(this.preSelectedCore) {
                    this.core = this.cores.find((core: any) => {return core.idCoreFacility === this.preSelectedCore.idCoreFacility});
                } else if(this.preSelectedCore === undefined) {
                    this.core = this.cores[0];
                } else {
                    this.core = null;
                }
            }
            this.preSelectedCore = this.core;
            this.workingWorkItemList = this.filterWorkItems();
            this.workingWorkItemList = this.workingWorkItemList.sort(this.workflowService.sortSampleNumber);
            if(refreshMode) {
                this.ngOnChanges();
            }

            this.qcProtocolList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.BioanalyzerChipType");

            this.columnDefs = [
                {
                    headerName: "Sample #",
                    editable: false,
                    field: "sampleNumber",
                    width: 100
                },
                {
                    headerName: "Sample Type",
                    editable: false,
                    field: "sampleType",
                    width: 200
                },
                {
                    headerName: "Client",
                    editable: false,
                    field: "appUserName",
                },
                {
                    headerName: "QC Protocol",
                    editable:  true,
                    width: 400,
                    field: "qualCodeBioanalyzerChipType",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: this.qcProtocolList,
                    selectOptionsDisplayField: "bioanalyzerChipType",
                    selectOptionsValueField: "datakey",
                    selectOptionsPerRowFilterFunction: (context, rowData, option) => {

                        if (!context || !rowData || !option) {
                            return true;
                        }

                        if (option.value == "") {
                            return true;
                        }

                        if (option.isActive === 'Y' && rowData) {
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
                    fillGroupAttribute: 'idRequest',
                },
                {
                    headerName: "Conc. ng/uL",
                    editable: true,
                    width: 125,
                    field: "qualCalcConcentration",
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                    valueSetter: QcWorkflowComponent.qualCalcValueSetter,
                    validateService: this.gridColumnValidatorService,
                    maxValue: 99999,
                    minValue: 0,
                    allowNegative: false
                },
                {
                    headerName: "260/230",
                    editable: true,
                    width: 125,
                    field: "qual260nmTo230nmRatio",
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                    hide: this.hide260230,  // TODO Hide for now until I can get the core facility property
                    valueSetter: QcWorkflowComponent.qualCalcValueSetter,
                    validateService: this.gridColumnValidatorService,
                    maxValue: 99999,
                    minValue: 0,
                    allowNegative: false

                },
                {
                    headerName: "RIN #",
                    editable: true,
                    width: 125,
                    field: "qualRINNumber",
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                },
                {
                    headerName: "Status",
                    editable:  true,
                    width: 200,
                    field: "qualStatus",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: this.workflowService.workflowCompletionStatus,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "value",
                    showFillButton: true,
                    fillGroupAttribute: 'idRequest',

                }

            ];
            this.gridApi.setColumnDefs(this.columnDefs);
            this.gridApi.sizeColumnsToFit();

            this.requestIds = Array.from(this.workingWorkItemList.reduce((m, t) => m.set(t.requestNumber, t), new Map()).values());
            this.requestIds.unshift(this.emptyRequest);
            this.dialogsService.stopAllSpinnerDialogs();
            // TODO Need to get hide260230 and hide that column appropriately
            // var hide260230:String = parentApplication.getCoreFacilityProperty(selectedIdCoreFacility, parentApplication.PROPERTY_HIDE_260_230_QC_WORKFLOW);
        },(err:IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });

    }

    ngAfterViewInit() {

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
        if (this.core) {
            items = items.filter(request =>
                request.idCoreFacility === this.core.idCoreFacility
            )
        }
        if (this.codeStepNext && this.codeStepNext !== this.workflowService.ALL) {
            items = items.filter(request =>
                request.codeStepNext === this.codeStepNext
            );
        }
        this.workflowService.assignBackgroundColor(items, "idRequest");
        return items;
    }

    filterByRequestCategory(type: string): any[] {
        let items: any[] = [];

        if (this.core) {
            items = this.workItemList.filter(workItem =>
                workItem.idCoreFacility === this.core.idCoreFacility
            )
        } else {
            items = this.workItemList;
        }
        
        items = items.filter((request) => {
            if (type === "MICROARRAY") {
                if (request.codeStepNext === this.workflowService.QC && request.requestCategoryType !== this.workflowService.QC) {
                    return true;
                }
            } else if (type === this.workflowService.QC) {
                if (request.codeStepNext === this.workflowService.QC && request.requestCategoryType === this.workflowService.QC) {
                    return true;
                }
            } else if (type === this.workflowService.NANOSTRING) {
                if (request.codeStepNext == this.workflowService.QC && request.requestCategoryType == this.workflowService.NANOSTRING) {
                    return true;
                }
            }
            return false;
        });
        this.workflowService.assignBackgroundColor(items, "idRequest");
        return items;
    }

    filterByCodeStepNext(code: string): any[] {
        let items: any[] = [];

        if (this.core) {
            items = this.workItemList.filter(workItem =>
                workItem.idCoreFacility === this.core.idCoreFacility
            )
        } else {
            items = this.workItemList;
        }
        items = items.filter(workItem =>
            workItem.codeStepNext === code
        );
        this.workflowService.assignBackgroundColor(items, "idRequest");
        return items;
    }

    buildRequestIds(items: any[], mode: string) {
        let wItems: any[] = [];
        if (mode === "main") {
            if (this.core) {
                wItems = items.filter(request =>
                    request.idCoreFacility === this.core.idCoreFacility
                )

            } else {
                wItems = items;
            }
        } else {
            wItems = items;
        }
        this.requestIds = Array.from(wItems.reduce((m, t) => m.set(t.requestNumber, t), new Map()).values());
        this.requestIds.unshift(this.emptyRequest);
    }

    filterCores(): any[] {
        return this.cores;
    }

    compareByID(core1,core2) {
        return core1 && core2 && core1.idCoreFacility == core2.idCoreFacility;
    }

    selectRequestOption() {
        this.workingWorkItemList = this.filterWorkItems();
    }

    selectedRow(event) {
        this.gridApi.redrawRows();
    }

    selectCoreOption() {
        if(this.preSelectedCore === this.core) {
            return;
        }
    
        this.workItem = "";
    
        if (this.codeStepNext == this.workflowService.ALL) {
            this.workingWorkItemList = this.filterWorkItems();
        } else if (this.codeStepNext === this.workflowService.ILLUMINA_SEQQC){
            this.workingWorkItemList = this.filterByCodeStepNext(this.workflowService.ILLUMINA_SEQQC);
        } else {
            this.workingWorkItemList = this.filterByRequestCategory(this.codeStepNext);
        }
        this.buildRequestIds(this.workingWorkItemList, "main");
        this.preSelectedCore = this.core;
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
        this.initialize();
    }

    onGridSizeChanged(event: GridSizeChangedEvent) {
        event.api.sizeColumnsToFit();
    }

    filterAppList(item: any): boolean {
        let retVal: boolean = false;
        if (item.value == "") {
            retVal = true;
        } else {
            if (item.isActive === 'Y' && this.core) {
                let appCodes: any[] = this.coreFacilityAppMap[this.core];
                if (appCodes.length > 0) {
                    for (var code of appCodes) {
                        if (item.codeApplication.toString() === code) {
                            retVal = true;
                            break;
                        }
                    }
                }
            }
        }
        return retVal;
    }

    save() {
        this.gridApi.stopEditing();
        setTimeout(() => {
            let params: HttpParams = new HttpParams();
            let workItems: any[] = [];
            for(let value of Array.from( this.changedRowMap.values()) ) {
                this.setQualCodeApplication(value);
                workItems.push(value);
            }
            params = params.set("workItemXMLString", JSON.stringify(workItems));
            this.showSpinner = true;
            this.workflowService.saveCombinedWorkItemQualityControl(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.changedRowMap = new Map<string, any>();
                this.dirty = false;
                this.workItem = "";
                this.initialize(true);
            }, (err:IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        })

    }

    static qualCalcValueSetter(params: any) {
        return params.colDef.validateService.validate(params);
    }

    setQualCodeApplication(item: any) {
        let warningMessage: string = "";
        if (item.qualCodeBioanalyzerChipType) {
            item.qualCodeApplication = this.gnomexService.getCodeApplicationForBioanalyzerChipType(item.qualCodeBioanalyzerChipType);
        } else if (item.qualStatus == 'Completed' || item.qualStatus == 'Terminated') {
            warningMessage = item.sampleNumber + " is completed or terminated and does not have a QC Protocol specified.";
            this.dialogsService.confirm(warningMessage, null);
        }
    }

    onClickAll() {
        this.workItem = "";
        this.label = "Combined Sample Quality";
        this.codeStepNext = this.workflowService.ALL;
        this.workingWorkItemList = this.filterWorkItems();
        this.buildRequestIds(this.workItemList, "main");
    }

    onClickIlluminaQC() {
        this.workItem = "";
        this.label = "Illumina Sample Quality";
        this.codeStepNext = this.workflowService.ILLUMINA_SEQQC;
        this.workingWorkItemList = this.filterByCodeStepNext(this.workflowService.ILLUMINA_SEQQC);
        this.buildRequestIds(this.workingWorkItemList, '');
    }

    onClickMicroarrayQC() {
        this.workItem = "";
        this.label = "Microarray Sample Quality";
        this.codeStepNext = this.workflowService.MICROARRAY;
        this.workingWorkItemList = this.filterByRequestCategory(this.workflowService.MICROARRAY);
        this.buildRequestIds(this.workingWorkItemList, "");
    }

    onClickSampleQualityQC() {
        this.workItem = "";
        this.label = "Sample Quality";
        this.codeStepNext = this.workflowService.QC;
        this.workingWorkItemList = this.filterByRequestCategory(this.workflowService.QC);
        this.buildRequestIds(this.workingWorkItemList, "");
    }

    onClickNanostringQC() {
        this.workItem = "";
        this.label = "Nanostring";
        this.codeStepNext = this.workflowService.NANOSTRING;
        this.workingWorkItemList = this.filterByRequestCategory(this.workflowService.NANOSTRING);
        this.buildRequestIds(this.workingWorkItemList, "");
    }

    refreshWorklist(event) {
        this.initialize(true);
    }
}
