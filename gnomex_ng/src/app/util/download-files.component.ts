import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material";
import {ConstantsService} from "../services/constants.service";
import {ITreeOptions, TREE_ACTIONS, TreeComponent, TreeModel, TreeNode} from "angular-tree-component";
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

@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div class="full-height full-width flex-container-col padded">
                <div class="flex-container-row align-center justify-space-between">
                    <label>
                        Drag files or folders that you want to download. Hold CTRL or SHIFT key to select multiple.
                    </label>
                    <context-help name="downloadhelp" 
                                  label="Download Help"
                                  popupTitle="Download Help"
                                  [hasEditPermission]="this.securityAdvisor.isAdmin">
                    </context-help>
                </div>
                <div class="trees-container">
                    <as-split class="white-split-gutter silver-bordered-gutter">
                        <as-split-area size="50">
                            <div class="full-width full-height flex-container-col padded">
                                <label>
                                    Available Files
                                </label>
                                <div class="flex-grow" ondrop="permitDrop($event)" (dragover)="onRemoveFromDownload($event)">
                                    <tree-root #availableFilesTreeComponent
                                               [nodes]="availableFilesNodes"
                                               [options]="filesOptions"
                                               (initialized)="initOrganizeTree($event)">
                                        <ng-template #treeNodeTemplate let-node draggable="true">
                                            <div class="flex-container-row tree-node-font">
                                                <img [src]="node.data.icon" alt="" class="icon tree-node-icon">
                                                <div>
                                                    {{ node.data.displayName }}
                                                </div>
                                            </div>
                                        </ng-template>
                                    </tree-root>
                                </div>
                            </div>
                        </as-split-area>
                        <as-split-area size="50">
                            <div class="full-width full-height flex-container-col padded">
                                <label>Files to Download</label>
                                <div class="flex-grow" ondrop="permitDrop($event)" (dragover)="onDropInDownload($event)">
                                    <tree-root #filesToDownloadTreeComponent
                                               [nodes]="filesToDownloadNodes"
                                               [options]="filesOptions">
                                        <ng-template #treeNodeTemplate let-node draggable="true">
                                            <div class="flex-container-row tree-node-font">
                                                <img [src]="node.data.icon" alt="" class="icon tree-node-icon">
                                                <div>
                                                    {{ node.data.displayName }}
                                                </div>
                                            </div>
                                        </ng-template>
                                    </tree-root>
                                </div>
                            </div>
                        </as-split-area>
                    </as-split>
                </div>
                <div class="flex-container-row justify-space-between">
                    <label>
                        {{ availableFilesCount }} file(s)
                    </label>
                    <label>
                        {{ filesToDownloadCount }} file(s) ({{ filesToDownloadSizeLabel }})
                    </label>
                </div>
            </div>
            <mat-dialog-actions
                    class="justify-flex-end no-margin no-padding generic-dialog-footer-colors">
                <div class="double-padded-right">
                    <button mat-raised-button 
                            color="primary" 
                            class="primary-action" 
                            [disabled]="filesToDownloadCount < 1" 
                            (click)="download()">
                        <img [src]="constantsService.ICON_DOWNLOAD" alt="" class="icon">
                        Download
                    </button>
                    <button mat-raised-button 
                            color="primary" 
                            class="primary-action" 
                            [disabled]="filesToDownloadCount < 1 || !isFDTSupported" 
                            (click)="downloadFDTCommandLine()">
                        <img [src]="constantsService.ICON_DOWNLOAD_LARGE" alt="" class="icon">
                        FDT Command Line
                    </button>
                    <button mat-raised-button 
                            color="primary" 
                            class="primary-action" 
                            [disabled]="filesToDownloadCount < 1 || !isFDTSupported" 
                            (click)="downloadFDT()">
                        <img [src]="constantsService.ICON_DOWNLOAD_LARGE" alt="" class="icon">
                        FDT Download
                    </button>
                    <button mat-raised-button 
                            color="primary" 
                            class="primary-action" 
                            *ngIf="showCreateSoftLinks" 
                            [disabled]="filesToDownloadCount < 1" 
                            (click)="createSoftLinks()">
                        <img [src]="constantsService.ICON_DOWNLOAD" alt="" class="icon">
                        Create Soft Links
                    </button>
                    <button mat-raised-button
                            mat-dialog-close
                            color="accent"
                            class="secondary-action">
                        Cancel
                    </button>
                </div>
            </mat-dialog-actions>
        </div>
    `,
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

    @ViewChild("availableFilesTreeComponent") private availableFilesTreeComponent: TreeComponent;
    public availableFilesNodes: any[] = [];
    public availableFilesCount: number = 0;

    @ViewChild("filesToDownloadTreeComponent") private filesToDownloadTreeComponent: TreeComponent;
    public filesToDownloadNodes: any[] = [];
    public filesToDownloadCount: number = 0;
    private filesToDownloadSize: number = 0;
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
                public securityAdvisor: CreateSecurityAdvisorService) {
        super();
    }

    ngOnInit() {
        this.utilService.registerChangeDetectorRef(this.changeDetector);
        this.filesOptions = {
            idField: 'fileTreeID',
            displayField: 'displayName',
            childrenField: 'FileDescriptor',
            allowDrag: true,
            allowDrop: true,
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
                            TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event)
                            this.treeMostRecentlySelectedFrom = tree
                        }
                    }
                },
            },
        };

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
            });
        }

        this.isFDTSupported = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_FDT_SUPPORTED);

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
        this.filesToDownloadTreeComponent.treeModel.filterNodes((node: TreeNode) => {
            return node.data.isSelected === 'Y';
        });
        this.filesToDownloadCount = this.countFilesRecursively(this.filesToDownloadNodes[0], true);
        this.filesToDownloadSize = this.countFileSizeRecursively(this.filesToDownloadNodes[0], true);
        this.filesToDownloadSizeLabel = FileService.formatFileSize(this.filesToDownloadSize);
    }

    private countFilesRecursively(fileNode: any, filterSelectedOnly: boolean = false): number {
        if (filterSelectedOnly && fileNode.isSelected === 'N') {
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
        if (filterSelectedOnly && fileNode.isSelected === 'N') {
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
        }
        // File de-selected to be downloaded
        else if (tree === this.availableFilesTreeComponent.treeModel && from === this.filesToDownloadTreeComponent) {
            let files : TreeNode[] = from.treeModel.getActiveNodes();
            for(let file of files){
                this.selectFilesRecursively(file.data, 'N');
            }
            this.updateFilesToDownloadTree();
        }
    };

    public onDropInDownload(event: any): void {
        return this.moveNode(this.filesToDownloadTreeComponent.treeModel, null, event, {from: this.availableFilesTreeComponent, to: this.filesToDownloadTreeComponent});
    }

    public onRemoveFromDownload(event: any): void {
        if (this.treeMostRecentlySelectedFrom === this.filesToDownloadTreeComponent.treeModel) {
            return this.moveNode(this.availableFilesTreeComponent.treeModel, null, event, {from: this.filesToDownloadTreeComponent, to: this.availableFilesTreeComponent});
        }
    }

    private gatherFilesToDownload(): any[] {
        if (this.filesToDownloadNodes && Array.isArray(this.filesToDownloadNodes) && this.filesToDownloadNodes.length > 0) {
            return this.gatherFilesToDownloadHelper(this.filesToDownloadNodes[0]);
        }
    }

    private gatherFilesToDownloadHelper(fileNode: any): any[] {
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
        this.cacheDownloadListFn(files).subscribe((result: any) => {
            if (result && result.result === 'SUCCESS') {
                let downloadParams: HttpParams = new HttpParams()
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

    public initOrganizeTree(event: any){
        if (event && event.treeModel) {
            event.treeModel.expandAll();
        }
    }

    public permitDrop($event: any) {
        if (event) {
            event.preventDefault();
        }
    }
}
