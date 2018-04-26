/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {
    AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,
    ViewEncapsulation
} from "@angular/core";

import { URLSearchParams } from "@angular/http";

import {ExperimentsService} from "./experiments.service";
import { jqxWindowComponent } from "jqwidgets-framework";
import { jqxButtonComponent } from "jqwidgets-framework";
import { jqxComboBoxComponent } from "jqwidgets-framework";
import { jqxNotificationComponent  } from "jqwidgets-framework";
import { jqxCheckBoxComponent } from "jqwidgets-framework";
import {jqxLoaderComponent} from "jqwidgets-framework";
import {TreeComponent, ITreeOptions, TreeNode, TreeModel} from "angular-tree-component";
import { BrowseFilterComponent } from "../util/browse-filter.component";
import { transaction } from 'mobx';
import * as _ from "lodash";
import {Subscription} from "rxjs/Subscription";
import {ActivatedRoute, Router} from "@angular/router";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {CreateProjectComponent} from "./create-project.component";
import {MatDialog, MatDialogRef} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {DialogsService} from '../util/popup/dialogs.service';
import {DeleteProjectComponent} from "./delete-project.component";
import {ReassignExperimentComponent} from "./reassign-experiment.component";
import {DeleteExperimentComponent} from "./delete-experiment.component";
import {DragDropHintComponent} from "../analysis/drag-drop-hint.component";
import {DictionaryService} from "../services/dictionary.service";
import {PropertyService} from "../services/property.service";

const VIEW_LIMIT_EXPERIMENTS: string = "view_limit_experiments";
import {GnomexService} from "../services/gnomex.service";

@Component({
    selector: "experiments",
    templateUrl: "./browse-experiments.component.html",
    styles: [`
        .inlineComboBox {
            display: inline-block;
        }

        .hintLink
        {
            fontSize: 9;
            paddingLeft: 1;
            paddingRight: 1;
            paddingBottom: 1;
            paddingTop: 1;
        }

        .sidebar {
            width: 25%;
            position: relative;
            left: 0;
            background-color: #ccc;
            transition: all .25s;
        }

        .flex-column-container {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 100%;
        }

        .flex-row-container {
            display: flex;
            flex-direction: row;
        }

        .br-exp-row-one {
            flex-grow: 1;
        }

        .br-exp-item-row-two {
            flex-grow: 1;
        }

        .br-exp-item {
            flex: 1 1 auto;
            font-size: small;
        }

        .br-exp-one {
            width: 100%;
            flex-grow: .25;

        }

        .br-exp-help-drag-drop {
            width: 100%;
            flex-grow: .10;
        }

        .br-exp-three {
            width: 100%;
            height: 5px;
            flex-grow: 2;
        }

        .br-exp-four {
            width: 100%;
            flex-grow: .10;
        }

        .br-exp-five {
            width: 100%;
            flex-grow: .10;
        }

        .t {
            display: table;
            width: 100%;
        }

        .tr {
            display: table-row;
            width: 100%;
        }

        .td {
            display: table-cell;
        }

        .jqx-tree {
            height: 100%;
        }

        .jqx-notification {
            margin-top: 30em;
            margin-left: 20em;
        }

        div.background {
            width: 100%;
            height: 100%;
            background-color: #EEEEEE;
            padding: 0.3em;
            border-radius: 0.3em;
            border: 1px solid darkgrey;
            display: flex;
            flex-direction: column;
        }
        .experiment-detail-panel {
            height:98%;
            width:100%;
            border: #C8C8C8 solid thin;
            padding: 1em;
            
        }
        .exp-overview-item {
            flex: 1 1 auto;
        }
        
    `]
})

