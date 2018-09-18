import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormControl, Validators} from "@angular/forms";

@Component({
    selector: 'billing-gl-interface-view',
    template: `
        <h6 mat-dialog-title>{{this.billingPeriodString}} GL Interface {{this.totalPriceDisplay}}</h6>
        <mat-dialog-content>
            <mat-form-field>
                <input matInput placeholder="Journal Entry Revision" [formControl]="this.revisionFC">
            </mat-form-field>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button color="primary" [disabled]="this.revisionFC.invalid" (click)="this.send()">OK</button>
            <button mat-button mat-dialog-close>Cancel</button>
        </mat-dialog-actions>
    `,
    styles: [`        
    `]
})

export class BillingGlInterfaceViewComponent implements OnInit {

    public totalPriceDisplay: string = "";
    public totalPrice: number;
    private idBillingPeriod: string;
    private idCoreFacility: string;
    public billingPeriodString: string = "";

    public revisionFC: FormControl;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                private dialogRef: MatDialogRef<BillingGlInterfaceViewComponent>) {
    }

    ngOnInit() {
        this.totalPrice = this.data.totalPrice;
        this.totalPriceDisplay = this.totalPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
        this.idBillingPeriod = this.data.idBillingPeriod;
        this.idCoreFacility = this.data.idCoreFacility;
        this.billingPeriodString = this.data.billingPeriodString;

        this.revisionFC = new FormControl("1", Validators.required);
    }

    public send(): void {
        let url: string = 'ShowBillingGLInterface.gx' +
            '?idBillingPeriod=' + this.idBillingPeriod +
            '&grandTotalPrice=' + this.totalPrice +
            '&revisionNumber=' + this.revisionFC.value +
            '&idCoreFacility=' + this.idCoreFacility;
        window.open(url, '_blank');
        this.dialogRef.close();
    }

}
