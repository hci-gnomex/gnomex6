import {Component} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef} from "@angular/material";
import {OrganismService} from "../services/organism.service";

@Component({
    selector: 'new-organism',
    templateUrl: "./new-organism.component.html",
})

export class NewOrganismComponent {

    public commonName: string = "";
    public binomialName: string = "";
    public das2Name: string = "";
    public activeFlag: boolean = true;

    public showSpinner: boolean = false;

    constructor(public dialogRef: MatDialogRef<NewOrganismComponent>,
                private organismService: OrganismService) {
    }

    public save(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("organism", this.commonName);
        params.set("binomialName", this.binomialName);
        params.set("das2Name", this.das2Name);
        params.set("isActive", this.activeFlag ? "Y" : "N");
        this.organismService.saveOrganism(params).subscribe((response: Response) => {
            this.showSpinner = false;
            this.dialogRef.close();
        });
    }

}
