import {Component, Inject, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ProductsService} from "../services/products.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: 'add-product-window',
    templateUrl: "./add-product-window.component.html",
    styles: [`
        form.flex-container-col {
            display: flex;
            flex-direction: column;
        }
        mat-form-field.full-width {
            width: 100%;
        }
        img.icon {
            margin-right: 0.5rem;
        }
    `]
})
export class AddProductWindowComponent implements OnInit {
    public form: FormGroup;
    public labList: any[];
    public productList: any[];

    constructor(private productsService: ProductsService,
                @Inject(FormBuilder) private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private dialogRef: MatDialogRef<AddProductWindowComponent>,
                private dialogsService: DialogsService,) {
        this.form = fb.group({
            lab: ['', Validators.required],
            product: ['', Validators.required]
        });

        this.productList = data.productList;

        this.productsService.getCoreFacilityLabList().subscribe((response: any) => {
            if (response && Array.isArray(response)) {
                this.labList = response;
                if (data.idLab) {
                    this.labList.forEach((lab: any) => {
                        if (lab.idLab === data.idLab) {
                            this.form.controls['lab'].setValue(lab);
                            return;
                        }
                    });
                }
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.confirm("An error occurred while retrieving the lab list" + message, null);
            }
        });
    }

    ngOnInit() {
        Object.keys(this.form.controls).forEach((key: string) => {
            this.form.controls[key].markAsTouched();
        });
    }

    public save(): void {
        if (this.form.valid) {
            let lab: any = this.form.controls['lab'].value;
            let product: any = this.form.controls['product'].value;

            let productNode: any = {};
            productNode.display = product.name;
            productNode.idProduct = product.idProduct;
            productNode.idLab = lab.idLab;
            productNode.qty = "0";
            productNode.pendingQty = "0";
            let labNode: any = {};
            labNode.display = lab.displayName;
            labNode.idLab = lab.idLab;
            labNode.product = productNode;

            this.dialogRef.close(labNode);
        }
    }

}
