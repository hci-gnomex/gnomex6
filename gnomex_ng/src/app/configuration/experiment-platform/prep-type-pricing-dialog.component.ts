

import {Component, Inject, OnInit} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PropertyService} from "../../services/property.service";



@Component({
    template:`

        <div mat-dialog-title class="padded-outer">
            <div class="dialog-header-colors padded-inner">
                Prep Type Pricing
            </div>
        </div>
        <div mat-dialog-content style="margin: 0; padding: 0;">

            <form [formGroup]="this.formGroup" style="padding:1em;" class="full-height full-width flex-container-col">
                
                <mat-form-field class="flex-grow">
                    <div matPrefix >$ &nbsp;</div>
                    <input matInput [placeholder]="internalLabel" formControlName="unitPriceInternal">
                    <mat-error *ngIf="this.formGroup?.controls['unitPriceInternal']?.hasError('pattern')">
                        Enter a valid currency
                    </mat-error>
                </mat-form-field>
                <mat-form-field class="flex-grow">
                    <div matPrefix >$ &nbsp;</div>
                    <input matInput [placeholder]="externalAcademicLabel" formControlName="unitPriceExternalAcademic">
                    <mat-error *ngIf="this.formGroup?.controls['unitPriceExternalAcademic']?.hasError('pattern')">
                        Enter a valid currency
                    </mat-error>
                </mat-form-field>
                <mat-form-field class="flex-grow">
                    <div matPrefix >$ &nbsp;</div>
                    <input matInput [placeholder]="externalCommercialLabel" formControlName="unitPriceExternalCommercial">
                    <mat-error *ngIf="this.formGroup?.controls['unitPriceExternalCommercial']?.hasError('pattern')">
                        Enter a valid currency
                    </mat-error>
                </mat-form-field>

            </form>
        </div>
        <div class="padded-outer" mat-dialog-actions align="end">
            <div class="padded-inner">
                <button mat-button [disabled]="formGroup.invalid" (click)="applyChanges()">
                    <img class="icon" [src]="constService.ICON_SAVE" > Apply
                </button>
                <button mat-button mat-dialog-close color="accent" > Cancel </button>
            </div>
        </div>



    `,
    styles: [`

        .padded-outer{
            margin:0;
            padding:0;
        }
        .padded-inner{
            padding:0.3em;

        }
        mat-form-field.medium-form-input{
            width: 20em;
            margin-right: 1em;
        }




    `]
})
export class PrepTypePricingDialogComponent implements OnInit{

    rowData:any;
    applyFn:any;
    formGroup:FormGroup;
    readonly currencyRegex = /^[0-9]+\.\d{2}$/;
    internalLabel = '';
    externalAcademicLabel= '';
    externalCommercialLabel = '';


    constructor(private dialogRef: MatDialogRef<PrepTypePricingDialogComponent>,
                public constService:ConstantsService,private fb:FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data,private propertyService: PropertyService) {
        if (this.data && this.data.rowData) {
            this.rowData = this.data.rowData;
            this.applyFn = this.data.applyFn;
        }
    }

    ngOnInit(){

        this.formGroup =  this.fb.group({
            unitPriceInternal: [this.rowData.unitPriceInternal, Validators.pattern(this.currencyRegex)],
            unitPriceExternalAcademic: [this.rowData.unitPriceExternalAcademic, Validators.pattern(this.currencyRegex)],
            unitPriceExternalCommercial: [this.rowData.unitPriceExternalCommercial, Validators.pattern(this.currencyRegex)],
        });
        this.internalLabel = this.setPriceLabel(PropertyService.PROPERTY_INTERNAL_PRICE_LABEL,"Internal Pricing");
        this.externalAcademicLabel = this.setPriceLabel(PropertyService.PROPERTY_EXTERNAL_ACADEMIC_PRICE_LABEL, "External Academic Pricing");
        this.externalCommercialLabel = this.setPriceLabel(PropertyService.PROPERTY_EXTERNAL_COMMERCIAL_PRICE_LABEL, "External Commercial Pricing");



    }

    setPriceLabel(property:string, defaultLabel:string){
        let label:any = this.propertyService.getProperty(property);
        return label ? label.propertyValue : defaultLabel;
    }


    applyChanges(){
        this.applyFn(this.formGroup);
        this.dialogRef.close();
    }






}