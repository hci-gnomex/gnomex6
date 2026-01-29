import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {WorkflowService} from "../services/workflow.service";
import {MatDialog} from "@angular/material";
import {GnomexService} from "../services/gnomex.service";
import {GridApi, GridSizeChangedEvent} from "ag-grid-community";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {SeqlaneSelectEditor} from "../util/grid-editors/seqlane-select.editor";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FillLikeEditor} from "../util/grid-editors/filllike-select.editor";
import {HttpParams} from "@angular/common/http";
import {UtilService} from "../services/util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {DateParserComponent} from "../util/parsers/date-parser.component";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

@Component({
    selector: 'finalize-workflow',
    templateUrl: 'finalize-workflow.component.html',
    styles: [`
        
        
        .title-color { color: #1601db; }
        

        .date-width {
            width: 10em;
        }

        .protocol-width {
            width: 30em;
        }

        .run-width {
            width: 5em;
        }

        .min-lab-width {
            min-width: 3em;
        }
        .children-margin-right > *:not(:last-child) {
            margin-right: 1em;
        }
        

    `]
})
export class FinalizeWorkflowComponent implements OnInit, AfterViewInit {

    @ViewChild("growToMatch")   growToMatch:   ElementRef;
    @ViewChild("heightToMatch") heightToMatch: ElementRef;
    @ViewChild('oneEmWidth1') oneEmWidth1: ElementRef;
    @ViewChild('oneEmWidth2') oneEmWidth2: ElementRef;

    private emToPxConversionRate1: number = 13;
    private emToPxConversionRate2: number = 13;

    private label = "Illumina Finalize Flow Cell";


    private get detailColumnDefs(): any[] {
        let results: any[] = [];

        results.push({
            headerName: "Experiment",
            editable: false,
            width: 1,
            minWidth: 6 * this.emToPxConversionRate2,
            field: "number",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellStyle: UtilService.shrinkCellText
        });
        results.push({
            headerName: "Lane",
            editable: false,
            field: "flowCellChannelNumber",
            width: 1,
            minWidth: 3 * this.emToPxConversionRate2,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: SeqlaneSelectEditor,
            selectOptions: this.lanes,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            showFillButton: true,
            fillGroupAttribute: 'idRequest',
            cellStyle: UtilService.shrinkCellText
        });
        results.push({
            headerName: "Index A",
            editable: false,
            width: 300,
            minWidth: 8 * this.emToPxConversionRate2,
            field: "seqADisplay",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellStyle: UtilService.shrinkCellText
        });
        results.push({
            headerName: "Index B",
            editable: false,
            width: 300,
            minWidth: 8 * this.emToPxConversionRate2,
            field: "seqBDisplay",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellStyle: UtilService.shrinkCellText
        });
        results.push({
            headerName: "Pipeline Protocol",
            editable: true,
            width: 1,
            minWidth: 14 * this.emToPxConversionRate2,
            field: "idPipelineProtocol",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: FillLikeEditor,
            selectOptions: this.pipelineProtoList,
            selectOptionsDisplayField: "protocol",
            selectOptionsValueField: "idPipelineProtocol",
            defaultDisplayField: "isDefault",
            defaultDisplayValue: "Y",
            fillLikeAttribute: "flowCellChannelNumber",
            cellStyle: UtilService.shrinkCellText
        });
        results.push({
            headerName: "Sequencing Protocol",
            editable: false,
            width: 500,
            minWidth: 10 * this.emToPxConversionRate2,
            field: "idNumberSequencingCyclesAllowed",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.filteredProtocolsList,
            selectOptionsDisplayField: "name",
            selectOptionsValueField: "idNumberSequencingCyclesAllowed",
            showFillButton: true,
            fillGroupAttribute: 'idRequest',
            cellStyle: UtilService.shrinkCellText
        });
        results.push({
            headerName: "Sample conc. pM",
            editable: true,
            width: 1,
            minWidth: 7 * this.emToPxConversionRate2,
            field: "flowCellChannelSampleConcentrationpM",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellStyle: UtilService.shrinkCellText
        });

        return results;
    }

