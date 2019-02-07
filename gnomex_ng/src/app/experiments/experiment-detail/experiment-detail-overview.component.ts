import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {IAnnotation} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";
import {OrderType} from "../../util/annotation-tab.component";
import {IRelatedObject} from "../../util/interfaces/related-objects.model";
import {ExperimentsService} from "../experiments.service";
import {MatTabChangeEvent} from "@angular/material";
import {DictionaryService} from "../../services/dictionary.service";
import {GnomexService} from "../../services/gnomex.service";
import {Subscription} from "rxjs";
import {ExperimentSequenceLanesTab} from "./experiment-sequence-lanes-tab";
import {Experiment} from "../../util/models/experiment.model";
import {PropertyService} from "../../services/property.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {TabSamplesIlluminaComponent} from "../new-experiment/tab-samples-illumina.component";

@Component({
    templateUrl: "./experiment-detail-overview.component.html",
    styles: [`

        .bordered {
            border: 1px solid #e8e8e8;
        }

    `],
})
export class ExperimentDetailOverviewComponent implements OnInit, OnDestroy {
    public annotations: any = [];
    public experiment: any;
    public _experiment: Experiment;
    types = OrderType;
    public showMaterialsMethodsTab: boolean = false;
    public initDescriptionTab = false;
    public showBioinformaticsTab: boolean = false;
    public showSequenceLanesTab: boolean = false;
    private overviewListSubscription: Subscription;
    private experimentOverviewNode: any;
    private relatedObjects: IRelatedObject = {};
    private showRelatedDataTab: boolean = false;
    private requestCategory: any;

    @ViewChild(ExperimentSequenceLanesTab) private sequenceLanesTab: ExperimentSequenceLanesTab;

    @ViewChild('tabSamplesIlluminaComponent') private tabSamplesIlluminaComponent: TabSamplesIlluminaComponent;

    constructor(private securityAdvisor: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService,
                private experimentService: ExperimentsService,
                private gnomexService: GnomexService,
                private propertyService: PropertyService,
                private route: ActivatedRoute) {
    }

    ngOnInit(): void {

        this.overviewListSubscription = this.experimentService.getExperimentOverviewListSubject().subscribe(data => {
            this.experimentOverviewNode = data;
        });

        this.route.data.forEach((data: any) => {
            this.experiment = null;
            this.showSequenceLanesTab = false;

            if (data && data.experiment && data.experiment.Request) {
                this.experiment  = data.experiment.Request;
                this._experiment = Experiment.createExperimentObjectFromAny(
                    this.dictionaryService,
                    this.gnomexService,
                    this.propertyService,
                    this.securityAdvisor,
                    this.experiment
                );
            }

            if (this.experiment) {
                if (!this.requestCategory || this.requestCategory.codeRequestCategory !== this.experiment.codeRequestCategory) {
                    this.requestCategory = this.dictionaryService.getEntry("hci.gnomex.model.RequestCategory", this.experiment.codeRequestCategory);

                    this.showBioinformaticsTab = this.requestCategory
                        && this.requestCategory.type !== this.gnomexService.TYPE_MICROARRAY
                        && (this.requestCategory.type === this.gnomexService.TYPE_NANOSTRING
                            || (this.requestCategory.isIlluminaType === "Y" && this.gnomexService.submitInternalExperiment())
                            || (this.requestCategory.isIlluminaType === "Y" && this.experiment && this.experiment.isExternal !== "Y"));
                }

                this.showSequenceLanesTab = this.requestCategory.isIlluminaType === 'Y' && this.experiment.isExternal !== 'Y';

                let protocols: any[] = [];
                if (this.experiment.protocols) {
                    if (Array.isArray(this.experiment.protocols)) {
                        protocols = this.experiment.protocols;
                    } else {
                        protocols = [this.experiment.protocols.Protocol];
                    }
                }
                this.showMaterialsMethodsTab = ((this.experiment.captureLibDesignId && this.experiment.captureLibDesignId !== "")
                    || (this.experiment.codeIsolationPrepType && this.experiment.codeIsolationPrepType !== "")
                    || protocols.length > 0);

                let annots = this.experiment.RequestProperties;
                this.showRelatedDataTab = this.initRelatedData(this.experiment);

                if (annots) {
                    this.annotations = Array.isArray(annots) ? <IAnnotation[]>annots : <IAnnotation[]>[annots];
                    for (let i = 0; i < this.annotations.length; i++) {
                        let propertyOptions = this.annotations[i].PropertyOption;
                        if (propertyOptions) {
                            this.annotations[i].PropertyOption = Array.isArray(propertyOptions) ? propertyOptions : <IAnnotationOption[]>[propertyOptions];
                        }
                    }
                } else {
                    this.annotations = [];
                }
            }
        });
    }

    ngOnDestroy() {
        this.overviewListSubscription.unsubscribe();
    }


    initRelatedData(experiment: any): boolean {

        let rObjects = experiment ? experiment.relatedObjects : null;
        let relatedTopics = experiment ? experiment.relatedTopics : null;

        if (rObjects) {

            if (rObjects.Analysis) {
                let order: Array<any> = rObjects.Analysis;
                this.relatedObjects.Analysis = Array.isArray(order) ? order : [order];
            }
            if (rObjects.DataTrack) {
                let order: Array<any> = rObjects.DataTrack;
                this.relatedObjects.DataTrack = Array.isArray(order) ? order : [order];
            }
            if (rObjects.Request) {
                let order: Array<any> = rObjects.Request;
                this.relatedObjects.Request = Array.isArray(order) ? order : [order];
            }
            if (relatedTopics) {
                let topics: Array<any> = relatedTopics.Topic;
                if (topics) {
                    this.relatedObjects.Topic = Array.isArray(topics) ? topics : [topics];
                }
            }

            return !!(this.relatedObjects.Topic || this.relatedObjects.Analysis || this.relatedObjects.Request || this.relatedObjects.DataTrack); // !! converts to boolean statement
        } else {
            return false;
        }
    }

    tabChanged(event: MatTabChangeEvent) {
        if (event.tab.textLabel === "Description") {
            this.initDescriptionTab = true;
        } else {
            this.initDescriptionTab = false;
        }
        if (event.tab.textLabel === "Sequence Lanes" && this.sequenceLanesTab) {
            this.sequenceLanesTab.prepareView();
        }
        if (event.tab.textLabel === "Experiment Design") {
            console.log('onSelectExperimentDesign');
            this.tabSamplesIlluminaComponent.tabDisplayed();
        }
    }

    save() {

    }
}
