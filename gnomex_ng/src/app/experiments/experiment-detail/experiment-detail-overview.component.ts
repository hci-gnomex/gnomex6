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
import {ConstantsService} from "../../services/constants.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService} from "../../util/popup/dialogs.service";


@Component({
    templateUrl: "./experiment-detail-overview.component.html",
    styles: [`
        .bordered {
            border: 1px solid #e8e8e8;
        }

        .flex-container{
            display: flex;
            /*justify-content: space-between;*/
            flex:1;
            font-size:small;
        }
        
        .flexbox-column{
            display:flex;
            flex-direction:column;
            height:100%;
            width:100%;
        }

        .label-title{
            margin-top: 0.2rem;
            margin-bottom: 0;
        }
        
        .label-title-width {
            width: 25rem;
        }

        .overflow {
            overflow: auto;
        }

        .flex-grow-greater {
            flex: 10;
        }
    `],
})
export class ExperimentDetailOverviewComponent implements OnInit, OnDestroy {
    public annotations: any = [];
    public experiment: any;
    
    public showMaterialsMethodsTab: boolean = false;
    public showBioinformaticsTab: boolean = false;
    public showSequenceLanesTab: boolean = false;
    public relatedObjects: IRelatedObject = {};
    public showRelatedDataTab: boolean = false;
    public experimentOverviewNode: any;
    public showEdit: boolean = false;
    public isEditMode: boolean;
    public nodeTitle: string = "";
    
    types = OrderType;
    
    private overviewListSubscription: Subscription;
    private requestCategory: any;

    @ViewChild(ExperimentSequenceLanesTab) private sequenceLanesTab: ExperimentSequenceLanesTab;

    constructor(private dictionaryService: DictionaryService,
                private experimentService: ExperimentsService,
                private gnomexService: GnomexService,
                public constService: ConstantsService,
                private secAdvisor: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private route: ActivatedRoute) {
    }

    ngOnInit(): void {

        this.overviewListSubscription = this.experimentService.getExperimentOverviewListSubject().subscribe(data => {
            this.experimentOverviewNode = data;
            this.experimentService.setEditMode(false);
        });

        this.route.data.forEach((data: any) => {
            this.experiment = null;
            this.showSequenceLanesTab = false;

            if (data && data.experiment && data.experiment.Request) {
                this.experiment = data.experiment.Request;
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

                this.showSequenceLanesTab = this.requestCategory.isIlluminaType === "Y" && this.experiment.isExternal !== "Y";

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
    
            this.showEdit = this.experiment && !this.secAdvisor.isGuest && this.experiment.canUpdate === "Y";
            this.isEditMode = this.experimentService.getEditMode();
            this.setNodeTitle();
        });
    
        
    }

    ngOnDestroy() {
        this.overviewListSubscription.unsubscribe();
        this.experimentService.setEditMode(false);
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
        if (event.tab.textLabel === "Sequence Lanes" && this.sequenceLanesTab) {
            this.sequenceLanesTab.prepareView();
        }
    }

    save() {
        // TODO: This is a temporary handle and it needs to be implemented when we work on Save() function
        let mes: string = "Save() method hasn't been implemented. Continue anyway?";
        this.dialogsService.yesNoDialog(mes, this, "changeEditMode", null, "Save Confirmation");
    }
    
    startEdit(element: Element) {
        if(this.isEditMode) {
            let warningMessage: string = "Your changes haven't been saved. Continue anyway?";
            this.dialogsService.yesNoDialog(warningMessage, this, "changeEditMode", null, "Changing EditMode");
        } else {
            this.changeEditMode();
        }
    }
    
    changeEditMode() {
        // TODO: Here needs to save the changes first when save() function is implemented, or
        // TODO: we can change the logic to not be saved first when change editMode but only when click the save button.
        
        this.experimentService.setEditMode(!this.isEditMode);
        this.isEditMode = this.experimentService.getEditMode();
        this.setNodeTitle();
    }
    
    setNodeTitle(): void {
        if (this.experiment) {
            let externalStr: string = "";
            if (this.experiment.isExternal && this.experiment.isExternal === "Y") {
                externalStr = "External ";
            }
            if(this.isEditMode) {
                this.nodeTitle = "Edit " + (this.requestCategory ? this.requestCategory.display + " " : "") + "Experiment";
            } else {
                this.nodeTitle = externalStr + "Experiment " + this.experiment.number;
            }
        }
    }
    
}
