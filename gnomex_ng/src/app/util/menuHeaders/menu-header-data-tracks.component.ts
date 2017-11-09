import {Component, OnInit} from '@angular/core';

import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {NewGenomeBuildComponent} from "../new-genome-build.component";
import {MatDialogRef, MatDialog} from '@angular/material';
import {NewOrganismComponent} from "../new-organism.component";

@Component({
    selector: 'menu-header-data-tracks',
    templateUrl: "./menu-header-data-tracks.component.html"
})

export class MenuHeaderDataTracksComponent implements OnInit {
    private _showMenuItemNewGenomeBuild: boolean = false;
    public get showMenuItemNewGenomeBuild(): boolean {
        return this._showMenuItemNewGenomeBuild;
    }

    private _showMenuItemNewOrganism: boolean = false;
    public get showMenuItemNewOrganism(): boolean {
        return this._showMenuItemNewOrganism;
    }

    constructor(private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        let isAdminState: boolean = this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin;

        if (isAdminState) {
            this._showMenuItemNewGenomeBuild = true;
            this._showMenuItemNewOrganism = true;
        }
    }

    public makeNewDataTrack(): void {
        // TODO
    }

    public makeNewFolder(): void {
        // TODO
    }

    public doDuplicate(): void {
        // TODO
    }

    public doRemove(): void {
        // TODO
    }

    public doDownload(): void {
        // TODO
    }

    private makeNewGenomeBuild(): void {
        let dialogRef: MatDialogRef<NewGenomeBuildComponent> = this.dialog.open(NewGenomeBuildComponent, {
            height: '430px',
            width: '300px',
        });
    }

    private makeNewOrganism(): void {
        let dialogRef: MatDialogRef<NewOrganismComponent> = this.dialog.open(NewOrganismComponent, {
            height: '430px',
            width: '300px',
        });
    }

}
