import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from "@angular/core";

import {URLSearchParams} from "@angular/http";

import {ExperimentsService} from "./experiments.service";
import {
    jqxButtonComponent,
    jqxCheckBoxComponent,
    jqxComboBoxComponent,
    jqxLoaderComponent,
    jqxNotificationComponent,
    jqxWindowComponent,
} from "jqwidgets-framework";
import {ITreeOptions, ITreeState, TreeComponent, TreeModel, TreeNode} from "angular-tree-component";
import {BrowseFilterComponent} from "../util/browse-filter.component";
import * as _ from "lodash";
import {Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {CreateProjectComponent} from "./create-project.component";
import {MatCheckboxChange, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {DeleteProjectComponent} from "./delete-project.component";
import {ReassignExperimentComponent} from "./reassign-experiment.component";
import {DeleteExperimentComponent} from "./delete-experiment.component";
import {DragDropHintComponent} from "../analysis/drag-drop-hint.component";
import {DictionaryService} from "../services/dictionary.service";
import {PropertyService} from "../services/property.service";
import {GnomexService} from "../services/gnomex.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {HttpParams} from "@angular/common/http";
import {UtilService} from "../services/util.service";

const VIEW_LIMIT_EXPERIMENTS: string = "view_limit_experiments";

@Component({
    selector: "experiments",
    templateUrl: "./browse-experiments.component.html",
    styles: [`
        .jqx-notification {
            margin-top: 30em;
            margin-left: 20em;
        }


        .t  { display: table;      }
        .tr { display: table-row;  }
        .td { display: table-cell; }

        .half-width { width: 50%; }

        .vertical-center { vertical-align: middle; }
        .horizontal-center { text-align: center; }

        .vertical-spacer { height: 0.3em; }


        .padding { padding: 0.3em; }

        .left-right-padding {
            padding-left:  0.3em;
            padding-right: 0.3em;
        }

        .major-left-right-padding {
            padding-left:  1em;
            padding-right: 0.3em;
        }

        .foreground { background-color: white;   }
        .background { background-color: #EEEEEE; }

        .border { border: #C8C8C8 solid thin; }
        .background-border {
            border-radius: 0.3em;
            border: 1px solid darkgrey;
        }

        .no-overflow  { overflow:    hidden; }
        .no-word-wrap { white-space: nowrap; }
    `]
})

export class BrowseExperimentsComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild("tree") treeComponent: TreeComponent;
    @ViewChild("responseMsgWindow") responseMsgWindow: jqxWindowComponent;
    @ViewChild("msgNoAuthUsersForLab") msgNoAuthUsersForLab: jqxNotificationComponent;
    @ViewChild("toggleButton") toggleButton: jqxButtonComponent;

    @ViewChild(BrowseFilterComponent)

    /**
    angular2-tree options
     */
    public options: ITreeOptions;
    public state: ITreeState;
    public showEmptyFolders: boolean = false;
    public items: any;
    public responseMsg: string = "";
    public experimentCount: string = "0";
    public experimentCountMessage: string = "";
    public disableNewProject: boolean = true;
    public disableDeleteProject: boolean = true;
    public disableDeleteExperiment: boolean = true;
    public disableAll: boolean = false;

    private treeModel: TreeModel;
    private currentItem: any;
    private targetItem: any;
    private labs: any;
    private labMembers: any;
    private billingAccounts: any;
    private dragEndItems: any;
    private selectedItem: any;
    private showBillingCombo: boolean = false;
    private labList: any[] = [];
    private selectedExperiment: any;
    private projectRequestListSubscription: Subscription;
    private deleteProjectDialogRef: MatDialogRef<DeleteProjectComponent>;
    private createProjectDialogRef: MatDialogRef<CreateProjectComponent>;
    private reassignExperimentDialogRef: MatDialogRef<ReassignExperimentComponent>;
    private deleteExperimentDialogRef: MatDialogRef<DeleteExperimentComponent>;
    private navProjectReqList: any;
    private navInitSubscription: Subscription;
    private labListSubscription: Subscription;
    private parentProject: any;
    private setActiveNodeId: string;
    private canDeleteProjectSubscription: Subscription;


    ngOnInit() {
        this.utilService.registerChangeDetectorRef(this.changeDetectorRef);
        this.treeModel = this.treeComponent.treeModel;
        this.options = {
            displayField: "label",
            childrenField: "items",
            useVirtualScroll: true,
            nodeHeight: 22,
            nodeClass: (node: TreeNode) => {
                return "icon-" + node.data.icon;
            },
            allowDrop: (element, { parent, index }) => {
                this.dragEndItems = _.cloneDeep(this.items);
                if (parent.data.labName) {
                    return false;
                } else {
                    return true;
                }
            },

            allowDrag: (node) => !this.createSecurityAdvisorService.isGuest && node.isLeaf,
        };

        this.labListService.getLabList_FromBackEnd();
        this.labListSubscription =  this.labListService.getLabListSubject().subscribe((response: any[]) => {
            this.labList = response;
            this.experimentsService.labList = this.labList;
        });
        if (this.createSecurityAdvisorService.isGuest) {
            this.disableAll = true;
        }

        this.canDeleteProjectSubscription = this.experimentsService.canDeleteProjectSubject.subscribe((canDelete: boolean) => {
            setTimeout(() => {
                this.disableDeleteProject = !canDelete;
            });
        });
    }

    ngAfterViewInit() {}


    constructor(public experimentsService: ExperimentsService,
                private changeDetectorRef: ChangeDetectorRef,
                private utilService: UtilService,
                public createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialog: MatDialog,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private labListService: LabListService,
                private propertyService: PropertyService,
                private route: ActivatedRoute,
                private router: Router) {

        this.items = [];
        this.dragEndItems = [];
        this.labMembers = [];
        this.billingAccounts = [];
        this.labs = [];

        this.projectRequestListSubscription = this.experimentsService.getProjectRequestListObservable().subscribe(response => {
            this.buildTree(response.Lab);
            if (response && response.experimentCount) {
                this.experimentCount = response.experimentCount;
                this.experimentCountMessage = response.message ? "(" + response.message + ")" : "";
            } else {
                this.experimentCount = "0";
                this.experimentCountMessage = "";
            }
            if (this.createProjectDialogRef && this.createProjectDialogRef.componentInstance) {
                if(this.createProjectDialogRef.componentInstance.showSpinner === true) {
                    this.createProjectDialogRef.componentInstance.showSpinner = false;
                }
                if(this.createProjectDialogRef.componentInstance.newProjectId) {
                    this.setActiveNodeId = "p" + this.createProjectDialogRef.componentInstance.newProjectId;
                }
                this.createProjectDialogRef.close();
                this.createProjectDialogRef = null;
            }

            if (this.deleteProjectDialogRef && this.deleteProjectDialogRef.componentInstance) {
                if(this.deleteProjectDialogRef.componentInstance.showSpinner === true) {
                    this.deleteProjectDialogRef.componentInstance.showSpinner = false;
                }
                if(this.parentProject) {
                    this.setActiveNodeId = this.parentProject.data.id;
                }
                this.deleteProjectDialogRef.close();
                this.deleteProjectDialogRef = null;
            }

            if (this.deleteExperimentDialogRef && this.deleteExperimentDialogRef.componentInstance) {
                if(this.deleteExperimentDialogRef.componentInstance.showSpinner === true) {
                    this.deleteExperimentDialogRef.componentInstance.showSpinner = false;
                }
                if(this.parentProject) {
                    this.setActiveNodeId = this.parentProject.data.id;
                }
                this.deleteExperimentDialogRef.close();
                this.deleteExperimentDialogRef = null;
            }

            if (this.reassignExperimentDialogRef) {
                this.dialogsService.stopAllSpinnerDialogs();
                this.reassignExperimentDialogRef.close();
                this.reassignExperimentDialogRef = null;
            }

            if (this.experimentsService.browsePanelParams && this.experimentsService.browsePanelParams["refreshParams"]) {
                this.experimentsService.emitExperimentOverviewList(response.Lab);

                this.showEmptyFolders = this.experimentsService.browsePanelParams.get("showEmptyProjectFolders") === "Y" ? true : false;
                let navArray: any[] = ["/experiments"];
                this.experimentsService.browsePanelParams["refreshParams"] = false;
                this.router.navigate(navArray);

                if (this.treeModel && this.treeModel.getActiveNode()) {// Refresh to initial state when search button clicked
                    this.treeModel.getActiveNode().setIsActive(false);
                    this.treeModel.setFocusedNode(null);
                    this.disableNewProject = true;
                    this.disableDeleteProject = true;
                    this.disableDeleteExperiment = true;
                }
            }


            setTimeout(() => {
                this.toggleButton.val("Collapse Projects");
                this.treeModel.expandAll();

                if(this.gnomexService.orderInitObj) {
                    let id: string = "r" + this.gnomexService.orderInitObj.idRequest;
                    if(this.treeModel && id) {
                        this.treeModel.getNodeById(id).setIsActive(true);
                        this.treeModel.getNodeById(id).scrollIntoView();
                        this.gnomexService.orderInitObj = null;
                    }
                } else if(this.setActiveNodeId) {
                    let node: TreeNode;
                    node = this.findNodeById(this.setActiveNodeId);
                    this.setActiveNodeId = "";
                    if(node) {
                        node.setIsActive(true);
                        node.scrollIntoView();
                    }
                }
                this.dialogsService.stopAllSpinnerDialogs();
            });
        });

        this.navInitSubscription = this.gnomexService.navInitBrowseExperimentSubject.subscribe( orderInitObj => {
            if (orderInitObj) {
                console.log("Nav mode: true");

                let idProject = this.gnomexService.orderInitObj.idProject;

                let ids: HttpParams = new HttpParams()
                    .set("idProject", idProject)
                    .set("showEmptyProjectFolders", "Y")
                    .set("showCategory", "N")
                    .set("showSamples", "N");
                this.experimentsService.browsePanelParams = ids;
                this.experimentsService.getProjectRequestList_fromBackend(ids);
            }
        });


        this.experimentsService.startSearchSubject.subscribe((value) => {
            if (value) {
                this.dialogsService.startDefaultSpinnerDialog();
            }
        });

    }

    go(event: any) {
    }

    /**
    Build the tree data
    @param
     */
    buildTree(response: any[]) {
        this.labs = [];
        this.experimentsService.filteredLabs = [];

        if (response) {
            if (!this.isArray(response)) {
                this.items = [response];
            } else {
                this.items = response;
            }
            this.labs = this.labs.concat(this.items);
            this.experimentsService.filteredLabs = this.labs;
            for (var lab of this.items) {
                lab.id = "l" + lab.idLab;
                lab.parentid = -1;

                lab.icon = "assets/group.png";
                // If there is a lab with no Project skip
                if (lab.Project) {
                    if (!this.isArray(lab.Project)) {
                        lab.items = [lab.Project];
                    } else {
                        lab.items = lab.Project;
                    }
                    for (var project of lab.items) {
                        project.icon = "assets/folder.png";
                        project.labId = lab.labId;
                        project.id = "p" + project.idProject;
                        project.parentid = lab.id;
                        if (project.Request) {
                            project.isEmptyFolder = false;
                            if (!this.isArray(project.Request)) {
                                project.items = [project.Request];
                            } else {
                                project.items = project.Request;
                            }
                            for (var request of project.items) {
                                if (request) {
                                    if (request.label) {
                                        request.label = request.requestNumber + "-" + request.name;
                                        request.id = "r" + request.idRequest;
                                        request.parentid = project.id;
                                    } else {
                                        console.log("label not defined");
                                    }
                                } else {
                                    console.log("r is undefined");
                                }
                            }
                        } else {
                            project.isEmptyFolder = true;
                        }
                    }
                }
            }
        } else {
            this.treeUpdateData({});
        }
    }


    treeUpdateData(event) {
        if (this.experimentsService.startSearchSubject.getValue() === true) {

            this.dialogsService.stopAllSpinnerDialogs();
            // this.showSpinner = false;
            this.experimentsService.startSearchSubject.next(false);
            this.changeDetectorRef.detectChanges();
        }
    }


    /**
    Start of Ng2 tree
     */
    onMoveNode($event) {
        console.log(
            "Moved",
            $event.node.name,
            "to",
            $event.to.parent.name,
            "at index",
            $event.to.index);
        this.currentItem = $event.node;
        this.targetItem = $event.to.parent;
        this.getLabUsers($event);
    }

    /**
        Determine if the object is an array
        @param what
     */
    isArray(what) {
        return Object.prototype.toString.call(what) === "[object Array]";
    }

    detailFn(): (keywords: string) => void {
        return (keywords) => {
            window.location.href = "http://localhost/gnomex/experiments/" + keywords;
        };
    }

    showReassignWindow() {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.data = {
            currentItemId:      this.currentItem.id,
            idProject:          this.targetItem.id,
            labMembers:         this.labMembers,
            billingAccounts:    this.billingAccounts,
            currentItem:        this.currentItem,
            targetItem:         this.targetItem,
            showBillingCombo:   this.showBillingCombo
        };

        this.reassignExperimentDialogRef = this.dialog.open(ReassignExperimentComponent, configuration);

        this.reassignExperimentDialogRef.afterClosed().subscribe(result => {
            if (this.reassignExperimentDialogRef && this.reassignExperimentDialogRef.componentInstance.noButton) {
                this.resetTree();
            }
        });
    }


    /**
     * Get the target lab users. Set showBillingCombo.
     * @param event
     */
    getLabUsers(event: any) {
        if (event.node.isExternal === "N" && event.node.idLab === event.to.parent.idLab) {
            this.showBillingCombo = false;
        } else {
            this.showBillingCombo = true;
        }
        var params: URLSearchParams = new URLSearchParams();
        params.set("idLab", event.to.parent.idLab);

        var lPromise = this.experimentsService.getLab(params).toPromise();
        lPromise.then(response => {
            this.buildLabMembers(response, event);
        });

    }

    /**
     * Build the users that are in the reassign Labs.
     * @param response
     * @param event
     */
    buildLabMembers(response: any, event: any) {
        this.labMembers = [];
        this.billingAccounts = [];
        var requestCategoryCoreFacility: any =
            this.dictionaryService.getEntry(DictionaryService.REQUEST_CATEGORY, this.currentItem.codeRequestCategory).idCoreFacility;

        var i: number = 0;
        if (!this.createSecurityAdvisorService.isArray(response.possibleCollaborators)) {
            response.possibleCollaborators = [response.possibleCollaborators.AppUser];
        }
        for (let user of response.possibleCollaborators) {
            if (user.isActive === "Y") {
                this.labMembers[i] = user;
                user.label = user.firstLastDisplayName;
                i++;
            }
        }

        for (let billingAccount of response.authorizedBillingAccounts) {
            if (billingAccount.isApproved === "Y" && billingAccount.isActive === "Y" && billingAccount.idCoreFacility === requestCategoryCoreFacility) {
                billingAccount.label = billingAccount.accountName;
                this.billingAccounts.push(billingAccount);
            }
        }
        if (!this.createSecurityAdvisorService.isArray(response.managers)) {
            response.managers = [response.managers.AppUser];
        }

        for (let manager of response.managers) {
            var found = false;

            for (let firstLastName of this.labMembers) {
                if (manager.firstLastDisplayName.indexOf(firstLastName.firstLastDisplayName) > 0 ) {
                    found = true;
                    break;
                }

            }
            if (!found) {
                if(manager.isActive === "Y") {
                    manager.label = manager.firstLastDisplayName;
                    this.labMembers.push(manager);
                }
            }
        }
        if (this.labMembers.length < 1) {
            this.dialogsService
                .confirm("Sorry, in order to reassign this experiment you must change its owner to a member of the new lab group. However," +
                    "you do not have permission to access the member list for this lab. Please contact an administrator.", null)
                .subscribe(
                    res => {
                        this.resetTree();
                    }
                );
        } else {
            this.showReassignWindow();
        }

    }

    /**
     * Reset the tree to the initial state.
     */
    resetTree() {
        this.items = this.dragEndItems;
    }

    /**
     * The new project link is selected.
     * @param event
     */
    newProjectClicked(event: any) {
        if (this.items.length > 0 ) {
            var useThisLabList: any[];
            if (this.createSecurityAdvisorService.isSuperAdmin) {
                useThisLabList = this.labList;
            } else {
                useThisLabList = this.labs;
            }

            let selectedLab: string = "";
            if(this.selectedItem.data.idLab) {
                selectedLab = this.selectedItem.data.idLab;
            } else if (this.selectedItem.parent.data.idLab) {
                selectedLab = this.selectedItem.parent.data.idLab;
            }

            let configuration: MatDialogConfig = new MatDialogConfig();

            configuration.data = {
                labList:            useThisLabList,
                items:              this.items,
                selectedLabItem:    selectedLab
            };

            this.createProjectDialogRef = this.dialog.open(CreateProjectComponent, configuration);
        }
    }

    /**
     * The delete project link was selected.
     * @param event
     */
    deleteProjectClicked(event: any) {
        if(!this.selectedItem.data.isEmptyFolder) {
            this.dialogsService.alert("Project cannot be deleted because it has experiments. Please reassign experiments to another project before deleting.", "Warning");
            return;
        }
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.data = { selectedItem: this.selectedItem };

        this.deleteProjectDialogRef = this.dialog.open(DeleteProjectComponent, configuration);
    }

    deleteExperimentClicked() {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.data = { selectedExperiment: this.selectedExperiment };

        this.deleteExperimentDialogRef = this.dialog.open(DeleteExperimentComponent, configuration);
    }
    /**
     * A node is selected in the tree.
     * @param event
     */
    treeOnSelect(event: any) {
        this.selectedItem = event.node;
        let idLab = this.selectedItem.data.idLab;
        let idProject = this.selectedItem.data.idProject;
        let idRequest = this.selectedItem.data.idRequest;

        let projectRequestListNode: Array<any> = _.cloneDeep(this.selectedItem.data);
        this.experimentsService.emitExperimentOverviewList(projectRequestListNode);
        let navArray: Array<any> = [];

        this.disableDeleteProject = true;

        //Lab
        if (this.selectedItem.level === 1) {

            this.disableNewProject = !this.gnomexService.canSubmitRequests(idLab);
            this.disableDeleteExperiment = true;

             navArray = ["/experiments", {outlets: {"browsePanel": "overview"}}];

            //Project
        } else if (this.selectedItem.level === 2) {
            this.parentProject = event.node.parent;
            this.disableNewProject = !this.gnomexService.canSubmitRequests(idLab);
            this.disableDeleteExperiment = true;

            navArray = ["/experiments" , {outlets: {"browsePanel": ["overview", {"idLab": idLab, "idProject": idProject}]}}];

            //Experiment
        } else {
            navArray = ["/experiments",  {outlets: {"browsePanel": [idRequest]}}];
            this.parentProject = event.node.parent;
            this.disableNewProject = true;
            this.experimentsService.getExperiment(this.selectedItem.data.idRequest).subscribe((response: any) => {
                this.selectedExperiment = response.Request;
                if (response.Request.canDelete === "Y") {
                    this.disableDeleteExperiment = false;
                } else {
                    this.disableDeleteExperiment = true;
                }
            },(err:IGnomexErrorResponse) => {
            });

        }

        this.router.navigate(navArray);

    }

    /**
     * The expand collapse toggle is selected.
     */
    expandCollapseClicked(): void {
        setTimeout(_ => {

            var toggled = this.toggleButton.toggled();

            if (toggled) {
                this.toggleButton.val("Expand Projects");
                this.treeModel.collapseAll();
            } else {

                this.toggleButton.val("Collapse Projects");
                this.treeModel.expandAll();
            }
        });
    }

    dragDropHintClicked(event: any) {
        let configuration: MatDialogConfig = new MatDialogConfig();

        let dialogRef: MatDialogRef<DragDropHintComponent> = this.dialog.open(DragDropHintComponent, configuration);
    }

    /**
     * Show the response from the back end.
     */
    responseMsgNoButtonClicked() {
        this.responseMsg = "";
        this.responseMsgWindow.close();
    }

    ngOnDestroy(): void {
        this.utilService.removeChangeDetectorRef(this.changeDetectorRef);
        this.navInitSubscription.unsubscribe();
        this.gnomexService.navInitBrowseExperimentSubject.next(null);
        this.projectRequestListSubscription.unsubscribe();
        this.labListSubscription.unsubscribe();
        this.navProjectReqList = null;
        this.experimentsService.filteredLabs = undefined;
        this.experimentsService.labList = [];
        UtilService.safelyUnsubscribe(this.canDeleteProjectSubscription);
    }

    onShowEmptyFolders(event: MatCheckboxChange): void {
        const hiddenNodeIds = {};

        if(!this.showEmptyFolders) {
            this.items.forEach((data) => {
                if(data && data.items) {
                    data.items.forEach((node) => {
                        if (node.isEmptyFolder) {
                            hiddenNodeIds[node.id] = true;
                        }
                    });
                }
            });
        }

        this.state = {
            ...this.state,
            hiddenNodeIds
        };
    }

    private findNodeById(id: string): TreeNode {
        if (this.treeModel && this.treeModel.roots) {
            for (let lab of this.treeModel.roots) {
                if(id.substr(0, 1) === "l") {
                    if(lab.data.id === id) {
                        return lab;
                    }
                } else {
                    if (lab.hasChildren) {
                        for (let project of lab.children) {
                            if(id.substr(0, 1) === "p") {
                                if (project.data.id === id) {
                                    return project;
                                }
                            } else if (id.substr(0, 1) === "r") {
                                if (project.hasChildren) {
                                    for (let experiment of project.children) {
                                        if (experiment.data.id === id) {
                                            return experiment;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

}
