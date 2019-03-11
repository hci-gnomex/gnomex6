import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import { URLSearchParams } from "@angular/http";
import {MatAutocomplete, MatDialog, MatOption} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridOptions} from "ag-grid-community";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {DialogsService} from "../util/popup/dialogs.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {SeqlaneSelectEditor} from "../util/grid-editors/seqlane-select.editor";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FillLikeEditor} from "../util/grid-editors/filllike-select.editor";
import {HttpParams} from "@angular/common/http";
import {UtilService} from "../services/util.service";

@Component({
    selector: 'finalizeFlowCell-workflow',
    templateUrl: 'finalizeFlowCell-workflow.html',
    styles: [`
        .flex-column-container-workflow {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 100%;
            width: 100%;
        }
        .flex-column-container-outlet {
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
        .flex-row-container-itailic {
            display: flex;
            flex-direction: row;
            font-style: italic;
            color: #1601db;
        }
        .flex-row-container-margin {
            display: flex;
            flex-direction: row;
            margin-bottom: .5em;
            font-style: italic;
            color: #1601db;        
        }
        .normal-text {
            font-style: normal;
            color: black;
        }
        .flex-row-container-end {
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            margin-top: 1.2em;
        }
        .fill-flex-row {
            height: 10em;
            display: flex;
            flex-direction: row;
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

export class FinalizeWorkflowComponent implements OnInit, AfterViewInit {
    private workItemList: any[] = [];
    private assmItemList: any[] = [];
    private flowCellChannels: any[] = [];
    private workingWorkItemList: any[] = [];
    private sequenceProtocolsList: any[] = [];
    private filteredProtocolsList: any[] = [];
    private assmFlowCellNumber: number;
    private flowCellNumber: string;
    private flowCell: any;
    private idFlowCell: string;
    private codeSequencingPlatform: string;
    private pipelineProtoList: any[] = [];
    private instrumentList: any[] = [];
    private columnDefs;
    private assmColumnDefs;
    private showSpinner: boolean = false;
    private workItem: any;
    private gridApi;
    private gridColumnApi;
    private assmGridApi;
    private assmGridColumnApi;
    private label = "Illumina Finalize Flow Cell";
    private searchText: string;
    private gridOptions:GridOptions = {};
    private lanes: any[] = [];
    private selectedFlowCell: any[] = [];
    private emptyPipe = {idPipelineProtocol: "",
        protocol: ""};
    public assmGridRowClassRules: any;
    private selectedFlowcellRequestType: string;
    private flowCellRunFolder: string;
    private originalProtocol: any;
    private hideFCConcen: boolean = true;
    public allFG: FormGroup;
    public barcodeFC: FormControl;
    public runFC: FormControl;
    public createDateFC: FormControl;
    public instrumentFC: FormControl;
    public protocolFC: FormControl;
    public notes: string;

    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialog: MatDialog,
                private dictionaryService: DictionaryService) {
        this.barcodeFC = new FormControl("", Validators.required);
        this.runFC = new FormControl("", Validators.required);
        this.createDateFC = new FormControl("");
        this.instrumentFC = new FormControl("", Validators.required);
        this.protocolFC = new FormControl("", Validators.required);
        this.allFG = new FormGroup({
            barCode: this.barcodeFC,
            run: this.runFC,
            createDate: this.createDateFC,
            instrument: this.instrumentFC,
            protocol: this.protocolFC,

        });
    }

    initialize() {
        let params: HttpParams = new HttpParams();

        params = params.set("codeStepNext", this.workflowService.ILLSEQ_FINALIZE_FC);
        this.workflowService.getFlowCellList(params).subscribe((response: any) => {
            if (response) {
                this.workItemList = UtilService.getJsonArray(response, response.FlowCell);
                this.workingWorkItemList = this.workItemList;
                this.assmFlowCellNumber = this.workingWorkItemList.length;
                this.columnDefs = [
                    {
                        headerName: "Flow Cell",
                        editable: false,
                        width: 100,
                        field: "number",
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
                        cellStyle: function(params) {
                            return {'font-size': '.70rem'};
                        }
                    },
                    {
                        headerName: "Barcode",
                        editable: false,
                        width: 100,
                        field: "barcode",
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
                        cellStyle: function(params) {
                            return {'font-size': '.70rem'};
                        }

                    },
                    {
                        headerName: "Create Date",
                        editable: false,
                        width: 100,
                        field: "createDate",
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
                        cellStyle: function(params) {
                            return {'font-size': '.70rem'};
                        }

                    },
                    {
                        headerName: "Sequencing Protocol",
                        editable: false,
                        width: 275,
                        field: "idNumberSequencingCyclesAllowed",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: SelectEditor,
                        selectOptions: this.sequenceProtocolsList,
                        selectOptionsDisplayField: "name",
                        selectOptionsValueField: "idNumberSequencingCyclesAllowed",
                        showFillButton: true,
                        fillGroupAttribute: 'idRequest',
                        cellStyle: function(params) {
                            return {'font-size': '.70rem'};
                        }
                    },
                    {
                        headerName: "Content",
                        editable: false,
                        width: 130,
                        field: "notes",
                        cellRendererFramework: TextAlignLeftMiddleRenderer,
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

    onCellValueChanged(event) {
        for (let lane of this.assmItemList) {
            lane.flowCellChannelSampleConcentrationpM = event.data.flowCellChannelSampleConcentrationpM;
        }
        this.assmGridApi.redrawRows();
    }

    initializeAssm(): any[] {
        let columnDefs = [
            {
                headerName: "Experiment",
                editable: false,
                width: 90,
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
                width: 50,
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
                field: "seqADisplay",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellStyle: function(params) {
                    return {'font-size': '.70rem'};
                }

            },
            {
                headerName: "Index B",
                editable: false,
                width: 100,
                field: "seqBDisplay",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellStyle: function(params) {
                    return {'font-size': '.70rem'};
                }

            },
            {
                headerName: "Pipeline Protocol",
                editable: true,
                width: 120,
                field: "idPipelineProtocol",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: FillLikeEditor,
                selectOptions: this.pipelineProtoList,
                selectOptionsDisplayField: "protocol",
                selectOptionsValueField: "idPipelineProtocol",
                defaultDisplayField: "isDefault",
                defaultDisplayValue: "Y",
                fillLikeAttribute: "flowCellChannelNumber",
                cellStyle: function(params) {
                    return {'font-size': '.70rem'};
                }
            },
            {
                headerName: "Sequencing Protocol",
                editable: false,
                width: 255,
                field: "idNumberSequencingCyclesAllowed",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.filteredProtocolsList,
                selectOptionsDisplayField: "name",
                selectOptionsValueField: "idNumberSequencingCyclesAllowed",
                showFillButton: true,
                fillGroupAttribute: 'idRequest',
                cellStyle: function(params) {
                    return {'font-size': '.70rem'};
                }
            },
            {
                headerName: "Sample conc. pM",
                editable: true,
                width: 100,
                field: "flowCellChannelSampleConcentrationpM",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellStyle: function(params) {
                    return {'font-size': '.70rem'};
                }
            },

        ];
        return columnDefs;
    }

    ngAfterViewInit() {
    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(proto =>
            (proto.codeRequestCategory ===  "HISEQ" || proto.codeRequestCategory === "MISEQ" || proto.codeRequestCategory === "NOSEQ") && proto.isActive === 'Y'
        );
        this.instrumentList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.Instrument").filter(instrument =>
            instrument.isActive === 'Y'
        );
        this.pipelineProtoList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.PipelineProtocol");
        this.pipelineProtoList.push(this.emptyPipe);

    }

    selectedRow(event) {
        if(event.node.selected) {
            this.buildReqCatSeqLibs(event);
            this.selectedFlowCell = [];
            this.selectedFlowCell.push(event.data);
            this.setFinalizedForm(event);
        }
    }

    buildReqCatSeqLibs(event) {
        this.filteredProtocolsList = this.sequenceProtocolsList.filter(proto =>
            proto.codeRequestCategory === event.data.codeSequencingPlatform && proto.isActive === 'Y'
        );

    }

    setFinalizedForm(event) {
        this.codeSequencingPlatform = event.data.codeSequencingPlatform;
        this.flowCell = event.data;
        this.assmItemList = [];
        this.assmColumnDefs = [];
        this.assmGridApi.setRowData([]);
        this.flowCellNumber = event.data.number;
        this.idFlowCell = event.data.idFlowCell;
        this.notes = event.data.notes;
        this.barcodeFC.setValue(event.data.barcode);
        this.runFC.setValue(event.data.runNumber);
        this.createDateFC.setValue(event.data.createDate);
        this.instrumentFC.setValue(event.data.idInstrument);
        for (let instrument of this.instrumentList) {
            if (instrument.idInstrument === event.data.idInstrument) {
                this.instrumentFC.setValue(instrument);
                break;
            }
        }
        for (let proto of this.filteredProtocolsList) {
            if (proto.idNumberSequencingCyclesAllowed === event.data.idNumberSequencingCyclesAllowed) {
                this.protocolFC.setValue(proto);
                this.originalProtocol = proto;
                break;
            }
        }
        if (!this.securityAdvisor.isArray(event.data.flowCellChannels)) {
            this.flowCellChannels = [event.data.flowCellChannels.FlowCellChannel];
        } else {
            this.flowCellChannels = event.data.flowCellChannels;
        }
        for (let channel of this.flowCellChannels) {
            let seqLanes: any[] = [];
            if (!this.securityAdvisor.isArray(channel.sequenceLanes)) {
                seqLanes = [channel.sequenceLanes.SequenceLane];
            } else {
                seqLanes = channel.sequenceLanes;
            }
            this.assmItemList = this.assmItemList.concat(seqLanes);
        }
        for (let flow of this.assmItemList) {
            flow.seqADisplay = this.workflowService.lookupOligoBarcode(flow);
            flow.seqBdisplay = this.workflowService.lookupOligoBarcodeB(flow);
        }

        let showConc = this.gnomexService.getCoreFacilityProperty(this.flowCell.idCoreFacility, this.gnomexService.PROPERTY_SHOW_SAMPLE_CONC_PM);
        if (showConc === 'Y') {
            this.hideFCConcen = false;
        }
        let columnDefs = this.initializeAssm();
        this.assmColumnDefs = columnDefs;
        this.assmGridApi.setColumnDefs(columnDefs);


        this.assmGridApi.setRowData(this.assmItemList);

        this.refreshPipeline(this.assmItemList);
        this.createFlowCellFileName();
        this.touchFields();
        this.workflowService.assignBackgroundColor(this.assmItemList, "flowCellChannelNumber");
    }

    touchFields() {
        for (let field in this.allFG.controls) {
            const control = this.allFG.get(field);
            if (control) {
                if (control.valid === false) {
                    control.markAsTouched();
                }
            }
        }
    }

    refreshPipeline(nodes) {
        let defaultPipeline: any;
        for (let pipeline of this.pipelineProtoList) {
            if (pipeline.isDefault === 'Y') {
                defaultPipeline = pipeline;
            }
        }

        for (let node of nodes) {
            node.idPipelineProtocol = defaultPipeline.idPipelineProtocol;
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

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
        this.initialize();
    }

    onAssmGridReady(params) {
        this.assmGridApi = params.api;
        this.assmGridColumnApi = params.columnApi;
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
        return  {errorMessage: errorMessage, warningMessage: warningMessage, code: 1};
    }

    save() {
        this.gridApi.stopEditing();
        setTimeout(() => {
            let warningMessage: string = "";
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

    buildChannel(seqLane: any) {
        for (let channel of this.flowCellChannels) {
            if (!this.securityAdvisor.isArray(channel.sequenceLanes)) {
                channel.sequenceLanes = [channel.sequenceLanes.SequenceLane];
            }
            for (let seq of channel.sequenceLanes) {
                if (seq.idSequenceLane === seqLane.idSequenceLane) {
                    channel = seqLane;
                    return;
                }
            }
        }
    }

    saveWorkItems() {
        let params: HttpParams = new HttpParams().set("barcode" ,this.barcodeFC.value)
        .set("codeSequencingPlatform", this.codeSequencingPlatform)
        .set("createDate", WorkflowService.convertDate(this.createDateFC.value))
        .set("idCoreFacility", this.flowCell.idCoreFacility)
        .set("idFlowCell", this.flowCell.idFlowCell)
        .set("idInstrument", this.instrumentFC.value.idInstrument)
        .set("idNumberSequencingCycles", this.protocolFC.value.idNumberSequencingCycles)
        .set("idNumberSequencingCyclesAllowed", this.protocolFC.value.idNumberSequencingCyclesAllowed)
        .set("idSeqRunType", this.protocolFC.value.idSeqRunType)
        .set("notes", this.flowCell.notes)
        .set("number", this.flowCell.number)
        .set("numberSequencingCyclesActual", this.protocolFC.value.numberSequencingCyclesActual)
        .set("runFolder", this.flowCellRunFolder)
        .set("runNumber", this.runFC.value);
        for (let seqLane of this.assmItemList) {
            this.buildChannel(seqLane);
        }

        params = params.set("channelsXMLString", JSON.stringify(this.flowCellChannels));

        this.showSpinner = true;
        this.workflowService.saveFlowCell(params).subscribe((response: any) => {
            if (response.status === 200) {
                let responseJSON: any = response.json();
                if (responseJSON && responseJSON.result && responseJSON.result === "SUCCESS") {
                    this.allFG.markAsPristine();
                    if (!responseJSON.flowCellNumber) {
                        responseJSON.flowCellNumber = "";
                    }
                    this.dialogsService.confirm("Flowcell " + responseJSON.flowCellNumber + " created", null);
                    this.assmItemList = [];
                    this.initialize();
                } else {
                    let message: string = "";
                    if (responseJSON && responseJSON.message) {
                        message = ": " + responseJSON.message;
                    }
                    this.dialogsService.confirm("An error occurred while saving" + message, null);
                }
            } else {
                this.dialogsService.confirm("An error occurred while saving " + response.status, null);

            }
            this.showSpinner = false;
        });

    }

    refreshWorklist(event) {
        this.assmItemList = [];
        this.initialize();
    }

    search() {
        this.gridOptions.api.setQuickFilter(this.searchText);
    }

    deleteFlowCell(event) {
        this.dialogsService.confirm( "Delete Flow Cell "+this.selectedFlowCell[0].number, "Continue?").subscribe((answer: boolean) => {
            if (answer) {
                this.delete();
            }
        })

    }

    delete() {
        let params: HttpParams = new HttpParams().set("idFlowCell", this.flowCell.idFlowCell);

        this.showSpinner = true;
        this.workflowService.deleteFlowCell(params).subscribe((response: any) => {
            if (response && response.result && response.result === 'SUCCESS') {
                this.allFG.markAsPristine();
                if (!response.flowCellNumber) {
                    response.flowCellNumber = "";
                }
                this.dialogsService.confirm("Flowcell " + response.flowCellNumber + " deleted", null);
                this.assmItemList = [];
                this.initialize();
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.confirm("An error occurred while deleting" + message, null);
            }
            this.showSpinner = false;
        });
    }

    private validateIndexTags(): any {
        let warningMessage: string = "";
        let errorMessage: string = "";
        for (let channelNumber of this.lanes) {

            let i: string = channelNumber;
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
            for(let j: number = i+1; j < barcodes.length; j++){
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

    private createFlowCellFileName():void {
        let runFolder: string = '';
        if(this.barcodeFC.value.length > 0 && this.runFC.value.length > 0 && this.createDateFC.value && this.instrumentFC.value && this.protocolFC.value) {
            let cDate = new Date(this.createDateFC.value);
            let year: string = (cDate.getFullYear().toString()).substr(2,3);
            let month: string = (cDate.getMonth() + 1).toString();
            if(month.length == 1) { month = "0" + month; }
            let date: string =  cDate.getDate().toString();
            if(date.length == 1) { date = "0" + date; }
            runFolder += year + month + date;
            runFolder += "_";
            runFolder += this.instrumentFC.value.instrument;
            runFolder += "_";
            let runNumberPlus: number = Number(this.runFC.value) + 10000;
            runFolder += runNumberPlus.toString().substring(1,5);
            runFolder += "_";
            runFolder += this.barcodeFC.value;

        }
        if (this.originalProtocol && this.protocolFC.value.idNumberSequencingCyclesAllowed !== this.originalProtocol.value) {
            this.dialogsService.confirm("Changing the protocol for the flow cell will change the protocol for all the samples it contains.", null);
        }
        this.flowCellRunFolder = runFolder;
    }

}