export class BrowseExperimentsComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild("tree") treeComponent: TreeComponent;
    @ViewChild("responseMsgWindow") responseMsgWindow: jqxWindowComponent;
    @ViewChild("msgNoAuthUsersForLab") msgNoAuthUsersForLab: jqxNotificationComponent;
    @ViewChild("toggleButton") toggleButton: jqxButtonComponent;

    @ViewChild(BrowseFilterComponent)

    private treeModel: TreeModel;
    /*
    angular2-tree options
     */
    private options: ITreeOptions = {
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

        allowDrag: (node) => node.isLeaf,
    };

    private items: any;
    private labs: any;
    private isClose = true;
    private responseMsg: string = "";
    private currentItem: any;
    private targetItem: any;
    private projectDescription: string = "";
    private projectName: string = "";

    private labMembers: any;
    private billingAccounts: any;
    private dragEndItems: any;
    private selectedItem: any;
    private showBillingCombo: boolean = false;
    private labList: any[] = [];
    private selectedExperiment: any;
    public experimentCount: number;
    private projectRequestListSubscription: Subscription;
    public disableNewProject: boolean = true;
    public disableDeleteProject: boolean = true;
    public disableDeleteExperiment: boolean = true;
    public deleteProjectDialogRef: MatDialogRef<DeleteProjectComponent>;
    public createProjectDialogRef: MatDialogRef<CreateProjectComponent>;
    public reassignExperimentDialogRef: MatDialogRef<ReassignExperimentComponent>;
    public deleteExperimentDialogRef: MatDialogRef<DeleteExperimentComponent>;
    public showSpinner: boolean = false;
    private viewLimit: number = 999999;
    private navProjectReqList:any;

    ngOnInit() {
        this.treeModel = this.treeComponent.treeModel;
        this.labListService.getLabList().subscribe((response: any[]) => {
            this.labList = response;
        });
        if (this.propertyService.getProperty(VIEW_LIMIT_EXPERIMENTS) != null) {
            this.viewLimit = this.propertyService.getProperty(VIEW_LIMIT_EXPERIMENTS).propertyValue;
        }

    }

    ngAfterViewInit(){
    }


    constructor(public experimentsService: ExperimentsService,private router:Router,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialog: MatDialog,
                private dialogsService: DialogsService,
                private changeDetectorRef: ChangeDetectorRef,
                private dictionaryService: DictionaryService,
                private labListService: LabListService,
                private propertyService: PropertyService,
                private gnomexService: GnomexService,
                private route:ActivatedRoute) {


        this.items = [];
        this.dragEndItems = [];
        this.labMembers = [];
        this.billingAccounts = [];
        this.labs = [];



        this.projectRequestListSubscription = this.experimentsService.getProjectRequestListObservable().subscribe(response => {
            this.buildTree(response);
            if (this.createProjectDialogRef) {
                this.createProjectDialogRef.componentInstance.showSpinner = false;
                this.createProjectDialogRef.close();
                this.createProjectDialogRef = null;
            }
            if (this.deleteProjectDialogRef) {
                this.deleteProjectDialogRef.componentInstance.showSpinner = false;
                this.deleteProjectDialogRef.close();
                this.deleteProjectDialogRef = null;
            }

            if (this.deleteExperimentDialogRef) {
                this.deleteExperimentDialogRef.componentInstance.showSpinner = false;
                this.deleteExperimentDialogRef.close();
                this.deleteExperimentDialogRef = null;
            }

            if (this.reassignExperimentDialogRef) {
                this.reassignExperimentDialogRef.componentInstance.showSpinner = false;
                this.reassignExperimentDialogRef.close();
                this.reassignExperimentDialogRef = null;
            }

            this.experimentsService.emitExperimentOverviewList(response);
            if(this.experimentsService.browsePanelParams && this.experimentsService.browsePanelParams["refreshParams"]){

                let navArray :any[] = ['/experiments',{outlets:{'browsePanel':'overview'}}];
                if(this.navProjectReqList){
                   navArray.splice(1, 0, +this.route.snapshot.paramMap.get("idProject"));
                }

                this.router.navigate(navArray);
                this.experimentsService.browsePanelParams["refreshParams"] = false;
            }


            setTimeout(()=>{
                this.toggleButton.val("Collapse Projects");
                this.treeModel.expandAll();

                if(this.gnomexService.orderInitObj){
                    let id:string = "r" + this.gnomexService.orderInitObj.idRequest;
                    if(this.treeModel && id){
                        this.treeModel.getNodeById(id).setIsActive(true);
                        this.treeModel.getNodeById(id).scrollIntoView();
                        this.gnomexService.orderInitObj = null;
                    }
                }
            });
        });


        this.route.data.forEach( data => {
            console.log("This is the project request data: " , data.projectList);
            this.navProjectReqList = data.projectList;
            if(this.navProjectReqList){
                this.experimentsService.emitProjectRequestList(this.navProjectReqList);
            }

        });

        this.experimentsService.startSearchSubject.subscribe((value) =>{
            if (value) {
                this.showSpinner = true;
            }
        });





    }

    go(event: any) {
    }

    /*
    Build the tree data
    @param
     */
    buildTree(response: any[]) {
        this.labs = [];
        this.experimentCount = 0;
        if (response) {
            if (!this.isArray(response)) {
                this.items = [response];
            } else {
                this.items = response;
            }
            this.labs = this.labs.concat(this.items);
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
                            if (!this.isArray(project.Request)) {
                                project.items = [project.Request];
                            } else {
                                project.items = project.Request;
                            }
                            for (var request of project.items) {
                                if (request) {
                                    if (request.label) {
                                        request.label = request.requestNumber + '-' + request.name;
                                        this.experimentCount++;
                                        if (this.experimentCount >= this.viewLimit) {
                                            return;
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
                            console.log("");
                        }
                    }
                }
            }
        }else{
            this.treeUpdateData({});
        }
    };

    treeUpdateData(event) {
        if (this.experimentsService.startSearchSubject.getValue() === true) {
            this.showSpinner = false;
            this.experimentsService.startSearchSubject.next(false);
            this.changeDetectorRef.detectChanges();
        }
    }


    /*

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

    /*
        Determine if the object is an array
        @param what
     */
    isArray(what) {
        return Object.prototype.toString.call(what) === "[object Array]";
    };

    detailFn(): (keywords: string) => void {
        return (keywords) => {
            window.location.href = "http://localhost/gnomex/experiments/" + keywords;
        };
    }

    showReassignWindow() {
        this.reassignExperimentDialogRef= this.dialog.open(ReassignExperimentComponent, {
            data: {
                currentItemId: this.currentItem.id,
                idProject: this.targetItem.id,
                labMembers: this.labMembers,
                billingAccounts: this.billingAccounts,
                currentItem: this.currentItem,
                targetItem: this.targetItem,
                showBillingCombo: this.showBillingCombo

            }
        });
        this.reassignExperimentDialogRef.afterClosed()
            .subscribe(result => {
                if (this.reassignExperimentDialogRef && this.reassignExperimentDialogRef.componentInstance.noButton) {
                    this.resetTree();
                }
            })
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
                .confirm('Sorry, in order to reassign this experiment you must change its owner to a member of the new lab group. However,' +
                    'you do not have permission to access the member list for this lab. Please contact an administrator.', null)
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

            this.createProjectDialogRef= this.dialog.open(CreateProjectComponent, {
                data: {
                    labList: useThisLabList,
                    items: this.items,
                    selectedLabItem: this.selectedItem
                }
            });
        }
    }

    /**
     * The delete project link was selected.
     * @param event
     */
    deleteProjectClicked(event: any) {
        //this.deleteProjectWindow.open();
        this.deleteProjectDialogRef = this.dialog.open(DeleteProjectComponent, {
            data: {
                selectedItem: this.selectedItem,
            }
        });
    }

    deleteExperimentClicked() {
        this.deleteExperimentDialogRef = this.dialog.open(DeleteExperimentComponent, {
            data: {
                selectedExperiment: this.selectedExperiment
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
        if(this.gnomexService.orderInitObj){
            return;
        }

        let projectRequestListNode:Array<any> = _.cloneDeep(this.selectedItem.data);
        let navArray:Array<any> = [];

        //Lab
        if (this.selectedItem.level === 1) {

            this.disableNewProject = false;
            this.disableDeleteProject = true;
            this.disableDeleteExperiment = true;

            navArray = ['/experiments',{outlets:{'browsePanel':'overview'}}];
            this.experimentsService.emitExperimentOverviewList(projectRequestListNode);


            //Project
        } else if (this.selectedItem.level === 2) {
            this.disableNewProject = false;
            this.disableDeleteProject = false;
            this.disableDeleteExperiment = true;

            navArray = ['/experiments' , {outlets:{'browsePanel':['overview',{'idLab':idLab,'idProject':idProject}]}}];
            this.experimentsService.emitExperimentOverviewList(projectRequestListNode);

            //Experiment
        } else {
            navArray = ['/experiments',  {outlets:{'browsePanel':[idRequest]}}];
            this.disableNewProject = true;
            this.disableDeleteProject = true;
            this.experimentsService.getExperiment(this.selectedItem.data.idRequest).subscribe((response: any) => {
                this.selectedExperiment = response.Request;
                if (response.Request.canDelete === "Y") {
                    this.disableDeleteExperiment = false;
                } else {
                    this.disableDeleteExperiment = true;
                }
            });

        }

        if(this.navProjectReqList){
            navArray.splice(1, 0, +this.route.snapshot.paramMap.get("idProject"));
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
    };

    dragDropHintClicked(event: any) {
        let dialogRef: MatDialogRef<DragDropHintComponent> = this.dialog.open(DragDropHintComponent, {
        });
    }

    /**
     * Show the response from the back end.
     */
    responseMsgNoButtonClicked() {
        this.responseMsg = "";
        this.responseMsgWindow.close();
    }

    ngOnDestroy(): void {
        this.projectRequestListSubscription.unsubscribe();
        this.navProjectReqList = null;
    }
}