    private get selectionColumnDefs(): any[] {
        let results: any[] = [];

        results.push({
            headerName: "Flow Cell",
            editable: false,
            width: 1,
            minWidth: 4.5 * this.emToPxConversionRate1,
            field: "number",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellStyle: UtilService.shrinkCellText
        });
        results.push({
            headerName: "Barcode",
            editable: false,
            width: 1,
            minWidth: 10 * this.emToPxConversionRate1,
            field: "barcode",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellStyle: UtilService.shrinkCellText
        });
        results.push({
            headerName: "Create Date",
            editable: false,
            width: 1,
            minWidth: 6 * this.emToPxConversionRate1,
            field: "createDate",
            cellRendererFramework: DateRenderer,
            dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
            cellStyle: UtilService.shrinkCellText
        });
        results.push({
            headerName: "Sequencing Protocol",
            editable: false,
            width: 500,
            minWidth: 12 * this.emToPxConversionRate1,
            field: "idNumberSequencingCyclesAllowed",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.sequenceProtocolsList,
            selectOptionsDisplayField: "name",
            selectOptionsValueField: "idNumberSequencingCyclesAllowed",
            showFillButton: true,
            fillGroupAttribute: 'idRequest',
            cellStyle: UtilService.shrinkCellText
        });
        results.push({
            headerName: "Content",
            editable: false,
            width: 200,
            minWidth: 6 * this.emToPxConversionRate1,
            field: "notes",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellStyle: UtilService.shrinkCellText
        });

        return results;
    }


    public assmItemList: any[] = [];
    public filteredProtocolsList: any[] = [];
    public instrumentList: any[] = [];
    public selectedFlowCells: any[] = [];

    private flowCellChannels: any[] = [];
    private lanes: any[] = [];
    private sequenceProtocolsList: any[] = [];
    private workItemList: any[] = [];
    private workingWorkItemList: any[] = [];
    private pipelineProtoList: any[] = [];

    private flowCell: any;
    private originalProtocol: any;

    private assmFlowCellNumber: number;

    // private hideFCConcen: boolean = true;
    private showSpinner: boolean = false;

    private codeSequencingPlatform: string;
    private flowCellNumber: string;
    private flowCellRunFolder: string;
    private idFlowCell: string;

    private selectionGridApi: GridApi;
    private detailGridApi: GridApi;

    public allFG: FormGroup;

    public barcodeFC:    FormControl;
    public runFC:        FormControl;
    public createDateFC: FormControl;
    public instrumentFC: FormControl;
    public protocolFC:   FormControl;
    public sideFC: FormControl;


    constructor(public workflowService: WorkflowService,
                private dialog: MatDialog,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private securityAdvisor: CreateSecurityAdvisorService) {

        this.barcodeFC    = new FormControl("", Validators.required);
        this.runFC        = new FormControl("", [Validators.required, Validators.pattern("^[0-9]*$") ]);
        this.createDateFC = new FormControl("");
        this.instrumentFC = new FormControl("", Validators.required);
        this.protocolFC   = new FormControl("", Validators.required);
        this.sideFC       = new FormControl();

        this.allFG = new FormGroup({
            barCode:    this.barcodeFC,
            run:        this.runFC,
            createDate: this.createDateFC,
            instrument: this.instrumentFC,
            protocol:   this.protocolFC,
            side:       this.sideFC
        });

    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.NUMBER_SEQUENCING_CYCLES_ALLOWED).filter((proto) => {
            return proto.isActive === 'Y'
                && (proto.codeRequestCategory ===  "HISEQ"
                    || proto.codeRequestCategory === "MISEQ"
                    || proto.codeRequestCategory === "NOSEQ"
                    || proto.codeRequestCategory === "ILLSEQ");
        });

