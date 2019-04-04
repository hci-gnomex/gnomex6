import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {IAnnotation} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";
import {OrderType} from "../../util/annotation-tab.component";
import {IRelatedObject} from "../../util/interfaces/related-objects.model";
import {ExperimentsService} from "../experiments.service";
import {
    MatDialog,
    MatDialogConfig,
    MatDialogRef,
    MatSnackBar,
    MatTabChangeEvent,
} from "@angular/material";
import {DictionaryService} from "../../services/dictionary.service";
import {GnomexService} from "../../services/gnomex.service";
import {BehaviorSubject, Subscription} from "rxjs";
import {ExperimentSequenceLanesTab} from "./experiment-sequence-lanes-tab";

import {Experiment} from "../../util/models/experiment.model";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {PropertyService} from "../../services/property.service";
import {TabSamplesIlluminaComponent} from "../new-experiment/tab-samples-illumina.component";
import {ConstantsService} from "../../services/constants.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {DownloadFilesComponent} from "../../util/download-files.component";
import {FileService} from "../../services/file.service";
import {ShareLinkDialogComponent} from "../../util/share-link-dialog.component";
import {CreateAnalysisComponent} from "../../analysis/create-analysis.component";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {BasicEmailDialogComponent} from "../../util/basic-email-dialog.component";

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
export class ExperimentDetailOverviewComponent implements OnInit, OnDestroy {
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

    public types = OrderType;

    private overviewListSubscription: Subscription;
    private requestCategory: any;
    private createAnalysisDialogRef: MatDialogRef<CreateAnalysisComponent>;
    private contactCoreEmailDialogRef: MatDialogRef<BasicEmailDialogComponent>;

    @ViewChild(ExperimentSequenceLanesTab) private sequenceLanesTab: ExperimentSequenceLanesTab;

    @ViewChild("tabSamplesIlluminaComponent") private tabSamplesIlluminaComponent: TabSamplesIlluminaComponent;

    constructor(private securityAdvisor: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService,
                private experimentService: ExperimentsService,
                private gnomexService: GnomexService,
                private propertyService: PropertyService,
                public constService: ConstantsService,
                public secAdvisor: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private route: ActivatedRoute,
                private fileService: FileService,
                private dialog: MatDialog,
                private snackBar: MatSnackBar) {
    }

    ngOnInit(): void {

        this.overviewListSubscription = this.experimentService.getExperimentOverviewListSubject().subscribe(data => {
            this.experimentOverviewNode = data;
            this.experimentService.setEditMode(false);
        });

        this.route.data.forEach((data: any) => {
            this.experiment = null;
            this.showSequenceLanesTab = false;
            this.showBillingTab = false;
            this.showCreateAnalysisButton = false;

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

                this.showCreateAnalysisButton = !this.secAdvisor.isGuest && this.requestCategory.isActive === "Y" && this.requestCategory.associatedWithAnalysis === "Y";
                this.showSequenceLanesTab = this.requestCategory.isIlluminaType === "Y" && this.experiment.isExternal !== "Y";
                this.showBillingTab = this.experiment.canRead === "Y" && this.experiment.isExternal !== "Y";

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

                this.showEdit = this.experiment && !this.secAdvisor.isGuest && this.experiment.canUpdate === "Y";
                this.isEditMode = this.experimentService.getEditMode();
                this.setNodeTitle();
            }
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
        if (event.tab.textLabel === "Experiment Design") {
            console.log("onSelectExperimentDesign");
            this.tabSamplesIlluminaComponent.tabDisplayed();
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

    public modeSubject: BehaviorSubject<string> = new BehaviorSubject<string>('VIEW');

    changeEditMode() {
        // TODO: Here needs to save the changes first when save() function is implemented, or
        // TODO: we can change the logic to not be saved first when change editMode but only when click the save button.

        if (!this.isEditMode) {
            this.modeSubject.next('EDIT');
        } else {
            this.modeSubject.next('VIEW');
        }

        this.experimentService.setEditMode(!this.isEditMode);
        this.experimentService.modeChangedExperiment = this.experiment;
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

    public handleDownloadFiles(): void {
        if (this.experiment && this.experiment.idRequest) {
            this.experimentService.getRequestDownloadList(this.experiment.idRequest).subscribe((result: any) => {
                if (result && result.Request) {
                    let config: MatDialogConfig = new MatDialogConfig();
                    config.panelClass = "no-padding-dialog";
                    config.data = {
                        showCreateSoftLinks: true,
                        downloadListSource: result.Request,
                        cacheDownloadListFn: this.fileService.cacheExperimentFileDownloadList,
                        fdtDownloadFn: this.fileService.getFDTDownloadExperimentServlet,
                        makeSoftLinksFn: this.fileService.makeSoftLinks,
                        downloadURL: "DownloadFileServlet.gx",
                        suggestedFilename: "gnomex-data",
                    };
                    config.disableClose = true;
                    this.dialog.open(DownloadFilesComponent, config);
                } else {
                    let message: string = "";
                    if (result && result.message) {
                        message = ": " + result.message;
                    }
                    this.dialogsService.alert("An error occurred while retrieving download list" + message, null);
                }
            });
        }
    }

    shareLink(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "35em";
        configuration.panelClass = "no-padding-dialog";
        configuration.autoFocus = false;
        configuration.data = {
            name: "Experiment",
            number: this.experiment ? this.experiment.number : "",
            type: "requestNumber"
        };
        this.dialog.open(ShareLinkDialogComponent, configuration);
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
            config.width = "35em";
            // config.height = "30em";
            config.panelClass = "no-padding-dialog";
            config.autoFocus = false;
            config.disableClose = true;
            config.data = {
                labList: useThisLabList,
                items: items,
                selectedLab: this.experiment.idLab,
                selectedOrganism: this.experiment.idOrganismSampleDefault,
                parentComponent: "Experiment",

            };

            this.createAnalysisDialogRef = this.dialog.open(CreateAnalysisComponent, config);
        }
    }

    onEmailClick(): void {
        if (this.experiment) {
            let subjectText = "Inquiry about Experiment " + this.experiment.number;

            let saveFn = (data: any) => {

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

                this.experimentService.emailServlet(params).pipe(first()).subscribe(resp => {
                    let email = <BasicEmailDialogComponent>this.contactCoreEmailDialogRef.componentInstance;
                    email.showSpinner = false;
                    if(resp && resp.result === "SUCCESS") {
                        this.contactCoreEmailDialogRef.close();

                        this.snackBar.open("Email successfully sent", "Contact Core", {
                            duration: 2000
                        });

                    } else if(resp && resp.message) {
                        this.dialogsService.alert("Error sending email" + ": " + resp.message);
                    }

                }, error => {
                    this.dialogsService.alert(error);
                });
            };

            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = "45em";
            configuration.height = "35em";
            configuration.panelClass = "no-padding-dialog";
            configuration.autoFocus = false;
            configuration.disableClose = true;
            configuration.data = {
                saveFn: saveFn,
                title: "Email Core Regarding this Experiment",
                parentComponent: "Experiment",
                subjectText: subjectText,
            };

            this.contactCoreEmailDialogRef = this.dialog.open(BasicEmailDialogComponent, configuration);

        }
    }
}

