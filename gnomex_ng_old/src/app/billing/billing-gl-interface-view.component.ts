import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormControl, Validators} from "@angular/forms";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: 'billing-gl-interface-view',
    template: `
        <mat-form-field class="full-width double-padded">
            <input matInput placeholder="Journal Entry Revision" [formControl]="this.revisionFC">
        </mat-form-field>
    `,
    styles: [``]
})

export class BillingGlInterfaceViewComponent extends BaseGenericContainerDialog implements OnInit {

    public primaryDisable: (action?: GDAction) => boolean;
    public totalPrice: number;
    private idBillingPeriod: string;
    private idCoreFacility: string;

    public revisionFC: FormControl;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                private dialogRef: MatDialogRef<BillingGlInterfaceViewComponent>) {
        super();
    }

    ngOnInit() {
        this.totalPrice = this.data.totalPrice;
        this.idBillingPeriod = this.data.idBillingPeriod;
        this.idCoreFacility = this.data.idCoreFacility;

        this.revisionFC = new FormControl("1", Validators.required);
        this.primaryDisable = (action) => {
            return this.revisionFC.invalid;
        };
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
