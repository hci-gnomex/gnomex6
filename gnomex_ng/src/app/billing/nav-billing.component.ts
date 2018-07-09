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
        .flex-three {
            flex: 3;
        }
        .flex-seven {
            flex: 7;
        }
        div.bordered {
            border: gray solid 1px;
        }
    `]
})

export class NavBillingComponent implements OnInit {

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

    constructor(private billingService: BillingService,
                private dialogsService: DialogsService,
                private constantsService: ConstantsService,
                private propertyService: PropertyService) {
    }

    ngOnInit() {
        this.billingItemsTreeOptions = {
            displayField: 'display',
        };
    }

    public onFilterChange(event: BillingFilterEvent): void {
        // TODO

        // BillingRequestList
        this.billingItemsTreeLastResult = null;
        this.billingItemsTreeSelectedNode = null;
        this.filterByOrderType = this.FILTER_ALL;
        this.showFilterByOrderType = false;
        this.showFilterByExp = false;
        this.showFilterByDsk = false;
        this.showFilterByPo = false;
        this.expandLabs = true;

        this.hideEmptyRequests = this.propertyService.getProperty("hide_requests_with_no_billing_items", event.idCoreFacility) === 'Y';

        let billingRequestListParams: HttpParams = new HttpParams();
        if (event && event.requestNumber) {
            billingRequestListParams = billingRequestListParams.set("requestNumber", event.requestNumber);
        } else if (event && event.invoiceNumber) {
            billingRequestListParams = billingRequestListParams.set("invoiceLookupNumber", event.invoiceNumber);
        } else {
            let excludeNewRequests: boolean = event.idCoreFacility && this.propertyService.getProperty("exclude_new_requests", event.idCoreFacility) === 'Y';
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

        // BillingItemList
        //let billingItemListParams: HttpParams = new HttpParams();

        // BillingInvoiceList
        //let billingInvoiceListParams: HttpParams = new HttpParams();
    }

    private buildBillingItemsTree(result: any): void {
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
            });
        }
    }

    private makeStatusNode(obj: any): ITreeNode {
        let statusNode: any = obj;
        statusNode.display = statusNode.label;
        statusNode.icon = this.constantsService.ICON_FOLDER;
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
        // TODO
        /*
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
        */
    }

    public onFilterByOrderTypeChange(event: any): void {
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
        this.buildBillingItemsTree(this.billingItemsTreeLastResult);
    }

}
