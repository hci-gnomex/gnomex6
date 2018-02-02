/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import { URLSearchParams } from "@angular/http";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTrackService} from "../../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import { ProgressBarModule } from "../../../../modules/progressbar.module";
import {jqxProgressBarComponent} from "../../../../assets/jqwidgets-ts/angular_jqxprogressbar";
import {Subscription} from "rxjs/Subscription";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ProgressService} from "../../../home/progress.service";

@Component({
    templateUrl:'./sequence-files-dialog.component.html',
    styles:[`        
        .dirtyWithSave{
            display: flex;
            justify-content: space-between;
            margin-left:auto;
        }
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

export class SequenceFilesDialog implements OnInit{
    private setSeqGridFunc:any;
    private idGenomeBuild:string;
    private fileInfoList:Array<any> = [];
    private importSeqFilesForm:FormGroup;
    private progressVal = 0;
    public dtName:string = "";
    private gridApi:any;






    public columnDefs = [
        {
            headerName: "File",
            field: "name",
            width: 155

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
                private datatrackService: DataTrackService, private progressService: ProgressService) {
        this.setSeqGridFunc = data.setRowDataFn;
        this.idGenomeBuild = data.idGenomeBuild;
        this.dtName = data.datatrackName;

    }

    ngOnInit(){

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

        this.save(this.fileInfoList,0);


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
                .first().subscribe(resp =>{
                        this.progressVal = ((idx + 1) / this.fileInfoList.length) * 100;
                        this.save(this.fileInfoList,idx + 1);

                });

        }
        else if( idx == this.fileInfoList.length){
            let params:URLSearchParams = new URLSearchParams();
            params.set("idGenomeBuild", this.idGenomeBuild);
            this.datatrackService.getGenomeBuild(params).first().subscribe( resp =>{
                let seqFiles = Array.isArray(resp.SequenceFiles.Dir.File) ? resp.SequenceFiles.Dir.File
                    : [ resp.SequenceFiles.Dir.File];
                this.setSeqGridFunc(seqFiles);
                this.progressVal = 0;
                this.dialogRef.close();
            });

        }


    }

}
