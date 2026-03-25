import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter, Inject,
    Input,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
import {Subscription} from "rxjs";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService, DialogType} from "../popup/dialogs.service";
import {GnomexService} from "../../services/gnomex.service";
import {AnalysisService} from "../../services/analysis.service";
import {
  IActionMapping,
  ITreeOptions,
  KEYS,
  TREE_ACTIONS,
  TreeComponent,
  TreeModel,
  TreeNode
} from "@circlon/angular-tree-component";
import {ConstantsService} from "../../services/constants.service";
import {first} from "rxjs/operators";
import {ITreeModel,ITreeNode} from "@circlon/angular-tree-component/lib/defs/api";
import {FormBuilder, FormGroup} from "@angular/forms";
import {TabChangeEvent} from "../tabs/index";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {MoveToDialogComponent, MoveToDialogResult, MoveToTarget} from "../move-to-dialog/move-to-dialog.component";
import {NameFileDialogComponent} from "./name-file-dialog.component";
import {FileService} from "../../services/file.service";
import {IFileParams} from "../interfaces/file-params.model";
import {ActionType} from "../interfaces/generic-dialog-action.model";
import {UtilService} from "../../services/util.service";
import {TreeKeyboardMoveService} from "../accessibility/tree-keyboard-move.service";
import {AriaAnnouncerService} from "../accessibility/aria-announcer.service";
import * as _ from "lodash";
//import {changesFromRecord} from "ng-dynamic-component/dynamic/util";



@Component({
    selector: "organize-file",
    templateUrl: "./organize-files.component.html",
    styles: [`
        .no-padding-dialog {
            padding: 0;
        }
        .truncate{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .no-overflow  { overflow: hidden; }

        .secondary-action {
            background-color: var(--sidebar-footer-background-color);
            font-weight: bolder;
            color: var(--bluewarmvivid-medlight);
            border: var(--bluewarmvivid-medlight)  solid 1px;
        }
    `]
})
export class OrganizeFilesComponent implements OnInit, AfterViewInit{
    private manageFileSubscript: Subscription;
    public currentLab:any;
    public showSpinner:boolean = false;
    public labList:any[] = [];
    public analysis:any;
    public organizeOpts:ITreeOptions;
    public uploadOpts:ITreeOptions;
    public organizeFiles: any[];
    public uploadFiles:any[];
    public organizeSelectedNode:ITreeNode;
    public uploadSelectedNode:ITreeNode;
    public formGroup: FormGroup;
    public removedChildren: Set<string> = new Set();
    public splitOrgSize:number;
    public showFileTrees: boolean =  false;
    public disableRemove:boolean = true;
    public disableRename:boolean = true;
    public actionType: any = ActionType.SECONDARY;
    private isLastSelectOrgTree:boolean;


    @ViewChild('organizeTree', {static: false})
    private organizeTree: TreeComponent;
    @ViewChild('uploadTree', {static: false})
    private uploadTree: TreeComponent;

    @Output() closeDialog = new EventEmitter<TabChangeEvent>();
    @Input('manageData') data: IFileParams;

    public readonly organizeHelp :string =  "Drag uploaded file into one of the folders on the right." +
        "Protected files (red) cannot be moved or deleted.";

    // ─── Keyboard drag-and-drop (WCAG 2.1.1) ──────────────────────────────────

