import {ChangeDetectorRef, ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material";
import {TreeKeyboardMoveService} from "./accessibility/tree-keyboard-move.service";
import {AriaAnnouncerService} from "./accessibility/aria-announcer.service";
import {ConstantsService} from "../services/constants.service";
import {ITreeOptions, KEYS, TREE_ACTIONS, TreeComponent, TreeModel, TreeNode} from "@circlon/angular-tree-component";
import {PropertyService} from "../services/property.service";
import {FileService} from "../services/file.service";
import {Observable} from "rxjs";
import {DialogsService, DialogType} from "./popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {DownloadProgressComponent} from "./download-progress.component";
import {UtilService} from "../services/util.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {GuestTermsDialogComponent} from "./guest-terms-dialog.component";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";
import {ActionType} from "./interfaces/generic-dialog-action.model";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

@Component({
    template: `
        <div class="full-height full-width flex-container-col" role="dialog" aria-label="Download files">
            <div class="full-height full-width flex-container-col padded" role="main">
                <div class="flex-container-row align-center justify-space-between">
                    <label id="download-instructions">
                        Drag files or folders that you want to download. Hold CTRL or SHIFT key to select multiple.
                    </label>
                    <context-help name="downloadhelp"
                                  label="Download Help"
                                  popupTitle="Download Help"
                                  [hasEditPermission]="this.securityAdvisor.isAdmin">
                    </context-help>
                </div>
                <div class="trees-container" role="region" aria-labelledby="download-instructions">
                    <as-split class="white-split-gutter silver-bordered-gutter">
                        <as-split-area size="50">
                            <div class="full-width full-height flex-container-col padded" role="region" aria-labelledby="available-files-label">
                                <label id="available-files-label">
                                    Available Files
                                </label>
                                <div class="flex-grow" ondrop="permitDrop($event)" (dragover)="onRemoveFromDownload($event)">
                                    <tree-root appAccessibleTree
                                               #availableFilesTreeComponent
                                               [nodes]="availableFilesNodes"
                                               [options]="filesOptions"
                                               (initialized)="initOrganizeTree($event)"
                                               [accessibleTreeIdPrefix]="'available-files-tree'"
                                               aria-label="Available files tree">
                                        <ng-template #treeNodeTemplate let-node draggable="true">
                                            <div appAccessibleTreeNode
                                                 [treeNode]="node"
                                                 [accessibleTreeNodeIdPrefix]="'available-files-tree'"
                                                 [accessibleTreeNodeLabel]="node.data.displayName"
                                                 [accessibleTreeNodeRoleDescription]="nodeRoleDesc(node)"
                                                 [accessibleTreeNodeSelected]="isKbDropTarget(node) || node.isActive"
                                                 class="flex-container-row tree-node-font">
                                                <img [src]="node.data.icon" alt="" aria-hidden="true" class="icon tree-node-icon">
                                                <div>
                                                    {{ node.data.displayName }}
                                                </div>
                                                <button appAccessibleTreeAction
                                                        [treeNode]="node"
                                                        [accessibleTreeActionIdPrefix]="'available-files-tree'"
                                                        class="sr-only-focusable"
                                                        [attr.aria-label]="'Add ' + node.data.displayName + ' to download list'"
                                                        (click)="addToDownloadList(node, $event)">Add to download list</button>
                                            </div>
                                        </ng-template>
                                    </tree-root>
                                </div>
                            </div>
                        </as-split-area>
                        <as-split-area size="50">
                            <div class="full-width full-height flex-container-col padded" role="region" aria-labelledby="files-to-download-label">
                                <label id="files-to-download-label">
                                    Files to Download
                                </label>
                                <div class="flex-grow" ondrop="permitDrop($event)" (dragover)="onDropInDownload($event)">
                                    <tree-root appAccessibleTree
                                               #filesToDownloadTreeComponent
                                               [nodes]="filesToDownloadNodes"
                                               [options]="filesOptions"
                                               [accessibleTreeIdPrefix]="'files-to-download-tree'"
                                               aria-label="Files to download tree">
                                        <ng-template #treeNodeTemplate let-node draggable="true">
                                            <div appAccessibleTreeNode
                                                 [treeNode]="node"
                                                 [accessibleTreeNodeIdPrefix]="'files-to-download-tree'"
                                                 [accessibleTreeNodeLabel]="node.data.displayName"
                                                 [accessibleTreeNodeRoleDescription]="nodeRoleDesc(node)"
                                                 [accessibleTreeNodeSelected]="isKbDropTarget(node) || node.isActive"
                                                 class="flex-container-row tree-node-font">
                                                <img [src]="node.data.icon" alt="" aria-hidden="true" class="icon tree-node-icon">
                                                <div>
                                                    {{ node.data.displayName }}
                                                </div>
                                                <button appAccessibleTreeAction
                                                        [treeNode]="node"
                                                        [accessibleTreeActionIdPrefix]="'files-to-download-tree'"
                                                        class="sr-only-focusable"
                                                        [attr.aria-label]="'Remove ' + node.data.displayName + ' from download list'"
                                                        (click)="removeFromDownloadList(node, $event)">Remove from download list</button>
                                            </div>
                                        </ng-template>
                                    </tree-root>
                                </div>
                            </div>
                        </as-split-area>
                    </as-split>
                </div>
                <div class="flex-container-row justify-space-between" role="status" aria-live="polite">
                    <label aria-label="Available files count">
                        {{ availableFilesCount }} file(s)
                    </label>
                    <label aria-label="Files to download count and size">
                        {{ filesToDownloadCount }} file(s) ({{ filesToDownloadSizeLabel }})
                    </label>
                </div>
            </div>
            <mat-dialog-actions
                    class="justify-flex-end no-margin no-padding generic-dialog-footer-colors"
                    role="group"
                    aria-label="Download actions">
                <div class="double-padded-right">
                    <button mat-raised-button
                            color="primary"
                            class="primary-action"
                            [disabled]="filesToDownloadCount < 1"
                            (click)="download()"
                            aria-label="Download selected files">
                        <img [src]="constantsService.ICON_DOWNLOAD" alt="" aria-hidden="true" class="icon">
                        Download
                    </button>
                    <button mat-raised-button
                            color="primary"
                            class="primary-action"
                            [disabled]="filesToDownloadCount < 1 || !isFDTSupported"
                            (click)="downloadFDTCommandLine()"
                            aria-label="Download using FDT command line">
                        <img [src]="constantsService.ICON_DOWNLOAD_LARGE" alt="" aria-hidden="true" class="icon">
                        FDT Command Line
                    </button>
                    <button mat-raised-button
                            color="primary"
                            class="primary-action"
                            [disabled]="filesToDownloadCount < 1 || !isFDTSupported || true"
                            (click)="downloadFDT()"
                            aria-label="Download using FDT">
                        <img [src]="constantsService.ICON_DOWNLOAD_LARGE" alt="" aria-hidden="true" class="icon">
                        FDT Download
                    </button>
                    <button mat-raised-button
                            color="primary"
                            class="primary-action"
                            *ngIf="showCreateSoftLinks"
                            [disabled]="filesToDownloadCount < 1 || true"
                            (click)="createSoftLinks()"
                            aria-label="Create soft links">
                        <img [src]="constantsService.ICON_DOWNLOAD" alt="" aria-hidden="true" class="icon">
                        Create Soft Links
                    </button>
                    <button mat-raised-button
                            mat-dialog-close
                            color="accent"
                            class="secondary-action"
                            aria-label="Cancel download">
                        Cancel
                    </button>
                </div>
            </mat-dialog-actions>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        div.trees-container {
            width: 60em;
            height: 25em;
            border: solid silver 1px;
        }
        .no-margin {
            margin: 0;
        }
        .no-padding {
            padding: 0;
        }
        .primary-action {
            background-color: var(--bluewarmvivid-medlight);
            font-weight: bolder;
            color: white;
        }
        .secondary-action {
            background-color: var(--sidebar-footer-background-color);
            font-weight: bolder;
            color: var(--bluewarmvivid-medlight);
            border: var(--bluewarmvivid-medlight)  solid 1px;
        }
        /*tree-root.tree-viewport {*/
        /*height: 93%;*/
        /*}*/
        tree-viewport {
            height: 93%;
        }
    `]
})
export class DownloadFilesComponent extends BaseGenericContainerDialog implements OnInit, OnDestroy {

