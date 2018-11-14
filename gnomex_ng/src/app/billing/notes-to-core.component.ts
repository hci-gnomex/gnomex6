import {Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {DialogPosition, MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {GridApi, GridReadyEvent, RowClickedEvent} from "ag-grid-community";
import {BillingService} from "../services/billing.service";
import {Subscription} from "rxjs";
import {HttpParams} from "@angular/common/http";
import {BillingViewChangeForCoreCommentsWindowEvent} from "./billing-view-change-for-core-comments-window-event.model";

@Component({
    selector: 'notes-to-core',
    template: `
        <h6 mat-dialog-title #topmostLeftmost (mousedown)="this.onMouseDownHeader($event)" class="{{this.movingDialog ? 'grabbed' : 'grabbable'}}">Billing Item Notes to Core</h6>
        <mat-dialog-content>
            <div class="grid-div">
                <ag-grid-angular class="ag-theme-balham full-height full-width font-small"
                                 (gridReady)="this.onNotesGridReady($event)"
                                 (rowClicked)="this.onNotesGridSelection($event)"
                                 [enableColResize]="true"
                                 [rowData]="this.notesGridData">
                </ag-grid-angular>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button mat-dialog-close>Close</button>
        </mat-dialog-actions>
    `,
    styles: [`
        div.grid-div {
            width: 700px;
            height: 200px;
        }
        .font-small {
            font-size: 0.7em;
        }
        .grabbable {
            cursor: move;
            cursor: -webkit-grab;
        }
        .grabbed {
            cursor: move;
            cursor: -webkit-grabbing;
        }
    `]
})

export class NotesToCoreComponent implements OnInit, OnDestroy {

    @ViewChild('topmostLeftmost') topmostLeftmost: ElementRef;
    originalXClick: number = 0;
    originalYClick: number = 0;
    protected positionX: number = 0;
    protected positionY: number = 0;
    movingDialog: boolean = false;

    private notesGridApi: GridApi;
    public notesGridColDefs: any[];
    public notesGridData: any[] = [];

    private onParentViewChangedSubscription: Subscription;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                private dialogRef: MatDialogRef<NotesToCoreComponent>,
                private billingService: BillingService) {
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

    public onMouseDownHeader(event: any): void {
        if (!event) {
            return;
        }

        this.positionX = this.topmostLeftmost.nativeElement.offsetLeft;
        this.positionY = this.topmostLeftmost.nativeElement.offsetTop;
        this.originalXClick = event.screenX;
        this.originalYClick = event.screenY;
        this.movingDialog = true;
    }

    @HostListener('window:mousemove', ['$event'])
    public onMouseMove(event: any): void {
        if (!event) {
            return;
        }

        if (this.movingDialog) {
            this.positionX += event.screenX - this.originalXClick;
            this.positionY += event.screenY - this.originalYClick;
            this.originalXClick = event.screenX;
            this.originalYClick = event.screenY;
            let newDialogPosition: DialogPosition = {
                left:   '' + this.positionX + 'px',
                top:    '' + this.positionY + 'px',
            };
            this.dialogRef.updatePosition(newDialogPosition);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    public onMouseUp(): void {
        this.movingDialog = false;
    }

}
