import {Component, EventEmitter, Inject, Input, OnInit, Output, SimpleChanges} from "@angular/core";

import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {NewGenomeBuildComponent} from "../new-genome-build.component";
import {MatDialogRef, MatDialog, MatDialogConfig} from "@angular/material";
import {NewOrganismComponent} from "../new-organism.component";
import {NewDataTrackFolderComponent} from "../../datatracks/new-datatrackfolder.component";
import {DialogsService} from "../popup/dialogs.service";
import {DataTrackService} from "../../services/data-track.service";
import {Response, URLSearchParams} from "@angular/http";
import {NewDataTrackComponent} from "../../datatracks/new-datatrack.component";
import {DeleteDataTrackComponent} from "../../datatracks/delete-datatrack.component";
import {ConstantsService} from "../../services/constants.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DownloadPickerComponent} from "../download-picker.component";
import {DOCUMENT} from "@angular/common";
import {DownloadProgressComponent} from "../download-progress.component";
import {HttpParams} from "@angular/common/http";
import {Router} from "@angular/router";
import {DictionaryService} from "../../services/dictionary.service";

const DATATRACK = "DATATRACK";
const GENOMEBUILD = "GENOMEBUILD";
const DATATRACKFOLDER = "DATATRACKFOLDER";
const ORGANISM = "ORGANISM";

@Component({
    selector: "menu-header-data-tracks",
    templateUrl: "./menu-header-data-tracks.component.html"
})

export class MenuHeaderDataTracksComponent implements OnInit {
    @Input() selectedNode: any;
    @Input() allActiveNodes: ITreeNode[];
    @Output() onDataTrackFolderCreated: EventEmitter<string> = new EventEmitter<string>();
    @Output() onDataTrackCreated: EventEmitter<string> = new EventEmitter<string>();

    public newDTisDisabled: boolean = true;
    public newGenomeBuildisDisabled: boolean = true;
    public duplicateDTisDisabled: boolean = true;
    public removeDisabled: boolean = true;
    public disableAll: boolean = false;

    private _showMenuItemNewGenomeBuild: boolean = false;
    private _showMenuItemRemove: boolean = false;
    public get showMenuItemNewGenomeBuild(): boolean {
        return this._showMenuItemNewGenomeBuild;
    }
    private _showMenuItemNewOrganism: boolean = false;
    public get showMenuItemNewOrganism(): boolean {
        return this._showMenuItemNewOrganism;
    }

    private isAdminState: boolean = false;


    constructor(private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private dataTrackService: DataTrackService,
                private dialog: MatDialog,
                public constantsService: ConstantsService,
                @Inject(DOCUMENT) private document: Document,
                private router: Router,
                private dictionaryService: DictionaryService) {
    }

    ngOnInit() {
        this.isAdminState = this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin;

        if (this.isAdminState) {
            this._showMenuItemNewGenomeBuild = true;
            this._showMenuItemNewOrganism = true;
            this._showMenuItemRemove = true;
        }

        if (this.createSecurityAdvisorService.isGuest) {
            this.disableAll = true;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.selectedNode) {
            if(this.isAdminState) {
                this.removeDisabled = false;
            } else {
                if(this.selectedNode.data.canWrite === "Y") {
                    this.removeDisabled = false;
                } else {
                    this.removeDisabled = true;
                }
            }

            if (this.selectedNode.data.idDataTrack) {
                this.duplicateDTisDisabled = false;
            } else {
                this.duplicateDTisDisabled = true;
            }

            if (this.selectedNode.data.idDataTrack || this.selectedNode.data.isDataTrackFolder) {
                this.newDTisDisabled = false;
            } else {
                this.newDTisDisabled = true;
            }

            if (this.selectedNode.data.idDataTrack || this.selectedNode.data.isDataTrackFolder || this.selectedNode.data.genomeBuildName) {
                this.newGenomeBuildisDisabled = false;
            } else {
                this.newGenomeBuildisDisabled = true;
            }
        } else {
            this.removeDisabled = true;
        }
    }

