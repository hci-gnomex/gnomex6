import {Component, OnInit} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {
    FormBuilder, FormControl, FormGroup, Validators
} from "@angular/forms";

@Component({
    selector: 'new-group-dialog',
    templateUrl: "./new-group-dialog.html",
})

export class NewGroupDialogComponent implements OnInit{
    public rebuildGroups: boolean = false;
    public showSpinner: boolean = false;
    public emailFC: FormControl;
    public pricingFC: FormControl;
    public phoneFC: FormControl;
    public addGroupFG: FormGroup;


    constructor(public dialogRef: MatDialogRef<NewGroupDialogComponent>,
                private labListService: LabListService,
                private formBuilder: FormBuilder
    ) {
   }

    ngOnInit() {
        this.emailFC = new FormControl("", [Validators.required, Validators.pattern("^((\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*)\\s*[,]{0,1}\\s*)+$")]);
        this.pricingFC = new FormControl("", [Validators.required]);
        this.phoneFC = new FormControl("");
        this.addGroupFG = this.formBuilder.group({
            lastName: '',
            firstName: '',
            email: this.emailFC,
            phone: this.phoneFC,
            pricing: this.pricingFC
        }, { validator: this.atLeastOneNameRequired}
            );
        this.pricingFC.setValue("INTERNAL");
    }

    atLeastOneNameRequired(group: FormGroup) {
        if (group) {
            if (group.controls['lastName'].value || group.controls['firstName'].value) {

                group.controls['lastName'].setErrors(null);
                group.controls['firstName'].setErrors(null);
            } else {
                group.controls['lastName'].setErrors({'incorrect': true});
                group.controls['firstName'].setErrors({'incorrect': true});
            }
        }
    }

    onEmailChange(event) {
        this.emailFC.setValue(event.srcElement.value)
    }

    public save(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("accountsXMLString", "");
        params.set("collaboratorsXMLString", "");
        params.set("contactPhone", this.addGroupFG.controls['phone'].value);
        params.set("contactEmail", this.emailFC.value);
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
        params.set("firstName", this.addGroupFG.controls['firstName'].value);
        params.set("lastName", this.addGroupFG.controls['lastName'].value);
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