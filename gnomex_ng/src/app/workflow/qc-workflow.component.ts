import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import { URLSearchParams } from "@angular/http";
import {FormControl} from "@angular/forms";
import {MatAutocomplete, MatAutocompleteTrigger, MatInput, MatOption, MatSidenav} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridOptions} from "ag-grid";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {ValueParserParams} from "ag-grid/dist/lib/entities/colDef";
import {DialogsService} from "../util/popup/dialogs.service";

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
    private requestFC: FormControl;
    private coreFacilityFC: FormControl;
    private coreFacilityAppMap: Map<string, any[]> = new Map<string, any[]>();
    private changedRowMap: Map<string, any> = new Map<string, any>();
    private gridOptions:GridOptions = {};
    private columnDefs;
    private emptyRequest = {requestNumber: ""};
    private dirty: boolean = false;
    private showSpinner: boolean = false;
    private workItem: any;
    private previousRequestMatOption: MatOption;
    private showNav: boolean = true;
    private hide260230: boolean = true;
    status = [
        {display: ''},
        {display: 'In Progress'},
        {display: 'Completed'},
        {display: 'On Hold'},
        {display: 'Terminate'},
        {display: 'Bypass'}
    ];
    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService) {
        this.requestFC = new FormControl("");
        this.coreFacilityFC = new FormControl("");

    }

    ngOnInit() {
        this.initialize();
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
            if (!this.coreFacilityFC.value) {
                this.coreFacilityFC.setValue(this.cores[0]);
            }
            this.workingWorkItemList = this.filterWorkItems();
            this.filteredQcProtocolList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.BioanalyzerChipType").filter((item: any) => {
                var retVal: boolean = false;
                if (item.value == "") {
                    retVal = true;
                } else {
                    if (item.isActive === 'Y' && this.coreFacilityFC.value) {
                        let appCodes: any[] = [];
                        appCodes = this.coreFacilityAppMap.get(this.coreFacilityFC.value.idCoreFacility);
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
                    fillGroupAttribute: 'idRequest'
                },
                {
                    headerName: "Conc. ng/uL",
                    editable: true,
                    width: 125,
                    field: "qualCalcConcentration",
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                    valueSetter: this.qualCalcValueSetter,
                },
                {
                    headerName: "260/230",
                    editable: true,
                    width: 125,
                    field: "260230Concentration",
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                    hide: this.hide260230  // TODO Hide for now until I can get the core facility property

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
                    selectOptionsValueField: "display"
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
        if (this.coreFacilityFC.value) {
            items = items.filter(request =>
                request.idCoreFacility === this.coreFacilityFC.value.idCoreFacility
            )

        }

        return items;
    }

    buildRequestIds(items: any[]) {
        let wItems: any[] = [];
        if (this.coreFacilityFC.value) {
            wItems = items.filter(request =>
                request.idCoreFacility === this.coreFacilityFC.value.idCoreFacility
            )

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
        let fUsers: any[];
        if (name) {
            fUsers = this.requestIds.filter(request =>
                request.requestNumber.indexOf(name) >= 0);
            return fUsers;
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
            this.filterWorkItems();
        }
    }

    selectCoreOption(event) {
        this.coreFacilityFC.setValue(event.source.value);
        this.workingWorkItemList = this.filterWorkItems();
        this.buildRequestIds(this.workItemList);
    }

    onNotifyGridRowDataChanged(event) {
    }

    onCellValueChanged(event) {
        this.changedRowMap.set(event.data.key, event.data);
        this.dirty = true;
    }

    onRowDataChanged(event) {
        console.log("row changed");
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

    save() {
        var params: URLSearchParams = new URLSearchParams();
        let workItems: any[] = [];
        for(let value of Array.from( this.changedRowMap.values()) ) {
            let obj: object = {"WorkItem": value};
            workItems.push(obj);
        }
        params.set("workItemXMLString", JSON.stringify(workItems));
        this.showSpinner = true;
        this.workflowService.saveCombinedWorkItemQualityControl(params).subscribe((response: Response) => {
            this.showSpinner = false;
            this.changedRowMap = new Map<string, any>();
            this.dirty = false;
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
    }

    close() {
    }

    qualCalcValueSetter(params: ValueParserParams) {
        console.log("qc");
        let valid: boolean = false;
        let message: string = "Invalid: ";
        if (params.newValue === "") {
            params.data[params.colDef.field] = "";
        }
        if (params.newValue > 0) {
            if (params.newValue < 99999 ) {
                params.data[params.colDef.field] = params.newValue;
                valid = true;
            } else {
                message = "Exceeds max of 99999"
            }
        } else {
            message = "Cannot be negative"
        }
        // if (!valid) {
        //     this.dialogsService.confirm(message, null);
        //
        // }
        // return valid;
    }
}
