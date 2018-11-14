
import {Component, OnInit, ViewChild, AfterViewInit, OnDestroy} from "@angular/core";
import {AnalysisService} from "../../services/analysis.service";
import {ActivatedRoute} from "@angular/router";
import {IAnnotation} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";
import {OrderType} from "../../util/annotation-tab.component";
import {Subscription} from "rxjs";
import {IRelatedObject} from "../../util/interfaces/related-objects.model";
import {MatDialog, MatDialogConfig, MatDialogRef, MatTabChangeEvent} from "@angular/material";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";
import {ConstantsService} from "../../services/constants.service";
import {ImportSegmentsDialog} from "../../datatracks/datatracks-overview/genome-build/import-segments-dialog";
import {LinkToExperimentDialogComponent} from "./index";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";


@Component({

    templateUrl:'./analysis-detail-overview.component.html'
    ,
    styles:[`
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
            width:100%;
        }
    `]
})
export class AnalysisDetailOverviewComponent  implements OnInit, OnDestroy{
    public annotations:any = [];
    public analysis:any;
    public lab: any;
    types = OrderType;
    private relatedObjects:IRelatedObject = {};
    private showRelatedDataTab:boolean =false;
    private showExpAnalysisTab: boolean =false ;
    private showLinkToExp:boolean = false;

    public analysisTreeNode:any;
    private analysisTreeNodeSubscription: Subscription;
    private linkExpDialogRef: MatDialogRef<LinkToExperimentDialogComponent>;


    constructor(private analysisService: AnalysisService,
                private route:ActivatedRoute,
                private dialog: MatDialog,
                private secAdvisor: CreateSecurityAdvisorService,
                public constService: ConstantsService,
                public orderValidateService: BrowseOrderValidateService) {
    }

    ngOnInit():void{
        this.analysisTreeNodeSubscription = this.analysisService.getAnalysisOverviewListSubject().subscribe(node =>{
            this.analysisTreeNode = node;


        });

        this.route.data.forEach(data => {
            this.orderValidateService.dirtyNote = false;

            this.analysis = data.analysis.Analysis;
            this.lab = data.analysis.Lab;
            if(this.analysis){
                let annots = this.analysis.AnalysisProperties;
                this.showRelatedDataTab = this.initRelatedData(this.analysis);
                this.showLinkToExp = !this.secAdvisor.isGuest && this.analysis.canRead === 'Y';

                if(annots){
                    this.annotations = Array.isArray(annots) ? <IAnnotation[]>annots : <IAnnotation[]>[annots];
                    for(let i = 0; i < this.annotations.length; i++){
                        let propertyOptions = this.annotations[i].PropertyOption;
                        if(propertyOptions){
                            this.annotations[i].PropertyOption =  Array.isArray(propertyOptions)? propertyOptions :  <IAnnotationOption[]>[propertyOptions];
                        }
                    }
                }else{
                    this.annotations = [];
                }
            }

        });
    }

    initRelatedData(analysis:any):boolean {

        this.relatedObjects = {};
        let rObjects = analysis.relatedObjects;
        let relatedTopics = analysis.relatedTopics;

        if(rObjects){

            if(rObjects.Analysis){
                let order:Array<any> =  rObjects.Analysis;
                this.relatedObjects.Analysis = Array.isArray(order) ? order : [order];
            }
            if(rObjects.DataTrack){
                let order:Array<any> =   rObjects.DataTrack;
                this.relatedObjects.DataTrack = Array.isArray(order) ? order : [order];
            }
            if(rObjects.Request){
                let order:Array<any> =   rObjects.Request;
                this.relatedObjects.Request = Array.isArray(order) ? order : [order];
            }
            if(relatedTopics){
                let topics:Array<any> = relatedTopics.Topic;
                if(topics){
                    this.relatedObjects.Topic = Array.isArray(topics) ? topics : [topics];
                }
            }

            return !!(this.relatedObjects.Topic || this.relatedObjects.Analysis || this.relatedObjects.Request || this.relatedObjects.DataTrack); // !! converts to boolean statement
        }else{
            return false;
        }

    }
    tabChanged(event:MatTabChangeEvent){
       this.showExpAnalysisTab = event.tab.textLabel === "Experiment"
    }

    makeLinkToExperiment(){
        let config: MatDialogConfig = new MatDialogConfig();
        config.panelClass = 'no-padding-dialog';
        config.data = {
            idAnalysis : this.analysis ? this.analysis.idAnalysis : '',
            idLab: this.analysis ? this.analysis.idLab : ''
        };


        this.linkExpDialogRef = this.dialog.open(LinkToExperimentDialogComponent, config );



    }

    save(){

    }

    ngOnDestroy(){
        this.analysisTreeNodeSubscription.unsubscribe();
    }


}




