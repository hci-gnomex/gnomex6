import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {LabListService} from "../services/lab-list.service";
import {ProductsService} from "../services/products.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ITreeOptions, TreeComponent, TreeModel} from "angular-tree-component";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {ColumnApi, GridApi, GridReadyEvent} from "ag-grid-community";
import {MatDialogConfig, MatSnackBar} from "@angular/material";
import {AddLedgerEntryComponent} from "./add-ledger-entry.component";
import {HttpParams} from "@angular/common/http";
import {AddProductWindowComponent} from "./add-product-window.component";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {UserPreferencesService} from "../services/user-preferences.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../services/constants.service";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

@Component({
    selector: 'product-ledger',
    templateUrl: "./product-ledger.component.html",
    styles: [`
        .ninety-five-percent-height {
            height: 95%;
        }
        .ninety-percent-height {
            height: 90%;
        }
        .ten-percent-height {
            height: 10%;
        }
        .five-percent-height {
            height: 5%;
        }
        .margin-right {
            margin-right: 2rem;
        }
        .margin-bottom {
            margin-bottom: 2rem;
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
        .flex-nine {
            flex: 9;
        }
        .padded {
            padding: 1rem;
        }
        span.dirty-note {
            background: yellow;
            padding: 0.5rem;
            margin-left: 1rem;
        }
        .border-right {
            border-right: 2px solid lightgray;
            padding-right: 2rem;
        }
    `]
})

export class ProductLedgerComponent implements OnInit {
    public showSpinner: boolean;
    public showDirtyNote: boolean;
    public isAdminState: boolean;
    public filterForm: FormGroup;
    public labList: any[];
    public productList: any[];

    @ViewChild(TreeComponent) private treeComponent: TreeComponent;
    private treeModel: TreeModel;
    public treeOptions: ITreeOptions;
    public treeNodes: ITreeNode[];
    public selectedProduct: any;

    private gridApi: GridApi;
    private gridColumnApi: ColumnApi;
    public gridColumnDefs: any[];
    public gridRowData: any[];

    constructor(@Inject(FormBuilder) private fb: FormBuilder,
                public prefService: UserPreferencesService,
                private labListService: LabListService,
                private productsService: ProductsService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                private snackBar: MatSnackBar,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private constService: ConstantsService) {
        this.filterForm = fb.group({
            lab: '',
            product: '',
        });
        this.gridColumnDefs = [
            {headerName: "Operation Date", field: "date", width: 200, editable: false, tooltipField: "date"},
            {headerName: "Qty", field: "qty", width: 100, editable: false, tooltipField: "qty"},
            {headerName: "Product Order #", field: "productOrderNumber", width: 200, editable: false, tooltipField: "productOrderNumber"},
            {headerName: "Request #", field: "requestNumber", width: 200, editable: false, tooltipField: "requestNumber"},
            {headerName: "Comment", field: "comment", width: 300, editable: false, tooltipField: "comment"},
            {headerName: "Notes", field: "notes", width: 300, editable: true, tooltipField: "notes"},
        ];
    }

