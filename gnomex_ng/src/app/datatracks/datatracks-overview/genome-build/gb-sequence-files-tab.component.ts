
import {Component, OnInit, ViewChild,AfterViewInit} from "@angular/core";
import {FormGroup, FormBuilder, Validators, FormControl} from "@angular/forms"
import {PrimaryTab} from "../../../util/tabs/primary-tab.component"
import {ActivatedRoute} from "@angular/router";
import {MatDialog, MatDialogRef} from "@angular/material";
import {ImportSegmentsDialog} from "./import-segments-dialog";
import {CreateSecurityAdvisorService} from "../../../services/create-security-advisor.service";
import {GridOptions} from "ag-grid";
import {ConstantsService} from "../../../services/constants.service";
import {SequenceFilesDialog} from "./sequence-files-dialog.component";
import {GenomeBuildValidateService} from "../../../services/genome-build-validate.service";
import {Subscription} from "rxjs/Subscription";
import {DataTrackService} from "../../../services/data-track.service";



@Component({

    template: `
        <span>
            <span> Sequence Files: {{this.rowData.length }} </span>
            <button mat-button [disabled]="!enableUpload" type="button" (click)="openSeqFilesDialog()">
                <img [src]="this.newPage"> Upload .bnib or fasta file(s)
            </button>
            <button mat-button [disabled]="!enableRemove"  type="button" (click)="removeSeqFiles()">
                <img [src]="this.removePage"> Remove file(s)
            </button>
        </span>
        <div style="display:block; height:100%; width:100%; padding-top: 1em;">
            <ag-grid-angular style="width: 100%; height: 90%;" class="ag-fresh"
                             [rowData]="rowData"
                             [columnDefs]="columnDefs"
                             [rowSelection]="'multiple'"
                             [rowDeselection]="true"
                             [enableSorting]="true"
                             [enableColResize]="true"
                             (rowSelected)="selectedRow($event)"
                             [gridOptions]="gridOpt">
            </ag-grid-angular>
            
        </div>
        
    `,
    styles: [`
        .form-field{
            margin-left: 1em;
            margin-right: 1em;
            font-size: 1.1rem;
            width:30%;
            resize:none;
        }
    `]

})
export class GBSequenceFilesTabComponent extends PrimaryTab implements OnInit{
    //Override
    name= "Sequence Files";
    private rowData:Array<any> = [];
    private gridOpt:GridOptions = {};
    private newPage:string;
    private removePage:string;
    private enableUpload:boolean = true;
    private enableRemove:boolean = false;
    private createSeqFilesDialogRef: MatDialogRef<SequenceFilesDialog>;
    private validSubscription:Subscription;
    private idGenomeBuild:string;

    private editable = ():boolean =>{
        return !this.secAdvisor.isGuest;
    };
    public setRowData = (filesInfo:Array<any>)=>{
        this.rowData = filesInfo;
    };



    private columnDefs = [
        {
            headerName: "Name",
            field: "name",
            width: 400

        },
        {
            headerName: "Date",
            field: "lastModified",
            width: 400
        },
        {
            headerName: "Size",
            field: "size",
            //cellEditorFramework: NumericEditorComponent,
            width: 500
        }

    ];


    constructor(protected fb: FormBuilder,private route:ActivatedRoute,
                private dialog: MatDialog,private secAdvisor:CreateSecurityAdvisorService,
                private datatracksService:DataTrackService, private constService:ConstantsService,
                private gbValidateService:GenomeBuildValidateService){
        super(fb);
    }
    ngOnInit():void{
        this.newPage = this.constService.PAGE_NEW;
        this.removePage = this.constService.PAGE_REMOVE_DISABLE;

        let canWrite:boolean = this.datatracksService.datatrackListTreeNode.canWrite === 'Y';
        this.enableUpload = canWrite;


        this.route.data.forEach(data =>{
            this.gbValidateService.resetValidation();
            if(data.genomeBuild.SequenceFiles && data.genomeBuild.SequenceFiles.Dir){
                let seqFiles = Array.isArray(data.genomeBuild.SequenceFiles.Dir.File) ? data.genomeBuild.SequenceFiles.Dir.File
                    : [ data.genomeBuild.SequenceFiles.Dir.File];
                this.rowData = seqFiles;
            }else{
                this.rowData = [];
            }

        });
        this.route.params.forEach(params =>{
            this.idGenomeBuild = params["idGenomeBuild"];
        });

    }
    openSeqFilesDialog():void{
        this.createSeqFilesDialogRef = this.dialog.open(SequenceFilesDialog,{
            data:{
                //importFn:this.importFn,
                idGenomeBuild: this.idGenomeBuild,
                setRowDataFn: this.setRowData,
                datatrackName: this.datatracksService.datatrackListTreeNode.genomeBuildName
            }
        });

    }
    //@Override
    tabVisibleHook(){
        this.gridOpt.api.sizeColumnsToFit();
    }

    selectedRow(event:any){
        let selectedRows:Array<any> = this.gridOpt.api.getSelectedRows();
        let canWrite:boolean = this.datatracksService.datatrackListTreeNode.canWrite === 'Y';

        if(selectedRows.length === 0 || !canWrite){
            this.enableRemove = false;
            this.removePage = this.constService.PAGE_REMOVE_DISABLE;
        }else{
            this.enableRemove = true;
            this.removePage = this.constService.PAGE_REMOVE;
        }

    }

    removeSeqFiles(){
        let selectedRows:Array<any> = this.gridOpt.api.getSelectedRows();
        let tmpRowData:Array<any> = this.rowData.slice();



        for(let i = 0; i < selectedRows.length; i++){
            tmpRowData = tmpRowData.filter( rowObj =>{
                let keepFile:boolean = rowObj.name !== selectedRows[i].name
                    || rowObj.url !== selectedRows[i].url ||
                    rowObj.lastModified !== selectedRows[i].lastModified ||
                    rowObj.size !== selectedRows[i].size;

                if(!keepFile){
                    this.gbValidateService.sequenceFilesList.push(rowObj);
                }
                return keepFile;
            });


        }
        this.gbValidateService.dirtyNote = true;

        this.rowData = tmpRowData;

    }







}




