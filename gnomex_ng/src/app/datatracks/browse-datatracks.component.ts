import {
  AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild
} from "@angular/core";

import {
  IActionMapping,
  ITreeOptions, KEYS,
  TREE_ACTIONS,
  TreeComponent,
  TreeModel,
  TreeNode,
} from "@circlon/angular-tree-component";
import {Subscription} from "rxjs";
import {ActivatedRoute, NavigationExtras, ParamMap, Router, UrlSegment} from "@angular/router";
import {ITreeNode} from "@circlon/angular-tree-component/lib/defs/api";
import {LabListService} from "../services/lab-list.service";
import {DataTrackService} from "../services/data-track.service";
import {MoveDataTrackComponent} from "./move-datatrack.component";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {MoveToDialogComponent, MoveToDialogResult, MoveToTarget} from "../util/move-to-dialog/move-to-dialog.component";
import * as _ from "lodash";
import {GnomexService} from "../services/gnomex.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {UtilService} from "../services/util.service";
import {HttpParams} from "@angular/common/http";
import {NavigationService} from "../services/navigation.service";
import {TreeKeyboardMoveService} from "../util/accessibility/tree-keyboard-move.service";
import {AriaAnnouncerService} from "../util/accessibility/aria-announcer.service";


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

  @ViewChild("datatracksTree", {static: false}) treeComponent: TreeComponent;
  @Output() selItem: EventEmitter<ITreeNode> = new EventEmitter();
  private navInitSubscription: Subscription;

  public options: ITreeOptions;
  public items: any[];
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
  get treeModel(): TreeModel | null {
    return this.treeComponent ? this.treeComponent.treeModel : null;
  }

  constructor(private datatracksService: DataTrackService,
              private dialogsService: DialogsService,
              private router: Router,
              private route: ActivatedRoute,
              private labListService: LabListService,
              private gnomexService: GnomexService,
              private changeDetectorRef: ChangeDetectorRef,
              private utilService: UtilService,
              private navService: NavigationService,
              private createSecurityAdvisorService: CreateSecurityAdvisorService,
              public treeKbMove: TreeKeyboardMoveService,
              private ariaAnnouncer: AriaAnnouncerService,
              private matDialog: MatDialog) {

    this.navService.navMode = this.navService.navMode !== NavigationService.USER ? NavigationService.URL : NavigationService.USER;

    this.items = [];
    this.labMembers = [];
    this.billingAccounts = [];
    this.organisms = [];

    this.dataTracksListSubscription = this.datatracksService.getDatatracksListObservable().subscribe(response => {
      this.buildTree(response);


      if (this.datatracksService.getPreviousURLParams('refreshParams') ) { // this code occurs when searching
        this.datatracksService.setPreviousURLParams('refreshParams', false);
      }

    });

  }


  private trySelectNodeFromState(): boolean {
    const model = this.treeModel;
    if (!model) { return false; } // ViewChild not ready yet
    if (!model.roots || model.roots.length === 0) { return false; } // tree not built yet

    let idVal: string = null;
    let idName: string = null;

    if (this.navService.navMode === NavigationService.URL) {
      const lastSeg = this.navService.getLastRouteSegment();

      if (lastSeg === DataTrackService.ORGANISM) {
        idName = 'idOrganism';
        idVal = this.qParamMap ? this.qParamMap.get(idName) : null;
      } else if (lastSeg === DataTrackService.GENOME_BUILD) {
        idName = 'idGenomeBuild';
        idVal = this.qParamMap ? this.qParamMap.get(idName) : null;
      } else if (lastSeg === DataTrackService.FOLDER) {
        idName = 'idDataTrackFolder';
        idVal = this.qParamMap ? this.qParamMap.get(idName) : null;
      } else if (lastSeg === DataTrackService.DATA_TRACK) {
        idName = 'idDataTrack';
        idVal = this.paramMap ? this.paramMap.get(idName) : null;
      } else {
        return true; // nothing to select; treat as done
      }

      if (!idVal) { return true; }

      const dtNode: ITreeNode = UtilService.findTreeNode(model, idName, idVal);
      if (dtNode) {
        dtNode.ensureVisible();
        dtNode.setIsActive(true);
        dtNode.scrollIntoView();
      }

      return true;
    }

    return false;
  }

  ngOnInit() {
    this.options = {
      displayField: "label",
      childrenField: "items",
      allowDrop: (element: ITreeNode, to: {parent: ITreeNode, index: number}) => {
        return to.parent.data.isDataTrackFolder && element.data.idDataTrackFolder !== to.parent.data.idDataTrackFolder;
      },
      allowDrag: (node) => !this.createSecurityAdvisorService.isGuest && (node.data.isDataTrackFolder || node.data.idDataTrack),
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
              this._kbDrop(node);
            } else {
              TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
            }
          },
          [KEYS.SPACE]: (tree: TreeModel, node: TreeNode, $event: KeyboardEvent) => {
            $event.preventDefault();
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
    this.utilService.registerChangeDetectorRef(this.changeDetectorRef);
    this.labListService.getLabList_FromBackEnd();
    this.labListSubscription = this.labListService.getLabListSubject().subscribe((response: any[]) => {
      this.labList = response;
    });
    this.trySelectNodeFromState();
  }

  ngAfterViewInit() {
    this.trySelectNodeFromState();
  }


  // ─── ARIA helpers for treeNodeTemplate (WCAG 4.1 + 4.5) ───────────────────

  public nodeRoleDesc(node: TreeNode): string | null {
    const canDrag = !this.createSecurityAdvisorService.isGuest;
    if (node.data.isDataTrackFolder) { return canDrag ? 'draggable data track folder' : 'data track folder'; }
    if (node.data.idDataTrack)       { return canDrag ? 'draggable data track'        : 'data track'; }
    if (node.data.isGenomeBuild)     { return 'genome build'; }
    if (node.data.isOrganism)        { return 'organism'; }
    return null;
  }

  public isKbDropTarget(node: TreeNode): boolean {
    if (!this.treeKbMove.isGrabbing || !this.treeModel) { return false; }
    const focused = this.treeModel.getFocusedNode() as TreeNode;
    if (!focused || focused !== node) { return false; }
    const state = this.treeKbMove.state;
    // mirrors allowDrop: must be a folder and not the node's own current folder
    return node.data.isDataTrackFolder
        && state.node.data.idDataTrackFolder !== node.data.idDataTrackFolder;
  }

  private _isKbDropInvalid(node: TreeNode): boolean {
    if (!this.treeKbMove.isGrabbing || !this.treeModel) { return false; }
    const focused = this.treeModel.getFocusedNode() as TreeNode;
    if (!focused || focused !== node) { return false; }
    return !this.isKbDropTarget(node);
  }

  // ─── Keyboard drag-and-drop (WCAG 2.1.1) ──────────────────────────────────

  /** Grabs the focused node when the user presses Space. */
  private _kbGrab(node: TreeNode): void {
    const canDrag = !this.createSecurityAdvisorService.isGuest
        && (node.data.isDataTrackFolder || node.data.idDataTrack);
    if (!canDrag) { return; }
    if (!node.isActive) {
      TREE_ACTIONS.TOGGLE_ACTIVE(this.treeModel, node, {} as any);
    }
    this.treeKbMove.grab(node, this.treeModel);
  }

  /**
   * Attempts to drop the grabbed data track onto `targetNode`.
   * Opens the same MoveDataTrackComponent dialog as mouse drag-and-drop.
   */
  private _kbDrop(targetNode: TreeNode): void {
    const state = this.treeKbMove.state;
    if (!state) { return; }

    const allowDrop = (element: ITreeNode, { parent }: { parent: ITreeNode }) =>
        parent.data.isDataTrackFolder
        && element.data.idDataTrackFolder !== parent.data.idDataTrackFolder;

    const dropped = this.treeKbMove.tryDrop(targetNode, allowDrop);
    if (dropped) {
      // Reuse the existing mouse drop handler with a synthetic event object
      this.moveNode(this.treeModel, targetNode, {} as any, {
        from: state.node,
        to: { parent: targetNode, index: 0 }
      });
    }
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
        // WCAG 4.1.3: announce the confirmed move to screen readers.
        const srcLabel = currentItem.label || "Data track";
        const tgtLabel = targetItem.label  || "folder";
        this.ariaAnnouncer.announce(`${srcLabel} moved to ${tgtLabel}.`);

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

  // ─── Phase 5: Focus management after drop ─────────────────────────────────

  /**
   * After a backend refresh triggered by a move/create operation,
   * `datatracksService.activeNodeToSelect` holds the attribute+value of the
   * node that should receive focus.  Consume it here and clear it so it only
   * fires once per refresh cycle.
   */
  treeUpdateData(event) {
    const sel = this.datatracksService.activeNodeToSelect;
    if (sel) {
      const node = UtilService.findTreeNode(this.treeModel, sel.attribute, sel.value);
      if (node) {
        this.datatracksService.activeNodeToSelect = null;
        node.setIsActive(true);
        node.ensureVisible();
        node.scrollIntoView();
      }
    }
  }

  // ─── Phase 3: Single-pointer "Move to…" alternative (WCAG 2.5.7) ──────────

  /**
   * Collects all data-track folders in the tree that are valid drop targets
   * for `sourceNode` (i.e. folders other than the source node's own folder).
   */
  private _collectDtMoveTargets(sourceNode: TreeNode): MoveToTarget[] {
    const targets: MoveToTarget[] = [];
    const srcFolderId: string = sourceNode.data.idDataTrackFolder;

    const walk = (nodes: TreeNode[], breadcrumb: string) => {
      for (const n of nodes || []) {
        if (n.data.isDataTrackFolder) {
          // Exclude the source node's current parent folder
          if (n.data.idDataTrackFolder !== srcFolderId) {
            targets.push({ label: n.data.label, path: breadcrumb || undefined, data: n.data });
          }
          walk(n.children || [], n.data.label);
        } else {
          walk(n.children || [], breadcrumb);
        }
      }
    };

    if (this.treeModel) { walk(this.treeModel.roots as TreeNode[], ''); }
    return targets;
  }

  /**
   * Opens the "Move to…" dialog for a draggable data-track node.
   * Satisfies WCAG 2.5.7 by providing a single-pointer alternative to drag.
   */
  public openMoveDialog(node: TreeNode, $event: MouseEvent): void {
    $event.stopPropagation();
    const canDrag = !this.createSecurityAdvisorService.isGuest
        && (node.data.isDataTrackFolder || node.data.idDataTrack);
    if (!canDrag) { return; }

    const targets = this._collectDtMoveTargets(node);
    const config = new MatDialogConfig();
    config.width = '35em';
    config.data = { sourceLabel: node.data.label, targets, allowCopy: false };

    this.matDialog.open(MoveToDialogComponent, config)
        .afterClosed()
        .subscribe((result: MoveToDialogResult | null) => {
            if (!result) { return; }
            this.moveNode(this.treeModel, this._findTreeNode(result.target.data), {} as any, {
                from: node,
                to: { parent: this._findTreeNode(result.target.data), index: 0 }
            });
        });
  }

  /** Helper to find a live TreeNode from a data object via idDataTrackFolder or idDataTrack. */
  private _findTreeNode(data: any): TreeNode {
    if (!this.treeModel) { return null; }
    if (data.idDataTrackFolder) {
      return UtilService.findTreeNode(this.treeModel, 'idDataTrackFolder', data.idDataTrackFolder) as TreeNode;
    }
    if (data.idDataTrack) {
      return UtilService.findTreeNode(this.treeModel, 'idDataTrack', data.idDataTrack) as TreeNode;
    }
    return null;
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
      this.items.sort(UtilService.sortObjectAlphabetically("name"));

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
          (<any[]>org.items).sort(UtilService.sortObjectAlphabetically("label"));

          for (let gNomeBuild of org.items) {
            if (gNomeBuild) {
              this.assignIconToGenomeBuild(gNomeBuild);
              gNomeBuild.labId = org.labId;
              this.addDataTracksFromFolder(gNomeBuild, gNomeBuild.DataTrack);
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
    if (!items) {
      items = [];
    }

    if(!root.DataTrackFolder){
      root.DataTrackFolder = [];
    }


    if (!this.isArray(root.DataTrackFolder)) {
      root.DataTrackFolder = [root.DataTrackFolder];
    }
    (<any[]>root.DataTrackFolder).sort(UtilService.sortObjectAlphabetically("name"));

    if (!this.isArray(items)) {
      items = [items];
    }
    items.sort(UtilService.sortObjectAlphabetically("number"));

    for (let dtf of root.DataTrackFolder) {
      this.assignIconToDTFolder(dtf);
    }
    for (let dt of items) {
      this.assignIconToDT(dt);
    }

    dtItems = dtItems.concat(root.DataTrackFolder);
    dtItems = dtItems.concat(items);
    root.items = dtItems;


    for (let dtf of root.items) {
      this.addDataTracksFromFolder(dtf, dtf.DataTrack);
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
