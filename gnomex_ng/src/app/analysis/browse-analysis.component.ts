import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,} from "@angular/core";
import {ITreeOptions, TREE_ACTIONS, TreeComponent, TreeModel, TreeNode,} from "angular-tree-component";
import * as _ from "lodash";
import {Subscription} from "rxjs";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {AnalysisService} from "../services/analysis.service";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {DeleteAnalysisComponent} from "./delete-analysis.component";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {LabListService} from "../services/lab-list.service";
import {CreateAnalysisComponent} from "./create-analysis.component";
import {CreateAnalysisGroupComponent} from "./create-analysis-group.component";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {GnomexService} from "../services/gnomex.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {UtilService} from "../services/util.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../services/constants.service";
import {filter} from "rxjs/operators";


@Component({
    selector: "analysis",
    templateUrl: "./browse-analysis.component.html",
    styles: [`
        .t  { display: table;      }
        .tr { display: table-row;  }
        .td { display: table-cell; }
        .padded { padding: 0.3em; }
        .left-right-padded {
            padding-left:  0.3em;
            padding-right: 0.3em;
        }
        .major-left-right-padded {
            padding-left: 1em;
            padding-right: 0.3em;
        }
        .no-word-wrap { white-space: nowrap; }
        .no-overflow  { overflow: hidden;    }
        .foreground { background-color: white;   }
        .background { background-color: #EEEEEE; }
        .vertical-spacer { height: 0.3em; }
        .border { border: #C8C8C8 solid thin; }
        .major-border {
            border-radius: 0.3em;
            border: 1px solid darkgrey;
        }
        .no-padding-dialog {
            padding: 0;
        }
        .small-font {
            font-size: 12px;
        }
    `]
})

export class BrowseAnalysisComponent implements OnInit, OnDestroy, AfterViewInit {


    @ViewChild("analysisTree") treeComponent: TreeComponent;
    public options: ITreeOptions;

    public items: any;
    public labs: any;
    public currentItem: any;
    public targetItem: any;

    public labMembers: any;

    public analysisCount: string = "0";
    public analysisCountMessage: string = "";
    public disabled: boolean = true;
    public disableNewAnalysis: boolean = true;
    public disableDelete: boolean = true;
    public disableNewAnalysisGroup: boolean = true;
    public disableAll: boolean = false;
    private treeModel: TreeModel;
    private billingAccounts: any;
    private selectedItem: ITreeNode;
    private analysisGroupListSubscription: Subscription;
    private labList: any[] = [];
    private labListString: any[] = [];
    private selectedIdLab: any;
    private selectedIdAnalysisGroup: any;
    private parentProject: any;
    private navAnalysisGroupListSubscription: Subscription;
    private navEndSubscription:Subscription;
    private labListSubscription: Subscription;

    ngOnInit() {
        this.utilService.registerChangeDetectorRef(this.changeDetectorRef);
        this.treeModel = this.treeComponent.treeModel;
        this.options = {
            idField: "analysisTreeId",
            displayField: "label",
            childrenField: "items",
            useVirtualScroll: true,
            nodeHeight: 22,
            nodeClass: (node: TreeNode) => {
                return "icon-" + node.data.icon;
            },
            allowDrop: (element: any, to: {parent: TreeNode, index: number}) => {
                return !!to.parent.data.idAnalysisGroup;
            },
            allowDrag: (node: any) => !this.createSecurityAdvisorService.isGuest && node.isLeaf,
            actionMapping: {
                mouse: {
                    click: (tree, node, $event) => {
                        $event.ctrlKey
                            ? TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event)
                            : TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
                    },
                    dragStart: (tree: TreeModel, node: TreeNode, $event) => {
                        if (!node.isActive) {
                            TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
                        }
                    },
                    drop: this.moveNode,
                }
            },
        };

        this.labListService.getLabList_FromBackEnd();
        this.labListSubscription =  this.labListService.getLabListSubject().subscribe((resp: any[]) => {
            this.labList = resp;
        });

        if (this.createSecurityAdvisorService.isGuest) {
            this.disableAll = true;
        }

