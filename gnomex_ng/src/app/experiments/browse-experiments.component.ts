import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from "@angular/core";

import {ExperimentsService} from "./experiments.service";
import {ITreeOptions, ITreeState, TreeComponent, TreeModel, TreeNode} from "angular-tree-component";
import {BrowseFilterComponent} from "../util/browse-filter.component";
import * as _ from "lodash";
import {Subscription} from "rxjs";
import {ActivatedRoute, NavigationEnd, NavigationExtras, ParamMap, Router} from "@angular/router";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {CreateProjectComponent} from "./create-project.component";
import {MatDialogConfig} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {DeleteProjectComponent} from "./delete-project.component";
import {ReassignExperimentComponent} from "./reassign-experiment.component";
import {DeleteExperimentComponent} from "./delete-experiment.component";
import {DictionaryService} from "../services/dictionary.service";
import {PropertyService} from "../services/property.service";
import {GnomexService} from "../services/gnomex.service";
import {HttpParams} from "@angular/common/http";
import {UtilService} from "../services/util.service";
import {filter} from "rxjs/operators";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../services/constants.service";
import {NavigationService} from "../services/navigation.service";

const VIEW_LIMIT_EXPERIMENTS: string = "view_limit_experiments";

@Component({
    selector: "experiments",
    templateUrl: "./browse-experiments.component.html",
    styles: [`


        .t  { display: table;      }
        .tr { display: table-row;  }
        .td { display: table-cell; }

        .half-width { width: 50%; }

        .vertical-center { vertical-align: middle; }
        .horizontal-center { text-align: center; }

        .vertical-spacer {
            height: 0.3em;
            min-height: 0.3em;
        }


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

        .allow-line-breaks {
            white-space: pre-line;
        }
        .background-lightyellow {
            background-color: lightyellow;
        }

    `]
})

