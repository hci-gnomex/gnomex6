import {Component, Inject, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ProductsService} from "../services/products.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'add-ledger-entry',
    templateUrl: "./add-ledger-entry.component.html",
    styles: [`
        form.flex-container-col {
            display: flex;
            flex-direction: column;
        }
        span.dirty-note {
            background: yellow;
            padding: 0.5rem;
            margin-left: 1rem;
        }
        .full-width {
            width: 100%;
        }
    `]
})
export class AddLedgerEntryComponent implements OnInit {
    public form: FormGroup;
    public selectedProduct: any;
    public showSpinner: boolean;

    constructor(private productsService: ProductsService,
                @Inject(FormBuilder) private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private dialogRef: MatDialogRef<AddLedgerEntryComponent>,
                private dialogsService: DialogsService,) {
        this.selectedProduct = data.product;
        let currentCount: number = Number.parseInt(this.selectedProduct.qty);
        this.form = fb.group({
            quantity: ['', [Validators.required, Validators.min(-currentCount), Validators.pattern(/^-?[0-9]+$/)]],
            comment: ['', [Validators.required, Validators.maxLength(5000)]],
            notes: ['', Validators.maxLength(5000)]
        });
    }

    ngOnInit() {
        this.showSpinner = false;
        Object.keys(this.form.controls).forEach((key: string) => {
            this.form.controls[key].markAsTouched();
        });
    }

    public save(): void {
        if (this.form.valid) {
            this.showSpinner = true;
            let params: HttpParams = new HttpParams()
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
                    this.dialogsService.confirm("An error occurred while saving the ledger entry" + message, null);
                }
            });
        }
    }

}
