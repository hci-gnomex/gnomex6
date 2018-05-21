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
import {FormControl, FormGroup, Validators} from "@angular/forms";

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
        /* Needed to style split-gutter white */
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
    private assmItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private sequenceProtocolsList: any[] = [];
    private instrumentList: any[] = [];
    private cores: any[] = [];
    private columnDefs;
    private assmColumnDefs;
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
    private assmGridApi;
    private assmGridColumnApi;
    private barCodes: any[] = [];
    private label = "Illumina Flow Cell Assembly";
    private searchText: string;
    private gridOptions:GridOptions = {};
    private assmGridOptions:GridOptions = {};
    private lanes: any[] = [];
    private selectedSeqlanes: any[] = [];
    private deleteSeqlaneDialogRef: MatDialogRef<DeleteSeqlaneDialogComponent>;
    private emptyLab = {idLab: "0",
        name: ""};
    private labList: any[] = [];
    private previousId: string = "";
    private previousColor: string = "";
    public assmGridRowClassRules: any;
    private selectedFlowcellRequestType: string;
    private firstSelectedFlowcellRequestType: boolean = true;
    public allFG: FormGroup;
    public barcodeFC: FormControl;
    public runFC: FormControl;
    public createDateFC: FormControl;
    public instrumentFC: FormControl;
    public protocolFC: FormControl;

    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialog: MatDialog,
                private dictionaryService: DictionaryService) {
        this.barcodeFC = new FormControl("");
        this.runFC = new FormControl("");
        this.createDateFC = new FormControl("");
        this.instrumentFC = new FormControl("");
        this.protocolFC = new FormControl("", Validators.required);
        this.allFG = new FormGroup({
            barCode: this.barcodeFC,
            run: this.runFC,
            createDate: this.createDateFC,
            instrument: this.instrumentFC,
            protocol: this.protocolFC,

        });
        this.assmGridRowClassRules = {
            "workFlowOnColor": "data.backgroundColor === 'ON' && !data.selected",
            "workFlowOffColor": "data.backgroundColor === 'OFF' && !data.selected",
            "workFlowSelectedColor": "data.selected",
        };

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
                        field: "flowCellChannelNumber",
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
                this.assmColumnDefs = [
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
                        headerName: "Lane",
                        editable: true,
                        field: "flowCellChannelNumber",
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
            } else {
                this.workingWorkItemList = [];
            }
        });

    }

    buildWorkItemList() {
        let workItems: any[] = [];

        for (let item of this.workItemList) {

            if (!this.securityAdvisor.isArray(item.MultiplexLane)) {
                item.MultiplexLane = [item.MultiplexLane];
            }
            for (let multiplex of item.MultiplexLane) {
                workItems = workItems.concat(multiplex.WorkItem);
            }
        }
        this.workflowService.assignBackgroundColor(workItems);
        this.workItemList = workItems;
    }

    ngAfterViewInit() {
    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(proto =>
            (proto.codeRequestCategory ===  "HISEQ" || proto.codeRequestCategory === "MISEQ") && proto.isActive === 'Y'
        );
        this.instrumentList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.Instrument").filter(instrument =>
            instrument.isActive === 'Y'
        );
        let codes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
        for (let code of codes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this.barCodes.push(code);
        }
        this.labList.push(this.emptyLab);
        this.labList = this.labList.concat(this.gnomexService.labList);

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
            event.data.selected = true;
            this.selectedSeqlanes.push(event.data);
        } else {
            event.data.selected = false;
            this.selectedSeqlanes.forEach( (item, index) => {
                if(item === event.data) this.selectedSeqlanes.splice(index,1);
            });

        }
        this.gridApi.redrawRows();
    }

    filterWorkItemsByLab() {
        this.workingWorkItemList = this.workingWorkItemList.filter(workItem =>
            workItem.idLab === this.selectedLab.idLab
        )
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

    displayLab(lab) {
        return lab ? lab.name : lab;
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

    buildLanes() {
        let requestCategory: any = this.dictionaryService.getEntry('hci.gnomex.model.RequestCategory', this.selectedFlowcellRequestType);
        let solexaFlowCellChannels: number = requestCategory.numberOfChannels;
        let rLanes: any[] = [];

        for (var i = 1; i <= solexaFlowCellChannels; i++) {
            let obj = {display: i.toString(), value: i};
            rLanes.push(obj);
        }
        this.lanes = rLanes;
    }

    onCellValueChanged(event) {
        if (this.assmItemList.filter(lane=>
            lane.laneNumber === event.data.laneNumber).length === 0) {
            if (!this.firstSelectedFlowcellRequestType && event.data.codeRequestCategory != this.selectedFlowcellRequestType) {
                this.dialogsService.confirm("Only one type of experiment can be assembled on a flow cell", null);
            } else {
                this.assmItemList.push(event.data);
                this.assmItemList = this.assmItemList.sort(this.workflowService.sortSampleNumber);
                this.assmGridApi.setRowData(this.assmItemList);
                this.firstSelectedFlowcellRequestType = false;
                this.selectedFlowcellRequestType = event.data.codeRequestCategory;
                if (this.lanes.length === 0) {
                    this.buildLanes();
                }
                this.dirty = true;
            }
        }
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
        this.initialize();
    }

    onAssmGridReady(params) {
        this.assmGridApi = params.api;
        this.assmGridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();

    }

    lanesHasFlowcellChannel(channelNumber: number): boolean {
        if (this.lanes.filter(lane=>
            lane === channelNumber).length === 0) {
            return false;
        } else {
            return true;
        }

    }

    private validateNumberOfLanes(): any {
        let tmp: any[] = this.lanes;
        let warningMessage: string = "";
        let errorMessage: string = "";
        this.assmItemList.forEach((item => {
            if (item.flowCellChannelNumber && this.lanesHasFlowcellChannel(item.flowCellChannelNumber)) {
                tmp.forEach( (lane, index) => {
                    if(lane === item.flowCellChannelNumber) tmp.splice(index,1);
                });
            }
        }));

        if (tmp.length > 0) {
            if(this.lanes.length > 1) {
                warningMessage = "Not all " + this.lanes.length + " lanes are populated.\n\n";
            } else {
                warningMessage = "The channel is not populated.\n\n";
            }
        }
        return  {errorMessage: errorMessage, warningMessage: warningMessage};

    }

    private validateProtocolAndLanes(): any {
        let warningMessage: string = "";
        let errorMessage: string = "";
        for (let wi of this.assmItemList) {
            if (wi.idNumberSequencingCyclesAllowed === '' || wi.idNumberSequencingCyclesAllowed == null) {
                errorMessage = "One or more samples have no sequencing protocol.  Please correct sequence lanes before continuing.";
            }
            if(wi.idNumberSequencingCyclesAllowed != this.protocolFC.value.idNumberSequencingCyclesAllowed) {
                warningMessage += "One or more samples have different protocols from the flow cell.\n\n";
                break;
            }
        }
        return  {errorMessage: errorMessage, warningMessage: warningMessage};
    }

    static convertDate(value: string): string  {
        if (value === "") {
            return value;
        }
        let date = new Date(value);
        return date.getMonth() + 1 + '/' + date.getDate() + '/' +  date.getFullYear()
    }

    save() {
        this.gridApi.stopEditing();
        setTimeout(() => {
            let errorMessage: string = "";
            let warningMessage: string = "";
            let message: string = "";
            let validProtoAndLanes = this.validateProtocolAndLanes();
            let validNumberOfLanes = this.validateNumberOfLanes();
            let validIndexTags = this.validateIndexTags();

            if (this.protocolFC.value === "") {
                this.dialogsService.confirm("Please choose a sequencing protocol for the flow cell.", null);
                return;
            }
            if (validProtoAndLanes.errorMessage) {
                this.dialogsService.confirm(validProtoAndLanes.errorMessage, null);
                return;
            }
            if (validProtoAndLanes.warningMessage) {
                warningMessage += validProtoAndLanes.warningMessage;
            }
            if (validNumberOfLanes.warningMessage) {
                warningMessage += validNumberOfLanes.warningMessage;
            }
            if (validIndexTags.warningMessage) {
                warningMessage += validIndexTags.warningMessage;
            }
            if (warningMessage) {
                this.dialogsService.confirm(warningMessage + " Continue saving?", " ").subscribe((answer: boolean) => {
                    if (answer) {
                        this.saveWorkItems();
                    }
                })
            } else {
                this.saveWorkItems();
            }
        })
    }

    saveWorkItems() {
        let params: URLSearchParams = new URLSearchParams();

        params.set("codeStepNext", this.workflowService.ILLSEQ_FINALIZE_FC);
        params.set("flowCellDate", FlowcellassmWorkflowComponent.convertDate(this.createDateFC.value));
        params.set("idInstrument", this.instrumentFC.value.idInstrument);
        params.set("idNumberSequencingCyclesAllowed", this.protocolFC.value.idNumberSequencingCyclesAllowed);
        params.set("idSeqRunType", this.protocolFC.value.idSeqRunType);
        params.set("numberSequencingCyclesActual", this.protocolFC.value.numberSequencingCyclesDisplay);
        params.set("runNumber", this.runFC.value);
        params.set("workItemXMLString", JSON.stringify(this.assmItemList));

        this.showSpinner = true;
        this.workflowService.saveWorkItemSolexaAssemble(params).subscribe((response: any) => {
            if (response.flowCellNumber) {
                this.showSpinner = false;
                setTimeout(() => {
                    this.allFG.markAsPristine();
                    this.assmItemList = [];
                    this.initialize();
                });
                this.dialogsService.confirm("Flowcell " + response.flowCellNumber + " created", null);
            }
        });

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

    private validateIndexTags(): any {
        let warningMessage: string = "";
        let errorMessage: string = "";
        for (let channelNumber of this.lanes) {

            var i: string = channelNumber;
            if (!this.areBarcodeSequenceTagsUnique(i)) {
                warningMessage += "Two or more samples in channel " + i + " do not differ by at least 3 base pairs.\n\n";
            }
        }
        return  {errorMessage: errorMessage, warningMessage: warningMessage};
    }

    private areBarcodeSequenceTagsUnique(flowCellChannelNumber: string): boolean {

        let barcodes: any[] = [];

        for (let wi of this.assmItemList) {
            if (wi.flowCellChannelNumber === flowCellChannelNumber) {
                let tag = wi.barcodeSequence + wi.barcodeSequenceB;
                if(tag !== null && tag !== ""){
                    barcodes.push(tag);
                }
            }
        }

        for(var i: number = 0; i < barcodes.length; i++){
            let sequenceOne: any[] = barcodes[i].split("");
            for(var j: number = i+1; j < barcodes.length; j++){
                let sequenceTwo: any[] = barcodes[j].split("");
                if(!this.atLeastThreeUnique(sequenceOne, sequenceTwo)){
                    return false;
                }
            }
        }
        return true;
    }

    private atLeastThreeUnique(sequenceOne: any[], sequenceTwo: any[]): boolean{
        let uniqueBaseCount: number = 0;
        for(var i: number = 0; i < sequenceOne.length; i++){
            if(sequenceOne[i] != sequenceTwo[i]){
                uniqueBaseCount++;
            }
        }
        return (uniqueBaseCount >= 3);
    }

}
