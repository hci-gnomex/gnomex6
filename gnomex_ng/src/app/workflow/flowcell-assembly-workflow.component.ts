import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialogConfig} from "@angular/material";
import {HttpParams} from "@angular/common/http";

import {GridApi, GridSizeChangedEvent} from "ag-grid-community";

import {WorkflowService} from "../services/workflow.service";
import {GnomexService} from "../services/gnomex.service";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {BarcodeSelectEditor} from "../util/grid-editors/barcode-select.editor";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {SeqlaneSelectEditor} from "../util/grid-editors/seqlane-select.editor";
import {DeleteSeqlaneDialogComponent} from "./delete-seqlane-dialog.component";
import {UserPreferencesService} from "../services/user-preferences.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../services/constants.service";
import {UtilService} from "../services/util.service";

@Component({
    selector: 'flowcell-assembly-workflow',
    templateUrl: 'flowcell-assembly-workflow.component.html',
    styles: [`


        .large-max-width {
            max-width : 40em;
        }

        .assembly-message {
            color: #1601db;
        }


        .date-width {
            width: 10em;
        }

        .protocol-width {
            width: 30em;
        }

        .run-width {
            width: 5em;
        }
        .children-margin-right > *:not(:last-child) {
            margin-right: 1em;
        }

        .min-lab-width {
            min-width: 3em;
        }

        .min-request-category-width {
            min-width: 3em;
        }


    `]
})

export class FlowcellAssemblyWorkflowComponent implements OnInit {
    @ViewChild("labInput") labInput: ElementRef;
    @ViewChild('oneEmWidth1') oneEmWidth1: ElementRef;
    @ViewChild('oneEmWidth2') oneEmWidth2: ElementRef;

    private emToPxConversionRate1: number = 13;
    private emToPxConversionRate2: number = 13;

    public label = "Illumina Flow Cell Assembly";