    ngOnInit() {
        this.showSpinner = false;
        this.showDirtyNote = false;
        this.isAdminState = this.createSecurityAdvisorService.isAdmin || this.createSecurityAdvisorService.isSuperAdmin;
        this.treeOptions = {
            displayField: "display",
        };
        this.treeModel = this.treeComponent.treeModel;

        this.filterForm.valueChanges.subscribe(() => {
            this.loadLedger();
        });
        this.labList = [];
        this.productList = [];
        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.labList = response;
            if (this.labList.length === 1) {
                this.filterForm.controls["lab"].setValue(this.labList[0].idLab);
            }
        });
        this.productsService.getProductList().subscribe((response: any) => {
            if (response) {
                let filteredProductTypes = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.PRODUCT_TYPE).filter((type: any) => {
                    return type.value && type.idCoreFacility && (this.createSecurityAdvisorService.isCoreFacilityIManage(type.idCoreFacility) || this.createSecurityAdvisorService.isMyCoreFacility(type.idCoreFacility));
                });
                response = Array.isArray(response) ? response : [response.Product];
                this.productList = (response as any[]).filter((product: any) => {
                    for (let pt of filteredProductTypes) {
                        if (pt.idProductType === product.idProductType) {
                            return product.idProduct && product.name;
                        }
                    }
                    return false;
                });
            }
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
        this.loadLedger();
    }

    public onGridReady(event: GridReadyEvent): void {
        this.gridApi = event.api;
        this.gridColumnApi = event.columnApi;
        this.gridApi.setColumnDefs(this.gridColumnDefs);
        this.sizeColumnsToFit();
    }

    private loadLedger(selectedProduct?: any): void {
        this.selectProduct(null);
        this.treeNodes = [];
        this.productsService.getProductLedgerList(this.filterForm.controls['lab'].value, this.filterForm.controls['product'].value).subscribe((response: any) => {
            if (response && Array.isArray(response)) {
                for (let lab of response) {
                    this.treeNodes.push(this.makeLabNode(lab));
                }
            } else if (response && response.Lab) {
                this.treeNodes.push(this.makeLabNode(response.Lab));
            }
            this.treeModel.update();
            if (selectedProduct) {
                this.selectNode(selectedProduct.idLab, selectedProduct.idProduct);
            }
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    private makeLabNode(obj: any): any {
        let labNode: any = obj;
        labNode.children = labNode.product && Array.isArray(labNode.product) ? labNode.product : [labNode.product];
        return labNode;
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
        this.selectedProduct = product;
        this.gridRowData = [];
        this.showDirtyNote = false;
        this.loadProductLedgerEntries();
    }

    private loadProductLedgerEntries(): void {
        if (this.selectedProduct && this.selectedProduct.idLab && this.selectedProduct.idProduct) {
            this.productsService.getProductLedgerEntries(this.selectedProduct.idLab, this.selectedProduct.idProduct).subscribe((response: any) => {
                if (response) {
                    if (Array.isArray(response)) {
                        this.gridRowData = response;
                    } else if (response.entry) {
                        this.gridRowData = [response.entry];
                    }
                }
                this.sizeColumnsToFit();
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        }
    }

    private sizeColumnsToFit(): void {
        if (this.gridApi) {
            this.gridApi.sizeColumnsToFit();
        }
    }

    public onGridCellValueChanged(): void {
        this.showDirtyNote = true;
    }

    public addProduct(): void {
        let idLab: string = "";
        let activeNode: ITreeNode = this.treeModel.getActiveNode();
        if (activeNode && activeNode.data.idLab) {
            idLab = activeNode.data.idLab;
            activeNode.toggleActivated(null);
            this.selectProduct(null);
        }

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "35em";
        config.autoFocus = false;
        config.data = {
            productList: this.productList,
            idLab: idLab
        };
        this.dialogsService.genericDialogContainer(AddProductWindowComponent, "Add Product", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
                    if (result) {
                        let labFound: boolean = false;
                        for (let labNode of this.treeModel.roots) {
                            if (labNode.data.idLab === result.idLab) {
                                labFound = true;
                                let productFound = false;
                                for (let childNode of labNode.children) {
                                    if (childNode.data.idProduct === result.product.idProduct) {
                                        productFound = true;
                                        break;
                                    }
                                }

                                if (!productFound) {
                                    labNode.data.children.push(result.product);
                                    this.treeModel.update();
                                }

                                break;
                            }
                        }

                        if (!labFound) {
                            this.treeNodes.push(this.makeLabNode(result));
                            this.treeModel.update();
                        }

                        this.selectNode(result.idLab, result.product.idProduct);
                        this.showDirtyNote = true;
                    }
        });
    }

    private selectNode(idLab: string, idProduct?: string): void {
        for (let labNode of this.treeModel.roots) {
            if (labNode.data.idLab === idLab) {
                labNode.expand();
                if (idProduct) {
                    for (let productNode of labNode.children) {
                        if (productNode.data.idProduct === idProduct) {
                            productNode.toggleActivated(null);
                            break;
                        }
                    }
                } else {
                    labNode.toggleActivated(null);
                }
                break;
            }
        }
    }

    public addRow(): void {
        if (this.selectedProduct) {

            let config: MatDialogConfig = new MatDialogConfig();
            config.width = "45em";
            config.data = {
                product: this.selectedProduct
            };
            this.dialogsService.genericDialogContainer(AddLedgerEntryComponent, "Add Ledger Entry", null, config,
                {actions: [
                        {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "save"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]}).subscribe((result: any) => {
                        if (result) {
                            this.showDirtyNote = false;
                            this.loadLedger(this.selectedProduct);
                            this.loadProductLedgerEntries();
                        }
            });
        }
    }

    public save(): void {
        if (this.selectedProduct && this.gridRowData && this.gridRowData.length > 0) {
            this.gridApi.stopEditing();
            this.showSpinner = true;
            let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
                .set("productLedgerEntryListJSONString", JSON.stringify(this.gridRowData))
                .set("noJSONToXMLConversionNeeded", "Y");
            this.productsService.saveProductLedgerEntryList(params).subscribe((response: any) => {
                if (response && response.result && response.result === "SUCCESS") {
                    this.snackBar.open("Ledger Entries Saved", "Product Ledger", {
                        duration: 2000,
                    });
                    this.showDirtyNote = false;
                    this.loadProductLedgerEntries();
                } else {
                    let message: string = "";
                    if (response && response.message) {
                        message = ": " + response.message;
                    }
                    this.dialogsService.error("An error occurred while saving" + message);
                }
                this.showSpinner = false;
            }, (err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        }
    }

}
