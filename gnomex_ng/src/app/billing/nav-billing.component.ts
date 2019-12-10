import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild
} from "@angular/core";
import {BillingFilterEvent} from "./billing-filter.component";
import {ITreeOptions, TreeComponent} from "angular-tree-component";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {HttpParams} from "@angular/common/http";
import {BillingService} from "../services/billing.service";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {ConstantsService} from "../services/constants.service";
import {PropertyService} from "../services/property.service";
import {MatCheckboxChange, MatDialogConfig} from "@angular/material";
import {
    CellValueChangedEvent,
    GridApi,
    GridReadyEvent,
    GridSizeChangedEvent,
    RowClickedEvent,
    RowDoubleClickedEvent,
    RowDragEvent,
    RowNode,
} from "ag-grid-community";
import {DictionaryService} from "../services/dictionary.service";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {DateEditor} from "../util/grid-editors/date.editor";
import {DateParserComponent} from "../util/parsers/date-parser.component";
import {
    BillingTemplate,
    BillingTemplateWindowComponent,
    BillingTemplateWindowParams,
} from "../util/billing-template-window.component";
import {Observable, Subscription} from "rxjs";
import {PriceSheetViewComponent} from "./price-sheet-view.component";
import {PriceCategoryViewComponent} from "./price-category-view.component";
import {PriceViewComponent} from "./price-view.component";
import {UtilService} from "../services/util.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignLeftMiddleEditor} from "../util/grid-editors/text-align-left-middle.editor";
import {TextAlignRightMiddleRenderer} from "../util/grid-renderers/text-align-right-middle.renderer";
import {TextAlignRightMiddleEditor} from "../util/grid-editors/text-align-right-middle.editor";

@Component({
    selector: 'nav-billing',
    templateUrl: "./nav-billing.component.html",
    styles: [`

        .no-height { height: 0;  }
        .single-em { width: 1em; }
        
        .min-grid-width {
            min-width: 27em;
        }
        
        
        mat-radio-button.filter-by-order-type-opt {
            margin-right: 0.5em;
        }
        
        .padding-left {
            padding-left: 1em;
        }

        .vertical-spacer {
            height: 0.3em;
        }
                
        button.price-sheet-link {
            margin: 0 1em;
            padding: 0;
            text-decoration: underline;
        }
    `]
})

export class NavBillingComponent implements OnInit, OnDestroy {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;
    private emToPxConversionRate: number = 13;

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
    public billingItemGridData: any[] = [];
    public billingItemGridLabel: string = '';
    public showRelatedCharges: boolean = true;

    public billingItemGridRowClassRules: any = {
        "otherBillingItem": "data.other === 'Y'"
    };

    public billingItemGridApi: GridApi;

    public showDirtyNote: boolean = false;
    public selectedBillingItems: RowNode[] = [];
    public selectedBillingRequest: any = null;
    public disableSplitButton: boolean = true;
    public billingItemsToDelete: any[] = [];

    private invoiceMap: any = {};
    public invoiceLabel: string = "";

    private billingPeriods: any[] = [];
    private allStatuses: any[] = [];
    public statuses: any[] = [];
    private statusListShort: any[] = [];
    public changeStatusValue: string = '';

    // This "feature" is currently implemented by commented out. The Angular version behaves like the Flex version.
    // If in the future we want to add more explicit filtering based on billing status, uncommenting this code will
    // be a solid start (search for "statusFilter" on this component for more details)
    //private statusFilter: string = null;

    public priceTreeGridData: any[] = [];
    public priceTreeGridApi: GridApi;
    public getPriceNodeChildDetails;
    public selectedPriceTreeGridItem: RowNode;
    public showPricesCheckbox: boolean = true;
    public showPriceCriteriaCheckbox: boolean = false;
    public showInactivePricesCheckbox: boolean = false;
    public disableAddBillingItemButton: boolean = true;

    public totalPrice: number = 0;
    private onCoreCommentsWindowRequestSelected: Subscription;
    private refreshSubscription: Subscription;


