

import {Component, Inject, OnInit} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA, MatTabChangeEvent} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PropertyService} from "../../services/property.service";
import {IFileParams} from "../../util/interfaces/file-params.model";



@Component({
    template:`
        <div class="full-height full-width flex-container-col">
            <div mat-dialog-title class="padded-outer">
                <div class="dialog-header-colors padded-inner">
                    Upload Files for Analysis 
                </div>
            </div>
            <div mat-dialog-content class="full-height" style="margin: 0; padding: 0;">
                <div style="padding:0.5em;" class="full-height full-width flex-container-col">
                    <mat-tab-group (selectedTabChange)="tabChanged($event)" class="mat-tab-group-border full-height full-width">
                        <mat-tab class="full-height" label="Upload">
                            <!--<div>-->
                                <!--Hello I am a paragraph thing-->
                            <!--</div>-->
                            <!--Hello I am a paragraph thing-->
                           <upload-file [manageData]="this.manageData"> </upload-file> 
                        </mat-tab>
                        <mat-tab class="full-height" label="Organize Files">
                            <organize-file (closeDialog)="onCloseDialog()" [tabVisible]="isOrganizeVisible"> </organize-file> 
                            <!--<div>-->
                                <!--Hello I am a paragraph thing-->
                            <!--</div>-->
                        </mat-tab>
                    </mat-tab-group>
                </div>
            </div>
        </div>



    `,
    styles: [`

        .padded-outer{
            margin:0;
            padding:0;
        }
        .padded-inner{
            padding:0.3em;

        }
        mat-form-field.medium-form-input{
            width: 20em;
            margin-right: 1em;
        }
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }




    `]
})
export class ManageFilesDialogComponent implements OnInit{

    order:any;
    orderDownloadList:any;
    formGroup:FormGroup;
    uploadURL: string;
    manageData:IFileParams;
    isOrganizeVisible:boolean = false;




    constructor(private dialogRef: MatDialogRef<ManageFilesDialogComponent>,
                public constService:ConstantsService,private fb:FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data,private propertyService: PropertyService) {
        if (this.data) {
            if(this.data.order){
                let type= '';
                let uploadURL = '';
                let idObj:any = null;

                if(this.data.order.idRequest){
                    type= 'e';
                    uploadURL = "/gnomex/UploadAnalysisFileServlet.gx";
                    idObj = {idRequest: this.data.order.idRequest }
                }else if(this.data.order.idAnalysis){
                    type= 'a';
                    uploadURL = "/gnomex/UploadExperimentFileServlet.gx";
                    idObj = {idAnalysis: this.data.order.idAnalysis};

                }

                let order = this.data.order;
                let orderDownloadList = this.data.orderDownloadList;

                this.manageData = {
                    type:type,
                    uploadURL: uploadURL,
                    order: order,
                    id: idObj,
                    orderDownloadList: orderDownloadList,

                }

            }
        }
    }

    ngOnInit(){

    }
    tabChanged(event:MatTabChangeEvent){
        this.isOrganizeVisible = event.tab.textLabel === "Organize Files"
    }
    onCloseDialog(){
        this.dialogRef.close();
    }


}