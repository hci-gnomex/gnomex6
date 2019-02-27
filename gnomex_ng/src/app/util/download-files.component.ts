import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {ConstantsService} from "../services/constants.service";
import {ITreeOptions, TreeComponent, TreeModel, TreeNode} from "angular-tree-component";
import {PropertyService} from "../services/property.service";
import {FileService} from "../services/file.service";
import {Observable} from "rxjs";
import {DialogsService} from "./popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {DownloadProgressComponent} from "./download-progress.component";

@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div mat-dialog-title class="no-margin-force no-padding">
                <div class="dialog-header-colors padded">
                    Select Files to Download
                </div>
            </div>
            <div mat-dialog-content class="full-height no-padding-force no-margin-force">
                <div class="full-height full-width flex-container-col padded">
                    <div class="flex-container-row justify-center">
                        <label>Drag files or folders that you want to download</label>
                    </div>
                    <div class="flex-container-row justify-space-between">
                        <label>Available Files</label>
                        <label>Files to Download</label>
                    </div>
                    <div class="trees-container">
                        <as-split>
                            <as-split-area size="50">
                                <tree-root #availableFilesTreeComponent
                                           [nodes]="this.availableFilesNodes"
                                           [options]="this.filesOptions">
                                    <ng-template #treeNodeTemplate let-node>
                                        <img src="{{node.data.icon}}" class="icon">
                                        <span>{{node.data.displayName}}</span>
                                    </ng-template>
                                </tree-root>
                            </as-split-area>
                            <as-split-area size="50">
                                <tree-root #filesToDownloadTreeComponent
                                           [nodes]="this.filesToDownloadNodes"
                                           [options]="this.filesOptions">
                                    <ng-template #treeNodeTemplate let-node>
                                        <img src="{{node.data.icon}}" class="icon">
                                        <span>{{node.data.displayName}}</span>
                                    </ng-template>
                                </tree-root>
                            </as-split-area>
                        </as-split>
                    </div>
                    <div class="flex-container-row justify-space-between">
                        <label>{{this.availableFilesCount}} file(s)</label>
                        <label>{{this.filesToDownloadCount}} file(s) ({{this.filesToDownloadSizeLabel}})</label>
                    </div>
                </div>
            </div>
            <mat-dialog-actions class="justify-flex-end no-margin-force">
                <button mat-button [disabled]="this.filesToDownloadCount < 1" (click)="this.download()"><img [src]="this.constantsService.ICON_DOWNLOAD" class="icon">Download</button>
                <button mat-button [disabled]="this.filesToDownloadCount < 1 || !this.isFDTSupported" (click)="this.downloadFDTCommandLine()"><img [src]="this.constantsService.ICON_DOWNLOAD_LARGE" class="icon">FDT Command Line</button>
                <button mat-button [disabled]="this.filesToDownloadCount < 1 || !this.isFDTSupported" (click)="this.downloadFDT()"><img [src]="this.constantsService.ICON_DOWNLOAD_LARGE" class="icon">FDT Download</button>
                <button mat-button *ngIf="this.showCreateSoftLinks" [disabled]="this.filesToDownloadCount < 1" (click)="this.createSoftLinks()"><img [src]="this.constantsService.ICON_DOWNLOAD" class="icon">Create Soft Links</button>
                <button mat-button mat-dialog-close>Cancel</button>
            </mat-dialog-actions>
        </div>
    `,
    styles:[`
        div.trees-container {
            width: 60em;
            height: 25em;
            border: solid lightgrey 1px;
            padding: 0.3em;
        }
        .no-padding-force {
            padding: 0 !important;
        }
        .no-margin-force {
            margin: 0 !important;
        }
    `]
})
export class DownloadFilesComponent implements OnInit {

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

    constructor(private dialogRef: MatDialogRef<DownloadFilesComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                public constantsService: ConstantsService,
                private propertyService: PropertyService,
                private fileService: FileService,
                private dialogsService: DialogsService,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        this.filesOptions = {
            idField: 'fileTreeID',
            displayField: 'displayName',
            childrenField: 'FileDescriptor',
            allowDrag: true,
            allowDrop: true,
            actionMapping: {
                mouse: {
                    drop: this.moveNode,
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
        let file: any = from.data;

        // File selected to be downloaded
        if (tree === this.filesToDownloadTreeComponent.treeModel && (file.isSelected === 'N' || !this.isFullySelected(file))) {
            this.selectFilesRecursively(file, 'Y');
            let n: TreeNode = from;
            while (n) {
                n.data.isSelected = 'Y';
                n = n.parent;
            }
            this.updateFilesToDownloadTree();
        }
        // File de-selected to be downloaded
        else if (tree === this.availableFilesTreeComponent.treeModel && file.isSelected === 'Y') {
            this.selectFilesRecursively(file, 'N');
            this.updateFilesToDownloadTree();
        }
    };

    private gatherFilesToDownload(fileNode: any): any[] {
        if (fileNode.isSelected === 'N') {
            return [];
        }

        if (fileNode.fileSize && fileNode.type !== 'dir') {
            return [fileNode];
        } else if (fileNode.FileDescriptor && fileNode.FileDescriptor.length > 0) {
            let children: any[] = [];
            for (let childNode of fileNode.FileDescriptor) {
                children.push(...this.gatherFilesToDownload(childNode));
            }
            return children;
        } else {
            return [];
        }
    }

    public download(): void {
        let files: any[] = this.gatherFilesToDownload(this.filesToDownloadNodes[0]);
        this.cacheDownloadListFn(files).subscribe((result: any) => {
            if (result && result.result === 'SUCCESS') {
                let downloadParams: HttpParams = new HttpParams()
                    .set("mode", "zip")
                    .set("emailAddress", "");
                let progressWindowConfig: MatDialogConfig = new MatDialogConfig();
                progressWindowConfig.data = {
                    url: this.downloadURL,
                    estimatedDownloadSize: this.filesToDownloadSize,
                    params: downloadParams,
                    suggestedFilename: this.suggestedFilename,
                    fileType: ".zip",
                };
                progressWindowConfig.disableClose = true;
                this.dialog.open(DownloadProgressComponent, progressWindowConfig);
            } else {
                this.handleBackendError(result, "caching file download list");
            }
        });
    }

    public downloadFDTCommandLine(): void {
        let files: any[] = this.gatherFilesToDownload(this.filesToDownloadNodes[0]);
        this.cacheDownloadListFn(files).subscribe((result: any) => {
            if (result && result.result === 'SUCCESS') {
                this.fdtDownloadFn("", true).subscribe((result: any) => {
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
        let files: any[] = this.gatherFilesToDownload(this.filesToDownloadNodes[0]);
        this.cacheDownloadListFn(files).subscribe((result: any) => {
            if (result && result.result === 'SUCCESS') {
                this.fdtDownloadFn("", false).subscribe((result: any) => {
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
        let files: any[] = this.gatherFilesToDownload(this.filesToDownloadNodes[0]);
        this.makeSoftLinksFn(files).subscribe((result: any) => {
            if (result && result.result === 'SUCCESS' && result.softLinkPath) {
                this.dialogsService.alert(result.softLinkPath, "Soft Link Path:");
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
        this.dialogsService.confirm("An error occurred while " + action + message, null);
    }

}