    public makeNewDataTrack(): void {
        let dialogRef: MatDialogRef<NewDataTrackComponent> = this.dialog.open(NewDataTrackComponent, {
            height: "23em",
            width: "40em",
            data: {
                selectedItem: this.selectedNode
            }
        });
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.onDataTrackCreated.emit(result);
            }
        });
    }

    public makeNewFolder(): void {
        let dialogRef: MatDialogRef<NewDataTrackFolderComponent> = this.dialog.open(NewDataTrackFolderComponent, {
            height: "18em",
            width: "40em",
            data: {
                selectedItem: this.selectedNode
            }
        });
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.onDataTrackFolderCreated.emit(result);
            }
        });
    }

    public doDuplicate(): void {
        var params: URLSearchParams = new URLSearchParams();

        params.set("idDataTrack", this.selectedNode.data.idDataTrack);
        params.set("idDataTrackFolder", this.selectedNode.data.idDataTrackFolder);
        this.dataTrackService.duplicateDataTrack(params).subscribe((response: Response) => {
            this.dataTrackService.refreshDatatracksList_fromBackend();
        });
    }

    public deleteDataTrack(type: string, params: URLSearchParams): void {
        if (type === DATATRACK) {

            this.dataTrackService.deleteDataTrack(params).subscribe((response: Response) => {
                this.router.navigateByUrl("/datatracks");
                this.dataTrackService.refreshDatatracksList_fromBackend();
            });
        } else if (type === DATATRACKFOLDER) {

            this.dataTrackService.deleteDataTrackFolder(params).subscribe((response: Response) => {
                this.router.navigateByUrl("/datatracks");
                this.dataTrackService.refreshDatatracksList_fromBackend();
            });
        } else if (type === GENOMEBUILD) {

            this.dataTrackService.deleteGenomeBuild(params).subscribe((response: Response) => {
                this.router.navigateByUrl("/datatracks");
                this.dictionaryService.reloadAndRefresh(() => {
                    this.dataTrackService.refreshDatatracksList_fromBackend();
                }, null, DictionaryService.GENOME_BUILD);
            });
        } else if (type === ORGANISM) {

            this.dataTrackService.deleteOrganism(params).subscribe((response: Response) => {
                this.router.navigateByUrl("/datatracks");
                this.dictionaryService.reloadAndRefresh(() => {
                    this.dataTrackService.refreshDatatracksList_fromBackend();
                }, null, DictionaryService.ORGANISM);
            });
        }
    }

    public doRemove(): void {
        var level: string = "";
        var confirmString: string = "";
        var type: string;
        var params: URLSearchParams = new URLSearchParams();

        if (this.selectedNode.data.idDataTrack) {
            let dialogRef: MatDialogRef<DeleteDataTrackComponent> = this.dialog.open(DeleteDataTrackComponent, {
                height: "210px",
                width: "300px",
                data: {
                    selectedItem: this.selectedNode
                }
            });
        } else {
            if (this.selectedNode.data.binomialName) {
                if (this.selectedNode.data.GenomeBuild) {
                    level = "Unable to remove organism. Please remove the genome builds for organism "
                        + this.selectedNode.data.label + " first.";
                    confirmString = "";
                } else {
                    level = "Confirm";
                    confirmString = "Remove organism " + this.selectedNode.data.label + "?";
                    type = ORGANISM;
                    params.set("idOrganism", this.selectedNode.data.idOrganism);
                }
            } else if (this.selectedNode.data.isDataTrackFolder) {
                type = DATATRACKFOLDER;
                params.set("idDataTrackFolder", this.selectedNode.data.idDataTrackFolder);
                if (this.selectedNode.data.DataTrack || this.selectedNode.data.DataTrackFolder) {
                    // TODO
                    level = "Warning";
                    confirmString = "Removing folder " + this.selectedNode.data.name + " will also remove all descendant folders and dataTracks.";
                    confirmString += " Are you sure you want to delete the folder and all of its contents?";
                } else {
                    level = "Confirm";
                    confirmString = "Removing DataTrack Folder " + this.selectedNode.data.name + "?";
                }
            } else if (this.selectedNode.level === 2) {
                if (this.selectedNode.data.DataTrack || this.selectedNode.data.DataTrackFolder) {
                    level = "Please remove folders and data tracks for the " + this.selectedNode.data.label;
                    level += " first.";
                    confirmString = "";
                } else {
                    level = "Confirm";
                    confirmString = "Remove genome build " + this.selectedNode.data.label + "?";
                    type = GENOMEBUILD;
                    params.set("idGenomeBuild", this.selectedNode.data.idGenomeBuild);
                }
            }

            this.dialogsService
                .confirm(level, confirmString)
                .subscribe(
                    res => {
                        if (res) {
                            this.deleteDataTrack(type, params);
                        }
                    }
                );
        }
    }

    public doDownload(): void {
        let itemsToDownload: any[] = [];
        let downloadKeys: string = "";
        for (let node of this.allActiveNodes) {
            let item: any = node.data;
            let dataTracks: any[] = [];
            if (item.idDataTrack) {
                dataTracks.push(item);
            } else {
                this.getChildDataTracks(item, dataTracks);
            }

            for (let dataTrack of dataTracks) {
                // Filter out duplicates
                let keep: boolean = true;
                for (let itemToDownload of itemsToDownload) {
                    if (itemToDownload.idDataTrack === dataTrack.idDataTrack) {
                        keep = false;
                        break;
                    }
                }
                if (keep) {
                    itemsToDownload.push(dataTrack);
                    let idDataTrackFolder: any = dataTrack.idDataTrackFolder ? dataTrack.idDataTrackFolder : "-99";
                    downloadKeys += dataTrack.idDataTrack + "," + idDataTrackFolder + ":";
                }
            }
        }

        if (itemsToDownload.length < 1) {
            this.dialogsService.alert("Please select the data tracks or folders to download");
            return;
        }

        this.dataTrackService.getDownloadEstimatedSize(downloadKeys).subscribe((result: any) => {
            if (result && result.size) {
                if (result.size === "0") {
                    this.dialogsService.alert("No data files exist for the selected item(s)");
                } else {
                    let config: MatDialogConfig = new MatDialogConfig();
                    config.data = {
                        estimatedDownloadSize: result.size,
                        uncompressedDownloadSize: result.uncompressedSize
                    };
                    let dialogRef: MatDialogRef<DownloadPickerComponent> = this.dialog.open(DownloadPickerComponent, config);
                    dialogRef.afterClosed().subscribe((choice: any) => {
                        if (choice) {
                            if (choice === DownloadPickerComponent.DOWNLOAD_NORMAL) {
                                let downloadParams: HttpParams = new HttpParams()
                                    .set("mode", "zip");
                                let progressWindowConfig: MatDialogConfig = new MatDialogConfig();
                                progressWindowConfig.data = {
                                    url: "DownloadDataTrackFileServlet.gx",
                                    estimatedDownloadSize: parseInt(result.size),
                                    params: downloadParams,
                                    suggestedFilename: "gnomex-datatracks",
                                    fileType: ".zip"
                                };
                                progressWindowConfig.disableClose = true;
                                this.dialog.open(DownloadProgressComponent, progressWindowConfig);
                            } else if (choice === DownloadPickerComponent.DOWNLOAD_FDT) {
                                let url: string = this.document.location.href;
                                url = url.substring(0, url.indexOf("/gnomex") + 7);
                                url += "/FastDataTransferDownloadDataTrackServlet.gx";
                                window.open(url, "_blank");
                            }
                        }
                    });
                }
            } else {
                this.handleControllerError(result, "getting estimated size of download");
            }
        });
    }

    private handleControllerError(result: any, action: string): void {
        let message: string = "";
        if (result && result.message) {
            message = ": " + result.message;
        }
        this.dialogsService.alert("An error occurred while " + action + message, null);
    }

    private getChildDataTracks(item: any, children: any[]): void {
        for (let child of item.items) {
            if (child.idDataTrack) {
                children.push(child);
            } else {
                this.getChildDataTracks(child, children);
            }
        }
    }

    private makeNewGenomeBuild(): void {
        let dialogRef: MatDialogRef<NewGenomeBuildComponent> = this.dialog.open(NewGenomeBuildComponent, {
            height: "24em",
            width: "30em",
            data: {
                selectedItem: this.selectedNode
            }
        });
    }

    private makeNewOrganism(): void {
        let dialogRef: MatDialogRef<NewOrganismComponent> = this.dialog.open(NewOrganismComponent, {
            height: "24em",
            width: "30em",
        });
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.dictionaryService.reloadAndRefresh(() => {
                    this.dataTrackService.refreshDatatracksList_fromBackend();
                }, null, DictionaryService.ORGANISM);
            }
        });
    }

}
