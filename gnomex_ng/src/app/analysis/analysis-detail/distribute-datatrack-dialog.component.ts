import {Component, Inject, OnInit} from "@angular/core";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {GDAction} from "../../util/interfaces/generic-dialog-action.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {DictionaryService} from "../../services/dictionary.service";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {ColDef, GridApi, GridReadyEvent, RowNode} from "ag-grid-community";
import {AnalysisService} from "../../services/analysis.service";
import {IAnalysisFile} from "../../util/interfaces/analysis-file.model";
import * as _ from "lodash";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {DataTrackService} from "../../services/data-track.service";
import {FileService} from "../../services/file.service";

@Component({
    template: `
        <div  class="full-width full-height flex-container-col double-padded-left-right">
            <div class="flex-container-row">
                <mat-checkbox [(ngModel)]="selectAll" (change)="selectGrid($event)">
                    select all
                </mat-checkbox>
            </div>
            <div class="flex-grow">
                <ag-grid-angular class="ag-theme-balham full-height full-width"
                                 (gridReady)="this.onGridReady($event)"
                                 [rowSelection]="this.rowSelection"
                                 [groupSelectsChildren]="true"
                                 [getNodeChildDetails]="this.getNodeChildDetails"
                                 [enableColResize]="true">
                </ag-grid-angular>
            </div>

        </div>
    `,
})

export class DistributeDatatrackDialogComponent extends BaseGenericContainerDialog implements OnInit {

    public analysis: any;
    public gridData:any[] = [];
    private selectAll:boolean  = true;
    public rowSelection:string = "multiple";
    private idAnalysisFileSet: Set<string>;


    public columnDefs:ColDef[] =[
        {headerName: "Folder or File", field: "displayName", tooltipField: "displayName", cellRenderer: "agGroupCellRenderer",
            cellRendererParams: {innerRenderer: getDownloadGroupRenderer(), suppressCount: true}},
        {headerName: "Size", field: "fileSizeText", tooltipField: "fileSizeText", width: 150, maxWidth: 150, type: "numericColumn"},
        {headerName: "Datatrack Created", field: "hasDataTrack", width: 75},
        {headerName: "", checkboxSelection:true },
    ];
    private gridApi: GridApi;
    public getNodeChildDetails: (rowItem) => ({ expanded: boolean; children: any[]; key: any; group: boolean } | null);


    constructor(public dialogRef: MatDialogRef<DistributeDatatrackDialogComponent>,
                public constantsService: ConstantsService,
                private dictionaryService: DictionaryService,
                private datatrackService: DataTrackService,
                private fileService:FileService,
                private dialogsService: DialogsService,
                private analysisService: AnalysisService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
        this.gridData = this.data.gridData;
        this.analysis = this.data.analysis
    }

    ngOnInit() {

        this.getNodeChildDetails = (rowItem) =>  {
            let children: any[] = [];
            if (rowItem.FileDescriptor) {
                for (let fd of rowItem.FileDescriptor) {
                    let addFile:boolean = this.idAnalysisFileSet.has(fd.idAnalysisFileString);
                    if(fd.FileDescriptor ){
                        children.push(fd);
                    }else if(addFile){
                        children.push(fd);
                    }
                }
            }
            if (rowItem.AnalysisDownload) {
                for (let ad of rowItem.AnalysisDownload) {
                    let addFile:boolean = this.idAnalysisFileSet.has(ad.idAnalysisFileString);
                    if(ad.AnalysisDownload ){
                        children.push(ad);
                    }else if(addFile){
                        children.push(ad);
                    }
                }
            }
            if (children.length > 0) {
                return {
                    group: true,
                    expanded: false,
                    children: children,
                    key: rowItem.displayName
                };
            } else {
                return null;
            }
        };

    }

    onGridReady(event:GridReadyEvent){
        this.gridApi = event.api;
        this.gridApi.setColumnDefs(this.columnDefs);
        this.gridApi.sizeColumnsToFit();


        this.analysisService.getAnalysisFilesToDistribute(this.analysis.idAnalysis).subscribe((resp:any) => {
            let analysisFiles: IAnalysisFile[] = resp.AnalysisFiles;
            this.idAnalysisFileSet = new Set();

            for(let aFile of analysisFiles ){
                this.idAnalysisFileSet.add(aFile.idAnalysisFile);
            }

            this.gridData = this.filterTree(this.gridData, this.idAnalysisFileSet);
            this.gridApi.setRowData([this.gridData]);
            this.selectGrid(null);
        });



    }

    public selectGrid(event):void{
        if(this.selectAll){
            this.gridApi.selectAll();
        }else{
            this.gridApi.deselectAll();
        }
    }

    public save(): void {
        let idAnalysisFilesToDistribute: string[] = [];
        this.dialogsService.addSpinnerWorkItem();
        this.gridApi.forEachLeafNode((rowNode:RowNode) =>{
            if(rowNode.isSelected() &&
                (<string>rowNode.data.idAnalysisFileString).indexOf("AnalysisFile") === -1
                &&  rowNode.data.hasDataTrack === 'N' ){
                idAnalysisFilesToDistribute.push(rowNode.data.idAnalysisFileString);
            }
        });
        this.datatrackService.createAllDataTracks(this.analysis.idAnalysis, idAnalysisFilesToDistribute).subscribe((result: any) => {
            this.dialogsService.alert("Data tracks created for all applicable files", null, DialogType.SUCCESS);
            this.fileService.emitGetAnalysisOrganizeFiles({"idAnalysis" : this.analysis.idAnalysis  });
            this.dialogRef.close();
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }
    public cancel() :void{
        this.dialogRef.close();
    }

    recurseFilterTree(node:any, filterIDSet:Set<string>):any {
        if (!node.FileDescriptor && filterIDSet.has(node.idAnalysisFileString)) { // only leaf nodes will match id
            return node;
        }

        if (!node.FileDescriptor) { // leaf node case and it's just empty folder
            return null;
        }
        let fileDescriptor: any[] = <any[]>node.FileDescriptor;

        let tempFileDescriptor: any[] = [];
        for (let cNode of fileDescriptor) {
            let addLeaf = this.recurseFilterTree(cNode, filterIDSet);
            if (addLeaf) {
                tempFileDescriptor.push(cNode);
            }
        }

        if (tempFileDescriptor.length > 0) {
            node.FileDescriptor = tempFileDescriptor;
            return node;
        }

        return null


    }




    filterTree(root:any[],filterIDSet:Set<string>) : any {
        let copyTree = _.cloneDeep(root);
        return this.recurseFilterTree(root[0],filterIDSet)

    }

}

function getDownloadGroupRenderer() {
    function DownloadGroupRenderer() {
    }

    DownloadGroupRenderer.prototype.init = function(params) {
        let tempDiv = document.createElement("div");
        let textColor: string = params.data.displayColor ? params.data.displayColor : 'black';
        if (params.data.icon) {
            tempDiv.innerHTML = '<span style="color: ' + textColor + ';"><img src="' + params.data.icon + '" class="icon"/>' + params.value + '</span>';
        } else {
            tempDiv.innerHTML = '<span style="color: ' + textColor + ';">' + params.value + '</span>';
        }
        this.eGui = tempDiv.firstChild;
    };

    DownloadGroupRenderer.prototype.getGui = function() {
        return this.eGui;
    };

    return DownloadGroupRenderer;
}