    public get billingItemGridColumnDefs(): any[] {
        let columnDefs: any[] = [];

        columnDefs.push({
            headerName: "#",
            headerTooltip: "#",
            field: "requestNumber",
            tooltipField: "requestNumber",
            width:    1,
            minWidth: 7 * this.emToPxConversionRate,
            cellRenderer: "agGroupCellRenderer",
            cellRendererParams: {
                innerRenderer: getGroupRenderer(),
                suppressCount: true
            }
        });

        columnDefs.push({
            headerName: "Group",
            headerTooltip:"Group",
            field: "labName",
            tooltipField: "labName",
            editable: false,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            width:    7 * this.emToPxConversionRate,
            minWidth: 10 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Client",
            headerTooltip:"Client",
            field: "submitter",
            tooltipField: "submitter",
            editable: false,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            width:    5 * this.emToPxConversionRate,
            minWidth: 10 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Acct",
            headerTooltip:"Acct",
            field: "billingAccountName",
            tooltipField: "billingAccountName",
            editable: false,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            width:    5 * this.emToPxConversionRate,
            minWidth: 12 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Period",
            headerTooltip:"Period",
            editable: true,
            field: "idBillingPeriod",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.billingPeriods,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idBillingPeriod",
            width:    1,
            minWidth: 4.5 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "%",
            headerTooltip:"%",
            field: "percentageDisplay",
            tooltipField: "percentageDisplay",
            editable: false,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignRightMiddleEditor,
            width:    1,
            minWidth: 4 * this.emToPxConversionRate
        });

        //{headerName: "Type", headerTooltip:"Type", field: "codeBillingChargeKind", tooltipField: "codeBillingChargeKind", width: 100},
        // columnDefs.push({
        //     headerName: "Price Category",
        //     headerTooltip:"Price Category",
        //     field: "category",
        //     tooltipField: "category",
        //     editable: false,
        //     cellRendererFramework: TextAlignLeftMiddleRenderer,
        //     cellEditorFramework: TextAlignLeftMiddleEditor,
        //     width:    5 * this.emToPxConversionRate,
        //     minWidth: 10 * this.emToPxConversionRate
        // });

        columnDefs.push({
            headerName: "Description",
            headerTooltip:"Description",
            field: "description",
            tooltipField: "description",
            editable: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            width:    8 * this.emToPxConversionRate,
            minWidth: 5 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Complete Date",
            headerTooltip:"Complete Date",
            editable: true,
            field: "completeDate",
            cellRendererFramework: DateRenderer,
            cellEditorFramework: DateEditor,
            dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
            width:    1 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Notes",
            headerTooltip:"Notes",
            field: "notes",
            tooltipField: "notes",
            editable: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            width:    8 * this.emToPxConversionRate,
            minWidth: 5 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Unit price",
            headerTooltip:"Unit Price",
            field: "unitPrice",
            tooltipField: "unitPrice",
            editable: true,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignRightMiddleEditor,
            width:    2 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Qty",
            headerTooltip:"Qty",
            field: "qty",
            tooltipField: "qty",
            editable: true,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignRightMiddleEditor,
            width:    1,
            minWidth: 4 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Total price",
            headerTooltip: "Total price",
            field: "invoicePrice",
            tooltipField: "invoicePrice",
            editable: false,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignRightMiddleEditor,
            width:    2 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Status",
            headerTooltip:"Status",
            editable: true,
            field: "codeBillingStatus",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.statuses,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "codeBillingStatus",
            rendererOptions: this.allStatuses,
            width:    3 * this.emToPxConversionRate,
            minWidth: 7 * this.emToPxConversionRate
        });

        // Brian asked for another one of these columns, but we probably would rather do pinning, etc.

        // columnDefs.push({
        //     headerName: "Acct",
        //     headerTooltip:"Acct",
        //     field: "billingAccountName",
        //     tooltipField: "billingAccountName",
        //     editable: false,
        //     cellRendererFramework: TextAlignLeftMiddleRenderer,
        //     cellEditorFramework: TextAlignLeftMiddleEditor,
        //     width:    5 * this.emToPxConversionRate,
        //     minWidth: 12 * this.emToPxConversionRate
        // });

        return columnDefs;
    }

