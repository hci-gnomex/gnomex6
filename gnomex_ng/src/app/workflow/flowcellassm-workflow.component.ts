import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import { URLSearchParams } from "@angular/http";
import {MatDialog, MatDialogRef} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridOptions, GridApi} from "ag-grid-community";
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
import {UserPreferencesService} from "../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {Subscription} from "rxjs";

@Component({
    selector: 'flowcellassm-workflow',
    templateUrl: 'flowcellassm-workflow.html',
    styles: [`
        mat-form-field.formField {
            width: 20%;
            margin: 0 0.5%;
        }
        mat-form-field.formField {
            width: 50%;
            margin: 0 0.5%;
        }
        .flex-row-container-margin {
            display: flex;
            flex-direction: row;
            margin-bottom: .5em;
            font-style: italic;
            color: #1601db;
        }
        .justify-label-left {
            justify-content: flex-end;
            margin-left: 10em;
            margin-top: .4em;
            color: black;
        }
        /* Needed to style split-gutter white */
        ::ng-deep split-gutter {
            background-color: white !important;
        }
    `]
})

export class FlowcellassmWorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild("labInput") labInput: ElementRef;

    private static readonly COLOR = '#f1eed6';
    private static readonly OFFCOLOR = 'white';
    private workItemList: any[] = [];
    private assmItemList: any[] = [];
    public workingWorkItemList: any[] = [];
    private sequenceProtocolsList: any[] = [];
    private filteredProtocolsList: any[] = [];
    private instrumentList: any[] = [];
    public columnDefs;
    public assmColumnDefs;
    private showSpinner: boolean = false;
    public selectedLab:FormControl;
    private gridApi:GridApi;
    private gridColumnApi;
    private assmGridApi:GridApi;
    private assmGridColumnApi;
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
    private selectedFlowcellRequestType: string;
    private firstSelectedFlowcellRequestType: boolean = true;
    public allFG: FormGroup;
    public barcodeFC: FormControl;
    public runFC: FormControl;
    public createDateFC: FormControl;
    public instrumentFC: FormControl;
    public protocolFC: FormControl;
    private labSubscription: Subscription;


    constructor(public workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialog: MatDialog,
                private dictionaryService: DictionaryService,
                public prefService: UserPreferencesService) {
        this.barcodeFC = new FormControl("");
        this.runFC = new FormControl("",Validators.pattern("^[0-9]*$"));
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
    }

    initialize() {
        this.dialogsService.startDefaultSpinnerDialog();
        let params: HttpParams = new HttpParams()
            .set("codeStepNext", this.workflowService.ILLSEQ_CLUSTER_GEN);
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

                ];
                this.gridApi.setColumnDefs(this.columnDefs);
                this.gridApi.sizeColumnsToFit();

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

                ];
                this.assmGridApi.setColumnDefs(this.assmColumnDefs);
                this.assmGridApi.sizeColumnsToFit();

            } else {
                this.workingWorkItemList = [];
            }
            this.dialogsService.stopAllSpinnerDialogs();
        },(err:IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
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
        this.workflowService.assignBackgroundColor(workItems, "idRequest");
        this.workItemList = workItems;
    }

    ngAfterViewInit() {
    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(proto =>
            proto.isActive === 'Y'
        );
        this.instrumentList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.Instrument").filter(instrument =>
            instrument.isActive === 'Y'
        );
        let codes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
        for (let code of codes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this.barCodes.push(code);
        }
        this.labList = this.labList.concat(this.gnomexService.labList);
        this.selectedLab = new FormControl('');
        this.labSubscription =  this.selectedLab.valueChanges.subscribe(val => {
            this.filterWorkItemsByLab();
        })

    }

    onDragEnd(event):void{
        this.gridApi.sizeColumnsToFit();
        this.assmGridApi.sizeColumnsToFit();
    }

    onSeqListSelection(event: any): void {
        if(!event){
            this.workingWorkItemList = this.workItemList.slice();
        }else{
            this.workingWorkItemList = this.workItemList.filter(workItem =>
                 workItem.idNumberSequencingCyclesAllowed === event.idNumberSequencingCyclesAllowed
            );
        }

    }


    selectedRow(event) {
        if(event.node.selected) {
            this.buildReqCatSeqLibs(event);
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

    buildReqCatSeqLibs(event) {
        this.filteredProtocolsList = this.sequenceProtocolsList.filter(proto =>
            proto.codeRequestCategory === event.data.codeRequestCategory && proto.isActive === 'Y'
        );

    }

    filterWorkItemsByLab() {
        this.workingWorkItemList = this.workItemList.filter(workItem =>
            workItem.idLab === this.selectedLab.value
        )
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
                for (let proto of this.filteredProtocolsList) {
                    if (proto.idNumberSequencingCyclesAllowed === event.data.idNumberSequencingCyclesAllowed) {
                        this.protocolFC.setValue(proto);
                        break;
                    }
                }


                this.assmItemList.push(event.data);
                this.assmItemList = this.assmItemList.sort(this.workflowService.sortSampleNumber);
                this.assmGridApi.setRowData(this.assmItemList);
                this.firstSelectedFlowcellRequestType = false;
                this.selectedFlowcellRequestType = event.data.codeRequestCategory;
                if (this.lanes.length === 0) {
                    this.buildLanes();
                }
                this.allFG.markAsDirty();
            }
        }
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
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
                this.dialogsService.confirm(warningMessage, " Continue saving?").subscribe((answer: boolean) => {
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
        let params: HttpParams = new HttpParams()
            .set("codeStepNext", this.workflowService.ILLSEQ_FINALIZE_FC)
            .set("flowCellDate", WorkflowService.convertDate(this.createDateFC.value))
            .set("idInstrument", this.instrumentFC.value ? this.instrumentFC.value.idInstrument : "")
            .set("idNumberSequencingCyclesAllowed", this.protocolFC.value ? this.protocolFC.value.idNumberSequencingCyclesAllowed : "")
            .set("idSeqRunType", this.protocolFC.value.idSeqRunType)
            .set("numberSequencingCyclesActual", this.protocolFC.value ? this.protocolFC.value.numberSequencingCyclesDisplay : "" )
            .set("runNumber", this.runFC.value)
            .set("flowCellBarcode", this.barcodeFC.value)
            .set("workItemXMLString", JSON.stringify(this.assmItemList));

        this.showSpinner = true;
        this.workflowService.saveWorkItemSolexaAssemble(params).subscribe((response: any) => {
            let responseJSON: any = response;
            if (responseJSON && responseJSON.result && responseJSON.result === "SUCCESS") {
                this.allFG.markAsPristine();
                if (!responseJSON.flowCellNumber) {
                    responseJSON.flowCellNumber = "";
                }
                this.dialogsService.confirm("Flowcell " + responseJSON.flowCellNumber + " created", null);
                this.assmItemList = [];
                this.initialize();
            }
            this.showSpinner = false;
        },(err:IGnomexErrorResponse) => {
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

    ngOnDestroy(){
        if(this.labSubscription){
            this.labSubscription.unsubscribe();
        }
    }

}
