import {Component, OnInit} from "@angular/core";
import {MatDialogRef} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: "new-group-dialog",
    template: `
        <div class="flex-container-col full-height full-width padded">
            <div [formGroup]="addGroupFG" class="double-padded-left-right">
                <mat-form-field class="dialogFormField">
                    <input matInput formControlName="firstName" placeholder="Investigator First name">
                    <mat-error *ngIf="addGroupFG.controls['firstName'].hasError('incorrect')">
                        First name or Last name <strong>required</strong>
                    </mat-error>
                </mat-form-field>
                <mat-form-field class="dialogFormField">
                    <input matInput formControlName="lastName" placeholder="Investigator Last name">
                    <mat-error *ngIf="addGroupFG.controls['lastName'].hasError('incorrect')">
                        Last name or First name <strong>required</strong>
                    </mat-error>
                </mat-form-field>
                <mat-form-field class="dialogFormField">
                    <input matInput formControlName="phone" placeholder="Phone">
                </mat-form-field>
                <mat-form-field class="dialogFormField">
                    <input matInput [formControl]="this.emailFC" (change)="onEmailChange($event)" placeholder="PI email(s)">
                    <mat-hint align="end">Place , between emails</mat-hint>
                    <mat-error *ngIf="this.emailFC.hasError('required')">Required</mat-error>
                    <mat-error *ngIf="this.emailFC.hasError('email') && !this.emailFC.hasError('required')">Valid Email Required</mat-error>
                </mat-form-field>
                <mat-radio-group class="permission-radio-group" [formControl]="pricingFC">
                    <mat-radio-button value="INTERNAL"><img [src]="'./assets/group.png'"> Internal</mat-radio-button>
                    <mat-radio-button value="EXACADEMIC"><img [src]="'./assets/graduation_cap.png'"> External Academic</mat-radio-button>
                    <mat-radio-button value="EXCOMM"><img [src]="'./assets/building.png'"> External Commercial</mat-radio-button>
                </mat-radio-group>
            </div>
        </div>
    `,
})

export class NewGroupDialogComponent extends BaseGenericContainerDialog implements OnInit{
    public emailFC: FormControl;
    public pricingFC: FormControl;
    public phoneFC: FormControl;
    public addGroupFG: FormGroup;


    constructor(public dialogRef: MatDialogRef<NewGroupDialogComponent>,
                private labListService: LabListService,
                private formBuilder: FormBuilder) {
        super();
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

        this.primaryDisable = (action) => this.addGroupFG.invalid;
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
            this.showSpinner = false;
            if (responseJSON.result && responseJSON.result === "SUCCESS") {
                this.dialogRef.close(responseJSON.idLab);
            } else {
                this.dialogRef.close();
            }
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }
}
