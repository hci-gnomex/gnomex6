import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
import {WorkflowService, qcModes} from "../services/workflow.service";
import { URLSearchParams } from "@angular/http";
import {MatAutocomplete, MatAutocompleteTrigger, MatInput, MatOption, MatSidenav} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridOptions} from "ag-grid";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {DialogsService} from "../util/popup/dialogs.service";
import {GridColumnValidateService} from "../services/grid-column-validate.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";

@Component({
    selector: 'qc-workflow',
    templateUrl: 'qc-workflow.html',
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
    `]
})

export class QcWorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild("autoRequest") autoRequestComplete: MatAutocomplete;
    @ViewChild("requestInput") requestInput: ElementRef;
    @ViewChild("coreFacility") coreFacilityInput: ElementRef;
    @ViewChild("autoCore") autoCoreComplete: MatAutocomplete;
    @ViewChild("autoRequest") trigger: MatAutocompleteTrigger;
    @ViewChild('sidenav') sidenav: MatSidenav;
    @Input() mode: string;

    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private coreIds: any[] = [];
    private cores: any[] = [];
    private requestIds: any[] = [];
    private filteredQcProtocolList: any[] = [];
    private coreFacilityAppMap: Map<string, any[]> = new Map<string, any[]>();
    private changedRowMap: Map<string, any> = new Map<string, any>();
    private columnDefs;
    private emptyRequest = {requestNumber: ""};
    private dirty: boolean = false;
    private showSpinner: boolean = false;
    private workItem: any;
    private core: any;
    private previousRequestMatOption: MatOption;
    private hide260230: boolean = true;
    private gridApi;
    private gridColumnApi;
    private label: string = "Combined Sample Quality";
    private codeStepNext: string = "ALL";
    private hiSeqCoreObject = {
        idCoreFacility: "1",
        display: "High Throughput Genomics"
    };

    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private gridColumnValidatorService: GridColumnValidateService,
                private dictionaryService: DictionaryService) {

    }

    ngOnInit() {
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

    initialize() {
        let params: URLSearchParams = new URLSearchParams();
        params.set("codeStepNext", this.workflowService.QC);
        this.cores = [];
        this.workflowService.getWorkItemList(params).subscribe((response: any) => {
            this.workItemList = response;
            if (!this.securityAdvisor.isArray(response)) {
                this.workItemList = [response.WorkItem];
            } else {
                this.workItemList = response;
            }

            this.coreIds = [...new Set(this.workItemList.map(item => item.idCoreFacility))];
            for (let coreId of this.coreIds) {
                let coreObj = {idCoreFacility: coreId,
                    display: this.gnomexService.getCoreFacilityName(coreId)};
                this.cores.push(coreObj);
                this.coreFacilityAppMap.set(coreId, this.gnomexService.getQCAppCodesForCore(coreId));
            }
            this.workingWorkItemList = this.workItemList;
            if (!this.core) {
                this.core = this.cores[0];
            }
            this.workingWorkItemList = this.filterWorkItems();
            this.workingWorkItemList = this.workingWorkItemList.sort(this.workflowService.sortSampleNumber);

            this.filteredQcProtocolList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.BioanalyzerChipType").filter((item: any) => {
                let retVal: boolean = false;
                if (item.value == "") {
                    retVal = true;
                } else {
                    if (item.isActive === 'Y' && this.core) {
                        let appCodes: any[] = [];
                        appCodes = this.coreFacilityAppMap.get(this.core.idCoreFacility);
                        if (appCodes && appCodes.length > 0) {
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
            });

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
                    selectOptions: this.filteredQcProtocolList,
                    selectOptionsDisplayField: "bioanalyzerChipType",
                    selectOptionsValueField: "datakey",
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
            this.requestIds = Array.from(this.workingWorkItemList.reduce((m, t) => m.set(t.requestNumber, t), new Map()).values());
            this.requestIds.unshift(this.emptyRequest);
            // TODO Need to get hide260230 and hide that column appropriately
            // var hide260230:String = parentApplication.getCoreFacilityProperty(selectedIdCoreFacility, parentApplication.PROPERTY_HIDE_260_230_QC_WORKFLOW);
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

            }
        } else {
            wItems = items;
        }
        this.requestIds = Array.from(wItems.reduce((m, t) => m.set(t.requestNumber, t), new Map()).values());
        this.requestIds.unshift(this.emptyRequest);
    }

    chooseFirstRequestOption() {
        if (this.autoRequestComplete.options.first) {
            this.autoRequestComplete.options.first.select();
        }
    }

    chooseFirstCoreOption() {
        this.autoCoreComplete.options.first.select();
    }

    filterRequests(name: any): any[] {
        let fRequests: any[];
        if (name) {
            fRequests = this.requestIds.filter(request =>
                request.requestNumber.indexOf(name) >= 0);
            return fRequests;
        } else {
            return this.requestIds;
        }
    }

    filterCores(): any[] {
        this.coreFacilityInput.nativeElement.blur();
        return this.cores;
    }

    highlightFirstRequestOption(event) {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.autoRequestComplete.options.first) {
            if (this.previousRequestMatOption) {
                this.previousRequestMatOption.setInactiveStyles();
            }
            this.autoRequestComplete.options.first.setActiveStyles();
            this.previousRequestMatOption = this.autoRequestComplete.options.first;
        }
    }

    highlightFirstCoreOption(event) {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.autoCoreComplete.options.first) {
            this.autoCoreComplete.options.first.setActiveStyles();
        }
    }

    displayCore(core) {
        return core ? core.display : core;
    }

    selectRequestOption(event) {
        if (event.source.selected) {
            this.workItem = event.source.value;
            this.workingWorkItemList = this.filterWorkItems();
        }
    }

    selectedRow(event) {
        this.gridApi.redrawRows();
    }

    selectCoreOption(event) {
        this.core = event.source.value;
        if (event.source.selected) {
            if (this.codeStepNext == this.workflowService.ALL) {
                this.workingWorkItemList = this.filterWorkItems();
            } else if (this.codeStepNext === this.workflowService.ILLUMINA_SEQQC){
                this.workingWorkItemList = this.filterByCodeStepNext(this.workflowService.ILLUMINA_SEQQC);
            } else {
                this.workingWorkItemList = this.filterByRequestCategory(this.codeStepNext);
            }
            this.buildRequestIds(this.workingWorkItemList, "main");
        }
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
            let params: URLSearchParams = new URLSearchParams();
            let workItems: any[] = [];
            for(let value of Array.from( this.changedRowMap.values()) ) {
                this.setQualCodeApplication(value);
                workItems.push(value);
            }
            params.set("workItemXMLString", JSON.stringify(workItems));
            this.showSpinner = true;
            this.workflowService.saveCombinedWorkItemQualityControl(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.changedRowMap = new Map<string, any>();
                this.dirty = false;
                this.workItem = "";
                this.initialize();
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
        this.core = this.hiSeqCoreObject;
        this.workingWorkItemList = this.filterByCodeStepNext(this.workflowService.ILLUMINA_SEQQC);
        this.buildRequestIds(this.workingWorkItemList, '');
    }

    onClickMicroarrayQC() {
        this.workItem = "";
        this.label = "Microarray Sample Quality";
        this.core = this.hiSeqCoreObject;
        this.codeStepNext = this.workflowService.MICROARRAY;
        this.workingWorkItemList = this.filterByRequestCategory(this.workflowService.MICROARRAY);
        this.buildRequestIds(this.workingWorkItemList, "");
    }

    onClickSampleQualityQC() {
        this.workItem = "";
        this.label = "Sample Quality";
        this.core = this.hiSeqCoreObject;
        this.codeStepNext = this.workflowService.QC;
        this.workingWorkItemList = this.filterByRequestCategory(this.workflowService.QC);
        this.buildRequestIds(this.workingWorkItemList, "");
    }

    onClickNanostringQC() {
        this.workItem = "";
        this.label = "Nanostring";
        this.core = this.hiSeqCoreObject;
        this.codeStepNext = this.workflowService.NANOSTRING;
        this.workingWorkItemList = this.filterByRequestCategory(this.workflowService.NANOSTRING);
        this.buildRequestIds(this.workingWorkItemList, "");
    }

    refreshWorklist(event) {
        this.initialize();
    }
}
