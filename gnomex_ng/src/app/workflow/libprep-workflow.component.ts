import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import { URLSearchParams } from "@angular/http";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridOptions} from "ag-grid";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {DialogsService} from "../util/popup/dialogs.service";
import {BarcodeSelectEditor} from "../util/grid-editors/barcode-select.editor";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";

@Component({
    selector: 'libprep-workflow',
    templateUrl: 'libprep-workflow.html',
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

export class LibprepWorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild("autoRequest") autoRequestComplete: MatAutocomplete;
    @ViewChild("requestInput") requestInput: ElementRef;
    @ViewChild("coreFacility") coreFacilityInput: ElementRef;
    @ViewChild("autoCore") autoCoreComplete: MatAutocomplete;
    @ViewChild("autoRequest") trigger: MatAutocompleteTrigger;

    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private coreIds: any[] = [];
    private cores: any[] = [];
    private requestIds: any[] = [];
    private seqLibProtocols: any[] = [];
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
    private barCodes: any[] = [];
    private coreAdmins: any[] = [];
    private label = "Illumina Library Prep";

    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService) {

    }

    initialize() {
        let params: URLSearchParams = new URLSearchParams();
        params.set("codeStepNext", this.workflowService.ILLSEQ_PREP);
        this.cores = [];
        let params3: URLSearchParams = new URLSearchParams();
        params3.set("idCoreFacility", this.gnomexService.idCoreFacilityHTG);
        this.workflowService.getCoreAdmins(params3).subscribe((response: any[]) => {
            this.coreAdmins = response;

            this.workflowService.getWorkItemList(params).subscribe((response: any) => {
                this.workItemList = response;
                if (!this.securityAdvisor.isArray(response)) {
                    this.workItemList = [response.WorkItem];
                } else {
                    this.workItemList = response;
                }
                this.coreIds = [...new Set(this.workItemList.map(item => item.idCoreFacility))];
                for (let coreId of this.coreIds) {
                    let coreObj = {
                        idCoreFacility: coreId,
                        display: this.gnomexService.getCoreFacilityName(coreId)
                    };
                    this.cores.push(coreObj);
                    this.coreFacilityAppMap.set(coreId, this.gnomexService.getQCAppCodesForCore(coreId));
                }
                this.workingWorkItemList = this.workItemList;
                if (!this.core) {
                    this.core = this.cores[0];
                }
                this.workingWorkItemList = this.filterWorkItems();
                this.workingWorkItemList = this.workingWorkItemList.sort(this.workflowService.sortSampleNumber);

                this.seqLibProtocols = this.gnomexService.seqLibProtocolsWithAppFilters.filter(item =>
                    item.value === "" || (item.codeApplicationType === "Illumina" && this.gnomexService.isCoreFacilityIManage(item.idCoreFacility))
                );
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
                        width: 175
                    },
                    {
                        headerName: "Multiplex Group",
                        editable: false,
                        field: "multiplexGroupNumber",
                        width: 100
                    },
                    {
                        headerName: "Library Protocol",
                        editable: true,
                        width: 500,
                        field: "idSeqLibProtocol",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: SelectEditor,
                        selectOptions: this.seqLibProtocols,
                        selectOptionsDisplayField: "display",
                        selectOptionsValueField: "idSeqLibProtocol",
                        showFillButton: true,
                        fillGroupAttribute: 'idRequest',
                    },
                    {
                        headerName: "Index A",
                        editable: true,
                        width: 125,
                        field: "idOligoBarcode",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: BarcodeSelectEditor,
                        selectOptions: this.barCodes,
                        selectOptionsDisplayField: "display",
                        selectOptionsValueField: "idOligoBarcode",
                        indexTagLetter: 'A'
                    },
                    {
                        headerName: "Index B",
                        editable: true,
                        width: 125,
                        field: "idOligoBarcodeB",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: BarcodeSelectEditor,
                        selectOptions: this.barCodes,
                        selectOptionsDisplayField: "display",
                        selectOptionsValueField: "idOligoBarcodeB",
                        indexTagLetter: 'B'
                    },
                    {
                        headerName: "Performed By",
                        editable: true,
                        width: 175,
                        field: "idLibPrepPerformedBy",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: SelectEditor,
                        selectOptions: this.coreAdmins,
                        selectOptionsDisplayField: "display",
                        selectOptionsValueField: "idAppUser"
                    },
                    {
                        headerName: "Status",
                        editable: true,
                        width: 100,
                        field: "seqPrepStatus",
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
        });

    }

    ngAfterViewInit() {
        let codes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
        for (let code of codes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this.barCodes.push(code);
        }

    }

    ngOnInit() {
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

    areAandBTagsUnique(): void {
        let dirtyItems: any[] = [];
        let sortedDirtyItems: any[] = [];

        for(let value of Array.from( this.changedRowMap.values()) ) {
            dirtyItems.push(value);
        }
        sortedDirtyItems = dirtyItems.sort((item1, item2) => {
            let n1: string = item1.sampleNumber;
            let n2:String = item2.sampleNumber;

            let parts: any[] = n1.split("X");
            let num1: string = parts[0];
            let rem1: string = parts[1];
            let firstChar1: string = num1.substr(0, 1);
            if ("0123456789".indexOf(firstChar1) >= 0) {
                firstChar1 = "0";
            } else {
                num1 = num1.substr(1);
            }

            parts = n2.split("X");
            let num2: string = parts[0];
            let rem2: string = parts[1];
            let firstChar2: string = num2.substr(0, 1);
            if ("0123456789".indexOf(firstChar2) >= 0) {
                firstChar2 = "0";
            } else {
                num2 = num2.substr(1);
            }

            let comp: number = LibprepWorkflowComponent.stringCompare(firstChar1, firstChar2);

            if (comp == 0) {
                let number1: number = Number(num1);
                let number2: number = Number(num2);
                if (number1 > number2) {
                    comp = 1;
                } else if (number2 > number1) {
                    comp = -1;
                }
            }

            if (comp == 0) {
                let remNum1: number = Number(rem1);
                let remNum2: number = Number(rem2);
                if (remNum1 > remNum2) {
                    comp = 1
                } else if (remNum2 > remNum1) {
                    comp = -1;
                }
            }

            return comp;

        });
        let requestsToCheck: Object = new Object();
        for (var item of sortedDirtyItems) {
            requestsToCheck[item.idRequest] = item;
        }
        let areUnique: boolean = true;
        let idRequest: string = "";
        let requestNumber: string = "";
        let multiplexGroupNumber: string = "";
        let barcodes: any[] = [];

        for (var idRequestToCheck of Object.keys(requestsToCheck)) {
            if (!areUnique) {
                break;
            }
            idRequest = idRequestToCheck;
            requestNumber = requestsToCheck[idRequestToCheck].requestNumber;
            multiplexGroupNumber = requestsToCheck[idRequestToCheck].multiplexGroupNumber;
            barcodes = [];
            for (var workItem of this.workItemList) {
                if ((idRequest === workItem.idRequest && multiplexGroupNumber === workItem.multiplexGroupNumber)) {
                    this.addBarcodes(workItem, barcodes);
                } else {
                    if (!this.checkBasePairs(barcodes)) {
                        areUnique = false;
                        break;
                    }
                    if (idRequest == workItem.idRequest && multiplexGroupNumber != workItem.multiplexGroupNumber) {
                        barcodes = [];
                        multiplexGroupNumber = workItem.multiplexGroupNumber;
                        this.addBarcodes(workItem, barcodes);
                    }
                }
            }
        }
        // do check for last request...
        if (!this.checkBasePairs(barcodes)) {
            areUnique = false;
        }
        if (areUnique == false) {
            this.dialogsService.confirm("Request " + requestNumber +
                " has samples in the same multiplex group whose barcodes do not differ by at least 3 base pairs."

                , "continue?").subscribe(answer => {
                if (answer) {
                    this.save();
                }
            });
        } else {
            this.save();
        }
    }

    private checkBasePairs(barcodes: any[]): boolean {
        for (var i: number = 0; i < barcodes.length; i++) {
            let sequenceOne: any[] = String(barcodes[i]).split("");
            for (var j: number = i + 1; j < barcodes.length; j++) {
                let sequenceTwo: any[] = String(barcodes[j]).split("");
                if (!LibprepWorkflowComponent.atLeastThreeUnique(sequenceOne, sequenceTwo)) {
                    return false;
                }
            }
        }
        return true;
    }

    private static atLeastThreeUnique(sequenceOne: any[], sequenceTwo: any[]): boolean {
        let uniqueBaseCount: number = 0;
        for (var i: number = 0; i < sequenceOne.length; i++) {
            if (sequenceOne[i] != sequenceTwo[i]) {
                uniqueBaseCount++;
            }
        }

        if (uniqueBaseCount >= 3) {
            return true;
        } else {
            return false;
        }
    }

    private static stringCompare(s1: string, s2:string): number {
        if (s1 > s2) {
            return 1;
        } else if (s2 > s1) {
            return -1;
        } else {
            return 0;
        }
    }

    private addBarcodes(workItem, barcodes: any[]):void {
        let barcodeA: string = this.dictionaryService.getEntry('hci.gnomex.model.OligoBarcode', workItem.idOligoBarcode).barcodeSequence;
        let barcodeB: string = this.dictionaryService.getEntry('hci.gnomex.model.OligoBarcode', workItem.idOligoBarcodeB).barcodeSequence;
        let barcodeSequence: string = barcodeA + barcodeB;
        if (barcodeSequence) {
            barcodes.push(barcodeSequence);
        }

    }

    save() {
        this.gridApi.stopEditing();
        setTimeout(() => {
            let params: URLSearchParams = new URLSearchParams();
            let workItems: any[] = [];
            for(let value of Array.from( this.changedRowMap.values()) ) {
                if(value.idLibPrepPerformedBy === '' && value.seqPrepStatus != '' && value.seqPrepStatus != "Terminated") {

                    this.dialogsService.confirm("Make sure all samples have a name selected in the 'Performed By' column before changing the status.\"", null);
                    return;
                }
                workItems.push(value);
            }
            params.set("workItemXMLString", JSON.stringify(workItems));
            this.showSpinner = true;
            this.workflowService.saveWorkItemSolexaPrep(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.changedRowMap = new Map<string, any>();
                this.dirty = false;
                this.workItem = "";
                this.initialize();
            });
        })
    }

    close() {
    }

    onClickLibPrep(event) {
        this.initialize();
    }

    refreshWorklist(event) {
        this.initialize();
    }

}
