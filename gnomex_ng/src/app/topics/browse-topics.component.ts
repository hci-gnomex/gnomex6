/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {
    AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,
    ViewEncapsulation
} from "@angular/core";

import { URLSearchParams } from "@angular/http";

import { jqxWindowComponent } from "jqwidgets-framework";
import { jqxButtonComponent } from "jqwidgets-framework";
import { jqxComboBoxComponent } from "jqwidgets-framework";
import { jqxNotificationComponent  } from "jqwidgets-framework";
import { jqxCheckBoxComponent } from "jqwidgets-framework";
import {
    TreeComponent, ITreeOptions, TreeNode, TreeModel, IActionMapping,
    TREE_ACTIONS
} from "angular-tree-component";
import * as _ from "lodash";
import {Subscription} from "rxjs/Subscription";
import {Router} from "@angular/router";
import {MatDialogRef, MatDialog} from '@angular/material';
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {TopicService} from "../services/topic.service";
import {GnomexService} from "../services/gnomex.service";
import {MoveTopicComponent} from "./move-topic.component";
import {DialogsService} from "../util/popup/dialogs.service";

const actionMapping:IActionMapping = {
    mouse: {
        click: (tree, node, $event) => {
            $event.ctrlKey
                ? TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event)
                : TREE_ACTIONS.TOGGLE_SELECTED(tree, node, $event)
        }
    }
};

@Component({
    selector: "analysis",
    templateUrl: "./browse-topics.component.html",
    styles: [`
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

        .br-topic-row-one {
            flex-grow: 1;
        }

        .br-topic-item-row-two {
            flex-grow: 1;
            position: relative;
        }

        .br-topic-item {
            width: 100%;
            flex: 1 1 auto;
            font-size: small;
        }

        .br-topic-one {
            width: 100%;
            flex-grow: .25;

        }

        .br-topic-help-drag-drop {
            width: 100%;
            flex-grow: .10;
        }

        .br-topic-three {
            width: 100%;
            height: 5px;
            flex-grow: 2;
        }

        .br-topic-four {
            width: 100%;
            flex-grow: .10;
        }

        .br-topic-five {
            width: 100%;            
            flex-grow: .10;
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
    `]
})

