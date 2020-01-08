import {
    AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild
} from "@angular/core";

import {
    IActionMapping,
    ITreeOptions,
    TREE_ACTIONS,
    TreeComponent,
    TreeModel,
    TreeNode,
} from "angular-tree-component";
import {Subscription} from "rxjs";
import {ActivatedRoute, NavigationExtras, ParamMap, Router, UrlSegment} from "@angular/router";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {LabListService} from "../services/lab-list.service";
import {DataTrackService} from "../services/data-track.service";
import {MoveDataTrackComponent} from "./move-datatrack.component";
import {MatDialogConfig} from "@angular/material";
import * as _ from "lodash";
import {GnomexService} from "../services/gnomex.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {UtilService} from "../services/util.service";
import {HttpParams} from "@angular/common/http";
import {NavigationService} from "../services/navigation.service";


@Component({
    selector: "datatracks",
    templateUrl: "./browse-datatracks.component.html",
    styles: [`

        .short-width { width: 10em; }

        .padded { padding: 0.3em; }

        .left-right-padded {
            padding-left:  0.3em;
            padding-right: 0.3em;
        }
        .major-left-right-padded {
            padding-left:  1em;
            padding-right: 1em;
        }

        .vertical-spacer {
            height: 0.3em;
            min-height: 0.3em;
        }

        .foreground { background-color: white;   }
        .background { background-color: #EEEEEE; }

        .border { border: #C8C8C8 solid thin; }

        .major-border {
            border-radius: 0.3em;
            border: 1px solid darkgrey;
        }

        .small-font      { font-size: small; }

        .no-overflow { overflow: hidden; }

        .no-word-wrap { white-space: nowrap; }

    `]
})

