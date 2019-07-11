import {Component, Inject, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ProductsService} from "../services/products.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {DialogsService} from "../util/popup/dialogs.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

@Component({
    selector: 'add-product-window',
    template: `
        <div class="flex-container-col full-height full-width double-padded">
            <form [formGroup]="this.form">
                <custom-combo-box class="full-width" placeholder="Lab"
                                  [options]="this.labList"
                                  displayField="displayName"
                                  [formControlName]="'lab'">
                </custom-combo-box>
                <custom-combo-box class="full-width" placeholder="Product"
                                  [options]="this.productList"
                                  displayField="display"
                                  [formControlName]="'product'">
                </custom-combo-box>
            </form>
        </div>
    `,
    styles: [`
    `]
})
export class AddProductWindowComponent extends BaseGenericContainerDialog implements OnInit {
    public form: FormGroup;
    public labList: any[];
    public productList: any[];

    constructor(private productsService: ProductsService,
                @Inject(FormBuilder) private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private dialogRef: MatDialogRef<AddProductWindowComponent>,
                private dialogsService: DialogsService,
                public prefService: UserPreferencesService) {
        super();
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
                this.dialogsService.error("An error occurred while retrieving the lab list" + message);
            }
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