export class BrowseTopicsComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild("topicsTree") treeComponent: TreeComponent;

    public moveTopicDialogRef: MatDialogRef<MoveTopicComponent>;

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
        allowDrop: (element, {parent, index}) => {
            this.dragEndItems = _.cloneDeep(this.items);
            if (parent.data.parentid === -1) {
                return false;
            } else {
                return true;
            }
        },

        allowDrag: (node) => node.data.idDataTrack || node.data.idParentTopic,
        actionMapping
    };

    public items: any;
    public currentItem: any;
    public targetItem: any;

    private dragEndItems: any;
    private selectedItem: ITreeNode;

    private topicListSubscription: Subscription;

    ngOnInit() {
        this.treeModel = this.treeComponent.treeModel;
        this.topicService.getTopicList().subscribe(response => {
            this.items = [].concat([]);
            this.buildTree(response);
            setTimeout(_ => {
                this.treeModel.expandAll();
            });
            this.topicListSubscription = this.topicService.getTopicsListObservable().subscribe(response => {
                this.items = [].concat([]);
                setTimeout(() => {
                    this.buildTree(response);
                    this.treeModel.update();
                });
                setTimeout(_ => {
                    this.treeModel.expandAll();
                });
            });
        });
    }

    ngAfterViewInit() {
    }

    constructor(private topicService: TopicService, private router: Router,
                private dialog: MatDialog,
                private dialogService: DialogsService,
                private gnomexService: GnomexService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService) {


        this.items = [];
        this.dragEndItems = [];
    }

    resetTree() {
        this.items = this.dragEndItems;
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

    doMove(event) {
        if (this.currentItem.idTopic === this.targetItem.idTopic) {
            this.dialogService.confirm("Moving or Copying an item to the same topic is not allowed.'.", null);
        } else {
            this.moveTopicDialogRef = this.dialog.open(MoveTopicComponent, {
                height: '220px',
                width: '400px',
                data: {
                    currentItem: this.currentItem,
                    targetItem: this.targetItem
                }
            });
            this.moveTopicDialogRef.afterClosed()
                .subscribe(result => {
                    if (this.moveTopicDialogRef.componentInstance.noButton) {
                        this.resetTree();
                    }
                })
        }
    }


    /*
    Build the tree data
    @param
     */
    buildTree(response: any[]) {
        this.items = [].concat(null);
        if (!this.createSecurityAdvisorService.isArray(response)) {
            this.items = [response];
        } else {
            this.items = response;
        }

        for (var folder of this.items) {
            folder.id = "topic";
            folder.parentid = -1;
            folder.label = "Topics";

            folder.icon = "assets/folder.png";

            if (folder.Folder.Topic) {
                this.addTopic(folder, folder.Folder.Topic);
            }
        }
    };

    addTopic(root: any, items: any[]) {
        if (!this.createSecurityAdvisorService.isArray(items)) {
            root.items = [items];
        } else {
            root.items = items;
        }

        for (var topic of items) {
            let topicArray: any[] = [];
            if (topic.Topic) {
                if (!this.createSecurityAdvisorService.isArray(topic.Topic)) {
                    topicArray = [topic.Topic];
                } else {
                    topicArray = topic.Topic;
                }
                this.addTopic(topic, topicArray);
            }
            this.assignTreeIcon(topic);
            topic.id = "t"+topic.idTopic;
            if (topic.Category) {
                if (!this.createSecurityAdvisorService.isArray(topic.Category)) {
                    if (topic.items && topic.items.length > 0) {
                        topic.items = topic.items.concat([topic.Category]);
                    } else {
                        topic.items = [topic.Category];
                    }
                } else {
                    if (topic.items && topic.items.length > 0) {
                        topic.items = topic.items.concat(topic.Category);
                    } else {
                        topic.items = topic.Category;
                    }
                }
                for (var category of topic.items) {
                    if (category.Request || category.Analysis || category.DataTrack) {
                        category.idTopic = topic.idTopic;
                        if (category.Request) {
                            category.id = "r" + topic.idTopic;
                            if (!this.createSecurityAdvisorService.isArray(category.Request)) {
                                category.items = [category.Request];
                            } else {
                                category.items = category.Request;
                            }
                            for (var request of category.items) {
                                request.id = request.idRequest + category.id;
                                this.setLabel(request);
                            }
                        }
                        if (category.Analysis) {
                            category.id = "a" + topic.idTopic;
                            if (!this.createSecurityAdvisorService.isArray(category.Analysis)) {
                                category.items = [category.Analysis];
                            } else {
                                category.items = category.Analysis;
                            }
                            for (var analysis of category.items) {
                                analysis.icon = "assets/map.png";
                                analysis.id = analysis.idAnalysis + category.id;;
                                this.setLabel(analysis);
                            }

                        }
                        if (category.DataTrack) {
                            category.id = "s" + topic.idTopic;
                            if (!this.createSecurityAdvisorService.isArray(category.DataTrack)) {
                                category.items = [category.DataTrack];
                            } else {
                                category.items = category.DataTrack;
                            }
                            for (var datatrack of category.items) {
                                this.assignIconToDT(datatrack);
                                datatrack.id = datatrack.idDataTrack + category.id;;
                                this.setLabel(datatrack);
                            }

                        }
                    }
                }

            }
        }

    }

    setLabel(leaf: any) {
        let label: string = "";
        if (leaf.idRequest) {
            label = leaf.number;
            if (leaf.name) {
                label = label + ' - ' + leaf.name;
            }
            leaf.label = label;
        } else if (leaf.idAnalysis) {
            label = leaf.number + ' - ' +leaf.name;
            leaf.label = label;
        } else if (leaf.idDataTrack) {
            label = leaf.number + ' - ' + leaf.label;
            leaf.label = label;

        }
    }

    assignTreeIcon(topic: any): void {
        if (topic.codeVisibility === "MEM") {
            topic.icon = this.gnomexService.iconTopicMember;
        } else if (topic.codeVisibility === "MEMCOL") {
            topic.icon = this.gnomexService.iconTopicMember;
        } else if (topic.codeVisibility === "OWNER") {
            topic.icon = this.gnomexService.iconTopicOwner;
        } else if (topic.codeVisibility == "INST") {
            topic.icon = this.gnomexService.iconTopicInstitution;
        } else {
            topic.icon = this.gnomexService.iconTopicPublic;
        }
    }


    assignIconToDT(datatrack: any) {
        switch (datatrack.codeVisibility) {
            case 'MEM': {
                datatrack.icon = this.gnomexService.iconDataTrackMember;
                break;
            }
            case 'OWNER': {
                datatrack.icon = this.gnomexService.iconDataTrackOwner;
                break;
            }
            default: {
                datatrack.icon = this.gnomexService.iconDataTrackPublic;
                break;
            }
        }
    }

    /**
     * A node is selected in the tree.
     * @param event
     */
    treeOnSelect(event: any) {
        this.selectedItem = event.node;
    }

    expandClicked() {
        if (this.selectedItem)
            this.selectedItem.expandAll();
    }

    collapseClicked() {
        if (this.selectedItem)
            this.selectedItem.collapseAll();
    }

    ngOnDestroy(): void {
        this.topicListSubscription.unsubscribe();
    }

}