        this.analysisGroupListSubscription = this.analysisService.getAnalysisGroupListObservable().subscribe(response => {
            this.items = [].concat([]);

            if (!response) {
                this.dialogsService.alert("No results");
                return;
            }

            if (response && response.analysisCount) {
                this.analysisCount = response.analysisCount;
                this.analysisCountMessage = response.message ? "(" + response.message + ")" : "";
            } else {
                this.analysisCount = "0";
                this.analysisCountMessage = "";
            }

            this.buildTree(response.Lab);

            if(this.analysisService.createdAnalysis) {
                this.analysisService.setActiveNodeId = "a" + this.analysisService.createdAnalysis;
                this.analysisService.createdAnalysis = null;
            }


            if (this.analysisService.analysisPanelParams && this.analysisService.analysisPanelParams["refreshParams"]) { // If user is searching or removing from grid
                if (this.treeModel && this.treeModel.getActiveNode()) {
                    if (this.analysisService.isDeleteFromGrid) { // When removing analysis from a selected group, remain stay in the group after removed
                        this.analysisService.setActiveNodeId = this.treeModel.getActiveNode().data.id;
                        this.analysisService.isDeleteFromGrid = false;
                    } else { // Refresh to initial state when search button clicked
                        this.treeModel.getActiveNode().setIsActive(false);
                        this.treeModel.setFocusedNode(null);
                    }
                }

                if (!this.treeModel.getActiveNode()) {
                    this.analysisService.emitAnalysisOverviewList(response.Lab);
                    let navArray: any[] = ["/analysis", {outlets: {"analysisPanel": "overview"}}];
                    this.router.navigate(navArray);
                    this.disableNewAnalysis = true;
                    this.disableNewAnalysisGroup = true;
                    this.disableDelete = true;
                }

                this.analysisService.analysisPanelParams["refreshParams"] = false;

            }


            setTimeout(() => {
                this.treeModel.expandAll();
                if(this.gnomexService.orderInitObj) { // this is if component is being navigated to by url
                    let id: string = "" + this.gnomexService.orderInitObj.idAnalysis;
                    if(this.treeModel && id) {
                        let node: ITreeNode = this.findNodeById("a" + id);
                        if(node) {
                            node.setIsActive(true);
                            node.scrollIntoView();
                        } else {
                            let navArray = ["/analysis", {outlets: {"analysisPanel": [this.gnomexService.orderInitObj.idAnalysis]}}];
                            this.router.navigate(navArray);
                        }
                        this.gnomexService.orderInitObj = null;
                    }
                } else if(this.analysisService.setActiveNodeId) {
                    let node: TreeNode;
                    node = this.findNodeById(this.analysisService.setActiveNodeId);
                    this.analysisService.setActiveNodeId = null;

                    if (node) {
                        node.setIsActive(true);
                        node.scrollIntoView();
                    }
                }

                this.dialogsService.stopAllSpinnerDialogs();
            });
        });

        this.navAnalysisGroupListSubscription = this.gnomexService.navInitBrowseAnalysisSubject.subscribe( orderInitObj => {
            if(orderInitObj) {

                let idLab = this.gnomexService.orderInitObj.idLab;
                let idAnalysisGroup = this.gnomexService.orderInitObj.idAnalysisGroup;
                let ids: HttpParams = new HttpParams()
                    .set("idLab", idLab)
                    .set("searchPublicProjects", "Y")
                    .set("showCategory", "N")
                    .set("idAnalysisGroup", idAnalysisGroup)
                    .set("showSamples", "N");

                this.analysisService.analysisPanelParams = ids;
                this.analysisService.getAnalysisGroupList_fromBackend(ids);
            }
        });

