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
import {DialogsService} from "../util/popup/dialogs.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";

@Component({
    selector: 'libprepqc-workflow',
    templateUrl: 'libprepqc-workflow.html',
    styles: [`
        .flex-column-container-workflow {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 99%;
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
    `]
})

export class LibprepQcWorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild("autoRequest") autoRequestComplete: MatAutocomplete;
    @ViewChild("requestInput") requestInput: ElementRef;
    @ViewChild("coreFacility") coreFacilityInput: ElementRef;
    @ViewChild("autoCore") autoCoreComplete: MatAutocomplete;
    @ViewChild("autoRequest") trigger: MatAutocompleteTrigger;
    @ViewChild('sidenav') sidenav: MatSidenav;

    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private coreIds: any[] = [];
    private cores: any[] = [];
    private requestIds: any[] = [];
    private coreFacilityAppMap: Map<string, any[]> = new Map<string, any[]>();
    private changedRowMap: Map<string, any> = new Map<string, any>();
    private columnDefs;
    private emptyRequest = {requestNumber: ""};
    private dirty: boolean = false;
    private showSpinner: boolean = false;
    private workItem: any;
    private core: any;
    private previousRequestMatOption: MatOption;
    private gridApi;
    private gridColumnApi;
    private label: string = "Illumina Library Prep QC";
    private codeStepNext: string = "ALL";
    private libraryPrepQCProtocols: any[] =[];
    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService) {

    }

    ngOnInit() {
    }

    initialize() {
        let params: URLSearchParams = new URLSearchParams();
        params.set("codeStepNext", this.workflowService.ILLSEQ_PREP_QC);
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
            this.libraryPrepQCProtocols = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.LibraryPrepQCProtocol");

            this.columnDefs = [
                {
                    headerName: "Sample #",
                    editable: false,
                    field: "sampleNumber",
                    width: 100
                },
                {
                    headerName: "Client",
                    editable: false,
                    field: "appUserName",
                },
                {
                    headerName: "Vol. (uL)",
                    editable: false,
                    width: 150,
                    field: "sampleVolume",
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                },
                {
                    headerName: "Library QC Protocol",
                    editable:  true,
                    width: 400,
                    field: "idLibPrepQCProtocol",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: SelectEditor,
                    selectOptions: this.libraryPrepQCProtocols,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "idLibPrepQCProtocol",
                    showFillButton: true,
                    fillGroupAttribute: 'idRequest',
                },
                {
                    headerName: "Library QC Conc.",
                    editable: true,
                    width: 150,
                    field: "qcLibConcentration",
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                },
                {
                    headerName: "Status",
                    editable:  true,
                    width: 200,
                    field: "seqPrepQCStatus",
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
        let workItems: any[] = [];
        if (mode === "main") {
            if (this.core) {
                workItems = items.filter(request =>
                    request.idCoreFacility === this.core.idCoreFacility
                )

            }
        } else {
            workItems = items;
        }
        this.requestIds = Array.from(workItems.reduce((m, t) => m.set(t.requestNumber, t), new Map()).values());
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
            var params: URLSearchParams = new URLSearchParams();
            let workItems: any[] = [];
            for(let value of Array.from( this.changedRowMap.values()) ) {
                workItems.push(value);
            }
            params.set("workItemXMLString", JSON.stringify(workItems));
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

    onClickLibPrepQc(event) {
        this.initialize();
    }

    refreshWorklist(event) {
        this.initialize();
    }
}