    /**
     * Initiates a keyboard grab on `node`.
     * Draggability rules differ between the upload tree (PROTECTED !== 'Y')
     * and the organize tree (PROTECTED !== 'Y' && level > 1).
     */
    private _kbGrab(tree: TreeModel, node: TreeNode): void {
        const isOrg = this.organizeTree && tree === this.organizeTree.treeModel;
        const isProtected = node.data.PROTECTED === 'Y';
        if (isProtected) { return; }
        if (isOrg && node.level <= 1) { return; } // root of organize tree is not draggable

        this.isLastSelectOrgTree = isOrg;
        if (!node.isActive) {
            TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, {} as any);
        }
        this.treeKbMove.grab(node, tree);
    }

    /**
     * Attempts to drop the grabbed file/folder onto `targetNode` in the organize tree.
     * Only the organize tree accepts drops; dragging back to the upload tree is not permitted.
     */
    private _kbDrop(targetTree: TreeModel, targetNode: TreeNode): void {
        const state = this.treeKbMove.state;
        if (!state) { return; }

        // Only allow dropping into the organize tree
        const organizeModel = this.organizeTree ? this.organizeTree.treeModel : null;
        if (!organizeModel || targetTree !== organizeModel) {
            this.treeKbMove.cancel();
            return;
        }

        // Check allowDrop: must be root or a directory node
        const isRootOrDir =
            (organizeModel.roots[0] && organizeModel.roots[0].id === targetNode.id)
            || targetNode.data.type === 'dir';

        const dropped = this.treeKbMove.tryDrop(targetNode, () => isRootOrDir);
        if (!dropped) { return; }

        // Prevent dropping a folder into itself
        if (state.node === targetNode) { return; }

        const fromTree: TreeModel = state.tree;
        const cloneNodes = UtilService.getFileNodesToMove(fromTree);

        if (targetNode.data.FileDescriptor) {
            targetNode.data.FileDescriptor.push(...cloneNodes);
        } else {
            targetNode.data.FileDescriptor = cloneNodes;
        }

        // Remove the grabbed node(s) from their source tree
        this.isLastSelectOrgTree = fromTree === organizeModel;
        this.attemptRemove(true);

        organizeModel.update();
        this.formGroup.markAsDirty();

        // Phase 5: focus the destination folder after the tree re-renders.
        setTimeout(() => {
            if (targetNode) { targetNode.setActiveAndVisible(); }
        }, 0);
    }

    private moveNode: (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => void = (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => {
        let fromTree: TreeModel = from.treeModel;

        if(fromTree){
            // stop if user is trying to drag folder into it's self
            for (let moveNode of fromTree.getActiveNodes()){
                if(moveNode === to.parent){
                    return;
                }
            }

            let cloneNodes = UtilService.getFileNodesToMove(fromTree);

            if(to.parent.data.FileDescriptor){
                to.parent.data.FileDescriptor.push(...cloneNodes);
            }else{
                to.parent.data.FileDescriptor = cloneNodes;
            }

            this.attemptRemove(true);

            this.organizeTree.treeModel.update();
            this.formGroup.markAsDirty();

            // WCAG 4.1.3: announce the move to screen readers.
            const movedNames  = cloneNodes
                .map((n: any) => n.displayName || n.label || 'file')
                .join(', ');
            const targetLabel = to.parent.data.displayName || to.parent.data.label || 'folder';
            this.ariaAnnouncer.announce(`${movedNames} moved to ${targetLabel}.`);
        }
    };

    // ─── Phase 4: ARIA markup helpers ─────────────────────────────────────────

    /**
     * Returns a human-readable role description for `aria-roledescription`.
     * `isUploadTree` distinguishes the left "Upload Files" panel (where all
     * items may be draggable) from the right "Folder" panel (where only
     * items at level > 1 are draggable).
     */
    public nodeRoleDesc(node: TreeNode, isUploadTree: boolean = false): string | null {
        const isDir = node.data.type === 'dir';
        const isProtected = node.data.PROTECTED === 'Y';
        if (isUploadTree) {
            if (isProtected) { return isDir ? 'protected folder' : 'protected file'; }
            return isDir ? 'draggable folder' : 'draggable file';
        }
        // Organize (right) tree
        if (node.level <= 1) { return isDir ? 'root folder' : null; }
        if (isProtected) { return isDir ? 'protected folder' : 'protected file'; }
        return isDir ? 'draggable folder' : 'draggable file';
    }

    /**
     * Returns true when keyboard grab is active and `node` is the focused
     * node in the organize tree (the only tree that accepts drops).
     */
    public isKbDropTarget(node: TreeNode): boolean {
        if (!this.treeKbMove.isGrabbing || !this.organizeTree) { return false; }
        const organizeModel = this.organizeTree.treeModel;
        const focused = organizeModel.getFocusedNode() as TreeNode;
        if (focused !== node) { return false; }
        // Must be root or a directory to accept a drop
        return (organizeModel.roots[0] && organizeModel.roots[0].id === node.id)
            || node.data.type === 'dir';
    }

    /** Shared nodeClass function applied to both uploadOpts and organizeOpts. */
    private _nodeClass = (node: TreeNode): string => {
        let cls = node.data.type === 'dir' ? 'icon-folder' : 'icon-file';
        if (this.treeKbMove.isGrabbedNode(node)) { cls += ' keyboard-grabbed'; }
        if (this.isKbDropTarget(node))           { cls += ' keyboard-drop-target'; }
        return cls;
    };

    // ─── Phase 3: Single-pointer "Move to…" alternative (WCAG 2.5.7) ──────────

    /**
     * Collects all valid destination folders from the organize tree:
     * the root node and any sub-directory nodes.
     */
    private _collectOrganizeMoveTargets(): MoveToTarget[] {
        const targets: MoveToTarget[] = [];
        if (!this.organizeTree) { return targets; }
        const organizeModel = this.organizeTree.treeModel;

        const walk = (nodes: TreeNode[], parentLabel?: string) => {
            for (const n of nodes || []) {
                if ((organizeModel.roots[0] && organizeModel.roots[0].id === n.id) || n.data.type === 'dir') {
                    targets.push({
                        label: n.data.displayName || n.data.label,
                        path: parentLabel || undefined,
                        data: n.data,
                    });
                    walk(n.children || [], n.data.displayName || n.data.label);
                }
            }
        };

        walk(organizeModel.roots as TreeNode[], '');
        return targets;
    }

    /**
     * Opens the "Move to…" dialog for a node in the upload tree.
     * Satisfies WCAG 2.5.7 by providing a single-pointer alternative to drag.
     */
    public openMoveDialog(node: TreeNode, $event: MouseEvent): void {
        $event.stopPropagation();
        if (node.data.PROTECTED === 'Y') { return; }

        const targets = this._collectOrganizeMoveTargets();
        const config = new MatDialogConfig();
        config.width = '35em';
        config.data = { sourceLabel: node.data.displayName || node.data.label, targets, allowCopy: false };

        this.matDialog.open(MoveToDialogComponent, config)
            .afterClosed()
            .subscribe((result: MoveToDialogResult | null) => {
                if (!result || !this.organizeTree) { return; }
                const organizeModel = this.organizeTree.treeModel;
                // Locate the live target node in the organize tree
                const targetNode = UtilService.findTreeNode(
                    organizeModel,
                    'idTreeNode',
                    result.target.data.idTreeNode
                ) as TreeNode;
                if (!targetNode) { return; }

                const cloneNodes = UtilService.getFileNodesToMove(
                    this.uploadTree ? this.uploadTree.treeModel : null
                );
                if (!cloneNodes || cloneNodes.length === 0) {
                    // No active nodes — use the node passed to openMoveDialog
                    const clone = Object.assign({}, node.data);
                    if (targetNode.data.FileDescriptor) {
                        targetNode.data.FileDescriptor.push(clone);
                    } else {
                        targetNode.data.FileDescriptor = [clone];
                    }
                } else {
                    if (targetNode.data.FileDescriptor) {
                        targetNode.data.FileDescriptor.push(...cloneNodes);
                    } else {
                        targetNode.data.FileDescriptor = cloneNodes;
                    }
                }

                this.isLastSelectOrgTree = false;
                this.attemptRemove(true);
                organizeModel.update();
                this.formGroup.markAsDirty();

                const names = (cloneNodes && cloneNodes.length > 0)
                    ? cloneNodes.map((n: any) => n.displayName || 'file').join(', ')
                    : (node.data.displayName || 'file');
                const targetLabel = result.target.label;
                this.ariaAnnouncer.announce(`${names} moved to ${targetLabel}.`);

                setTimeout(() => { targetNode.setActiveAndVisible(); }, 0);
            });
    }

    private  actionMapping: IActionMapping = {
        mouse: {
            click: (tree:TreeModel, node, $event) => {
                if($event.ctrlKey) {
                   TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event);
                } else if($event.shiftKey){
                    TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event);
                    UtilService.makeShiftSelection(tree,node);
                }else{
                    TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
                }
                this.isLastSelectOrgTree = tree === this.organizeTree.treeModel;
            },
            drop: this.moveNode,
            dragStart : (tree:TreeModel, node, $event) => {
                this.isLastSelectOrgTree =  tree === this.organizeTree.treeModel;
                if(!node.isActive){
                    TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event)
                }

            }
        },
        keys: {
            [KEYS.ENTER]: (tree: TreeModel, node: TreeNode, $event: KeyboardEvent) => {
                if (this.treeKbMove.isGrabbing) {
                    this._kbDrop(tree, node);
                } else {
                    TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
                }
            },
            [KEYS.SPACE]: (tree: TreeModel, node: TreeNode, $event: KeyboardEvent) => {
                $event.preventDefault();
                if (!this.treeKbMove.isGrabbing) {
                    this._kbGrab(tree, node);
                }
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
    };



    constructor(private analysisService:AnalysisService,
                private gnomexService: GnomexService,
                public secAdvisor: CreateSecurityAdvisorService,
                private fb:FormBuilder,
                private utilService: UtilService,
                private fileService: FileService,
                public constService:ConstantsService,
                private changeDetector: ChangeDetectorRef,
                private dialogService: DialogsService,
                public treeKbMove: TreeKeyboardMoveService,
                private ariaAnnouncer: AriaAnnouncerService,
                private matDialog: MatDialog) {
    }

    ngOnInit(){
        this.splitOrgSize = 0;
        this.utilService.registerChangeDetectorRef(this.changeDetector);

        this.formGroup = this.fb.group({
            organizeFileParams: {}
        });
        this.fileService.addManageFilesForm("OrganizeFilesComponent", this.formGroup);

        this.uploadOpts = {
            displayField: 'displayName',
            childrenField: "FileDescriptor",
            idField:'idTreeNode',
            allowDrag: (node: any) =>{return  node.data.PROTECTED === 'N'},
            allowDrop: (element, item: {parent: any, index}) => {
                return false;
            },
            nodeClass: this._nodeClass,
            actionMapping : this.actionMapping

        };

        this.organizeOpts = {
            displayField: 'displayName',
            childrenField: "FileDescriptor",
            useVirtualScroll: true,
            idField:'idTreeNode',
            nodeHeight: 22,
            allowDrag: (node: any) =>{
                if(node.data.PROTECTED && node.data.PROTECTED === 'Y'){
                    return false;
                }
                return node.level > 1
            },
            allowDrop: (element, item: {parent: any, index}) => {
                let parent = <ITreeNode>item.parent;
                if((this.organizeTree.treeModel.roots[0].id === parent.id) || parent.data.type === 'dir' ) {
                    return true;
                }else{
                    return false;
                }

            },
            nodeClass: this._nodeClass,
            actionMapping : this.actionMapping
        };


        if(this.data.type === 'a'){
            this.manageFileSubscript = this.fileService.getAnalysisOrganizeFilesObservable().subscribe( (resp) => {
                this.disableRename = true;
                this.disableRemove = true;
                this.dialogService.stopAllSpinnerDialogs();
                if(resp && Array.isArray(resp)){
                    let respList = (<any[]>resp);
                    respList.map(r =>{
                        if(r && !r.message){
                            return r;
                        }else if(r && r.message ){
                            return r.message;
                        }
                    });


                    if( (typeof(respList[0]) !== 'string'  && typeof(respList[1]) !== 'string')){
                        let analysis = respList[0].Analysis;
                        let analysisDownloadList = respList[1].Analysis;

                        if(analysis && analysisDownloadList){
                            this.uploadFiles = this.fileService.getUploadFiles(analysis.ExpandedAnalysisFileList.AnalysisUpload);
                            this.organizeFiles = [analysisDownloadList];
                        }
                    }

                }
            });
            this.fileService.emitGetAnalysisOrganizeFiles({idAnalysis :this.data.id.idAnalysis});

        }else{
            this.manageFileSubscript = this.fileService.getRequestOrganizeFilesObservable().subscribe(resp =>{
                this.dialogService.stopAllSpinnerDialogs();
                this.disableRename = true;
                this.disableRemove = true;
                this.uploadFiles = resp[0];
                this.organizeFiles = resp[1];
            },error =>{
                this.dialogService.stopAllSpinnerDialogs();
                this.dialogService.error(error);
            });
            this.fileService.emitGetRequestOrganizeFiles( {idRequest: this.data.id.idRequest});


        }

        this.labList = this.gnomexService.labList;


    }


    ngAfterViewInit() {
    }


    initOrganizeTree(event){
        event.treeModel.expandAll();
    }

    prepareView(showFileTree) {
        this.splitOrgSize = 30;
        this.showFileTrees = showFileTree;
    }


    onMove(event){
        let nodeEvent = event.node;
        let node = this.organizeTree.treeModel.getNodeById(nodeEvent.idTreeNode);
        let parentNode = this.organizeTree.treeModel.getNodeById(event.to.parent.idTreeNode);
        node.data.dirty = 'Y';
        node.focus();
        parentNode.expand();
        this.formGroup.markAsDirty();
    }

    // tree methods
    isProtected(root:any, showMessage:boolean = false) : boolean{
        let action = false;
        if(root.type == 'dir' && root.PROTECTED === 'Y'){
            if(showMessage){
                this.dialogService.alert("The folder you are attempting to delete \'" + root.displayName
                    + "\' has protected files contained within it.", null, DialogType.WARNING);
                action = true;
            }
        }else if(root.PROTECTED === 'Y'){
            if(showMessage){
                this.dialogService.alert("The file you are attempting to delete \'"+ root.displayName
                    + "\' is protected ", null, DialogType.WARNING);

            }
            action = true;
        }

        return action;

    }


    public getChildrenToRemove(file: any): boolean {
        if (file.PROTECTED && file.type !== "dir") {

            let p = file.PROTECTED === 'Y';
            if(!p){
                this.removedChildren.add(file)
            }
            return p;
        }

        let isProtected: boolean = false;
        if (file.FileDescriptor) {
            for (let child of file.FileDescriptor) {
                if (this.getChildrenToRemove(child)) {
                    isProtected = true;
                }
            }
        }

        if(file.PROTECTED || file.PROTECTED === 'N') {
            this.removedChildren.add(file);
        }
        return isProtected;
    }


    uploadTreeOnSelect(event:any){
        let otherTreeFocusedNode =  this.organizeTree.treeModel.getFocusedNode();
        if(otherTreeFocusedNode){
            otherTreeFocusedNode.setIsActive(false);
        }

        this.uploadSelectedNode = <ITreeNode>event.node;
        this.disableRemove = false;
    }
    uploadTreeOnUnselect(event:any){
        this.uploadSelectedNode = null;
        this.disableRemove = !this.organizeSelectedNode ? true : false;
    }

    organizeTreeOnSelect(event:any){
        let otherTreeFocusedNode =  this.uploadTree.treeModel.getFocusedNode();
        if(otherTreeFocusedNode){
            otherTreeFocusedNode.setIsActive(false);
        }
        this.organizeSelectedNode = <ITreeNode>event.node;
        let isRoot = this.organizeSelectedNode.isRoot;
        this.disableRename = isRoot;
        this.disableRemove = isRoot;


    }
    organizeTreeOnUnselect(event:any){
        this.organizeSelectedNode = null;
        this.disableRemove = !this.uploadSelectedNode ? true : false;
        this.disableRename = true;
    }

    private renameCallBack = (data) => {
        if(data){
            this.organizeSelectedNode.data.displayName = data;
            this.organizeSelectedNode.data.dirty = 'Y';
            this.organizeTree.treeModel.update();
            this.formGroup.markAsDirty()
        }
    };

    datatrackSelectedFile(nodes:ITreeNode[]):boolean{
        let hasDataTrack:boolean = false;
        for(let n of nodes){
            if(n.data.hasDataTrack === 'Y'){
                hasDataTrack = true;
            }
        }
        return hasDataTrack;
    }

    attemptAddNewFolder():void{
        if(this.formGroup.dirty) {
            this.dialogService.confirm("Making a new folder will result in all unsaved changes being lost. Do you want to continue?", "Warning")
                .subscribe((action: boolean) => {
                    if(action){
                        this.addNewFolder();
                    }

                });
        }else{
            this.addNewFolder();
        }

    }
    addNewFolder(){
        let targetNode = null;
        if (this.organizeSelectedNode) { // selected file
            if (this.organizeSelectedNode.isLeaf && !(this.organizeSelectedNode.data.type === 'dir')) {
                targetNode = this.organizeSelectedNode.parent.data;
            } else { // selected folder
                targetNode = this.organizeSelectedNode.data;
                this.organizeSelectedNode.expand();
            }

            this.openRenameDialog("Add Folder", "Folder Name", (data) => {
                if (data) {
                    let displayName = data;
                    let files: any[] = targetNode.FileDescriptor;
                    if (files) {
                        files.push({
                            isNew: 'Y',
                            dirty: 'Y',
                            key: "X-X-" + displayName,
                            displayName: displayName,
                            type: "dir",
                            qualifiedFilePath: "",
                            isEmpty: 'Y',
                            icon: this.constService.ICON_FOLDER_DISABLE,
                            PROTECTED: this.isProtected(targetNode) ? 'Y' : 'N',
                            info: ""

                        });
                        this.organizeTree.treeModel.update();
                        this.organizeSelectedNode = this.organizeTree.treeModel.getActiveNodes()[0];
                        this.formGroup.markAsDirty();
                    }
                    this.dialogService.alert("Please save the new folder before making any changes to file structure to avoid any data being lost.");
                }
            }, this.constService.ICON_FOLDER_ADD);
        }



    }

    remove(treeRemovedFrom:string, nodes:ITreeNode[], move:boolean){
        for(let node of nodes){
            if(treeRemovedFrom === 'organize' && node.isRoot ){
                continue;
            }

            let id:any = '';
            let parentNode: ITreeNode = node.parent;
            //let tree:TreeComponent = null;
            let children: any[] = [];

            if(treeRemovedFrom === 'organize'){
                id = node.id;
                children = <any[]>parentNode.data.FileDescriptor;
            }else {
                id = node.id;
                children = <any[]>parentNode.data.FileDescriptor;
            }


            if(!this.isProtected(node.data,true)){
                if(!move){
                    this.getChildrenToRemove(node.data);// records in a set all files to be removed  don't record if a move
                }

                let idx : number =  children.indexOf(node.data);
                if(idx > -1){
                    children.splice(idx, 1);
                }


                this.formGroup.markAsDirty();
            }
        }
        if(treeRemovedFrom === 'organize'){
            this.organizeTree.treeModel.update();
        }else{
            this.uploadTree.treeModel.update();
        }
        this.uploadSelectedNode = null;
        this.organizeSelectedNode = null;
    }

    attemptRemove(move:boolean = false){
        let treeRemovedFrom:string = '';
        let nodes:ITreeNode[] = null;


        if(this.isLastSelectOrgTree){
            treeRemovedFrom = 'organize';
            nodes = this.organizeTree.treeModel.getActiveNodes();
        }else {
            treeRemovedFrom = 'upload';
            nodes = this.uploadTree.treeModel.getActiveNodes();
        }


        if(this.datatrackSelectedFile(nodes) && !move ){
            this.dialogService.confirm("At least one selected file is linked to a data track.  Do you want to remove the files and delete any associated data tracks?", "Warning")
                .pipe(first()).subscribe(answer =>{
                if(answer) {
                    this.remove(treeRemovedFrom, nodes, move);
                }
            });
        }else{
            this.remove(treeRemovedFrom, nodes, move);
        }

    }

    openRenameDialog(title: string, placeHolder: string, onClose, imgIcon?: string) {
        let config: MatDialogConfig = new MatDialogConfig();
        config.panelClass = 'no-padding-dialog';
        config.data = {
            placeHolder: placeHolder
        };
        config.minWidth = "35em";

        this.dialogService.genericDialogContainer(NameFileDialogComponent, title, imgIcon ? imgIcon : null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "OK", internalAction: "applyChanges"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe(onClose);

    }


    rename(){
        if(this.organizeSelectedNode){
            let p = this.organizeSelectedNode.data.PROTECTED;
            if( p && p === 'Y'){
                this.dialogService.alert("Protected files cannot be renamed.", null, DialogType.WARNING);
                return;
            }

            let title ="Rename " + this.organizeSelectedNode.data.displayName;
            this.openRenameDialog(title,'To', this.renameCallBack);
        }

    }
    refresh(){
        if(this.data.type === 'a'){
            this.dialogService.startDefaultSpinnerDialog();
            this.fileService.emitGetAnalysisOrganizeFiles(this.data.id.idAnalysis);
        }else if(this.data.type === 'e'){
            this.dialogService.startDefaultSpinnerDialog();
            this.fileService.emitGetRequestOrganizeFiles( {idRequest: this.data.id.idRequest});
        }
        this.formGroup.markAsPristine();

    }

    requestToCloseDialog(){
        this.closeDialog.emit();
    }

    expandFolders(){
        if(this.organizeSelectedNode){
            this.organizeSelectedNode.expandAll();
        }else{
            this.organizeTree.treeModel.expandAll();
        }
    }
    collapseFolders(){
        if(this.organizeSelectedNode){
            this.organizeSelectedNode.collapseAll();
        }else{
            this.organizeTree.treeModel.collapseAll();
        }
    }




    private requestSave():void{
        this.fileService.emitSaveManageFiles();
    }

    private makeParams(paramName,paramValue):any{
        let params = null;
        let removedChildrenList:any[] = this.removedChildren.size > 0  ? Array.from(this.removedChildren) : [];
        let childJsonStr = JSON.stringify(removedChildrenList);
        params = {
            "filesToRemoveJSONString": childJsonStr,
            "filesJSONString": JSON.stringify(this.organizeFiles[0]),
            "noJSONToXMLConversionNeeded": "Y"
        };
        params[paramName] = paramValue;
        return params

    }

    save(){
        let params:any = null;
        if(this.data.type === 'a'){
            params = this.makeParams( "idAnalysis",  this.data.id.idAnalysis);
        }else{
            params = this.makeParams( "idRequest", this.data.id.idRequest);
        }
        this.organizeSelectedNode = null;

        this.formGroup.get("organizeFileParams").setValue(params);
        this.removedChildren.clear();
    }

    ngOnDestroy():void{
        if(this.manageFileSubscript){
            this.manageFileSubscript.unsubscribe();
        }
        this.utilService.removeChangeDetectorRef(this.changeDetector);
    }
}