    public get priceTreeGridColDefs(): any[] {
        let columnDefs: any[] = [];

        columnDefs.push({
            headerName: "",
            field: "display",
            tooltipField: "display",
            rowDrag: true,
            cellRenderer: "agGroupCellRenderer",
            cellRendererParams: {
                innerRenderer: getGroupRenderer(),
                suppressCount: true
            },
            editable: false,
            width:    1000,
            minWidth: 12 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Price",
            headerTooltip: "Price",
            field: "unitPriceCurrency",
            tooltipField: "unitPriceCurrency",
            type: "numericColumn",
            editable: false,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignRightMiddleEditor,
            width:    1,
            minWidth: 4 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Academic",
            headerTooltip: "Academic",
            field: "unitPriceExternalAcademicCurrency",
            tooltipField: "unitPriceExternalAcademicCurrency",
            type: "numericColumn",
            editable: false,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignRightMiddleEditor,
            width:    1,
            minWidth: 4 * this.emToPxConversionRate
        });

        columnDefs.push({
            headerName: "Commercial",
            headerTooltip: "Commercial",
            field: "unitPriceExternalCommercialCurrency",
            tooltipField: "unitPriceExternalCommercialCurrency",
            type: "numericColumn",
            editable: false,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignRightMiddleEditor,
            width:    1,
            minWidth: 4 * this.emToPxConversionRate
        });

        return columnDefs;
    }


    public getBillingItemNodeChildDetails: (rowItem) => any | null = (rowItem) => {
        if (rowItem.BillingItem) {
            let children: any[] = rowItem.BillingItem;
            /*
            if (this.statusFilter) {
                children = children.filter((billingItem: any) => {
                    return billingItem.codeBillingStatus === this.statusFilter;
                });
            }
            */
            return {
                group: true,
                expanded: true,
                children: children,
                key: rowItem.requestNumber
            };
        } else {
            return null;
        }
    };

