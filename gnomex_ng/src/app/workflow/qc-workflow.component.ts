import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import { URLSearchParams } from "@angular/http";
import {MatAutocomplete, MatAutocompleteTrigger, MatInput, MatOption, MatSidenav} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridOptions} from "ag-grid";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {ValueParserParams} from "ag-grid/dist/lib/entities/colDef";
import {DialogsService} from "../util/popup/dialogs.service";
import {GridColumnValidateService} from "../services/grid-column-validate.service";

@Component({
    selector: 'qc-workflow',
    templateUrl: 'qc-workflow.html',
    styles: [`
        .flex-column-container {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 100%;
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
        .sidenav-container {
            height: 100%;
        }
        .row-one-right {
            display: flex;
            flex-grow: 1;
            margin-left: 85em;
        }
        .filler {
            flex-grow:1; 
            text-align:center
        }
        #groupTabGroup ::ng-deep.mat-tab-label, ::ng-deep.mat-tab-label-active{
            width: 25%;
            min-width: 0;
            padding: 3px;
            margin: 3px;
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

    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private coreWorkItemList: any[] = [];
    private currentWorkItemList: any[] = [];
    private coreIds: any[] = [];
    private cores: any[] = [];
    private requestIds: any[] = [];
    private filteredQcProtocolList: any[] = [];
    private coreFacilityAppMap: Map<string, any[]> = new Map<string, any[]>();
    private changedRowMap: Map<string, any> = new Map<string, any>();
    private gridOptions:GridOptions = {};
    private columnDefs;
    private emptyRequest = {requestNumber: ""};
    private dirty: boolean = false;
    private showSpinner: boolean = false;
    private workItem: any;
    private core: any;
    private previousRequestMatOption: MatOption;
    private showNav: boolean = true;
    private hide260230: boolean = true;
    private gridApi;
    private gridColumnApi;
    private hiSeqCoreObject = {
        idCoreFacility: "1",
        display: "High Throughput Genomics"
    };
    private miSeqCoreObject = {
        idCoreFacility: "3",
        display: "Molecular Diagnostics"
    };
    status = [
        {display: '', value: ''},
        {display: 'In Progress', value: 'In Progress'},
        {display: 'Complete', value: 'Completed'},
        {display: 'On Hold', value: 'On Hold'},
        {display: 'Terminate', value: 'Terminated'},
        {display: 'Bypass', value: 'Bypassed'}
    ];
    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private gridColumnValidatorService: GridColumnValidateService,
                private dictionaryService: DictionaryService) {

    }

    ngOnInit() {
        // this.initialize();
        this.sidenav.open();
    }

    initialize() {
        var params: URLSearchParams = new URLSearchParams();
        params.set("codeStepNext", "QC");
        this.cores = [];
        this.workflowService.getWorkItemList(params).subscribe((response: any[]) => {
            this.workItemList = response;
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
            this.filteredQcProtocolList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.BioanalyzerChipType").filter((item: any) => {
                var retVal: boolean = false;
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
                    valueSetter: this.qualCalcValueSetter,
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
                    valueSetter: this.qualCalcValueSetter,
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
                    selectOptions: this.status,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "value"
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
            console.log("request option first "+this.autoRequestComplete.options.first);
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

    filterCores(name: any): any[] {
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

    displayRequest(request) {
        return request ? request.requestNumber : request;
    }

    displayCore(core) {
        return core ? core.display : core;
    }

    selectRequestOption(event) {
        if (event.source.selected) {
            this.workItem = event.source.value;
            this.workingWorkItemList = this.filterWorkItems();
            // this.filterWorkItems("main");
        }
    }

    selectCoreOption(event) {
        if (event.source.selected) {
            this.core = event.source.value;
            this.workingWorkItemList = this.filterWorkItems();
            this.buildRequestIds(this.workItemList, "main");
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

    onRowDataChanged(event) {
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
        this.initialize();
    }

    onSelectionChanged(event) {

    }

    onGridSizeChanged(event) {

    }

    filterAppList(item: any): boolean {
        var retVal: boolean = false;
        if (item.value == "") {
            retVal = true;
        } else {
            if (item.isActive === 'Y' && this.core) {
                var appCodes: any[] = this.coreFacilityAppMap[this.core];
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
        var params: URLSearchParams = new URLSearchParams();
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
    }

    onGroupsTabChange(event) {

    }

    toggle(event) {
        if (this.showNav) {
            this.sidenav.close();
            this.showNav = false;

        } else {
            this.sidenav.open();
            this.showNav = true;
        }
        this.gridApi.sizeColumnsToFit();
    }

    close() {
    }

    qualCalcValueSetter(params: any) {
        return params.colDef.validateService.validate(params);
    }

    setQualCodeApplication(item: any) {
        let warningMessage: string = "";
            if (item.qualCodeBioanalyzerChipType) {
                let code:string = this.gnomexService.getCodeApplicationForBioanalyzerChipType(item.qualCodeBioanalyzerChipType);
                item.qualCodeApplication = code;
            } else if (item.qualStatus == 'Completed' || item.qualStatus == 'Terminated') {
                warningMessage = item.sampleNumber + " is completed or terminated and does not have a QC Protocol specified.";
                this.dialogsService.confirm(warningMessage, null);
            }

    }

    onClickAll(event) {
        this.workingWorkItemList = this.workItemList;
        this.buildRequestIds(this.workingWorkItemList, "all");
    }

    onClickHiSeq(event) {
        this.core = this.hiSeqCoreObject;
        this.workingWorkItemList = this.filterWorkItems();
        this.buildRequestIds(this.workingWorkItemList, "all");
    }

    onClickMiSeq(event) {
        this.core = this.miSeqCoreObject;
        this.workingWorkItemList = this.filterWorkItems();
        this.buildRequestIds(this.workingWorkItemList, "all");
    }

    onClickMicroarray(event) {

    }

    onClickSampleQuality(event) {

    }
}
