
import {Component, OnInit, ViewChild, AfterViewInit, OnDestroy} from "@angular/core";
import {AnalysisService} from "../../services/analysis.service";
import {ActivatedRoute} from "@angular/router";
import {IAnnotation} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";
import {OrderType} from "../../util/annotation-tab.component";
import {Subscription} from "rxjs/Subscription";
import {IRelatedObject} from "../../util/interfaces/related-objects.model";
import {ExperimentsService} from "../experiments.service";
import {MatTabChangeEvent} from "@angular/material";
import {DictionaryService} from "../../services/dictionary.service";
import {GnomexService} from "../../services/gnomex.service";


@Component({
    templateUrl:'./experiment-detail-overview.component.html',
    styles:[`
        
        .bordered{ border: 1px solid #e8e8e8; }
        
    `]
})
export class ExperimentDetailOverviewComponent implements OnInit, OnDestroy{
    public annotations:any = [];
    public experiment:any;
    types = OrderType;
    private overviewListSubscription : Subscription;
    private experimentOverviewNode:any;
    private relatedObjects:IRelatedObject = {};
    private showRelatedDataTab:boolean =false;
    public initDescriptionTab = false;

    public showBioinformaticsTab: boolean = false;

    private requestCategory: any;


    constructor(private dictionaryService: DictionaryService,
                private experimentService: ExperimentsService,
                private gnomexService: GnomexService,
                private route: ActivatedRoute) {
    }

    ngOnInit(): void {

        this.overviewListSubscription = this.experimentService.getExperimentOverviewListSubject().subscribe(data => {
            this.experimentOverviewNode = data;
        });

        this.route.data.forEach((data: any) => {
            this.experiment = null;

            if (data && data.experiment) {
                this.experiment = data.experiment.Request;
            }

            if (this.experiment) {
                if (!this.requestCategory || this.requestCategory.codeRequestCategory !== this.experiment.codeRequestCategory) {
                    this.requestCategory = this.dictionaryService.getEntry('hci.gnomex.model.RequestCategory', this.experiment.codeRequestCategory);

                    this.showBioinformaticsTab = this.requestCategory
                        && this.requestCategory.type !== this.gnomexService.TYPE_MICROARRAY
                        && (this.requestCategory.type === this.gnomexService.TYPE_NANOSTRING
                            || (this.requestCategory.isIlluminaType === 'Y' && this.gnomexService.submitInternalExperiment())
                            || (this.requestCategory.isIlluminaType === 'Y' && this.experiment && this.experiment.isExternal !== 'Y'));
                }

                let annots = this.experiment.RequestProperties;
                this.showRelatedDataTab = this.initRelatedData(this.experiment);

                if (annots) {
                    this.annotations = Array.isArray(annots) ? <IAnnotation[]>annots : <IAnnotation[]>[annots];
                    for (let i = 0; i < this.annotations.length; i++) {
                        let propertyOptions = this.annotations[i].PropertyOption;
                        if (propertyOptions) {
                            this.annotations[i].PropertyOption =  Array.isArray(propertyOptions)? propertyOptions :  <IAnnotationOption[]>[propertyOptions];
                        }
                    }
                } else {
                    this.annotations = [];
                }
            }
        });
    }

    ngOnDestroy(){
        this.overviewListSubscription.unsubscribe();
    }


    initRelatedData(experiment: any): boolean {

        let rObjects = experiment.relatedObjects;
        let relatedTopics = experiment.relatedTopics;

        if(rObjects){

            if (rObjects.Analysis) {
                let order:Array<any> =  rObjects.Analysis;
                this.relatedObjects.Analysis = Array.isArray(order) ? order : [order];
            }
            if (rObjects.DataTrack) {
                let order:Array<any> =   rObjects.DataTrack;
                this.relatedObjects.DataTrack = Array.isArray(order) ? order : [order];
            }
            if (rObjects.Request) {
                let order:Array<any> =   rObjects.Request;
                this.relatedObjects.Request = Array.isArray(order) ? order : [order];
            }
            if (relatedTopics) {
                let topics:Array<any> = relatedTopics.Topic;
                if (topics) {
                    this.relatedObjects.Topic = Array.isArray(topics) ? topics : [topics];
                }
            }

            return !!(this.relatedObjects.Topic || this.relatedObjects.Analysis || this.relatedObjects.Request || this.relatedObjects.DataTrack); // !! converts to boolean statement
        } else {
            return false;
        }
    }

    tabChanged(event:MatTabChangeEvent){
        if (event.tab.textLabel === "Description") {
            this.initDescriptionTab = true;
        } else {
            this.initDescriptionTab = false;
        }
    }

    save() {

    }
}