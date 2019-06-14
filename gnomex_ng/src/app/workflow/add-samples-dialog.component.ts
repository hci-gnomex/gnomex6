/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {WorkflowService} from "../services/workflow.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {HttpParams} from "@angular/common/http";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {GridApi} from 'ag-grid-community/dist/lib/gridApi';
import {ColDef, GridReadyEvent, RowDoubleClickedEvent, RowSelectedEvent} from "ag-grid-community";
import {ActionType, GDAction, GDActionConfig} from "../util/interfaces/generic-dialog-action.model";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {LabListService} from "../services/lab-list.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {AnalysisService} from "../services/analysis.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {ConstantsService} from "../services/constants.service";
import {ITreeNode, ITreeOptions} from "angular-tree-component/dist/defs/api";
import {UtilService} from "../services/util.service";
import * as _ from "lodash";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";

@Component({
    templateUrl: "./add-samples-dialog.component.html",
    styles: [`
        .truncate{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .left-right-padded {
            padding-left:  0.3em;
            padding-right: 0.3em;
        }
    `]
})

export class AddSamplesDialogComponent extends BaseGenericContainerDialog implements OnInit{

    public showSpinner:boolean = false;
    public idLab: string;
    public selectedIdChannel:string;
    public labList:any[] = [];
    public itemList:any[] = [];
    public options : ITreeOptions;
    public lanes: any[] = [];
    private _dirty:boolean = false;
    public selectedSampleFlowCell = [];

    private gridApi:GridApi;
    private _seqTypeRunList:any[];
    private _seqCycleList:any[];
    private _genomeBuildAlignTo:any[];

    constructor(public dialogRef: MatDialogRef<AddSamplesDialogComponent>,
                private workflowService: WorkflowService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                public labListService:LabListService,
                public constService: ConstantsService,
                public analysisService: AnalysisService,
                public preferenceService: UserPreferencesService,
                private dialog: MatDialog,
                private dictionaryService: DictionaryService,
                @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        super();
        this.selectedIdChannel = this.data.idFlowCellChannel;
        this.lanes = _.cloneDeep(UtilService.getJsonArray(this.data.sequenceLanes,this.data.sequenceLanes.SequenceLane));


    }

