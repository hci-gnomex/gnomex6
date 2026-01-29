import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {GridApi, GridReadyEvent, RowClickedEvent} from "ag-grid-community";
import {BillingService} from "../services/billing.service";
import {Subscription} from "rxjs";
import {HttpParams} from "@angular/common/http";
import {BillingViewChangeForCoreCommentsWindowEvent} from "./billing-view-change-for-core-comments-window-event.model";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

@Component({
    selector: 'notes-to-core',
    template: `
        <div class="grid-div padded">
            <ag-grid-angular class="ag-theme-balham full-height full-width font-small"
                             (gridReady)="this.onNotesGridReady($event)"
                             (rowClicked)="this.onNotesGridSelection($event)"
                             [enableColResize]="true"
                             [rowData]="this.notesGridData">
            </ag-grid-angular>
        </div>
    `,
    styles: [`
        div.grid-div {
            width: 700px;
            height: 200px;
        }
        .font-small {
            font-size: 0.7em;
        }
    `]
})

export class NotesToCoreComponent extends BaseGenericContainerDialog implements OnInit, OnDestroy {

    private notesGridApi: GridApi;
    public notesGridColDefs: any[];
    public notesGridData: any[] = [];

    private onParentViewChangedSubscription: Subscription;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                private dialogRef: MatDialogRef<NotesToCoreComponent>,
                private billingService: BillingService) {
        super();
    }

    ngOnInit() {
        this.notesGridColDefs = [
            {headerName: "Req #", headerTooltip:"Req #", field: "number", tooltipField: "number", width: 100},
            {headerName: "Group", headerTooltip:"Group", field: "lab", tooltipField: "lab", width: 100},
            {headerName: "Name", headerTooltip:"Name", field: "name", tooltipField: "name", width: 100},
            {headerName: "Comments for the Core", headerTooltip:"Comments for the Core", field: "corePrepInstructions", tooltipField: "corePrepInstructions", width: 100},
            {headerName: "Status", headerTooltip:"Status", field: "billingStatus", tooltipField: "billingStatus", width: 100},
        ];

        this.onParentViewChangedSubscription = this.billingService.billingViewChangeForCoreCommentsWindow.subscribe((event: BillingViewChangeForCoreCommentsWindowEvent) => {
            let params: HttpParams = new HttpParams()
                .set("showOtherBillingItems", event.showOtherBillingItems ? 'Y' : 'N')
                .set("requestNumber", event.requestNumber ? event.requestNumber : "")
                .set("invoiceLookupNumber", event.invoiceLookupNumber ? event.invoiceLookupNumber : "")
                .set("idBillingPeriod", event.idBillingPeriod ? event.idBillingPeriod : "")
                .set("idLab", !event.requestNumber && !event.invoiceLookupNumber && event.idLab ? event.idLab : "")
                .set("idBillingAccount", !event.requestNumber && event.idBillingAccount ? event.idBillingAccount : "")
                .set("excludeNewRequests", event.excludeNewRequests ? 'Y' : 'N')
                .set("idCoreFacility", event.idCoreFacility ? event.idCoreFacility : "");
            this.billingService.getCoreCommentsForBillingPeriod(params).subscribe((result: any) => {
                if (result && Array.isArray(result)) {
                    this.notesGridData = result;
                } else {
                    this.notesGridData = [];
                }
            });
        });
        this.billingService.broadcastBillingViewChangeForCoreCommentsWindow();
    }

    ngOnDestroy() {
        this.onParentViewChangedSubscription.unsubscribe();
    }

    public onNotesGridReady(event: GridReadyEvent): void {
        this.notesGridApi = event.api;
        this.notesGridApi.setColumnDefs(this.notesGridColDefs);
        this.notesGridApi.sizeColumnsToFit();
    }

    public onNotesGridSelection(event: RowClickedEvent): void {
        if (event && event.data && event.data.number) {
            this.billingService.broadcastRequestSelectedFromCoreCommentsWindow(event.data.number);
        }
    }

}
