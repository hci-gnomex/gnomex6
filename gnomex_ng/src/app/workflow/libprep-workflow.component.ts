import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import {GnomexService} from "../services/gnomex.service";
import {GridApi, GridSizeChangedEvent} from "ag-grid-community";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {BarcodeSelectEditor} from "../util/grid-editors/barcode-select.editor";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {UtilService} from "../services/util.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'libprep-workflow',
    templateUrl: 'libprep-workflow.html',
    styles: [`
        .flex-row-container {
            display: flex;
            flex-direction: row;
        }
        .formField {
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
        
    `]
})

export class LibprepWorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild("requestInput") requestInput: ElementRef;
    @ViewChild("coreFacility") coreFacilityInput: ElementRef;

    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private coreIds: any[] = [];
    private requestIds: any[] = [];
    private seqLibProtocols: any[] = [];
    //private coreFacilityAppMap: Map<string, any[]> = new Map<string, any[]>();
    private changedRowMap: Map<string, any> = new Map<string, any>();
    private columnDefs;
    private emptyRequest = {requestNumber: ""};
    private dirty: boolean = false;
    private showSpinner: boolean = false;
    private workItem: any;
    private gridApi: GridApi;
    private gridColumnApi;
    private barCodes: any[] = [];
    private coreAdmins: any[] = [];
    private label = "Illumina Library Prep";
    public codeStepNext: string = "";
    private preCodeStepNext: string = "";
    // left to have nova, hi, mi until we phase them out
    public readonly codeStepArray: any[] = [
        { label: "Illumina Seq ", codeStepNext: this.workflowService.ILLSEQ_PREP  },
        { label: "Illumina NovaSeq", codeStepNext: this.workflowService.NOSEQ_PREP },
        { label: "Illumina HiSeq", codeStepNext: this.workflowService.HSEQ_PREP },
        { label: "Illumina MiSeq", codeStepNext: this.workflowService.MISEQ_PREP}
    ];

    public allRequestCategories: any[] = [];


    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService) {

    }

    ngOnInit(): void {
        let codes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
        for (let code of codes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this.barCodes.push(code);
        }

        this.allRequestCategories = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
    }

    initialize() {
        this.dialogsService.startDefaultSpinnerDialog();
        if(!this.codeStepNext) {
            this.codeStepNext = this.workflowService.ALL_PREP;
        }
        this.preCodeStepNext = this.codeStepNext;
        this.workItem = "";
        let params: HttpParams = new HttpParams()
            .set("codeStepNext", this.codeStepNext);

        let params3: HttpParams = new HttpParams()
            .set("idCoreFacility", this.gnomexService.idCoreFacilityHTG);
        this.workflowService.getCoreAdmins(params3).subscribe((response: any[]) => {
            this.coreAdmins = response;


            this.workflowService.getWorkItemList(params).subscribe((response: any) => {
                this.workItemList = response ? UtilService.getJsonArray(response, response.WorkItem) : [];
                this.workingWorkItemList = this.workItemList;

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
                        selectOptionsPerRowFilterFunction: (context, rowData, option) => {

                            if (context
                                && context.allRequestCategories
                                && rowData
                                && option) {

                                // specifically allow the extra blank row through the filter
                                if (!option.idCoreFacility && !option.display) {
                                    return true;
                                }

                                let tempSamplesRequestCategories: any[] = context.allRequestCategories.filter((value: any) => {
                                    return rowData.codeRequestCategory === value.codeRequestCategory;
                                });

                                for (let requestCategory of tempSamplesRequestCategories) {
                                    if (requestCategory.idCoreFacility
                                        && requestCategory.idCoreFacility === option.idCoreFacility) {

                                        return true;
                                    }
                                }

                                return false;
                            }

                            return true;
                        },
                        selectOptionsDisplayField: "display",
                        selectOptionsValueField: "idSeqLibProtocol",
                        showFillButton: true,
                        fillGroupAttribute: 'idRequest',
                        context: this
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
                        selectOptionsValueField: "idAppUser",
                        showFillButton: true,
                        fillGroupAttribute: 'idRequest'
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

                this.gridApi.setColumnDefs(this.columnDefs);
                this.gridApi.sizeColumnsToFit();

                this.requestIds = Array.from(this.workingWorkItemList.reduce((m, t) => m.set(t.requestNumber, t), new Map()).values());
                this.requestIds.unshift(this.emptyRequest);
                this.dialogsService.stopAllSpinnerDialogs();
            }, (err:IGnomexErrorResponse) => {
                this.dialogsService.stopAllSpinnerDialogs();
            });
        }, (err:IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });

    }

    ngAfterViewInit() {
    }



    compareByID(rc1,rc2) {
        return rc1 && rc2 && rc1.codeNextStep == rc2.codeNextStep;
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
    }

    selectCodeOption() {
        if(!this.codeStepNext) {
            this.codeStepNext = this.workflowService.ALL_PREP;
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
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.initialize();
    }

    onGridSizeChanged(event: GridSizeChangedEvent) {
        event.api.sizeColumnsToFit();
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
            for (let workItem of this.workItemList) {
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
                + "<br> continue?").subscribe(answer => {
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

        return (uniqueBaseCount >= 3);
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
            let params: HttpParams = new HttpParams();
            let workItems: any[] = [];
            for(let value of Array.from( this.changedRowMap.values()) ) {
                if(value.idLibPrepPerformedBy === '' && value.seqPrepStatus != '' && value.seqPrepStatus != "Terminated") {

                    this.dialogsService.alert("Make sure all samples have a name selected in the 'Performed By' column before changing the status.\"", null, DialogType.VALIDATION);
                    return;
                }
                workItems.push(value);
            }
            params = params.set("workItemXMLString", JSON.stringify(workItems));
            this.showSpinner = true;
            this.workflowService.saveWorkItemSolexaPrep(params).subscribe((response: Response) => {
                this.showSpinner = false;
                this.changedRowMap = new Map<string, any>();
                this.dirty = false;
                this.workItem = "";
                this.initialize();
            },(err:IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        })
    }

    refreshWorklist(event) {
        this.initialize();
    }

}
