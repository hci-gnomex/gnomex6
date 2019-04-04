import {Component, OnInit} from '@angular/core';
import {Response, URLSearchParams} from "@angular/http";
import {MatDialogRef} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {
    FormBuilder, FormControl, FormGroup, Validators
} from "@angular/forms";
import {HttpParams} from "@angular/common/http";

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
        let params: HttpParams = new HttpParams();
        params = params.set("accountsJSONString", "");
        params = params.set("collaboratorsJSONString", "");
        params = params.set("contactPhone", this.addGroupFG.controls['phone'].value);
        params = params.set("contactEmail", this.emailFC.value);
        params = params.set("idLab", '0');
        if (this.pricingFC.value === "INTERNAL") {
            params = params.set("isExternalPricing", "N");
            params = params.set("isExternalPricingCommercial", "N");

        } else if (this.pricingFC.value === "EXACADEMIC") {
            params = params.set("isExternalPricing", "Y");
            params = params.set("isExternalPricingCommercial", "N");

        } else if (this.pricingFC.value === "EXCOMM") {
            params = params.set("isExternalPricing", "Y");
            params = params.set("isExternalPricingCommercial", "Y");
        }
        params = params.set("institutionsJSONString", "");
        params = params.set("firstName", this.addGroupFG.controls['firstName'].value);
        params = params.set("lastName", this.addGroupFG.controls['lastName'].value);
        params = params.set("managersJSONString", "");
        params = params.set("membersJSONString", "");

        this.labListService.saveLab(params).subscribe((responseJSON: any) => {
            if (responseJSON.result && responseJSON.result === "SUCCESS") {
                this.rebuildGroups = true;
                this.showSpinner = false;
            }
            this.dialogRef.close();
        });
    }
}