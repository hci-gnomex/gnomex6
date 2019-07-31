import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {GridReadyEvent, GridSizeChangedEvent, SelectionChangedEvent} from "ag-grid-community";
import {LabListService} from "../services/lab-list.service";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DateRange} from "../util/date-range-filter.component";
import {HttpParams} from "@angular/common/http";
import {ProductsService} from "../services/products.service";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {MatSnackBar} from "@angular/material";
import {ITreeOptions, TreeComponent} from "angular-tree-component";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {UserPreferencesService} from "../services/user-preferences.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: 'product-orders',
    templateUrl: "./product-orders.component.html",
    styles: [`
        .flex-one {
            flex: 1;
        }
        .flex-two {
            flex: 2;
        }
        .flex-three {
            flex: 3;
        }
        .flex-ten {
            flex: 10;
        }
        .flex-thirteen {
            flex: 13;
        }
        div.filter-col {
            display: flex;
            flex-direction: column;
            width: 18em;
        }
        .padded {
            padding: 0.5em;
        }
        .padding-top {
            padding-top: 0.5em;
        }
        .border {
            border: 1px gray solid;
        }
        .margin-right {
            margin-right: 2em;
        }
        .reduced-font {
            font-size: 13px;
        }
        .half-width {
            width: 50%;
        }
        .italics {
            font-style: italic;
        }
    `]
})

export class ProductOrdersComponent implements OnInit {
    public readonly DISPLAY_DETAIL: string = "d";
    public readonly DISPLAY_OVERVIEW: string = "o";
    public readonly DETAIL_LAB_MODE: string = "lm";
    public readonly DETAIL_ORDER_MODE: string = "om";

    public showSpinner: boolean = false;
    public displayMode: string = this.DISPLAY_OVERVIEW;
    public detailDisplayMode: string;
    public productOrderLineItemList: any[] = [];

    public filterForm: FormGroup;
    public filterLabList: any[] = [];
    public filterCoreFacilityList: any[] = [];
    public filterStatusList: any[] = [];
    public filterProductTypeList: any[] = [];

    public changeStatus: any;
    public changeProductOrders: any[] = [];

    public overviewGridColumnDefs: any[];
    public labGridColumnDefs: any[];
    public productOrderGridColumnDefs: any[];
    public labLineItems: any[] = [];
    public productOrderLineItems: any[] = [];

    @ViewChild(TreeComponent) private treeComponent: TreeComponent;
    public treeOptions: ITreeOptions;
    public productOrderList: ITreeNode[] = [];
    public selectedTreeNode: ITreeNode;
    public currentProductOrder: any;

    constructor(@Inject(FormBuilder) private fb: FormBuilder,
                private labListService: LabListService,
                private dictionaryService: DictionaryService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private productsService: ProductsService,
                private dialogsService: DialogsService,
                private snackBar: MatSnackBar,
                public prefService: UserPreferencesService) {
        this.filterForm = fb.group({
            lab: '',
            coreFacility: '',
            status: '',
            productType: '',
            date: null
        });
        this.overviewGridColumnDefs = [
            {headerName: "Product Order #", field: "productOrderNumber", width: 100, checkboxSelection: true, headerCheckboxSelection: true, tooltipField: "productOrderNumber"},
            {headerName: "Lab", field: "labName", width: 100, tooltipField: "labName"},
            {headerName: "Submitter", field: "submitter", width: 100, tooltipField: "submitter"},
            {headerName: "Submit Date", field: "submitDate", width: 100, tooltipField: "submitDate"},
            {headerName: "Product", field: "name", width: 100, tooltipField: "name"},
            {headerName: "Unit Price", field: "unitPrice", width: 100, tooltipField: "unitPrice"},
            {headerName: "Qty", field: "qty", width: 100, tooltipField: "qty"},
            {headerName: "Total Price", field: "totalPrice", width: 100, tooltipField: "totalPrice"},
            {headerName: "Status", field: "status", width: 100, tooltipField: "status"},
        ];
        this.labGridColumnDefs = [
            {headerName: "Product Order #", field: "productOrderNumber", width: 100},
            {headerName: "Submitter", field: "submitter", width: 100},
            {headerName: "Submit Date", field: "submitDate", width: 100},
            {headerName: "Status", field: "status", width: 100},
        ];
        this.productOrderGridColumnDefs = [
            {headerName: "Product", field: "name", width: 100},
            {headerName: "Quantity Ordered", field: "qty", width: 100},
            {headerName: "Unit Price", field: "unitPrice", width: 100},
            {headerName: "Total Price", field: "totalPrice", width: 100},
            {headerName: "Status", field: "status", width: 100},
        ];
    }

