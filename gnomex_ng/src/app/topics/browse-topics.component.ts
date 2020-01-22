import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,} from "@angular/core";

import {ITreeOptions, TreeComponent, TreeModel, TreeNode,} from "angular-tree-component";
import * as _ from "lodash";
import {Subscription} from "rxjs";
import {ActivatedRoute, NavigationExtras, ParamMap, Router} from "@angular/router";
import {MatDialogConfig} from "@angular/material";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {TopicService} from "../services/topic.service";
import {GnomexService} from "../services/gnomex.service";
import {MoveTopicComponent} from "./move-topic.component";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {ExperimentsService} from "../experiments/experiments.service";
import {AnalysisService} from "../services/analysis.service";
import {DataTrackService} from "../services/data-track.service";
import {DictionaryService} from "../services/dictionary.service";
import {transaction} from "mobx";
import {UserPreferencesService} from "../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";
import {UtilService} from "../services/util.service";
import {ConstantsService} from "../services/constants.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {NavigationService} from "../services/navigation.service";

@Component({
    selector: "analysis",
    templateUrl: "./browse-topics.component.html",
    styles: [`
        .formField {
            margin: 0 2.0%;
            width: 20%
        }
        .radio-group-container {
            display: inline-flex;
            flex-direction: row;
            vertical-align: middle;
            width: fit-content;
            margin-top: 1.1em;
        }
        .absolute { position: absolute; }
        .foreground { background-color: white;   }
        .background { background-color: #EEEEEE; }
        .vertical-spacer {
            height: 0.3em;
            min-height: 0.3em;
        }
        .border { border: #C8C8C8 solid thin; }
        .major-border {
            border-radius: 0.3em;
            border: 1px solid darkgrey;
        }
        .padded { padding: 0.3em; }
        .top-padded { padding-top: 0.3em; }
        .left-right-padded {
            padding-left:  0.3em;
            padding-right: 0.3em;
        }
        .small-font { font-size: small; }
        .no-overflow  { overflow:    hidden; }
        .no-word-wrap { white-space: nowrap; }
        img.small-icon {
            width: 16px;
            height: 16px;
        }
    `]
})

export class BrowseTopicsComponent implements OnInit, OnDestroy {
    @ViewChild("topicsTree") treeComponent: TreeComponent;
    @ViewChild("dataTree") dataTreeComponent: TreeComponent;

    public readonly MODE_EXPERIMENT: string = "Experiment";
    public readonly MODE_ANALYSIS: string = "Analysis";
    public readonly MODE_DATA_TRACK: string = "Data Track";
    public readonly modes: string[] = [
        this.MODE_EXPERIMENT,
        this.MODE_ANALYSIS,
        this.MODE_DATA_TRACK,
    ];

    public readonly TIME_FRAME_WEEK: string = "In last week";
    public readonly TIME_FRAME_MONTH: string = "month";
    public readonly TIME_FRAME_THREE_MONTH: string = "3 months";
    public readonly TIME_FRAME_YEAR: string = "year";
    public readonly TIME_FRAME_ALL: string = "all";
    public readonly timeFrames: string[] = [
        this.TIME_FRAME_WEEK,
        this.TIME_FRAME_MONTH,
        this.TIME_FRAME_THREE_MONTH,
        this.TIME_FRAME_YEAR,
        this.TIME_FRAME_ALL,
    ];

    private treeModel: TreeModel;
    private dataTreeModel: TreeModel;
    public pickerLabs: any[] = [];
    public genomeBuildList: any[] = [];
    public linkDataView: boolean = false;
    public organisms: any[] = [];
    private previousURLParams: HttpParams;
    private navInitSubscription: Subscription;

    public addIcon: string = "";
    public addLabel: string = "";
    public selectedLab: any = null;
    public searchText: string = "";
    public mode: string = this.MODE_EXPERIMENT;
    public selectedTimeFrame: string = this.TIME_FRAME_THREE_MONTH;
    public selectedOrganism: any = null;
    public selectedGenomeBuild: any = null;
    public countLabel: string = "";
    public dataTreeItems: any[] = [];
    public dataTreeOptions: ITreeOptions = null;

    public items: any = [];
    public currentItem: any;
    public targetItem: any;

