import {Component} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef} from "@angular/material";
import {OrganismService} from "../services/organism.service";
import {DataTrackService} from "../services/data-track.service";

@Component({
    selector: 'new-genome-build',
    templateUrl: "./new-genome-build.component.html",
})

export class NewGenomeBuildComponent {

    public idOrganism: string = "";
    public name: string = "";
    public buildDate: string = "";
    public activeFlag: boolean = true;

    public das2OrganismList: any[] = [];

    public showSpinner: boolean = false;

    constructor(public dialogRef: MatDialogRef<NewGenomeBuildComponent>,
                private organismService: OrganismService,
                private dataTrackService: DataTrackService) {
        this.organismService.getDas2OrganismList().subscribe((response: any[]) => {
            this.das2OrganismList = response;
        });
    }

    public buildDateChange(event: any): void {
        if (event.value != null) {
            this.buildDate = event.value.toLocaleDateString();
        } else {
            this.buildDate = "";
        }
    }

    public onOrganismSelect(event: any): void {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.idOrganism = event.args.item.value;
        } else {
            this.resetOrganismSelection();
        }
    }

    public onOrganismUnselect(): void {
        this.resetOrganismSelection();
    }

    private resetOrganismSelection(): void {
        this.idOrganism = "";
    }

    public save(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("das2Name", this.name);
        params.set("genomeBuildName", this.name);
        params.set("buildDate", this.buildDate);
        params.set("idOrganism", this.idOrganism);
        params.set("isActive", this.activeFlag ? "Y" : "N");
        this.dataTrackService.saveGenomeBuild(params).subscribe((response: Response) => {
            this.showSpinner = false;
            this.dialogRef.close();
        });
    }

}
