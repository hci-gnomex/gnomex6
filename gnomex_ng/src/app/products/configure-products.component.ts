import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {ITreeOptions, TreeComponent, TreeModel} from "angular-tree-component";
import {ProductsService} from "../services/products.service";
import {DictionaryService} from "../services/dictionary.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {DialogsService} from "../util/popup/dialogs.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {HttpParams} from "@angular/common/http";
import {MatDialogConfig, MatSnackBar} from "@angular/material";
import {ConfigureProductTypesComponent} from "./configure-product-types.component";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {UtilService} from "../services/util.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../services/constants.service";

@Component({
    selector: 'configure-products',
    templateUrl: "./configure-products.component.html",
    styles: [`
        .margin-right {
            margin-right: 2rem;
        }
        .justify-end {
            justify-content: flex-end;
        }
        .flex-one {
            flex: 1;
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

export class ConfigureProductsComponent implements OnInit {
    private static CURRENCY_REGEX: RegExp = /^[0-9]*(?:\.[0-9]{0,2})?$/;

    @ViewChild(TreeComponent) private treeComponent: TreeComponent;
    private treeModel: TreeModel;
    public options: ITreeOptions;
    public nodes: ITreeNode[];
    private productTypes: any[];
    private products: any[];
    public selectedProduct: any;
    public productForm: FormGroup;
    public showSpinner: boolean;

    constructor(private productsService: ProductsService,
                private dictionaryService: DictionaryService,
                private dialogsService: DialogsService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private snackBar: MatSnackBar,
                private constService: ConstantsService,
                @Inject(FormBuilder) private fb: FormBuilder) {
        this.productForm = fb.group({
            name: ['', [Validators.required, Validators.maxLength(200)]],
            active: false,
            productType: ['', Validators.required],
            catalogNumber: ['', Validators.maxLength(100)],
            orderQuantity: ['', Validators.maxLength(100)],
            useQuantity: ['', Validators.maxLength(100)],
            description: ['', Validators.maxLength(500)],
            batchSamplesByUseQuantity: false,
            useGnomexBilling: false,
            pricingInternal: ['', Validators.pattern(ConfigureProductsComponent.CURRENCY_REGEX)],
            pricingExternalAcademic: ['', Validators.pattern(ConfigureProductsComponent.CURRENCY_REGEX)],
            pricingExternalCommercial: ['', Validators.pattern(ConfigureProductsComponent.CURRENCY_REGEX)],
        });
        this.showSpinner = false;
    }

    ngOnInit() {
        this.options = {
            displayField: 'display',
        };
        this.treeModel = this.treeComponent.treeModel;
        this.loadProducts();
    }

    private loadProducts(): void {
        this.selectedProduct = null;
        this.productTypes = [];
        this.products = [];
        this.nodes = [];
        this.productsService.getProductList().subscribe((response: any) => {
            if (response && (Array.isArray(response) || response.Product)) {
                this.products = UtilService.getJsonArray(response, response.Product);
                this.productTypes = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.PRODUCT_TYPE).filter((type: any) => {
                    return type.value && type.idCoreFacility && this.createSecurityAdvisorService.isCoreFacilityIManage(type.idCoreFacility);
                });
                for (let productType of this.productTypes) {
                    let parentNode: any = productType;
                    let children: any[] = [];
                    for (let product of this.products) {
                        if (product.idProductType === productType.idProductType) {
                            children.push(product);
                        }
                    }
                    if (children.length > 0) {
                        parentNode.children = children;
                        this.nodes.push(parentNode);
                    }
                }
                this.treeModel.update();
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.confirm("An error occurred while retrieving the product list" + message, null);
            }
        }, (err:IGnomexErrorResponse) =>{
        });
    }

    public onActivate(event: any): void {
        let node: ITreeNode = event.node;
        if (!node.hasChildren) {
            this.selectProduct(node.data);
        } else {
            this.selectProduct(null);
            node.expand();
        }
    }

    private selectProduct(product: any): void {
        this.productForm.markAsPristine();
        if (product) {
            this.selectedProduct = product;
            this.productForm.controls['name'].setValue(product.display);
            this.productForm.controls['active'].setValue(product.isActive === 'Y');
            this.productForm.controls['productType'].setValue(product.idProductType);
            this.productForm.controls['catalogNumber'].setValue(product.catalogNumber);
            this.productForm.controls['orderQuantity'].setValue(product.orderQty);
            this.productForm.controls['useQuantity'].setValue(product.useQty);
            this.productForm.controls['description'].setValue(product.description);
            this.productForm.controls['batchSamplesByUseQuantity'].setValue(product.batchSamplesByUseQuantity === 'Y');
            this.productForm.controls['useGnomexBilling'].setValue(product.billThroughGnomex === 'Y');
            this.productForm.controls['pricingInternal'].setValue(product.unitPriceInternal);
            this.productForm.controls['pricingExternalAcademic'].setValue(product.unitPriceExternalAcademic);
            this.productForm.controls['pricingExternalCommercial'].setValue(product.unitPriceExternalCommercial);
        } else {
            this.selectedProduct = null;
            this.productForm.controls['name'].setValue("");
            this.productForm.controls['active'].setValue(false);
            this.productForm.controls['productType'].setValue("");
            this.productForm.controls['catalogNumber'].setValue("");
            this.productForm.controls['orderQuantity'].setValue("");
            this.productForm.controls['useQuantity'].setValue("");
            this.productForm.controls['description'].setValue("");
            this.productForm.controls['batchSamplesByUseQuantity'].setValue(false);
            this.productForm.controls['useGnomexBilling'].setValue(false);
            this.productForm.controls['pricingInternal'].setValue("");
            this.productForm.controls['pricingExternalAcademic'].setValue("");
            this.productForm.controls['pricingExternalCommercial'].setValue("");
        }
    }

    public addProduct(): void {
        let newProduct: any = {};
        newProduct.idProduct = 0;
        newProduct.name = '';
        newProduct.isActive = 'Y';
        newProduct.idProductType = '';
        newProduct.idPrice = '';
        newProduct.orderQty = '';
        newProduct.useQty = '';
        newProduct.description = '';
        newProduct.catalogNumber = '';
        newProduct.batchSamplesByUseQuantity = 'N';
        newProduct.billThroughGnomex = 'Y';
        newProduct.unitPriceInternal = '';
        newProduct.unitPriceExternalAcademic = '';
        newProduct.unitPriceExternalCommercial = '';
        newProduct.canDelete = 'Y';

        this.deselectTree();
        this.selectProduct(newProduct);
        this.productForm.markAsDirty();
        Object.keys(this.productForm.controls).forEach((key: string) => {
            this.productForm.get(key).markAsTouched();
        });
    }

    public removeProduct(): void {
        if (this.selectedProduct && this.selectedProduct.canDelete === 'Y') {
            if (this.selectedProduct.idProduct) {
                this.productsService.deleteProduct(this.selectedProduct.idProduct).subscribe((response: any) => {
                    if (response && response.result && response.result === "SUCCESS") {
                        this.snackBar.open("Product Deleted", "Configure Products", {
                            duration: 2000,
                        });
                        if (response.message) {
                            this.dialogsService.confirm(response.message, null);
                        }
                    } else {
                        let message: string = "";
                        if (response && response.message) {
                            message = ": " + response.message;
                        }
                        this.dialogsService.confirm("An error occurred while deleting the product" + message, null);
                    }
                    this.loadProducts();
                });
            } else {
                this.selectProduct(null);
            }
        }
    }

    public openEditProductTypes(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "60em";
        config.autoFocus = false;
        this.dialogsService.genericDialogContainer(ConfigureProductTypesComponent, "Configure Product Types", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe(() => {
                    this.loadProducts();
        });
    }

    public saveProduct(): void {
        if (this.selectedProduct) {
            this.showSpinner = true;
            let params: HttpParams = new HttpParams()
                .set("idProduct", this.selectedProduct.idProduct)
                .set("name", this.productForm.controls['name'].value)
                .set("isActive", this.productForm.controls['active'].value ? 'Y' : 'N')
                .set("orderQty", this.productForm.controls['orderQuantity'].value)
                .set("useQty", this.productForm.controls['useQuantity'].value)
                .set("description", this.productForm.controls['description'].value)
                .set("catalogNumber", this.productForm.controls['catalogNumber'].value)
                .set("idProductType", this.productForm.controls['productType'].value)
                .set("idPrice", this.selectedProduct.idPrice)
                .set("unitPriceInternal", this.productForm.controls['pricingInternal'].value)
                .set("unitPriceExternalAcademic", this.productForm.controls['pricingExternalAcademic'].value)
                .set("unitPriceExternalCommercial", this.productForm.controls['pricingExternalCommercial'].value)
                .set("batchSamplesByUseQuantity", this.productForm.controls['batchSamplesByUseQuantity'].value ? 'Y' : 'N')
                .set("billThroughGnomex", this.productForm.controls['useGnomexBilling'].value ? 'Y' : 'N');

            this.productsService.saveProduct(params).subscribe((response: any) => {
                if (response && response.result && response.result === "SUCCESS") {
                    this.snackBar.open("Product Saved", "Configure Products", {
                        duration: 2000,
                    });
                    this.productForm.markAsPristine();
                } else {
                    let message: string = "";
                    if (response && response.message) {
                        message = ": " + response.message;
                    }
                    this.dialogsService.confirm("An error occurred while saving the product" + message, null);
                }
                this.showSpinner = false;
                this.loadProducts();
            });
        }
    }

    private deselectTree(): void {
        let activeNode: ITreeNode = this.treeModel.getActiveNode();
        if (activeNode) {
            activeNode.toggleActivated(null);
        }
    }

}
