import {Component, OnInit, ViewChild} from "@angular/core";
import {BillingFilterEvent} from "./billing-filter.component";
import {ITreeOptions, TreeComponent} from "angular-tree-component";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {HttpParams} from "@angular/common/http";
import {BillingService} from "../services/billing.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {ConstantsService} from "../services/constants.service";
import {PropertyService} from "../services/property.service";
import {MatCheckboxChange, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {
    CellValueChangedEvent, GridApi, GridReadyEvent, GridSizeChangedEvent, RowClickedEvent, RowDoubleClickedEvent,
    RowDragEvent,
    RowNode
} from "ag-grid";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {DateEditor} from "../util/grid-editors/date.editor";
import {DateParserComponent} from "../util/parsers/date-parser.component";
import {IconTextRendererComponent} from "../util/grid-renderers/icon-text-renderer.component";
import {
    BillingTemplate, BillingTemplateWindowComponent,
    BillingTemplateWindowParams
} from "../util/billing-template-window.component";
import {Observable} from "rxjs/Observable";
import {PriceSheetViewComponent} from "./price-sheet-view.component";
import {PriceCategoryViewComponent} from "./price-category-view.component";
import {PriceViewComponent} from "./price-view.component";

@Component({
    selector: 'nav-billing',
    templateUrl: "./nav-billing.component.html",
    styles: [`
        mat-radio-button.filter-by-order-type-opt {
            margin-right: 0.5em;
        }
        .padding {
            padding: 0.5em;
        }
        .padding-left {
            padding-left: 1em;
        }
        .height-eighty {
            height: 80%;
        }
        .height-seventy-five {
            height: 75%;
        }
        .flex-one {
            flex: 1;
        }
        .flex-three {
            flex: 3;
        }
        .flex-seven {
            flex: 7;
        }
        .flex-ten {
            flex: 10;
        }
        div.bordered {
            border: gray solid 1px;
        }
        .justify-end {
            justify-content: flex-end;
        }
        .truncate {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        span.dirtyNote {
            background: yellow;
            padding: 0.5rem;
            margin-left: 1rem;
        }
        .font-small {
            font-size: 0.7em;
        }
        button.price-sheet-link {
            margin: 0 1em;
            padding: 0;
            text-decoration: underline;
        }
        .no-margin {
            margin: 0;
        }
        .no-padding {
            padding: 0;
        }
    `]
})

export class NavBillingComponent implements OnInit {

    private lastFilterEvent: BillingFilterEvent = null;

    @ViewChild(TreeComponent)
    private billingItemsTreeComponent: TreeComponent;
    public billingItemsTreeOptions: ITreeOptions;
    public billingItemsTreeNodes: ITreeNode[] = [];
    public billingItemsTreeSelectedNode: ITreeNode;
    public billingItemsTreeLastResult: any;

    public readonly FILTER_ALL: string = "All";
    public readonly FILTER_EXP: string = "Experiment";
    public readonly FILTER_DSK: string = "Disk Usage";
    public readonly FILTER_PO: string = "Product Order";
    public showFilterByOrderType: boolean = false;
    public showFilterByExp: boolean = false;
    public showFilterByDsk: boolean = false;
    public showFilterByPo: boolean = false;
    public filterByOrderType: string = this.FILTER_ALL;

    public readonly STATUS_PENDING: string = "PENDING";
    public readonly STATUS_COMPLETED: string = "COMPLETE";
    public readonly STATUS_APPROVED: string = "APPROVED";
    public showJumpToPending: boolean = false;
    public showJumpToCompleted: boolean = false;
    public showJumpToApproved: boolean = false;

    public expandLabs: boolean = true;
    public hideEmptyRequests: boolean = false;

    private billingItemList: any[] = [];
    public billingItemGridColumnDefs: any[];
    public billingItemGridData: any[] = [];
    public getBillingItemNodeChildDetails;
    public billingItemGridLabel: string = '';
    public showRelatedCharges: boolean = true;
    public billingItemGridRowClassRules: any;
    public billingItemGridApi: GridApi;

    public showDirtyNote: boolean = false;
    public selectedBillingItems: RowNode[] = [];
    public selectedBillingRequest: any = null;
    public disableSplitButton: boolean = true;
    public billingItemsToDelete: any[] = [];

    private invoiceMap: any = {};
    public invoiceLabel: string = "";

    private billingPeriods: any[] = [];
    private statuses: any[] = [];
    private statusListShort: any[] = [];
    public changeStatusValue: string = '';

    public priceTreeGridData: any[] = [];
    public priceTreeGridColDefs: any[];
    public priceTreeGridApi: GridApi;
    public getPriceNodeChildDetails;
    public selectedPriceTreeGridItem: RowNode;
    public showPricesCheckbox: boolean = true;
    public showPriceCriteriaCheckbox: boolean = false;
    public showInactivePricesCheckbox: boolean = false;
    public disableAddBillingItemButton: boolean = true;

    constructor(private billingService: BillingService,
                private dialogsService: DialogsService,
                private constantsService: ConstantsService,
                private propertyService: PropertyService,
                private dictionaryService: DictionaryService,
                private dialog: MatDialog) {
        this.billingPeriods = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_PERIOD);
        this.statuses = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_STATUS).filter((stat: any) => {
            return stat.value === this.STATUS_PENDING || stat.value === this.STATUS_COMPLETED || stat.value === this.STATUS_APPROVED;
        });
        this.statusListShort = this.statuses.filter((stat: any) => {
            return stat.value === this.STATUS_COMPLETED || stat.value === this.STATUS_APPROVED;
        });

        this.billingItemGridColumnDefs = [
            {headerName: "#", headerTooltip:"#", field: "requestNumber", tooltipField: "requestNumber", width: 100, cellRenderer: "agGroupCellRenderer"},
            {headerName: "", width: 40, maxWidth: 40, minWidth: 40, cellRendererFramework: IconTextRendererComponent},
            {headerName: "Group", headerTooltip:"Group", field: "labName", tooltipField: "labName", width: 100},
            {headerName: "Client", headerTooltip:"Client", field: "submitter", tooltipField: "submitter", width: 100},
            {headerName: "Acct", headerTooltip:"Acct", field: "billingAccountName", tooltipField: "billingAccountName", width: 100},
            {headerName: "Period", headerTooltip:"Period", editable: true, field: "idBillingPeriod", width: 100, cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: this.billingPeriods, selectOptionsDisplayField: "display",
                selectOptionsValueField: "idBillingPeriod"},
            {headerName: "%", headerTooltip:"%", field: "percentageDisplay", tooltipField: "percentageDisplay", width: 100},
            {headerName: "Type", headerTooltip:"Type", field: "codeBillingChargeKind", tooltipField: "codeBillingChargeKind", width: 100},
            {headerName: "Price Category", headerTooltip:"Price Category", field: "category", tooltipField: "category", width: 100},
            {headerName: "Description", headerTooltip:"Description", editable: true, field: "description", tooltipField: "description", width: 100},
            {headerName: "Complete Date", headerTooltip:"Complete Date", editable: true, field: "completeDate", width: 100, cellRendererFramework: DateRenderer,
                cellEditorFramework: DateEditor, dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY")},
            {headerName: "Notes", headerTooltip:"Notes", editable: true, field: "notes", tooltipField: "notes", width: 100},
            {headerName: "Unit price", headerTooltip:"Unit Price", editable: true, field: "unitPrice", tooltipField: "unitPrice", width: 100},
            {headerName: "Qty", headerTooltip:"Qty", editable: true, field: "qty", tooltipField: "qty", width: 100},
            {headerName: "Total price", headerTooltip:"Total price", field: "invoicePrice", tooltipField: "invoicePrice", width: 100},
            {headerName: "Status", headerTooltip:"Status", editable: true, field: "codeBillingStatus", width: 100, cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: this.statuses, selectOptionsDisplayField: "display",
                selectOptionsValueField: "codeBillingStatus"},
        ];
        this.getBillingItemNodeChildDetails = function getBillingItemNodeChildDetails(rowItem) {
            if (rowItem.BillingItem) {
                return {
                    group: true,
                    expanded: true,
                    children: rowItem.BillingItem,
                    key: rowItem.requestNumber
                };
            } else {
                return null;
            }
        };
        this.billingItemGridRowClassRules = {
            "otherBillingItem": "data.other === 'Y'"
        };

        this.priceTreeGridColDefs = [
            {headerName: "", field: "display", tooltipField: "display", width: 100, cellRenderer: "agGroupCellRenderer", rowDrag: true},
            {headerName: "", width: 40, maxWidth: 40, cellRendererFramework: IconTextRendererComponent},
            {headerName: "Price", headerTooltip: "Price", field: "unitPriceCurrency", tooltipField: "unitPriceCurrency", type: "numericColumn", width: 70, maxWidth: 70},
            {headerName: "Academic", headerTooltip: "Academic", field: "unitPriceExternalAcademicCurrency", tooltipField: "unitPriceExternalAcademicCurrency", type: "numericColumn", width: 70, maxWidth: 70},
            {headerName: "Commercial", headerTooltip: "Commercial", field: "unitPriceExternalCommercialCurrency", tooltipField: "unitPriceExternalCommercialCurrency", type: "numericColumn", width: 70, maxWidth: 70},
        ];
        this.getPriceNodeChildDetails = function getBillingItemNodeChildDetails(rowItem) {
            if (rowItem.idPriceSheet) {
                return {
                    group: true,
                    expanded: true,
                    children: rowItem.PriceCategory,
                    key: rowItem.display
                };
            } else if (rowItem.idPriceCategory && !rowItem.idPrice) {
                return {
                    group: true,
                    expanded: false,
                    children: rowItem.Price,
                    key: rowItem.display
                };
            } else if (rowItem.idPrice && !rowItem.idPriceCriteria && rowItem.PriceCriteria) {
                return {
                    group: true,
                    expanded: false,
                    children: rowItem.PriceCriteria,
                    key: rowItem.display
                };
            } else {
                return null;
            }
        };
    }

    ngOnInit() {
        this.billingItemsTreeOptions = {
            displayField: 'display',
        };
    }

    public onBillingItemGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.billingItemGridColumnDefs);
        event.api.sizeColumnsToFit();
        this.billingItemGridApi = event.api;
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        event.api.sizeColumnsToFit();
    }

    public onBillingItemGridChange(event: CellValueChangedEvent): void {
        event.data.isDirty = 'Y';
        if (event.data.idBillingItem) {
            let parent: any = event.node.parent.data;
            parent.isDirty = 'Y';
        }
        this.showDirtyNote = true;
    }

    public onBillingItemGridSelection(): void {
        let selectedRows: RowNode[] = this.billingItemGridApi.getSelectedNodes();
        if (selectedRows.length === 1 && selectedRows[0].data.requestNumber) {
            return; // Already handled in row clicked function below
        }
        this.selectedBillingItems = selectedRows.filter((item: RowNode) => {
            return !item.data.requestNumber;
        });
        this.selectedBillingRequest = null;
    }

    public onBillingItemGridRowSelection(event: RowClickedEvent): void {
        if (event.node.data.requestNumber) {
            event.node.setSelected(true, true);
            this.selectedBillingItems = event.node.childrenAfterGroup;
            this.selectedBillingRequest = event.node.data;
            this.disableSplitButton = false;
            if (this.selectedPriceTreeGridItem && this.selectedPriceTreeGridItem.data.idPrice && !this.selectedPriceTreeGridItem.data.idPriceCriteria) {
                this.disableAddBillingItemButton = false;
            }
        } else {
            this.disableSplitButton = true;
            this.disableAddBillingItemButton = true;
        }
    }

    public onFilterChange(event: BillingFilterEvent): void {
        this.lastFilterEvent = event;

        // BillingRequestList
        this.billingItemsTreeLastResult = null;
        this.filterByOrderType = this.FILTER_ALL;
        this.showFilterByOrderType = false;
        this.showFilterByExp = false;
        this.showFilterByDsk = false;
        this.showFilterByPo = false;
        this.expandLabs = true;
        this.invoiceMap = {};

        this.hideEmptyRequests = this.propertyService.getProperty("hide_requests_with_no_billing_items", event.idCoreFacility) === 'Y';
        let excludeNewRequests: boolean = event.idCoreFacility && this.propertyService.getProperty("exclude_new_requests", event.idCoreFacility) === 'Y';

        let billingRequestListParams: HttpParams = new HttpParams();
        if (event && event.requestNumber) {
            billingRequestListParams = billingRequestListParams.set("requestNumber", event.requestNumber);
        } else if (event && event.invoiceNumber) {
            billingRequestListParams = billingRequestListParams.set("invoiceLookupNumber", event.invoiceNumber);
        } else {
            billingRequestListParams = billingRequestListParams
                .set("idBillingPeriod", event.idBillingPeriod ? event.idBillingPeriod : "")
                .set("idLab", event.idLab ? event.idLab : "")
                .set("idBillingAccount", event.idBillingAccount ? event.idBillingAccount : "")
                .set("idCoreFacility", event.idCoreFacility ? event.idCoreFacility : "")
                .set("excludeNewRequests", excludeNewRequests ? "Y" : "N")
                .set("excludeInactiveBillingTemplates", "Y")
                .set("deepSortResults", "Y");
        }

        this.billingService.getBillingRequestList(billingRequestListParams).subscribe((result: any) => {
            this.billingItemsTreeLastResult = result;
            this.buildBillingItemsTree(this.billingItemsTreeLastResult);
        });

        this.refreshBillingItemList(event);

        // BillingInvoiceList
        let billingInvoiceListParams: HttpParams = new HttpParams()
            .set("requestNumber", event.requestNumber ? event.requestNumber : '')
            .set("invoiceLookupNumber", event.invoiceNumber ? event.invoiceNumber : '')
            .set("idBillingPeriod", event.requestNumber || event.invoiceNumber ? '' : event.idBillingPeriod ? event.idBillingPeriod : '')
            .set("idLab", event.requestNumber || event.invoiceNumber ? '' : event.idLab ? event.idLab : '')
            .set("idCoreFacility", event.requestNumber || event.invoiceNumber ? '' : event.idCoreFacility ? event.idCoreFacility : '')
            .set("excludeNewRequests", excludeNewRequests ? 'Y' : 'N');
        this.billingService.getBillingInvoiceList(billingInvoiceListParams).subscribe((result: any) => {
            let invoices: any[] = [];
            if (result && Array.isArray(result)) {
                invoices = result;
            } else if (result && result.Invoice) {
                invoices.push(result.Invoice);
            } else if (result) {
                let message: string = "";
                if (result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.confirm("An error occurred while retrieving invoice list" + message, null);
            }
            for (let invoice of invoices) {
                this.invoiceMap[invoice.idInvoice] = invoice;
            }
        });

        // Price tree grid
        this.refreshPricingGrid();
    }

    public refreshBillingItemList(event: BillingFilterEvent, reselectIfPossible?: boolean): void {
        this.showDirtyNote = false;
        this.selectedBillingItems = [];
        this.selectedBillingRequest = null;
        this.billingItemsToDelete = [];

        this.disableSplitButton = true;
        this.disableAddBillingItemButton = true;

        this.billingItemGridLabel = '';
        this.billingItemList = [];
        this.billingItemGridData = [];

        let excludeNewRequests: boolean = event.idCoreFacility && this.propertyService.getProperty("exclude_new_requests", event.idCoreFacility) === 'Y';

        let params: HttpParams = new HttpParams()
            .set("showOtherBillingItems", this.showRelatedCharges ? 'Y' : 'N')
            .set("requestNumber", event.requestNumber ? event.requestNumber : '')
            .set("invoiceLookupNumber", event.invoiceNumber ? event.invoiceNumber : '')
            .set("idBillingPeriod", event.idBillingPeriod ? event.idBillingPeriod : '')
            .set("idLab", event.requestNumber || event.invoiceNumber ? '' : event.idLab ? event.idLab : '')
            .set("idBillingAccount", event.requestNumber ? '' : event.idBillingAccount ? event.idBillingAccount : '')
            .set("idCoreFacility", event.idCoreFacility ? event.idCoreFacility : '')
            .set("excludeNewRequests", excludeNewRequests ? 'Y' : 'N')
            .set("excludeInactiveBillingTemplates", 'Y')
            .set("sortResults", 'N');

        this.billingService.getBillingItemList(params).subscribe((result: any) => {
            if (result && Array.isArray(result)) {
                this.billingItemList = result;
            } else if (result && result.Request) {
                this.billingItemList = [result.Request];
            } else if (result) {
                let message: string = "";
                if (result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.confirm("An error occurred while retrieving billing item list" + message, null);
            }

            for (let r of this.billingItemList) {
                if (r.BillingItem) {
                    let billingItems: any[] = Array.isArray(r.BillingItem) ? r.BillingItem : [r.BillingItem];
                    for (let b of billingItems) {
                        b.icon = "assets/money.png";
                    }
                    r.BillingItem = billingItems;
                } else {
                    r.BillingItem = [];
                }
            }

            if (reselectIfPossible) {
                this.selectTreeNode(this.billingItemsTreeSelectedNode);
            }
        });
    }

    private buildBillingItemsTree(result: any, reselectIfPossible?: boolean): void {
        let lastSelectedNode: ITreeNode = this.billingItemsTreeSelectedNode;

        this.billingItemGridLabel = '';
        this.billingItemGridData = [];
        this.selectedBillingItems = [];
        this.selectedBillingRequest = null;

        this.disableSplitButton = true;
        this.disableAddBillingItemButton = true;

        this.billingItemsTreeSelectedNode = null;
        this.billingItemsTreeNodes = [];
        this.showJumpToPending = false;
        this.showJumpToCompleted = false;
        this.showJumpToApproved = false;

        if (result && result.result === 'INVALID' && result.message) {
            this.dialogsService.confirm(result.message, null);
        } else if (result) {
            let statusNodes: any[] = Array.isArray(result) ? result : [result.Status];
            for (let child of statusNodes) {
                let statusNode: ITreeNode = this.makeStatusNode(child);
                if (statusNode) {
                    this.billingItemsTreeNodes.push(statusNode);
                }
            }
            this.billingItemsTreeComponent.treeModel.update();

            this.showFilterByOrderType = (this.showFilterByExp && this.showFilterByDsk) || (this.showFilterByExp && this.showFilterByPo) || (this.showFilterByDsk && this.showFilterByPo);

            setTimeout(() => {
                for (let sn of this.billingItemsTreeComponent.treeModel.roots) {
                    sn.expand();
                }

                if (reselectIfPossible) {
                    this.selectTreeNode(lastSelectedNode);
                }
            });
        }
    }

    private makeStatusNode(obj: any): ITreeNode {
        let statusNode: any = obj;
        statusNode.display = statusNode.label;
        statusNode.icon = this.constantsService.ICON_FOLDER;
        statusNode.name = "Status";
        let childrenNodes: ITreeNode[] = [];
        if (statusNode.status === this.STATUS_PENDING) {
            let children: any[] = Array.isArray(statusNode.Request) ? statusNode.Request : [statusNode.Request];
            for (let child of children) {
                let requestNode: ITreeNode = this.makeRequestNode(child, false);
                if (requestNode) {
                    childrenNodes.push(requestNode);
                }
            }
        } else {
            let children: any[] = Array.isArray(statusNode.Lab) ? statusNode.Lab : [statusNode.Lab];
            for (let child of children) {
                let labNode: ITreeNode = this.makeLabNode(child);
                if (labNode) {
                    childrenNodes.push(labNode);
                }
            }
        }
        if (childrenNodes.length === 0) {
            return null;
        }
        statusNode.children = childrenNodes;
        if (statusNode.status === this.STATUS_PENDING) {
            this.showJumpToPending = true;
        } else if (statusNode.status === this.STATUS_COMPLETED) {
            this.showJumpToCompleted = true;
        } else if (statusNode.status === this.STATUS_APPROVED) {
            this.showJumpToApproved = true;
        }
        return statusNode;
    }

    private makeLabNode(obj: any): ITreeNode {
        let labNode: any = obj;
        labNode.display = labNode.label;
        labNode.icon = "assets/group.png";
        labNode.name = "Lab";
        let children: any[] = Array.isArray(labNode.Request) ? labNode.Request : [labNode.Request];
        let childrenNodes: ITreeNode[] = [];
        for (let child of children) {
            let requestNode: ITreeNode = this.makeRequestNode(child, true);
            if (requestNode) {
                childrenNodes.push(requestNode);
            }
        }
        if (childrenNodes.length === 0) {
            return null;
        }
        labNode.children = childrenNodes;
        return labNode;
    }

    private makeRequestNode(obj: any, belongsToLabNode: boolean): ITreeNode {
        let requestNode: any = obj;
        requestNode.name = "Request";
        if (this.showFilterByOrderType && this.filterByOrderType !== this.FILTER_ALL) {
            if (this.filterByOrderType === this.FILTER_PO && requestNode.type !== this.FILTER_PO) {
                return null;
            } else if (this.filterByOrderType === this.FILTER_DSK && requestNode.type !== this.FILTER_DSK) {
                return null;
            } else if (this.filterByOrderType === this.FILTER_EXP && (requestNode.type === this.FILTER_PO || requestNode.type === this.FILTER_DSK)) {
                return null;
            }
        }
        if (requestNode.type === this.FILTER_PO) {
            this.showFilterByPo = true;
        } else if (requestNode.type === this.FILTER_DSK) {
            this.showFilterByDsk = true;
        } else {
            this.showFilterByExp = true;
        }
        if (this.hideEmptyRequests && requestNode.hasBillingItems && requestNode.hasBillingItems === 'N') {
            return null;
        }
        requestNode.display = belongsToLabNode ? requestNode.label : requestNode.label + " " + requestNode.labBillingName;
        return requestNode;
    }

    public onBillingItemsTreeActivate(event: any): void {
        let node: ITreeNode = event.node;
        this.billingItemsTreeSelectedNode = node;
        if (node.hasChildren) {
            node.expand();
        }

        this.disableSplitButton = true;
        this.disableAddBillingItemButton = true;

        let billingItems: any[] = [];
        let requestNumbers: Set<string> = new Set<string>();
        if (node.data.name === 'Status' && node.data.status === this.STATUS_PENDING) {
            let requests: any[] = Array.isArray(node.data.Request) ? node.data.Request : [node.data.Request];
            for (let r of requests) {
                this.addRequestBillingItems(r.requestNumber, billingItems, requestNumbers);
            }
        } else if (node.data.name === 'Status') {
            let labs: any[] = Array.isArray(node.data.Lab) ? node.data.Lab : [node.data.Lab];
            for (let l of labs) {
                let requests: any[] = Array.isArray(l.Request) ? l.Request : [l.Request];
                for (let r of requests) {
                    this.addRequestBillingItems(r.requestNumber, billingItems, requestNumbers);
                }
            }
        } else if (node.data.name === 'Lab') {
            let requests: any[] = Array.isArray(node.data.Request) ? node.data.Request : [node.data.Request];
            for (let r of requests) {
                this.addRequestBillingItems(r.requestNumber, billingItems, requestNumbers);
            }
        } else if (node.data.name === 'Request') {
            this.addRequestBillingItems(node.data.requestNumber, billingItems);
        }

        let totalPrice: number = 0;
        for (let r of billingItems) {
            if (r.totalPrice) {
                let price: string = r.totalPrice;
                price = price
                    .replace('$', '')
                    .replace(',', '')
                    .replace("(", "-")
                    .replace(")", "");
                totalPrice += Number(price);
            }
        }
        this.billingItemGridLabel = node.data.label + " " + totalPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'});

        if (node.data.idInvoice && this.invoiceMap[node.data.idInvoice]) {
            let invoice: any = this.invoiceMap[node.data.idInvoice];
            this.invoiceLabel = "Invoice " + invoice.invoiceNumber + " Email Date " + invoice.lastEmailDate;
        } else {
            this.invoiceLabel = "";
        }

        this.selectedBillingItems = [];
        this.selectedBillingRequest = null;
        this.billingItemGridData = billingItems;
    }

    private addRequestBillingItems(requestNumber: string, billingItems: any[], requestNumbers?: Set<string>): void {
        if (requestNumbers) {
            if (requestNumbers.has(requestNumber)) {
                return;
            } else {
                requestNumbers.add(requestNumber);
            }
        }
        let requestNodes: any[] = this.billingItemList.filter((request: any) => {
            return request.requestNumber === requestNumber;
        });
        for (let r of requestNodes) {
            if (this.hideEmptyRequests && r.BillingItem.length < 1) {
                continue;
            }
            billingItems.push(r);
        }
    }

    public onFilterByOrderTypeChange(): void {
        this.buildBillingItemsTree(this.billingItemsTreeLastResult);
    }

    public jumpTo(status: string): void {
        for (let sn of this.billingItemsTreeComponent.treeModel.roots) {
            if (sn.data.status === status) {
                sn.toggleActivated(null);
                break;
            }
        }
    }

    public toggleExpandLabs(): void {
        for (let sn of this.billingItemsTreeComponent.treeModel.roots) {
            if (sn.data.status !== this.STATUS_PENDING) {
                for (let child of sn.children) {
                    if (this.expandLabs) {
                        child.expand();
                    } else {
                        child.collapse();
                    }
                }
            }
        }

        this.expandLabs = !this.expandLabs;
    }

    public onHideEmptyRequestsChange(event: MatCheckboxChange): void {
        this.hideEmptyRequests = event.checked;
        this.buildBillingItemsTree(this.billingItemsTreeLastResult, true);
    }

    public onShowRelatedChargesChange(event: MatCheckboxChange): void {
        this.showRelatedCharges = event.checked;
        this.refreshBillingItemList(this.lastFilterEvent, true);
    }

    private selectTreeNode(node: ITreeNode): void {
        let prevActiveNode: ITreeNode = this.billingItemsTreeComponent.treeModel.getActiveNode();
        if (prevActiveNode) {
            prevActiveNode.toggleActivated(null);
        }

        if (!node) {
            return;
        }

        for (let statusNode of this.billingItemsTreeComponent.treeModel.roots) {
            let foundNode: ITreeNode = this.recursivelyFindTreeNode(statusNode, node.data.display);
            if (foundNode) {
                node.toggleActivated(null);
                break;
            }
        }
    }

    private recursivelyFindTreeNode(current: ITreeNode, display: string): ITreeNode {
        if (current.data.display === display) {
            return current;
        } else {
            if (current.hasChildren) {
                for (let child of current.children) {
                    let foundNode: ITreeNode = this.recursivelyFindTreeNode(child, display);
                    if (foundNode) {
                        return foundNode;
                    }
                }
            }
            return null;
        }
    }

    public removeBillingItems(): void {
        if (this.selectedBillingItems.length > 0) {
            for (let item of this.selectedBillingItems) {
                if (item.data.idBillingItem) {
                    item.data.remove = 'Y';
                    this.billingItemsToDelete.push(item.data);
                    let r: any = item.parent.data;
                    let billingItems: any[] = r.BillingItem;
                    billingItems.splice(billingItems.indexOf(item.data), 1);
                    r.isDirty = 'Y';
                }
            }
            this.showDirtyNote = true;
            this.selectTreeNode(this.billingItemsTreeSelectedNode);
        }
    }

    public validateAndSave(): void {
        this.billingItemGridApi.stopEditing();

        let isExternalApproved: boolean = false;
        let isEmptyPriceOrQty: boolean = false;

        for (let r of this.billingItemList) {
            if (r.isDirty === 'Y') {
                if (r.isExternalPricing === 'Y' || r.isExternalCommercialPricing === 'Y') {
                    for (let bi of r.BillingItem) {
                        if (bi.codeBillingStatus === this.STATUS_APPROVED) {
                            isExternalApproved = true;
                            break;
                        }
                    }
                }

                for (let bi of r.BillingItem) {
                    if (bi.qty === '' || bi.unitPrice === '' || bi.unitPrice === '0' || bi.invoicePrice === '' || bi.invoicePrice === '0') {
                        isEmptyPriceOrQty = true;
                    } else if (bi.qty && bi.unitPrice) {
                        let qtyParsed: number = Number.parseInt(bi.qty);
                        let unitPriceParsed: number = Number.parseFloat(bi.unitPrice.replace("$", ''));
                        if (qtyParsed < 0 && unitPriceParsed < 0) {
                            this.dialogsService.confirm("Either unit price or qty can be negative but not both", null);
                            return;
                        }
                    }
                    if (bi.idBillingPeriod === '') {
                        this.dialogsService.confirm("Each price must have an associated billing period", null);
                        return;
                    }
                }
            }
        }

        let msg: string = '';
        if (isExternalApproved) {
            msg += "External account to be approved. has pricing been verified?";
        }
        if (isEmptyPriceOrQty) {
            msg += " Price or qty is blank. Proceed anyway?";
        }

        if (msg != '') {
            this.dialogsService.confirm(msg, " ").subscribe((result: boolean) => {
                if (result) {
                    this.saveBillingItems();
                }
            });
        } else {
            this.saveBillingItems();
        }
    }

    private saveBillingItems(): void {
        let saveListArray: any[] = [];
        for (let r of this.billingItemList) {
            if (r.isDirty === 'Y') {
                for (let bi of r.BillingItem) {
                    if (bi.isDirty === 'Y') {
                        bi.completeDate = bi.completeDateOther;
                        saveListArray.push(bi);
                    }
                }
            }
        }

        let invoiceListArray: any[] = []; // TODO somewhere invoices can be edited

        let paramObject: any = {};
        paramObject.saveList = saveListArray;
        paramObject.removeList = this.billingItemsToDelete;
        paramObject.invoiceList = invoiceListArray;

        let params: HttpParams = new HttpParams()
            .set("billingItemJSONString", JSON.stringify(paramObject))
            .set("noJSONToXMLConversionNeeded", "Y");
        this.billingService.saveBillingItemList(params).subscribe((result: any) => {
            if (result && result.result === "SUCCESS") {
                if (this.lastFilterEvent) {
                    this.onFilterChange(this.lastFilterEvent);
                }
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.confirm("An error occurred while saving billing items" + message, null);
            }
        });
    }

    private updateBillingItemsWithNewValue(field: string, newValue: string): void {
        if (this.selectedBillingItems.length > 0) {
            for (let item of this.selectedBillingItems) {
                if (item.data.idBillingItem) {
                    item.data[field] = newValue;
                    item.data.isDirty = 'Y';
                    let parent: any = item.parent.data;
                    parent.isDirty = 'Y';
                }
            }
        } else {
            for (let r of this.billingItemGridData) {
                for (let bi of r.BillingItem) {
                    bi[field] = newValue;
                    bi.isDirty = 'Y';
                }
                r.isDirty = 'Y';
            }
        }
        this.showDirtyNote = true;
        this.billingItemGridApi.refreshCells();
    }

    public onChangeStatus(): void {
        if (this.changeStatusValue) {
            this.updateBillingItemsWithNewValue("codeBillingStatus", this.changeStatusValue);
            setTimeout(() => {
                this.changeStatusValue = '';
            });
        }
    }

    public onMoveToNextPeriod(): void {
        if (this.lastFilterEvent.idBillingPeriod) {
            let months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            let currentPeriodDisplay: string = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_PERIOD).filter((period: any) => {
                return period.idBillingPeriod === this.lastFilterEvent.idBillingPeriod;
            })[0].display;
            let selYear: number = parseInt(currentPeriodDisplay.substring(currentPeriodDisplay.length - 4));
            let selMonth: number = months.indexOf(currentPeriodDisplay.substring(0, 3));

            let nextMonth: number = (selMonth + 1) % 12;
            if (nextMonth === 0) {
                selYear++;
            }
            let nextPeriodDisplay: string = months[nextMonth] + " " + selYear;
            let nextPeriodList: any[] = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_PERIOD).filter((period: any) => {
                return period.display === nextPeriodDisplay;
            });
            if (nextPeriodList.length > 0) {
                this.updateBillingItemsWithNewValue("idBillingPeriod", nextPeriodList[0].idBillingPeriod);
            }
        }
    }

    public openSplitWindow(): void {
        if (this.selectedBillingRequest) {
            let id: string = "";
            let className: string = "";

            let request: any = this.selectedBillingRequest;

            if (request.status === "NEW") {
                this.dialogsService.confirm("Please save the billing items before reassigning / splitting", null);
                return;
            }
            if (this.showDirtyNote) {
                this.dialogsService.confirm("Please save changes before reassigning / splitting", null);
                return;
            }

            if (request.idProductOrder) {
                id = request.idProductOrder;
                className = "ProductOrder";
            } else if (request.idRequest) {
                id = request.idRequest;
                className = "Request";
            } else {
                this.dialogsService.confirm("Billing can be reassigned / split only for Requests and Product Orders", null);
                return;
            }

            this.billingService.getBillingTemplate(id, className).subscribe((template: BillingTemplate) => {
                if (template) {
                    let params: BillingTemplateWindowParams = new BillingTemplateWindowParams();
                    params.idCoreFacility = this.lastFilterEvent.idCoreFacility;
                    params.billingTemplate = template;

                    let config: MatDialogConfig = new MatDialogConfig();
                    config.data = {
                        params: params
                    };

                    let dialogRef: MatDialogRef<BillingTemplateWindowComponent> = this.dialog.open(BillingTemplateWindowComponent, config);
                    dialogRef.afterClosed().subscribe((result: any) => {
                        if (result) {
                            this.billingService.saveBillingTemplate(result).subscribe((result: any) => {
                                if (result && result.result === "SUCCESS") {
                                    if (this.lastFilterEvent) {
                                        this.onFilterChange(this.lastFilterEvent);
                                    }
                                } else {
                                    let message: string = "";
                                    if (result && result.message) {
                                        message = ": " + result.message;
                                    }
                                    this.dialogsService.confirm("An error occurred while saving the billing template" + message, null);
                                }
                            });
                        }
                    });
                } else {
                    this.dialogsService.confirm("There was an error retrieving the billing template", null);
                }
            });
        }
    }

    private refreshPricingGrid(): void {
        this.priceTreeGridData = [];
        this.selectedPriceTreeGridItem = null;

        let params: HttpParams = new HttpParams()
            .set("showPrices", this.showPricesCheckbox ? "Y" : "N")
            .set("showPriceCriteria", this.showPriceCriteriaCheckbox ? "Y" : "N")
            .set("showInactive", this.showInactivePricesCheckbox ? "Y" : "N")
            .set("idCoreFacility", this.lastFilterEvent && this.lastFilterEvent.idCoreFacility ? this.lastFilterEvent.idCoreFacility : "");

        this.billingService.getPricingList(params).subscribe((result: any) => {
            if (result) {
                if (result.result && result.result !== "SUCCESS") {
                    let message: string = "";
                    if (result.message) {
                        message = ": " + result.message;
                    }
                    this.dialogsService.confirm("An error occurred while retrieving the price list" + message, null);
                    return;
                } else {
                    let priceSheets: any[] = Array.isArray(result) ? result : [result.PriceSheet];
                    for (let sheet of priceSheets) {
                        sheet.icon = "assets/pricesheet.png";
                        if (sheet.PriceCategory) {
                            sheet.PriceCategory = Array.isArray(sheet.PriceCategory) ? sheet.PriceCategory : [sheet.PriceCategory];
                        } else {
                            sheet.PriceCategory = [];
                        }

                        for (let cat of sheet.PriceCategory) {
                            cat.icon = "assets/folder_money.png";
                            if (cat.Price) {
                                cat.Price = Array.isArray(cat.Price) ? cat.Price : [cat.Price];
                            } else {
                                cat.Price = [];
                            }

                            for (let p of cat.Price) {
                                p.icon = p.isActive === 'Y' ? "assets/money.png" : "assets/money_disable.png";
                                if (this.showPriceCriteriaCheckbox) {
                                    if (p.PriceCriteria) {
                                        p.PriceCriteria = Array.isArray(p.PriceCriteria) ? p.PriceCriteria : [p.PriceCriteria];
                                    } else {
                                        p.PriceCriteria = [];
                                    }

                                    for (let criteria of p.PriceCriteria) {
                                        criteria.icon = "assets/attach.png";
                                    }
                                }
                            }
                        }
                    }

                    this.priceTreeGridData = priceSheets;
                }
            }
        });
    }

    public onPriceTreeGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.priceTreeGridColDefs);
        event.api.sizeColumnsToFit();
        this.priceTreeGridApi = event.api;
    }

    public onPriceTreeGridSelection(event: RowClickedEvent): void {
        event.node.setSelected(true, true);
        if (!event.data.idPriceCriteria) {
            this.selectedPriceTreeGridItem = event.node;
        } else {
            this.selectedPriceTreeGridItem = null;
        }

        if (event.data.idPrice && !event.data.idPriceCriteria && this.selectedBillingRequest) {
            this.disableAddBillingItemButton = false;
        } else {
            this.disableAddBillingItemButton = true;
        }
    }

    public onPriceTreeGridRowDoubleClick(event: RowDoubleClickedEvent): void {
        if (event.data.idPriceCriteria) {
            return;
        }

        event.node.setExpanded(true);
        let dialogConfig: MatDialogConfig = new MatDialogConfig();
        let dialogRef: MatDialogRef<any>;

        if (event.data.idPriceSheet) {
            dialogConfig.data = {
                idPriceSheet: event.data.idPriceSheet
            };
            dialogRef = this.dialog.open(PriceSheetViewComponent, dialogConfig);
        } else if (event.data.idPriceCategory && !event.data.idPrice) {
            dialogConfig.data = {
                idPriceCategory: event.data.idPriceCategory,
                idPriceSheet: event.node.parent.data.idPriceSheet
            };
            dialogRef = this.dialog.open(PriceCategoryViewComponent, dialogConfig);
        } else if (event.data.idPrice) {
            dialogConfig.data = {
                idPrice: event.data.idPrice,
                idPriceCategory: event.node.parent.data.idPriceCategory,
                idCoreFacility: this.lastFilterEvent.idCoreFacility
            };
            dialogRef = this.dialog.open(PriceViewComponent, dialogConfig);
        }

        if (dialogRef) {
            dialogRef.afterClosed().subscribe((result: any) => {
                if (result) {
                    this.refreshPricingGrid();
                }
            });
        }
    }

    public onPriceTreeGridDragEnd(event: RowDragEvent): void {
        let dragItemNode: RowNode = event.node;
        if (dragItemNode.data.idPriceCategory && !dragItemNode.data.idPrice) {
            let dropItemNode: RowNode = event.overNode;
            let dropPriceCategory: any = null;
            let dropPriceSheet: any = null;
            let dropPosition: string = "after";

            if (!dropItemNode) {
                return;
            }

            if (dropItemNode.data.idPriceSheet) {
                dropPriceSheet = dropItemNode.data;
                if ((dropPriceSheet.PriceCategory as any[]).length > 0) {
                    dropPriceCategory = (dropPriceSheet.PriceCategory as any[])[0];
                    dropPosition = "before";
                }
            } else if (dropItemNode.data.idPriceCategory && !dropItemNode.data.idPrice) {
                dropPriceSheet = dropItemNode.parent.data;
                dropPriceCategory = dropItemNode.data;
            } else if (dropItemNode.data.idPrice && !dropItemNode.data.idPriceCriteria) {
                dropPriceSheet = dropItemNode.parent.parent.data;
                dropPriceCategory = dropItemNode.parent.data;
            } else {
                return;
            }

            if (dropPriceCategory && dropPriceCategory.idPriceCategory === dragItemNode.data.idPriceCategory) {
                return;
            }

            let params: HttpParams = new HttpParams()
                .set("idPriceCategorySource", dragItemNode.data.idPriceCategory)
                .set("idPriceSheetTarget", dropPriceSheet.idPriceSheet)
                .set("idPriceCategoryPosition", dropPriceCategory ? dropPriceCategory.idPriceCategory : "")
                .set("dropPosition", dropPosition);
            this.billingService.movePriceCategory(params).subscribe((result: any) => {
                if (result) {
                    if (result.result && result.result === "SUCCESS") {
                        this.refreshPricingGrid();
                        if (result.message) {
                            this.dialogsService.confirm(result.message, null);
                        }
                    } else {
                        let message: string = "";
                        if (result.message) {
                            message = ": " + result.message;
                        }
                        this.dialogsService.confirm("An error occurred while moving price category" + message, null);
                    }
                }
            });
        } else {
            this.dialogsService.confirm("Drag-and-drop only allowed for price categories", null);
        }
    }

    public openNewSheetWindow(): void {
        let dialogRef: MatDialogRef<PriceSheetViewComponent> = this.dialog.open(PriceSheetViewComponent);
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.refreshPricingGrid();
            }
        });
    }

    public openNewCategoryWindow(): void {
        if (!this.selectedPriceTreeGridItem) {
            this.dialogsService.confirm("Please select a price sheet", null);
            return;
        }

        let idPriceSheet: string;
        if (this.selectedPriceTreeGridItem.data.idPriceSheet) {
            idPriceSheet = this.selectedPriceTreeGridItem.data.idPriceSheet;
        } else if (this.selectedPriceTreeGridItem.data.idPriceCategory && !this.selectedPriceTreeGridItem.data.idPrice) {
            idPriceSheet = this.selectedPriceTreeGridItem.parent.data.idPriceSheet;
        } else if (this.selectedPriceTreeGridItem.data.idPrice && !this.selectedPriceTreeGridItem.data.idPriceCriteria) {
            idPriceSheet = this.selectedPriceTreeGridItem.parent.parent.data.idPriceSheet;
        } else {
            idPriceSheet = this.selectedPriceTreeGridItem.parent.parent.parent.data.idPriceSheet;
        }

        let dialogConfig: MatDialogConfig = new MatDialogConfig();
        dialogConfig.data = {
            idPriceSheet: idPriceSheet
        };
        let dialogRef: MatDialogRef<PriceCategoryViewComponent> = this.dialog.open(PriceCategoryViewComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.refreshPricingGrid();
            }
        });
    }

    public openNewPriceWindow(): void {
        if (!this.selectedPriceTreeGridItem || this.selectedPriceTreeGridItem.data.idPriceSheet) {
            this.dialogsService.confirm("Please select a price category", null);
            return;
        }

        let idPriceCategory: string;
        if (this.selectedPriceTreeGridItem.data.idPriceCategory && !this.selectedPriceTreeGridItem.data.idPrice) {
            idPriceCategory = this.selectedPriceTreeGridItem.data.idPriceCategory;
        } else if (this.selectedPriceTreeGridItem.data.idPrice && !this.selectedPriceTreeGridItem.data.idPriceCriteria) {
            idPriceCategory = this.selectedPriceTreeGridItem.parent.data.idPriceCategory;
        } else {
            idPriceCategory = this.selectedPriceTreeGridItem.parent.parent.data.idPriceCategory;
        }

        let dialogConfig: MatDialogConfig = new MatDialogConfig();
        dialogConfig.data = {
            idPriceCategory: idPriceCategory,
            idCoreFacility: this.lastFilterEvent.idCoreFacility
        };
        let dialogRef: MatDialogRef<PriceViewComponent> = this.dialog.open(PriceViewComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.refreshPricingGrid();
            }
        });
    }

    public removeFromPriceTree(): void {
        if (this.selectedPriceTreeGridItem) {
            let warningMessage: string;
            if (this.selectedPriceTreeGridItem.data.idPriceCategory && !this.selectedPriceTreeGridItem.data.idPrice) {
                warningMessage = "Are you sure you want to remove (unlink) category '" + this.selectedPriceTreeGridItem.data.display + "' from the price sheet?";
            } else {
                warningMessage = "Are you sure you want to remove '" + this.selectedPriceTreeGridItem.data.display + "'?";
            }
            this.dialogsService.confirm(warningMessage, " ").subscribe((result: boolean) => {
                if (result) {
                    let controllerCall: Observable<any>;
                    if (this.selectedPriceTreeGridItem.data.idPriceSheet) {
                        controllerCall = this.billingService.deletePriceSheet(this.selectedPriceTreeGridItem.data.idPriceSheet);
                    } else if (this.selectedPriceTreeGridItem.data.idPriceCategory && !this.selectedPriceTreeGridItem.data.idPrice && this.selectedPriceTreeGridItem.parent && this.selectedPriceTreeGridItem.parent.data.idPriceSheet) {
                        controllerCall = this.billingService.deletePriceCategory(this.selectedPriceTreeGridItem.data.idPriceCategory, this.selectedPriceTreeGridItem.parent.data.idPriceSheet);
                    } else if (this.selectedPriceTreeGridItem.data.idPrice && !this.selectedPriceTreeGridItem.data.idPriceCriteria) {
                        controllerCall = this.billingService.deletePrice(this.selectedPriceTreeGridItem.data.idPrice);
                    }

                    if (controllerCall) {
                        controllerCall.subscribe((result: any) => {
                            if (result && result.result && result.result === "SUCCESS") {
                                this.refreshPricingGrid();
                            } else {
                                let message: string = "";
                                if (result && result.message) {
                                    message = ": " + result.message;
                                }
                                this.dialogsService.confirm("An error occurred while removing" + message, null);
                            }
                        });
                    }
                }
            });
        }
    }

    public jumpToPriceSheet(idPriceSheet: string): void {
        this.priceTreeGridApi.forEachNode((node: RowNode) => {
            if (node.data.idPriceSheet && node.data.idPriceSheet === idPriceSheet) {
                node.setSelected(true, true);
                this.priceTreeGridApi.ensureIndexVisible(node.rowIndex, 'top');
                this.selectedPriceTreeGridItem = node;
            }
        });
    }

    public addNewBillingItem(): void {
        if (this.selectedPriceTreeGridItem && this.selectedPriceTreeGridItem.data.idPrice && !this.selectedPriceTreeGridItem.data.idPriceCriteria && this.selectedBillingRequest) {
            if (this.selectedBillingRequest.codeRequestCategory === "PRODUCTORDER") {
                return;
            }

            let price: string = this.selectedPriceTreeGridItem.data.unitPrice;
            if (this.selectedBillingRequest.isExternalPricing === 'Y') {
                price = this.selectedPriceTreeGridItem.data.unitPriceExternalAcademic;
            }
            if (this.selectedBillingRequest.isExternalPricingCommercial === 'Y') {
                price = this.selectedPriceTreeGridItem.data.unitPriceExternalCommercial;
            }
            let newBillingItem: any = {
                codeBillingChargeKind: this.selectedPriceTreeGridItem.data.codeBillingChargeKind,
                category: this.selectedPriceTreeGridItem.data.category,
                description: this.selectedPriceTreeGridItem.data.name,
                unitPrice: price,
                codeBillingStatus: 'PENDING',
                idBillingPeriod: this.lastFilterEvent.idBillingPeriod ? this.lastFilterEvent.idBillingPeriod : '',
                idPriceCategory: this.selectedPriceTreeGridItem.parent.data.idPriceCategory,
                idPrice: this.selectedPriceTreeGridItem.data.idPrice,
                idRequest: this.selectedBillingRequest.idRequest,
                idBillingAccount: this.selectedBillingRequest.idBillingAccount,
                idLab: this.selectedBillingRequest.idLab,
                percentagePrice: '1',
                percentageDisplay: '100.0%',
                splitType: '%',
                notes: '',
                qty: '',
                idCoreFacility: this.selectedBillingRequest.idCoreFacility,
                isDirty: 'Y',
                icon: "assets/money.png"
            };
            this.selectedBillingRequest.isDirty = 'Y';
            (this.selectedBillingRequest.BillingItem as any[]).push(newBillingItem);

            this.showDirtyNote = true;
            this.selectTreeNode(this.billingItemsTreeSelectedNode);
        }
    }

}
