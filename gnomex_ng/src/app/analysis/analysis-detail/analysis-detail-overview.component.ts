import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AnalysisService} from "../../services/analysis.service";
import {ActivatedRoute} from "@angular/router";
import {IAnnotation} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";
import {AnnotationTabComponent, OrderType} from "../../util/annotation-tab.component";
import {Subscription} from "rxjs";
import {IRelatedObject} from "../../util/interfaces/related-objects.model";
import {MatDialog, MatDialogConfig, MatTabChangeEvent} from "@angular/material";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";
import {ConstantsService} from "../../services/constants.service";
import {LinkToExperimentDialogComponent} from "./index";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {ShareLinkDialogComponent} from "../../util/share-link-dialog.component";
import {PropertyService} from "../../services/property.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {DataTrackService} from "../../services/data-track.service";
import {ManagePedFileWindowComponent} from "./manage-ped-file-window.component";
import {FormGroup} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {GnomexService} from "../../services/gnomex.service";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";


@Component({

    templateUrl: "./analysis-detail-overview.component.html"
    ,
    styles: [`
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
            width:100%;
        }

        .label-title{
            margin-top: 0.2rem;
            margin-bottom: 0;
        }

        .label-title-width {
            width: 25rem;
        }
    `]
})
export class AnalysisDetailOverviewComponent  implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(AnnotationTabComponent) annotTab: AnnotationTabComponent;

    public annotations: any = [];
    public analysis: any;
    public lab: any;
    types = OrderType;
    public relatedObjects: IRelatedObject = {};
    public showRelatedDataTab: boolean = false;
    public showExpAnalysisTab: boolean = false;
    public showLinkToExp: boolean = false;
    public showAutoDistributeDataTracks: boolean = false;
    public showManagePEDFile: boolean = false;
    public showEdit: boolean = false;
    public isEditMode: boolean = false;

    public analysisTreeNode: any;
    private analysisTreeNodeSubscription: Subscription;



    constructor(public analysisService: AnalysisService,
                private route: ActivatedRoute,
                private dialog: MatDialog,
                private secAdvisor: CreateSecurityAdvisorService,
                public constService: ConstantsService,
                public orderValidateService: BrowseOrderValidateService,
                private propertyService: PropertyService,
                private dialogsService: DialogsService,
                private gnomexService: GnomexService,
                private dataTrackService: DataTrackService) {
    }

    ngOnInit(): void {
        this.analysisService.clearAnalysisOverviewForm();

        this.analysisTreeNodeSubscription = this.analysisService.getAnalysisOverviewListSubject().subscribe(node => {
            this.analysisTreeNode = node;
            this.analysisService.setEditMode(false);
        });

        this.route.data.forEach((data: any) => {
            this.analysisService.analysisOverviewForm.reset();
            this.analysis = data.analysis ? data.analysis.Analysis : null;
            if(this.analysis) {
                let annots = this.analysis.AnalysisProperties;
                this.showRelatedDataTab = this.initRelatedData(this.analysis);
                this.showLinkToExp = !this.secAdvisor.isGuest && this.analysis.canRead === "Y";
                this.showEdit = this.analysis.canUpdate === "Y";
                this.isEditMode = this.analysisService.getEditMode();

                if(annots) {
                    this.annotations = Array.isArray(annots) ? <IAnnotation[]>annots : <IAnnotation[]>[annots];
                    for(let i = 0; i < this.annotations.length; i++) {
                        let propertyOptions = this.annotations[i].PropertyOption;
                        if(propertyOptions) {
                            this.annotations[i].PropertyOption =  Array.isArray(propertyOptions) ? propertyOptions :  <IAnnotationOption[]>[propertyOptions];
                        }
                    }
                } else {
                    this.annotations = [];
                }
            }

            let collaborators: any[] = this.analysis && this.analysis.collaborators
                ? (Array.isArray(this.analysis.collaborators) ? this.analysis.collaborators : [this.analysis.collaborators.AnalysisCollaborator])
                : [];
            let isCollaborator: boolean = false;
            for (let c of collaborators) {
                if (c.idAppUser === ("" + this.secAdvisor.idAppUser)) {
                    isCollaborator = true;
                    break;
                }
            }

            this.showAutoDistributeDataTracks = this.analysis && !this.secAdvisor.isGuest && this.analysis.canRead === "Y"
                && this.propertyService.getProperty(PropertyService.PROPERTY_DATATRACK_SUPPORTED).propertyValue === "Y";
            this.showManagePEDFile = this.showAutoDistributeDataTracks && !isCollaborator;
        });
    }
    ngAfterViewInit(): void {
        this.analysisService.addAnalysisOverviewFormMember(this.annotTab.form, "AnnotationTabComponent");
    }


    initRelatedData(analysis: any): boolean {

        this.relatedObjects = {};
        let rObjects = analysis.relatedObjects;
        let relatedTopics = analysis.relatedTopics;

        if(rObjects) {

            if(rObjects.Analysis) {
                let order: Array<any> =  rObjects.Analysis;
                this.relatedObjects.Analysis = Array.isArray(order) ? order : [order];
            }
            if(rObjects.DataTrack) {
                let order: Array<any> =   rObjects.DataTrack;
                this.relatedObjects.DataTrack = Array.isArray(order) ? order : [order];
            }
            if(rObjects.Request) {
                let order: Array<any> =   rObjects.Request;
                this.relatedObjects.Request = Array.isArray(order) ? order : [order];
            }
            if(relatedTopics) {
                let topics: Array<any> = relatedTopics.Topic;
                if(topics) {
                    this.relatedObjects.Topic = Array.isArray(topics) ? topics : [topics];
                }
            }

            return !!(this.relatedObjects.Topic || this.relatedObjects.Analysis || this.relatedObjects.Request || this.relatedObjects.DataTrack); // !! converts to boolean statement
        } else {
            return false;
        }

    }
    tabChanged(event: MatTabChangeEvent) {
        this.showExpAnalysisTab = event.tab.textLabel === "Experiment";
    }

    makeLinkToExperiment() {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "56em";
        config.panelClass = "no-padding-dialog";
        config.autoFocus = false;
        config.disableClose = true;
        config.data = {
            idAnalysis : this.analysis ? this.analysis.idAnalysis : "",
            idLab: this.analysis ? this.analysis.idLab : ""
        };

        this.dialogsService.genericDialogContainer(LinkToExperimentDialogComponent, "Link to Experiment", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_LINK, name: "Link", internalAction: "linkAnalysis"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                ]});

    }

    public shareWebLink(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "35em";
        configuration.panelClass = "no-padding-dialog";
        configuration.autoFocus = false;
        configuration.data = {
            number: this.analysis ? this.analysis.number : "",
            type:   "analysisNumber"
        };
        this.dialogsService.genericDialogContainer(ShareLinkDialogComponent,
            "Web Link for Analysis " + (this.analysis ? this.analysis.number : ""), null, configuration,
            {actions: [{type: ActionType.PRIMARY, name: "Copy To Clipboard", internalAction: "copyToClipboard"}
                ]});
    }

    public autoDistributeDataTracks(): void {
        if (this.analysis && this.analysis.idAnalysis) {
            let genomeBuilds: any[] = this.analysis.genomeBuilds ? (Array.isArray(this.analysis.genomeBuilds) ? this.analysis.genomeBuilds : [this.analysis.genomeBuilds.GenomeBuild]) : [];
            let genomeBuild: any = genomeBuilds.length > 0 ? genomeBuilds[0] : null;
            if (!genomeBuild || !genomeBuild.isActive || genomeBuild.isActive !== "Y") {
                this.dialogsService.alert("An active genome build is required to create data tracks");
                return;
            }

            // TODO check files tab does not have unregistered files. If so, save files and then call auto distribute data tracks

            this.dataTrackService.createAllDataTracks(this.analysis.idAnalysis).subscribe((result: any) => {
                if (result && result.result && result.result === "SUCCESS") {

                    // TODO refresh download list of analysis files
                    this.dialogsService.alert("Data tracks created for all applicable files");
                }
            }, (err: IGnomexErrorResponse) => {
            });
        }
    }

    public showManagePEDFileWindow(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "52.5em";
        configuration.maxWidth = "52.5em";
        configuration.height = "30.5em";
        configuration.panelClass = "no-padding-dialog";
        configuration.autoFocus = true;
        configuration.disableClose = true;
        configuration.data = {
            idAnalysis: this.analysis && this.analysis.idAnalysis ? this.analysis.idAnalysis : ""
        };
        let pedFileName: string = this.analysis && this.analysis.number ? " -- A" + this.analysis.number + ".ped" : "";
        this.dialogsService.genericDialogContainer(ManagePedFileWindowComponent, "Manage Ped File" + pedFileName, null, configuration);
    }

    save() {
        let analysisOverviewForm: FormGroup = this.analysisService.analysisOverviewForm;
        this.dialogsService.startDefaultSpinnerDialog();

        let params: HttpParams = new HttpParams()
            .set("idAnalysis", this.analysis.idAnalysis)
            .set("idLab", this.analysis.idLab);

        Object.keys(analysisOverviewForm.controls).forEach(key => {
            if(key === "AnnotationTabComponent") {
                this.orderValidateService.emitOrderValidateSubject();
                params = params.set("propertiesJSON", JSON.stringify(this.orderValidateService.annotationsToSave));
            } else {
                let analysisTabForm: FormGroup = <FormGroup>analysisOverviewForm.get(key);
                Object.keys(analysisTabForm.controls).forEach(k => {
                    let val = analysisTabForm.get(k).value;
                    if(val) {
                        if(k.includes("JSONString")) {
                            params = params.set(k , JSON.stringify(analysisTabForm.get(k).value));
                        } else {
                            params = params.set(k, analysisTabForm.get(k).value);
                        }
                    }
                });
            }
        });
        params = params.set("noJSONToXMLConversionNeeded", "Y");

        this.analysisService.saveAnalysis(params).pipe(first()).subscribe(resp => {
            if(resp) {
                if(resp.idAnalysis) {
                    this.gnomexService.navByNumber("A" + resp.idAnalysis);
                    this.dialogsService.stopAllSpinnerDialogs();
                }
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });

    }

    editButtonClicked(element: Element) {
        if(this.isEditMode && this.analysisService.analysisOverviewForm.dirty) {
            let warningMessage: string = "Your changes haven't been saved. Continue anyway?";
            this.dialogsService.yesNoDialog(warningMessage, this, "changeEditMode", null, "Changing EditMode");
        } else {
            this.changeEditMode();
        }
    }

    changeEditMode() {
        this.analysisService.setEditMode(!this.isEditMode);
        this.analysisService.modeChangedAnalysis = this.analysis;
        this.isEditMode = this.analysisService.getEditMode();
        this.analysisService.analysisOverviewForm.markAsPristine();
    }

    ngOnDestroy() {
        this.analysisTreeNodeSubscription.unsubscribe();
        this.analysisService.clearAnalysisOverviewForm();
        this.analysisService.setEditMode(false);
    }

}




