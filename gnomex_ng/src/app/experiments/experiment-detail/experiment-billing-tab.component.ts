import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ConstantsService} from "../../services/constants.service";
import {GridReadyEvent, GridSizeChangedEvent} from "ag-grid-community";
import {ActivatedRoute} from "@angular/router";
import {DialogsService} from "../../util/popup/dialogs.service";
import {MatDialogConfig} from "@angular/material";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {DictionaryService} from "../../services/dictionary.service";
import {UtilService} from "../../services/util.service";
import {
    BillingTemplate,
    BillingTemplateWindowComponent,
    BillingTemplateWindowParams
} from "../../util/billing-template-window.component";
import {BillingService} from "../../services/billing.service";
import {FormControl} from "@angular/forms";
import {ExperimentsService} from "../experiments.service";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";

@Component({
    selector: 'experiment-billing-tab',
    template: `
        <div class="padded flex-container-col full-height">
            <div class="flex-container-row align-center" *ngIf="this.isInternal">
                <button mat-button (click)="this.editBillingTemplate()" [disabled]="!this.canUpdate || !this.experimentsService.getEditMode()">Edit Billing Template</button>
                <label class="small-font"><span class="italic">Current Account(s):</span> {{this.currentAccountsLabel}}</label>
            </div>
            <div class="flex-grow">
                <div #oneEmWidth class="no-height single-em"></div>
                <ag-grid-angular class="ag-theme-balham full-height full-width"
                                 (gridReady)="this.onGridReady($event)"
                                 (gridSizeChanged)="this.onGridSizeChanged($event)"
                                 [getNodeChildDetails]="this.getNodeChildDetails"
                                 [columnDefs]="this.gridColDefs"
                                 [enableColResize]="true"
                                 [rowData]="this.gridData">
                </ag-grid-angular>
            </div>
        </div>
    `,
    styles: [`
    `]
})
export class ExperimentBillingTabComponent implements OnInit {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    public getNodeChildDetails;
    public gridColDefs: any[] = [];
    public gridData: any[] = [];

    private emToPxConversionRate: number = 13;

    private request: any;
    public canUpdate: boolean = false;
    public isInternal: boolean = true;
    private currentBillingTemplate: BillingTemplate;
    public currentAccountsLabel: string = "";

    public billingTemplateFormControl: FormControl;

    constructor(public constantsService: ConstantsService,
                private route: ActivatedRoute,
                private dictionaryService: DictionaryService,
                private dialogsService: DialogsService,
                public experimentsService: ExperimentsService) {
    }

