/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from "@angular/material";
import {WorkflowService} from "../services/workflow.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {HttpParams} from "@angular/common/http";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'edit-flowcell-dialog',
    templateUrl: "./edit-flowcell-dialog.html",
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
        mat-form-field.formField {
            width: 50%;
            margin: 0 0.5%;
        }
    `]
})

export class EditFlowcellDialogComponent implements OnInit{
    private showSpinner: boolean = false;
    public rebuildFlowCells: boolean = false;

    private flowCell: any;
    private idFlowCell: string;
    private sequenceProtocolsList: any[] = [];
    private flowCellChannels: any[];
    private instrumentList: any[] = [];
    private flowCellNumber: string;
    public channel: any;
    public allFG: FormGroup;
    public barcodeFC: FormControl;
    public runFC: FormControl;
    public createDateFC: FormControl;
    public seqRunCompleteDateFC: FormControl;
    public instrumentFC: FormControl;
    public protocolFC: FormControl;

    private codeSequencingPlatform: string;

    private flowCellColDefs;
    private assmGridApi;

    constructor(public dialogRef: MatDialogRef<EditFlowcellDialogComponent>,
                private workflowService: WorkflowService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private dialog: MatDialog,
                private dictionaryService: DictionaryService,
                @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        this.flowCell = data.flowCell;
        this.barcodeFC = new FormControl("", Validators.required);
        this.runFC = new FormControl("", Validators.required);
        this.createDateFC = new FormControl("");
        this.seqRunCompleteDateFC = new FormControl("");
        this.instrumentFC = new FormControl("", Validators.required);
        this.protocolFC = new FormControl("", Validators.required);
        this.allFG = new FormGroup({
            barCode: this.barcodeFC,
            run: this.runFC,
            createDate: this.createDateFC,
            seqRunCompletDate: this.seqRunCompleteDateFC,
            instrument: this.instrumentFC,
            protocol: this.protocolFC,

        });

    }

    ngOnInit() {
        this.sequenceProtocolsList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(proto =>
            (proto.codeRequestCategory ===  "HISEQ" || proto.codeRequestCategory === "MISEQ" || proto.codeRequestCategory === "NOSEQ") && proto.isActive === 'Y'
        );
        this.instrumentList = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.Instrument").filter(instrument =>
            instrument.isActive === 'Y'
        );
        this.setEditForm();
        this.touchFields();
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

    onAssmGridReady(params) {
        this.assmGridApi = params.api;
    }

    initializeAssm() {
        this.flowCellColDefs = [
            {
                headerName: "Channel",
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

    setEditForm() {
        // this.codeSequencingPlatform = event.data.codeSequencingPlatform;
        this.flowCellColDefs = [];
        this.flowCellNumber = this.flowCell.number;
        this.idFlowCell = this.flowCell.idFlowCell;
        // this.notes = event.data.notes;
        this.barcodeFC.setValue(this.flowCell.barcode);
        this.runFC.setValue(this.flowCell.runNumber);
        this.createDateFC.setValue(this.flowCell.createDate);
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
        }
        this.initializeAssm();
    }

    onCellValueChanged(event) {
        this.allFG.markAsDirty();
    }

    hasDuplicateSampleBarcodeSequence(): boolean{
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

    checkForDuplicateBarcode(): boolean {
        if (this.hasDuplicateSampleBarcodeSequence()) {
            this.dialogsService.confirm("Some of the samples to be multiplexed in one flow cell channel have the same index tag.  This should only occur when samples (and their sequence reads) are meant to be pooled.",
                "Proceed with duplicate index tags?").subscribe((answer: boolean) => {
                if (answer) {
                    return true;
                } else {
                    return false;
                }
            })
        }
        return true;
    }

    public saveFlowCell() {
        if (this.allFG.dirty) {
            //SaveFlowCell will recalulate the folder name.
            this.dialogsService.confirm("You have changed the Bar Code, Run #, Cluster Gen Date, Instrument or Side which will cause the Folder Name to change.",
                    "Do you wish to continue with this save?").subscribe((answer: boolean) => {
                if (answer) {
                    let checkReply = this.checkForDuplicateBarcode();
                    if (checkReply) {
                        this.save();
                    }
                }
            })
        }
    }

    public save(): void {
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
            .set("runNumber", this.runFC.value);

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
                    this.dialogRef.close();
                } else {
                    let message: string = "";
                    if (responseJSON && responseJSON.message) {
                        message = ": " + responseJSON.message;
                    }
                    this.dialogsService.confirm("An error occurred while saving" + message, null);
                }
            } else {
                this.dialogsService.confirm("An error occurred while saving " + response.message, null);

            }
            this.showSpinner = false;
        });
    }

    selectedRow(event) {
        this.channel = event.data;
    }

    launchAddSample(event) {
        console.log("launch");
    }

    removeChannel(event) {
        this.flowCellChannels = this.flowCellChannels.filter(channel =>
            channel.idFlowCellChannel != this.channel.idFlowCellChannel
        )
        this.allFG.markAsDirty();
        this.setEditForm();
    }
}