    get seqTypeRunList():any[]{
        if(!this._seqTypeRunList) {
            this._seqTypeRunList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.SEQ_RUN_TYPE);
        }
        return this._seqTypeRunList;
    }
    get seqCycleList():any[]{
        if(!this._seqCycleList){
            this._seqCycleList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.NUMBER_SEQUENCING_CYCLES);
        }
        return this._seqCycleList;
    };
    get genomeBuildAlignTo():any[]{
        if(!this._genomeBuildAlignTo){
            this._genomeBuildAlignTo = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.GENOME_BUILD);
        }
        return this._genomeBuildAlignTo;
    }



    private columnDefs:any[] = [
        {headerName:"ID", field: "number", width: 150, editable:false },
        {headerName:"Sample Name", field: "sampleName", width: 150, editable:false },
        {headerName:"Sample ID", field: "sampleNumber", width: 125, editable:false },
        {
            headerName:"Flow Cell Type",
            field: "idSeqRunType",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.seqTypeRunList,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            width: 125,
            editable:false
        },
        {
            headerName:"# Cycles",
            field: "idNumberSequencingCycles",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.seqCycleList,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            width: 75,
            editable:false
        },
        {
            headerName:"Genome Build (align to)",
            field: "idGenomeBuildAlignTo",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.genomeBuildAlignTo,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            width: 250,
            editable:false
        },
    ];





    ngOnInit() {
        this.dirty = () => {return  this._dirty};
        this.options = {
            displayField: "label",
            allowDrag: (node: any) => {return node.level > 1 }
        };

        this.labListService.getLabList().subscribe((resp)=>{
            this.labList = resp;
        });
    }


    prepareFlowCellSample(items:any[]): void {
        let node = null;
        let errMessage: string = "";

        for (let item of items) {
            if (item.type === "SequenceLane") {

                let isNewFCChannel:boolean = !!(!item.idFlowCellChannel || item.idFlowCellChannel == this.selectedIdChannel);
                if(isNewFCChannel){
                    node = {};
                    node.number = item.itemNumber ? item.itemNumber : '';
                    node.createDate = item.createDate ? item.createDate : '';
                    node.idRequest = item.idRequest ? item.idRequest : '';
                    node.idOrganism = item.idOrganism ? item.idOrganism : '';
                    node.idSample = item.idSample ? item.idSample : '';
                    node.sampleName = item.sampleName1 ? item.sampleName1 : '';
                    node.idSequenceLane = item.idSequenceLane ? item.idSequenceLane : '';
                    node.idNumberSequencingCycles = item.idNumberSequencingCycles ? item.idNumberSequencingCycles : '';
                    node.idSeqRunType = item.idSeqRunType ? item.idSeqRunType : '';
                    node.sampleNumber = item.sampleNumber1 ? item.sampleNumber1 : '';
                    node.idFlowCellChannel = '';
                    node.flowCellChannel = '';
                    node.idGenomeBuildAlignTo = item.idGenomeBuildAlignTo ? item.idGenomeBuildAlignTo : '';
                    node.sampleBarcodeSequence = item.sampleBarcodeSequence ? item.sampleBarcodeSequence : '';

                    if (!(this.lanes.find((l) => l.number === item.number))) {
                        this.lanes.push(node);
                        this._dirty = true;
                        this.gridApi.setRowData(this.lanes);
                    }

                }else{
                    if(items.length === 1){
                        this.dialogsService.alert("Sample " + item.label + " has already been assigned to another flow cell channel.",
                            "Sample(s) not added");
                    }else{
                        errMessage +=  "\'" + item.itemNumber +  "\' ";
                    }
                    continue;
                }


                if (!(this.lanes.find((l) => l.number === item.number))) {
                    this.lanes.push(item);
                }


            } else {
                if(items.length === 1){
                    this.dialogsService.alert("Sequencing samples only.", "Samples not added")
                }else{
                    errMessage += "\'" + item.itemNumber +  "\' ";
                }

            }
        }

        if(errMessage && items.length > 1 ){
            errMessage = "The following flow cell items were not added : " + errMessage + ". For a more detailed reason"
                + " you can try removing those items individually (listed above).";
            this.dialogsService.alert(errMessage, "Flow Cell Not Added");
        }


    }
    onDrop(event: any) {
        let items = event.element.data;
        if (items.Item) {
            items = Array.isArray(items.Item) ? items.Item : [items.Item];
        } else if (items) {
            items = Array.isArray(items) ? items : [items];
        } else {
            items = [];
        }

        this.prepareFlowCellSample(items);


    }

    allowDrop(element) {
        return true;
    }

    buildTree(projects: any[]) {
        for (let p of projects) {
            let requests: any[] = Array.isArray(p.Request) ? p.Request : p.Request ? [p.Request] : [];
            p.icon = this.constService.ICON_FOLDER;
            p.children = requests;
            for (let req of requests) {
                if (!req.icon) {
                    this.constService.getTreeIcon(req, "Request");
                }
                let sampItems: any[] = Array.isArray(req.Item) ? req.Item : req.Item ? [req.Item] : [];
                req.children = sampItems;

            }
        }
        this.itemList = projects;
    }

    onLabSelected(){
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set('idLab', this.idLab)
            .set('showSamples','Y')
            .set('showCategory','Y')
            .set('showMyLabsAlways', 'Y')
            .set('searchPublicProjects','Y');
        this.analysisService.getExperimentPickList(params).subscribe(resp =>{
            this.showSpinner = false;
            let projects: any[] = Array.isArray(resp) ? resp : resp.Project ? [resp.Project] : [];
            this.buildTree(projects);
        },(err:IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    onTreeSelected(event:ITreeNode){

    }
    onGridReady(event:GridReadyEvent){
        this.gridApi = event.api;
        this.gridApi.setRowData(this.lanes);
    }

    public onGridRowSelected(event: RowSelectedEvent): void {
        this.selectedSampleFlowCell = this.gridApi.getSelectedNodes();
    }

    onSplitDragEnd(event):void{
        this.gridApi.sizeColumnsToFit();
    }

    remove(event):void{

        for(let item  of this.selectedSampleFlowCell ){
            this.dialogsService.confirm("Confirm","Are you sure you want to remove Sample " + item.data.number + " ?")
                .subscribe(action => {
                    if(action){
                        let removeIndex:number = this.lanes.indexOf(item.data);
                        this.lanes.splice(removeIndex,1);
                        this.gridApi.setRowData(this.lanes);
                        this.selectedSampleFlowCell = [];
                        this._dirty = true;
                    }
                });
        }
    }
    clearAll(event):void{
        this.dialogsService.confirm("Confirm", "Are you sure you want to remove all samples?" )
            .subscribe(action => {
                this.lanes = [];
                this.gridApi.setRowData(this.lanes);
                this.selectedSampleFlowCell = [];
                this._dirty = true;
            });

    }
    cancel(){
        this.dialogsService.confirm("Confirm","Are you sure you want to continue without saving your changes?")
            .subscribe((action) =>{
                if(action){
                    this.dialogRef.close();
                }
            });
    }
    update(){
        this.data.sequenceLanes = this.lanes;
        this.dialogRef.close();
    }

}
