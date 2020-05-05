import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {IAnnotation} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";
import {AnnotationTabComponent, OrderType} from "../../util/annotation-tab.component";
import {IRelatedObject} from "../../util/interfaces/related-objects.model";
import {ExperimentsService} from "../experiments.service";
import {MatDialogConfig, MatSnackBar, MatTabChangeEvent} from "@angular/material";
import {DictionaryService} from "../../services/dictionary.service";
import {GnomexService} from "../../services/gnomex.service";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {ExperimentSequenceLanesTab} from "./experiment-sequence-lanes-tab";

import {Experiment} from "../../util/models/experiment.model";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {PropertyService} from "../../services/property.service";
import {TabSamplesIlluminaComponent} from "../new-experiment/tab-samples-illumina.component";
import {ConstantsService} from "../../services/constants.service";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {DownloadFilesComponent} from "../../util/download-files.component";
import {FileService} from "../../services/file.service";
import {ShareLinkDialogComponent} from "../../util/share-link-dialog.component";
import {CreateAnalysisComponent} from "../../analysis/create-analysis.component";
import {HttpParams} from "@angular/common/http";
import {map} from "rxjs/operators";
import {BasicEmailDialogComponent} from "../../util/basic-email-dialog.component";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {VisibilityDetailTabComponent} from "../../util/visibility-detail-tab.component";
import {FormGroup} from "@angular/forms";
import {BillingService} from "../../services/billing.service";
import {BillingTemplate} from "../../util/billing-template-window.component";
import {ExperimentBioinformaticsTabComponent} from "./experiment-bioinformatics-tab.component";
import {ExperimentBillingTabComponent} from "./experiment-billing-tab.component";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {NavigationService} from "../../services/navigation.service";