    private itemsCopy: any = [];
    private dataTreeItemsCopy: any[] = [];
    private selectedItem: ITreeNode;
    private qParamMap:ParamMap;
    private paramMap: ParamMap;

    private topicListSubscription: Subscription;

    public options: ITreeOptions = {
        displayField: "label",
        childrenField: "items",
        useVirtualScroll: true,
        nodeHeight: () => 22,
        nodeClass: (node: TreeNode) => {
            return "icon-" + node.data.icon;
        },
        allowDrop: (element, {parent, index}) => {
            return parent.data.parentid !== -1;
        },
        allowDrag: (node) => !this.createSecurityAdvisorService.isGuest && (node.data.idDataTrack || node.data.idRequest || node.data.idAnalysis || node.data.idParentTopic),
    };

    private experimentTreeOptions: ITreeOptions = {
        displayField: "label",
        childrenField: "experimentItems",
        useVirtualScroll: false,
        nodeHeight: () => 22,
        nodeClass: (node: TreeNode) => {
            return "icon-" + node.data.icon;
        },
        allowDrop: (element, {parent, index}) => {
            return element.data.idTopic && element.data.linkData;
        },
        allowDrag: (node) => !this.createSecurityAdvisorService.isGuest && node.isLeaf,
    };

    private analysisTreeOptions: ITreeOptions = {
        displayField: "label",
        childrenField: "analysisItems",
        useVirtualScroll: false,
        nodeHeight: () => 22,
        nodeClass: (node: TreeNode) => {
            return "icon-" + node.data.icon;
        },
        allowDrop: (element, {parent, index}) => {
            return element.data.idTopic && element.data.linkData;
        },
        allowDrag: (node) => !this.createSecurityAdvisorService.isGuest && node.isLeaf,
    };

    private datatrackTreeOptions: ITreeOptions = {
        displayField: "label",
        childrenField: "datatrackItems",
        useVirtualScroll: false,
        nodeClass: (node: TreeNode) => {
            return "icon-" + node.data.icon;
        },
        allowDrop: (element, {parent, index}) => {
            return element.data.idTopic && element.data.linkData;
        },
        allowDrag: (node) => !this.createSecurityAdvisorService.isGuest && (node.data.isDataTrackFolder || node.data.idDataTrack),
    };

    constructor(private topicService: TopicService,
                private router: Router,
                private route: ActivatedRoute,
                private dialogService: DialogsService,
                private gnomexService: GnomexService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private datatrackService: DataTrackService,
                public experimentsService: ExperimentsService,
                public dictionaryService: DictionaryService,
                private analysisService: AnalysisService,
                private utilService: UtilService,
                private changeDetector: ChangeDetectorRef,
                public constantsService: ConstantsService,
                public prefService: UserPreferencesService,
                private navService: NavigationService) {
    }

    ngOnInit() {
        this.experimentsService.currentTabIndex = 0;
        this.utilService.registerChangeDetectorRef(this.changeDetector);

        this.navService.navMode = this.navService.navMode ?  this.navService.navMode :  NavigationService.URL;
        let activatedRoute = this.navService.getChildActivateRoute(this.route);
        if(activatedRoute){
            activatedRoute.queryParamMap.subscribe((qParam)=>{this.qParamMap = qParam });
            activatedRoute.paramMap.subscribe((param)=>{ this.paramMap = param });
        }

        this.treeModel = this.treeComponent.treeModel;
        this.dataTreeModel = this.dataTreeComponent.treeModel;

        this.onModeChange();

        this.dialogService.addSpinnerWorkItem();
        this.topicListSubscription = this.topicService.getTopicsListObservable().subscribe((response) => {
            this.items = [];
            this.buildTree(response);
            setTimeout(() => {
                this.dialogService.removeSpinnerWorkItem();
                this.treeModel.update();
                this.treeModel.expandAll();

                if(this.navService.navMode === NavigationService.URL) { // this is if component is being navigated to by url
                    let idVal: string = null;
                    let idName: string = null;
                    let lastSeg: string = this.navService.getLastRouteSegment();

                    if(lastSeg === TopicService.ANALYSIS){
                      idName = "idAnalysis";
                      idVal = this.paramMap.get(idName);
                    }else if(lastSeg === TopicService.DATATRACK){
                        idName = "idDataTrack";
                        idVal = this.paramMap.get(idName);
                    }else if(lastSeg === TopicService.EXPERIMENT){
                        idName = "idRequest";
                        idVal = this.paramMap.get(idName);
                    }else if(lastSeg === TopicService.TOPIC){
                        idName = "idTopic";
                        idVal = this.qParamMap.get(idName);
                    }else{
                        return;
                    }

                    let capID = idVal.toUpperCase();
                    if (this.treeModel && idVal) {
                        let tNode = UtilService.findTreeNode(this.treeModel, idName, idVal);
                        if (tNode) {
                            tNode.setIsActive(true);
                            tNode.scrollIntoView();
                        } else if(idName === 'idTopic') {
                            this.dialogService.alert("You do not have permission to view Topic " + capID , "INVALID", DialogType.FAILED);
                        }
                    }
                }
            });
        }, () => {
            this.dialogService.stopAllSpinnerDialogs();
        });


        this.topicService.refreshTopicsList_fromBackend();


        this.pickerLabs = [].concat(this.gnomexService.labList);
        this.organisms = [].concat(this.gnomexService.das2OrganismList);
    }