    @ViewChild("availableFilesTreeComponent", {static: false}) private availableFilesTreeComponent: TreeComponent;
    public availableFilesNodes: any[] = [];
    public availableFilesCount: number = 0;

    @ViewChild("filesToDownloadTreeComponent", {static: false}) private filesToDownloadTreeComponent: TreeComponent;
    public filesToDownloadNodes: any[] = [];
    public filesToDownloadCount: number = 0;
    public filesToDownloadSize: number = 0;
    public maxsize: number = 4000000000;
    public filesToDownloadSizeLabel: string = "";

    public filesOptions: ITreeOptions;
    public isFDTSupported: boolean = false;
    public showCreateSoftLinks: boolean = false;
    private downloadURL: string = "";
    private suggestedFilename: string = "";
    private cacheDownloadListFn: (files: any[]) => Observable<any>;
    private fdtDownloadFn: (emailAddress: string, showCommandLineInstructions: boolean) => Observable<any>;
    private makeSoftLinksFn: (files: any[]) => Observable<any>;

    private email: string = "";

    private treeMostRecentlySelectedFrom: TreeModel;

    constructor(private dialogRef: MatDialogRef<DownloadFilesComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                public constantsService: ConstantsService,
                private propertyService: PropertyService,
                private changeDetector: ChangeDetectorRef,
                private utilService: UtilService,
                private fileService: FileService,
                private dialogsService: DialogsService,
                public securityAdvisor: CreateSecurityAdvisorService,
                public treeKbMove: TreeKeyboardMoveService,
                private ariaAnnouncer: AriaAnnouncerService) {
        super();
    }

