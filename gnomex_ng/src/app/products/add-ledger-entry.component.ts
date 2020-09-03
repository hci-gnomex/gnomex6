import {Component, Inject, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ProductsService} from "../services/products.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

@Component({
    selector: 'add-ledger-entry',
    template: `
        <div class="flex-container-col full-width full-height double-padded">
            <div class="full-width padded-bottom">{{this.selectedProduct.display}}</div>
            <form [formGroup]="this.form" class="padded-top">
                <mat-form-field class="full-width">
                    <input matInput placeholder="Quantity" [formControlName]="'quantity'">
                </mat-form-field>
                <mat-form-field class="full-width">
                    <textarea matInput placeholder="Comment" [formControlName]="'comment'"
                              matTextareaAutosize matAutosizeMinRows="3" matAutosizeMaxRows="3"></textarea>
                </mat-form-field>
                <mat-form-field class="full-width">
                    <textarea matInput placeholder="Notes" [formControlName]="'notes'"
                              matTextareaAutosize matAutosizeMinRows="3" matAutosizeMaxRows="3"></textarea>
                </mat-form-field>
            </form>
        </div>
    `,
})
export class AddLedgerEntryComponent extends BaseGenericContainerDialog implements OnInit {
    public form: FormGroup;
    public selectedProduct: any;

    constructor(private productsService: ProductsService,
                @Inject(FormBuilder) private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private dialogRef: MatDialogRef<AddLedgerEntryComponent>,
                private dialogsService: DialogsService) {
        super();
        this.selectedProduct = data.product;
        let currentCount: number = Number.parseInt(this.selectedProduct.qty);
        this.form = fb.group({
            quantity: ['', [Validators.required, Validators.min(-currentCount), Validators.pattern(/^-?[0-9]+$/)]],
            comment: ['', [Validators.required, Validators.maxLength(5000)]],
            notes: ['', Validators.maxLength(5000)]
        });
    }

    ngOnInit() {
        Object.keys(this.form.controls).forEach((key: string) => {
            this.form.controls[key].markAsTouched();
        });

        this.primaryDisable = (action) => this.form.invalid;
    }

    public save(): void {
        if (this.form.valid) {
            this.showSpinner = true;
            let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
                .set("idProduct", this.selectedProduct.idProduct)
                .set("idLab", this.selectedProduct.idLab)
                .set("qty", this.form.controls["quantity"].value)
                .set("comment", this.form.controls["comment"].value)
                .set("notes", this.form.controls["notes"].value);
            this.productsService.saveProductLedgerEntry(params).subscribe((response: any) => {
                this.showSpinner = false;
                if (response && response.result && response.result === "SUCCESS") {
                    this.dialogRef.close(true);
                } else {
                    let message: string = "";
                    if (response && response.message) {
                        message = ": " + response.message;
                    }
                    this.dialogsService.error("An error occurred while saving the ledger entry" + message);
                }
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        }
    }

}