    constructor(private billingService: BillingService,
                private dialogsService: DialogsService,
                private constantsService: ConstantsService,
                private propertyService: PropertyService,
                private utilService: UtilService,
                private changeDetector: ChangeDetectorRef,
                private dictionaryService: DictionaryService) {

        this.billingPeriods = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_PERIOD).sort((a: any, b: any) => {
            return a.startDateSort.localeCompare(b.startDateSort);
        });
        this.allStatuses = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_STATUS);
        this.statuses = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_STATUS).filter((stat: any) => {
            return stat.value === this.STATUS_PENDING || stat.value === this.STATUS_COMPLETED || stat.value === this.STATUS_APPROVED;
        });
        this.statusListShort = this.statuses.filter((stat: any) => {
            return stat.value === this.STATUS_COMPLETED || stat.value === this.STATUS_APPROVED;
        });

        // NOTE - the "Type" column that shows SERVICE, PRODUCT, etc. is commented out to free up grid space
        // When products are fully re-implemented and in actual use, this column can be uncommented

        this.billingItemGridRowClassRules =

        this.getPriceNodeChildDetails = function getPriceNodeChildDetails(rowItem) {
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
        this.utilService.registerChangeDetectorRef(this.changeDetector);
        this.billingItemsTreeOptions = {
            displayField: 'display',
        };

        this.onCoreCommentsWindowRequestSelected = this.billingService.requestSelectedFromCoreCommentsWindow.subscribe((requestNumber: string) => {
            if (this.billingItemGridApi && this.billingItemGridData && this.billingItemGridData.length > 0) {
                this.billingItemGridApi.forEachNode((node: RowNode) => {
                    if (node.data.requestNumber && node.data.requestNumber === requestNumber) {
                        node.setSelected(true, true);
                    }
                });
            }
        });

        this.refreshSubscription = this.billingService.refreshBillingScreenRequest.subscribe(() => {
            this.onFilterChange(this.lastFilterEvent);
        });
    }

    ngOnDestroy() {
        this.utilService.removeChangeDetectorRef(this.changeDetector);
        UtilService.safelyUnsubscribe(this.onCoreCommentsWindowRequestSelected);
        UtilService.safelyUnsubscribe(this.refreshSubscription);
    }

    public onBillingItemGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.billingItemGridColumnDefs);
        this.billingItemGridApi = event.api;

        this.registerPixelWidths();
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

    public onFilterChange(event: BillingFilterEvent, nodeToReselect?: ITreeNode): void {
        this.dialogsService.addSpinnerWorkItem();

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
        let excludeNewRequests: boolean = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_EXCLUDE_NEW_REQUESTS, event.idCoreFacility);

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

        this.dialogsService.addSpinnerWorkItem();
        this.billingService.getBillingRequestList(billingRequestListParams).subscribe((result: any) => {
            this.dialogsService.removeSpinnerWorkItem();
            this.billingItemsTreeLastResult = result;
            this.buildBillingItemsTree(this.billingItemsTreeLastResult);

            this.refreshBillingItemList(event, !!nodeToReselect, nodeToReselect);
        }, () => {
            this.dialogsService.stopAllSpinnerDialogs();
            this.billingItemsTreeLastResult = [];
            this.buildBillingItemsTree(this.billingItemsTreeLastResult);

            this.refreshBillingItemList(null);
        });

        // BillingInvoiceList
        let billingInvoiceListParams: HttpParams = new HttpParams()
            .set("requestNumber", event.requestNumber ? event.requestNumber : '')
            .set("invoiceLookupNumber", event.invoiceNumber ? event.invoiceNumber : '')
            .set("idBillingPeriod", event.requestNumber || event.invoiceNumber ? '' : event.idBillingPeriod ? event.idBillingPeriod : '')
            .set("idLab", event.requestNumber || event.invoiceNumber ? '' : event.idLab ? event.idLab : '')
            .set("idCoreFacility", event.requestNumber || event.invoiceNumber ? '' : event.idCoreFacility ? event.idCoreFacility : '')
            .set("excludeNewRequests", excludeNewRequests ? 'Y' : 'N');
        this.dialogsService.addSpinnerWorkItem();
        this.billingService.getBillingInvoiceList(billingInvoiceListParams).subscribe((result: any) => {
            this.dialogsService.removeSpinnerWorkItem();
            let invoices: any[] = [];
            if (result && Array.isArray(result)) {
                invoices = result;
            } else if (result && result.Invoice) {
                invoices.push(result.Invoice);
            }
            for (let invoice of invoices) {
                this.invoiceMap[invoice.idInvoice] = invoice;
            }
        }, () => {
            this.dialogsService.stopAllSpinnerDialogs();
        });

        // Price tree grid
        this.refreshPricingGrid();

        this.dialogsService.removeSpinnerWorkItem();
    }

    public refreshBillingItemList(event: BillingFilterEvent, reselectIfPossible?: boolean, nodeToReselect?: ITreeNode): void {
        this.dialogsService.addSpinnerWorkItem();

        this.showDirtyNote = false;
        this.selectedBillingItems = [];
        this.selectedBillingRequest = null;
        this.billingItemsToDelete = [];
        //this.statusFilter = null;

        this.disableSplitButton = true;
        this.disableAddBillingItemButton = true;

        this.billingItemGridLabel = '';
        this.billingItemList = [];
        this.billingItemGridData = [];

        if (!event) {
            this.dialogsService.removeSpinnerWorkItem();
            return;
        }

        let excludeNewRequests: boolean = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_EXCLUDE_NEW_REQUESTS, event.idCoreFacility);

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

        this.dialogsService.addSpinnerWorkItem();
        this.billingService.getBillingItemList(params).subscribe((result: any) => {
            if (result && Array.isArray(result)) {
                this.billingItemList = result;
            } else if (result && result.Request) {
                this.billingItemList = [result.Request];
            }

            for (let r of this.billingItemList) {
                if (r.BillingItem) {
                    let billingItems: any[] = Array.isArray(r.BillingItem) ? r.BillingItem : [r.BillingItem];
                    for (let b of billingItems) {
                        b.icon = "assets/money.png";
                        // This is necessary so the icon in the grid is properly rendered (there must be a non-null value
                        // for that field in order for the group cell renderer to be activated)
                        b.requestNumber = "";
                    }
                    r.BillingItem = billingItems;
                } else {
                    r.BillingItem = [];
                }
            }

            this.dialogsService.removeSpinnerWorkItem();

            if (reselectIfPossible) {
                if (nodeToReselect) {
                    this.selectTreeNode(nodeToReselect);
                } else {
                    this.selectTreeNode(this.billingItemsTreeSelectedNode);
                }
            }
        }, () => {
            this.dialogsService.stopAllSpinnerDialogs();
        });

        this.dialogsService.removeSpinnerWorkItem();
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
            this.dialogsService.alert(result.message, "Failed", DialogType.FAILED);
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

        requestNode.display = !!belongsToLabNode ? requestNode.label : requestNode.label + " " + requestNode.labName;
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
        //this.statusFilter = null;

        let billingItems: any[] = [];
        let requestNumbers: Set<string> = new Set<string>();
        if (node.data.name === 'Status' && node.data.status === this.STATUS_PENDING) {
            //this.statusFilter = node.data.status;
            let requests: any[] = Array.isArray(node.data.Request) ? node.data.Request : [node.data.Request];
            for (let r of requests) {
                this.addRequestBillingItems(r.requestNumber, billingItems, requestNumbers);
            }
        } else if (node.data.name === 'Status') {
            //this.statusFilter = node.data.status;
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

        this.totalPrice = 0;
        let billingItemsMap: Map<string,any[]> = new Map();
        let splitKeyList: string[] = [];

        for (let r of billingItems) {
            if (r.totalPrice) {
                // split billing totalPrice on BillingItem is duplicated. only add it up once then
                if(!billingItemsMap.has(r.requestNumber)){
                    billingItemsMap.set(r.requestNumber,r.BillingItem);
                    let price: string = r.totalPrice;
                    price = price
                        .replace('$', '')
                        .replace(',', '')
                        .replace("(", "-")
                        .replace(")", "");
                    this.totalPrice += Number(price);
                }else{
                    splitKeyList.push(r.requestNumber);
                    billingItemsMap.get(r.requestNumber).push(...r.BillingItem);
                }
            }
        }

        //handling split billing items that have mixed status ex APPROVED AND APPROVEDEX
        for(let splitKey of splitKeyList){
            let negateMixedBillingStatus = 0;
            let biList:any[] = billingItemsMap.get(splitKey);
            for(let bi of biList){
                if(node.data.status !== bi.codeBillingStatus){
                    let price = bi.invoicePrice;
                    price = price.replace('$', '')
                        .replace(',', '')
                        .replace("(", "-")
                        .replace(")", "");
                    negateMixedBillingStatus += Number(price);
                }
            }
            this.totalPrice = this.totalPrice - negateMixedBillingStatus;
        }


        // TODO this is a temporary fix until the total price of split billing items is correctly displayed
        //this.billingItemGridLabel = node.data.label + " " + this.totalPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
        this.billingItemGridLabel = node.data.label;

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
        this.billingService.broadcastBillingViewChangeForCoreCommentsWindow(null, null, this.hideEmptyRequests);
    }

    public onShowRelatedChargesChange(event: MatCheckboxChange): void {
        this.showRelatedCharges = event.checked;
        this.refreshBillingItemList(this.lastFilterEvent, true);
        this.billingService.broadcastBillingViewChangeForCoreCommentsWindow(null, this.showRelatedCharges, null);
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
                foundNode.toggleActivated(null);
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
                            this.dialogsService.alert("Either unit price or qty can be negative but not both", "Invalid");
                            return;
                        }
                    }
                    if (bi.idBillingPeriod === '') {
                        this.dialogsService.alert("Each price must have an associated billing period", "Invalid");
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
            this.dialogsService.confirm(msg).subscribe((result: boolean) => {
                if (result) {
                    this.saveBillingItems();
                }
            });
        } else {
            this.saveBillingItems();
        }
    }

    private saveBillingItems(): void {
        let selectedTreeNode: ITreeNode = this.billingItemsTreeSelectedNode;

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
            if (this.lastFilterEvent) {
                this.onFilterChange(this.lastFilterEvent, selectedTreeNode);
            }
        }, () => {
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
            let selectedTreeNode: ITreeNode = this.billingItemsTreeSelectedNode;

            let id: string = "";
            let className: string = "";

            let request: any = this.selectedBillingRequest;

            if (request.status === "NEW") {
                this.dialogsService.alert("Please save the billing items before reassigning / splitting");
                return;
            }
            if (this.showDirtyNote) {
                this.dialogsService.alert("Please save changes before reassigning / splitting");
                return;
            }

            let isBillingItemApproved: boolean = false;
            breakLabel:
            for (let gridData of this.billingItemGridData) {
                if (gridData.requestNumber === this.selectedBillingRequest.requestNumber
                    && gridData.BillingItem && gridData.BillingItem.length > 0) {
                    for (let billingItem of gridData.BillingItem) {
                        if (billingItem.codeBillingStatus === "APPROVED") {
                            isBillingItemApproved = true;
                            break breakLabel;
                        }
                    }
                }
            }
            if(isBillingItemApproved) {
                this.dialogsService.alert("Approved billing items cannot be reassigned.", null, DialogType.WARNING);
                return;
            }

            if (request.idProductOrder) {
                id = request.idProductOrder;
                className = "ProductOrder";
            } else if (request.idRequest) {
                id = request.idRequest;
                className = "Request";
            } else {
                this.dialogsService.alert("Billing can be reassigned / split only for Requests and Product Orders");
                return;
            }

            this.billingService.getBillingTemplate(id, className).subscribe((template: BillingTemplate) => {
                if (template) {
                    let params: BillingTemplateWindowParams = new BillingTemplateWindowParams();
                    params.idCoreFacility = this.lastFilterEvent.idCoreFacility;
                    params.billingTemplate = template;

                    let config: MatDialogConfig = new MatDialogConfig();
                    config.autoFocus = false;
                    config.data = {
                        params: params
                    };

                    this.dialogsService.genericDialogContainer(BillingTemplateWindowComponent, "Billing Template", null, config,
                        {actions: [
                                {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "promptToSave"},
                                {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"},
                            ]}).subscribe((result: any) => {
                                if (result) {
                                    this.billingService.saveBillingTemplate(result).subscribe((result: any) => {
                                        if (result && result.result === "SUCCESS") {
                                            if (this.lastFilterEvent) {
                                                this.onFilterChange(this.lastFilterEvent, selectedTreeNode);
                                            }
                                        } else {
                                            let message: string = "";
                                            if (result && result.message) {
                                                message = ": " + result.message;
                                            }
                                            this.dialogsService.error("An error occurred while saving the billing template" + message);
                                        }
                                    }, (err: IGnomexErrorResponse) => {
                                    });
                                }
                    });
                } else {
                    this.dialogsService.error("There was an error retrieving the billing template");
                }
            }, (err: IGnomexErrorResponse) => {
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
                    this.dialogsService.error("An error occurred while retrieving the price list" + message);
                    return;
                } else {
                    let priceSheets: any[] = Array.isArray(result) ? result : [result.PriceSheet];
                    for (let sheet of priceSheets) {
                        sheet.icon = "./assets/pricesheet.png";
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
        }, () => {
        });
    }

    public onPriceTreeGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.priceTreeGridColDefs);
        this.priceTreeGridApi = event.api;

        this.registerPixelWidths();
    }

    public onGridSizeChanged(event: any) {
        this.registerPixelWidths();

        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
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
        dialogConfig.width = "45em";

        if (event.data.idPriceSheet) {
            dialogConfig.data = {
                idPriceSheet: event.data.idPriceSheet
            };
            this.dialogsService.genericDialogContainer(PriceSheetViewComponent, "", null, dialogConfig,
                {actions: [
                        {type: ActionType.PRIMARY, name: "Save", internalAction: "save"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]}).subscribe((result: any) => {
                        if(result) {
                            this.refreshPricingGrid();
                        }
            });
        } else if (event.data.idPriceCategory && !event.data.idPrice) {
            dialogConfig.data = {
                idPriceCategory: event.data.idPriceCategory,
                idPriceSheet: event.node.parent.data.idPriceSheet
            };
            this.dialogsService.genericDialogContainer(PriceCategoryViewComponent, "", null, dialogConfig,
                {actions: [
                        {type: ActionType.PRIMARY, name: "Save", internalAction: "save"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]}).subscribe((result: any) => {
                        if(result) {
                            this.refreshPricingGrid();
                        }
            });
        } else if (event.data.idPrice) {
            dialogConfig.data = {
                idPrice: event.data.idPrice,
                idPriceCategory: event.node.parent.data.idPriceCategory,
                idCoreFacility: this.lastFilterEvent.idCoreFacility
            };
            this.dialogsService.genericDialogContainer(PriceViewComponent, "", null, dialogConfig,
                {actions: [
                        {type: ActionType.PRIMARY, icon: null, name: "Save", internalAction: "save"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]}).subscribe((result: any) => {
                        if(result) {
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
                    this.refreshPricingGrid();
                    if (result.message) {
                        this.dialogsService.alert(result.message, null, DialogType.SUCCESS);
                    }
                }
            }, () => {
            });
        } else {
            this.dialogsService.alert("Drag-and-drop only allowed for price categories");
        }
    }

    public openNewSheetWindow(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "45em";
        this.dialogsService.genericDialogContainer(PriceSheetViewComponent, "", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
                    if(result) {
                        this.refreshPricingGrid();
                    }
        });
    }

    public openNewCategoryWindow(): void {
        if (!this.selectedPriceTreeGridItem) {
            this.dialogsService.alert("Please select a price sheet");
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
        dialogConfig.width = "45em";
        dialogConfig.data = {
            idPriceSheet: idPriceSheet
        };
        this.dialogsService.genericDialogContainer(PriceCategoryViewComponent, "", null, dialogConfig,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
                    if (result) {
                        this.refreshPricingGrid();
                    }
        });
    }

    public openNewPriceWindow(): void {
        if (!this.selectedPriceTreeGridItem || this.selectedPriceTreeGridItem.data.idPriceSheet) {
            this.dialogsService.alert("Please select a price category");
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
        dialogConfig.width = "45em";
        dialogConfig.data = {
            idPriceCategory: idPriceCategory,
            idCoreFacility: this.lastFilterEvent.idCoreFacility
        };

        this.dialogsService.genericDialogContainer(PriceViewComponent, "", null, dialogConfig,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
            if(result) {
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
            this.dialogsService.confirm(warningMessage).subscribe((result: boolean) => {
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
                            this.refreshPricingGrid();
                        }, () => {
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
                requestNumber: '',
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

    private registerPixelWidths(): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }
    }
}

function getGroupRenderer() {
    function GroupRenderer() { }

    GroupRenderer.prototype.init = function(params) {
        let tempDiv = document.createElement("div");
        if (params.data.icon) {
            tempDiv.innerHTML = '<span><img src="' + params.data.icon + '" class="icon"/>' + params.value + '</span>';
        } else {
            tempDiv.innerHTML = '<span>' + params.value + '</span>';
        }
        this.eGui = tempDiv.firstChild;
    };

    GroupRenderer.prototype.getGui = function() {
        return this.eGui;
    };

    return GroupRenderer;
}
