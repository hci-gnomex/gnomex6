import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ITreeOptions, TreeComponent, TreeModel} from "angular-tree-component";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ProductsService} from "../services/products.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {PropertyService} from "../services/property.service";
import {HttpParams} from "@angular/common/http";
import {MatSnackBar} from "@angular/material";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'configure-product-types',
    templateUrl: "./configure-product-types.component.html",
    styles: [`
        div.flex-container-row {
            display: flex;
            flex-direction: row;
        }
        div.flex-container-col {
            display: flex;
            flex-direction: column;
        }
        .full-width {
            width: 100%;
        }
        .half-width {
            width: 50%;
        }
        .margin-right {
            margin-right: 2rem;
        }
        .margin-bottom {
            margin-bottom: 2rem;
        }
        .align-center {
            align-items: center;
        }
        .justify-end {
            justify-content: flex-end;
        }
        .flex-one {
            flex: 1;
        }
        .flex-two {
            flex: 2;
        }
        .flex-three {
            flex: 3;
        }
        .flex-four {
            flex: 4;
        }
        .padded {
            padding: 1rem;
        }
        span.dirty-note {
            background: yellow;
            padding: 0.5rem;
            margin-left: 1rem;
        }
        img.icon {
            margin-right: 0.5rem;
        }
        .border-right {
            border-right-style: solid;
            border-right-color: lightgray;
            border-right-width: 2px;
            padding-right: 2rem;
        }
    `]
})
export class ConfigureProductTypesComponent implements OnInit {
    public form: FormGroup;
    public selectedProductType;
    public showSpinner: boolean;
    @ViewChild(TreeComponent) private treeComponent: TreeComponent;
    private treeModel: TreeModel;
    public options: ITreeOptions;
    public nodes: ITreeNode[];
    public coreFacilities: any[];
    public vendors: any[];
    public priceCategories: any[];
    public showNewPriceCategoryInput: boolean;

    constructor(private dictionaryService: DictionaryService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private productsService: ProductsService,
                private dialogsService: DialogsService,
                private propertyService: PropertyService,
                private snackBar: MatSnackBar,
                @Inject(FormBuilder) private fb: FormBuilder) {
        this.showSpinner = false;
        this.form = fb.group({
            coreFacility: ['', Validators.required],
            vendor: '',
            priceCategory: ['', Validators.required],
            description: ['', Validators.required],
            newPriceCategoryName: ['', Validators.required],
        });
        this.showNewPriceCategoryInput = false;
    }

