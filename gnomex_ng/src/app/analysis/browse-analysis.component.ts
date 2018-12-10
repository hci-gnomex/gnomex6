/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {
    AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,
    ViewEncapsulation
} from "@angular/core";

import { URLSearchParams } from "@angular/http";

import {
    TreeComponent, ITreeOptions, TreeNode, TreeModel, IActionMapping,
    TREE_ACTIONS
} from "angular-tree-component";
import * as _ from "lodash";
import {Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {AnalysisService} from "../services/analysis.service";
import {MatDialogRef, MatDialog, MatDialogConfig} from '@angular/material';
import {DeleteAnalysisComponent} from "./delete-analysis.component";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DragDropHintComponent} from "./drag-drop-hint.component";
import {LabListService} from "../services/lab-list.service";
import {CreateAnalysisComponent} from "./create-analysis.component";
import {CreateAnalysisGroupComponent} from "./create-analysis-group.component";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {GnomexService} from "../services/gnomex.service";
import {DialogsService} from "../util/popup/dialogs.service";

const actionMapping:IActionMapping = {
    mouse: {
        click: (tree, node, $event) => {
            $event.ctrlKey
                ? TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event)
                : TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event)
        }
    }
};

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
        
    `]
})

export class BrowseAnalysisComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild("analysisTree") treeComponent: TreeComponent;

    private treeModel: TreeModel;
    /*
    angular2-tree options
     */
    public options: ITreeOptions = {
        displayField: "label",
        childrenField: "items",
        useVirtualScroll: true,
        nodeHeight: 22,
        nodeClass: (node: TreeNode) => {
            return "icon-" + node.data.icon;
        },
        allowDrop: (element, item: {parent: any, index}) => {
            this.dragEndItems = _.cloneDeep(this.items);
            if (item.parent.data.parentid === -1 || item.parent.data.idAnalysis ||
                element.data.idAnalysisGroup) {
                return false;
            } else {
                return true;
            }
        },

        allowDrag: (node: any) => node.isLeaf,
        actionMapping
    };

    public items: any;
    public labs: any;
    public currentItem: any;
    public targetItem: any;

    public labMembers: any;
    private billingAccounts: any;
    private dragEndItems: any;
    private selectedItem: ITreeNode;

    public analysisCount: number = 0;
    private analysisGroupListSubscription: Subscription;
    public deleteAnalysisDialogRef: MatDialogRef<DeleteAnalysisComponent>;
    private labList: any[] = [];
    private labListString: any[] = [];
    private selectedIdLab;
    public disabled: boolean = true;
    public disableNewAnalysis: boolean = true;
    public disableDelete: boolean = true;
    public disableNewAnalysisGroup: boolean = true;
    public disableAll: boolean = false;
    private selectedLabLabel: string;
    public createAnalysisDialogRef: MatDialogRef<CreateAnalysisComponent>;
    public createAnalysisGroupDialogRef: MatDialogRef<CreateAnalysisGroupComponent>;
    private parentProject: any;
    // public showSpinner: boolean = false;
    public newAnalysisName: any;
    private navAnalysisGroupListSubscription:Subscription;

    ngOnInit() {
        this.treeModel = this.treeComponent.treeModel;
        this.labListService.getLabList().subscribe((response: any[]) => {
            this.labList = response;
        });

        if (this.createSecurityAdvisorService.isGuest) {
            this.disableAll = true;
        }

        this.analysisGroupListSubscription = this.analysisService.getAnalysisGroupListObservable().subscribe(response => {
            this.items = [].concat([]);
            this.buildTree(response);
            if (this.createAnalysisDialogRef != undefined && this.createAnalysisDialogRef.componentInstance != undefined) {
                if (this.createAnalysisDialogRef.componentInstance.showSpinner) {
                    this.createAnalysisDialogRef.componentInstance.showSpinner = false;
                }
                this.newAnalysisName = this.createAnalysisDialogRef.componentInstance.newAnalysisName;
                this.createAnalysisDialogRef.close();
            }
            if (this.deleteAnalysisDialogRef != undefined && this.deleteAnalysisDialogRef.componentInstance != undefined) {
                if (this.deleteAnalysisDialogRef.componentInstance.showSpinner != undefined) {
                    this.deleteAnalysisDialogRef.componentInstance.showSpinner = false;
                    if (this.parentProject) {
                        this.parentProject.collapseAll();
                    }
                }
                this.deleteAnalysisDialogRef.close();
            }
            if (this.createAnalysisGroupDialogRef != undefined && this.createAnalysisGroupDialogRef.componentInstance != undefined) {
                if (this.createAnalysisGroupDialogRef.componentInstance.showSpinner != undefined) {
                    this.createAnalysisGroupDialogRef.componentInstance.showSpinner = false;
                }
                this.createAnalysisGroupDialogRef.close();
            }

            this.analysisService.emitAnalysisOverviewList(response);
            if( this.analysisService.analysisPanelParams && this.analysisService.analysisPanelParams["refreshParams"]){ // if user is searching

                let navArray: any[] = ['/analysis',{outlets:{'analysisPanel':'overview'}}];
                this.router.navigate(navArray);
                this.analysisService.analysisPanelParams["refreshParams"] = false;
            }


            setTimeout(() => {
                this.treeModel.expandAll();
                if(this.gnomexService.orderInitObj){ // this is if component is being navigated to by url
                    let id:string = "a" + this.gnomexService.orderInitObj.idAnalysis;
                    if(this.treeModel && id) {
                        let node = this.treeModel.getNodeById(id);
                        if(node){
                            node.setIsActive(true);
                            node.scrollIntoView();
                            this.gnomexService.orderInitObj = null;
                        }
                    }
                }
                else if (this.newAnalysisName) {
                    this.selectNode(this.treeModel.getFirstRoot().children);
                }
            })
        });

        this.navAnalysisGroupListSubscription = this.gnomexService.navInitBrowseAnalysisSubject.subscribe( orderInitObj => {
            if(orderInitObj){
                let ids: URLSearchParams = new URLSearchParams;
                let idLab = this.gnomexService.orderInitObj.idLab;
                let idAnalysisGroup = this.gnomexService.orderInitObj.idAnalysisGroup;

                ids.set('idLab', idLab);
                ids.set("searchPublicProjects", "Y");
                ids.set("showCategory", "N");
                ids.set("idAnalysisGroup", idAnalysisGroup);
                ids.set("showSamples", "N");

                this.analysisService.analysisPanelParams = ids;
                this.analysisService.getAnalysisGroupList_fromBackend(ids);
            }
        });

    }

    ngAfterViewInit() {
    }

    selectNode(nodes: any) {
        for (let node of nodes) {
            if (node.data.name === this.newAnalysisName && node.data.idAnalysis) {
                node.setActiveAndVisible(false);
                break;
            } else if (node.hasChildren) {
                this.selectNode(node.children)

            }

        }
        this.newAnalysisName = "";
    }

    constructor(private analysisService: AnalysisService, private router: Router,
                private dialog: MatDialog,
                private dialogsService: DialogsService,
                private route: ActivatedRoute,
                private gnomexService:GnomexService,
                private labListService: LabListService,
                private changeDetectorRef: ChangeDetectorRef,
                private createSecurityAdvisorService: CreateSecurityAdvisorService) {


        this.items = [];
        this.dragEndItems = [];
        this.labMembers = [];
        this.billingAccounts = [];
        this.labs = [];

        this.analysisService.startSearchSubject.subscribe((value) =>{
            if (value) {
                // this.showSpinner = true;
                setTimeout(() => {
                    this.dialogsService.startDefaultSpinnerDialog();
                });
            }
        })

    }

    go(event: any) {
    }

    /*
    Build the tree data
    @param
     */
    buildTree(response: any[]) {
        this.analysisCount = 0;
        this.labs = [];
        this.items = [].concat(null);

        if(response){
            if (!this.isArray(response)) {
                this.items = [response];
            } else {
                this.items = response;
            }

            this.labs = this.labs.concat(this.items);
            this.analysisService.emitCreateAnalysisDataSubject({labs:this.labs,items:this.items});
            for (var l of this.items) {
                l.id = "l"+l.idLab;
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
                        p.id = "p"+p.idAnalysisGroup;
                        if (p.Analysis) {
                            if (!this.isArray(p.Analysis)) {
                                p.items = [p.Analysis];
                            } else {
                                p.items = p.Analysis;
                            }
                            for (var a of p.items) {
                                if (a) {
                                    if (a.label) {
                                        this.analysisCount++;
                                        var labelString: string = a.number;
                                        labelString = labelString.concat(" (");
                                        labelString = labelString.concat(a.label);
                                        labelString = labelString.concat(")");
                                        a.label = labelString;
                                        a.id = "a"+a.idAnalysis;
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

        }else{
            this.treeUpdateData({});
        }

    };

    treeUpdateData(event) {
        if (this.analysisService.startSearchSubject.getValue() === true) {
            this.dialogsService.stopAllSpinnerDialogs();
            // this.showSpinner = false;
            this.analysisService.startSearchSubject.next(false);
            this.changeDetectorRef.detectChanges();
        }
    }


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
        this.doMove($event);
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
            window.location.href = "http://localhost/gnomex/analysis/" + keywords;
        };
    }

    /**
     * Perform the move
     * @param event
     */
    doMove(event: any) {

        var params: URLSearchParams = new URLSearchParams();
        params.set("idLab", event.to.parent.idLab);
        var analysisGroupXMLString: string = "";
        var idAnalysisString = event.node.idAnalysis;
        var analysisGroup = event.to.parent;
        delete event.to.parent.items;
        // Tree doesnt support multiple drag/drop. It actually woould work, just no visual indication.
        // for (let n of event.treeModel.activeNodes) {
        //     idAnalysisString = idAnalysisString.concat(n.data.idAnalysis);
        //     idAnalysisString = idAnalysisString.concat(",");
        // }
        analysisGroupXMLString = JSON.stringify(analysisGroup);

        params.set("analysisGroupsXMLString", analysisGroupXMLString);
        params.set("idAnalysisString", idAnalysisString);
        var lPromise = this.analysisService.moveAnalysis(params).toPromise();
        lPromise.then(response => {
            console.log("successful move");
            this.analysisService.refreshAnalysisGroupList_fromBackend();
        });
    }

    /**
     * The delete link was selected.
     * @param event
     */
    deleteAnalysisClicked(event: any) {
        if (this.selectedItem && this.selectedItem.level != 1 && this.items.length > 0) {
            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.height = '375px';
            configuration.width  = '300px';

            configuration.data = {
                idAnalysisGroup:    this.selectedItem.data.idAnalysisGroup,
                label:              this.selectedItem.data.label,
                selectedItem:       this.selectedItem,
                nodes:              this.treeModel.activeNodes
            };

            this.deleteAnalysisDialogRef = this.dialog.open(DeleteAnalysisComponent, configuration);
        }
        this.selectedItem = null;
    }

    /**
     * The New Analysis button was clicked.
     * @param event
     */
    createAnalysisClicked(event: any) {
        if (this.items.length > 0 ) {
            this.labListString = this.labList.map(function (item) {
                return item['name'];
            });
            var useThisLabList: any[];
            if (this.createSecurityAdvisorService.isSuperAdmin) {
                useThisLabList = this.labList;
            } else {
                useThisLabList = this.labs;
            }

            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.data = {
                labList:            useThisLabList,
                items:              this.items,
                selectedLab:        this.selectedIdLab,
                selectedLabLabel:   this.selectedLabLabel,
                selectedItem:       this.selectedItem
            };

            this.createAnalysisDialogRef = this.dialog.open(CreateAnalysisComponent, configuration);
        }
    }

    /**
     * The New analysis group button was selected.
     * @param event
     */
    createAnalysisGroupClicked(event: any) {
        if (this.items.length > 0 ) {
            this.labListString = this.labList.map(function (item) {
                return item['name'];
            });
            var useThisLabList: any[];
            if (this.createSecurityAdvisorService.isSuperAdmin) {
                useThisLabList = this.labList;
            } else {
                useThisLabList = this.labs;
            }

            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = '40em';
            configuration.data = { labList: useThisLabList };

            this.createAnalysisGroupDialogRef = this.dialog.open(CreateAnalysisGroupComponent, configuration);
        }
    }

    /**
     * Show the drag drop hint
     * @param event
     */
    dragDropHintClicked(event: any) {
        let configuration: MatDialogConfig = new MatDialogConfig();

        let dialogRef: MatDialogRef<DragDropHintComponent> = this.dialog.open(DragDropHintComponent, configuration);
    }

    /**
     * A node is selected in the tree.
     * @param event
     */
    treeOnSelect(event: any) {
        this.selectedItem = event.node;
        this.selectedIdLab = this.selectedItem.data.idLab;
        this.selectedLabLabel = this.selectedItem.data.labName;
        let idAnalysis = this.selectedItem.data.idAnalysis;
        let idAnalysisGroup = this.selectedItem.data.idAnalysisGroup;
        let idLab = this.selectedItem.data.idLab;


        let analysisGroupListNode:Array<any> = _.cloneDeep(this.selectedItem.data);
        let navArray: Array<any> = [];


        //Lab
        if (this.selectedItem.level === 1) {
            this.disableNewAnalysis = false;
            this.disableNewAnalysisGroup = false;
            this.disableDelete = true;
            navArray = ['/analysis',{outlets:{'analysisPanel':'overview'}}];


            //AnalysisGroup
        } else if (this.selectedItem.level === 2) {
            this.disableNewAnalysis = false;
            this.disableDelete = false;
            this.disableNewAnalysisGroup = false;
            navArray = ['/analysis', {outlets:{'analysisPanel':['overview',{'idAnalysisGroup':idAnalysisGroup,'idLab':idLab}]}}];




            //Analysis
        } else if (this.selectedItem.level === 3) {
            navArray = ['/analysis',{outlets:{'analysisPanel':[idAnalysis]}}];
            this.parentProject = event.node.parent;
            this.disableNewAnalysis = false;
            this.disableDelete = false;
            this.disableNewAnalysisGroup = false;
            var params: URLSearchParams = new URLSearchParams();
            params.set("idAnalysis", idAnalysis);
            this.analysisService.getAnalysis(params).subscribe((response) => {
                if (response.Analysis.canDelete ==="Y") {
                    this.disableDelete = false;
                } else {
                    this.disableDelete = true;
                }
            });
        }
        this.analysisService.emitAnalysisOverviewList(analysisGroupListNode);
        this.router.navigate(navArray);

    }

    ngOnDestroy(): void {
        this.analysisGroupListSubscription.unsubscribe();
        this.navAnalysisGroupListSubscription.unsubscribe();
        this.gnomexService.navInitBrowseAnalysisSubject.next(null);
    }
}
