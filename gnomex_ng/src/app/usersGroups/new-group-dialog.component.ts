import {Component, OnInit} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: 'new-group-dialog',
    templateUrl: "./new-group-dialog.html",
})

export class NewGroupDialogComponent implements OnInit{
    private firstName: string = "";
    private lastName: string = "";
    private phone: string = "";
    private email: string = "";
    public rebuildGroups: boolean = false;
    public showSpinner: boolean = false;
    public emailFC: FormControl;
    public pricingFC: FormControl;

    public addGroupFG: FormGroup;

    constructor(public dialogRef: MatDialogRef<NewGroupDialogComponent>,
                private labListService: LabListService,
    ) {
        this.emailFC = new FormControl("", [Validators.required, Validators.email]);
        this.pricingFC = new FormControl("", [Validators.required]);
        this.addGroupFG = new FormGroup({
            email: this.emailFC,
            pricing: this.pricingFC
            }
        )
        this.pricingFC.setValue("INTERNAL");
    }

    ngOnInit() {
    }

    onEmailChange(event) {
        this.emailFC.setValue(event.srcElement.value)
    }

    public save(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("accountsXMLString", "");
        params.set("collaboratorsXMLString", "");
        params.set("contactPhone", this.phone);
        params.set("contactEmail", this.emailFC.value);
        params.set("firstName", this.firstName);
        params.set("idLab", '0');
        if (this.pricingFC.value === "INTERNAL") {
            params.set("isExternalPricing", "N");
            params.set("isExternalPricingCommercial", "N");

        } else if (this.pricingFC.value === "EXACADEMIC") {
            params.set("isExternalPricing", "Y");
            params.set("isExternalPricingCommercial", "N");

        } else if (this.pricingFC.value === "EXCOMM") {
            params.set("isExternalPricing", "Y");
            params.set("isExternalPricingCommercial", "Y");
        }
        params.set("institutionsXMLString", "");
        params.set("lastName", this.lastName);
        params.set("managersXMLString", "");
        params.set("membersXMLString", "");

        this.labListService.saveLab(params).subscribe((response: Response) => {
            if (response.status === 200) {
                let responseJSON: any = response.json();
                if (responseJSON.result && responseJSON.result === "SUCCESS") {
                    this.rebuildGroups = true;
                    this.showSpinner = false;
                }
            }
            this.dialogRef.close();
        });
    }
}