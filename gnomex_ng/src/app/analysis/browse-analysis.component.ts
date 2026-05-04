import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, ElementRef,
  OnDestroy,
  OnInit, Renderer2,
  ViewChild,
} from "@angular/core";
import {
  ITreeOptions, KEYS,
  TREE_ACTIONS,
  TreeComponent,
  TreeModel,
  TreeNode,
} from "@circlon/angular-tree-component";

import * as _ from "lodash";
import {Subscription} from "rxjs";
import {ActivatedRoute, NavigationEnd, NavigationExtras, ParamMap, Router} from "@angular/router";
import {AnalysisService} from "../services/analysis.service";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {DeleteAnalysisComponent} from "./delete-analysis.component";
import {ITreeNode} from "@circlon/angular-tree-component/lib/defs/api";
import {LabListService} from "../services/lab-list.service";
import {CreateAnalysisComponent} from "./create-analysis.component";
import {CreateAnalysisGroupComponent} from "./create-analysis-group.component";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {GnomexService} from "../services/gnomex.service";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {UtilService} from "../services/util.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../services/constants.service";
import {filter, first} from "rxjs/operators";
import {NavigationService} from "../services/navigation.service";
import {TreeKeyboardMoveService} from "../util/accessibility/tree-keyboard-move.service";
import {AriaAnnouncerService} from "../util/accessibility/aria-announcer.service";
import {MoveToDialogComponent, MoveToDialogResult, MoveToTarget} from "../util/move-to-dialog/move-to-dialog.component";


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

        .vertical-spacer {
            height: 0.3em;
            min-height: 0.3em;
        }

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
        .allow-line-breaks {
            white-space: pre-line;
        }
        .background-lightyellow {
            background-color: lightyellow;
        }

    `]
})

export class BrowseAnalysisComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild("analysisTree", {static: false}) treeComponent: TreeComponent;
    public treeHasDomFocus = false;

    public readonly DRAG_AND_DROP_HINT: string =
        "Drag and drop to move analyses to another lab and/or group. " +
        "Hold Ctrl while dragging to copy to multiple groups. " +
        "Keyboard alternative: navigate to an analysis with arrow keys, " +
        "press F2, then press Enter on the Move button to open the move dialog.";

    public readonly KB_MOVE_INSTRUCTIONS: string =
        "To move an analysis without dragging: navigate to it with arrow keys, " +
        "press F2 on an analysis, " +
        "then press Enter on the Move button to open the move dialog.";
    public showDragDropHint: boolean = false;
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
    private billingAccounts: any;
    private selectedItem: ITreeNode;
    private analysisGroupListSubscription: Subscription;
    private labList: any[] = [];
    private labListString: any[] = [];
    private selectedIdLab: any;
    private selectedIdAnalysisGroup: any;
    private parentProject: any;
    private navEndSubscription:Subscription;
    private labListSubscription: Subscription;
    private qParamMap: ParamMap;
    private paramMap: ParamMap;
    private _treeModel: TreeModel | null = null;
    /** Set before refreshAnalysisGroupList_fromBackend(); consumed in treeUpdateData (Phase 5). */
    private _focusIdAfterRefresh: string | null = null;

    public get treeModel(): TreeModel | null {
      if (!this._treeModel && this.treeComponent) {
        this._treeModel = this.treeComponent.treeModel;
      }
      return this._treeModel;
    }


    ngOnInit() {
        this.navService.navMode = this.navService.navMode !== NavigationService.USER ? NavigationService.URL : NavigationService.USER;

        this.utilService.registerChangeDetectorRef(this.changeDetectorRef);
        this.options = {
          idField: "analysisTreeId",
          displayField: "label",
          childrenField: "items",
          useVirtualScroll: true,
          nodeHeight: 22,
          allowDrop: (element: any, to: {parent: TreeNode, index: number}) => {
            return !!to.parent.data.idAnalysisGroup;
          },
          allowDrag: (node: any) => !this.createSecurityAdvisorService.isGuest && node.isLeaf && node.data.idAnalysis,
          nodeClass: (node: TreeNode) => {
            let cls = "icon-" + node.data.icon;
            if (this.treeKbMove.isGrabbedNode(node)) { cls += " keyboard-grabbed"; }
            if (this.isKbDropTarget(node))           { cls += " keyboard-drop-target"; }
            else if (this._isKbDropInvalid(node))    { cls += " keyboard-drop-invalid"; }
            return cls;
          },
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
            },
            keys: {
              [KEYS.ENTER]: (tree: TreeModel, node: TreeNode, $event: KeyboardEvent) => {
                if (this.treeKbMove.isGrabbing) {
                  this._kbDrop(node, $event.ctrlKey);
                } else {
                  TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
                }
              },
              [KEYS.SPACE]: (tree: TreeModel, node: TreeNode, $event: KeyboardEvent) => {
                $event.preventDefault();
                TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
                this._kbGrab(node);
              },
              // Escape (keyCode 27) is not in the KEYS enum; use raw code
              [27]: (tree: TreeModel, node: TreeNode, $event: KeyboardEvent) => {
                if (this.treeKbMove.isGrabbing) {
                  this.treeKbMove.cancel();
                }
              },
              [KEYS.RIGHT]: undefined,
              [KEYS.LEFT]: undefined,
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
                this.dialogsService.alert("No results", "Data Not Found");
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


            if (this.analysisService.getAnalysisPanelParam('refreshParams')) { // If user is searching or removing from grid
                if (this.treeModel && this.treeModel.getActiveNode()) {
                    if (this.analysisService.isDeleteFromGrid) { // When removing analysis from a selected group, remain in the group after removed
                        this.analysisService.setActiveNodeId = this.treeModel.getActiveNode().data.id;
                        this.analysisService.isDeleteFromGrid = false;
                    } else { // Refresh to initial state when search button clicked
                        this.treeModel.getActiveNode().setIsActive(false);
                        this.treeModel.setFocusedNode(null);
                    }
                }

                if (!this.treeModel.getActiveNode()) {
                    this.disableNewAnalysis = true;
                    this.disableNewAnalysisGroup = true;
                    this.disableDelete = true;
                }

                this.analysisService.setAnalysisPanelParam("refreshParams", false);

            }


            setTimeout(() => {

              const model = this.treeComponent ? this.treeComponent.treeModel : null;
              if (!model) {
                // view not ready yet; skip
                this.dialogsService.stopAllSpinnerDialogs();
                return;
              }

              model.expandAll();
              if (this.navService.navMode === NavigationService.URL) {
                const activatedRoute = this.navService.getChildActivateRoute(this.route);
                if (activatedRoute) {
                  this.paramMap = activatedRoute.snapshot.paramMap;
                  this.qParamMap = activatedRoute.snapshot.queryParamMap;
                }

                let idName = "";
                let idVal = "";
                if (this.paramMap && this.paramMap.get("idAnalysis")) {
                  idName = "idAnalysis";
                  idVal = this.paramMap.get("idAnalysis");
                } else if (this.qParamMap && this.qParamMap.get("idAnalysisGroup")) {
                  idName = "idAnalysisGroup";
                  idVal = this.qParamMap.get("idAnalysisGroup");
                } else if (this.qParamMap && this.qParamMap.get("idLab")) {
                  idName = "idLab";
                  idVal = this.qParamMap.get("idLab");
                }

                const node = UtilService.findTreeNode(model, idName, idVal);
                if (node) {
                  node.setIsActive(true);
                  node.scrollIntoView();
                }
              } else if (this.analysisService.setActiveNodeId) {
                const node = this.findNodeById(this.analysisService.setActiveNodeId);
                this.analysisService.setActiveNodeId = null;

                if (node) {
                  node.setIsActive(true);
                  node.scrollIntoView();
                }
              }

              this.dialogsService.stopAllSpinnerDialogs();
          });
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
    // ViewChild is now available
    // (static:false means AFTER view init)
    // Prefer direct access to avoid stale references
    if (this.treeComponent) {
      // Optional: trigger initial expand if desired
      this.treeComponent.treeModel.expandAll();
    }
    this.changeDetectorRef.detectChanges();
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
                private navService: NavigationService,
                public createSecurityAdvisorService: CreateSecurityAdvisorService,
                public treeKbMove: TreeKeyboardMoveService,
                private ariaAnnouncer: AriaAnnouncerService) {


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

  onTreeFocusIn() {
    this.treeHasDomFocus = true;
    if (this.treeModel && !this.treeModel.focusedNode) {
      this.treeModel.focusNextNode();
    }
  }


    onTreeKeydown(event: KeyboardEvent): void {
        console.log("it doesn't fire");
        if (event.key === 'Enter') {
          const focusedNode = this.treeModel.getFocusedNode();
          if (focusedNode && focusedNode.hasChildren) {
            focusedNode.toggleExpanded();
          }
        }
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
            (<any[]>this.items).sort(UtilService.sortObjectAlphabetically("labName"));
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
                            (<any[]>p.items).sort(UtilService.sortOrderIDNumerically("number"));
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
        // Phase 5: focus the moved analysis after a backend-triggered tree rebuild.
        if (this._focusIdAfterRefresh) {
            const node = UtilService.findTreeNode(this.treeModel, 'idAnalysis', this._focusIdAfterRefresh);
            if (node) {
                this._focusIdAfterRefresh = null;
                node.setIsActive(true);
                node.ensureVisible();
                node.scrollIntoView();
            }
        }
    }

    // ─── Phase 3: Single-pointer "Move to…" alternative (WCAG 2.5.7) ──────────

    /**
     * Collects all analysis-group nodes that are valid drop targets for the
     * given analysis node.
     */
    private _collectAnalysisMoveTargets(sourceNode: TreeNode): MoveToTarget[] {
        const targets: MoveToTarget[] = [];
        const srcGroupId: string = sourceNode.parent ? sourceNode.parent.data.idAnalysisGroup : null;

        const walk = (nodes: TreeNode[], labLabel?: string) => {
            for (const n of nodes || []) {
                if (n.data.idAnalysisGroup) {
                    targets.push({
                        label: n.data.name || n.data.label,
                        path: labLabel || undefined,
                        data: n.data,
                    });
                    walk(n.children || [], labLabel);
                } else if (n.data.labName || n.data.idLab) {
                    walk(n.children || [], n.data.labName || n.data.name || n.data.label);
                } else {
                    walk(n.children || [], labLabel);
                }
            }
        };

        if (this.treeModel) { walk(this.treeModel.roots as TreeNode[], ''); }
        return targets;
    }

    /**
     * Opens the "Move to…" dialog for a draggable analysis node.
     * Satisfies WCAG 2.5.7 by providing a single-pointer alternative to drag.
     * The "Copy instead of move" checkbox mirrors Ctrl+drag copy behaviour.
     */
    public openMoveDialog(node: TreeNode, $event: MouseEvent): void {
        $event.stopPropagation();
        if (!node.isLeaf || !node.data.idAnalysis) { return; }
        if (this.createSecurityAdvisorService.isGuest) { return; }

        const targets = this._collectAnalysisMoveTargets(node);
        const config = new MatDialogConfig();
        config.width = '35em';
        config.data = { sourceLabel: node.data.label, targets, allowCopy: true };

        this.dialog.open(MoveToDialogComponent, config)
            .afterClosed()
            .subscribe((result: MoveToDialogResult | null) => {
                if (!result) { return; }
                const targetNode = UtilService.findTreeNode(
                    this.treeModel, 'idAnalysisGroup', result.target.data.idAnalysisGroup
                ) as TreeNode;
                if (!targetNode) { return; }

                if (!node.isActive) {
                    TREE_ACTIONS.TOGGLE_ACTIVE(this.treeModel, node, {} as any);
                }
                const fakeEvent = { ctrlKey: result.copy };
                this.moveNode(this.treeModel, targetNode, fakeEvent, {
                    from: node,
                    to: { parent: targetNode, index: 0 }
                });
            });
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
            configuration.autoFocus = false;
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

    dragDropHintClicked(): void {
        this.showDragDropHint = !this.showDragDropHint;
    }

    treeOnSelect(event: any) {
        // If selecting multiple analyses (for dragging-and-dropping, for example)
        // improve performance by reducing unnecessary loading
      console.log('treeOnSelect event:', event);
      console.log('treeOnSelect event.originalEvent:', event.originalEvent);
      console.log('treeOnSelect event.$event:', event.$event);
      if (this.treeModel.getActiveNodes().length > 1) {
            return;
      }

      this.selectedItem = event.node;
      this.selectedIdLab = this.selectedItem.data.idLab;
      this.selectedIdAnalysisGroup = null;
      let idAnalysis = this.selectedItem.data.idAnalysis;
      let idAnalysisGroup = this.selectedItem.data.idAnalysisGroup;
      let idLab = this.selectedItem.data.idLab;


      let analysisGroupListNode: Array<any> = _.cloneDeep(this.selectedItem.data);
      this.analysisService.emitAnalysisOverviewList(analysisGroupListNode);
      let navArray: Array<any> = [];
      let navExtras: NavigationExtras = {};
      if(this.navService.navMode === NavigationService.USER){
          //Lab
          if (this.selectedItem.level === 1) {
              this.analysisService.selectedNodeId = event.node.data.id;
              this.disableNewAnalysis = false;
              this.disableNewAnalysisGroup = false;
              this.disableDelete = true;
              navArray = ["/analysis", "overview"];
              navExtras = {queryParams: {idLab: idLab, idAnalysisGroup: null}};

              //AnalysisGroup
          } else if (this.selectedItem.level === 2) {
              this.parentProject = event.node.parent;
              this.analysisService.selectedNodeId = event.node.data.id;
              this.selectedIdAnalysisGroup = this.selectedItem.data.idAnalysisGroup;
              this.disableNewAnalysis = false;
              this.disableDelete = false;
              this.disableNewAnalysisGroup = false;
              navArray = ["/analysis", "overview"];
              navExtras = {queryParams: {idLab: idLab, idAnalysisGroup: idAnalysisGroup}};

              //Analysis
          } else if (this.selectedItem.level === 3) {
              navArray = ["/analysis", "detail", idAnalysis];
              this.parentProject = event.node.parent;
              this.selectedIdAnalysisGroup = this.parentProject.data.idAnalysisGroup;
              this.disableNewAnalysis = false;
              this.disableDelete = false;
              this.disableNewAnalysisGroup = false;
              navExtras = {queryParams: {idLab: idLab, idAnalysisGroup: this.selectedIdAnalysisGroup}};
          }
          navExtras.relativeTo = this.route;
          navExtras.queryParamsHandling = 'merge';

          this.dialogsService.startDefaultSpinnerDialog();
          this.router.navigate(navArray,navExtras);
      }else{
          this.navService.emitResetNavModeSubject("detail");
          this.navService.emitResetNavModeSubject("overview");
          this.dialogsService.removeSpinnerWorkItem();
      }

    }

    ngOnDestroy(): void {
      this.utilService.removeChangeDetectorRef(this.changeDetectorRef);
      this.analysisGroupListSubscription.unsubscribe();
      this.navEndSubscription.unsubscribe();
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

    // ─── ARIA helpers for treeNodeTemplate (WCAG 4.1 + 4.5) ─────────────────

    public nodeRoleDesc(node: TreeNode): string | null {
        if (node.data.idAnalysis) {
            const draggable = !this.createSecurityAdvisorService.isGuest && node.isLeaf;
            return draggable ? 'draggable analysis' : 'analysis';
        }
        if (node.data.idAnalysisGroup) { return 'analysis group folder'; }
        if (node.data.idLab)           { return 'lab group'; }
        return null;
    }

    public isKbDropTarget(node: TreeNode): boolean {
        if (!this.treeKbMove.isGrabbing || !this.treeModel) { return false; }
        const focused = this.treeModel.getFocusedNode() as TreeNode;
        if (!focused || focused !== node) { return false; }
        return !!node.data.idAnalysisGroup; // mirrors allowDrop
    }

    private _isKbDropInvalid(node: TreeNode): boolean {
        if (!this.treeKbMove.isGrabbing || !this.treeModel) { return false; }
        const focused = this.treeModel.getFocusedNode() as TreeNode;
        if (!focused || focused !== node) { return false; }
        return !node.data.idAnalysisGroup; // lab and individual analysis nodes
    }

    // ─── Keyboard drag-and-drop (WCAG 2.1.1) ────────────────────────────────

    /**
     * Initiates a keyboard grab on `node` if the node is draggable.
     * Called when the user presses Space on a tree node.
     */
    private _kbGrab(node: TreeNode): void {
        const canDrag = !this.createSecurityAdvisorService.isGuest
            && node.isLeaf
            && node.data.idAnalysis;
        if (!canDrag) { return; }
        this.treeKbMove.grab(node, this.treeModel);
    }

    /**
     * Attempts to drop the grabbed analysis onto `targetNode`.
     * Mirrors the business logic in the private `moveNode` drop handler.
     * Called when the user presses Enter (or Ctrl+Enter for copy) while grabbing.
     */
    private _kbDrop(targetNode: TreeNode, ctrlKey: boolean): void {
        const state = this.treeKbMove.state;
        if (!state) { return; }

        const allowDrop = (element: any, { parent }: { parent: TreeNode }) =>
            !!parent.data.idAnalysisGroup;

        const dropped = this.treeKbMove.tryDrop(targetNode, allowDrop, ctrlKey);
        if (dropped) {
            // Ensure only the grabbed node is active so moveNode acts on it alone
            if (!state.node.isActive) {
                TREE_ACTIONS.TOGGLE_ACTIVE(this.treeModel, state.node, {} as any);
            }
            const fakeEvent = { ctrlKey };
            this.moveNode(this.treeModel, targetNode, fakeEvent, {
                from: state.node,
                to: { parent: targetNode, index: 0 }
            });
        }
    }

    private moveNode: (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => void = (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => {
        this.dialogsService.confirm("Are you sure you want to move this analysis to " + node.data.name + " Folder?").pipe(first())
            .subscribe(action =>{
                if(action){
                    let idLab: string = node.data.idLab;
                    let idAnalysisGroup: string = node.data.idAnalysisGroup;
                    let analyses: any[] = [];
                    for (let n of tree.getActiveNodes()) {
                        analyses.push(n.data);
                    }
                    let isCopyMode: boolean = $event.ctrlKey;

                    this.analysisService.moveAnalysis(idLab, idAnalysisGroup, analyses, isCopyMode).subscribe((result: any) => {
                        if (result && result.result === "SUCCESS") {
                            // WCAG 4.1.3: announce move/copy result to screen readers.
                            const targetLabel = node.data.name || node.data.label || "group";
                            const verb        = isCopyMode ? "copied" : "moved";
                            const srcLabel    = analyses.length === 1
                                ? (analyses[0].label || "Analysis")
                                : `${analyses.length} analyses`;
                            this.ariaAnnouncer.announce(`${srcLabel} ${verb} to ${targetLabel}.`);

                            // Phase 5: focus the moved analysis after the tree rebuilds.
                            if (!isCopyMode && analyses.length === 1) {
                                this._focusIdAfterRefresh = analyses[0].idAnalysis;
                            }
                            this.analysisService.refreshAnalysisGroupList_fromBackend();
                            if (result.invalidPermission) {
                                this.dialogsService.alert(result.invalidPermission, null, DialogType.WARNING);
                            }
                        }
                    }, (err: IGnomexErrorResponse) => {
                    });
                }
            });
    }
}
