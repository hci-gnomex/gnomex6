
import {Component, OnInit, ViewChild, AfterViewInit, OnDestroy} from "@angular/core";
import {AnalysisService} from "../../services/analysis.service";
import {ActivatedRoute} from "@angular/router";
import {IAnnotation} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";
import {OrderType} from "../../util/annotation-tab.component";
import {Subscription} from "rxjs/Subscription";
import {IRelatedObject} from "../../util/interfaces/related-objects.model";
import {MatTabChangeEvent} from "@angular/material";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";


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


    constructor(private analysisService: AnalysisService,
                private route:ActivatedRoute,
                public orderValidateService: BrowseOrderValidateService) {
    }

    ngOnInit():void{

        this.route.data.forEach(data => {
            this.orderValidateService.dirtyNote = false;

            this.analysis = data.analysis.Analysis;
            this.lab = data.analysis.Lab;
            if(this.analysis){
                let annots = this.analysis.AnalysisProperties;
                this.showRelatedDataTab = this.initRelatedData(this.analysis);

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


    save(){

    }

    ngOnDestroy(){
    }


}




