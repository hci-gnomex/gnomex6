import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import {GridApi, GridReadyEvent} from "ag-grid-community";
import {UploadFileService} from "../../services/upload-file.service";
import {IFileParams} from "../interfaces/file-params.model";
import {ConstantsService} from "../../services/constants.service";
import {Subscription} from "rxjs";
import {FileService} from "../../services/file.service";
import {DialogsService} from "../popup/dialogs.service";
import {take} from "rxjs/operators";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {saveAs} from 'file-saver';
import {PropertyService} from "../../services/property.service";
import {IGnomexErrorResponse} from "../interfaces/gnomex-error.response.model";
import {UtilService} from "../../services/util.service";

@Component({
    selector: 'upload-file',
    templateUrl: './upload-file.component.html',
    styles: [`
        .add-files-btn {
            float: right;
        }

        .primary-action {
            background-color: var(--bluewarmvivid-medlight);
            font-weight: bolder;
            color: white;
        }
        .secondary-action {
            background-color: var(--sidebar-footer-background-color);
            font-weight: bolder;
            color: var(--bluewarmvivid-medlight);
            border: var(--bluewarmvivid-medlight)  solid 1px;
        }

        :host {
            height: 100%;
            display: flex;
            flex: 1;
            flex-direction: column;
        }
        .no-padding {
            padding: 0;
        }
        .no-margin {
            margin: 0;
        }

    `]
})
export class UploadFileComponent implements OnInit {
    @ViewChild('file') file;
    @Input('manageData') manageData: IFileParams;
    @Output() navToTab = new EventEmitter();
    public progressVal = 0;
    private pCount:number = 0;
    gridApi: GridApi;
    primaryButtonText = 'Upload';
    rowData:any[] = [];
    public files: Set<File> = new Set();
    selectedIndex:number = -1;
    selectedRowList:any[] = [];
    url:string = '';
    allowFDTButton:boolean;
    private uploadURLSubscription: Subscription;
    private uploadSubscription: Subscription;
    private orgExperimentFileParams:any;
    private orgAnalysisFileParams:any;



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



    constructor(public dialogRef: MatDialogRef<UploadFileComponent>,
                public uploadService: UploadFileService,
                private dialogService: DialogsService,
                public constService: ConstantsService,
                public secAdvisor: CreateSecurityAdvisorService,
                private propertyService: PropertyService,
                private fileService: FileService) {}

    ngOnInit() {
        if(this.manageData){
            if(this.manageData.type === 'e'){
                this.orgExperimentFileParams = {
                    idRequest: this.manageData.id.idRequest,
                    includeUploadStagingDir: 'N',
                    showUploads: 'Y'
                };
            }else{
                this.orgAnalysisFileParams = {
                    idAnalysis:this.manageData.id.idAnalysis,
                    showUploads:'Y',
                    includeUploadStagingDir:'N',
                    skipUploadStagingDirFiles: 'Y'
                };
            }
            if(this.manageData.isFDT){
                this.primaryButtonText = "Start";
                this.allowFDTButton = true;
            }

        }

        this.uploadURLSubscription =  this.fileService.getUploadOrderUrl(this.manageData.uploadURL).subscribe(resp =>{
            if(resp && resp.url){
                this.url = UtilService.getUrlString(resp.url);
            }
        },(err:IGnomexErrorResponse) =>{
            this.dialogService.stopAllSpinnerDialogs();
        });


    }

    onGridReady(event:GridReadyEvent){
        this.gridApi = event.api;
        this.gridApi.sizeColumnsToFit();
        this.gridApi.setRowData(this.rowData);

    }
    sizeGridColumns():void{
        this.gridApi.sizeColumnsToFit();
    }

    selectedRow(event:any){
        this.selectedRowList = this.gridApi.getSelectedRows();
        if(event.node.selected){
            this.selectedIndex = event.rowIndex;
        }
    }



    onFilesAdded() {
        this.progressVal = 0;
        const files: { [key: string]: File } = this.file.nativeElement.files;
        for (let key in files) {
            if (!isNaN(parseInt(key))) {
                let file:File = files[key];
                this.files.add(file);

                let name = file.name;
                let type:string = "";
                let size:number =  file.size;
                let bytesToKilo = Math.trunc(size/1024).toLocaleString() + " kb";
                type = name.substring(name.lastIndexOf('.') + 1);
                this.rowData.push({'file':file,'name':name,'type':type,'size':bytesToKilo});
            }
        }


        this.gridApi.setRowData( this.rowData );
    }

    addFile() {
        this.file.nativeElement.click();
    }
    removeFile(){
        if(this.selectedRowList && this.selectedRowList.length > 0){
            this.rowData.splice(this.selectedIndex,1);
            this.gridApi.setRowData(this.rowData);
        }
    }
    removeAllFiles(){
        this.rowData = [];
        this.gridApi.setRowData(this.rowData);
        this.selectedRowList = [];
    }

    upload() {
        if(this.primaryButtonText === 'Cancel'){
            this.uploadSubscription.unsubscribe();
            this.primaryButtonText = "Upload";
            return;
        }
        this.primaryButtonText = "Cancel";

        if(!this.manageData.isFDT){
            this.progressVal = 0;
            this.pCount = 0;

            this.uploadSubscription = this.uploadService.uploadFromBrowse(this.rowData, this.url, this.manageData.id)
                .pipe(take(this.rowData.length)).subscribe( resp =>{
                this.pCount++;
                this.progressVal = ((this.pCount) / this.rowData.length) * 100;
                if(this.pCount === this.rowData.length){
                    this.rowData = [];
                    this.gridApi.setRowData(this.rowData = []);
                    if(this.manageData.type === 'e'){
                        this.fileService.emitGetRequestOrganizeFiles(this.orgExperimentFileParams);
                        let p = this.propertyService.getProperty(PropertyService.PROPERTY_EXPERIMENT_FILE_SAMPLE_LINKING_ENABLED);
                        if(p.propertyValue && p.propertyValue === 'Y'){
                           this.fileService.emitGetLinkedSampleFiles({idRequest: this.manageData.id['idRequest']})
                        }
                    }else{
                        this.fileService.emitGetAnalysisOrganizeFiles(this.orgAnalysisFileParams);
                    }

                    this.primaryButtonText = "Upload";
                    this.navToTab.emit(1);

                }
            },error =>{
                this.rowData = [];
                this.gridApi.setRowData(this.rowData = []);
                this.dialogService.error(error);
                this.primaryButtonText = "Upload";
            });
        }else{
            this.allowFDTButton = false;
            this.uploadService.startFDTUpload(this.manageData.id).subscribe(fileBlob =>{
                saveAs(fileBlob,"gnomex.jnlp" );
            });
        }
    }

    ngOnDestroy(){
        this.uploadURLSubscription.unsubscribe();
    }
}