export class BrowseExperimentsComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild("tree") treeComponent: TreeComponent;
    toggleButton: string = "Expand Projects";

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
    public lookupLab: string = "";

    public readonly DRAG_DROP_HINT: string = "Drag-and-drop to move object to another group";
    public showDragDropHint: boolean = false;

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
    private labListSubscription: Subscription;
    private navEndSubscription: Subscription;
    private parentProject: any;
    private setActiveNodeId: string;
    private canDeleteProjectSubscription: Subscription;
    private qParamMap: ParamMap;
    private paramMap: ParamMap;

    constructor(public experimentsService: ExperimentsService,
                private changeDetectorRef: ChangeDetectorRef,
                private utilService: UtilService,
                public createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private labListService: LabListService,
                private propertyService: PropertyService,
                private route: ActivatedRoute,
                private router: Router,
                private navService:NavigationService,
                public constantsService: ConstantsService) {

    }


    ngOnInit() {
        this.experimentsService.currentTabIndex = 0;
        this.items = [];
        this.dragEndItems = [];
        this.labMembers = [];
        this.billingAccounts = [];
        this.labs = [];

        this.navService.navMode = this.navService.navMode !== NavigationService.USER ? NavigationService.URL : NavigationService.USER;
        let activatedRoute = this.navService.getChildActivateRoute(this.route);
        if(activatedRoute){
            activatedRoute.queryParamMap.subscribe((qParam)=>{this.qParamMap = qParam });
            activatedRoute.paramMap.subscribe((param)=>{ this.paramMap = param });
        }


        this.experimentsService.startSearchSubject.subscribe((value) => {
            if (value) {
                this.dialogsService.startDefaultSpinnerDialog();
            }
        });


        this.projectRequestListSubscription = this.experimentsService.getProjectRequestListObservable().subscribe(response => {
            this.lookupLab = "";
            this.experimentCount = response.experimentCount ? response.experimentCount : "0";
            this.experimentCountMessage = response.message ? "(" + response.message + ")" : "";

            if(this.experimentCount === "0" && !response.Lab) {
                this.dialogsService.stopAllSpinnerDialogs();
                this.dialogsService.error("Insufficient permission to access this request or this lab.", "INVALID");
                return;
            }

            this.buildTree(response.Lab);
            this.onShowEmptyFolders(this.showEmptyFolders);

            if (this.experimentsService.browsePanelParams && this.experimentsService.browsePanelParams["refreshParams"]) {
                this.experimentsService.emitExperimentOverviewList(response.Lab);

                if (this.treeModel && this.treeModel.getActiveNode()) {// Refresh to initial state when search button clicked
                    this.treeModel.getActiveNode().setIsActive(false);
                    this.treeModel.setFocusedNode(null);
                }
                this.disableNewProject = true;
                this.disableDeleteProject = true;
                this.disableDeleteExperiment = true;
            }


            setTimeout(() => {
                this.toggleButton = "Collapse Projects";
                this.treeModel.expandAll();
                if(this.navService.navMode === NavigationService.URL) {
                    let idName = "";
                    let idVal = "";
                   if (this.paramMap.get("idRequest") ){
                       idName = "idRequest";
                       idVal = this.paramMap.get("idRequest")
                   }else if(this.qParamMap.get("idProject")){
                       idName = "idProject";
                       idVal = this.qParamMap.get("idProject")
                   }else if(this.qParamMap.get("idLab")){
                       idName = "idLab";
                       idVal = this.qParamMap.get("idLab");
                   }

                    if(this.treeModel) {
                        let node = UtilService.findTreeNode(this.treeModel, idName, idVal);
                        if(node) {
                            node.setIsActive(true);
                            node.scrollIntoView();
                        }
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

            allowDrag: (node) => !this.createSecurityAdvisorService.isGuest && node.isLeaf && node.data.idRequest,
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

        // to avoid calling get request multiple times gets the request off of route after it has been resolved.
        this.navEndSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if(this.route.snapshot.firstChild) {
                    let data = this.route.snapshot.firstChild.data;
                    if (data.experiment && data.experiment.Request) {
                        this.selectedExperiment = data.experiment.Request;
                        if (this.selectedExperiment.canDelete === "Y") {
                            this.disableDeleteExperiment = false;
                        } else {
                            this.disableDeleteExperiment = true;
                        }
                    }
                }
            });

    }

    ngAfterViewInit() {}




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
                                        if (request.name) {
                                            request.label = request.requestNumber + "-" + request.name;
                                        } else {
                                            request.label = request.requestNumber;
                                        }

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
        configuration.width = "40em";
        configuration.autoFocus = false;
        configuration.data = {
            labMembers:         this.labMembers,
            billingAccounts:    this.billingAccounts,
            currentItem:        this.currentItem,
            targetItem:         this.targetItem,
            showBillingCombo:   this.showBillingCombo
        };

        this.dialogsService.genericDialogContainer(ReassignExperimentComponent,
            "Reassignment", this.constantsService.ICON_FOLDER_ADD, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Yes", internalAction: "reassignYesButtonClicked"},
                    {type: ActionType.SECONDARY, name: "No", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
            if(!result) {
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
        let params: HttpParams = new HttpParams()
            .set("idLab", event.to.parent.idLab);

        let lPromise = this.experimentsService.getLab(params).toPromise();
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

        for (let billingAccount of response.billingAccounts) {
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
                .alert("Sorry, in order to reassign this experiment you must change its owner to a member of the new lab group. However," +
                    "you do not have permission to access the member list for this lab. Please contact an administrator.", null, DialogType.FAILED)
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
            configuration.width = "45em";
            configuration.autoFocus = false;
            configuration.data = {
                labList:            useThisLabList,
                items:              this.items,
                selectedLabItem:    selectedLab
            };

            this.dialogsService.genericDialogContainer(CreateProjectComponent, "New Project", this.constantsService.ICON_FOLDER_ADD, configuration,
                {actions: [
                        {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                    ]}).subscribe((result: any) => {
                if(result) {
                    this.setActiveNodeId = "p" + result;
                }
            });
        }
    }

    /**
     * The delete project link was selected.
     * @param event
     */
    deleteProjectClicked(event: any) {
        if(!this.selectedItem.data.isEmptyFolder) {
            this.dialogsService.alert("Project cannot be deleted because it has experiments. <br>Please reassign experiments to another project before deleting.", "", DialogType.WARNING);
            return;
        }
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "30em";
        configuration.height = "15em";
        configuration.disableClose = true;
        configuration.data = { selectedItem: this.selectedItem };

        this.dialogsService.genericDialogContainer(DeleteProjectComponent, "Warning: Delete Project",
            this.constantsService.ICON_EXCLAMATION, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Yes", internalAction: "deleteProject"},
                    {type: ActionType.SECONDARY, name: "No", internalAction: "cancel"}
                ]}).subscribe((result: any) => {
            if(result && this.parentProject) {
                this.setActiveNodeId = this.parentProject.data.id;
            }
        });
    }

    deleteExperimentClicked() {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "30em";
        configuration.height = "15em";
        configuration.disableClose = true;
        configuration.data = { selectedExperiment: this.selectedExperiment };

        this.dialogsService.genericDialogContainer(DeleteExperimentComponent, "Warning: Delete Experiment", this.constantsService.ICON_EXCLAMATION, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Yes", internalAction: "deleteExperiment"},
                    {type: ActionType.SECONDARY, name: "No", internalAction: "cancel"}
                ]}).subscribe((result: any) => {
            if(result && this.parentProject) {
                this.setActiveNodeId = this.parentProject.data.id;
            }
        });
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
        let navExtras: NavigationExtras = {};
        this.disableDeleteProject = true;

        if(this.navService.navMode === NavigationService.USER){

            //Lab
            if (this.selectedItem.level === 1) {

                this.disableNewProject = !this.gnomexService.canSubmitRequests(idLab);
                this.disableDeleteExperiment = true;

                navArray = ["/experiments",  "overview"];
                //Project
            } else if (this.selectedItem.level === 2) {
                this.parentProject = event.node.parent;
                this.disableNewProject = !this.gnomexService.canSubmitRequests(idLab);
                this.disableDeleteExperiment = true;

                navArray = ["/experiments", "overview" ]; //["/experiments" , {outlets: {"browsePanel": ["overview", {"idLab": idLab, "idProject": idProject}]}}];
                navExtras = {queryParams: { idProject:idProject}};

                //Experiment
            } else {
                navArray = ["/experiments", "detail" , idRequest]; //["/experiments",  {outlets: {"browsePanel": [idRequest]}}];
                this.parentProject = event.node.parent;
                this.disableNewProject = true;

            }

            navExtras.relativeTo = this.route;
            navExtras.queryParamsHandling = 'merge';
            this.router.navigate(navArray,navExtras);

        }else{
            this.navService.emitResetNavModeSubject("detail");
            this.navService.emitResetNavModeSubject("overview");
            this.dialogsService.removeSpinnerWorkItem();
        }


    }

    /**
     * The expand collapse toggle is selected.
     */
    expandCollapseClicked(): void {
        if (this.toggleButton === "Collapse Projects") {
            this.toggleButton = "Expand Projects"
            this.treeModel.collapseAll();
        } else {
            this.toggleButton = "Collapse Projects";
            this.treeModel.expandAll();
        }

    }

    onClickShowDragDropHint(): void {
        this.showDragDropHint = !this.showDragDropHint;
    }

    ngOnDestroy(): void {

        UtilService.safelyUnsubscribe(this.navEndSubscription);
        UtilService.safelyUnsubscribe(this.projectRequestListSubscription);
        UtilService.safelyUnsubscribe(this.labListSubscription);
        UtilService.safelyUnsubscribe(this.canDeleteProjectSubscription);
        this.utilService.removeChangeDetectorRef(this.changeDetectorRef);
        this.experimentsService.filteredLabs = undefined;
        this.experimentsService.labList = [];

    }

    onShowEmptyFolders(event: any): void {
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

        this.changeDetectorRef.detectChanges();
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
