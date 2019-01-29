

import {Component, Inject, OnInit} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA, MatTabChangeEvent} from "@angular/material";
import * as _ from "lodash";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PropertyService} from "../../services/property.service";
import {IFileParams} from "../interfaces/file-params.model";



@Component({
    template:`
        <div class="full-height full-width flex-container-col">
            <div mat-dialog-title class="padded-outer">
                <div class="dialog-header-colors padded-inner">
                    Upload Files
                </div>
            </div>
            <div mat-dialog-content class="full-height" style="margin: 0; padding: 0;">
                <div style="padding:0.5em;" class="full-height full-width flex-container-col">
                    <mat-tab-group [(selectedIndex)]="this.selectedTabIndex" 
                                   (selectedTabChange)="tabChanged($event)" 
                                   class="mat-tab-group-border full-height full-width">
                        <mat-tab class="full-height" label="Upload">
                           <upload-file (navToTab)="tabNavigateTo($event)" [manageData]="this.manageData"> </upload-file> 
                        </mat-tab>
                        <mat-tab class="full-height" label="Organize Files">
                            <ng-template matTabContent>
                                <organize-file  (closeDialog)="onCloseDialog()"
                                                [manageData]="this.manageData">
                                </organize-file>
                                
                            </ng-template>
                            
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
    formGroup:FormGroup;
    manageData:IFileParams;
    selectedTabIndex:number = 0;




    constructor(private dialogRef: MatDialogRef<ManageFilesDialogComponent>,
                public constService:ConstantsService,private fb:FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data,private propertyService: PropertyService) {
    }

    ngOnInit(){
        let type= '';
        let uploadURL = '';
        let idObj:any = null;
        if(this.data){
            let isFDT: boolean = this.data.isFDT;
            if(this.data.startTabIndex){
                this.selectedTabIndex = this.data.startTabIndex;
            }else{
                this.selectedTabIndex = 0;
            }

            if(this.data.order.idRequest){
                type= 'e';
                uploadURL = "/gnomex/UploadExperimentURLServlet.gx";
                idObj = {idRequest: this.data.order.idRequest }
            }else if(this.data.order.idAnalysis){
                type= 'a';
                uploadURL = "/gnomex/UploadAnalysisURLServlet.gx";
                idObj = {idAnalysis: this.data.order.idAnalysis};

            }
            this.manageData =_.cloneDeep({
                type:type,
                uploadURL: uploadURL,
                id: idObj,
                isFDT: this.data.isFDT
            });
        }
    }
    tabChanged(event:MatTabChangeEvent){
    }
    tabNavigateTo(index){
        this.selectedTabIndex = index;
    }


    onCloseDialog(){
        this.dialogRef.close();
    }


}