        this.navEndSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if(this.route.snapshot.firstChild) {
                    let data = this.route.snapshot.firstChild.data;
                    if(data.analysis && data.analysis.Analysis){
                        let selectedAnalysis = data.analysis.Analysis;
                        if (selectedAnalysis.canDelete === "Y") {
                            this.disableDelete = false;
                        } else {
                            this.disableDelete = true;
                        }
                    }
                }
            });
    }

    ngAfterViewInit() {
    }

    constructor(private analysisService: AnalysisService, private router: Router,
                private dialog: MatDialog,
                private dialogsService: DialogsService,
                private route: ActivatedRoute,
                private constService: ConstantsService,
                private utilService: UtilService,
                private gnomexService: GnomexService,
                private labListService: LabListService,
                private changeDetectorRef: ChangeDetectorRef,
                public createSecurityAdvisorService: CreateSecurityAdvisorService) {


        this.items = [];
        this.labMembers = [];
        this.billingAccounts = [];
        this.labs = [];

        this.analysisService.startSearchSubject.subscribe((value) => {
            if (value) {
                setTimeout(() => {
                    this.dialogsService.startDefaultSpinnerDialog();
                });
            }
        });

    }

    /*
    Build the tree data
    @param
     */
    buildTree(response: any[]) {
        this.labs = [];
        this.items = [];

        if(response) {
            if (!this.isArray(response)) {
                this.items = [response];
            } else {
                this.items = response;
            }

            this.labs = this.labs.concat(this.items);
            this.analysisService.emitCreateAnalysisDataSubject({labs: this.labs, items: this.items});
            for (var l of this.items) {
                l.id = "l" + l.idLab;
                l.parentid = -1;

                l.icon = "assets/group.png";

                if (l.AnalysisGroup) {
                    if (!this.isArray(l.AnalysisGroup)) {
                        l.items = [l.AnalysisGroup];
                    } else {
                        l.items = l.AnalysisGroup;
                    }
                    for (var p of l.items) {
                        p.icon = "assets/folder.png";
                        p.idLab = l.idLab;
                        p.id = "p" + p.idAnalysisGroup;
                        if (p.Analysis) {
                            if (!this.isArray(p.Analysis)) {
                                p.items = [p.Analysis];
                            } else {
                                p.items = p.Analysis;
                            }
                            for (var a of p.items) {
                                if (a) {
                                    if (a.label) {
                                        var labelString: string = a.number;
                                        labelString = labelString.concat(" (");
                                        labelString = labelString.concat(a.label);
                                        labelString = labelString.concat(")");
                                        a.label = labelString;
                                        a.id = "a" + a.idAnalysis;
                                        a.icon = "assets/map.png";
                                        a.parentid = p.idLab;
                                    } else {
                                        console.log("label not defined");
                                    }
                                } else {
                                    console.log("a is undefined");
                                }
                            }

                        }
                    }
                }
            }

        } else {
            this.treeUpdateData({});
        }

    }
    treeUpdateData(event) {
        if (this.analysisService.startSearchSubject.getValue() === true) {
            this.dialogsService.stopAllSpinnerDialogs();
            this.analysisService.startSearchSubject.next(false);
            this.changeDetectorRef.detectChanges();
        }
    }

    /*
        Determine if the object is an array
        @param what
     */
    isArray(what) {
        return Object.prototype.toString.call(what) === "[object Array]";
    }

    detailFn(): (keywords: string) => void {
        return (keywords) => {
            window.location.href = "http://localhost/gnomex/analysis/" + keywords;
        };
    }

    /**
     * The delete link was selected.
     * @param event
     */
    deleteAnalysisClicked(event: any) {
        if (this.selectedItem && this.selectedItem.level !== 1 && this.items.length > 0) {
            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = "35em";
            configuration.panelClass = "no-padding-dialog";
            configuration.autoFocus = false;
            configuration.disableClose = true;

            configuration.data = {
                idAnalysisGroup:    this.selectedItem.data.idAnalysisGroup,
                label:              this.selectedItem.data.label,
                selectedItem:       this.selectedItem,
                nodes:              this.treeModel.activeNodes
            };

            this.dialogsService.genericDialogContainer(DeleteAnalysisComponent, "Warning: Delete Analysis", this.constService.ICON_EXCLAMATION, configuration, {actions: [
                    {type: ActionType.PRIMARY, icon: null, name: "Yes" , internalAction: "deleteAnalysis", externalAction: () => { console.log("hello"); }},
                    {type: ActionType.SECONDARY,  name: "No", internalAction: "cancel"}
                ]}).subscribe((data: any) => {
                    if(data) {
                        if(this.parentProject) {
                            this.analysisService.setActiveNodeId = this.parentProject.data.id;
                        }
                    }
            });
        }
    }

    /**
     * The New Analysis button was clicked.
     * @param event
     */
    createAnalysisClicked(event: any) {
        if (this.items.length > 0 ) {
            this.labListString = this.labList.map(function (item) {
                return item["name"];
            });
            let useThisLabList: any[];
            let useItems: any = [];
            if (this.createSecurityAdvisorService.isSuperAdmin) {
                useThisLabList = this.labList;
            } else {
                useThisLabList = this.labs;
                useItems = this.items;
            }

            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = "40em";
            configuration.panelClass = "no-padding-dialog";
            configuration.autoFocus = false;
            configuration.disableClose = true;
            configuration.data = {
                labList: useThisLabList,
                items: useItems,
                selectedLab: this.selectedIdLab,
                selectedAnalysisGroup: this.selectedIdAnalysisGroup,
                parentComponent: "Analysis",
            };

            this.dialogsService.genericDialogContainer(CreateAnalysisComponent, "Create Analysis", null, configuration, {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save" , internalAction: "createAnalysisYesButtonClicked", externalAction: () => { console.log("hello"); }},
                    {type: ActionType.SECONDARY,  name: "Cancel", internalAction: "cancel"}
                ]});
        }
    }

    /**
     * The New analysis group button was selected.
     * @param event
     */
    createAnalysisGroupClicked(event: any) {
        if (this.items.length > 0 ) {
            this.labListString = this.labList.map(function (item) {
                return item["name"];
            });
            var useThisLabList: any[];
            if (this.createSecurityAdvisorService.isSuperAdmin) {
                useThisLabList = this.labList;
            } else {
                useThisLabList = this.labs;
            }

            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = "40em";
            configuration.data = {
                labList: useThisLabList,
                selectedLab: this.selectedIdLab,
            };

            this.dialogsService.genericDialogContainer(CreateAnalysisGroupComponent, "Create Analysis Group", null, configuration, {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save" , internalAction: "createAnalysisGroup", externalAction: () => { console.log("hello"); }},
                    {type: ActionType.SECONDARY,  name: "Cancel", internalAction: "cancel"}
                ]}).subscribe(data => {
                    if(data) {
                        this.analysisService.setActiveNodeId = "p" + data;
                    }
                });
        }
    }

    dragDropHintClicked(event: any) {
        this.dialogsService.alert("Drag-and-drop to move analyses to another lab and/or group. Hold Ctrl while dragging-and-dropping to assign to multiple groups");
    }

    treeOnSelect(event: any) {
        // If selecting multiple analyses (for dragging-and-dropping, for example)
        // improve performance by reducing unnecessary loading
        if (this.treeModel.getActiveNodes().length > 1) {
            return;
        }

        this.selectedItem = event.node;
        this.selectedIdLab = this.selectedItem.data.idLab;
        let idAnalysis = this.selectedItem.data.idAnalysis;
        let idAnalysisGroup = this.selectedItem.data.idAnalysisGroup;
        let idLab = this.selectedItem.data.idLab;


        let analysisGroupListNode: Array<any> = _.cloneDeep(this.selectedItem.data);
        this.analysisService.emitAnalysisOverviewList(analysisGroupListNode);
        let navArray: Array<any> = [];


        //Lab
        if (this.selectedItem.level === 1) {
            this.analysisService.selectedNodeId = event.node.data.id;
            this.disableNewAnalysis = false;
            this.disableNewAnalysisGroup = false;
            this.disableDelete = true;
            navArray = ["/analysis", {outlets: {"analysisPanel": "overview"}}];


            //AnalysisGroup
        } else if (this.selectedItem.level === 2) {
            this.parentProject = event.node.parent;
            this.analysisService.selectedNodeId = event.node.data.id;
            this.selectedIdAnalysisGroup = this.selectedItem.data.idAnalysisGroup;
            this.disableNewAnalysis = false;
            this.disableDelete = false;
            this.disableNewAnalysisGroup = false;
            navArray = ["/analysis", {outlets: {"analysisPanel": ["overview", {"idAnalysisGroup": idAnalysisGroup, "idLab": idLab}]}}];


            //Analysis
        } else if (this.selectedItem.level === 3) {
            navArray = ["/analysis", {outlets: {"analysisPanel": [idAnalysis]}}];
            this.parentProject = event.node.parent;
            this.selectedIdAnalysisGroup = this.parentProject.data.idAnalysisGroup;
            this.disableNewAnalysis = false;
            this.disableDelete = false;
            this.disableNewAnalysisGroup = false;
        }

        this.router.navigate(navArray);

    }

    ngOnDestroy(): void {
        this.utilService.removeChangeDetectorRef(this.changeDetectorRef);
        this.analysisGroupListSubscription.unsubscribe();
        this.navAnalysisGroupListSubscription.unsubscribe();
        this.navEndSubscription.unsubscribe();
        this.gnomexService.navInitBrowseAnalysisSubject.next(null);
        this.labListSubscription.unsubscribe();
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
                        for (let analysisGroup of lab.children) {
                            if(id.substr(0, 1) === "p") {
                                if (analysisGroup.data.id === id) {
                                    return analysisGroup;
                                }
                            } else if (id.substr(0, 1) === "a") {
                                if (analysisGroup.hasChildren) {
                                    for (let analysis of analysisGroup.children) {
                                        if (analysis.data.id === id) {
                                            return analysis;
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

    private moveNode: (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => void = (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => {
        let idLab: string = node.data.idLab;
        let idAnalysisGroup: string = node.data.idAnalysisGroup;
        let analyses: any[] = [];
        for (let n of tree.getActiveNodes()) {
            analyses.push(n.data);
        }
        let isCopyMode: boolean = $event.ctrlKey;

        this.analysisService.moveAnalysis(idLab, idAnalysisGroup, analyses, isCopyMode).subscribe((result: any) => {
            if (result && result.result === "SUCCESS") {
                this.analysisService.refreshAnalysisGroupList_fromBackend();
                if (result.invalidPermission) {
                    this.dialogsService.alert(result.invalidPermission, "Warning");
                }
            }
        }, (err: IGnomexErrorResponse) => {
        });
    }
}