    ngOnInit() {
        let billingPeriods: any[] = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_PERIOD);
        let statuses: any[] = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BILLING_STATUS).filter((stat: any) => {
            return stat.value === "PENDING" || stat.value === "COMPLETE" || stat.value === "APPROVED";
        });

        this.gridColDefs = [
            {
                headerName: "Group",
                field: "labName",
                tooltipField: "labName",
                minWidth: 10 * this.emToPxConversionRate,
                width: 14 * this.emToPxConversionRate,
                cellRenderer: "agGroupCellRenderer",
                cellRendererParams: {
                    innerRenderer: getGroupRenderer(),
                    suppressCount: true
                }
            },
            {
                headerName: "Client",
                field: "submitter",
                tooltipField: "submitter",
                minWidth: 10 * this.emToPxConversionRate,
                width:    5 * this.emToPxConversionRate,
            },
            {
                headerName: "Acct",
                field: "accountName",
                tooltipField: "accountName",
                minWidth: 10 * this.emToPxConversionRate,
                width: 14 * this.emToPxConversionRate
            },
            {
                headerName: "Period",
                field: "idBillingPeriod",
                minWidth: 5 * this.emToPxConversionRate,
                width: 5 * this.emToPxConversionRate,
                cellRendererFramework: SelectRenderer,
                selectOptions: billingPeriods,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idBillingPeriod"
            },
            {
                headerName: "Description",
                field: "description",
                tooltipField: "description",
                minWidth: 10 * this.emToPxConversionRate,
                width: 10 * this.emToPxConversionRate
            },
            {
                headerName: "Notes",
                field: "notes",
                tooltipField: "notes",
                minWidth: 10 * this.emToPxConversionRate,
                width: 10 * this.emToPxConversionRate
            },
            {
                headerName: "Qty",
                field: "qty",
                tooltipField: "qty",
                minWidth: 6 * this.emToPxConversionRate,
                width: 1
            },
            {
                headerName: "Unit price",
                field: "unitPrice",
                tooltipField: "unitPrice",
                minWidth: 5 * this.emToPxConversionRate,
                width: 5 * this.emToPxConversionRate
            },
            {
                headerName: "%",
                field: "percentageDisplay",
                tooltipField: "percentageDisplay",
                minWidth: 6 * this.emToPxConversionRate,
                width: 1
            },
            {
                headerName: "Total price",
                field: "invoicePrice",
                tooltipField: "invoicePrice",
                minWidth: 8 * this.emToPxConversionRate,
                width: 1
            },
            {
                headerName: "Status",
                field: "codeBillingStatus",
                minWidth: 7 * this.emToPxConversionRate,
                width: 1,
                cellRendererFramework: SelectRenderer,
                selectOptions: statuses,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "codeBillingStatus"
            },
        ];
        this.getNodeChildDetails = function getItemNodeChildDetails(rowItem: any): any {
            if (rowItem.BillingItem) {
                return {
                    group: true,
                    expanded: true,
                    children: rowItem.BillingItem,
                    key: rowItem.accountName
                };
            } else {
                return null;
            }
        };

        this.billingTemplateFormControl = new FormControl();
        this.experimentsService.addExperimentOverviewFormMember(this.billingTemplateFormControl, "BillingTemplateWindowComponent");
        this.route.data.forEach((data: any) => {
            this.request = null;
            this.gridData = [];
            this.currentAccountsLabel = "";
            this.currentBillingTemplate = null;
            if (data && data.experiment && data.experiment.Request) {
                let request: any = data.experiment.Request;
                this.request = request;
                this.canUpdate = request.canUpdate && request.canUpdate === 'Y';
                this.isInternal = request.isExternal !== 'Y';

                if (request.BillingTemplate) {
                    this.currentBillingTemplate = BillingService.parseBillingTemplate(request.BillingTemplate);
                    this.refreshBillingAccountsLabel();
                }

                if (request.billingItems && Array.isArray(request.billingItems)) {
                    let billingLabs: any[] = UtilService.getJsonArray(request.billingItems[1], request.billingItems[1].BillingLab);
                    for (let lab of billingLabs) {
                        lab.submitter = request.submitterName;
                        lab.BillingItem = UtilService.getJsonArray(lab.BillingItem, lab.BillingItem);
                        for (let bi of lab.BillingItem) {
                            bi.labName = ""; // Necessary for group cell renderer, otherwise icon will not display
                        }
                    }
                    this.gridData = billingLabs;
                }
            }
            this.billingTemplateFormControl.setValue(this.currentBillingTemplate);
            this.billingTemplateFormControl.markAsPristine();
        });
    }

    public onGridReady(event: GridReadyEvent): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }

    private refreshBillingAccountsLabel(): void {
        let result: string = "";
        let first: boolean = true;
        for (let item of this.currentBillingTemplate.items) {
            if (!first) {
                result += ", ";
            }
            result += item.accountName + " (" + item.labName + ")";
            first = false;
        }
        this.currentAccountsLabel = result;
    }

    public editBillingTemplate(): void {
        let params: BillingTemplateWindowParams = new BillingTemplateWindowParams();
        params.idCoreFacility = this.request.idCoreFacility;
        params.codeRequestCategory = this.request.codeRequestCategory;
        params.billingTemplate = this.currentBillingTemplate;

        let totalAmount: number = 0;
        for(let billingAccount of this.gridData) {
            if(billingAccount.invoicePrice && !isNaN(Number(billingAccount.invoicePrice.replace("$", "").replace(",", "")))) {
                totalAmount += Number(billingAccount.invoicePrice.replace("$", "").replace(",", ""));
            }
        }

        let config: MatDialogConfig = new MatDialogConfig();
        config.autoFocus = false;
        config.data = {
            params: params,
            totalAmount: totalAmount
        };

        this.dialogsService.genericDialogContainer(BillingTemplateWindowComponent, "Billing Template", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "promptToSave"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"},
                ]}).subscribe((result: any) => {
                    if (result) {
                        this.currentBillingTemplate = result as BillingTemplate;
                        this.refreshBillingAccountsLabel();
                        this.billingTemplateFormControl.setValue(this.currentBillingTemplate);
                        this.billingTemplateFormControl.markAsDirty();
                    }
        });
    }

}

function getGroupRenderer() {
    function GroupRenderer() {
    }

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
