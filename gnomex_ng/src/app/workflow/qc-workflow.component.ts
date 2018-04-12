import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import { URLSearchParams } from "@angular/http";
import {FormControl} from "@angular/forms";
import {MatAutocomplete} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridOptions} from "ag-grid";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";

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
        .row-one-right {
            display: flex;
            flex-grow: 1;
            margin-left: 85em;
        }

    `]
})

export class QcWorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild("autoRequest") autoRequestComplete: MatAutocomplete;
    @ViewChild("autoCore") autoCoreComplete: MatAutocomplete;

    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private coreWorkItemList: any[] = [];
    private currentWorkItemList: any[] = [];
    private coreIds: any[] = [];
    private cores: any[] = [];
    private selectedCore: any;
    private requestIds: any[] = [];
    private filteredQcProtocolList: any[] = [];
    private requestFC: FormControl;
    private coreFacilityFC: FormControl;
    private coreFacilityAppMap: Map<string, any[]> = new Map<string, any[]>();
    private gridOptions:GridOptions = {};
    private columnDefs;
    private emptyRequest = {requestNumber: ""};
    private dirty: boolean = false;
    private initial: boolean = true;
    private showSpinner: boolean = false;
    status = [
        {display: ''},
        {display: 'In Progress'},
        {display: 'Complete'},
        {display: 'On Hold'},
        {display: 'Terminate'},
        {display: 'Bypass'}
    ];
    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dictionaryService: DictionaryService) {
        this.requestFC = new FormControl("");
        this.coreFacilityFC = new FormControl("");

    }

    ngOnInit() {
        var params: URLSearchParams = new URLSearchParams();
        params.set("codeStepNext", "QC");
        let test: any[] = ["jdfk","303"];
        console.log("test array "+test);
        var testMap: Map<string, string> = new Map<string, string>();
        testMap.set("3", "test" );
        console.log("should work "+testMap.get("3"));
        this.workflowService.getWorkItemList(params).subscribe((response: any[]) => {
            this.workItemList = response;
            // this.requestIds = [...new Set(this.workItemList.map(item => item.requestNumber))];
            this.requestIds = Array.from(this.workItemList.reduce((m, t) => m.set(t.requestNumber, t), new Map()).values());

            this.requestIds.unshift(this.emptyRequest);
            // for (let coreId of this.coreIds) {
            //     let coreObj = {idCoreFacility: coreId,
            //         display: this.gnomexService.getCoreFacilityName(coreId)}
            //     this.cores.push(coreObj);
            //     this.coreFacilityAppMap.set(coreId, this.gnomexService.getQCAppCodesForCore(coreId))
            // }
            this.coreIds = [...new Set(this.workItemList.map(item => item.idCoreFacility))];
            for (let coreId of this.coreIds) {
                let coreObj = {idCoreFacility: coreId,
                                display: this.gnomexService.getCoreFacilityName(coreId)}
                this.cores.push(coreObj);
                this.coreFacilityAppMap.set(coreId, this.gnomexService.getQCAppCodesForCore(coreId))
                console.log("initial "+this.coreFacilityAppMap[coreId]);
            }
            if (this.cores.length > 0) {
                this.selectedCore = this.coreIds[0];
            }
            this.workingWorkItemList = this.workItemList;
            this.workingWorkItemList = this.filterWorkItems();
            this.coreFacilityFC.setValue(this.cores[0]);
            this.filteredQcProtocolList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.BioanalyzerChipType").filter((item: any) => {
                var retVal: boolean = false;
                if (item.value == "") {
                    retVal = true;
                } else {
                    if (item.isActive === 'Y' && this.coreFacilityFC.value) {
                        let appCodes: any[] = [];
                        console.log("idCore "+this.coreFacilityFC.value.idCoreFacility);
                        console.log("app "+this.coreFacilityAppMap.get(this.coreFacilityFC.value.idCoreFacility));
                        appCodes = this.coreFacilityAppMap.get(this.coreFacilityFC.value.idCoreFacility);
                        Array.from(this.coreFacilityAppMap.keys()).forEach(key => console.log("key "+key));
                        Array.from(this.coreFacilityAppMap.values()).forEach(value => console.log("value "+value));
                        console.log("appcodes "+appCodes+" coreappmap "+this.coreFacilityAppMap);
                        if (appCodes && appCodes.length > 0) {
                            for (var code of appCodes) {
                                console.log("codeApplic "+item.codeApplication+" code "+code);
                                if (item.codeApplication.toString() === code) {
                                    console.log("MATCHHHHHHHHHHHHHHHHHHHHHHH");
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
                    width: 200
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
                    selectOptionsValueField: "datakey"
                },
                {
                    headerName: "Conc. ng/uL",
                    editable: true,
                    width: 200,
                    field: "qualCalcConcentration",
                    cellRendererFramework: TextAlignLeftMiddleRenderer,

                },
                {
                    headerName: "RIN #",
                    editable: true,
                    width: 200,
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
                    selectOptionsValueField: "qualStatus"
                }

            ];

        });
    }

    ngAfterViewInit() {

    }

    filterWorkItems(): any[] {
        let items: any[] = [];

        if (this.requestFC.value) {
            items = this.workingWorkItemList.filter(request =>
                request.requestNumber === this.requestFC.value.requestNumber
            )
        } else {
            items = this.workingWorkItemList;
        }
        if (this.selectedCore) {
            items = items.filter(request =>
                request.idCoreFacility === this.selectedCore
            )

        }
        return items;
    }

    chooseFirstRequestOption() {
        this.autoRequestComplete.options.first.select();
    }

    chooseFirstCoreOption() {
        this.autoCoreComplete.options.first.select();
    }

    filterRequests(selectedRequest: any): any[] {
        let fRequests: any[];
        if (selectedRequest) {
            if (selectedRequest.requestNumber) {
                if (selectedRequest.requestNumber === "") {
                    this.initial = true;
                    this.dirty = false;
                    return this.requestIds;
                } else {
                    fRequests = this.requestIds.filter(request =>
                        request.requestNumber.indexOf(selectedRequest.requestNumber) >= 0);
                    return fRequests;
                }
            } else {
                fRequests = this.requestIds.filter(request =>
                    request.requestNumber.indexOf(selectedRequest) >= 0);
                return fRequests;
            }
        } else {
            return this.requestIds;
        }

    }

    filterCores(name: any): any[] {
        return this.cores;
    }

    highlightFirstRequestOption(event) {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.autoRequestComplete.options.first) {
            this.autoRequestComplete.options.first.setActiveStyles();
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
        this.requestFC.setValue(event.source.value);
        this.workingWorkItemList = this.filterWorkItems();
    }

    selectCoreOption(event) {
        this.coreFacilityFC.setValue(event.source.value);
        this.filterWorkItems();
    }

    onNotifyGridRowDataChanged() {
        if (this.initial === true) {
            this.initial = false;
        } else {
            this.dirty = true;
        }
    }

    onGridReady(event) {

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
            if (item.isActive === 'Y' && this.coreFacilityFC.value) {
                var appCodes: any[] = this.coreFacilityAppMap[this.coreFacilityFC.value];
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

}