    private resetTree(): void {
        this.items = this.itemsCopy;
    }

    private resetDataTree(): void {
        this.dataTreeItems = this.dataTreeItemsCopy;
    }

    public onMoveNode(event): void {
        this.currentItem = event.node;
        this.targetItem = event.to.parent;
        this.doMove(event);
    }

    private doMove(event): void {
        if (this.currentItem.idTopic === this.targetItem.idTopic) {
            this.dialogService.alert("Moving or Copying an item to the same topic is not allowed", null, DialogType.WARNING);
        } else {
            let attribute: string = "";
            let attributeValue: string = "";

            if ((event.node.idRequest || event.node.idAnalysis || event.node.idDataTrack) && !this.currentItem.idTopic) {
                this.dialogService.addSpinnerWorkItem();
                if (this.currentItem.idAnalysis) {
                    attribute = "idAnalysis0";
                    attributeValue = this.currentItem.idAnalysis;
                } else if (this.currentItem.idRequest) {
                    attribute = "idRequest0";
                    attributeValue = this.currentItem.idRequest;
                } else if (this.currentItem.idDataTrack) {
                    attribute = "idDataTrack0";
                    attributeValue = this.currentItem.idDataTrack;
                }
                this.resetDataTree();
                this.topicService.addItemToTopicNew(this.targetItem.idTopic, attribute, attributeValue).subscribe((response: any) => {
                    this.dialogService.removeSpinnerWorkItem();
                    this.topicService.refreshTopicsList_fromBackend();
                }, (err: IGnomexErrorResponse) => {
                    this.dialogService.stopAllSpinnerDialogs();
                });
            } else {
                let config: MatDialogConfig = new MatDialogConfig();
                config.width = "35em";
                config.height = "15em";
                config.data = {
                    currentItem: this.currentItem,
                    targetItem: this.targetItem
                };
                let title: string = "Move/Copy to " + UtilService.getSubStr(this.targetItem.label, 30);
                this.dialogService.genericDialogContainer(MoveTopicComponent, title, this.currentItem.icon, config,
                    {actions: []}).subscribe((result: any) => {
                        if (!result) {
                            this.resetTree();
                            this.resetDataTree();
                        }
                });
            }
        }
    }

    private buildTree(response: any[]): void {
        this.items = UtilService.getJsonArray(response, response);

        for (let folder of this.items) {
            folder.id = "topic";
            folder.parentid = -1;
            folder.label = "Topics";

            folder.icon = this.constantsService.ICON_FOLDER;

            if (folder.Folder.Topic) {
                this.addTopic(folder, folder.Folder.Topic);
            }
        }
    }

