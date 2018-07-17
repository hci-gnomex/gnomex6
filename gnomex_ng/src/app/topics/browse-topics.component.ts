/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {
    AfterViewInit, ChangeDetectorRef, Component,ElementRef, Input, OnDestroy, OnInit, ViewChild,
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
import {NavigationEnd, Router} from "@angular/router";
import {MatDialogRef, MatDialog, MatAutocomplete,MatOption} from '@angular/material';
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {TopicService} from "../services/topic.service";
import {GnomexService} from "../services/gnomex.service";
import {MoveTopicComponent} from "./move-topic.component";
import {DialogsService} from "../util/popup/dialogs.service";
import {LabListService} from "../services/lab-list.service";
import {ExperimentsService} from "../experiments/experiments.service";
import {AnalysisService} from "../services/analysis.service";
import {DataTrackService} from "../services/data-track.service";
import {DictionaryService} from "../services/dictionary.service";
import { transaction } from 'mobx';

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
    templateUrl: "./browse-topics.component.html",
    styles: [`
        
        mat-form-field.formField {
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

        .vertical-spacer { height: 0.3em; }
        
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
        
    `]
})

export class BrowseTopicsComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild("topicsTree") treeComponent: TreeComponent;
    @ViewChild("experimentsTree") experimentTreeComponent: TreeComponent;
    @ViewChild("analysisTree") analysisTreeComponent: TreeComponent;
    @ViewChild("datatrackTree") datatrackTreeComponent: TreeComponent;
    @ViewChild("autoLab") dtLabAutocomplete: MatAutocomplete;
    @ViewChild("datatrackInput") datatrackInput: ElementRef;
    @ViewChild("autoOrg") dtOrgAutocomplete: MatAutocomplete;
    @ViewChild("autoAnalLab") analLabAutoComplete: MatAutocomplete;
    @ViewChild("analysisInput") analysisInput: ElementRef;
    @ViewChild("autoExpLab") expLabAutoComplete: MatAutocomplete;
    @ViewChild("experimentInput") experimentInput: ElementRef;
    @ViewChild("autoGen") dtGenAutocomplete: MatAutocomplete;
    @Input() childMessage: string;
    public moveTopicDialogRef: MatDialogRef<MoveTopicComponent>;

    private treeModel: TreeModel;
    private experimentTreeModel: TreeModel;
    private analysisTreeModel: TreeModel;
    private datatrackTreeModel: TreeModel;
    private experimentLab: any;
    private analysisLab: any;
    private datatrackLab: any;
    private organism: any;
    private genomeBuild: any;
    private labs: any[];
    private analysisLabs: any[] = [];
    private experimentLabs: any[] = [];
    private datatrackLabs: any[] = [];
    private pickerLabs: any[] = [];
    private genomeBuildList: any[] = [];
    private isExperimentsTab: boolean;
    private isAnalysisTab: boolean;
    private isDatatracksTab: boolean;
    public selectedGroupTab: number = 0;
    private linkDataView: boolean = false;
    private experimentSearchText: string;
    private analysisSearchText: string;
    private datatrackSearchText: string;
    private selectedExpTimeFrame: string = "3 months";
    private previousExpTimeFrame: string = "";
    private selectedAnalTimeFrame: string = "3 months";
    private previousAnalTimeFrame: string = "";
    private analysisCount: number = 0;
    private selectedIdLab: any;
    public organisms: any[] = [];
    public oldOrganisms: any[] = [];
    // private showSpinner: boolean = false;
    private idAnalysis: string = "";
    private idExperiment: string = "";
    private emptyLab = {idLab: "0",
        name: ""};
    private previousURLParams: URLSearchParams;
    private resetExperiment: boolean = false;
    private resetAnalysis: boolean = false;
    private resetDatatrack: boolean = false;
    private experimentCount: number;
    private datatracksCount: number;
    private experimentLabel: string;
    private analysisLabel: string;
    private datatrackLabel: string;
    private previousExperimentMatOption: MatOption;
    private previousAnalysisMatOption: MatOption;
    private previousDatatrackMatOption: MatOption;
    private previousOrganismMatOption: MatOption;
    private navInitSubsciption:Subscription;


    timeFrames = [
        'In last week',
        'month',
        '3 months',
        'year',
    ];

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

        allowDrag: (node) => node.data.idDataTrack || node.data.idRequest || node.data.idAnalysis || node.data.idParentTopic,
        actionMapping
    };

    public experimentOptions: ITreeOptions = {
        displayField: "label",
        childrenField: "experimentItems",
        useVirtualScroll: false,
        nodeHeight: 22,
        nodeClass: (node: TreeNode) => {
            return "icon-" + node.data.icon;
        },
        allowDrop: (element, {parent, index}) => {
            // this.dragEndExperimentItems = _.cloneDeep(this.experimentItems);
            if (element.data.idTopic && element.data.linkData) {
                return true;
            } else {
                return false;
            }
        },

        allowDrag: (node) => node.isLeaf,
        actionMapping
    };

    public analysisOptions: ITreeOptions = {
        displayField: "label",
        childrenField: "analysisItems",
        useVirtualScroll: false,
        nodeHeight: 22,
        nodeClass: (node: TreeNode) => {
            return "icon-" + node.data.icon;
        },
        allowDrop: (element, {parent, index}) => {
            // this.dragEndAnalysisItems = _.cloneDeep(this.analysisItems);
            if (element.data.idTopic && element.data.linkData) {
                return true;
            } else {
                return false;
            }
        },

        allowDrag: (node) => node.isLeaf,
        actionMapping
    };

    public datatrackOptions: ITreeOptions = {
        displayField: "label",
        childrenField: "datatrackItems",
        useVirtualScroll: false,
        nodeClass: (node: TreeNode) => {
            return "icon-" + node.data.icon;
        },
        allowDrop: (element, {parent, index}) => {
            // this.dragEndDatatrackItems = _.cloneDeep(this.datatrackItems);
            if (element.data.idTopic && element.data.linkData) {
                return true;
            } else {
                return false;
            }
        },

        allowDrag: (node) => node.data.isDataTrackFolder || node.data.idDataTrack,
        actionMapping
    };

    public items: any;
    public experimentItems: any;
    public analysisItems: any;
    public datatrackItems: any;
    public currentItem: any;
    public targetItem: any;

    private dragEndItems: any;
    private dragEndExperimentItems: any;
    private dragEndAnalysisItems: any;
    private dragEndDatatrackItems: any;
    private selectedItem: ITreeNode;

    private topicListSubscription: Subscription;

    ngOnInit() {
        this.treeModel = this.treeComponent.treeModel;
        // this.showSpinner = true;
        this.dialogService.startDefaultSpinnerDialog();

        this.topicListSubscription = this.topicService.getTopicsListObservable().subscribe(response => {
            this.items = [].concat([]);
            this.buildTree(response);
            setTimeout(() => {

                this.dialogService.stopAllSpinnerDialogs();
                // this.showSpinner = false;
                this.treeModel.update();
                this.treeModel.expandAll();

                if(this.gnomexService.orderInitObj) { // this is if component is being navigated to by url
                    let id: string = "t" + this.gnomexService.orderInitObj.idTopic;
                    if (this.treeModel && id) {
                        let tNode = this.treeModel.getNodeById(id);
                        if(tNode){
                            tNode.setIsActive(true);
                            tNode.scrollIntoView();
                        }
                        this.gnomexService.orderInitObj = null;
                    }
                }

            });

        });

        this.navInitSubsciption = this.gnomexService.navInitBrowseTopicSubject
            .subscribe(orderInitObj =>{
            this.topicService.refreshTopicsList_fromBackend();
        });



        this.pickerLabs.push(this.emptyLab);
        this.pickerLabs = this.pickerLabs.concat(this.gnomexService.labList);
        this.organisms = this.gnomexService.das2OrganismList;
        this.isExperimentsTab = true;
        this.isAnalysisTab = false;
        this.isDatatracksTab = false;

    }

    ngAfterViewInit() {
    }

    ngAfterViewChecked() {
        if (this.resetAnalysis) {
            this.getAnalysis("", this.selectedAnalTimeFrame);
            this.resetAnalysis = false;
        } else if (this.resetExperiment) {
            this.getExperiments("", this.selectedExpTimeFrame);
            this.resetExperiment = false;
        } else if (this.resetDatatrack) {
            this.getDatatracks("", "", "");
            this.resetDatatrack = false;
        }
    }

    constructor(private topicService: TopicService, private router: Router,
                private dialog: MatDialog,
                private dialogService: DialogsService,
                private gnomexService: GnomexService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private datatrackService: DataTrackService,
                public experimentsService: ExperimentsService,
                public dictionaryService: DictionaryService,
                private analysisService: AnalysisService) {


        this.items = [];
        this.dragEndItems = [];
    }

    resetTree() {
        this.items = this.dragEndItems;
    }

    resetExperimentTree() {
        this.experimentItems = this.dragEndExperimentItems;
    }

    resetAnalysisTree() {
        this.analysisItems = this.dragEndAnalysisItems;
    }

    resetDatatrackTree() {
        this.datatrackItems = this.dragEndDatatrackItems;
    }

    onMoveNode($event) {
        this.dialogService.startDefaultSpinnerDialog()
        // this.showSpinner = true;
        this.currentItem = $event.node;
        this.targetItem = $event.to.parent;
        this.doMove($event);
    }

    doMove(event) {
        if (this.currentItem.idTopic === this.targetItem.idTopic) {
            this.dialogService.confirm("Moving or Copying an item to the same topic is not allowed.'.", null);
        } else {
            var params: URLSearchParams = new URLSearchParams();

            if ((event.node.idRequest || event.node.idAnalysis || event.node.idDataTrack) && !this.currentItem.idTopic) {
                params.set("idTopic", this.targetItem.idTopic);

                if (this.currentItem.idAnalysis) {
                    params.set("name", "Analysis");
                    params.set("idAnalysis0", this.currentItem.idAnalysis);
                    this.resetAnalysisTree();
                } else if (this.currentItem.idRequest) {
                    params.set("name", "Request");
                    params.set("idRequest0", this.currentItem.idRequest);
                    this.resetExperimentTree();
                } else if (this.currentItem.idDataTrack) {
                    params.set("name", "DataTrack");
                    params.set("idDataTrack0", this.currentItem.idDataTrack);
                    this.resetDatatrackTree();
                }
                this.topicService.addItemToTopic(params).subscribe((response: Response) => {
                    this.topicService.refreshTopicsList_fromBackend();
                });
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
                                analysis.id = analysis.idAnalysis + category.id;
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
                                datatrack.id = datatrack.idDataTrack + category.id;
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
        let label = datatrack.name + " ("+datatrack.number + ")";
        datatrack.label = label;
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
        this.datatracksCount++;
        datatrack.id = "d"+datatrack.idDataTrack + datatrack.idDataTrackFolder;
    }

    /**
     * A node is selected in the tree.
     * @param event
     */
    treeOnSelect(event: any) {
        this.selectedItem = event.node;
        this.linkDataView = false;
        let name = this.selectedItem.displayField;
        let topicListNode = _.cloneDeep(this.selectedItem.data);



        if(this.selectedItem.isRoot){
            this.router.navigate(['/topics', { outlets: { topicsPanel: null }}]);
        }else if(name === "Data Tracks" || name === "Experiments" || name === "Analysis" ){
            this.router.navigate(['/topics', { outlets: { topicsPanel: null }}]);
        }else {
            let pathPair:string = '';
            if(this.selectedItem.data.idAnalysis){
                pathPair = "analysis/" + this.selectedItem.data.idAnalysis;
                this.analysisService.emitAnalysisOverviewList(topicListNode);
            }else if(this.selectedItem.data.idRequest){
                pathPair = "experiment/" + this.selectedItem.data.idRequest;
                this.experimentsService.emitExperimentOverviewList(topicListNode);

            }else if(this.selectedItem.data.idDataTrack){
                pathPair = "datatrack/" + this.selectedItem.data.idDataTrack;
                this.datatrackService.datatrackListTreeNode = topicListNode;

            }else if(this.selectedItem.data.idTopic){
                pathPair =  this.selectedItem.data.idLab;
                this.topicService.emitSelectedTreeNode(topicListNode);

            }
            if(pathPair){

                this.router.navigate(['/topics',{outlets:{topicsPanel:pathPair}}])


            }
        }

        //this.router.navigate(['/topics',  {outlets:{'topicsPanel':["experiment/43"]}}]);

    }

    expTreeOnSelect(event: any) {
        this.dragEndExperimentItems = _.cloneDeep(this.experimentItems);
    }

    analTreeOnSelect(event: any) {
        this.dragEndAnalysisItems = _.cloneDeep(this.analysisItems);
    }

    dTTreeOnSelect(event: any) {
        this.dragEndDatatrackItems = _.cloneDeep(this.datatrackItems);
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
        this.navInitSubsciption.unsubscribe();
    }

    chooseFirstExpLabOption() {
        this.expLabAutoComplete.options.first.select();
    }

    chooseFirstAnalLabOption() {
        this.analLabAutoComplete.options.first.select();
    }

    chooseFirstLabOption(): void {
        this.dtLabAutocomplete.options.first.select();
    }

    chooseFirstOrgOption(): void {
        this.dtOrgAutocomplete.options.first.select();
    }

    chooseFirstGenomeOption(): void {
        this.dtGenAutocomplete.options.first.select();
    }

    selectExperimentLabOption(event) {
        if (event.source.value) {
            this.experimentLab = event.source.value;
            this.dialogService.startDefaultSpinnerDialog();
            // this.showSpinner = true;
            this.getExperiments(this.experimentLab.idLab, this.selectedExpTimeFrame);
        }
    }

    selectAnalysisLabOption(event) {
        if (event.source.value && event.source.selected && event.source.value.idLab !== "0") {
            this.analysisLab = event.source.value;
            this.dialogService.startDefaultSpinnerDialog();
            // this.showSpinner = true;
            this.getAnalysis(this.analysisLab.idLab, this.selectedAnalTimeFrame);
        }
    }

    selectDatatrackLabOption(event) {
        if (event.source.value && event.source.selected && event.source.value.idLab !== "0") {
            this.oldOrganisms = [];
            this.datatrackLab = event.source.value;
            let orgs = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
            this.dialogService.startDefaultSpinnerDialog();
            // this.showSpinner = true;
            this.getDatatracks(this.datatrackLab.idLab, "", "");
            console.log("datatrack lab");
        }
    }

    selectDatatrackOrgOption(event) {
        if (event != undefined && event.source.value && event.source.value.idLab !== "0") {
            this.organism = event.source.value;
            let genomeBuilds = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.GENOME_BUILD);
            this.genomeBuildList = genomeBuilds.filter(gen => {
                if (gen.isActive === "Y" && !(gen.value === "")) {
                    return gen.idOrganism === this.organism.idOrganism;
                }
                return false;
            });
            if (this.datatrackLab) {
            this.getDatatracks(this.datatrackLab.idLab, this.organism.idOrganism, "");
            } else {
                this.getDatatracks("", this.organism.idOrganism, "");
            }
        } else {
            this.resetDatatrackOrganismSelection();
        }

    }

    resetDatatrackOrganismSelection(): void {
        this.organism = null;
        this.genomeBuildList = [];
        this.getDatatracks(this.datatrackLab.idLab, "", "");
    }

    selectDatatrackGenOption(event) {
        this.genomeBuild = event.source.value;
        this.getDatatracks(this.datatrackLab.idLab, this.organism.idOrganism, this.genomeBuild.idGenomeBuild);
    }

    filterAnalysisLabs(selectedLab: any): any[] {
        let fLabs: any[];
        if (selectedLab) {
            if (selectedLab.idLab) {
                if (selectedLab.idLab === "0") {
                    this.dialogService.startDefaultSpinnerDialog();
                    // this.showSpinner = true;
                    this.resetAnalysis = true;
                    this.analysisLab = null;
                    this.analysisInput.nativeElement.blur();
                } else {
                    fLabs = this.pickerLabs.filter(lab =>
                        lab.name.toLowerCase().indexOf(selectedLab.name.toLowerCase()) >= 0);
                    return fLabs;
                }
            } else {
                fLabs = this.pickerLabs.filter(lab =>
                    lab.name.toLowerCase().indexOf(selectedLab.toLowerCase()) >= 0);
                return fLabs;
            }
        } else {
            return this.pickerLabs;
        }
    }

    filterDatatrackLabs(selectedLab: any): any[] {
        let fLabs: any[];
        if (selectedLab) {
            if (selectedLab.idLab) {
                if (selectedLab.idLab === "0") {
                    this.dialogService.startDefaultSpinnerDialog();
                    // this.showSpinner = true;
                    this.resetDatatrack = true;
                    this.datatrackLab = null;
                    this.datatrackInput.nativeElement.blur();
                } else {
                    fLabs = this.pickerLabs.filter(lab =>
                        lab.name.toLowerCase().indexOf(selectedLab.name.toLowerCase()) >= 0);
                    return fLabs;
                }
            } else {
                fLabs = this.pickerLabs.filter(lab =>
                    lab.name.toLowerCase().indexOf(selectedLab.toLowerCase()) >= 0);
                return fLabs;
            }
        } else {
            return this.pickerLabs;
        }

    }

    filterExperimentLabs(selectedLab: any): any[] {
        let fLabs: any[];
        if (selectedLab) {
            if (selectedLab.idLab) {
                if (selectedLab.idLab === "0") {
                    this.dialogService.startDefaultSpinnerDialog();
                    // this.showSpinner = true;
                    this.resetExperiment = true;
                    this.experimentLab = null;
                    this.experimentInput.nativeElement.blur();
                } else {
                    fLabs = this.pickerLabs.filter(lab =>
                        lab.name.toLowerCase().indexOf(selectedLab.name.toLowerCase()) >= 0);
                    return fLabs;
                }
            } else {
                fLabs = this.pickerLabs.filter(lab =>
                    lab.name.toLowerCase().indexOf(selectedLab.toLowerCase()) >= 0);
                return fLabs;
            }
        } else {
            return this.pickerLabs;
        }

    }

    filterOrganism(selectedOrganism: any): any[] {
        let fOrgs: any[] = [];
        if (selectedOrganism) {
            if (selectedOrganism.idOrganism) {
                fOrgs = this.organisms.filter(org =>
                    org.binomialName.toLowerCase().indexOf(selectedOrganism.binomialName.toLowerCase()) >= 0);
                return fOrgs;
            } else {
                fOrgs = this.organisms.filter(org =>
                    org.binomialName.toLowerCase().indexOf(selectedOrganism.toLowerCase()) >= 0);
                return fOrgs;
            }
        } else {
            return this.organisms;
        }
    }

    highlightExpLabFirstOption(event): void {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.expLabAutoComplete.options.first) {
            if (this.previousExperimentMatOption) {
                this.previousExperimentMatOption.setInactiveStyles();
            }
            this.expLabAutoComplete.options.first.setActiveStyles();
            this.previousExperimentMatOption = this.expLabAutoComplete.options.first;
        }
    }

    highlightAnalLabFirstOption(event): void {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.analLabAutoComplete.options.first) {
            if (this.previousAnalysisMatOption) {
                this.previousAnalysisMatOption.setInactiveStyles();
            }
            this.analLabAutoComplete.options.first.setActiveStyles();
            this.previousAnalysisMatOption = this.analLabAutoComplete.options.first;
        }
    }

    highlightDtLabFirstOption(event): void {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.dtLabAutocomplete.options.first) {
            if (this.previousDatatrackMatOption) {
                this.previousDatatrackMatOption.setInactiveStyles();
            }
            this.dtLabAutocomplete.options.first.setActiveStyles();
            this.previousDatatrackMatOption = this.dtLabAutocomplete.options.first;
        }
    }

    highlightDtOrgFirstOption(event): void {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.dtOrgAutocomplete.options.first) {
            if (this.previousOrganismMatOption) {
                this.previousOrganismMatOption.setInactiveStyles();
            }
        this.dtOrgAutocomplete.options.first.setActiveStyles();
            this.previousOrganismMatOption = this.dtOrgAutocomplete.options.first;
        }
    }

    searchExperiementsOnEnter(event): void {
        if (event.key === "Enter") {
            this.searchExperiment();
        }
    }

    searchAnalysisOnEnter(event): void {
        if (event.key === "Enter") {
            this.searchAnalysis();
        }
    }

    searchDatatrackOnEnter(event): void {
        if (event.key === "Enter") {
            this.searchDatatrack();
        }
    }


    displayOrg(org: any) {
        return org ? org.binomialName : org;
    }

    displayGen(gen: any) {
        return gen ? gen.genomeBuildName : gen;
    }

    displayLab(lab: any) {
        return lab ? lab.name : lab;
    }

    filterGenomeBuild(genomeBuild: any): any[] {
        let gBuilds: any[];
        if (genomeBuild) {
            if (genomeBuild.idGenomeBuild) {
                gBuilds = this.genomeBuildList.filter(gen =>
                    gen.genomeBuildName.toLowerCase().indexOf(genomeBuild.genomeBuildName.toLowerCase()) >= 0);
                return gBuilds;
            } else {
                gBuilds = this.genomeBuildList.filter(gen =>
                    gen.genomeBuildName.toLowerCase().indexOf(genomeBuild.toLowerCase()) >= 0);
                return gBuilds;
            }
        } else {
            return this.genomeBuildList;
        }
    }


    onTabChange(event) {
        if (event.tab.textLabel === "Experiments") {
            this.dialogService.startDefaultSpinnerDialog();
            this.isAnalysisTab = false;
            this.isDatatracksTab = false;
            this.isExperimentsTab = true;
            this.getExperiments("",'3 months');
        } else if (event.tab.textLabel === "Analysis") {
            this.dialogService.startDefaultSpinnerDialog();
            // this.showSpinner = true;
            this.isAnalysisTab = true;
            this.isDatatracksTab = false;
            this.isExperimentsTab = false;
            this.getAnalysis("",'3 months');
        } else {
            this.dialogService.startDefaultSpinnerDialog();
            // this.showSpinner = true;
            this.isAnalysisTab = false;
            this.isDatatracksTab = true;
            this.isExperimentsTab = false;
            this.getDatatracks("", "", "");
        }
    }

    getExperiments(idLab: string, frame: any) {
        var params: URLSearchParams = new URLSearchParams();

        params.set("idLab", idLab);

        params.set("allExperiments", 'Y');
        params.set("excludeClinicResearch", 'Y');
        params.set("isBioanalyzer", 'N');
        params.set("isMicroarray", 'N');
        params.set("isNextGenSeq", 'N');
        switch(frame) {
            case "In last week": {
                params.set("lastWeek", 'Y');
                break;
            }
            case "month": {
                params.set("lastMonth", 'Y');
                break;
            }
            case "3 months": {
                params.set("lastThreeMonths", 'Y');
                break;
            }
            case "year": {
                params.set("lastYear", 'Y');
                break;
            }
        }
        params.set("publicExperimentsInOtherGroups", 'Y');
        params.set("showCategory", 'N');
        params.set("showMyLabsAlways", 'N');
        params.set("showSamples", 'N');
        this.experimentsService.getProjectRequestList(params).subscribe(response => {
            console.log("requestlist");
            this.buildExperimentsTree(response);
            this.experimentTreeModel = this.experimentTreeComponent.treeModel;

            this.dialogService.stopAllSpinnerDialogs();
            // this.showSpinner = false;
            setTimeout(() => {
                this.expandChildNodes(this.experimentTreeModel);
                if(this.gnomexService.orderInitObj){
                    let id:string = "t" + this.gnomexService.orderInitObj.idTopic

                }


            });
            this.previousExpTimeFrame = frame;
        });
    }

    getAnalysis(idLab: string, frame: any) {
        var params: URLSearchParams = new URLSearchParams();

        params.set("allAnalysis", 'Y');
        params.set("labkeys", '');
        params.set("isBioanalyzer", 'N');
        params.set("isMicroarray", 'N');
        params.set("isNextGenSeq", 'N');
        switch(frame) {
            case "In last week": {
                params.set("lastWeek", 'Y');
                params.set("lastMonth", 'N');
                params.set("lastThreeMonths", 'N');
                params.set("lastYear", 'N');
                break;
            }
            case "month": {
                params.set("lastWeek", 'N');
                params.set("lastMonth", 'Y');
                params.set("lastThreeMonths", 'N');
                params.set("lastYear", 'N');
                break;
            }
            case "3 months": {
                params.set("lastWeek", 'N');
                params.set("lastMonth", 'N');
                params.set("lastThreeMonths", 'Y');
                params.set("lastYear", 'N');
                break;
            }
            case "year": {
                params.set("lastWeek", 'N');
                params.set("lastMonth", 'N');
                params.set("lastThreeMonths", 'N');
                params.set("lastYear", 'Y');
                break;
            }
        }
        params.set("showMyLabsAlways", 'N');
        params.set("idLab", idLab);

        this.analysisService.getAnalysisGroupList(params).subscribe(response => {
            this.buildAnalysisTree(response);

            this.analysisTreeModel = this.analysisTreeComponent.treeModel;

            this.dialogService.stopAllSpinnerDialogs();
            // this.showSpinner = false;
            setTimeout(() => {
                this.expandChildNodes(this.analysisTreeModel);
            });
            this.previousAnalTimeFrame = frame;
        });
    }

    getDatatracks(idLab: string, idOrganism: string, idGenomeBuild: string ) {
        var params: URLSearchParams = new URLSearchParams();

        params.set("isVisibilityInstitute", 'Y');
        params.set("isVisibilityPublic", 'Y');
        params.set("isVisibilityOwner", 'Y');
        params.set("isVisibilityMembers", 'Y');
        params.set("idOrganism", idOrganism);
        params.set("idGenomeBuild", idGenomeBuild);
        params.set("idLab", idLab);
        if (!(params === this.previousURLParams)) {
            this.datatrackService.getDataTrackList(params).subscribe(response => {
                this.buildDatatracksTree(response);

                this.datatrackTreeModel = this.datatrackTreeComponent.treeModel;
                this.dialogService.stopAllSpinnerDialogs();
                // this.showSpinner = false;
                this.previousURLParams = params;
                setTimeout(() => {
                    this.expandChildNodes(this.datatrackTreeModel);
                });
            });
        }
    }

    doLinkData($event) {
        this.linkDataView = true;
        this.getExperiments("",'3 months');
    }

    onMoveExperimentNode($event) {
    }

    treeUpdateData($event) {

    }

    experimentTreeOnSelect($event) {

    }

    buildExperimentsTree(response: any[]) {
        this.experimentLabs = [];
        this.experimentCount = 0;

        if (response) {
            if (!this.createSecurityAdvisorService.isArray(response)) {
                this.experimentItems = [response];
            } else {
                this.experimentItems = response;
            }
            this.experimentLabs = this.experimentLabs.concat(this.experimentItems);
            for (var lab of this.experimentItems) {
                lab.id = "l" + lab.idLab;
                lab.linkData = "link";
                lab.parentid = -1;

                lab.icon = "assets/group.png";
                // If there is a lab with no Project skip
                if (lab.Project) {
                    if (!this.createSecurityAdvisorService.isArray(lab.Project)) {
                        lab.experimentItems = [lab.Project];
                    } else {
                        lab.experimentItems = lab.Project;
                    }
                    for (var project of lab.experimentItems) {
                        project.icon = "assets/folder.png";
                        project.labId = lab.labId;
                        project.linkData = "link";
                        project.id = "p" + project.idProject;
                        project.parentid = lab.id;
                        if (project.Request) {
                            if (!this.createSecurityAdvisorService.isArray(project.Request)) {
                                project.experimentItems = [project.Request];
                            } else {
                                project.experimentItems = project.Request;
                            }
                            for (var request of project.experimentItems) {
                                if (request) {
                                    if (request.label) {
                                        request.label = request.requestNumber + '-' + request.name;
                                        request.id = "r" + request.idRequest;
                                        request.linkData = "link";
                                        request.parentid = project.id;
                                        this.experimentCount++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            this.experimentItems = [];
        }
        if (this.experimentTreeModel) {
            this.experimentTreeModel.clearFilter();
        }
        this.experimentLabel = " (" + this.experimentCount.toString() + " experiments)";
    };

    buildAnalysisTree(response: any) {
        this.analysisCount = 0;
        this.analysisLabs = [];
        this.analysisItems = [].concat(null);

        if (response && response.Lab){
            if (!this.createSecurityAdvisorService.isArray(response.Lab)) {
                this.analysisItems = [response.Lab];
            } else {
                this.analysisItems = response.Lab;
            }

            this.analysisLabs = this.analysisLabs.concat(this.analysisItems);
            this.analysisService.emitCreateAnalysisDataSubject({labs:this.analysisLabs,items:this.analysisItems});
            for (var l of this.analysisItems) {
                l.id = "l"+l.idLab;
                l.parentid = -1;
                l.linkData = "link";

                l.icon = "assets/group.png";

                if (l.AnalysisGroup) {
                    if (!this.createSecurityAdvisorService.isArray(l.AnalysisGroup)) {
                        l.analysisItems = [l.AnalysisGroup];
                    } else {
                        l.analysisItems = l.AnalysisGroup;
                    }
                    for (var p of l.analysisItems) {
                        p.icon = "assets/folder.png";
                        p.idLab = l.idLab;
                        p.linkData = "link";
                        p.id = "p"+p.idAnalysisGroup;
                        if (p.Analysis) {
                            if (!this.createSecurityAdvisorService.isArray(p.Analysis)) {
                                p.analysisItems = [p.Analysis];
                            } else {
                                p.analysisItems = p.Analysis;
                            }
                            for (var a of p.analysisItems) {
                                if (a) {
                                    if (a.label) {
                                        this.analysisCount++;
                                        var labelString: string = a.number;
                                        labelString = labelString.concat(" (");
                                        labelString = labelString.concat(a.label);
                                        labelString = labelString.concat(")");
                                        a.label = labelString;
                                        a.id = "a"+a.idAnalysis;
                                        a.linkData = "link";
                                        a.icon = "assets/map.png";
                                        a.parentid = p.idLab;
                                    }
                                }
                            }

                        }
                    }
                }
            }
        } else {
            this.analysisItems = [];
        }
        if (this.analysisTreeModel) {
            this.analysisTreeModel.clearFilter();
        }
        this.analysisLabel = " (" + this.analysisCount.toString() + " analyses)";

    };


    /*
Build the tree data
@param
 */
    buildDatatracksTree(response: any) {
        this.datatracksCount = 0;

        if (response && response.Organism) {
            this.datatrackItems = [].concat(null);
            if (!this.createSecurityAdvisorService.isArray(response.Organism)) {
                this.datatrackItems = [response.Organism];
            } else {
                this.datatrackItems = response.Organism;
            }
            for (var org of this.datatrackItems) {
                org.id = "o" + org.idOrganism;
                org.parentid = -1;
                org.linkData = "link";

                org.icon = "assets/organism.png";
                if (org.GenomeBuild) {
                    if (!this.createSecurityAdvisorService.isArray(org.GenomeBuild)) {
                        org.datatrackItems = [org.GenomeBuild];
                    } else {
                        org.datatrackItems = org.GenomeBuild;
                    }

                    for (var gNomeBuild of org.datatrackItems) {
                        if (gNomeBuild) {
                            this.assignIconToGenomeBuild(gNomeBuild);
                            gNomeBuild.labId = org.labId;
                            gNomeBuild.id = "g" + gNomeBuild.idGenomeBuild;
                            gNomeBuild.linkData = "link";
                            gNomeBuild.parentid = org.id;
                            if (gNomeBuild.DataTrack) {
                                if (!this.createSecurityAdvisorService.isArray(gNomeBuild.DataTrack)) {
                                    gNomeBuild.datatrackItems = [gNomeBuild.DataTrack];
                                } else {
                                    gNomeBuild.datatrackItems = gNomeBuild.DataTrack;
                                }
                                for (var dataTrack of gNomeBuild.datatrackItems) {
                                    if (dataTrack) {
                                        if (dataTrack.label) {
                                            this.assignIconToDT(dataTrack);
                                            dataTrack.parentid = gNomeBuild.id;
                                            dataTrack.linkData = "link";
                                        }
                                    }
                                }
                            }
                            if (gNomeBuild.DataTrackFolder) {
                                this.addDataTracksFromFolder(gNomeBuild, gNomeBuild.datatrackItems);
                            }
                        }
                    }
                }
            }
        } else {
            this.datatrackItems = [];
        }
        if (this.datatrackTreeModel) {
            this.datatrackTreeModel.clearFilter();
        }
        this.datatrackLabel = " (" + this.datatracksCount.toString() + " data tracks)";
    };

    addDataTracksFromFolder(root, datatrackItems: any[]): any[] {
        var dtItems: any[] = [];
        if (!this.createSecurityAdvisorService.isArray(root.DataTrackFolder)) {
            root.DataTrackFolder = [root.DataTrackFolder];
        }
        if (!datatrackItems) {
            datatrackItems = [];
        }

        if (!this.createSecurityAdvisorService.isArray(datatrackItems)) {
            datatrackItems = [datatrackItems];
        }
        for (var dtf of root.DataTrackFolder) {
            this.assignIconToDTFolder(dtf);
        }
        dtItems = dtItems.concat(root.DataTrackFolder);
        dtItems = dtItems.concat(datatrackItems);
        root.datatrackItems = dtItems;

        for (var dtf of root.datatrackItems) {

            if (dtf.DataTrackFolder) {
                this.assignIconToDTFolder(dtf);
                this.addDataTracksFromFolder(dtf, dtf.DataTracks);
            }
            if (dtf.DataTrack) {
                if (!this.createSecurityAdvisorService.isArray(dtf.DataTrack)) {
                    dtf.DataTrack = [dtf.DataTrack];
                }
                for (var dt of dtf.DataTrack) {
                    this.assignIconToDT(dt);
                }
                if (dtf.datatrackItems) {
                    dtf.datatrackItems = dtf.datatrackItems.concat(dtf.DataTrack);
                } else {
                    dtf.datatrackItems = dtf.DataTrack;
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
        dtf.id = "df"+dtf.idDataTrackFolder;
        if (dtf.idLab) {
            dtf.icon = "assets/folder_group.png";
        } else {
            dtf.icon = "assets/folder.png";
        }
        dtf.isDataTrackFolder = true;
    }

    expandChildNodes(model: TreeModel) {
        this.dialogService.startDefaultSpinnerDialog();
        // this.showSpinner = true;
        if (model) {
            if (this.createSecurityAdvisorService.isSuperAdmin) {
                if (model.roots) {
                    transaction(() => {
                        // loop over the nodes recursively and call expand() on each one
                        for (let node of model.roots) {
                            node.expand();
                            // let n = node;
                            // while (n = n.getFirstChild()) {
                            //     n.expand();
                            // }
                        }
                    });
                }
            } else {
                model.expandAll();
            }
        }
        setTimeout(() => {
            this.dialogService.stopAllSpinnerDialogs();
        });
        // this.showSpinner = false;
    }

    searchExperiment() {
        this.experimentTreeModel.filterNodes((node) => this.searchFn(node, this.experimentSearchText), true);
    }

    searchAnalysis() {
        this.analysisTreeModel.filterNodes((node) => this.searchFn(node, this.analysisSearchText), true);
    }

    searchDatatrack() {
        this.datatrackTreeModel.filterNodes((node) => this.searchFn(node, this.datatrackSearchText), true);
        if (this.datatrackSearchText === "") {
            this.datatrackTreeModel.collapseAll();
        }
    }

    searchFn(node: any, searchText: string): boolean {
        if (node) {
            if (node.data.label.indexOf(searchText) >= 0 ) {
                return true;
            } else {
                return false;
            }
        }
    }

    selectFrame(frame: string, mode: string) {
        switch (mode) {
            case "experiment": {
                if (frame === this.previousExpTimeFrame) {
                    this.selectedExpTimeFrame = '';
                } else {
                    this.dialogService.startDefaultSpinnerDialog();
                    // this.showSpinner = true;
                    this.getExperiments(this.experimentLab ? this.experimentLab.idLab : "", frame);
                }
                break;
            }
            case "analysis": {
                if (frame === this.previousAnalTimeFrame) {
                    this.selectedAnalTimeFrame = '';
                } else {
                    this.dialogService.startDefaultSpinnerDialog();
                    // this.showSpinner = true;
                    this.getAnalysis(this.analysisLab ? this.analysisLab.idLab : "", frame);
                }
                break;
            }
        }
    }

    onExpRadioChange(event) {
        if (event.value === this.previousExpTimeFrame) {
            this.selectedExpTimeFrame = null;
            this.getExperiments("", "");
        }
    }

    onAnalRadioChange(event) {
        if (event.value === this.previousAnalTimeFrame) {
            this.selectedAnalTimeFrame = null;
            this.getAnalysis("", "");
        }
    }
}
