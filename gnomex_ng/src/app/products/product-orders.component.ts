import {Component, Inject, OnInit} from "@angular/core";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {GridReadyEvent, GridSizeChangedEvent, SelectionChangedEvent} from "ag-grid";
import {LabListService} from "../services/lab-list.service";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DateRange} from "../util/date-range-filter.component";
import {HttpParams} from "@angular/common/http";
import {ProductsService} from "../services/products.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {MatSnackBar} from "@angular/material";

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
        .flex-ten {
            flex: 10;
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
    `]
})

export class ProductOrdersComponent implements OnInit {
    public readonly DISPLAY_DETAIL: string = "d";
    public readonly DISPLAY_OVERVIEW: string = "o";

    public showSpinner: boolean = false;
    public displayMode: string = this.DISPLAY_OVERVIEW;
    public productOrderList: any[] = [];
    public productOrderLineItemList: any[] = [];

    public filterForm: FormGroup;
    public filterLabList: any[] = [];
    public filterCoreFacilityList: any[] = [];
    public filterStatusList: any[] = [];
    public filterProductTypeList: any[] = [];

    public changeStatus: any;
    public changeProductOrders: any[] = [];

    public gridColumnDefs: any[];

    constructor(@Inject(FormBuilder) private fb: FormBuilder,
                private labListService: LabListService,
                private dictionaryService: DictionaryService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private productsService: ProductsService,
                private dialogsService: DialogsService,
                private snackBar: MatSnackBar) {
        this.filterForm = fb.group({
            lab: '',
            coreFacility: '',
            status: '',
            productType: '',
            date: null
        });
        this.gridColumnDefs = [
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
    }

    public dateRangeChange(event: DateRange): void {
        this.filterForm.controls['date'].setValue(event);
    }

    private getProductOrderLists(): void {
        this.productOrderList = [];
        this.productOrderLineItemList = [];
        this.changeProductOrders = [];

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
                    this.productOrderList = result;
                } else if (result.Lab) {
                    this.productOrderList = [result.Lab];
                } else {
                    let message: string = "";
                    if (result && result.message) {
                        message = ": " + result.message;
                    }
                    this.dialogsService.confirm("An error occurred while retrieving the product order list" + message, null);
                }
            }
        });

        this.productsService.getProductOrderLineItemList(params).subscribe((result: any) => {
            if (result) {
                if (Array.isArray(result)) {
                    this.productOrderLineItemList = result;
                } else if (result.LineItem) {
                    this.productOrderLineItemList = [result.LineItem];
                } else {
                    let message: string = "";
                    if (result && result.message) {
                        message = ": " + result.message;
                    }
                    this.dialogsService.confirm("An error occurred while retrieving the product order line item list" + message, null);
                }
            }
        });
    }

    public promptToSave(): void {
        if (this.changeStatus && this.changeProductOrders && this.changeProductOrders.length > 0) {
            if (this.createSecurityAdvisorService.coreFacilitiesICanManage.length < 1) {
                this.dialogsService.confirm("Insufficient permissions to change status", null);
                return;
            }

            // TODO if lab node is selected give dialog

            this.save();
        }
    }

    private save(): void {
        let params: HttpParams = new HttpParams()
            .set("noJSONToXMLConversionNeeded", "Y")
            .set("codeProductOrderStatus", this.changeStatus);
        if (this.displayMode === this.DISPLAY_DETAIL) {
            // TODO
        } else if (this.displayMode === this.DISPLAY_OVERVIEW) {
            params = params.set("selectedLineItems", JSON.stringify(this.changeProductOrders));
        }
        this.productsService.changeProductOrderStatus(params).subscribe((response: any) => {
            if (response && response.result && response.result === 'SUCCESS') {
                if (response.message) {
                    this.dialogsService.confirm(response.message, null);
                }
                this.snackBar.open("Item(s) Saved", "Product Orders", {
                    duration: 2000,
                });
                this.getProductOrderLists();
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.confirm("An error occurred while saving product order line item(s)" + message, null);
            }
        });
    }

    public promptToDelete(): void {
        if (this.changeProductOrders && this.changeProductOrders.length > 0) {
            if (this.displayMode === this.DISPLAY_DETAIL) {
                // TODO
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
                    this.dialogsService.confirm("The selected line item(s) is marked as complete and cannot be deleted", null);
                } else if (hasComplete) {
                    this.dialogsService.confirm("At least one of the selected line item(s) is marked as complete and will be skipped. Continue?", " ").subscribe((response: boolean) => {
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
        let params: HttpParams = new HttpParams().set("noJSONToXMLConversionNeeded", "Y");
        if (this.displayMode === this.DISPLAY_DETAIL) {
            // TODO
        } else if (this.displayMode === this.DISPLAY_OVERVIEW) {
            params = params.set("productLineItemsToDeleteJSONString", JSON.stringify(this.changeProductOrders));
        }
        this.productsService.deleteProductLineItems(params).subscribe((response: any) => {
            if (response && response.result && response.result === 'SUCCESS') {
                if (response.message) {
                    this.dialogsService.confirm(response.message, null);
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
                this.dialogsService.confirm("An error occurred while deleting product order line item(s)" + message, null);
            }
        });
    }

    public onGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.gridColumnDefs);
        event.api.sizeColumnsToFit();
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        event.api.sizeColumnsToFit();
    }

    public onGridSelectionChanged(event: SelectionChangedEvent): void {
        this.changeProductOrders = event.api.getSelectedRows();
    }

}
