import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material";
import {WorkflowService} from "../services/workflow.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {HttpParams} from "@angular/common/http";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {GridApi} from "ag-grid-community/dist/lib/gridApi";
import {RowDoubleClickedEvent} from "ag-grid-community";
import {ActionType, GDActionConfig} from "../util/interfaces/generic-dialog-action.model";
import {AddSamplesDialogComponent} from "./add-samples-dialog.component";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {UtilService} from "../services/util.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {ConstantsService} from "../services/constants.service";

@Component({
    selector: "edit-flowcell-dialog",
    templateUrl: "./edit-flowcell-dialog.html",
    styles: [``]
})

export class EditFlowcellDialogComponent extends BaseGenericContainerDialog implements OnInit{
    private flowCell: any;
    private idFlowCell: string;
    public sequenceProtocolsList: any[] = [];
    public flowCellChannels: any[];
    public instrumentList: any[] = [];
    private flowCellNumber: string;
    public channel: any;
    public allFG: FormGroup;
    public barcodeFC: FormControl;
    public runFC: FormControl;
    public createDateFC: FormControl;
    public lastCycleDateFC: FormControl;
    public seqRunCompleteDateFC: FormControl;
    public instrumentFC: FormControl;
    public protocolFC: FormControl;

    private codeSequencingPlatform: string;

    public flowCellColDefs;
    private assmGridApi:GridApi;