    private addTopic(root: any, items: any[]): void {
        root.items = UtilService.getJsonArray(items, items);

        for (let topic of items) {
            let topicArray: any[] = [];
            if (topic.Topic) {
                topicArray = UtilService.getJsonArray(topic.Topic, topic.Topic);
                this.addTopic(topic, topicArray);
            }
            this.assignTreeIcon(topic);
            topic.id = "t" + topic.idTopic;
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
                for (let category of topic.items) {
                    if (category.Request || category.Analysis || category.DataTrack) {
                        category.idTopic = topic.idTopic;
                        if (category.Request) {
                            category.id = "r" + topic.idTopic;
                            category.items = UtilService.getJsonArray(category.Request, category.Request);
                            for (let request of category.items) {
                                request.id = request.idRequest + category.id;
                                this.setLabel(request);
                            }
                        }
                        if (category.Analysis) {
                            category.id = "a" + topic.idTopic;
                            category.items = UtilService.getJsonArray(category.Analysis, category.Analysis);
                            for (let analysis of category.items) {
                                analysis.icon = this.constantsService.ICON_ANALYSIS;
                                analysis.id = analysis.idAnalysis + category.id;
                                this.setLabel(analysis);
                            }

                        }
                        if (category.DataTrack) {
                            category.id = "s" + topic.idTopic;
                            category.items = UtilService.getJsonArray(category.DataTrack, category.DataTrack);
                            for (let datatrack of category.items) {
                                this.assignIconToDT(datatrack);
                                datatrack.id = datatrack.idDataTrack + category.id;
                                this.setLabel(datatrack);
                            }
                        }
                    }
                }

            }
        }
    }

    private setLabel(leaf: any): void {
        let label: string = "";
        if (leaf.idAnalysis || leaf.idDataTrack) {
            if (leaf.label && leaf.name) {
                label = leaf.number + ' - ' +leaf.name;
            } else {
                label = leaf.number;
            }
            leaf.label = label;
        }
    }

    private assignTreeIcon(topic: any): void {
        if (topic.codeVisibility === "MEM") {
            topic.icon = this.constantsService.ICON_TOPIC_MEMBER;
        } else if (topic.codeVisibility === "MEMCOL") {
            topic.icon = this.constantsService.ICON_TOPIC_MEMBER;
        } else if (topic.codeVisibility === "OWNER") {
            topic.icon = this.constantsService.ICON_TOPIC_OWNER;
        } else if (topic.codeVisibility == "INST") {
            topic.icon = this.constantsService.ICON_TOPIC_INSTITUTION;
        } else {
            topic.icon = this.constantsService.ICON_TOPIC_PUBLIC;
        }
    }

    private assignIconToDT(datatrack: any): void {
        datatrack.label = datatrack.name + " (" + datatrack.number + ")";
        switch (datatrack.codeVisibility) {
            case 'MEM': {
                datatrack.icon = this.constantsService.ICON_DATATRACK_MEMBER;
                break;
            }
            case 'OWNER': {
                datatrack.icon = this.constantsService.ICON_DATATRACK_OWNER;
                break;
            }
            default: {
                datatrack.icon = this.constantsService.ICON_DATATRACK_PUBLIC;
                break;
            }
        }
        datatrack.id = "d" + datatrack.idDataTrack + datatrack.idDataTrackFolder;
    }

    public treeOnSelect(event: any): void {
        this.selectedItem = event.node;
        this.linkDataView = false;
        let name = this.selectedItem.displayField;
        let topicListNode = _.cloneDeep(this.selectedItem.data);
        let navExtras:NavigationExtras = {};

        if(this.navService.navMode === NavigationService.USER){
            if (this.selectedItem.isRoot) {
                this.router.navigate(['/topics']);//, { outlets: { primary: null }}]);
            } else if (name === "Data Tracks" || name === "Experiments" || name === "Analysis" ) {
                this.router.navigate(['/topics']);//, { outlets: { primary: null }}]);
            } else {
                if ((this.selectedItem.data.label as string).endsWith('(Restricted Visibility)')) {
                    this.dialogService.alert("You do not have permission to view this", null, DialogType.FAILED);
                    return;
                }

                let pathPair: string[] = [];
                if (this.selectedItem.data.idAnalysis) {
                    pathPair = ["analysis", this.selectedItem.data.idAnalysis];
                    this.analysisService.emitAnalysisOverviewList(topicListNode);
                } else if (this.selectedItem.data.idRequest) {
                    pathPair = ["experiment", this.selectedItem.data.idRequest];
                    this.experimentsService.emitExperimentOverviewList(topicListNode);
                } else if (this.selectedItem.data.idDataTrack) {
                    pathPair = ["datatrack",  this.selectedItem.data.idDataTrack];
                    this.datatrackService.datatrackListTreeNode = topicListNode;
                } else if (this.selectedItem.data.idTopic) {
                    pathPair = ["detail", this.selectedItem.data.idLab];
                    navExtras.queryParams = {"idTopic": this.selectedItem.data.idTopic};
                    this.topicService.emitSelectedTreeNode(topicListNode);
                }
                if (pathPair) {
                    this.router.navigate(['/topics',pathPair[0],pathPair[1]], navExtras);
                }
            }
        }else{
            this.analysisService.emitAnalysisOverviewList(topicListNode);
            this.experimentsService.emitExperimentOverviewList(topicListNode);
            this.datatrackService.datatrackListTreeNode = topicListNode;
            this.topicService.emitSelectedTreeNode(topicListNode);

            this.navService.emitResetNavModeSubject(TopicService.ANALYSIS);
            this.navService.emitResetNavModeSubject(TopicService.DATATRACK);
            this.navService.emitResetNavModeSubject(TopicService.EXPERIMENT);
            this.navService.emitResetNavModeSubject(TopicService.TOPIC);
            this.dialogService.removeSpinnerWorkItem();
        }


    }

    public onDataTreeUpdateData(): void {
        this.updateCountLabel();
        this.dataTreeItemsCopy = _.clone(this.dataTreeItems);
    }

    public onTreeUpdateData(): void {
        this.itemsCopy = _.clone(this.items);
    }

    public expandClicked(): void {
        if (this.selectedItem) {
            this.selectedItem.expandAll();
        }
    }

    public collapseClicked(): void {
        if (this.selectedItem) {
            this.selectedItem.collapseAll();
        }
    }

    public onLabSelect(): void {
        switch (this.mode) {
            case this.MODE_EXPERIMENT:
                this.getExperiments();
                break;
            case this.MODE_ANALYSIS:
                this.getAnalysis();
                break;
            case this.MODE_DATA_TRACK:
                this.getDatatracks();
                break;
        }
    }

    public onOrganismSelect(): void {
        if (this.selectedOrganism) {
            this.genomeBuildList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.GENOME_BUILD).filter((gen) => {
                return gen.isActive === "Y" && gen.value !== "" && gen.idOrganism === this.selectedOrganism;
            });
        } else {
            this.genomeBuildList = [];
        }
        this.selectedGenomeBuild = null;
        this.getDatatracks();
    }

    public onGenomeBuildSelect(): void {
        this.getDatatracks();
    }

    public searchByText(): void {
        this.search(this.mode === this.MODE_DATA_TRACK);
    }

    public clearSearchText(): void {
        this.searchText = "";
        this.searchByText();
    }

    public onSearchFilterKeyup(event: any): void {
        if (event.key === "Enter") {
            this.searchByText();
        }
    }

    private updateCountLabel(): void {
        let itemType: string = "";
        switch (this.mode) {
            case this.MODE_EXPERIMENT:
                itemType = "experiments";
                break;
            case this.MODE_ANALYSIS:
                itemType = "analyses";
                break;
            case this.MODE_DATA_TRACK:
                itemType = "data tracks";
                break;
        }
        this.countLabel = " (" + this.determineCount().toString() + " " + itemType + ")";
    }

    private determineCount(): number {
        let attributeToCheckFor: string = "";
        switch (this.mode) {
            case this.MODE_EXPERIMENT:
                attributeToCheckFor = "idRequest";
                break;
            case this.MODE_ANALYSIS:
                attributeToCheckFor = "idAnalysis";
                break;
            case this.MODE_DATA_TRACK:
                attributeToCheckFor = "idDataTrack";
                break;
        }

        let count: number = 0;
        if (this.dataTreeModel && !this.dataTreeModel.isEmptyTree()) {
            for (let root of this.dataTreeModel.roots) {
                count += BrowseTopicsComponent.recursivelyCount(root, attributeToCheckFor);
            }
        }
        return count;
    }

    private static recursivelyCount(node: ITreeNode, attributeToCheckFor: string): number {
        if (node.hasChildren) {
            let count: number = 0;
            for (let child of node.children) {
                count += BrowseTopicsComponent.recursivelyCount(child, attributeToCheckFor);
            }
            return count;
        } else if (node.data.isHidden) {
            return 0;
        } else if (node.data[attributeToCheckFor]) {
            return 1;
        }
        return 0;
    }

    public onModeChange(): void {
        switch (this.mode) {
            case this.MODE_EXPERIMENT:
                this.dataTreeOptions = this.experimentTreeOptions;
                this.addIcon = this.constantsService.ICON_FLASK;
                this.addLabel = this.MODE_EXPERIMENT;
                this.getExperiments();
                break;
            case this.MODE_ANALYSIS:
                this.dataTreeOptions = this.analysisTreeOptions;
                this.addIcon = this.constantsService.ICON_ANALYSIS;
                this.addLabel = "Analysis";
                this.getAnalysis();
                break;
            case this.MODE_DATA_TRACK:
                this.dataTreeOptions = this.datatrackTreeOptions;
                this.addIcon = this.constantsService.ICON_DATATRACK;
                this.addLabel = "Data Track";
                this.getDatatracks();
                break;
        }
    }

    private getExperiments(): void {
        this.dialogService.addSpinnerWorkItem();

        this.searchText = "";

        let params: HttpParams = new HttpParams()
            .set("idLab", this.selectedLab ? this.selectedLab : "")
            .set("allExperiments", 'Y')
            .set("excludeClinicResearch", 'Y')
            .set("isBioanalyzer", 'N')
            .set("isMicroarray", 'N')
            .set("isNextGenSeq", 'N')
            .set("publicExperimentsInOtherGroups", 'Y')
            .set("showCategory", 'N')
            .set("showMyLabsAlways", 'N')
            .set("showSamples", 'N');
        switch (this.selectedTimeFrame) {
            case this.TIME_FRAME_WEEK: {
                params = params.set("lastWeek", 'Y');
                break;
            }
            case this.TIME_FRAME_MONTH: {
                params = params.set("lastMonth", 'Y');
                break;
            }
            case this.TIME_FRAME_THREE_MONTH: {
                params = params.set("lastThreeMonths", 'Y');
                break;
            }
            case this.TIME_FRAME_YEAR: {
                params = params.set("lastYear", 'Y');
                break;
            }
        }
        this.experimentsService.getProjectRequestList(params).subscribe((response:any) => {
            this.buildExperimentsTree(response);
            setTimeout(() => {
                this.expandChildNodes(this.dataTreeModel);
                this.dialogService.removeSpinnerWorkItem();
            });
        },() =>{
            this.dialogService.stopAllSpinnerDialogs();
        });
    }

    private getAnalysis(): void {
        this.dialogService.addSpinnerWorkItem();

        this.searchText = "";

        let params: HttpParams = new HttpParams()
            .set("allAnalysis", 'Y')
            .set("labkeys", '')
            .set("isBioanalyzer", 'N')
            .set("isMicroarray", 'N')
            .set("isNextGenSeq", 'N')
            .set("showMyLabsAlways", 'N')
            .set("idLab", this.selectedLab ? this.selectedLab : "");
        switch (this.selectedTimeFrame) {
            case this.TIME_FRAME_WEEK: {
                params = params.set("lastWeek", 'Y')
                    .set("lastMonth", 'N')
                    .set("lastThreeMonths", 'N')
                    .set("lastYear", 'N');
                break;
            }
            case this.TIME_FRAME_MONTH: {
                params = params.set("lastWeek", 'N')
                    .set("lastMonth", 'Y')
                    .set("lastThreeMonths", 'N')
                    .set("lastYear", 'N');
                break;
            }
            case this.TIME_FRAME_THREE_MONTH: {
                params = params.set("lastWeek", 'N')
                    .set("lastMonth", 'N')
                    .set("lastThreeMonths", 'Y')
                    .set("lastYear", 'N');
                break;
            }
            case this.TIME_FRAME_YEAR: {
                params = params.set("lastWeek", 'N')
                    .set("lastMonth", 'N')
                    .set("lastThreeMonths", 'N')
                    .set("lastYear", 'Y');
                break;
            }
        }

        this.analysisService.getAnalysisGroupList(params).subscribe((response) => {
            this.buildAnalysisTree(response);
            setTimeout(() => {
                this.expandChildNodes(this.dataTreeModel);
                this.dialogService.removeSpinnerWorkItem();
            });
        },() =>{
            this.dialogService.stopAllSpinnerDialogs();
        });
    }

    private getDatatracks(): void {
        this.dialogService.addSpinnerWorkItem();

        this.searchText = "";

        let params: HttpParams = new HttpParams()
            .set("isVisibilityInstitute", 'Y')
            .set("isVisibilityPublic", 'Y')
            .set("isVisibilityOwner", 'Y')
            .set("isVisibilityMembers", 'Y')
            .set("idOrganism", this.selectedOrganism ? this.selectedOrganism : "")
            .set("idGenomeBuild", this.selectedGenomeBuild ? this.selectedGenomeBuild : "")
            .set("idLab", this.selectedLab ? this.selectedLab : "");
        if (params !== this.previousURLParams) {
            this.datatrackService.getDataTrackListFull(params).subscribe((response) => {
                this.buildDatatracksTree(response);
                this.previousURLParams = params;
                setTimeout(() => {
                    this.expandChildNodes(this.dataTreeModel);
                    this.dialogService.removeSpinnerWorkItem();
                });
            }, (err: IGnomexErrorResponse) => {
                this.dialogService.removeSpinnerWorkItem();
            });
        }
    }

    public doLinkData(): void {
        this.linkDataView = true;
        this.getExperiments();
    }

    private buildExperimentsTree(response: any): void {
        let items: any[] = [];

        if (response) {
            let labs: any[] = UtilService.getJsonArray(response.Lab, response.Lab);
            for (let lab of labs) {
                lab.id = "l" + lab.idLab;
                lab.linkData = "link";
                lab.parentid = -1;
                lab.icon = this.constantsService.ICON_GROUP;
                // If there is a lab with no Project skip
                if (lab.Project) {
                    items.push(lab);
                    lab.experimentItems = UtilService.getJsonArray(lab.Project, lab.Project);
                    for (let project of lab.experimentItems) {
                        project.icon = this.constantsService.ICON_FOLDER;
                        project.labId = lab.labId;
                        project.linkData = "link";
                        project.id = "p" + project.idProject;
                        project.parentid = lab.id;
                        if (project.Request) {
                            project.experimentItems = UtilService.getJsonArray(project.Request, project.Request);
                            for (let request of project.experimentItems) {
                                if (request && request.label) {
                                    request.label = request.requestNumber + '-' + request.name;
                                    request.id = "r" + request.idRequest;
                                    request.linkData = "link";
                                    request.parentid = project.id;
                                }
                            }
                        }
                    }
                }
            }
        }
        this.dataTreeItems = items;

        if (this.dataTreeModel) {
            this.dataTreeModel.clearFilter();
        }
    }

    private buildAnalysisTree(response: any): void {
        let items: any[] = [];

        if (response) {
            items = UtilService.getJsonArray(response, response);
            let labs: any[] = [].concat(items);

            this.analysisService.emitCreateAnalysisDataSubject({
                labs: labs,
                items: items,
            });
            for (let l of items) {
                l.id = "l" + l.idLab;
                l.parentid = -1;
                l.linkData = "link";

                l.icon = this.constantsService.ICON_GROUP;

                if (l.AnalysisGroup) {
                    l.analysisItems = UtilService.getJsonArray(l.AnalysisGroup, l.AnalysisGroup);
                    for (let p of l.analysisItems) {
                        p.icon = this.constantsService.ICON_FOLDER;
                        p.idLab = l.idLab;
                        p.linkData = "link";
                        p.id = "p" + p.idAnalysisGroup;
                        if (p.Analysis) {
                            p.analysisItems = UtilService.getJsonArray(p.Analysis, p.Analysis);
                            for (let a of p.analysisItems) {
                                if (a && a.label) {
                                    a.label = a.number + " (" + a.label + ")";
                                    a.id = "a" + a.idAnalysis;
                                    a.linkData = "link";
                                    a.icon = this.constantsService.ICON_ANALYSIS;
                                    a.parentid = p.idLab;
                                }
                            }
                        }
                    }
                }
            }
        }
        this.dataTreeItems = items;

        if (this.dataTreeModel) {
            this.dataTreeModel.clearFilter();
        }
    }

    private buildDatatracksTree(response: any): void {
        let items: any[] = [];

        if (response && response.Organism) {
            items = UtilService.getJsonArray(response.Organism, response.Organism);
            for (let org of items) {
                org.id = "o" + org.idOrganism;
                org.parentid = -1;
                org.linkData = "link";

                org.icon = this.constantsService.ICON_ORGANISM;
                if (org.GenomeBuild) {
                    org.datatrackItems = UtilService.getJsonArray(org.GenomeBuild, org.GenomeBuild);
                    for (let gNomeBuild of org.datatrackItems) {
                        if (gNomeBuild) {
                            this.assignIconToGenomeBuild(gNomeBuild);
                            gNomeBuild.labId = org.labId;
                            gNomeBuild.id = "g" + gNomeBuild.idGenomeBuild;
                            gNomeBuild.linkData = "link";
                            gNomeBuild.parentid = org.id;
                            this.addDataTracksRecursively(gNomeBuild);
                        }
                    }
                }
            }
        }
        this.dataTreeItems = items;

        if (this.dataTreeModel) {
            this.dataTreeModel.clearFilter();
        }
    }

    private addDataTracksRecursively(root: any): void {
        let dataTrackFolders: any[] = UtilService.getJsonArray(root.DataTrackFolder, root.DataTrackFolder);
        for (let folder of dataTrackFolders) {
            this.assignIconToDTFolder(folder);
            this.addDataTracksRecursively(folder);
        }

        let dataTracks: any[] = UtilService.getJsonArray(root.DataTrack, root.DataTrack);
        for (let dataTrack of dataTracks) {
            if (dataTrack.label) {
                this.assignIconToDT(dataTrack);
                dataTrack.parentid = root.id;
                dataTrack.linkData = "link";
            }
        }

        root.datatrackItems = [].concat(dataTrackFolders).concat(dataTracks);
    }

    private assignIconToGenomeBuild(genomeBuild: any): void {
        if (genomeBuild.DataTrack || genomeBuild.DataTrackFolder) {
            genomeBuild.icon = this.constantsService.ICON_GENOME_BUILD;
        } else {
            genomeBuild.icon = this.constantsService.ICON_GENOME_BUILD_FADED;
        }
        genomeBuild.isGenomeBuild = true;
    }

    private assignIconToDTFolder(dtf: any): void {
        dtf.id = "df" + dtf.idDataTrackFolder;
        if (dtf.idLab) {
            dtf.icon = this.constantsService.ICON_FOLDER_GROUP;
        } else {
            dtf.icon = this.constantsService.ICON_FOLDER;
        }
        dtf.isDataTrackFolder = true;
    }

    private expandChildNodes(model: TreeModel): void {
        this.dialogService.addSpinnerWorkItem();
        if (model && this.createSecurityAdvisorService.isSuperAdmin && model.roots) {
            if (this.createSecurityAdvisorService.isSuperAdmin) {
                transaction(() => {
                    for (let node of model.roots) {
                        node.expand();
                    }
                });
            } else {
                model.expandAll();
            }
        }
        this.dialogService.removeSpinnerWorkItem();
    }

    private search(collapseIfNoFilter: boolean = false): void {
        let searchTextLowercase: string = this.searchText.toLowerCase();
        this.dataTreeModel.filterNodes((node: ITreeNode) => {
            let show: boolean = node.data.label.toLowerCase().includes(searchTextLowercase);
            node.data.isHidden = !show;
            return show;
        });
        if (collapseIfNoFilter) {
            this.dataTreeModel.collapseAll();
        }
        this.updateCountLabel();
    }

    public onTimeFrameChange() {
        switch (this.mode) {
            case this.MODE_EXPERIMENT:
                this.getExperiments();
                break;
            case this.MODE_ANALYSIS:
                this.getAnalysis();
                break;
        }
    }

    ngOnDestroy(): void {
        this.utilService.removeChangeDetectorRef(this.changeDetector);
        UtilService.safelyUnsubscribe(this.topicListSubscription);
        UtilService.safelyUnsubscribe(this.navInitSubscription);
    }

}
