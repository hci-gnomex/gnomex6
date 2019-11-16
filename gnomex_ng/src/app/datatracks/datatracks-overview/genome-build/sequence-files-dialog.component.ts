import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Component, Inject, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DataTrackService} from "../../../services/data-track.service";
import {first} from "rxjs/operators";
import {DialogsService} from "../../../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {BaseGenericContainerDialog} from "../../../util/popup/base-generic-container-dialog";
import {UtilService} from "../../../services/util.service";
import {IGnomexErrorResponse} from "../../../util/interfaces/gnomex-error.response.model";

@Component({
    template: `
        <div class="flex-container-col full-width full-height padded">
            <div style="background-color: #eeeeeb; border:thin;">
                <label class="fileContainer">
                    Select
                    <input  type="file" (change)="fileChange($event)" style="width: 70%;" accept=".bnib,.fasta" multiple>
                </label>
                <div style="height:25em; width:100%; margin-top:0.5em;">
                    <ag-grid-angular style="width: 100%; height: 100%;" class="ag-theme-fresh"
                                     [rowData]="rowData"
                                     [columnDefs]="columnDefs"
                                     [rowSelection]="'single'"
                                     [enableSorting]="true"
                                     [enableColResize]="true"
                                     [rowDeselection]="true"
                                     (gridReady)="onGridReady($event)">
                    </ag-grid-angular>
                </div>
            </div>
            <div style="margin-top: 1em">
                <mat-progress-bar
                        color="'primary'"
                        mode="'determinate'"
                        [value]="progressVal">
                </mat-progress-bar>
            </div>
        </div>
    `,
    styles: [`
        .fileContainer {
            overflow: hidden;
            position: relative;
        }

        .fileContainer [type=file] {
            cursor: inherit;
            display: block;
            font-size: 999px;
            filter: alpha(opacity=0);
            min-height: 100%;
            min-width: 100%;
            opacity: 0;
            position: absolute;
            right: 0;
            text-align: right;
            top: 0;
        }

        /* Example stylistic flourishes */

        .fileContainer {
            background: none;
            border-radius: .1em;
            padding: .5em;
            text-decoration: underline;
        }

        .fileContainer:hover{
            background: #F3FFFF;
        }

        .fileContainer [type=file] {
            cursor: pointer;
        }
    `]

})

export class SequenceFilesDialog extends BaseGenericContainerDialog implements OnInit{
    private setSeqGridFunc:any;
    private idGenomeBuild:string;
    private fileInfoList:Array<any> = [];
    private importSeqFilesForm:FormGroup;
    public progressVal = 0;
    public dtName:string = "";
    private gridApi:any;

    public columnDefs = [
        {
            headerName: "File",
            field: "name",
            width: 310

        },
        {
            headerName: "File Type",
            field: "type",
            width: 155
        },
        {
            headerName: "File Size",
            field: "size",
            //cellEditorFramework: NumericEditorComponent,
            width: 155
        }

    ];

    public rowData = [];


    constructor(private dialogRef: MatDialogRef<SequenceFilesDialog>,
                @Inject(MAT_DIALOG_DATA) private data: any, private fb: FormBuilder,
                private dialogService: DialogsService,
                private datatrackService: DataTrackService) {
        super();
        if(this.data) {
            this.setSeqGridFunc = data.setRowDataFn;
            this.idGenomeBuild = data.idGenomeBuild;
            this.dtName = data.datatrackName;
        }

    }

    ngOnInit(){
        this.dtName = UtilService.getSubStr(this.dtName, 25);
        this.innerTitle = "Upload sequence files for: " + this.dtName;

    }
    onGridReady(params){
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }


    fileChange(event){
        let fileList = event.target.files;

        if(fileList){
            for(let i = 0; i < fileList.length; i++){
                let file:File = fileList[i];
                let name = file.name;
                let type:string = "";
                let size =  file.size.toLocaleString();
                let sizeNum:number = +(size.replace(",",""));
                let bytesToKilo = Math.trunc(sizeNum/1024).toLocaleString() + " kb";
                type = (name.split("."))[1];

                this.fileInfoList.push({'file':file,'name':name,'type':type,'size':bytesToKilo});
            }
            this.rowData = this.fileInfoList;
        }else{
            this.rowData = [];
        }

    }


    setUpSave(){
        this.save(this.fileInfoList, 0);
    }

    save(fileListInfo:Array<any>,idx:number){

        if(fileListInfo.length > 0 && idx < this.fileInfoList.length ){
            let formData: FormData = new FormData();
            let fileInfo =  fileListInfo[idx];
            let fileCount:number = this.fileInfoList.length;

            formData.append("Filename", fileInfo.name);
            formData.append("idGenomeBuild",this.idGenomeBuild);
            formData.append("Filedata", fileInfo.file, fileInfo.name );
            formData.append("Upload", "Submit Query");

            this.datatrackService.getImportSeqFiles(formData)
                .pipe(first()).subscribe(resp =>{
                        this.progressVal = ((idx + 1) / this.fileInfoList.length) * 100;
                        this.save(this.fileInfoList,idx + 1);

                });

        } else if( idx === this.fileInfoList.length){
            let params: HttpParams = new HttpParams()
                .set("idGenomeBuild", this.idGenomeBuild);
            this.datatrackService.getGenomeBuild(params).pipe(first()).subscribe( resp => {
                let seqFiles = Array.isArray(resp.SequenceFiles.Dir.File) ? resp.SequenceFiles.Dir.File
                    : [ resp.SequenceFiles.Dir.File];
                this.setSeqGridFunc(seqFiles);
                this.progressVal = 0;
                this.dialogRef.close();
            }, (err: IGnomexErrorResponse) => {
            });

        }
    }

}