    constructor(public dialogRef: MatDialogRef<EditFlowcellDialogComponent>,
                public workflowService: WorkflowService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private constService: ConstantsService) {
        super();
        this.flowCell = data.flowCell;
        this.barcodeFC = new FormControl("", Validators.required);
        this.runFC = new FormControl("", Validators.required);
        this.createDateFC = new FormControl("");
        this.lastCycleDateFC = new FormControl("");
        this.seqRunCompleteDateFC = new FormControl("");
        this.instrumentFC = new FormControl("", Validators.required);
        this.protocolFC = new FormControl("", Validators.required);
        this.allFG = new FormGroup({
            barCode: this.barcodeFC,
            run: this.runFC,
            createDate: this.createDateFC,
            lastCycleDate: this.lastCycleDateFC,
            seqRunCompletDate: this.seqRunCompleteDateFC,
            instrument: this.instrumentFC,
            protocol: this.protocolFC,

        });

    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(proto =>
            (proto.codeRequestCategory ===  "HISEQ" || proto.codeRequestCategory === "MISEQ" ||
                proto.codeRequestCategory === "NOSEQ" || proto.codeRequestCategory === "ILLSEQ") && proto.isActive === 'Y'
        );
        this.instrumentList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.Instrument").filter(instrument =>
            instrument.isActive === 'Y'
        );
        this.setEditForm();
        this.touchFields();
        this.innerTitle = "Edit Flow Cell" + this.flowCell.number;
        this.primaryDisable = (action) => !this.allFG.dirty || this.allFG.invalid;
    }

    private touchFields() {
        for (let field in this.allFG.controls) {
            const control = this.allFG.get(field);
            if (control) {
                if (control.valid === false) {
                    control.markAsTouched();
                }
            }
        }
    }

    public onAssemblyGridReady(params) {
        this.assmGridApi = params.api;
        this.assmGridApi.sizeColumnsToFit();
    }

    private initializeAssm() {
        this.flowCellColDefs = [
            {
                headerName: "Lane",
                editable: false,
                field: "number",
                width: 100,
            },
            {
                headerName: "Samples",
                editable: false,
                width: 250,
                field: "contentNumbers",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
            },
            {
                headerName: "Reads pF",
                editable: true,
                width: 100,
                field: "read1ClustersPassedFilterM",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellStyle: function(params) {
                    return {'font-size': '.70rem'};
                }

            },
            {
                headerName: "Q30 %",
                editable: true,
                width: 100,
                field: "q30PercentForDisplay",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
            },
            {
                headerName: "Folder Name",
                editable: true,
                width: 200,
                field: "fileName",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
            },
            {
                headerName: "Status",
                editable: true,
                width: 150,
                field: "workflowStatus",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
            },

        ];
    }

    private setEditForm() {
        this.codeSequencingPlatform = this.flowCell.codeSequencingPlatform;
        this.flowCellColDefs = [];
        this.flowCellNumber = this.flowCell.number;
        this.idFlowCell = this.flowCell.idFlowCell;
        // this.notes = event.data.notes;
        this.barcodeFC.setValue(this.flowCell.barcode);
        this.runFC.setValue(this.flowCell.runNumber);
        this.createDateFC.setValue(this.flowCell.createDate);
        this.lastCycleDateFC.setValue(this.flowCell.lastCycleDate);
        this.instrumentFC.setValue(this.flowCell.idInstrument);
        for (let instrument of this.instrumentList) {
            if (instrument.idInstrument === this.flowCell.idInstrument) {
                this.instrumentFC.setValue(instrument);
                break;
            }
        }
        for (let proto of this.sequenceProtocolsList) {
            if (proto.idNumberSequencingCyclesAllowed === this.flowCell.idNumberSequencingCyclesAllowed) {
                this.protocolFC.setValue(proto);
                break;
            }
        }
        if (!this.flowCellChannels) {
            if (!this.securityAdvisor.isArray(this.flowCell.flowCellChannels)) {
                this.flowCellChannels = [this.flowCell.flowCellChannels.FlowCellChannel];
            } else {
                this.flowCellChannels = this.flowCell.flowCellChannels;
            }

            if (this.flowCellChannels && Array.isArray(this.flowCellChannels) && this.flowCellChannels.length > 0) {
                this.flowCell.lastCycleDate = this.flowCellChannels[0].lastCycleDate;
            }
        }
        for(let fcChannel of this.flowCellChannels){
            if(fcChannel.sequenceLanes){
                fcChannel.sequenceLanes = UtilService.getJsonArray(fcChannel.sequenceLanes, fcChannel.sequenceLanes.SequenceLane);
            }
        }


        this.initializeAssm();
    }

    public onCellValueChanged(event) {
        this.allFG.markAsDirty();
    }

    private hasDuplicateSampleBarcodeSequence(): boolean{
        for (let channel of this.flowCellChannels){
            console.log("seq");
            if (!this.securityAdvisor.isArray(channel.sequenceLanes)) {
                channel.sequenceLanes = [channel.sequenceLanes];
            }
            for (var i: number = 0; i < channel.sequenceLanes.length; i++){
                let seqLane = channel.sequenceLanes[i];
                let pos: number = i + 1;
                while(pos <= channel.sequenceLanes.length - 1){
                    var tester = channel.sequenceLanes[pos];
                    if(seqLane.sampleBarcodeSequence === tester.sampleBarcodeSequence){
                        return true;
                    } else{
                        pos++;
                    }
                }
            }
        }
        return false;
    }

    private checkForDuplicateBarcode(): void {
        if (this.hasDuplicateSampleBarcodeSequence()) {
            this.dialogsService.confirm("Some of the samples to be multiplexed in one flow cell lane have the same index tag.  This should only occur when samples (and their sequence reads) are meant to be pooled."
                + "<br> Proceed with duplicate index tags?").subscribe((answer: boolean) => {
                if (answer) {
                    this.save();
                }
            })
        } else {
            this.save();
        }
    }

    public saveFlowCell() {
        if (this.allFG.dirty) {
            //SaveFlowCell will recalculate the folder name.
            this.dialogsService.confirm("You have changed the Bar Code, Run #, Cluster Gen Date, Instrument or Side which will cause the Folder Name to change."
                + "<br> Do you wish to continue with this save?").subscribe((answer: boolean) => {
                if (answer) {
                    let checkReply = this.checkForDuplicateBarcode();
                }
            });
        }
    }

    public save(): void {
        let params: HttpParams = new HttpParams().set("barcode" ,this.barcodeFC.value)
            .set("codeSequencingPlatform", this.codeSequencingPlatform)
            .set("createDate", this.flowCell.createDate)
            .set("lastCycleDate", this.flowCell.lastCycleDate)
            .set("idCoreFacility", this.flowCell.idCoreFacility)
            .set("idFlowCell", this.flowCell.idFlowCell)
            .set("idInstrument", this.instrumentFC.value.idInstrument)
            .set("idNumberSequencingCycles", this.protocolFC.value.idNumberSequencingCycles)
            .set("idNumberSequencingCyclesAllowed", this.protocolFC.value.idNumberSequencingCyclesAllowed)
            .set("idSeqRunType", this.protocolFC.value.idSeqRunType)
            .set("side", this.flowCell.side)
            .set("notes", this.flowCell.notes)
            .set("number", this.flowCell.number)
            .set("numberSequencingCyclesActual", this.protocolFC.value.numberSequencingCyclesActual ? this.protocolFC.value.numberSequencingCyclesActual : "")
            .set("runNumber", this.runFC.value)
            .set("noJSONToXMLConversionNeeded", "Y");

        params = params.set("channelsJSONString", JSON.stringify(this.flowCellChannels));

        this.showSpinner = true;
        this.workflowService.saveFlowCell(params).subscribe((response: any) => {
            this.allFG.markAsPristine();
            if (!response.flowCellNumber) {
                response.flowCellNumber = "";
            }
            this.dialogsService.alert("Flowcell " + response.flowCellNumber + " created", null, DialogType.SUCCESS);
            this.dialogRef.close(true);
            this.showSpinner = false;

        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    public selectedRow(event) {
        this.channel = event.data;
    }

    public launchAddSample(event:RowDoubleClickedEvent) {
        if(event.data){
            let actionConfig : GDActionConfig = {actions: [
                    {name:"Update", internalAction:"update", type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE},
                    {name: "Cancel", internalAction:"cancel", type: ActionType.SECONDARY}
                ]};
            let config: MatDialogConfig = new MatDialogConfig();

            config.data = event.data;
            config.width = "65em";
            config.height = "40em";

            this.dialogsService.genericDialogContainer(AddSamplesDialogComponent,"Add Samples to Flow Cell ",null,config,actionConfig)

        }
    }

    public removeChannel(event) {
        this.flowCellChannels = this.flowCellChannels.filter(channel =>
            channel.idFlowCellChannel != this.channel.idFlowCellChannel
        );
        this.allFG.markAsDirty();
        this.setEditForm();
    }

    public onChangeCreateDate() {
        this.createDateFC.markAsDirty();
    }

    public onChangeLastCycleDate() {
        this.createDateFC.markAsDirty();
    }
}
