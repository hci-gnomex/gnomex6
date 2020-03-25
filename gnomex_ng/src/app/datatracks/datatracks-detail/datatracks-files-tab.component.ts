import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ConstantsService} from "../../services/constants.service";
import {GridApi, GridReadyEvent, GridSizeChangedEvent, SelectionChangedEvent} from "ag-grid-community";
import {ActivatedRoute} from "@angular/router";
import {DialogsService} from "../../util/popup/dialogs.service";
import {DataTrackService} from "../../services/data-track.service";
import {IconLinkButtonRenderer} from "../../util/grid-renderers/icon-link-button.renderer";
import {GnomexService} from "../../services/gnomex.service";
import {FormControl} from "@angular/forms";

@Component({
    selector: 'datatracks-files-tab',
    template: `
        <div class="padded flex-container-col full-height">
            <div class="flex-container-row justify-space-between align-center">
                <div>
                    <button mat-button [disabled]="!this.canWrite || this.selectedFiles.length < 1" (click)="this.removeFiles()"><img [src]="this.constantsService.PAGE_REMOVE" class="icon">Remove file(s) from data track</button>
                </div>
                <div>
                    <label>{{this.gridData.length}} file(s)</label>
                </div>
            </div>
            <div class="flex-grow">
                <div #oneEmWidth class="no-height single-em"></div>
                <ag-grid-angular class="ag-theme-balham full-height full-width"
                                 (gridReady)="this.onGridReady($event)"
                                 (gridSizeChanged)="this.onGridSizeChanged($event)"
                                 (selectionChanged)="this.onGridSelectionChanged($event)"
                                 [context]="this.gridContext"
                                 [columnDefs]="this.gridColDefs"
                                 [enableColResize]="true"
                                 [rowSelection]="'multiple'">
                </ag-grid-angular>
            </div>
        </div>
    `,
    styles: [`

        .no-height { height: 0;  }
        .single-em { width: 1em; }
        
    `]
})
export class DatatracksFilesTabComponent implements OnInit {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    private emToPxConversionRate: number = 13;

    public gridColDefs: any[] = [];
    public gridData: any[] = [];
    public gridContext: any = {};
    private gridApi: GridApi;

    public canWrite: boolean = false;

    public filesToRemove: FormControl = new FormControl([]);
    private selectedFiles: any[] = [];

    constructor(public constantsService: ConstantsService,
                private dialogsService: DialogsService,
                private dataTrackService: DataTrackService,
                private route: ActivatedRoute,
                private gnomexService: GnomexService) {
    }

    ngOnInit() {
        this.gridColDefs = [
            {
                headerName: "Name",
                field: "name",
                width:    1,
                minWidth: 25 * this.emToPxConversionRate
            },
            {
                headerName: "Modified",
                field: "lastModified",
                width:    1,
                minWidth: 8.5 * this.emToPxConversionRate
            },
            {
                headerName: "Size",
                field: "size",
                type: "numericColumn",
                width:    1,
                minWidth: 8.5 * this.emToPxConversionRate
            },
            {
                headerName: "Analysis",
                field: "analysisLabel",
                width:    500,
                minWidth: 8.5 * this.emToPxConversionRate,
                cellRendererFramework: IconLinkButtonRenderer,
                icon: this.constantsService.ICON_ANALYSIS,
                editable: false,
                onClick: "goToAnalysis"
            }
        ];
        this.gridContext = {
            componentParent: this
        };

        this.route.data.forEach((data: any) => {
            this.gridData = [];
            this.canWrite = false;
            this.filesToRemove.setValue([]);
            this.filesToRemove.markAsPristine();
            this.selectedFiles = [];

            if (data && data.datatrack) {
                this.canWrite = data.datatrack.canWrite === 'Y';
                if (data.datatrack.Files && data.datatrack.Files.Dir) {
                    let filesArray: any[] = [];
                    this.recurseAndFindFiles(filesArray, data.datatrack.Files.Dir);
                    this.gridData = filesArray;
                }
            }

            if (this.gridApi) {
                this.gridApi.setRowData(this.gridData);
            }
        });
    }

    private recurseAndFindFiles(filesArray: any[], dir: any): void {
        if (dir.File) {
            let fileChildren: any[] = Array.isArray(dir.File) ? dir.File : [dir.File];
            filesArray.push(...fileChildren);
        }
        if (dir.Dir) {
            let dirChildren: any[] = Array.isArray(dir.Dir) ? dir.Dir : [dir.Dir];
            for (let child of dirChildren) {
                this.recurseAndFindFiles(filesArray, child);
            }
        }
    }

    public goToAnalysis(node: any): void {
        if (node && node.data && node.data.analysisNumber) {
            this.gnomexService.navByNumber(node.data.analysisNumber);
        }
    }

    public onGridReady(event: GridReadyEvent): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            event.api.sizeColumnsToFit();
            this.gridApi = event.api;
            this.gridApi.setRowData(this.gridData);
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

    public onGridSelectionChanged(event: SelectionChangedEvent): void {
        this.selectedFiles = [];
        for (let node of event.api.getSelectedNodes()) {
            this.selectedFiles.push(node.data);
        }
    }

    public removeFiles(): void {
        for (let file of this.selectedFiles) {
            this.gridData.splice(this.gridData.indexOf(file), 1);
        }
        this.gridApi.setRowData(this.gridData);

        this.filesToRemove.setValue(this.selectedFiles);
        this.filesToRemove.markAsDirty();
        this.selectedFiles = [];
    }

}