    public get allRequestColumnDefs(): any[] {
        let result: any[] = [];

        result.push({
            headerName: "Select Lane #",
            editable: true,
            field: "flowCellChannelNumber",
            width:    1,
            minWidth: 6 * this.emToPxConversionRate1,
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SeqlaneSelectEditor,
            selectOptions: this.lanes,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            showFillButton: true,
            fillGroupAttribute: 'idRequest',
            cellStyle: UtilService.shrinkCellText
        });
        result.push({
            headerName: "Experiment",
            editable: false,
            width:    1,
            minWidth: 7 * this.emToPxConversionRate1,
            field: "number",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellStyle: UtilService.shrinkCellText
        });
        result.push({
            headerName: "Experiment Type",
            editable: false,
            width:    1,
            minWidth: 12 * this.emToPxConversionRate1,
            field: "codeRequestCategory",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework:   SelectEditor,
            selectOptions: this.experimentTypes,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "codeRequestCategory",
            cellStyle: UtilService.shrinkCellText
        });
        result.push({
            headerName: "Index A",
            editable: false,
            width:    300,
            minWidth: 8 * this.emToPxConversionRate1,
            field: "idOligoBarcode",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: BarcodeSelectEditor,
            selectOptions: this.barCodes,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idOligoBarcode",
            indexTagLetter: 'A',
            cellStyle: UtilService.shrinkCellText
        });
        result.push({
            headerName: "Index B",
            editable: false,
            width:    300,
            minWidth: 8 * this.emToPxConversionRate1,
            field: "idOligoBarcodeB",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: BarcodeSelectEditor,
            selectOptions: this.barCodes,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idOligoBarcodeB",
            indexTagLetter: 'B',
            cellStyle: UtilService.shrinkCellText
        });
        result.push({
            headerName: "Library Protocol",
            editable: false,
            width:    800,
            minWidth: 8 * this.emToPxConversionRate1,
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

        return result;
    }

    public get assemblyColumnDefs(): any[] {
        let result: any[] = [];

        result.push({
            headerName: "Experiment",
            editable: false,
            width:    1,
            minWidth: 7 * this.emToPxConversionRate1,
            field: "number",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellStyle: UtilService.shrinkCellText
        });
        result.push({
            headerName: "Lane",
            editable: true,
            field: "flowCellChannelNumber",
            width:    1,
            minWidth: 6 * this.emToPxConversionRate1,
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SeqlaneSelectEditor,
            selectOptions: this.lanes,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            showFillButton: true,
            fillGroupAttribute: 'idRequest',
            cellStyle: UtilService.shrinkCellText
        });
        result.push({
            headerName: "Index A",
            editable: false,
            width:    500,
            minWidth: 7 * this.emToPxConversionRate1,
            field: "idOligoBarcode",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: BarcodeSelectEditor,
            selectOptions: this.barCodes,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idOligoBarcode",
            indexTagLetter: 'A',
            cellStyle: UtilService.shrinkCellText
        });
        result.push({
            headerName: "Index B",
            editable: false,
            width:    500,
            minWidth: 7 * this.emToPxConversionRate1,
            field: "idOligoBarcodeB",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: BarcodeSelectEditor,
            selectOptions: this.barCodes,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idOligoBarcodeB",
            indexTagLetter: 'B',
            cellStyle: UtilService.shrinkCellText
        });
        result.push({
            headerName: "Library Protocol",
            editable: false,
            width:    800,
            minWidth: 7 * this.emToPxConversionRate2,
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

        return result;
    }

    private _assmItemList: any[] = [];

    public get assmItemList(): any[] {
        return this._assmItemList;
    }
    public set assmItemList(value: any[]) {
        this._assmItemList = value;

        if (this.assmGridApi) {
            this.assmGridApi.setRowData(this._assmItemList);
            this.assmGridApi.setColumnDefs(this.allRequestColumnDefs);
            this.assmGridApi.sizeColumnsToFit();
        }
    }

    public get filteredNumberOfSequenceLanes(): number {
        if (this.allRequestGridApi) {
            return this.allRequestGridApi.getDisplayedRowCount();
        }

        return 0;
    };

    public get workingWorkItemList(): any[] {

        let results: any[] = this.workItemList;

        if (this.selectedLab && this.selectedLab.value) {
            results = results.filter((workItem) => {
                return workItem.idLab === this.selectedLab.value;
            });
        }
        if (this.protocolFilterFc && this.protocolFilterFc.value) {
            results = results.filter((workItem) => {
                return workItem.idNumberSequencingCyclesAllowed === this.protocolFilterFc.value.idNumberSequencingCyclesAllowed;
            });
        }
        if (this.selectedExperimentType && this.selectedExperimentType.value) {
            results = results.filter((workItem) => {
                return workItem.codeRequestCategory === this.selectedExperimentType.value;
            });
        }
        if (this.allRequestGridApi) {
            this.allRequestGridApi.setQuickFilter(this.searchText);
        }

        this.workflowService.assignBackgroundColor(results, "idRequest");

        return results;
    }


    public experimentTypesInList: any[];
    public filteredProtocolsList: any[] = [];
    public instrumentList: any[] = [];
    public labList: any[] = [];

    private barCodes: any[] = [];
    private sequenceProtocolsList: any[] = [];
    private experimentTypes: any[];
    private lanes: any[] = [];
    private selectedSeqlanes: any[] = [];
    private workItemList: any[] = [];

    private searchText: string;

    private multiExperimentTypeWarningIsOpen: boolean = false;
    private redrawRequested: boolean = true;
    private showSpinner: boolean = false;

    public allFG: FormGroup;

    public barcodeFC:              FormControl;
    public createDateFC:           FormControl;
    public sideFC:                 FormControl;
    public instrumentFC:           FormControl;
    public protocolFC:             FormControl;
    public runFC:                  FormControl;
    public selectedExperimentType: FormControl;
    public selectedLab:            FormControl;
    public protocolFilterFc:       FormControl;

    private allRequestGridApi: GridApi;
    private assmGridApi: GridApi;


    constructor(public prefService: UserPreferencesService,
                public workflowService: WorkflowService,
                private constService: ConstantsService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private securityAdvisor: CreateSecurityAdvisorService) {

        this.barcodeFC    = new FormControl("");
        this.runFC        = new FormControl("", Validators.pattern("^[0-9]*$"));
        this.createDateFC = new FormControl("");
        this.instrumentFC = new FormControl("");
        this.protocolFC   = new FormControl("");
        this.sideFC = new FormControl("");

        this.createDateFC.disable();


        this.allFG = new FormGroup({
            barCode: this.barcodeFC,
            run: this.runFC,
            createDate: this.createDateFC,
            instrument: this.instrumentFC,
            protocol: this.protocolFC,
            side: this.sideFC
        });

        this.protocolFilterFc       = new FormControl('');
        this.selectedExperimentType = new FormControl('');
        this.selectedLab            = new FormControl('');
    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.NUMBER_SEQUENCING_CYCLES_ALLOWED).filter((value) => {
            return value.isActive === 'Y';
        });

        this.instrumentList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.INSTRUMENT).filter((value) => {
            return value.isActive === 'Y';
        });

        // This will be used to display existing request categories in a non-editable state, so we want the inactive ones too.
        this.experimentTypes = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);

        // This will be used to display existing barcodes in a non-editable state, so we want the inactive ones too.
        let codes = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.OLIGO_BARCODE);

        for (let code of codes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this.barCodes.push(code);
        }

        this.labList = this.labList.concat(this.gnomexService.labList);
    }

