import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {IAnnotation, IPropertyEntryValue} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";
import {ConstantsService} from "../../services/constants.service";
import {GnomexService} from "../../services/gnomex.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {MatDialog, MatDialogRef, MatTabChangeEvent} from "@angular/material";
import {ShareLinkDialogComponent} from "../../util/share-link-dialog.component";
import {DatatracksSummaryTabComponent} from "./datatracks-summary-tab.component";
import {AnnotationTabComponent, OrderType} from "../../util/annotation-tab.component";
import {DatatracksVisibilityTabComponent} from "./datatracks-visibility-tab.component";
import {FormGroup} from "@angular/forms";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {first} from "rxjs/operators";
import {DatatracksFilesTabComponent} from "./datatracks-files-tab.component";
import {UtilService} from "../../services/util.service";

@Component({
    templateUrl: "./datatrack-detail-overview.component.html",
    styles: [`

        .flex-container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .mat-tab-group-border {
            border: 1px solid #e8e8e8;
        }

    `]
})
export class DatatracksDetailOverviewComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(DatatracksSummaryTabComponent) summaryComponet: DatatracksSummaryTabComponent;
    @ViewChild(AnnotationTabComponent) annotationComponent: AnnotationTabComponent;
    @ViewChild(DatatracksVisibilityTabComponent) visibilityComponent: DatatracksVisibilityTabComponent;
    @ViewChild(DatatracksFilesTabComponent) filesComponent: DatatracksFilesTabComponent;

    public dtOverviewForm: FormGroup;
    public annotations: IAnnotation[];
    public relatedObjects: any;
    public showRelatedDataTab: boolean = false;
    public showDownloadLink: boolean = false;
    public showUCSC: boolean = false;
    public showIGV: boolean = true;
    public showIOBIO: boolean = false;
    public showLink: boolean = false;
    public showSpinner: boolean = false;
    public showSaveSpinner: boolean = false;
    public canWrite = false;
    public folderList: any[];
    public initSummaryView: boolean = true;
    public types = OrderType;

    private datatrack: any;
    private datatrackFiles: Array<any>;
    private datatrackDirectory: any;
    private shareWebLinkDialogRef: MatDialogRef<ShareLinkDialogComponent>;


    constructor(public dataTrackService: DataTrackService, private route: ActivatedRoute,
                public constService: ConstantsService,
                private gnomexService: GnomexService,
                private dialogService: DialogsService,
                private dialog: MatDialog,
                public orderValidateService: BrowseOrderValidateService,
                public secAdvisorService: CreateSecurityAdvisorService,
                private dialogsService: DialogsService) {
    }

    ngOnInit() {

        this.route.data.forEach(data => {
            this.datatrack = data.datatrack;
            this.initLinkVisibility();
            this.dtOverviewForm = new FormGroup({});
            if (this.datatrack) {
                this.canWrite = this.datatrack.canWrite === "Y";
                this.initLinkVisibility();
                this.showDownloadLink = data.fromTopic ? data.fromTopic : false;
                this.showRelatedDataTab = this.initRelatedData(this.datatrack);
                this.dtOverviewForm = new FormGroup({});
                if (this.datatrack.DataTrackFolders) {
                    let folder = this.datatrack.DataTrackFolders;
                    this.folderList = Array.isArray(folder) ? folder : [folder.DataTrackFolder];
                }

                setTimeout(() => {
                    this.dtOverviewForm.addControl("summaryForm", this.summaryComponet.summaryFormGroup);
                    this.dtOverviewForm.addControl("annotationForm", this.annotationComponent.form);
                    this.dtOverviewForm.addControl("visibilityForm", this.visibilityComponent.visibilityForm);
                    this.dtOverviewForm.addControl("filesForm", this.filesComponent.filesToRemove);
                    this.dtOverviewForm.markAsPristine();
                    UtilService.markChildrenAsTouched(this.dtOverviewForm);
                });

                let annots = this.datatrack.DataTrackProperties;

                if (annots) {
                    this.annotations = Array.isArray(annots) ? <IAnnotation[]>annots : <IAnnotation[]>[annots];
                    for (let i = 0; i < this.annotations.length; i++) {
                        let propertyOptions = this.annotations[i].PropertyOption;
                        if (propertyOptions) {
                            this.annotations[i].PropertyOption = Array.isArray(propertyOptions) ? propertyOptions : <IAnnotationOption[]>[propertyOptions];
                        }
                        let propertyValues = this.annotations[i].PropertyEntryValue;
                        if (propertyValues) {
                            this.annotations[i].PropertyEntryValue = Array.isArray(propertyValues) ? propertyValues : <IPropertyEntryValue[]>[propertyValues];
                        }
                    }
                } else {
                    this.annotations = [];
                }
            }
        });
    }

    ngAfterViewInit() {
    }

    initLinkVisibility() {
        if (this.datatrack.Files) {
            let ucscLinkFile: string = "";

            this.datatrackDirectory = this.datatrack.Files.Dir;
            if (this.datatrackDirectory) {
                ucscLinkFile = this.datatrack.Files.Dir.ucscLinkFile;
            }
            this.datatrackFiles = this.gnomexService.getFiles(this.datatrack.Files);
            this.showUCSC = ucscLinkFile !== "none" && this.datatrackFiles.length > 0;
            this.showIOBIO = this.datatrackFiles.length > 0;
            this.showLink = this.datatrackFiles.length > 0;
        }
    }

    initRelatedData(datatrack: any): boolean {
        this.relatedObjects = {};
        let rObjects = datatrack.relatedObjects;
        let relatedTopics = datatrack.relatedTopics;

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

    makeUCSCLink() {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams().set("idDataTrack", this.datatrack.idDataTrack);

        if (this.datatrackDirectory) {
            if (this.datatrackDirectory.ucscLinkFile === "convert") {
                this.dialogService.alert("Patience, converting useq to bw/bb format.");
            }
        }

        this.dataTrackService.makeUCSCLinks(params).pipe(first()).subscribe(resp => {
            if (resp && resp.result && resp.result === "SUCCESS") {
                console.log(resp.ucscURL1);
                window.open(resp.ucscURL1, "_blank");

            } else {

                let message: string = "";
                if (resp && resp.message) {
                    message = ": " + resp.message;
                }
                this.dialogService.confirm("An error occurred while making link. " + message, null);
            }
        });
    }

    makeIGVLink() {
        this.showSpinner = true;

        let IGVLinkCallBack = (resp): void => {
            console.log("I am the response ", resp);
            if (resp && resp.result && resp.result === "SUCCESS") {
                this.dialogService.confirm(resp.igvURL, null);

            } else {
                let message: string = "";
                if (resp && resp.message) {
                    message = ": " + resp.message;
                }
                this.dialogService.confirm("An error occurred while making link. " + message, null);

            }
            this.showSpinner = false;
        };

        if (this.datatrackDirectory) {
            if (this.datatrackDirectory.ucscLinkFile === "convert") {
                this.dialogService.confirm("Creating an IGV data repository containing all user-visible datatracks affiliated with IGV-supported genome builds. " +
                    "If there are unconverted USeq files, this can take a significant amount of time.  When finished, a URL link will be displayed. " +
                    "Paste the link into IGV's Data Registry URL field.  If new data tracks are added, a new repository must be created, but the " +
                    "link will remain valid.", "Do you wish to continue?").pipe(first()).subscribe((answer: boolean) => {
                    if (answer) {
                        this.dataTrackService.makeIGVLink().pipe(first()).subscribe(IGVLinkCallBack);
                    }
                });
            }
        }
        this.dataTrackService.makeIGVLink().pipe(first()).subscribe(IGVLinkCallBack);
    }

    makeIOBIOLink() {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams().set("requestType", "IOBIO")
            .set("idDataTrack", this.datatrack.idDataTrack);

        this.dataTrackService.makeIOBIOLink(params).pipe(first()).subscribe(resp => {
            if (resp && resp.result && resp.result === "SUCCESS") {
                window.open(resp.urlsToLink, "_blank");

            } else {
                let message: string = "";
                if (resp && resp.message) {
                    message = ": " + resp.message;
                }
                this.dialogService.confirm("An error occurred while making link. " + message, null);
            }
            this.showSpinner = false;
        });
    }

    makeURLLink() {

        this.showSpinner = true;
        let params: HttpParams = new HttpParams().set("idDataTrack", this.datatrack.idDataTrack);

        this.dataTrackService.makeURLLink(params).pipe(first()).subscribe(resp => {
            if (resp && resp.result && resp.result === "SUCCESS") {
                this.dialogService.confirm(resp.urlsToLink, null);

            } else {
                let message: string = "";
                if (resp && resp.message) {
                    message = ": " + resp.message;
                }
                this.dialogService.confirm("An error occurred while making link. " + message, null);
            }
            this.showSpinner = false;
        });
    }

    destroyLinks(): void {
        this.showSpinner = true;
        this.dataTrackService.destroyLinks().pipe(first())
            .subscribe(resp => {
                if (resp && resp.result && resp.result === "SUCCESS") {
                    this.dialogService.confirm("All Links Destroyed.", null);

                } else {
                    this.dialogService.confirm("Failed to delete links. Contact site admin.", null);
                }
                this.showSpinner = false;
            });
    }

    shareableLink(): void {
        this.shareWebLinkDialogRef = this.dialog.open(ShareLinkDialogComponent, {
            width: "35em",
            panelClass: "no-padding-dialog",
            autoFocus: false,
            data: {
                name: "Data Track",
                number: this.datatrack ? this.datatrack.number : "",
                type: "dataTrackNumber"

            }
        });
    }

    showFolders(showFolders: any) {
        this.dialogService.createCustomDialog(showFolders, "Folders for " + this.datatrack.name);
    }

    ngOnDestroy() {
    }

    public save(): void {
        this.showSaveSpinner = true;
        this.orderValidateService.emitOrderValidateSubject();
        let name = this.dtOverviewForm.get("summaryForm.folderName").value;
        let summary = this.dtOverviewForm.get("summaryForm.summary").value;
        let description: string = this.orderValidateService.propsNotOnForm["description"];
        let idAppUser: string = "";
        let codeVisibility: string = this.dtOverviewForm.get("visibilityForm.codeVisibility").value;
        let idLab: string = this.dtOverviewForm.get("visibilityForm.lab").value.idLab;

        let c: Array<any> = this.dtOverviewForm.get("visibilityForm.collaborators").value;
        let collaborators: string = "";
        if (c.length > 0) {
            collaborators = JSON.stringify(c);
        }

        let dataTrackProperties: string = JSON.stringify(this.orderValidateService.annotationsToSave);
        let filesToRemove: string = JSON.stringify(this.dtOverviewForm.get("filesForm").value);

        if (this.secAdvisorService.isAdmin) {
            idAppUser = this.dtOverviewForm.get("visibilityForm.idAppUser").value;
        } else {
            idAppUser = this.datatrack ? this.datatrack.idAppUser : "";
        }

        let params: HttpParams = new HttpParams()
            .set("idDataTrack", this.datatrack.idDataTrack)
            .set("name", name)
            .set("summary", summary)
            .set("description", description)
            .set("idAppUser", idAppUser)
            .set("codeVisibility", codeVisibility)
            .set("idLab", idLab)
            .set("propertiesJSON", dataTrackProperties)
            .set("filesToRemoveJSON", filesToRemove)
            .set("noJSONToXMLConversionNeeded", "Y");
        if (collaborators) {
            params = params.set("collaboratorsJSON", collaborators);
        }

        this.dataTrackService.saveDataTrack(params).subscribe((response: any) => {
                this.showSaveSpinner = false;

                if (response && response.result &&  response.result === "SUCCESS") {
                    this.dtOverviewForm.markAsPristine();
                    let treeNode = this.dataTrackService.datatrackListTreeNode;
                    if (treeNode) {
                        this.gnomexService.orderInitObj = {};
                        this.gnomexService.orderInitObj.idDataTrack = treeNode.idDataTrack;
                        this.gnomexService.orderInitObj.idGenomeBuild = treeNode.idGenomeBuild;
                        this.gnomexService.orderInitObj.idOrganism = treeNode.idOrganism;
                        this.gnomexService.orderInitObj.idLab = idLab;
                        this.gnomexService.navInitBrowseDatatrackSubject.next(this.gnomexService.orderInitObj);
                    }
                } else {
                    let message: string = "";
                    if (response && response.message) {
                        message = ": " + response.message;
                    }
                    this.dialogsService.confirm("An error occurred while saving data track" + message, null);
                }
            });
    }

    tabChanged(event: MatTabChangeEvent) {
        this.initSummaryView = event.tab.textLabel === "Summary";
    }

}
