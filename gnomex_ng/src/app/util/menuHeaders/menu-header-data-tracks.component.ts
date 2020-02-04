import {Component, EventEmitter, Inject, Input, OnInit, Output, SimpleChanges} from "@angular/core";

import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {NewGenomeBuildComponent} from "../new-genome-build.component";
import {MatDialogConfig} from "@angular/material";
import {NewOrganismComponent} from "../new-organism.component";
import {NewDataTrackFolderComponent} from "../../datatracks/new-datatrackfolder.component";
import {DialogsService, DialogType} from "../popup/dialogs.service";
import {DataTrackService} from "../../services/data-track.service";
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
import {IGnomexErrorResponse} from "../interfaces/gnomex-error.response.model";
import {ActionType} from "../interfaces/generic-dialog-action.model";
import {UtilService} from "../../services/util.service";

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
    @Output() onGenomeBuildCreated: EventEmitter<string> = new EventEmitter<string>();
    @Output() onOrganismCreated: EventEmitter<string> = new EventEmitter<string>();

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
        let title: string = "Add new data track to ";
        let idAppUser:string = "" + this.createSecurityAdvisorService.idAppUser;

        if(this.selectedNode.data.isDataTrack) {
            title += this.selectedNode.parent.data.label;
        } else {
            title += this.selectedNode.data.label;
        }
        title = UtilService.getSubStr(title, 65);

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "40em";
        config.height = "23em";
        config.data = {
            selectedItem: this.selectedNode,
            idAppUser: idAppUser
        };
        this.dialogsService.genericDialogContainer(NewDataTrackComponent, title, this.constantsService.ICON_DATATRACK, config,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
            if (result) {
                this.onDataTrackCreated.emit(result);
            }
        });
    }

    public makeNewFolder(): void {
        let title: string = "Add new data track folder to ";

        if(this.selectedNode.data.isDataTrack) {
            title += this.selectedNode.parent.data.label;
        } else {
            title += this.selectedNode.data.label;
        }
        title = UtilService.getSubStr(title, 65);

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "40em";
        config.height = "18em";
        config.data = {
            selectedItem: this.selectedNode
        };



        this.dialogsService.genericDialogContainer(NewDataTrackFolderComponent, title, this.constantsService.ICON_FOLDER_GROUP, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
            if(result) {
                this.onDataTrackFolderCreated.emit(result);
            }
        });
    }

    public doDuplicate(): void {
        this.dialogsService.addSpinnerWorkItem();
        let params: HttpParams = new HttpParams()
            .set("idDataTrack", this.selectedNode.data.idDataTrack)
            .set("idDataTrackFolder", this.selectedNode.data.idDataTrackFolder);

        this.dataTrackService.duplicateDataTrack(params).subscribe((response: any) => {
            this.dialogsService.removeSpinnerWorkItem();
            this.onDataTrackCreated.emit(response.idDataTrack);
        }, (err:IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    public deleteDataTrack(type: string, params:HttpParams): void {

        if (type === DATATRACK) {
            this.dialogsService.startDefaultSpinnerDialog();
            this.dataTrackService.deleteDataTrack(params).subscribe((response: any) => {
                this.dataTrackService.getActiveNodeAttribute(this.selectedNode.parent);
                this.router.navigateByUrl("/datatracks");
                this.dataTrackService.refreshDatatracksList_fromBackend();
            }, (err:IGnomexErrorResponse) =>{
                this.dialogsService.stopAllSpinnerDialogs();
            });
        } else if (type === DATATRACKFOLDER) {
            this.dialogsService.startDefaultSpinnerDialog();
            this.dataTrackService.deleteDataTrackFolder(params).subscribe((response: any) => {
                this.dataTrackService.getActiveNodeAttribute(this.selectedNode.parent);
                this.router.navigateByUrl("/datatracks");
                this.dataTrackService.refreshDatatracksList_fromBackend();
            },(err:IGnomexErrorResponse) => {
                this.dialogsService.stopAllSpinnerDialogs();
            });
        } else if (type === GENOMEBUILD) {
            this.dialogsService.startDefaultSpinnerDialog();
            this.dataTrackService.deleteGenomeBuild(params).subscribe((response: any) => {
                this.dataTrackService.getActiveNodeAttribute(this.selectedNode.parent);
                this.router.navigateByUrl("/datatracks");
                this.dictionaryService.reloadAndRefresh(() => {
                    this.dataTrackService.refreshDatatracksList_fromBackend();
                }, null, DictionaryService.GENOME_BUILD);
            },(err:IGnomexErrorResponse) =>{
                this.dialogsService.stopAllSpinnerDialogs();
            });
        } else if (type === ORGANISM) {
            this.dialogsService.startDefaultSpinnerDialog();
            this.dataTrackService.deleteOrganism(params).subscribe((response: any) => {
                this.dataTrackService.getActiveNodeAttribute(this.selectedNode.parent);
                this.router.navigateByUrl("/datatracks");
                this.dictionaryService.reloadAndRefresh(() => {
                    this.dataTrackService.refreshDatatracksList_fromBackend();
                }, null, DictionaryService.ORGANISM);
            }, (err:IGnomexErrorResponse) =>{
                this.dialogsService.stopAllSpinnerDialogs();
            });
        }
    }

    public doRemove(): void {
        var level: string = "";
        var confirmString: string = "";
        var type: string;
        let params: HttpParams = new HttpParams();

        if (this.selectedNode.data.idDataTrack) {
            let config: MatDialogConfig = new MatDialogConfig();
            config.height = "15em";
            config.width = "35em";
            config.data = {
                selectedItem: this.selectedNode
            };
            this.dialogsService.genericDialogContainer(DeleteDataTrackComponent, "Confirm: Delete Data Track", this.selectedNode.data.icon, config,
                {actions: [
                        {type: ActionType.PRIMARY, name: "Yes", internalAction: "delete"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]});
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
                    params = params.set("idOrganism", this.selectedNode.data.idOrganism);
                }
            } else if (this.selectedNode.data.isDataTrackFolder) {
                type = DATATRACKFOLDER;
                params = params.set("idDataTrackFolder", this.selectedNode.data.idDataTrackFolder);
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
                    params = params.set("idGenomeBuild", this.selectedNode.data.idGenomeBuild);
                    params = params.set("idGenomeBuild", this.selectedNode.data.idGenomeBuild);
                }
            }

            if(confirmString) {
                this.dialogsService.confirm(confirmString, level).subscribe(res => {
                        if (res) {
                            this.deleteDataTrack(type, params);
                        }
                    });
            } else {
                this.dialogsService.alert(level, "Warning", DialogType.WARNING);
            }
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
            this.dialogsService.alert("Please select the data tracks or folders to download", null, DialogType.FAILED);
            return;
        }

        this.dataTrackService.getDownloadEstimatedSize(downloadKeys).subscribe((result: any) => {
            if (result && result.size) {
                if (result.size === "0") {
                    this.dialogsService.alert("No data files exist for the selected item(s)", "Data Not Found");
                } else {
                    let config: MatDialogConfig = new MatDialogConfig();
                    config.width = "35em";
                    config.height = "15em";
                    config.data = {
                        estimatedDownloadSize: result.size,
                        uncompressedDownloadSize: result.uncompressedSize
                    };
                    this.dialogsService.genericDialogContainer(DownloadPickerComponent, "Confirm Download", null, config)
                        .subscribe((choice: any) => {
                            if (choice) {
                                if (choice === DownloadPickerComponent.DOWNLOAD_NORMAL) {
                                    let downloadParams: HttpParams = new HttpParams()
                                        .set("mode", "zip");
                                    let progressWindowConfig: MatDialogConfig = new MatDialogConfig();
                                    progressWindowConfig.width = "35em";
                                    progressWindowConfig.data = {
                                        url: "DownloadDataTrackFileServlet.gx",
                                        estimatedDownloadSize: parseInt(result.size),
                                        params: downloadParams,
                                        suggestedFilename: "gnomex-datatracks",
                                        fileType: ".zip"
                                    };
                                    progressWindowConfig.disableClose = true;
                                    this.dialogsService.genericDialogContainer(DownloadProgressComponent, null, null, progressWindowConfig,
                                        {actions: [
                                                {type: ActionType.SECONDARY, name: "Cancel", internalAction: "close"}
                                            ]});
                                } else if (choice === DownloadPickerComponent.DOWNLOAD_FDT) {
                                    let url: string = this.document.location.href;
                                    url = url.substring(0, url.indexOf("/gnomex") + 7);
                                    url += "/FastDataTransferDownloadDataTrackServlet.gx";
                                    window.open(url, "_blank");
                                }
                            }
                    });
                }
            }
        }, (err:IGnomexErrorResponse) => {
            this.handleControllerError(err.gError, "getting estimated size of download");
        });
    }

    private handleControllerError(result: any, action: string): void {
        let message: string = "";
        if (result && result.message) {
            message = ": " + result.message;
        }
        this.dialogsService.error("An error occurred while " + action + message);
    }

    private getChildDataTracks(item: any, children: any[]): void {
        if(item.items) {
            for (let child of item.items) {
                if (child.idDataTrack) {
                    children.push(child);
                } else {
                    this.getChildDataTracks(child, children);
                }
            }
        }
    }

    public makeNewGenomeBuild(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "35em";
        configuration.autoFocus = false;
        configuration.data = {
            selectedItem: this.selectedNode
        };

        this.dialogsService.genericDialogContainer(NewGenomeBuildComponent, "New Genome Build", this.constantsService.ICON_GENOME_BUILD, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
            if(result) {
                this.onGenomeBuildCreated.emit(result);
            }
        });
    }

    public makeNewOrganism(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width = "35em";

        this.dialogsService.genericDialogContainer(NewOrganismComponent, "New Species", this.constantsService.ICON_ORGANISM, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
            if(result) {
                this.onOrganismCreated.emit(result);
            }
        });
    }

}