    private initialize(): void {
        this.sideFC.disable();
        this.assmItemList = [];
        this.selectedSeqlanes = [];
        this.allFG.reset();
        this.allFG.markAsPristine();

        if (this.allRequestGridApi) {
            this.allRequestGridApi.setRowData([]);
        }
        if (this.allRequestGridApi) {
            this.assmGridApi.setRowData([]);
        }

        this.dialogsService.startDefaultSpinnerDialog();

        let params: HttpParams = new HttpParams().set("codeStepNext", this.workflowService.ALL_CLUSTER_GEN);

        this.workflowService.getWorkItemList(params).subscribe((response: any) => {
            if (response) {
                this.workItemList = response;

                if (!this.securityAdvisor.isArray(response)) {
                    this.workItemList = [response.Request];
                } else {
                    this.workItemList = response;
                }

                this.buildWorkItemList();

                this.experimentTypesInList = this.getUsedExperimentTypes();

                this.refreshRequestsGrid();

                this.allRequestGridApi.setColumnDefs(this.allRequestColumnDefs);
                this.allRequestGridApi.sizeColumnsToFit();

                this.assmGridApi.setColumnDefs(this.assemblyColumnDefs);
                this.assmGridApi.sizeColumnsToFit();
            }
            this.showSpinner = false;
            this.dialogsService.stopAllSpinnerDialogs();
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    private buildWorkItemList(): void {
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

    private getUsedExperimentTypes(): any[] {

        let usedCodeRequestCategories: Set<string> = new Set<string>();

        for (let workItem of this.workItemList) {
            usedCodeRequestCategories.add(workItem.codeRequestCategory);
        }

        return this.experimentTypes.filter((value) => {
            return usedCodeRequestCategories.has(value.codeRequestCategory);
        });
    }


    public refreshRequestsGrid(): void {
        if (this.allRequestGridApi) {
            this.allRequestGridApi.setRowData(this.workingWorkItemList);
        }
    }


    public onRowSelected(event) {
        if (event && event.data && event.data.codeRequestCategory) {
            if(event.node && event.node.selected) {

                this.filteredProtocolsList = this.sequenceProtocolsList.filter((proto) => {
                    return proto.codeRequestCategory === event.data.codeRequestCategory && proto.isActive === 'Y';
                });

                event.data.selected = true;
                this.selectedSeqlanes.push(event.data);
            } else {
                event.data.selected = false;
                this.selectedSeqlanes.forEach( (item, index) => {
                    if(item === event.data) {
                        this.selectedSeqlanes.splice(index, 1);
                    }
                });
            }
        }

        this.allRequestGridApi.redrawRows();
    }

    public onNotifyGridRowDataChanged(event): void {
        if (event && event.api) {
            event.api.hideOverlay();
        }
    }

    private buildLanes(): void {
        let rLanes: any[] = [];

        if (this.assmItemList && Array.isArray(this.assmItemList) && this.assmItemList.length > 0) {
            let requestCategory: any = this.dictionaryService.getEntry('hci.gnomex.model.RequestCategory', this.assmItemList[0].codeRequestCategory);
            let solexaFlowCellChannels: number = requestCategory.numberOfChannels;

            for (var i = 1; i <= solexaFlowCellChannels; i++) {
                let obj = {display: i.toString(), value: i};
                rLanes.push(obj);
            }
        }

        this.lanes = rLanes;
    }

    //todo this is fix not a PERMANENT SOLUTION!!
    isSeqProtocolSame(event:any):boolean{
        let firstFC : any  = this.assmItemList[0];
        let seqProtocol = this.sequenceProtocolsList.find(seqProto => {
            return seqProto.idNumberSequencingCyclesAllowed === event.data.idNumberSequencingCyclesAllowed
        });
        let filteredSeqProtocol = this.sequenceProtocolsList.find(seqProto => {
            return seqProto.idNumberSequencingCyclesAllowed === firstFC.idNumberSequencingCyclesAllowed;
        });

        if(seqProtocol && filteredSeqProtocol){
            let filteredName = (<string>filteredSeqProtocol.name).split(' ')[0];
            let name = (<string>seqProtocol.name).split(' ')[0];
            // logic is unless we explicitly know we don't stop user from be able to add to assembleList
            if(name && filteredName && name.toUpperCase() != filteredName.toUpperCase()){
                return false;
            }
        }
        return true;
    }

    public onCellValueChanged_allRequestsGrid(event): void {
        if (!this.multiExperimentTypeWarningIsOpen) {
            if (this.assmItemList
                && this.assmItemList.length
                && this.assmItemList.length > 0
                && !this.isSeqProtocolSame(event)) {
                this.multiExperimentTypeWarningIsOpen = true;
                let alertMessage = "Only one type of experiment can be assembled on a flow cell";
                this.dialogsService.alert(alertMessage, null, DialogType.WARNING).subscribe(() => {
                    this.multiExperimentTypeWarningIsOpen = false;
                });
            } else {
                for (let proto of this.filteredProtocolsList) {
                    if (proto.idNumberSequencingCyclesAllowed === event.data.idNumberSequencingCyclesAllowed) {
                        this.protocolFC.setValue(proto);
                        break;
                    }
                }

                this.assmItemList = this.workItemList
                    .filter((a) => { return !!a.flowCellChannelNumber; })
                    .sort(this.workflowService.sortSampleNumber);

                if (this.lanes.length === 0) {
                    this.buildLanes();
                }

                if(this.assmItemList.length > 0 ){
                    let firstFC : any  = this.assmItemList[0];
                    let reqCat:string = firstFC.codeRequestCategory;
                    let seqProtocolId = firstFC.idNumberSequencingCyclesAllowed;

                    let foundProtocol = this.filteredProtocolsList.find(p => (p.idNumberSequencingCyclesAllowed === seqProtocolId  ));
                    let foundProtocolName:string = foundProtocol && foundProtocol.name ?  (<string>foundProtocol.name).toUpperCase() : '';

                    if(reqCat === 'MISEQ' || foundProtocolName.indexOf("MISEQ") != -1 ){
                        this.sideFC.disable();
                        this.sideFC.setValue(null);
                        this.sideFC.clearValidators();
                    }
                    else{
//                        this.sideFC.setValidators(Validators.required);
//                      this.sideFC.updateValueAndValidity();
                        this.sideFC.enable();

                    }

                }else{
                    this.sideFC.disable();
                    this.sideFC.setValue(null);
                    this.sideFC.clearValidators();
                    this.sideFC.updateValueAndValidity();
                }

                this.allFG.markAsDirty();


            }
        }

        if (this.multiExperimentTypeWarningIsOpen && event && event.node && event.node.data) {
            event.node.data.flowCellChannelNumber = "";

            if (!this.redrawRequested) {
                this.redrawRequested = true;

                setTimeout(() => {
                    this.allRequestGridApi.redrawRows();
                    this.redrawRequested = false;
                });
            }
        }
    }

    public onCellValueChanged_assemblyGrid(event): void {
        this.assmItemList = this.workItemList
            .filter((a) => { return !!a.flowCellChannelNumber; })
            .sort(this.workflowService.sortSampleNumber);
        if(this.assmItemList.length === 0){
            this.sideFC.setValue(null);
            this.sideFC.clearValidators();
            this.sideFC.updateValueAndValidity();
            this.sideFC.disable();
        }

        if (this.allRequestGridApi) {
            this.allRequestGridApi.redrawRows();
        }
    }

    public onAllRequestsGridReady(params) {
        if (this.oneEmWidth1 && this.oneEmWidth1.nativeElement) {
            this.emToPxConversionRate1 = this.oneEmWidth1.nativeElement.offsetWidth;
        }

        this.allRequestGridApi = params.api;
        params.api.sizeColumnsToFit();

        if (this.allRequestGridApi && this.assmGridApi) {
            this.initialize();
        }
    }

    public onAssemblyGridReady(params): void {
        if (this.oneEmWidth2 && this.oneEmWidth2.nativeElement) {
            this.emToPxConversionRate2 = this.oneEmWidth2.nativeElement.offsetWidth;
        }

        this.assmGridApi = params.api;
        params.api.sizeColumnsToFit();

        if (this.allRequestGridApi && this.assmGridApi) {
            this.initialize();
        }
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        if (this.oneEmWidth1 && this.oneEmWidth1.nativeElement) {
            this.emToPxConversionRate1 = this.oneEmWidth1.nativeElement.offsetWidth;
        }
        if (this.oneEmWidth2 && this.oneEmWidth2.nativeElement) {
            this.emToPxConversionRate2 = this.oneEmWidth2.nativeElement.offsetWidth;
        }

        event.api.sizeColumnsToFit();
    }


    private lanesHasFlowcellChannel(channelNumber: number): boolean {
        if (this.lanes.filter((lane) => { return lane === channelNumber; }).length === 0) {
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
                tmp.forEach((lane, index) => {
                    if (lane === item.flowCellChannelNumber) {
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

        return  {errorMessage: errorMessage, warningMessage: warningMessage};
    }

    private validateProtocolAndLanes(): any {
        let warningMessage: string = "";
        let errorMessage: string = "";

        for (let wi of this.assmItemList) {
            if (wi.idNumberSequencingCyclesAllowed === '' || wi.idNumberSequencingCyclesAllowed == null) {
                errorMessage = "One or more samples have no sequencing protocol.  Please correct sequence lanes before continuing.";
            }
            if(wi.idNumberSequencingCyclesAllowed !== this.protocolFC.value.idNumberSequencingCyclesAllowed) {
                warningMessage += "One or more samples have different protocols from the flow cell.\n\n";
                break;
            }
        }

        return  {errorMessage: errorMessage, warningMessage: warningMessage};
    }

    public save(): void {
        this.allRequestGridApi.stopEditing();

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

    private saveWorkItems(): void {
        this.showSpinner = true;

        let params: HttpParams = new HttpParams()
            .set("codeStepNext", this.workflowService.ILLSEQ_FINALIZE_FC)
            .set("flowCellDate", WorkflowService.convertDate(this.createDateFC.value))
            .set("idInstrument", this.instrumentFC.value ? this.instrumentFC.value.idInstrument : "")
            .set("idNumberSequencingCyclesAllowed", this.protocolFC.value ? this.protocolFC.value.idNumberSequencingCyclesAllowed : "")
            .set("idSeqRunType", this.protocolFC.value.idSeqRunType ? this.protocolFC.value.idSeqRunType : "")
            .set("numberSequencingCyclesActual", this.protocolFC.value ? this.protocolFC.value.numberSequencingCyclesDisplay : "" )
            .set("runNumber", this.runFC.value ? this.runFC.value : "")
            .set("side", this.sideFC.value ? this.sideFC.value : "")
            .set("flowCellBarcode", this.barcodeFC.value ? this.barcodeFC.value : "")
            .set("workItemXMLString", JSON.stringify(this.assmItemList));

        this.workflowService.saveWorkItemSolexaAssemble(params).subscribe((response: any) => {
            let responseJSON: any = response;
            if (responseJSON && responseJSON.result && responseJSON.result === "SUCCESS") {
                if (!responseJSON.flowCellNumber) {
                    responseJSON.flowCellNumber = "";
                }

                this.dialogsService.alert("Flowcell " + responseJSON.flowCellNumber + " created", null, DialogType.SUCCESS);
                this.initialize();
            }

        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    public refreshWorklist(event: any): void {
        this.initialize();
    }

    public deleteWorkItem(event): void {
        let laneString: string = "";

        let seqLanes: string = "";
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

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "25em";
        config.height = "12em";
        config.autoFocus = false;
        config.data = {
            seqLanes: seqLanes,
            laneLength: this.selectedSeqlanes.length,
            laneString: laneString
        };

        let temp: any = {
            actions: [
                {
                    type: ActionType.PRIMARY,
                    name: "Yes",
                    internalAction: "delete"
                },
                {
                    type: ActionType.SECONDARY,
                    name: "No",
                    internalAction: "onClose"
                }
            ]
        };

        this.dialogsService.genericDialogContainer(DeleteSeqlaneDialogComponent, "Delete Sequence Lane", this.constService.ICON_DELETE, config, temp).subscribe((result: any) => {
            if (result) {
                this.initialize();
            }
        });
    }

    private validateIndexTags(): any {
        let warningMessage: string = "";
        let errorMessage: string = "";

        for (let channelNumber of this.lanes) {
            var i: string = channelNumber;

            if (!this.areBarcodeSequenceTagsUnique(i)) {
                warningMessage += "Two or more samples in lane " + i + " do not differ by at least 3 base pairs.\n\n";
            }
        }

        return  {errorMessage: errorMessage, warningMessage: warningMessage};
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

        for( var i: number = 0; i < barcodes.length; i++) {
            let sequenceOne: any[] = barcodes[i].split("");
            for (var j: number = i + 1; j < barcodes.length; j++) {
                let sequenceTwo: any[] = barcodes[j].split("");
                if(!FlowcellAssemblyWorkflowComponent.atLeastThreeUnique(sequenceOne, sequenceTwo)){
                    return false;
                }
            }
        }

        return true;
    }

    private static atLeastThreeUnique(sequenceOne: any[], sequenceTwo: any[]): boolean {
        let uniqueBaseCount: number = 0;

        for(var i: number = 0; i < sequenceOne.length; i++) {
            if(sequenceOne[i] !== sequenceTwo[i]) {
                uniqueBaseCount++;
            }
        }

        return (uniqueBaseCount >= 3);
    }
}
