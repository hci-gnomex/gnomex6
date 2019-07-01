import {Component, Inject, OnInit} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PropertyService} from "../../services/property.service";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";


@Component({
    template: `
        <div class="full-height full-width flex-container-col padded">

            <form [formGroup]="this.formGroup" style="padding:1em;" >

                <mat-form-field class="full-width">
                    <div matPrefix >$ &nbsp;</div>
                    <input matInput [placeholder]="internalLabel" formControlName="unitPriceInternal">
                    <mat-error *ngIf="this.formGroup?.controls['unitPriceInternal']?.hasError('pattern')">
                        Enter a valid currency
                    </mat-error>
                </mat-form-field>
                <mat-form-field class="full-width">
                    <div matPrefix >$ &nbsp;</div>
                    <input matInput [placeholder]="externalAcademicLabel" formControlName="unitPriceExternalAcademic">
                    <mat-error *ngIf="this.formGroup?.controls['unitPriceExternalAcademic']?.hasError('pattern')">
                        Enter a valid currency
                    </mat-error>
                </mat-form-field>
                <mat-form-field class="full-width">
                    <div matPrefix >$ &nbsp;</div>
                    <input matInput [placeholder]="externalCommercialLabel" formControlName="unitPriceExternalCommercial">
                    <mat-error *ngIf="this.formGroup?.controls['unitPriceExternalCommercial']?.hasError('pattern')">
                        Enter a valid currency
                    </mat-error>
                </mat-form-field>

            </form>
        </div>
    `,
    styles: [``]
})
export class PrepTypePricingDialogComponent extends BaseGenericContainerDialog implements OnInit{

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
        super();
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

        this.primaryDisable = (action) => {return this.formGroup.invalid; };

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