    ngOnInit() {
        this.options = {
            displayField: 'display',
        };
        this.treeModel = this.treeComponent.treeModel;

        this.loadProductTypes(this.dictionaryService.getEntriesExcludeBlank(DictionaryService.PRODUCT_TYPE));
        this.coreFacilities = this.createSecurityAdvisorService.coreFacilitiesICanManage;
        this.vendors = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.VENDOR).filter((v: any) => {
            return v.isActive && v.isActive === 'Y';
        });
        this.loadPriceCategories();
    }

    private loadProductTypes(productTypes: any[]): void {
        this.selectedProductType = null;
        this.nodes = productTypes.filter((type: any) => {
            return type.value && type.idCoreFacility && this.createSecurityAdvisorService.isCoreFacilityIManage(type.idCoreFacility);
        });
    }

    private loadPriceCategories(): void {
        this.priceCategories = [];
        this.productsService.getPriceCategories(true, this.propertyService.getProperty(PropertyService.PROPERTY_PRODUCT_SHEET_NAME).propertyValue).subscribe((result: any) => {
            if (result && Array.isArray(result)) {
                this.priceCategories = result;
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.confirm("An error occurred while retrieving price categories" + message, null);
            }
        },(err:IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    public onActivate(event: any): void {
        this.selectProductType(event.node.data);
    }

    private selectProductType(pt: any): void {
        this.setShowNewPriceCategory(false);
        this.form.markAsPristine();
        if (pt) {
            this.selectedProductType = pt;
            this.form.controls['coreFacility'].setValue(pt.idCoreFacility);
            this.form.controls['vendor'].setValue(pt.idVendor);
            this.form.controls['priceCategory'].setValue(pt.idPriceCategory);
            this.form.controls['description'].setValue(pt.description);
        } else {
            this.selectedProductType = null;
            this.form.controls['coreFacility'].setValue("");
            this.form.controls['vendor'].setValue("");
            this.form.controls['priceCategory'].setValue("");
            this.form.controls['description'].setValue("");
        }
    }

    public addProductType(): void {
        let newProductType: any = {};
        newProductType.value = "";
        newProductType.display = "";
        newProductType.idCoreFacility = "";
        newProductType.idVendor = "";
        newProductType.idPriceCategory = "";
        newProductType.description = "";
        newProductType.idProductType = 0;
        newProductType.canDelete = "Y";
        newProductType.canUpdate = "Y";

        this.deselectTree();
        this.selectProductType(newProductType);
        this.form.markAsDirty();
        Object.keys(this.form.controls).forEach((key: string) => {
            this.form.get(key).markAsTouched();
        });
    }

    public removeProductType(): void {
        if (this.selectedProductType && this.selectedProductType.canDelete === 'Y') {
            this.dialogsService.confirm("Are you sure you want to delete " + this.selectedProductType.display + "?", " ").subscribe((answer: boolean) => {
                if (answer) {
                    this.showSpinner = true;
                    this.productsService.deleteProductType(this.collectFields()).subscribe((response: any) => {
                        if (response && Array.isArray(response) && response[0].DictionaryEntry) {
                            this.dictionaryService.reloadAndRefresh(null, null, DictionaryService.PRODUCT_TYPE);
                            this.loadProductTypes(response[0].DictionaryEntry);
                            this.snackBar.open("Product Type Deleted", "Configure Product Types", {
                                duration: 2000,
                            });
                            this.form.markAsPristine();
                        } else {
                            let message: string = "";
                            if (response && response.message) {
                                message = ": " + response.message;
                            }
                            this.dialogsService.confirm("An error occurred while deleting the product type" + message, null);
                        }
                        this.showSpinner = false;
                    });
                }
            });
        }
    }

    public save(): void {
        if (this.selectedProductType) {
            let descriptionTrimmed: string = (this.form.controls['description'].value as string).trim();
            if (!descriptionTrimmed) {
                this.dialogsService.confirm("Please set description", null);
                return;
            }
            this.showSpinner = true;
            this.productsService.saveProductType(this.collectFields(), this.selectedProductType.idProductType === 0).subscribe((response: any) => {
                if (response && Array.isArray(response) && response[0].DictionaryEntry) {
                    this.dictionaryService.reloadAndRefresh(null, null, DictionaryService.PRODUCT_TYPE);
                    this.loadProductTypes(response[0].DictionaryEntry);
                    this.snackBar.open("Product Type Saved", "Configure Product Types", {
                        duration: 2000,
                    });
                    this.form.markAsPristine();
                } else {
                    let message: string = "";
                    if (response && response.message) {
                        message = ": " + response.message;
                    }
                    this.dialogsService.confirm("An error occurred while saving the product type" + message, null);
                }
                this.showSpinner = false;
            });
        }
    }

    public savePriceCategory(): void {
        if (this.showNewPriceCategoryInput && !this.form.controls['newPriceCategoryName'].invalid) {
            let name: string = (this.form.controls['newPriceCategoryName'].value as string).trim();
            if (!name) {
                this.dialogsService.confirm("Please set name", null);
                return;
            }
            this.productsService.saveNewProductPriceCategory(name).subscribe((response: any) => {
                if (response && response.result && response.result === "SUCCESS" && response.idPriceCategory) {
                    this.loadPriceCategories();
                    this.toggleNewPriceCategory();
                    this.form.controls['priceCategory'].setValue(response.idPriceCategory);
                    this.form.markAsDirty();
                } else {
                    let message: string = "";
                    if (response && response.message) {
                        message = ": " + response.message;
                    }
                    this.dialogsService.confirm("An error occurred while saving the price category" + message, null);
                }
            });
        }
    }

    private collectFields(): HttpParams {
        return new HttpParams()
            .set("value", this.form.controls['description'].value)
            .set("display", this.form.controls['description'].value)
            .set("idCoreFacility", this.form.controls['coreFacility'].value)
            .set("idVendor", this.form.controls['vendor'].value)
            .set("idPriceCategory", this.form.controls['priceCategory'].value)
            .set("description", this.form.controls['description'].value)
            .set("idProductType", this.selectedProductType.idProductType);
    }

    private deselectTree(): void {
        let activeNode: ITreeNode = this.treeModel.getActiveNode();
        if (activeNode) {
            activeNode.toggleActivated(null);
        }
    }

    public toggleNewPriceCategory(): void {
        this.showNewPriceCategoryInput = !this.showNewPriceCategoryInput;
        this.updateNewPriceCategoryNameControl();
    }

    private setShowNewPriceCategory(val: boolean) {
        this.showNewPriceCategoryInput = val;
        this.updateNewPriceCategoryNameControl();
    }

    private updateNewPriceCategoryNameControl(): void {
        if (this.showNewPriceCategoryInput) {
            this.form.controls['newPriceCategoryName'].setValue('');
        } else {
            this.form.controls['newPriceCategoryName'].setValue('N/A');
        }
    }

}