export const TOOLTIPS = Object.freeze({
    PRINT_EXPERIMENT_ORDER: "Create PDF form for this experiment order",
    CREATE_NEW_ANALYSIS: "Create an analysis linked to this experiment",
    CREATE_NEW_ANALYSIS_DIRTY: "Please save the request before creating a linked analysis",
    CONTACT_CORE: "Email Core Regarding this Experiment",
    ARCHIVE: "Archive experiment"
});

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
    `]
})
export class ExperimentDetailOverviewComponent implements OnInit, OnDestroy, AfterViewInit {
    public toolTips: any = TOOLTIPS;

    public annotations: any = [];
    public experiment: any;

    public _experiment: Experiment;

    public showMaterialsMethodsTab: boolean = false;
    public showBioinformaticsTab: boolean = false;
    public showSequenceLanesTab: boolean = false;
    public relatedObjects: IRelatedObject = {};
    public showRelatedDataTab: boolean = false;
    public experimentOverviewNode: any;
    public showEdit: boolean = false;
    public isEditMode: boolean = false;
    public nodeTitle: string = "";
    public showBillingTab: boolean = false;
    public isDirty: boolean = false;
    public showCreateAnalysisButton: boolean = false;
    public fromTopic: boolean = false;
    public showAnnotationsTab: boolean = false;

    public types = OrderType;

    private overviewListSubscription: Subscription;
    private requestCategory: any;

    @ViewChild(ExperimentSequenceLanesTab) private sequenceLanesTab: ExperimentSequenceLanesTab;

    @ViewChild("tabSamplesIlluminaComponent") private tabSamplesIlluminaComponent: TabSamplesIlluminaComponent;

    @ViewChild(AnnotationTabComponent) private annotationTab: AnnotationTabComponent;
    @ViewChild(VisibilityDetailTabComponent) private visibilityDetailTab: VisibilityDetailTabComponent;
    @ViewChild(ExperimentBioinformaticsTabComponent) private bioinformaticsTab : ExperimentBioinformaticsTabComponent;
    @ViewChild(ExperimentBillingTabComponent) private billingTab: ExperimentBillingTabComponent;

    constructor(private securityAdvisor: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService,
                public experimentService: ExperimentsService,
                private gnomexService: GnomexService,
                private propertyService: PropertyService,
                public constService: ConstantsService,
                public secAdvisor: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private route: ActivatedRoute,
                private fileService: FileService,
                private snackBar: MatSnackBar,
                private billingService: BillingService,
                private navService: NavigationService,
                private orderValidateService: BrowseOrderValidateService) {
    }

    ngOnInit(): void {
        this.experimentService.clearExperimentOverviewForm();

        this.overviewListSubscription = this.experimentService.getExperimentOverviewListSubject().subscribe(data => {
            this.experimentOverviewNode = data;
            this.experimentService.setEditMode(false);
        });

        this.route.data.forEach((data: any) => {
            this.experiment = null;
            this.showSequenceLanesTab = false;
            this.showBillingTab = false;
            this.showCreateAnalysisButton = false;
            this.showAnnotationsTab = false;
            this.fromTopic = !!data.fromTopic;

            this.experimentService.experimentOverviewForm.reset();

            if (data && data.experiment && data.experiment.Request) {
                this.experiment  = data.experiment.Request; // this is data from the backend
                // below is the experiment model
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
                            || (this.requestCategory.isIlluminaType === "Y" && this.experiment && this.experiment.isExternal !== "Y"))
                        && this.experiment.isExternal !== 'Y';
                }

                this.showCreateAnalysisButton = !this.secAdvisor.isGuest && !this.fromTopic
                    && this.requestCategory.codeRequestCategory === this.experiment.codeRequestCategory
                    && this.requestCategory.associatedWithAnalysis === "Y";

                this.showSequenceLanesTab = this.requestCategory.isIlluminaType === "Y" && this.experiment.isExternal !== "Y";
                this.showBillingTab = this.experiment.canRead === "Y" && this.experiment.isExternal !== "Y";
                this.showAnnotationsTab = this.requestCategory
                    && this.requestCategory.type !== this.experimentService.TYPE_QC
                    && this.requestCategory.type !== this.experimentService.TYPE_GENERIC
                    && this.requestCategory.type !== this.experimentService.TYPE_CAP_SEQ
                    && this.requestCategory.type !== this.experimentService.TYPE_FRAG_ANAL
                    && this.requestCategory.type !== this.experimentService.TYPE_MIT_SEQ
                    && this.requestCategory.type !== this.experimentService.TYPE_CHERRY_PICK;

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

                let annots = this.experiment.RequestProperties ? (this.experiment.RequestProperties.PropertyEntry ? this.experiment.RequestProperties.PropertyEntry : this.experiment.RequestProperties) : "";
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

                this.showEdit = this.experiment && !this.secAdvisor.isGuest && this.experiment.canUpdate === "Y" && !this.fromTopic;
                this.isEditMode = this.experimentService.getEditMode();
                this.setNodeTitle();
            }
        });

    }

    ngAfterViewInit(): void {
        if(this.annotations && this.annotations.length > 0) {
            this.experimentService.addExperimentOverviewFormMember(this.annotationTab.form, "AnnotationTabComponent");
        }

        this.experimentService.addExperimentOverviewFormMember(this.visibilityDetailTab.form, "VisibilityDetailTabComponent");

        setTimeout(() => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    ngOnDestroy() {
        this.overviewListSubscription.unsubscribe();
        this.experimentService.setEditMode(false);
        this.experimentService.clearExperimentOverviewForm();
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
        if (event.tab.textLabel === "Experiment Design") {
            console.log("onSelectExperimentDesign");
            this.tabSamplesIlluminaComponent.tabDisplayed();
        }
        this.experimentService.currentTabIndex = event.index;
    }

    save() {
        this.dialogsService.startDefaultSpinnerDialog();

        if(this.showBioinformaticsTab && this.bioinformaticsTab) {
            this._experiment.bioinformaticsAssist = this.bioinformaticsTab.experiment.bioinformaticsAssist;
            this._experiment.analysisInstructions = this.bioinformaticsTab.experiment.analysisInstructions;
        }

        let experimentOverviewForm: FormGroup = this.experimentService.experimentOverviewForm;

        for(let key in experimentOverviewForm.controls) {
            if(key === "AnnotationTabComponent") {
                this.orderValidateService.emitOrderValidateSubject();
                this._experiment.RequestProperties = this.orderValidateService.annotationsToSave;
            } else if(key === "BillingTemplateWindowComponent") {
                // Saved already. Skip BillingTemplateWindowComponent;
            } else {
                let experimentTabForm: FormGroup = <FormGroup>experimentOverviewForm.get(key);
                // first phase, will need to disconnect setting the model from the experiment overview form.
                // just want model to be saved independently
                if(key === "ExperimentOverviewTabComponent"){
                    continue;
                }
                for (let k in experimentTabForm.controls) {
                    let val = experimentTabForm.get(k).value;
                    if (val) {
                        if (k.includes("JSONString")) {
                            this._experiment[k] = JSON.stringify(experimentTabForm.get(k).value);
                        } else {
                            this._experiment[k] = experimentTabForm.get(k).value;
                        }
                    }
                }

            }
        }

        this.replaceArrayItems();

        if(this.showBillingTab) {
            let BillingTemplateForm: FormGroup = <FormGroup>this.experimentService.experimentOverviewForm.get("BillingTemplateWindowComponent");
            if (BillingTemplateForm && BillingTemplateForm.dirty) {
                this.saveBillingAccount(BillingTemplateForm);
                return;
            }
        }

        this.saveRequest();

    }

    saveRequest(): void {
        this._experiment.idBillingAccount = "";
        this._experiment.billingItems = [];

        //TODO: Remove sequence lanes from the experiment that is not illumina type. Need to confirm, so comment this temporary.
        // if(!this._experiment.requestCategory.isIlluminaType ||
        //     (this._experiment.requestCategory.isIlluminaType && this._experiment.requestCategory.isIlluminaType === 'N')) {
        //     if(this._experiment.sequenceLanes && this._experiment.sequenceLanes.length > 0) {
        //         this._experiment.sequenceLanes = [];
        //     }
        // }
        // removing sequence lanes that aren't illumina will break auto link analysis in experiment due to it being the joiner
        //

        this.experimentService.saveRequest(this._experiment).subscribe((response) => {
            if (response && response.requestNumber) {
                let message: string[] = [];
                message.push("Request " + response.requestNumber + "has been saved.");

                // If samples, hybs or lanes have been removed, warn if billing should be adjusted to take into account
                if (response.deleteSampleCount > 0 || response.deleteHybCount > 0 || response.deleteLaneCount > 0) {
                    if(this.secAdvisor.hasPermission("canWriteAnyObject")) {
                        let deleteTarget: string = "";
                        if(response.deleteSampleCount > 0) {
                            deleteTarget += "Samples";
                        }
                        if(response.deleteHybCount > 0) {
                            deleteTarget += deleteTarget.length > 0 ? " and Hybs" : "Hybs";
                        }
                        if(response.deleteLaneCount > 0) {
                            deleteTarget += deleteTarget.length > 0 ? " and Sequence Lanes" : "Sequence Lanes";
                        }
                        if(deleteTarget.length > 0 ) {
                            deleteTarget = "Some " + deleteTarget + " have been deleted. Please view its billing items to adjust accordingly.";
                            message.push("");
                            message.push(deleteTarget);
                        }
                    }
                }

                // Inform if billing accounts reassigned on billing items
                if(response.billingAccountMessage) {
                    message.push("");
                    message.push(response.billingAccountMessage);
                }
                this.experimentService.usePreviousURLParams = true;
                this.gnomexService.navByNumber(response.requestNumber);
                this.dialogsService.stopAllSpinnerDialogs();
                setTimeout(() => {
                    if(message.length > 1) {
                        this.dialogsService.alert(message, "", DialogType.WARNING);
                    }
                });
            } else {
                this.dialogsService.stopAllSpinnerDialogs();
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }


    saveBillingAccount(BillingTemplateForm: FormGroup): void {
        let billingTemplate: BillingTemplate = BillingTemplateForm.value as BillingTemplate;
        this.billingService.saveBillingTemplate(billingTemplate).subscribe((result: any) => {
            if (result && result.result === "SUCCESS") {
                this.saveRequest();
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    replaceArrayItems() {
        if (this._experiment.project.Project && this._experiment.project.Project.requests && !Array.isArray(this._experiment.project.Project.requests)) {
            this._experiment.project.Project.requests = [this._experiment.project.Project.requests];
        }

        if(this._experiment.collaborators && !Array.isArray(this._experiment.collaborators)) {
            this._experiment.collaborators = [this._experiment.collaborators["ExperimentCollaborator"]];
        }

        if(this._experiment.labeledSamples && !Array.isArray(this._experiment.labeledSamples)) {
            this._experiment.labeledSamples = [this._experiment.labeledSamples];
        }

        if(this._experiment.workItems && !Array.isArray(this._experiment.workItems)) {
            this._experiment.workItems = [this._experiment.workItems];
        }

        if(this._experiment.sequenceLanes && !Array.isArray(this._experiment.sequenceLanes)) {
            this._experiment.sequenceLanes = [this._experiment.sequenceLanes["SequenceLane"]];
        }
    }

    startEdit(element: Element) {
        if(this.isEditMode && this.experimentService.experimentOverviewForm.dirty) {
            let warningMessage: string = "Your changes haven't been saved. Continue anyway?";
            this.dialogsService.confirm(warningMessage).subscribe((result: any) => {
                if(result) {
                    this.changeEditMode();
                }
            });
        } else {
            this.changeEditMode();
        }
    }

    public modeSubject: BehaviorSubject<string> = new BehaviorSubject<string>('VIEW');

    changeEditMode() {
        if (!this.isEditMode) {
            this.modeSubject.next('EDIT');
        } else {
            this.modeSubject.next('VIEW');
        }

        this.experimentService.setEditMode(!this.isEditMode);
        this.experimentService.modeChangedExperiment = this.experiment;
        this.isEditMode = this.experimentService.getEditMode();
        this.experimentService.experimentOverviewForm.markAsPristine();
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

    public handleDownloadFiles(): void {
        if (this.experiment && this.experiment.idRequest) {
            this.experimentService.getRequestDownloadList(this.experiment.idRequest).subscribe((result: any) => {
                let config: MatDialogConfig = new MatDialogConfig();
                config.data = {
                    showCreateSoftLinks: true,
                    downloadListSource: result.Request,
                    cacheDownloadListFn: this.fileService.cacheExperimentFileDownloadList,
                    fdtDownloadFn: this.fileService.getFDTDownloadExperimentServlet,
                    makeSoftLinksFn: this.fileService.makeSoftLinks,
                    downloadURL: "DownloadFileServlet.gx",
                    suggestedFilename: "gnomex-data",
                };
                config.autoFocus = false;
                this.dialogsService.genericDialogContainer(DownloadFilesComponent, "Download Files", null, config);
            }, (err: IGnomexErrorResponse) => {
            });
        }
    }

    shareLink(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "35em";
        configuration.autoFocus = false;
        configuration.data = {
            name: "Experiment",
            number: this.experiment ? this.experiment.number : "",
            type: "requestNumber"
        };
        this.dialogsService.genericDialogContainer(ShareLinkDialogComponent,
            "Web Link for Experiment " + (this.experiment ? this.experiment.number : ""), null, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Copy To Clipboard", internalAction: "copyToClipboard"}
                ]});
    }

    showPrintableRequestForm() {
        if (this.experiment && this.experiment.idRequest) {
            window.open("ShowRequestForm.gx?idRequest=" + this.experiment.idRequest, "_blank");
        }
    }

    createNewAnalysis(event: any) {
        if (this.experiment) {
            let items = [];

            let useThisLabList: any[];
            if (this.secAdvisor.isSuperAdmin) {
                useThisLabList = this.experimentService.labList;
            } else {
                useThisLabList = this.experimentService.filteredLabs;
            }

            let config: MatDialogConfig = new MatDialogConfig();
            config.width = "40em";
            config.autoFocus = false;
            config.data = {
                labList: useThisLabList,
                items: items,
                selectedLab: this.experiment.idLab,
                selectedOrganism: this.experiment.idOrganismSampleDefault,
                parentComponent: "Experiment",
                experiment: this._experiment

            };

            this.dialogsService.genericDialogContainer(CreateAnalysisComponent, "Create Analysis", null, config, {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save" , internalAction: "createAnalysisYesButtonClicked", externalAction: () => { console.log("hello"); }},
                    {type: ActionType.SECONDARY,  name: "Cancel", internalAction: "cancel"}
                ]});

        }
    }

    onEmailClick(): void {
        if (this.experiment) {
            let subjectText = "Inquiry about Experiment " + this.experiment.number;

            let saveFn = (data: any): Observable<boolean>  => {

                data.format =  "text";
                data.idAppUser = this.secAdvisor.idAppUser.toString();

                let coreFacility = this.dictionaryService.getEntry("hci.gnomex.model.CoreFacility", this.experiment.idCoreFacility);
                if (coreFacility) {
                    data.toAddress = coreFacility.contactEmail;
                }

                let params: HttpParams = new HttpParams()
                    .set("body", data.body)
                    .set("format", data.format)
                    .set("senderAddress", data.fromAddress)
                    .set("recipientAddress", data.toAddress)
                    .set("idAppUser", data.idAppUser)
                    .set("subject", data.subject);

                return this.experimentService.emailServlet(params).pipe(map((result) => {
                    return result && result.result === "SUCCESS";
                }));
            };

            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = "45em";
            configuration.height = "35em";
            configuration.autoFocus = false;
            configuration.data = {
                saveFn: saveFn,
                action: "Contact Core",
                parentComponent: "Experiment",
                subjectText: subjectText,
            };

            this.dialogsService.genericDialogContainer(BasicEmailDialogComponent,
                "Email Core Regarding this Experiment", this.constService.EMAIL_GO_LINK, configuration,
                {actions: [
                        {type: ActionType.PRIMARY, icon: this.constService.EMAIL_GO_LINK, name: "Send Email", internalAction: "send"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                    ]});

        }
    }
}

