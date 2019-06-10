import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {UsageService} from "../services/usage.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ColDef, AgGridEvent} from "ag-grid-community";
import {UtilService} from "../services/util.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {ConstantsService} from "../services/constants.service";
import {Subscription} from "rxjs";

@Component({
    selector: "track-usage-detail",
    template: `
        <div class="full-height full-width flex-container-row">
            <div *ngIf="this.showGrid1" class="grid-container">
                <ag-grid-angular class="full-height full-width ag-theme-balham font-small" 
                                 [columnDefs]="this.gridColDefs1" 
                                 [enableColResize]="true"
                                 [rowData]="this.gridData1"
                                 [getNodeChildDetails]="this.getNodeChildDetails"
                                 (rowDataChanged)="this.resizeColumns($event)"
                                 (gridReady)="this.resizeColumns($event)">
                </ag-grid-angular>
            </div>
            <div *ngIf="this.showGrid2" class="grid-container margin-left">
                <ag-grid-angular class="full-height full-width ag-theme-balham font-small" 
                                 [columnDefs]="this.gridColDefs2"
                                 [enableColResize]="true"
                                 [rowData]="this.gridData2"
                                 [getNodeChildDetails]="this.getNodeChildDetails"
                                 (rowDataChanged)="this.resizeColumns($event)"
                                 (gridReady)="this.resizeColumns($event)">
                </ag-grid-angular>
            </div>
        </div>
    `,
    styles: [`
        .margin-left {
            margin-left: 1em;
        }
        .grid-container {
            height: 20em;
            width: 35em;
        }
        .font-small {
            font-size: 0.7em;
        }
    `]
})

export class TrackUsageDetailComponent implements OnInit, OnDestroy {

    public getNodeChildDetails: any;

    public showGrid1: boolean = false;
    public gridColDefs1: ColDef[] = [];
    public gridData1: any[] = [];

    public showGrid2: boolean = false;
    public gridColDefs2: ColDef[] = [];
    public gridData2: any[] = [];

    private subscriptions: Subscription[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                private dialogRef: MatDialogRef<TrackUsageDetailComponent>,
                private userPrefService: UserPreferencesService,
                private constantsService: ConstantsService,
                private usageService: UsageService) {
    }

    ngOnInit(): void {
        let idCoreFacility: string = this.data.idCoreFacility;
        let startDate: string = this.data.startDate;
        let fields: string[] = this.data.fields;

        this.getNodeChildDetails = function getChildDetails(rowItem) {
            if (rowItem.entries) {
                return {
                    group: true,
                    expanded: true,
                    children: rowItem.entries,
                    key: rowItem.labName,
                };
            } else {
                return null;
            }
        };

        for (let i = 0; i < fields.length; i++) {
            this.showFieldDetail(fields[i], idCoreFacility, startDate, i + 1 + "");
        }
    }

    private showFieldDetail(field: string, idCoreFacility: string, startDate: string, gridNumber: string): void {
        this["showGrid" + gridNumber] = true;

        let columnDefs: ColDef[] = [];
        columnDefs.push({headerName: "Lab", field: "labName", width: 300, cellRenderer: "agGroupCellRenderer",
            cellRendererParams: {innerRenderer: getGroupRenderer(), suppressCount: true}});
        if (field === "experimentCount" || field === "analysisCount") {
            columnDefs.push({headerName: "Date", field: "createDate", width: 100});
            columnDefs.push({headerName: "#", field: "number", width: 100});
        } else if (field === "uploadCount") {
            columnDefs.push({headerName: "Date", field: "transferDate", width: 100});
            columnDefs.push({headerName: "#", field: "number", width: 100});
            columnDefs.push({headerName: "Uploads", field: "uploadCount", width: 150});
        } else if (field === "downloadCount") {
            columnDefs.push({headerName: "Date", field: "transferDate", width: 100});
            columnDefs.push({headerName: "#", field: "number", width: 100});
            columnDefs.push({headerName: "Downloads", field: "downloadCount", width: 150});
        }
        this["gridColDefs" + gridNumber] = columnDefs;

        this.subscriptions.push(this.usageService.getUsageDetail(field, startDate, idCoreFacility).subscribe((result: any) => {
            let entries: any[] = [];
            if (result) {
                entries = UtilService.getJsonArray(result, result.Entry);
            }

            let labMap: any = {};
            for (let entry of entries) {
                if (!labMap[entry.labName]) {
                    labMap[entry.labName] = {
                        labName: entry.labName,
                        entries: [],
                        icon: this.constantsService.ICON_FOLDER,
                    };
                }
                labMap[entry.labName].entries.push(entry);
            }

            let dataForGrid: any[] = [];
            for (let key of Object.keys(labMap)) {
                dataForGrid.push(labMap[key])
            }
            dataForGrid.sort(this.userPrefService.createDisplaySortFunction("labName"));
            this["gridData" + gridNumber] = dataForGrid;
        }, () => {
            this.dialogRef.close();
        }));
    }

    public resizeColumns(event: AgGridEvent): void {
        event.api.sizeColumnsToFit();
    }

    ngOnDestroy(): void {
        for (let sub of this.subscriptions) {
            UtilService.safelyUnsubscribe(sub);
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
