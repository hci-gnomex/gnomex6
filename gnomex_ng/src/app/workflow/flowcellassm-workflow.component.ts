import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import { URLSearchParams } from "@angular/http";
import {MatAutocomplete, MatAutocompleteTrigger, MatDialog, MatDialogRef, MatOption} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridOptions} from "ag-grid";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {DialogsService} from "../util/popup/dialogs.service";
import {BarcodeSelectEditor} from "../util/grid-editors/barcode-select.editor";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {SeqlaneSelectEditor} from "../util/grid-editors/seqlane-select.editor";
import {DeleteSeqlaneDialogComponent} from "./delete-seqlane-dialog.component";

@Component({
    selector: 'flowcellassm-workflow',
    templateUrl: 'flowcellassm-workflow.html',
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
        mat-form-field.formField {
            width: 50%;
            margin: 0 0.5%;
        }

        .active-item {
            /*color: #636c72;*/
            background-color: #c8c8c8;
        }

        ::ng-deep split-gutter {
            background-color: white !important;
        }
    `]
})

export class FlowcellassmWorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild("autoProtocol") autoProtocolComplete: MatAutocomplete;
    @ViewChild("autoLab") autoLabComplete: MatAutocomplete;
    @ViewChild("labInput") labInput: ElementRef;

    private static readonly COLOR = '#f1eed6';
    private static readonly OFFCOLOR = 'white';
    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private sequenceProtocolsList: any[] = [];
    private cores: any[] = [];
    private changedRowMap: Map<string, any> = new Map<string, any>();
    private columnDefs;
    private emptyRequest = {requestNumber: ""};
    private dirty: boolean = false;
    private showSpinner: boolean = false;
    private workItem: any;
    private protocol: any;
    private selectedLab: any;
    private core: any;
    private previousProtocolMatOption: MatOption;
    private previousLabMatOption: MatOption;
    private gridApi;
    private gridColumnApi;
    private barCodes: any[] = [];
    private label = "Illumina Flow Cell Assembly";
    private searchText: string;
    private gridOptions:GridOptions = {};
    private lanes: any[] = [];
    private selectedSeqlanes: any[] = [];
    private deleteSeqlaneDialogRef: MatDialogRef<DeleteSeqlaneDialogComponent>;
    private emptyLab = {idLab: "0",
        name: ""};
    private labList: any[] = [];
    private previousId: string = "";
    private previousColor: string = "";

    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialog: MatDialog,
                private dictionaryService: DictionaryService) {

    }

    initialize() {
        let params: URLSearchParams = new URLSearchParams();
        params.set("codeStepNext", this.workflowService.ILLSEQ_CLUSTER_GEN);
        this.cores = [];
        this.workflowService.getWorkItemList(params).subscribe((response: any) => {
            if (response) {
                this.workItemList = response;
                if (!this.securityAdvisor.isArray(response)) {
                    this.workItemList = [response.Request];
                } else {
                    this.workItemList = response;
                }
                this.buildWorkItemList();
                this.workingWorkItemList = this.workItemList;
                this.columnDefs = [
                    {
                        headerName: "Select Lane #",
                        editable: true,
                        field: "seqLane",
                        width: 110,
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
                        cellEditorFramework: SeqlaneSelectEditor,
                        selectOptions: this.lanes,
                        selectOptionsDisplayField: "display",
                        selectOptionsValueField: "value",
                        showFillButton: true,
                        fillGroupAttribute: 'idRequest',
                        cellStyle: function(params) {
                            return {'font-size': '.70rem'};
                        }

                    },
                    {
                        headerName: "Experiment",
                        editable: false,
                        width: 100,
                        field: "number",
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
                        cellStyle: function(params) {
                            return {'font-size': '.70rem'};
                        }

                    },
                    {
                        headerName: "Index A",
                        editable: false,
                        width: 100,
                        field: "idOligoBarcode",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: BarcodeSelectEditor,
                        selectOptions: this.barCodes,
                        selectOptionsDisplayField: "display",
                        selectOptionsValueField: "idOligoBarcode",
                        indexTagLetter: 'A',
                        cellStyle: function(params) {
                            return {'font-size': '.70rem'};
                        }
                    },
                    {
                        headerName: "Index B",
                        editable: false,
                        width: 100,
                        field: "idOligoBarcodeB",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: BarcodeSelectEditor,
                        selectOptions: this.barCodes,
                        selectOptionsDisplayField: "display",
                        selectOptionsValueField: "idOligoBarcodeB",
                        indexTagLetter: 'B',
                        cellStyle: function(params) {
                            return {'font-size': '.70rem'};
                        }
                    },
                    {
                        headerName: "Library Protocol",
                        editable: false,
                        width: 275,
                        field: "idSeqRunType",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: SelectEditor,
                        selectOptions: this.sequenceProtocolsList,
                        selectOptionsDisplayField: "name",
                        selectOptionsValueField: "idSeqRunType",
                        showFillButton: true,
                        fillGroupAttribute: 'idRequest',
                        cellStyle: function(params) {
                            return {'font-size': '.70rem'};
                        }
                    },

                ];
            }
        });

    }

    buildWorkItemList() {
        let workItems: any[] = [];
        let first: boolean = true;
        for (let item of this.workItemList) {

            if (!this.securityAdvisor.isArray(item.MultiplexLane)) {
                item.MultiplexLane = [item.MultiplexLane];
            }
            for (let multiplex of item.MultiplexLane) {
                workItems = workItems.concat(multiplex.WorkItem);
            }
        }
        for (let lane of workItems) {
            if (first) {
                lane.backgroundColor = FlowcellassmWorkflowComponent.COLOR;
                first = false;
            } else {
                if (lane.idRequest === this.previousId) {
                    lane.backgroundColor = this.previousColor;
                } else {
                    if (this.previousColor === FlowcellassmWorkflowComponent.COLOR) {
                        lane.backgroundColor = FlowcellassmWorkflowComponent.OFFCOLOR;
                    } else {
                        lane.backgroundColor = FlowcellassmWorkflowComponent.COLOR;
                    }
                }
            }
            this.previousId = lane.idRequest;
            this.previousColor = lane.backgroundColor;
        }

        this.workItemList = workItems;
    }

    ngAfterViewInit() {
    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(proto =>
            (proto.codeRequestCategory ===  "HISEQ" || proto.codeRequestCategory === "MISEQ") && proto.isActive === 'Y'
            )
        let codes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
        for (let code of codes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this.barCodes.push(code);
        }
        this.labList.push(this.emptyLab);
        this.labList = this.labList.concat(this.gnomexService.labList);

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

    chooseFirstProtocolOption() {
        if (this.autoProtocolComplete.options.first) {
            this.autoProtocolComplete.options.first.select();
        }
    }

    chooseFirstLabOption() {
        if (this.autoLabComplete.options.first) {
            this.autoLabComplete.options.first.select();
        }
    }

    filterProtocols(selectedProto: any): any[] {
        let fProtocols: any[];
        if (selectedProto) {
            if(selectedProto.idSeqRunType){
                fProtocols = this.sequenceProtocolsList.filter(proto =>
                    proto.name.indexOf(selectedProto.name) >= 0);
                return fProtocols;

            }else{
                fProtocols = this.sequenceProtocolsList.filter(proto =>
                    proto.name.indexOf(selectedProto) >= 0);
                return fProtocols;
            }
        } else {
            return this.sequenceProtocolsList;
        }
    }

    filterLabList(selectedLab: any): any[] {
        let fLabs: any[];
        if (selectedLab) {
            if (selectedLab.idLab) {
                if (selectedLab.idLab === "0") {
                    this.initialize();
                    this.selectedLab = null;
                    this.labInput.nativeElement.blur();
                } else {
                    fLabs = this.labList.filter(lab =>
                        lab.name.toLowerCase().indexOf(selectedLab.name.toLowerCase()) >= 0);
                    return fLabs;
                }
            } else {
                fLabs = this.labList.filter(lab =>
                    lab.name.toLowerCase().indexOf(selectedLab.toLowerCase()) >= 0);
                return fLabs;
            }
        } else {
            return this.labList;
        }

    }

    selectedRow(event) {
        if(event.node.selected) {
            this.selectedSeqlanes.push(event.data);
        } else {
            this.selectedSeqlanes.forEach( (item, index) => {
                if(item === event.data) this.selectedSeqlanes.splice(index,1);
            });

        }
    }

    filterWorkItemsByLab() {
        this.workingWorkItemList = this.workingWorkItemList.filter(workItem =>
            workItem.idLab === this.selectedLab.idLab
        )
    }

    highlightFirstProtocolOption(event) {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.autoProtocolComplete.options.first) {
            if (this.previousProtocolMatOption) {
                this.previousProtocolMatOption.setInactiveStyles();
            }
            this.autoProtocolComplete.options.first.setActiveStyles();
            this.previousProtocolMatOption = this.autoProtocolComplete.options.first;
        }
    }

    highlightFirstLabOption(event) {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.autoLabComplete.options.first) {
            if (this.previousLabMatOption) {
                this.previousLabMatOption.setInactiveStyles();
            }
            this.autoLabComplete.options.first.setActiveStyles();
            this.previousLabMatOption = this.autoLabComplete.options.first;
        }
    }

    displayProto(proto) {
        return proto ? proto.name : proto;
    }

    displayLab(lab) {
        return lab ? lab.name : lab;
    }

    selectProtocolOption(event) {
        if (event.source.selected) {
            this.protocol = event.source.value;
            this.protocolFilter();
        }
    }

    selectLabOption(event) {
        if (event.source.selected) {
            this.selectedLab = event.source.value;
            this.filterWorkItemsByLab();
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
        this.gridOptions.getRowStyle = this.changeRowColor;

    }

    changeRowColor(params) {
        return {
            'background-color': params.data.backgroundColor
        };
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

    onClickFlowCellAssm(event) {
        this.initialize();
    }

    refreshWorklist(event) {
        this.initialize();
    }

    search() {
        this.gridOptions.api.setQuickFilter(this.searchText);
    }

    protocolFilter() {
        var ageFilterComponent = this.gridApi.getFilterInstance("idSeqRunType");
        ageFilterComponent.setModel({
            filter: this.protocol.idSeqRunType,
            type: "equals"
        });
        this.gridApi.onFilterChanged();
    }

    deleteWorkItem(event) {
        let seqLanes: string = "";
        let laneString: string = "";
        this.selectedSeqlanes.forEach((item => {
            seqLanes = seqLanes.concat(item.idWorkItem);
            seqLanes = seqLanes.concat(',');
            }
        ));
        seqLanes = seqLanes.substring(0, seqLanes.lastIndexOf(','));
        if (this.selectedSeqlanes.length === 1) {
            laneString = "lane";
        } else {
            laneString = "lanes";
        }
        this.deleteSeqlaneDialogRef = this.dialog.open(DeleteSeqlaneDialogComponent, {
            height: '12em',
            width: '22em',
            data: {
                seqLanes: seqLanes,
                laneLength: this.selectedSeqlanes.length,
                laneString: laneString
            }

        });
        this.deleteSeqlaneDialogRef.afterClosed()
            .subscribe(result => {
                if (this.deleteSeqlaneDialogRef.componentInstance.rebuildSeqlanes) {
                    this.initialize();
                }
            })

    }


}
