import {Component, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';

import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {NewGenomeBuildComponent} from "../new-genome-build.component";
import {MatDialogRef, MatDialog} from '@angular/material';
import {NewOrganismComponent} from "../new-organism.component";
import {NewDataTrackFolderComponent} from "../../datatracks/new-datatrackfolder.component";
import {DialogsService} from "../popup/dialogs.service";
import {DataTrackService} from "../../services/data-track.service";
import {Response, URLSearchParams} from "@angular/http";
import {NewDataTrackComponent} from "../../datatracks/new-datatrack.component";
import {DeleteDataTrackComponent} from "../../datatracks/delete-datatrack.component";

const DATATRACK = "DATATRACK";
const GENOMEBUILD = "GENOMEBUILD";
const DATATRACKFOLDER = "DATATRACKFOLDER";
const ORGANISM = "ORGANISM";

@Component({
    selector: 'menu-header-data-tracks',
    templateUrl: "./menu-header-data-tracks.component.html"
})

export class MenuHeaderDataTracksComponent implements OnInit {
    @Input() selectedNode: any;
    private _showMenuItemNewGenomeBuild: boolean = false;
    private _showMenuItemRemove: boolean = false;
    public get showMenuItemNewGenomeBuild(): boolean {
        return this._showMenuItemNewGenomeBuild;
    }
    private _showMenuItemNewOrganism: boolean = false;
    public get showMenuItemNewOrganism(): boolean {
        return this._showMenuItemNewOrganism;
    }
    public newDTisDisabled: boolean = true;
    public newGenomeBuildisDisabled: boolean = true;
    public duplicateDTisDisabled: boolean = true;

    constructor(private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private dataTrackService: DataTrackService,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        let isAdminState: boolean = this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin;

        if (isAdminState) {
            this._showMenuItemNewGenomeBuild = true;
            this._showMenuItemNewOrganism = true;
            this._showMenuItemRemove = true;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.selectedNode) {
            if (this.selectedNode.data.idDataTrack) {
                this.duplicateDTisDisabled = false;
            }
            else {
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
        }
    }

    public makeNewDataTrack(): void {
        let dialogRef: MatDialogRef<NewDataTrackComponent> = this.dialog.open(NewDataTrackComponent, {
            height: '390px',
            width: '300px',
            data: {
                selectedItem: this.selectedNode
            }
        });
    }

    public makeNewFolder(): void {
        let dialogRef: MatDialogRef<NewDataTrackFolderComponent> = this.dialog.open(NewDataTrackFolderComponent, {
            height: '350px',
            width: '300px',
            data: {
                selectedItem: this.selectedNode
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

    public deleteDataTrack(type: string, params:URLSearchParams): void {
        if (type === DATATRACK) {

            this.dataTrackService.deleteDataTrack(params).subscribe((response: Response) => {
                this.dataTrackService.refreshDatatracksList_fromBackend();
            });
        }
        else if (type === DATATRACKFOLDER) {

            this.dataTrackService.deleteDataTrackFolder(params).subscribe((response: Response) => {
                this.dataTrackService.refreshDatatracksList_fromBackend();
            });
        }
        else if (type === GENOMEBUILD) {

            this.dataTrackService.deleteGenomeBuild(params).subscribe((response: Response) => {
                this.dataTrackService.refreshDatatracksList_fromBackend();
            });
        }
        else if (type === ORGANISM) {

            this.dataTrackService.deleteOrganism(params).subscribe((response: Response) => {
                this.dataTrackService.refreshDatatracksList_fromBackend();
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
                height: '210px',
                width: '300px',
                data: {
                    selectedItem: this.selectedNode
                }
            });
        }
        else {
            if (this.selectedNode.data.binomialName) {
                if (this.selectedNode.data.GenomeBuild) {
                    level = "Unable to remove organism. Please remove the genome builds for organism "
                        + this.selectedNode.data.label + " first.";
                    confirmString = "";
                }
                else {
                    level = "Confirm";
                    confirmString = "Remove organism " + this.selectedNode.data.label + "?";
                    type = ORGANISM;
                    params.set("idOrganism", this.selectedNode.data.idOrganism);
                }
            }
            else if (this.selectedNode.data.isDataTrackFolder) {
                type = DATATRACKFOLDER;
                params.set("idDataTrackFolder", this.selectedNode.data.idDataTrackFolder);
                if (this.selectedNode.data.DataTrack || this.selectedNode.data.DataTrackFolder) {
                    // TODO
                    level = "Warning";
                    confirmString = "Removing folder " + this.selectedNode.data.name + " will also remove all descendant folders and dataTracks.";
                    confirmString += " Are you sure you want to delete the folder and all of its contents?"
                } else {
                    level = "Confirm";
                    confirmString = "Removing DataTrack Folder " + this.selectedNode.data.name + "?";
                }
            }
            else if (this.selectedNode.level === 2) {
                if (this.selectedNode.data.DataTrack || this.selectedNode.data.DataTrackFolder) {
                    level = "Please remove folders and data tracks for the " + this.selectedNode.data.label;
                    level += " first.";
                    confirmString = "";
                }
                else {
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

    private makeNewGenomeBuild(): void {
        let dialogRef: MatDialogRef<NewGenomeBuildComponent> = this.dialog.open(NewGenomeBuildComponent, {
            height: '430px',
            width: '300px',
            data: {
                selectedItem: this.selectedNode
            }
        });
    }

    private makeNewOrganism(): void {
        let dialogRef: MatDialogRef<NewOrganismComponent> = this.dialog.open(NewOrganismComponent, {
            height: '430px',
            width: '300px',
        });
    }

}
