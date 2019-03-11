
import {Component, OnInit, ViewChild,AfterViewInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../../util/tabs/primary-tab.component"
import { URLSearchParams } from "@angular/http";
import {TabContainer} from "../../../util/tabs/tab-container.component"
import {GenomeBuildValidateService} from "../../../services/genome-build-validate.service";
import {DataTrackService} from "../../../services/data-track.service";
import {DialogsService} from "../../../util/popup/dialogs.service";
import {GnomexStringUtilService} from "../../../services/gnomex-string-util.service";
import {MatTabChangeEvent} from "@angular/material";
import {HttpParams} from "@angular/common/http";



@Component({

    template: `        
        <div style="display:flex; flex-direction:column; height:100%; width:100%;">
            
            <div style="padding-bottom: .5em;padding-left:1em;">
                <img [src]="dtService.datatrackListTreeNode.icon">Genome Build: {{dtService.datatrackListTreeNode.genomeBuildName}}
            </div>
            <div style="display:flex; flex: 1;">
                
                <mat-tab-group style="height:100%; width:100%;" class="mat-tab-group-border" (selectedTabChange)="tabChanged($event)">
                    <mat-tab style="height:100%" label="Details">
                        <gb-detail></gb-detail>
                    </mat-tab>
                    <mat-tab style="height:100%" label="Segments">
                        <gb-segment></gb-segment>
                    </mat-tab>
                    <mat-tab style="height:100%;" label="Sequences Files">
                        <gb-sequence-files-tab></gb-sequence-files-tab>
                    </mat-tab>
                </mat-tab-group>
                    
               <!-- <tab-container [state]="state" [componentNames]="componentNames">
                </tab-container> -->
            </div>
            <div>
                <save-footer (saveClicked)="save()" [disableSave]="!canWrite" [dirty]="gbValidateService.dirtyNote" ></save-footer>
            </div>
            
            
            
        </div>
        
        
    `,
    styles: [`
        
        
        .flex-container{
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        /deep/ .mat-tab-body-wrapper {
            flex-grow: 1 !important;
        }
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }



    `]
})
export class DatatracksGenomeBuildComponent implements OnInit{
    //Override
    private componentNames:Array<String>;
    public state:string = TabContainer.VIEW;
    @ViewChild(TabContainer) tabs: TabContainer;
    private canWrite:boolean = false;

    constructor(private gbValidateService: GenomeBuildValidateService,
                private dtService: DataTrackService,private dialogService:DialogsService){

    }

    ngOnInit():void{
        this.componentNames = ["GBDetailTabComponent","GBSegmentsTabComponent","GBSequenceFilesTabComponent"];
        this.canWrite = this.dtService.datatrackListTreeNode.canWrite === 'Y';

    }

    tabChanged(event:MatTabChangeEvent){

    }

    save():void{


        let params: HttpParams = new HttpParams();



        this.gbValidateService.emitValidateGenomeBuild();

        let messageList:Array<string> = this.gbValidateService.errorMessageList;

        if(messageList.length > 0){
            this.dialogService.confirm(messageList.join("\n"),null)
        }else{


            let segsObj = this.gbValidateService.segmentsList;
            let seqFilesObj = this.gbValidateService.sequenceFilesList;
            let idGenomeBuild:string = this.dtService.datatrackListTreeNode.idGenomeBuild;

            params = params.set("idGenomeBuild", idGenomeBuild);
            if(segsObj.length > 0){
                params = params.set("segmentsXML", JSON.stringify(segsObj));
            }
            if(seqFilesObj.length > 0){
                params = params.set("sequenceFilesToRemoveXML", JSON.stringify(seqFilesObj));
            }


            Object.keys(this.gbValidateService.detailsForm).forEach(key =>{
                if(key === "isActive"){
                    let value:string = this.gbValidateService.detailsForm[key] === true ? 'Y': 'N';
                    params = params.set(key, value);
                }else if(key === "buildDate"){
                    let date:Date = <Date>this.gbValidateService.detailsForm.buildDate;
                    params = params.set("buildDate", date.toLocaleDateString());
                }
                else{
                    params = params.set(key, this.gbValidateService.detailsForm[key]);
                }

            });

            this.dtService.saveGenomeBuild(params).subscribe(() => {
                 this.dtService.getDatatracksList_fromBackend(this.dtService.previousURLParams);
            });
        }


        this.gbValidateService.resetValidation();

    }

}




