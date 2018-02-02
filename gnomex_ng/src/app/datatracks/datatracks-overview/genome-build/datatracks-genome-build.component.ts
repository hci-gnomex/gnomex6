
import {Component, OnInit, ViewChild,AfterViewInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../../util/tabs/primary-tab.component"
import { URLSearchParams } from "@angular/http";
import {TabContainer} from "../../../util/tabs/tab-container.component"
import {GenomeBuildValidateService} from "../../../services/genome-build-validate.service";
import {DataTrackService} from "../../../services/data-track.service";
import {DialogsService} from "../../../util/popup/dialogs.service";
import {GnomexStringUtilService} from "../../../services/gnomex-string-util.service";



@Component({

    template: `        
        <div style="display:block;height:100%;">
            
            <div style="padding-bottom: .5em;padding-left:1em;">
                <img [src]="dtService.datatrackListTreeNode.icon">Genome Build: {{dtService.datatrackListTreeNode.genomeBuildName}}
            </div>
            <div style="display:block;height:calc(100% - 4em);">
                <tab-container [state]="state" [componentNames]="componentNames">
                </tab-container>
                
            </div>
               
            <div style="display:block;height:4em;text-align: right">
                    <div>
                        <span *ngIf="gbValidateService.dirtyNote" style="background:#feec89; padding: 1em 1em 1em 1em;">
                            Your changes have not been saved
                        </span>
                        <span style="margin-left:1em; ">
                            <button [disabled]="!canWrite"  mat-button  color="primary" (click)="save()">
                                <img src="../../../assets/action_save.gif">Save
                            </button>
                        </span>
                    </div>
            </div>
            
        </div>
        
        
    `,
    styles: [`
        .flex-con{
            display: flex;
            justify-content: space-between;
            margin-left: auto;
            margin-top: 1em;
            padding-left: 1em;
        }
        
        .flex-container{
            display: flex;
            flex-direction: column;
            height: 100%;
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

    save():void{


        let params: URLSearchParams = new URLSearchParams();



        this.gbValidateService.emitValidateGenomeBuild();

        let messageList:Array<string> = this.gbValidateService.errorMessageList;

        if(messageList.length > 0){
            this.dialogService.confirm(messageList.join("\n"),null)
        }else{


            let segsObj = this.gbValidateService.segmentsList;
            let seqFilesObj = this.gbValidateService.sequenceFilesList;
            let idGenomeBuild:string = this.dtService.datatrackListTreeNode.idGenomeBuild;

            params.set("idGenomeBuild", idGenomeBuild);
            if(segsObj.length > 0){
                params.set("segmentsXML", JSON.stringify(segsObj));
            }
            if(seqFilesObj.length > 0){
                params.set("sequenceFilesToRemoveXML", JSON.stringify(seqFilesObj));
            }


            Object.keys(this.gbValidateService.detailsForm).forEach(key =>{
                if(key === "isActive"){
                    let value:string = this.gbValidateService.detailsForm[key] === true ? 'Y': 'N';
                    params.set(key, value);
                }else if(key === "buildDate"){
                    let date:Date = <Date>this.gbValidateService.detailsForm.buildDate;
                    params.set("buildDate", date.toLocaleDateString());
                }
                else{
                    params.set(key, this.gbValidateService.detailsForm[key]);
                }

            });

            this.dtService.saveGenomeBuild(params).subscribe(resp =>{
                 this.dtService.getDatatracksList_fromBackend(this.dtService.previousURLParams);
            });
        }


        this.gbValidateService.resetValidation();

    }

}




