import {Component, OnInit, ViewChild} from "@angular/core";
import {BillingFilterEvent} from "./billing-filter.component";
import {ITreeOptions, TreeComponent} from "angular-tree-component";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {HttpParams} from "@angular/common/http";
import {BillingService} from "../services/billing.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {ConstantsService} from "../services/constants.service";
import {PropertyService} from "../services/property.service";
import {MatCheckboxChange} from "@angular/material";
import {CellValueChangedEvent, GridApi, GridReadyEvent, GridSizeChangedEvent, SelectionChangedEvent} from "ag-grid";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {DateEditor} from "../util/grid-editors/date.editor";
import {DateParserComponent} from "../util/parsers/date-parser.component";
import {IconTextRendererComponent} from "../util/grid-renderers/icon-text-renderer.component";

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
        .height-eighty {
            height: 80%;
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
    public selectedBillingItems: any[] = [];
    public disableSplitButton: boolean = true;
    public billingItemsToDelete: any[] = [];

    private invoiceMap: any = {};
    public invoiceLabel: string = "";

    private billingPeriods: any[] = [];
    private statuses: any[] = [];
    private statusListShort: any[] = [];

    constructor(private billingService: BillingService,
                private dialogsService: DialogsService,
                private constantsService: ConstantsService,
                private propertyService: PropertyService,
                private dictionaryService: DictionaryService) {
        this.billingPeriods = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_PERIOD);
        this.statuses = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_STATUS).filter((stat: any) => {
            return stat.value === this.STATUS_PENDING || stat.value === this.STATUS_COMPLETED || stat.value === this.STATUS_APPROVED;
        });
        this.statusListShort = this.statuses.filter((stat: any) => {
            return stat.value === this.STATUS_COMPLETED || stat.value === this.STATUS_APPROVED;
        });

        this.billingItemGridColumnDefs = [
            {headerName: "#", field: "requestNumber", tooltipField: "requestNumber", width: 100, cellRenderer: "agGroupCellRenderer"},
            {headerName: "Icon", width: 100, cellRendererFramework: IconTextRendererComponent},
            {headerName: "Group", field: "labName", tooltipField: "labName", width: 100},
            {headerName: "Client", field: "submitter", tooltipField: "submitter", width: 100},
            {headerName: "Acct", field: "billingAccountName", tooltipField: "billingAccountName", width: 100},
            {headerName: "Period", editable: true, field: "idBillingPeriod", width: 100, cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor, selectOptions: this.billingPeriods, selectOptionsDisplayField: "display",
                selectOptionsValueField: "idBillingPeriod"},
            {headerName: "%", field: "percentageDisplay", tooltipField: "percentageDisplay", width: 100},
            {headerName: "Type", field: "codeBillingChargeKind", tooltipField: "codeBillingChargeKind", width: 100},
            {headerName: "Price Category", field: "category", tooltipField: "category", width: 100},
            {headerName: "Description", editable: true, field: "description", tooltipField: "description", width: 100},
            {headerName: "Complete Date", editable: true, field: "completeDate", width: 100, cellRendererFramework: DateRenderer,
                cellEditorFramework: DateEditor, dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY")},
            {headerName: "Notes", editable: true, field: "notes", tooltipField: "notes", width: 100},
            {headerName: "Unit price", editable: true, field: "unitPrice", tooltipField: "unitPrice", width: 100},
            {headerName: "Qty", editable: true, field: "qty", tooltipField: "qty", width: 100},
            {headerName: "Total price", field: "invoicePrice", tooltipField: "invoicePrice", width: 100},
            {headerName: "Status", editable: true, field: "codeBillingStatus", width: 100, cellRendererFramework: SelectRenderer,
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
            let parent: any = this.findRequestParent(event.data);
            parent.isDirty = 'Y';
        }
        this.showDirtyNote = true;
    }

    public onBillingItemGridSelection(event: SelectionChangedEvent): void {
        this.selectedBillingItems = this.billingItemGridApi.getSelectedRows();
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
    }

    public refreshBillingItemList(event: BillingFilterEvent, reselectIfPossible?: boolean): void {
        this.showDirtyNote = false;
        this.selectedBillingItems = [];
        this.billingItemsToDelete = [];

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
            if (this.hideEmptyRequests && !r.BillingItem) {
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
                if (item.idBillingItem) {
                    item.remove = 'Y';
                    this.billingItemsToDelete.push(item);
                    let r: any = this.findRequestParent(item, true);
                    let billingItems: any[] = r.BillingItem;
                    billingItems.splice(billingItems.indexOf(item), 1);
                    r.isDirty = 'Y';
                }
            }
            this.showDirtyNote = true;
            this.selectTreeNode(this.billingItemsTreeSelectedNode);
        }
    }

    private findRequestParent(billingItem: any, restrictToCurrentData: boolean = false): any {
        let requests: any[] = restrictToCurrentData ? this.billingItemGridData : this.billingItemList;
        let key: string;
        if (billingItem.idRequest) {
            key = "idRequest";
        } else if (billingItem.idProductOrder) {
            key = "idProductOrder";
        } else if (billingItem.idDiskUsageMonth) {
            key = "idDiskUsageMonth";
        }
        if (key) {
            for (let r of requests) {
                if (r[key] === billingItem[key] && r.idBillingAccount === billingItem.idBillingAccount) {
                    return r;
                }
            }
        }
        return null;
    }

    public validateAndSave(): void {
        this.billingItemGridApi.stopEditing();

        let isExternalApproved: boolean = false;
        let isEmptyPriceOrQty: boolean = false;
        let isNegativeQtyAndPrice: boolean = false;

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

}