    ngOnInit() {
        this.utilService.registerChangeDetectorRef(this.changeDetector);
        this.isFDTSupported = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_FDT_SUPPORTED);

        this.filesOptions = {
            idField: 'fileTreeID',
            displayField: 'displayName',
            childrenField: 'FileDescriptor',
            allowDrag: true,
            allowDrop: (element: TreeNode, to: {parent: TreeNode, index: number}) => {
                // Prevent same-panel drops — they have no semantic meaning in this dialog.
                // Cross-panel drops (available → download or download → available) are allowed.
                return element.treeModel !== to.parent.treeModel;
            },
            nodeClass: (node: TreeNode) => {
                let cls = node.data.type === 'dir' ? 'icon-folder' : 'icon-file';
                if (this.treeKbMove.isGrabbedNode(node)) { cls += ' keyboard-grabbed'; }
                if (this.isKbDropTarget(node))           { cls += ' keyboard-drop-target'; }
                return cls;
            },
            actionMapping: {
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
                    },
                    drop: this.moveNode,
                    dragStart : (tree:TreeModel, node, $event) => {
                        if(!node.isActive){
                            TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
                        }
                        // Always track the source tree — even when the node is already active —
                        // so that onRemoveFromDownload can correctly identify where to de-select from.
                        this.treeMostRecentlySelectedFrom = tree;
                    }
                },   //  mouse
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
                        TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
                        this.treeKbMove.grab(node, tree);
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
            },  // actionMapping
        };  // filesOptions

        if (this.data) {
            this.showCreateSoftLinks = this.data.showCreateSoftLinks;
            this.downloadURL = this.data.downloadURL;
            this.suggestedFilename = this.data.suggestedFilename;
            this.cacheDownloadListFn = this.data.cacheDownloadListFn;
            this.fdtDownloadFn = this.data.fdtDownloadFn;
            if (this.showCreateSoftLinks && this.data.makeSoftLinksFn) {
                this.makeSoftLinksFn = this.data.makeSoftLinksFn;
            }

            this.availableFilesNodes = [this.data.downloadListSource];
            this.availableFilesCount = this.countFilesRecursively(this.availableFilesNodes[0]);
            this.selectFilesRecursively(this.data.downloadListSource, 'N');
            this.data.downloadListSource.isSelected = 'Y';
            this.filesToDownloadNodes = [this.data.downloadListSource];

            setTimeout(() => {
                        this.updateFilesToDownloadTree();

                        this.changeDetector.markForCheck();
            });
        }  // end if (this.data)

        if (this.securityAdvisor.isGuest) {
setTimeout(() => {
            let terms: string = this.propertyService.getPropertyValue(PropertyService.PROPERTY_GUEST_DOWNLOAD_TERMS);
            if (terms) {
                let guestTermsConfig: MatDialogConfig = new MatDialogConfig();
                guestTermsConfig.autoFocus = false;
                guestTermsConfig.width = "30em";
                guestTermsConfig.height = "30em";
                guestTermsConfig.data = {
                    terms: terms,
                };
                this.dialogsService.genericDialogContainer(GuestTermsDialogComponent, "Download Terms", null, guestTermsConfig,
                    {actions: [
                            {type: ActionType.PRIMARY, icon: this.constantsService.ICON_ACCEPT, name: "Accept", internalAction: "accept"},
                            {type: ActionType.SECONDARY, icon: this.constantsService.ICON_DECLINE, name: "Decline", internalAction: "onClose"}
                        ]}).subscribe((result: any) => {
                    if(result) {
                        this.email = result;
                    } else {
                        this.dialogRef.close();
                    }
                });
            }
});
 }
    }

    ngOnDestroy(): void {
        this.utilService.removeChangeDetectorRef(this.changeDetector);
    }

    private updateFilesToDownloadTree(): void {
        setTimeout(() => {
        this.filesToDownloadTreeComponent.treeModel.filterNodes((node: TreeNode) => {
            return node.data.isSelected === 'Y';
        });
});
        setTimeout(() => {
        this.filesToDownloadCount = this.countFilesRecursively(this.filesToDownloadNodes[0], true);
        this.filesToDownloadSize = this.countFileSizeRecursively(this.filesToDownloadNodes[0], true);
        this.filesToDownloadSizeLabel = FileService.formatFileSize(this.filesToDownloadSize);
});
    }

    private countFilesRecursively(fileNode: any, filterSelectedOnly: boolean = false): number {
        if (filterSelectedOnly && fileNode.isSelected === 'N' && fileNode.type !== 'dir') {
            return 0;
        }

        if (fileNode.fileSize && fileNode.type !== 'dir') {
            return 1;
        } else if (fileNode.FileDescriptor && fileNode.FileDescriptor.length > 0) {
            let count: number = 0;
            for (let childNode of fileNode.FileDescriptor) {
                count += this.countFilesRecursively(childNode, filterSelectedOnly);
            }
            return count;
        } else {
            return 0;
        }
    }

    private countFileSizeRecursively(fileNode: any, filterSelectedOnly: boolean = false): number {
        if (filterSelectedOnly && fileNode.isSelected === 'N' && fileNode.type !== 'dir') {
            return 0;
        }

        if (fileNode.fileSize && fileNode.type !== 'dir') {
            return +fileNode.fileSize;
        } else if (fileNode.FileDescriptor && fileNode.FileDescriptor.length > 0) {
            let count: number = 0;
            for (let childNode of fileNode.FileDescriptor) {
                count += this.countFileSizeRecursively(childNode, filterSelectedOnly);
            }
            return count;
        } else {
            return 0;
        }
    }

    private selectFilesRecursively(fileNode: any, isSelected: string): void {
        fileNode.isSelected = isSelected;
        if (fileNode.FileDescriptor) {
            for (let childNode of fileNode.FileDescriptor) {
                this.selectFilesRecursively(childNode, isSelected);
            }
        }
    }

    private isFullySelected(file: any): boolean {
        if (file.isSelected === 'N') {
            return false;
        }
        if (file.FileDescriptor) {
            for (let child of file.FileDescriptor) {
                if (!this.isFullySelected(child)) {
                    return false;
                }
            }
        }
        return true;
    }

    // ─── ARIA helpers for treeNodeTemplate (WCAG 4.1 + 4.5) ───────────────────

    /** aria-roledescription: "draggable folder" or "draggable file". */
    public nodeRoleDesc(node: TreeNode): string {
        return node.data.type === 'dir' ? 'draggable folder' : 'draggable file';
    }

    /**
     * Returns true when a keyboard grab is active and this node is the currently
     * focused node in EITHER tree (i.e. the user has navigated to it as a drop target).
     */
    public isKbDropTarget(node: TreeNode): boolean {
        if (!this.treeKbMove.isGrabbing) { return false; }
        if (this.availableFilesTreeComponent) {
            const f = this.availableFilesTreeComponent.treeModel.getFocusedNode();
            if (f === node) { return true; }
        }
        if (this.filesToDownloadTreeComponent) {
            const f = this.filesToDownloadTreeComponent.treeModel.getFocusedNode();
            if (f === node) { return true; }
        }
        return false;
    }

    // ─── Phase 3: Single-pointer actions (WCAG 2.5.7) ─────────────────────────

    /**
     * Adds `node` to the download list via a single button click.
     * Satisfies WCAG 2.5.7 by providing a non-drag alternative.
     */
    public addToDownloadList(node: TreeNode, $event: MouseEvent): void {
        $event.stopPropagation();
        this.selectFilesRecursively(node.data, 'Y');
        let ancestor: TreeNode = node.parent;
        while (ancestor && ancestor.data) {
            ancestor.data.isSelected = 'Y';
            ancestor = ancestor.parent;
        }
        this.updateFilesToDownloadTree();
        this.ariaAnnouncer.announce(`${node.data.displayName || 'File'} added to download list.`);
    }

    /**
     * Removes `node` from the download list via a single button click.
     * Satisfies WCAG 2.5.7 by providing a non-drag alternative.
     */
    public removeFromDownloadList(node: TreeNode, $event: MouseEvent): void {
        $event.stopPropagation();
        this.selectFilesRecursively(node.data, 'N');
        this.updateFilesToDownloadTree();
        this.ariaAnnouncer.announce(`${node.data.displayName || 'File'} removed from download list.`);
    }

    // ─── Keyboard drag-and-drop (WCAG 2.1.1) ──────────────────────────────────

    /**
     * Handles Enter-key drops.  The direction (select for download vs de-select)
     * is determined by which tree the user is currently navigating.
     *
     * Dropping into "Files to Download" → marks the grabbed file as selected.
     * Dropping into "Available Files"   → de-selects the grabbed file.
     */
    private _kbDrop(targetTree: TreeModel, targetNode: TreeNode): void {
        const state = this.treeKbMove.state;
        if (!state) { return; }

        const dropped = this.treeKbMove.tryDrop(targetNode, () => true);
        if (!dropped) { return; }

        if (targetTree === this.filesToDownloadTreeComponent.treeModel) {
            // Moving into the "files to download" tree — mark as selected
            this.selectFilesRecursively(state.node.data, 'Y');
            // Also mark every ancestor as selected so the tree filter shows them
            let ancestor: TreeNode = state.node.parent;
            while (ancestor && ancestor.data) {
                ancestor.data.isSelected = 'Y';
                ancestor = ancestor.parent;
            }
            this.updateFilesToDownloadTree();
        } else if (targetTree === this.availableFilesTreeComponent.treeModel) {
            // Moving back to "available files" — de-select
            this.selectFilesRecursively(state.node.data, 'N');
            this.updateFilesToDownloadTree();
        }
    }

    private moveNode: (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => void = (tree: TreeModel, node: TreeNode, $event: any, {from, to}) => {

        // File selected to be downloaded
        if (tree === this.filesToDownloadTreeComponent.treeModel) {
            let files : TreeNode[] = from.treeModel.getActiveNodes();

            for(let file of files ){
                this.selectFilesRecursively(file.data, 'Y');
                let n: TreeNode = from;
                while (n) {
                    if (n.data) {
                        n.data.isSelected = 'Y';
                    } else {
                        n.data = { isSelected: 'Y'}
                    }
                    n = n.parent;
                }
            }

            this.updateFilesToDownloadTree();

            // WCAG 4.1.3: announce selection to screen readers.
            const names = files.map(f => f.data.displayName || 'file').join(', ');
            this.ariaAnnouncer.announce(`${names} added to download list.`);
        }
        // File de-selected to be downloaded
        else if (tree === this.availableFilesTreeComponent.treeModel) {
            // `from` is a TreeComponent when called programmatically (onRemoveFromDownload),
            // or a TreeNode when triggered by a mouse drag.  In both cases we need to confirm
            // the source is the "files to download" tree before de-selecting.
            const sourceModel: TreeModel = from === this.filesToDownloadTreeComponent
                ? from.treeModel
                : (from && from.treeModel);
            if (sourceModel === this.filesToDownloadTreeComponent.treeModel) {
                let files : TreeNode[] = sourceModel.getActiveNodes();
                for(let file of files){
                    this.selectFilesRecursively(file.data, 'N');
                }
                this.updateFilesToDownloadTree();

                // WCAG 4.1.3: announce de-selection to screen readers.
                const names = files.map(f => f.data.displayName || 'file').join(', ');
                this.ariaAnnouncer.announce(`${names} removed from download list.`);
            }
        }
    };


    public onDropInDownload(event: any): void {
        setTimeout(() => {
        this.changeDetector.markForCheck();
        this.moveNode(this.filesToDownloadTreeComponent.treeModel, null, event, {from: this.availableFilesTreeComponent, to: this.filesToDownloadTreeComponent});

});
}

    public onRemoveFromDownload(event: any): void {
        if (this.treeMostRecentlySelectedFrom === this.filesToDownloadTreeComponent.treeModel) {
            return this.moveNode(this.availableFilesTreeComponent.treeModel, null, event,
                {from: this.filesToDownloadTreeComponent, to: this.availableFilesTreeComponent});
        }
    }

    private gatherFilesToDownload(): any[] {
        if (this.filesToDownloadNodes && Array.isArray(this.filesToDownloadNodes) && this.filesToDownloadNodes.length > 0) {
            return this.gatherFilesToDownloadHelper(this.filesToDownloadNodes[0]);
        }
    }

    private gatherFilesToDownloadHelper(fileNode: any): any[] {
        if (fileNode.isSelected === 'N' && fileNode.type !== 'dir') {
            return [];
        }

        if (fileNode.fileSize && fileNode.type !== 'dir') {
            return [fileNode];
        } else if (fileNode.FileDescriptor && fileNode.FileDescriptor.length > 0) {
            let children: any[] = [];
            for (let childNode of fileNode.FileDescriptor) {
                children.push(...this.gatherFilesToDownloadHelper(childNode));
            }
            return children;
        } else {
            return [];
        }
    }

    public download(): void {
        let files: any[] = this.gatherFilesToDownload();

// ************************************************ remove *******************************************
//        this.filesToDownloadSize = 20000000000;
// ************************************************ remove *******************************************

        // too big?
        if (this.filesToDownloadSize > this.maxsize) {
            this.dialogsService.confirm("Total size exceeds 4 GB limit for browser downloads. Using FDT Command Line.", "Download Size Exceeds Limit").subscribe((result: any) => {
                if (result) {

                    this.cacheDownloadListFn(files).subscribe((result: any) => {
                        if (result && result.result === 'SUCCESS') {
                            this.fdtDownloadFn(this.email, true).subscribe((result: any) => {
                                if (!result || result.result !== 'SUCCESS') {
                                    this.handleBackendError(result, "retrieving FDT command line instructions");
                                }
                            });
                        } else {
                            this.handleBackendError(result, "caching file download list");
                        }
                    });
                }
            });
            return;
        }

        // less than maxsize, proceed with normal download
        this.cacheDownloadListFn(files).subscribe((result: any) => {
            if (result && result.result === 'SUCCESS') {
                let downloadParams: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
                    .set("mode", "zip")
                    .set("emailAddress", this.email);
                let progressWindowConfig: MatDialogConfig = new MatDialogConfig();
                progressWindowConfig.data = {
                    url: this.downloadURL,
                    estimatedDownloadSize: this.filesToDownloadSize,
                    params: downloadParams,
                    suggestedFilename: this.suggestedFilename,
                    fileType: ".zip",
                };
                progressWindowConfig.autoFocus = false;
                this.dialogsService.genericDialogContainer(DownloadProgressComponent, null, null, progressWindowConfig,
                    {actions: [
                            {type: ActionType.SECONDARY, name: "Close", internalAction: "close"}
                        ]});
            } else {
                this.handleBackendError(result, "caching file download list");
            }
        });
    }

    public downloadFDTCommandLine(): void {
        let files: any[] = this.gatherFilesToDownload();
        this.cacheDownloadListFn(files).subscribe((result: any) => {
            if (result && result.result === 'SUCCESS') {
                this.fdtDownloadFn(this.email, true).subscribe((result: any) => {
                    if (!result || result.result !== 'SUCCESS') {
                        this.handleBackendError(result, "retrieving FDT command line instructions");
                    }
                });
            } else {
                this.handleBackendError(result, "caching file download list");
            }
        });
    }

    public downloadFDT(): void {
        let files: any[] = this.gatherFilesToDownload();
        this.cacheDownloadListFn(files).subscribe((result: any) => {
            if (result && result.result === 'SUCCESS') {
                this.fdtDownloadFn(this.email, false).subscribe((result: any) => {
                    if (!result || result.result !== 'SUCCESS') {
                        this.handleBackendError(result, "retrieving FDT Java file");
                    }
                });
            } else {
                this.handleBackendError(result, "caching file download list");
            }
        });
    }

    public createSoftLinks(): void {
        let files: any[] = this.gatherFilesToDownload();
        this.makeSoftLinksFn(files).subscribe((result: any) => {
            if (result && result.result === 'SUCCESS' && result.softLinkPath) {
                this.dialogsService.alert(result.softLinkPath, "Soft Link Path:", DialogType.SUCCESS);
            } else {
                this.handleBackendError(result, "making soft links");
            }
        });
    }

    private handleBackendError(response: any, action: string): void {
        let message: string = "";
        if (response && response.message) {
            message = ": " + response.message;
        }
        this.dialogsService.error("An error occurred while " + action + message);
    }

    public initOrganizeTree(event: any) {
        if (event && event.treeModel) {
            let treeModel = event.treeModel;
            if (this.availableFilesCount < 300) {
                treeModel.expandAll();
            } else {
                treeModel.roots[0].expand();
            }
        }
    }

    public permitDrop($event: any) {
        if ($event) {
            $event.preventDefault();
        }
    }
}