    ngOnInit() {
        this.filterForm.valueChanges.subscribe(() => {
            this.getProductOrderLists();
        });

        this.labListService.getSubmitRequestLabList().subscribe((response: any[]) => {
            this.filterLabList = response;
        });
        this.filterCoreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;
        this.filterStatusList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.PRODUCT_ORDER_STATUS);
        this.filterProductTypeList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.PRODUCT_TYPE).filter((pt: any) => {
            return this.createSecurityAdvisorService.isMyCoreFacility(pt.idCoreFacility);
        });

        this.treeOptions = {
            displayField: 'display',
        };
    }

    public dateRangeChange(event: DateRange): void {
        this.filterForm.controls['date'].setValue(event);
    }

    private getProductOrderLists(lab?: string, idProductOrder?: string): void {
        this.productOrderList = [];
        this.productOrderLineItemList = [];
        this.changeProductOrders = [];
        this.labLineItems = [];
        this.productOrderLineItems = [];
        this.selectedTreeNode = null;

        let params: HttpParams = new HttpParams();
        if (this.filterForm.controls['lab'].value) {
            params = params.set("idLab", this.filterForm.controls['lab'].value);
        }
        if (this.filterForm.controls['coreFacility'].value) {
            params = params.set("idCoreFacility", this.filterForm.controls['coreFacility'].value);
        }
        if (this.filterForm.controls['status'].value) {
            params = params.set("codeProductOrderStatus", this.filterForm.controls['status'].value);
        }
        if (this.filterForm.controls['productType'].value) {
            params = params.set("idProductType", this.filterForm.controls['productType'].value);
        }
        if (this.filterForm.controls['date'].value) {
            let dateRange: DateRange = this.filterForm.controls['date'].value;
            if (dateRange.from && dateRange.to) {
                params = params.set("submitDateFrom", dateRange.from.toLocaleDateString());
                params = params.set("submitDateTo", dateRange.to.toLocaleDateString());
            }
        }

        this.productsService.getProductOrderList(params).subscribe((result: any) => {
            if (result) {
                if (Array.isArray(result)) {
                    for (let lab of result) {
                        this.productOrderList.push(this.makeLabNode(lab));
                    }
                } else if (result.Lab) {
                    this.productOrderList.push(this.makeLabNode(result.Lab));
                } else {
                    let message: string = "";
                    if (result && result.message) {
                        message = ": " + result.message;
                    }
                    this.dialogsService.error("An error occurred while retrieving the product order list" + message);
                }
                this.treeComponent.treeModel.update();
            }

            this.productsService.getProductOrderLineItemList(params).subscribe((result: any) => {
                if (result) {
                    if (Array.isArray(result)) {
                        this.productOrderLineItemList = result;
                    } else if (result.LineItem) {
                        this.productOrderLineItemList = [result.LineItem];
                    }
                }

                if (lab) {
                    this.selectTreeNode(lab, idProductOrder);
                }
            } ,(err: IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
        } ,(err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    private makeLabNode(obj: any): ITreeNode {
        let labNode: any = obj;
        labNode.children = labNode.ProductOrder && Array.isArray(labNode.ProductOrder) ? labNode.ProductOrder : [labNode.ProductOrder];
        return labNode;
    }

    public promptToSave(): void {
        if (this.changeStatus && this.changeProductOrders && this.changeProductOrders.length > 0) {
            if (this.createSecurityAdvisorService.coreFacilitiesICanManage.length < 1) {
                this.dialogsService.alert("Insufficient permissions to change status", null, DialogType.FAILED);
                return;
            }

            if (this.displayMode === this.DISPLAY_DETAIL && this.detailDisplayMode === this.DETAIL_LAB_MODE) {
                this.dialogsService.confirm("Do you want to change the status of all orders in this lab?").subscribe((response: boolean) => {
                    if (response) {
                        this.save();
                    }
                });
            } else {
                this.save();
            }
        }
    }

    private save(): void {
        let lab: string;
        let idProductOrder: string;
        let params: HttpParams = new HttpParams()
            .set("noJSONToXMLConversionNeeded", "Y")
            .set("codeProductOrderStatus", this.changeStatus)
            .set("selectedLineItems", JSON.stringify(this.changeProductOrders));
        if (this.displayMode === this.DISPLAY_DETAIL && this.detailDisplayMode === this.DETAIL_ORDER_MODE) {
            lab = this.selectedTreeNode.parent.data.display;
            idProductOrder = this.selectedTreeNode.data.idProductOrder;
        } else if (this.detailDisplayMode === this.DETAIL_LAB_MODE) {
            lab = this.selectedTreeNode.data.display;
        }
        this.productsService.changeProductOrderStatus(params).subscribe((response: any) => {
            if (response && response.result && response.result === 'SUCCESS') {
                if (response.message) {
                    this.dialogsService.alert(response.message, null, DialogType.SUCCESS);
                }
                this.snackBar.open("Item(s) Saved", "Product Orders", {
                    duration: 2000,
                });
                this.getProductOrderLists(lab, idProductOrder);
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.error("An error occurred while saving product order line item(s)" + message);
            }
        });
    }

    public promptToDelete(): void {
        if (this.changeProductOrders && this.changeProductOrders.length > 0) {
            if (this.displayMode === this.DISPLAY_DETAIL) {
                this.dialogsService.confirm("Any completed line item(s) will be skipped. Continue?").subscribe((response: boolean) => {
                    if (response) {
                        this.deleteLineItems();
                    }
                });
            } else if (this.displayMode === this.DISPLAY_OVERVIEW) {
                let allComplete: boolean = true;
                let hasComplete: boolean = false;
                for (let lineItem of this.changeProductOrders) {
                    if (lineItem.status && lineItem.status === 'Complete') {
                        hasComplete = true;
                    } else {
                        allComplete = false;
                    }
                }

                if (allComplete) {
                    this.dialogsService.alert("The selected line item(s) is marked as complete and cannot be deleted", null, DialogType.WARNING);
                } else if (hasComplete) {
                    this.dialogsService.confirm("At least one of the selected line item(s) is marked as complete and will be skipped. Continue?", "Warning").subscribe((response: boolean) => {
                        if (response) {
                            this.deleteLineItems();
                        }
                    });
                } else {
                    this.deleteLineItems();
                }
            }
        }
    }

    private deleteLineItems(): void {
        let params: HttpParams = new HttpParams()
            .set("noJSONToXMLConversionNeeded", "Y")
            .set("productLineItemsToDeleteJSONString", JSON.stringify(this.changeProductOrders));
        this.productsService.deleteProductLineItems(params).subscribe((response: any) => {
            if (response && response.result && response.result === 'SUCCESS') {
                if (response.message) {
                    this.dialogsService.alert(response.message, null, DialogType.ALERT);
                }
                this.snackBar.open("Item(s) Deleted", "Product Orders", {
                    duration: 2000,
                });
                this.getProductOrderLists();
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.error("An error occurred while deleting product order line item(s)" + message);
            }
        });
    }

    private getProductOrder(idProductOrder: string): void {
        this.productsService.getProductOrder(idProductOrder).subscribe((response: any) => {
            this.currentProductOrder = response;

        },(err:IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    public onOverviewGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.overviewGridColumnDefs);
        event.api.sizeColumnsToFit();
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        event.api.sizeColumnsToFit();
    }

    public onOverviewGridSelectionChanged(event: SelectionChangedEvent): void {
        this.changeProductOrders = event.api.getSelectedRows();
    }

    public onLabGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.labGridColumnDefs);
        event.api.sizeColumnsToFit();
    }

    public onProductOrderGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.productOrderGridColumnDefs);
        event.api.sizeColumnsToFit();
    }

    public onTreeActivate(event: any): void {
        let node: ITreeNode = event.node;
        this.selectedTreeNode = node;
        if (!node.hasChildren) {
            this.getProductOrder(node.data.idProductOrder);
            this.productOrderLineItems = this.productOrderLineItemList.filter((lineItem: any) => {
                return lineItem.idProductOrder === node.data.idProductOrder;
            });
            this.changeProductOrders = this.productOrderLineItems;
            this.detailDisplayMode = this.DETAIL_ORDER_MODE;
        } else {
            this.labLineItems = this.productOrderLineItemList.filter((lineItem: any) => {
                return lineItem.labName === node.data.display;
            });
            this.changeProductOrders = this.labLineItems;
            this.detailDisplayMode = this.DETAIL_LAB_MODE;
            node.expand();
        }
    }

    private selectTreeNode(lab: string, idProductOrder?: string): void {
        for (let labNode of this.treeComponent.treeModel.roots) {
            if (labNode.data.display === lab) {
                labNode.expand();
                if (idProductOrder) {
                    for (let productOrderNode of labNode.children) {
                        if (productOrderNode.data.idProductOrder === idProductOrder) {
                            productOrderNode.toggleActivated(null);
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

}