export class BrowseDatatracksComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild("datatracksTree") treeComponent: TreeComponent;
    @Output() selItem: EventEmitter<ITreeNode> = new EventEmitter();
    private treeModel: TreeModel;
    private navInitSubscription: Subscription;

    public options: ITreeOptions;
    public items: any;
    public organisms: any;

    public labMembers: any;
    private billingAccounts: any;
    public selectedItem: ITreeNode;
    public allActiveNodes: ITreeNode[] = [];
    public datatracksCount: number = 0;
    private dataTracksListSubscription: Subscription;
    private labList: any[] = [];
    public disabled: boolean = true;
    public disableDelete: boolean = true;
    public searchText: string;
    private navDatatrackList: any;
    private labListSubscription: Subscription;
    private qParamMap: ParamMap;
    private paramMap: ParamMap;

    constructor(private datatracksService: DataTrackService,
                private dialogsService: DialogsService,
                private router: Router,
                private route: ActivatedRoute,
                private labListService: LabListService,
                private gnomexService: GnomexService,
                private changeDetectorRef: ChangeDetectorRef,
                private utilService: UtilService,
                private navService: NavigationService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService) {

        this.navService.navMode = this.navService.navMode !== NavigationService.USER ? NavigationService.URL : NavigationService.USER;
        let activatedRoute = this.navService.getChildActivateRoute(this.route);
        if(activatedRoute){
            activatedRoute.queryParamMap.subscribe((qParam)=>{this.qParamMap = qParam });
            activatedRoute.paramMap.subscribe((param)=>{ this.paramMap = param });
        }

        this.items = [];
        this.labMembers = [];
        this.billingAccounts = [];
        this.organisms = [];

        this.dataTracksListSubscription = this.datatracksService.getDatatracksListObservable().subscribe(response => {
            this.buildTree(response);

            if(this.datatracksService.previousURLParams && this.datatracksService.previousURLParams["refreshParams"] ){ // this code occurs when searching
                this.datatracksService.previousURLParams["refreshParams"] = false;
                this.datatracksService.datatrackListTreeNode = response;

            }


            setTimeout(_ => {
                //this.treeModel.expandAll();
                if(this.navService.navMode === NavigationService.URL) { // this is if component is being navigated to by url
                    let idVal: string = null;
                    let idName: string = null;
                    let lastSeg: string  = this.navService.getLastRouteSegment();

                    if(lastSeg === DataTrackService.ORGANISM){
                        idName = "idOrganism";
                        idVal = this.qParamMap.get(idName);
                    }else if(lastSeg === DataTrackService.GENOME_BUILD){
                        idName = "idGenomeBuild";
                        idVal = this.qParamMap.get(idName);
                    }else if(lastSeg === DataTrackService.FOLDER){
                        idName = "idDataTrackFolder";
                        idVal = this.qParamMap.get(idName);
                    }else if(lastSeg === DataTrackService.DATA_TRACK){
                        idName = "idDataTrack";
                        idVal = this.paramMap.get(idName);
                    }else{
                        return;
                    }


                    if (this.treeModel && idVal) {
                        let dtNode: ITreeNode = UtilService.findTreeNode(this.treeModel, idName, idVal);
                        if (dtNode) {
                            dtNode.ensureVisible();
                            dtNode.setIsActive(true);
                            dtNode.scrollIntoView();
                        }
                    }
                } else if(this.datatracksService.activeNodeToSelect) {
                    let attribute = this.datatracksService.activeNodeToSelect.attribute;
                    let value = this.datatracksService.activeNodeToSelect.value;
                    let node: ITreeNode = UtilService.findTreeNode(this.treeModel, attribute, value);
                    if (node) {
                        node.ensureVisible();
                        node.setIsActive(true);
                        node.scrollIntoView();
                    }
                    this.datatracksService.activeNodeToSelect = null;
                }
            });

        });

    }


    ngOnInit() {

        this.options = {
            displayField: "label",
            childrenField: "items",
            nodeClass: (node: TreeNode) => {
                return "icon-" + node.data.icon;
            },
            allowDrop: (element: ITreeNode, to: {parent: ITreeNode, index: number}) => {
                return to.parent.data.isDataTrackFolder && element.data.idDataTrackFolder !== to.parent.data.idDataTrackFolder;
            },
            allowDrag: (node) => !this.createSecurityAdvisorService.isGuest && (node.data.isDataTrackFolder || node.data.idDataTrack),
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
        this.utilService.registerChangeDetectorRef(this.changeDetectorRef);
        this.treeModel = this.treeComponent.treeModel;

        this.labListService.getLabList_FromBackEnd();
        this.labListSubscription = this.labListService.getLabListSubject().subscribe((response: any[]) => {
            this.labList = response;
        });
    }

    ngAfterViewInit() {
    }



    private moveNode: (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => void = (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => {
        let currentItem: any = from.data;
        let targetItem: any = node.data;

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "35em";
        configuration.height = "15em";
        configuration.data = {
            currentItem: currentItem,
            targetItem: targetItem,
        };

        let title: string = "Move/Copy to " + UtilService.getSubStr(targetItem.label, 30);

        this.dialogsService.genericDialogContainer(MoveDataTrackComponent, title, currentItem.icon, configuration).subscribe((result) => {
            if (result) {
                if (currentItem.isDataTrack && currentItem.idDataTrack) {
                    this.datatracksService.activeNodeToSelect = {
                        attribute: "idDataTrack",
                        value: currentItem.idDataTrack
                    };
                } else if (currentItem.isDataTrackFolder && currentItem.idDataTrackFolder) {
                    this.datatracksService.activeNodeToSelect = {
                        attribute: "idDataTrackFolder",
                        value: currentItem.idDataTrackFolder
                    };
                }
                this.datatracksService.refreshDatatracksList_fromBackend();
            }
        });
    };

    go(event: any) {
    }

    treeChangeFilter(event) {
    }

    treeUpdateData(event) {
    }

    search() {
        if (this.searchText) {
            this.treeModel.filterNodes((node) => this.searchFn(node), true);
        } else {
            this.treeModel.clearFilter();
        }
    }

    searchFn(node: any): boolean {
        if (node) {
            if (!this.searchText) {
                return true;
            } else if (node.data.label.indexOf(this.searchText) >= 0 ||
                node.data.description && node.data.description.indexOf(this.searchText) >= 0) {
                return true;
            } else {
                return false;
            }
        }
    }

    /*
    Build the tree data
    @param
     */
    buildTree(response: any[]) {
        this.dialogsService.addSpinnerWorkItem();
        this.datatracksCount = 0;
        if (response) {
            this.organisms = [];
            this.items = [].concat(null);
            if (!this.isArray(response)) {
                this.items = [response];
            } else {
                this.items = response;
            }
            this.organisms = this.organisms.concat(this.items);
            for (let org of this.items) {
                org.isOrganism = true;

                org.icon = "assets/organism.png";
                if (org.GenomeBuild) {
                    if (!this.isArray(org.GenomeBuild)) {
                        org.items = [org.GenomeBuild];
                    } else {
                        org.items = org.GenomeBuild;
                    }

                    for (let gNomeBuild of org.items) {
                        if (gNomeBuild) {
                            this.assignIconToGenomeBuild(gNomeBuild);
                            gNomeBuild.labId = org.labId;
                            if (gNomeBuild.DataTrack) {
                                if (!this.isArray(gNomeBuild.DataTrack)) {
                                    gNomeBuild.items = [gNomeBuild.DataTrack];
                                } else {
                                    gNomeBuild.items = gNomeBuild.DataTrack;
                                }
                                for (let dataTrack of gNomeBuild.items) {
                                    if (dataTrack) {
                                        if (dataTrack.label) {
                                            this.assignIconToDT(dataTrack);
                                        } else {
                                            console.log("label not defined");
                                        }
                                    } else {
                                        console.log("a is undefined");
                                    }
                                }
                            }
                            if (gNomeBuild.DataTrackFolder) {
                                this.addDataTracksFromFolder(gNomeBuild, gNomeBuild.items);
                            }
                        }
                    }
                }
            }
        }
        this.dialogsService.removeSpinnerWorkItem();
        if(this.treeModel){
            this.treeModel.clearFilter();
        }
    };

    addDataTracksFromFolder(root, items: any[]): any[] {
        let dtItems: any[] = [];
        if (!this.isArray(root.DataTrackFolder)) {
            root.DataTrackFolder = [root.DataTrackFolder];
        }
        if (!items) {
            items = [];
        }

        if (!this.isArray(items)) {
            items = [items];
        }
        for (let dtf of root.DataTrackFolder) {
            this.assignIconToDTFolder(dtf);
        }
        dtItems = dtItems.concat(root.DataTrackFolder);
        dtItems = dtItems.concat(items);
        root.items = dtItems;

        for (let dtf of root.items) {

            if (dtf.DataTrackFolder) {
                this.assignIconToDTFolder(dtf);
                this.addDataTracksFromFolder(dtf, dtf.DataTracks);
            }
            if (dtf.DataTrack) {
                if (!this.isArray(dtf.DataTrack)) {
                    dtf.DataTrack = [dtf.DataTrack];
                }
                for (let dt of dtf.DataTrack) {
                    this.assignIconToDT(dt);
                }
                if (dtf.items) {
                    dtf.items = dtf.items.concat(dtf.DataTrack);
                } else {
                    dtf.items = dtf.DataTrack;
                }
            }

        }

        return root;
    }

    assignIconToGenomeBuild(genomeBuild: any): void {
        if (genomeBuild.DataTrack || genomeBuild.DataTrackFolder) {
            genomeBuild.icon = "assets/genome_build.png";
        } else {
            genomeBuild.icon = "assets/genome_build_faded.png"
        }
        genomeBuild.isGenomeBuild = true;
    }

    assignIconToDTFolder(dtf: any): void {
        if (dtf.idLab) {
            dtf.icon = "assets/folder_group.png";
        } else {
            dtf.icon = "assets/folder.png";
        }
        dtf.isDataTrackFolder = true;
    }

    assignIconToDT(datatrack: any) {
        switch(datatrack.codeVisibility) {
            case 'MEM': {
                datatrack.icon = "assets/datatrack_member.png";
                break;
            }
            case 'OWNER': {
                datatrack.icon = "assets/datatrack_owner.png";
                break;
            }
            default: {
                datatrack.icon = "assets/datatrack_world.png";
                break;
            }
        }
        this.datatracksCount++;

        datatrack.isDataTrack = true;
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
     * A node is selected in the tree.
     * @param event
     */
    treeOnSelect(event: any) {
        this.selectedItem = event.node;
        this.allActiveNodes = this.treeModel.getActiveNodes();
        this.selItem.emit(this.selectedItem);

        let datatrackListNode =  _.cloneDeep(this.selectedItem.data);
        this.datatracksService.datatrackListTreeNode = datatrackListNode;

        let navArray:Array<any> = [];
        let navExtras: NavigationExtras = {};
        let idObjList =[{'idOrganism':null},{'idGenomeBuild':null}, {'idDataTrackFolder': null}, {'idDataTrack': null}];

        idObjList =  this.navService.setValueGoingUpTree(idObjList, event.node);
        let idOrganism = idObjList[0]['idOrganism'];
        let idGenomeBuild = idObjList[1]['idGenomeBuild'];
        let idDataTrackFolder = idObjList[2]['idDataTrackFolder'];
        let idDataTrack = idObjList[3]['idDataTrack'];
        navExtras = {
            queryParams: {
                'idGenomeBuild': idGenomeBuild,
                'idOrganism' : idOrganism,
                'idDataTrackFolder': idDataTrackFolder,
                'idDataTrack': idDataTrack
            }};


        if(this.navService.navMode === NavigationService.USER){
            if(datatrackListNode.isGenomeBuild){
                datatrackListNode["treeNodeType"] = "GenomeBuild";
                this.disableDelete = false;
                navArray = ['/datatracks', 'genomebuild'];
                //['/datatracks', {outlets:{'datatracksPanel':['genomeBuild',{'idGenomeBuild':idGenomeBuild}]}}];

            }else if (datatrackListNode.isDataTrackFolder){
                datatrackListNode["treeNodeType"] = "Folder";
                navArray = ['/datatracks', 'folder'];
                //['/datatracks', {outlets:{'datatracksPanel':['folder',{'idDataTrackFolder': idDataTrackFolder}]}}];
                this.disableDelete = false;
            }else if (this.selectedItem.isRoot){
                datatrackListNode["treeNodeType"] = "Organism";
                this.disableDelete = true;
                navArray =['/datatracks', 'organism'];
                //['/datatracks', {outlets:{'datatracksPanel':['organism',{'idOrganism':idOrganism}]}}];
            }
            else { // isLeaf
                //idDataTrack
                datatrackListNode["treeNodeType"] = "Datatrack";

                this.disableDelete = false;
                navArray = ['/datatracks','detail', idDataTrack];
                navExtras = {
                    queryParams: {
                        "idOrganism":idOrganism,
                        "idGenomeBuild":idGenomeBuild,
                        "idDataTrackFolder": idDataTrackFolder
                    }};
            }

            navExtras.relativeTo = this.route;
            navExtras.queryParamsHandling = 'merge';
            this.router.navigate(navArray,navExtras);
        }else{
            this.navService.emitResetNavModeSubject("organism");
            this.navService.emitResetNavModeSubject("genomebuild");
            this.navService.emitResetNavModeSubject("folder");
            this.navService.emitResetNavModeSubject("detail");
            this.dialogsService.removeSpinnerWorkItem();

        }





    }

    public onDataTrackFolderCreated(idDataTrackFolder: string): void {
        if (idDataTrackFolder) {
            this.datatracksService.activeNodeToSelect = {
                attribute: "idDataTrackFolder",
                value: idDataTrackFolder
            };
            this.datatracksService.refreshDatatracksList_fromBackend();
        }
    }

    public onDataTrackCreated(idDataTrack: string): void {
        if (idDataTrack) {
            this.datatracksService.activeNodeToSelect = {
                attribute: "idDataTrack",
                value: idDataTrack
            };
            this.datatracksService.refreshDatatracksList_fromBackend();
        }
    }

    expandClicked() {
        if (this.selectedItem) {
            this.selectedItem.expandAll();
        }
    }

    collapseClicked() {
        if (this.selectedItem) {
            this.selectedItem.collapseAll();
        }
    }

    ngOnDestroy(): void {
        this.utilService.removeChangeDetectorRef(this.changeDetectorRef);
        this.dataTracksListSubscription.unsubscribe();
        this.labListSubscription.unsubscribe();
        this.navDatatrackList = null;
    }
}
