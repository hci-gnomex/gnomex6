/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {
    AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild
} from "@angular/core";

import { jqxWindowComponent } from "jqwidgets-framework";
import { jqxButtonComponent } from "jqwidgets-framework";
import { jqxComboBoxComponent } from "jqwidgets-framework";
import { jqxNotificationComponent  } from "jqwidgets-framework";
import { jqxCheckBoxComponent } from "jqwidgets-framework";
import {
    TreeComponent, ITreeOptions, TreeNode, TreeModel, IActionMapping,
    TREE_ACTIONS
} from "angular-tree-component";
import {Subscription} from "rxjs/Subscription";
import {Router} from "@angular/router";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {LabListService} from "../services/lab-list.service";
import {DataTrackService} from "../services/data-track.service";

const actionMapping:IActionMapping = {
    mouse: {
        click: (tree, node, $event) => {
            $event.ctrlKey
                ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(tree, node, $event)
                : TREE_ACTIONS.TOGGLE_SELECTED(tree, node, $event)
        }
    }
};

@Component({
    selector: "datatracks",
    templateUrl: "./datatracks.component.html",
    styles: [`
        .inlineComboBox {
            display: inline-block;
        }

        .hintLink {
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
            position: relative;
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
            height: 6em;
            flex-grow: 8;
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
            width:75%;
            padding: 2em;
            margin-left: 2em;
            background-color: #0b97c4;
            border: #C8C8C8 solid thin;
            overflow: auto;
        }
    `]
})

export class BrowseDatatracksComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild("datatracksTree") treeComponent: TreeComponent;
    @ViewChild("labComboBox") labComboBox: jqxComboBoxComponent;
    @Output() selItem: EventEmitter<ITreeNode> = new EventEmitter();
    private treeModel: TreeModel;
    /*
    angular2-tree options
     */
    public options: ITreeOptions = {
        displayField: "label",
        childrenField: "items",
        nodeClass: (node: TreeNode) => {
            return "icon-" + node.data.icon;
        },
        allowDrop: (element, {parent, index}) => {
            //this.dragEndItems = _.cloneDeep(this.items);
            if (parent.data.parentid === -1) {
                return false;
            } else {
                return true;
            }
        },

        allowDrag: (node) => node.isLeaf,
        actionMapping
    };

    public items: any;
    public organisms: any;
    public currentItem: any;
    public targetItem: any;

    public labMembers: any;
    private billingAccounts: any;
    private dragEndItems: any;
    private selectedItem: ITreeNode;
    public datatracksCount: number;
    private dataTracksListSubscription: Subscription;
    private labList: any[] = [];
    public disabled: boolean = true;
    public disableDelete: boolean = true;
    public showSpinner: boolean = false;
    public searchText: string;

    ngOnInit() {
        this.treeModel = this.treeComponent.treeModel;
        this.labListService.getLabList().subscribe((response: any[]) => {
            this.labList = response;
        });
    }

    ngAfterViewInit() {
    }

    constructor(private datatracksService: DataTrackService, private router: Router,
                private labListService: LabListService,
                private changeDetectorRef: ChangeDetectorRef) {


        this.items = [];
        this.dragEndItems = [];
        this.labMembers = [];
        this.billingAccounts = [];
        this.organisms = [];


        this.dataTracksListSubscription = this.datatracksService.getDatatracksListObservable().subscribe(response => {
            this.buildTree(response);
        });
        this.datatracksService.startSearchSubject.subscribe((value) =>{
            if (value) {
                this.showSpinner = true;
            }
        })
    }

    go(event: any) {
    }

    treeChangeFilter(event) {
    }

    treeUpdateData(event) {
        if (this.datatracksService.startSearchSubject.getValue() === true) {
            this.showSpinner = false;
            this.datatracksService.startSearchSubject.next(false);
            this.changeDetectorRef.detectChanges();
        }
    }

    search() {
        this.treeModel.filterNodes((node) => this.searchFn(node), true);
    }

    searchFn(node: any): boolean {
        if (node) {
            if (node.data.label.indexOf(this.searchText) >= 0 ||
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
        if (response) {
            this.datatracksCount = 0;
            this.organisms = [];
            this.items = [].concat(null);
            if (!this.isArray(response)) {
                this.items = [response];
            } else {
                this.items = response;
            }
            this.organisms = this.organisms.concat(this.items);
            for (var o of this.items) {
                o.id = "o"+o.idOrganism;
                o.parentid = -1;

                o.icon = "assets/organism.png";
                if (o.GenomeBuild) {
                    if (!this.isArray(o.GenomeBuild)) {
                        o.items = [o.GenomeBuild];
                    } else {
                        o.items = o.GenomeBuild;
                    }

                    for (var g of o.items) {
                        if (g) {
                            this.assignIconToGenomeBuild(g);
                            g.labId = o.labId;
                            g.id = "g"+g.idGenomeBuild;
                            g.parentid = o.id;
                            if (g.DataTrack) {
                                if (!this.isArray(g.DataTrack)) {
                                    g.items = [g.DataTrack];
                                } else {
                                    g.items = g.DataTrack;
                                }
                                for (var d of g.items) {
                                    if (d) {
                                        if (d.label) {
                                            this.assignIconToDT(d);
                                            d.parentid = g.id;
                                        } else {
                                            console.log("label not defined");
                                        }
                                    } else {
                                        console.log("a is undefined");
                                    }
                                }
                            }
                            if (g.DataTrackFolder) {
                                this.addDataTracksFromFolder(g, g.items);
                            }
                        }
                    }
                }
            }
        }
        this.treeModel.clearFilter();
    };

    addDataTracksFromFolder(root, items: any[]): any[] {
        var dtItems: any[] = [];
        if (!this.isArray(root.DataTrackFolder)) {
            root.DataTrackFolder = [root.DataTrackFolder];
        }
        if (!items) {
            items = [];
        }

        if (!this.isArray(items)) {
            items = [items];
        }
        for (var dtf of root.DataTrackFolder) {
            this.assignIconToDTFolder(dtf);
        }
        dtItems = dtItems.concat(root.DataTrackFolder);
        dtItems = dtItems.concat(items);
        root.items = dtItems;

        for (var dtf of root.items) {

            if (dtf.DataTrackFolder) {
                this.assignIconToDTFolder(dtf);
                this.addDataTracksFromFolder(dtf, dtf.DataTracks);
            }
            if (dtf.DataTrack) {
                if (!this.isArray(dtf.DataTrack)) {
                    dtf.DataTrack = [dtf.DataTrack];
                }
                for (var dt of dtf.DataTrack) {
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
    }

    assignIconToDTFolder(dtf: any): void {
        dtf.id = "df"+dtf.idDataTrackFolder;
        dtf.icon = "assets/folder_group.png";
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
        datatrack.id = "d"+datatrack.idDataTrack;
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
        this.selItem.emit(this.selectedItem);

        //Lab
        if (this.selectedItem.level === 1) {
            this.disableDelete = true;
        } else if (this.selectedItem.level === 2) {
            this.disableDelete = false;

            //datatrack
        } else if (this.selectedItem.level === 3) {
            this.disableDelete = false;
        }
    }

    expandClicked() {
        this.selectedItem.expandAll();
    }

    collapseClicked() {
        this.selectedItem.collapseAll();
    }

    ngOnDestroy(): void {
        this.dataTracksListSubscription.unsubscribe();
    }
}