        this.instrumentList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.INSTRUMENT).filter((instrument) => {
            return instrument.isActive === 'Y';
        });

        this.pipelineProtoList = [];
        this.pipelineProtoList.push({
            idPipelineProtocol: "",
            protocol: ""
        });
        this.pipelineProtoList = this.pipelineProtoList.concat(this.dictionaryService.getEntriesExcludeBlank(DictionaryService.PIPELINE_PROTOCOL));
    }


    ngAfterViewInit(): void {
        this.matchGridHeights();
    }


    private initialize(): void {
        this.dialogsService.startDefaultSpinnerDialog();
        this.sideFC.disable();
        this.selectedFlowCells = [];
        this.assmFlowCellNumber = 0;
        this.flowCellNumber = "";
        this.assmItemList = [];
        this.originalProtocol = "";
        this.flowCellRunFolder = "";
        this.allFG.reset();
        this.allFG.markAsPristine();

        let temp: string = this.workflowService.ILLSEQ_FINALIZE_FC + ','
            + this.workflowService.NOSEQ_FINALIZE_FC + ','
            + this.workflowService.HISEQ_FINALIZE_FC + ','
            + this.workflowService.MISEQ_FINALIZE_FC;

        let params: HttpParams = new HttpParams().set("codeStepNext", temp);

        this.workflowService.getFlowCellList(params).subscribe((response: any) => {
            if (response) {
                this.workItemList = UtilService.getJsonArray(response, response.FlowCell);
                this.workingWorkItemList = this.workItemList;
                this.assmFlowCellNumber = this.workingWorkItemList.length;

                this.selectionGridApi.setColumnDefs(this.selectionColumnDefs);
                this.selectionGridApi.sizeColumnsToFit();
            } else {
                this.workingWorkItemList = [];
            }

            this.dialogsService.stopAllSpinnerDialogs();
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    public onCellValueChanged(event): void {
        for (let lane of this.assmItemList) {
            lane.flowCellChannelSampleConcentrationpM = event.data.flowCellChannelSampleConcentrationpM;
        }

        this.detailGridApi.redrawRows();
    }


    public onRowSelected(event): void {
        if(event
            && event.node
            && event.node.selected) {
            this.originalProtocol = "";
            this.filteredProtocolsList = this.sequenceProtocolsList.filter((proto) => {
                return proto.codeRequestCategory === event.data.codeSequencingPlatform && proto.isActive === 'Y';
            });

            this.selectedFlowCells = [];
            this.selectedFlowCells.push(event.data);
            this.setFinalizedForm(event);
            this.originalProtocol = event.data.idNumberSequencingCyclesAllowed;
        }
    }

    private setFinalizedForm(event): void {

        this.codeSequencingPlatform = event.data.codeSequencingPlatform;
        this.flowCell = event.data;
        this.assmItemList = [];
        this.flowCellNumber = event.data.number;
        this.idFlowCell = event.data.idFlowCell;
        // this.notes = event.data.notes;
        this.barcodeFC.setValue(event.data.barcode);
        this.runFC.setValue(event.data.runNumber);
        this.createDateFC.setValue(event.data.createDate);
        this.sideFC.setValue(event.data.side);
        this.instrumentFC.setValue(event.data.idInstrument);
        this.protocolFC.setValue(event.data.idNumberSequencingCyclesAllowed);



        this.detailGridApi.setRowData([]);

        UtilService.markChildrenAsTouched(this.allFG);

        this.flowCellChannels = UtilService.getJsonArray(event.data.flowCellChannels, event.data.flowCellChannels.FlowCellChannel);

        for (let channel of this.flowCellChannels) {
            let seqLanes: any[] = UtilService.getJsonArray(channel.sequenceLanes, channel.sequenceLanes.SequenceLane);
            this.assmItemList = this.assmItemList.concat(seqLanes);
        }
        for (let flow of this.assmItemList) {
            flow.seqADisplay = this.workflowService.lookupOligoBarcode(flow);
            flow.seqBDisplay = this.workflowService.lookupOligoBarcodeB(flow);
        }

        if(this.assmItemList.length > 0 ){
            let firstFC : any  = this.assmItemList[0];
            let reqCat:string = firstFC.codeRequestCategory;
            let seqProtocolId = firstFC.idNumberSequencingCyclesAllowed;

            let foundProtocol = this.filteredProtocolsList.find(p => (p.idNumberSequencingCyclesAllowed === seqProtocolId  ));
            let foundProtocolName:string = foundProtocol && foundProtocol.name ?  (<string>foundProtocol.name).toUpperCase() : '';

            if(reqCat === 'MISEQ' || foundProtocolName.indexOf("MISEQ") != -1 ){
                this.sideFC.setValue(null);
                this.sideFC.disable();
                this.sideFC.clearValidators();
                this.sideFC.updateValueAndValidity();
            }else{
                this.sideFC.enable();
                this.sideFC.setValidators(Validators.required);
                this.sideFC.updateValueAndValidity();
            }
        }else{
            this.sideFC.setValue(null);
            this.sideFC.disable();
            this.sideFC.clearValidators();
            this.sideFC.updateValueAndValidity();
        }

        // let showConc = this.gnomexService.getCoreFacilityProperty(this.flowCell.idCoreFacility, this.gnomexService.PROPERTY_SHOW_SAMPLE_CONC_PM);
        // if (showConc === 'Y') {
        //     this.hideFCConcen = false;
        // }

        this.detailGridApi.setColumnDefs(this.detailColumnDefs);
        this.detailGridApi.setRowData(this.assmItemList);
        this.detailGridApi.sizeColumnsToFit();

        this.refreshPipeline(this.assmItemList);
        //this.createFlowCellFileName();
        this.touchFields();

        this.workflowService.assignBackgroundColor(this.assmItemList, "flowCellChannelNumber");
    }

    private touchFields(): void {
        for (let field in this.allFG.controls) {
            const control = this.allFG.get(field);

            if (control && control.valid === false) {
                control.markAsTouched();
            }
        }
    }

    private refreshPipeline(nodes): void {
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

    public onNotifyGridRowDataChanged(event: any) {
        if (event && event.api) {
            event.api.hideOverlay();
        }
    }

    public onSelectionGridReady(params): void {
        if (this.oneEmWidth1 && this.oneEmWidth1.nativeElement) {
            this.emToPxConversionRate1 = this.oneEmWidth1.nativeElement.offsetWidth;
        }

        if (params) {
            this.selectionGridApi = params.api;

            this.selectionGridApi.setColumnDefs(this.detailColumnDefs);
            this.selectionGridApi.sizeColumnsToFit();
        }

        this.initialize();
    }

    public onDetailGridReady(event: any): void {
        if (this.oneEmWidth2 && this.oneEmWidth2.nativeElement) {
            this.emToPxConversionRate2 = this.oneEmWidth2.nativeElement.offsetWidth;
        }

        if (event) {
            this.detailGridApi = event.api;

            this.detailGridApi.setColumnDefs(this.detailColumnDefs);
            this.detailGridApi.sizeColumnsToFit();
        }
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        if (this.oneEmWidth1 && this.oneEmWidth1.nativeElement) {
            this.emToPxConversionRate1 = this.oneEmWidth1.nativeElement.offsetWidth;
        }
        if (this.oneEmWidth2 && this.oneEmWidth2.nativeElement) {
            this.emToPxConversionRate2 = this.oneEmWidth2.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }

    private lanesHasFlowcellChannel(channelNumber: number): boolean {
        return this.lanes.filter((lane) => { return lane === channelNumber; }).length !== 0;
    }

    private validateNumberOfLanes(): any {
        let tmp: any[] = this.lanes;
        let warningMessage: string = "";
        let errorMessage: string = "";
        this.assmItemList.forEach((item => {
            if (item.flowCellChannelNumber && this.lanesHasFlowcellChannel(item.flowCellChannelNumber)) {
                tmp.forEach((lane, index) => {
                    if(lane === item.flowCellChannelNumber) {
                        tmp.splice(index, 1);
                    }
                });
            }
        }));

        if (tmp.length > 0) {
            if(this.lanes.length > 1) {
                warningMessage = "Not all " + this.lanes.length + " lanes are populated.\n\n";
            } else {
                warningMessage = "The lane is not populated.\n\n";
            }
        }

        return  {
            errorMessage: errorMessage,
            warningMessage: warningMessage
        };
    }



    private validateProtocolAndLanes(): any {
        let warningMessage: string = "";
        let errorMessage: string = "";
        let assmItemProtocolSet: Set<string> = new Set<string>();

        let fcProtocol = this.sequenceProtocolsList.find(seqProto => {
            return seqProto.idNumberSequencingCyclesAllowed === this.protocolFC.value;
        });

        if(!fcProtocol || !fcProtocol.name){
            return {
                errorMessage: "Please select a protocol for the flow cell",
                warningMessage: ""
            };
        }
        assmItemProtocolSet.add(fcProtocol.name);

        for (let wi of this.assmItemList) {
            if (wi.idNumberSequencingCyclesAllowed === '' || wi.idNumberSequencingCyclesAllowed == null) {
                errorMessage = "One or more samples have no sequencing protocol.  Please correct sequence lanes before continuing.";
                break;
            }
            let filteredSeqProtocol = this.sequenceProtocolsList.find(seqProto => {
                return seqProto.idNumberSequencingCyclesAllowed === wi.idNumberSequencingCyclesAllowed;
            });
            if(!filteredSeqProtocol || !assmItemProtocolSet.has(filteredSeqProtocol.name)) {
                warningMessage += "One or more samples have different protocols from the flow cell.\n\n";
                break;
            }
        }

        return  {
            errorMessage: errorMessage,
            warningMessage: warningMessage,
            code: 1
        };
    }

    public save(): void {
        this.selectionGridApi.stopEditing();

        setTimeout(() => {
            let warningMessage: string = "";
            let validProtoAndLanes = this.validateProtocolAndLanes();
            let validNumberOfLanes = this.validateNumberOfLanes();
            let validIndexTags = this.validateIndexTags();

            if (this.protocolFC.value === "") {
                this.dialogsService.alert("Please choose a sequencing protocol for the flow cell.", null, DialogType.FAILED);
                return;
            }
            if (validProtoAndLanes.errorMessage) {
                this.dialogsService.alert(validProtoAndLanes.errorMessage, null, DialogType.VALIDATION);
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
                this.dialogsService.confirm(warningMessage + "<br>Continue saving?").subscribe((answer: boolean) => {
                    if (answer) {
                        this.saveWorkItems();
                    }
                });
            } else {
                this.saveWorkItems();
            }
        });
    }

    private buildChannel(seqLane: any): void {
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

    private saveWorkItems(): void {
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()}).set("barcode" ,this.barcodeFC.value)
            .set("codeSequencingPlatform", this.codeSequencingPlatform)
            .set("createDate", WorkflowService.convertDate(this.createDateFC.value))
            .set("idCoreFacility", this.flowCell.idCoreFacility)
            .set("idFlowCell", this.flowCell.idFlowCell)
            .set("idInstrument", this.instrumentFC.value ? this.instrumentFC.value : "")
            .set("idNumberSequencingCyclesAllowed", this.protocolFC.value ? this.protocolFC.value : "")
            .set("notes", this.flowCell.notes)
            .set("number", this.flowCell.number)
            .set("runFolder", this.flowCellRunFolder)
            .set("runNumber", this.runFC.value)
            .set("side", this.sideFC.value ? this.sideFC.value : '')
            .set("noJSONToXMLConversionNeeded", "Y");
        for (let seqLane of this.assmItemList) {
            this.buildChannel(seqLane);
        }


        let protocolObj =  this.filteredProtocolsList.find(p => (p.idNumberSequencingCyclesAllowed === this.protocolFC.value));
        params = params.set("numberSequencingCyclesActual", protocolObj ? protocolObj.numberSequencingCyclesDisplay : "" );
        params = params.set("idSeqRunType", protocolObj ?  protocolObj.idSeqRunType : "");
        params = params.set("idNumberSequencingCycles", protocolObj ?  protocolObj.idNumberSequencingCycles : "");


        params = params.set("channelsJSONString", JSON.stringify(this.flowCellChannels));

        this.showSpinner = true;
        this.workflowService.saveFlowCell(params).subscribe((response: any) => {
            if (!response.flowCellNumber) {
                response.flowCellNumber = "";
            }
            this.dialogsService.alert("Flowcell " + response.flowCellNumber + " created", null, DialogType.SUCCESS);

            this.initialize();

            this.showSpinner = false;
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    public refreshWorkItemList(): void {
        this.initialize();
    }

    public onClickDeleteFlowCell(event): void {
        let message: string = "Delete Flow Cell " + this.selectedFlowCells[0].number + ". <br> Continue?";

        this.dialogsService.confirm(message).subscribe((answer: boolean) => {
            if (answer) {
                this.delete();
            }
        });
    }

    private delete(): void {
        this.showSpinner = true;

        let params: HttpParams = new HttpParams().set("idFlowCell", this.flowCell.idFlowCell);

        this.workflowService.deleteFlowCell(params).subscribe((response: any) => {
            if (response && response.result && response.result === 'SUCCESS') {
                if (!response.flowCellNumber) {
                    response.flowCellNumber = "";
                }
                this.dialogsService.alert("Flowcell " + response.flowCellNumber + " deleted", null, DialogType.SUCCESS);
                this.initialize();
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.error("An error occurred while deleting" + message);
            }
            this.showSpinner = false;
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    private validateIndexTags(): any {
        let warningMessage: string = "";
        let errorMessage: string = "";

        for (let channelNumber of this.lanes) {
            let i: string = channelNumber;

            if (!this.areBarcodeSequenceTagsUnique(i)) {
                warningMessage += "Two or more samples in lane " + i + " do not differ by at least 3 base pairs.\n\n";
            }
        }

        return {
            errorMessage: errorMessage,
            warningMessage: warningMessage
        };
    }

    private areBarcodeSequenceTagsUnique(flowCellChannelNumber: string): boolean {

        let barcodes: any[] = [];

        for (let wi of this.assmItemList) {
            if (wi.flowCellChannelNumber === flowCellChannelNumber) {
                let tag = wi.barcodeSequence + wi.barcodeSequenceB;
                if(tag !== null && tag !== "") {
                    barcodes.push(tag);
                }
            }
        }

        for(var i: number = 0; i < barcodes.length; i++) {
            let sequenceOne: any[] = barcodes[i].split("");
            for(let j: number = i + 1; j < barcodes.length; j++) {
                let sequenceTwo: any[] = barcodes[j].split("");
                if(!this.atLeastThreeUnique(sequenceOne, sequenceTwo)) {
                    return false;
                }
            }
        }

        return true;
    }

    private atLeastThreeUnique(sequenceOne: any[], sequenceTwo: any[]): boolean{
        let uniqueBaseCount: number = 0;

        for(var i: number = 0; i < sequenceOne.length; i++) {
            if(sequenceOne[i] !== sequenceTwo[i]) {
                uniqueBaseCount++;
            }
        }

        return (uniqueBaseCount >= 3);
    }

    private createFlowCellFileName(): void {
        let runFolder: string = '';
        if(this.barcodeFC.value
            && this.runFC.value
            && this.createDateFC.value
            && this.instrumentFC.value
            && this.protocolFC.value) {

            let date = (<string>this.createDateFC.value).replace(/-/g,'');
            date = date.slice(2,date.length);

            let instrumentCode:string = "";
            if(this.instrumentFC.value){
               let instrumentObj = this.instrumentList.find(i => (i.idInstrument === this.instrumentFC.value ));
               instrumentCode = instrumentObj &&  instrumentObj.instrument ? instrumentObj.instrument : "";
            }

            runFolder += date + "_" + instrumentCode + "_";

            let runNumberPlus: number = Number(this.runFC.value) + 10000;
            let side = this.sideFC.value ? this.sideFC.value : '';
            runFolder += runNumberPlus.toString().substring(1, 5) + "_" + side + this.barcodeFC.value;
        }
        if (this.originalProtocol
            && this.protocolFC.value !== this.originalProtocol) {

            let message: string = "Changing the protocol for the flow cell will change the protocol for all the samples it contains.";
            this.dialogsService.alert(message, null, DialogType.WARNING);
        }
        this.flowCellRunFolder = runFolder;
    }

    private matchGridHeights(): void {
        if (this.growToMatch
            && this.growToMatch.nativeElement
            && this.heightToMatch
            && this.heightToMatch.nativeElement) {

            this.growToMatch.nativeElement.style.height = this.heightToMatch.nativeElement.offsetHeight + 'px';
        }
    }
}
