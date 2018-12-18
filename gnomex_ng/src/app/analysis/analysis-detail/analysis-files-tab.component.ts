import {Component, OnDestroy, OnInit} from "@angular/core";
import {ConstantsService} from "../../services/constants.service";
import {GridApi, GridReadyEvent, GridSizeChangedEvent, RowNode} from "ag-grid-community";
import {AnalysisService} from "../../services/analysis.service";
import {ActivatedRoute} from "@angular/router";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ViewerLinkRenderer} from "../../util/grid-renderers/viewer-link.renderer";
import {DataTrackService} from "../../services/data-track.service";
import {HttpParams} from "@angular/common/http";
import {ManageFilesDialogComponent} from "./manage-files-dialog.component";
import {MatDialog, MatDialogConfig} from "@angular/material";

@Component({
    selector: 'analysis-files-tab',
    template: `
        <div class="padded flex-container-col full-height">
            <div class="flex-container-row">
                <button mat-button (click)="this.handleUploadFiles()"><img [src]="this.constantsService.ICON_UPLOAD" class="icon">Upload Files</button>
                <button mat-button (click)="this.handleFDTUploadCommandLine()"><img [src]="this.constantsService.ICON_UPLOAD_LARGE" class="icon">FDT Upload Command Line</button>
                <button mat-button (click)="this.handleFDTUploadFiles()"><img [src]="this.constantsService.ICON_UPLOAD_LARGE" class="icon">FDT Upload Files</button>
                <button mat-button (click)="this.handleManageFiles()"><img [src]="this.constantsService.ICON_CHART_ORGANIZATION" class="icon">Manage Files</button>
                <button mat-button (click)="this.handleDownloadFiles()"><img [src]="this.constantsService.ICON_DOWNLOAD" class="icon">Download Files</button>
            </div>
            <div class="flex-grow">
                <ag-grid-angular class="ag-theme-balham full-height full-width"
                                 (gridReady)="this.onGridReady($event)"
                                 (gridSizeChanged)="this.onGridSizeChanged($event)"
                                 [getNodeChildDetails]="this.getNodeChildDetails"
                                 [enableColResize]="true"
                                 [rowData]="this.gridData">
                </ag-grid-angular>
            </div>
            <div class="flex-container-row justify-flex-end">
                <label>{{this.fileCount}} file(s)</label>
            </div>
        </div>
    `,
    styles: [`
        .no-padding-dialog {
            padding: 0;
        }
    `]
})
export class AnalysisFilesTabComponent implements OnInit, OnDestroy {

    public getNodeChildDetails;
    private gridApi: GridApi;
    private gridColDefs: any[];
    public gridData: any[] = [];

    public fileCount: number = 0;
    public getAnalysisDownloadListResult: any;
    private analysis:any;

    constructor(public constantsService: ConstantsService,
                private analysisService: AnalysisService,
                private route: ActivatedRoute,
                private dialogsService: DialogsService,
                private dataTrackService: DataTrackService,
                private dialog:MatDialog) {
    }

    ngOnInit() {
        this.gridColDefs = [
            {headerName: "Folder or File", field: "displayName", tooltipField: "displayName", cellRenderer: "agGroupCellRenderer",
                cellRendererParams: {innerRenderer: getDownloadGroupRenderer(), suppressCount: true}},
            {headerName: "Size", field: "fileSizeText", tooltipField: "fileSizeText", width: 150, maxWidth: 150, type: "numericColumn"},
            {headerName: "Modified", field: "lastModifyDateDisplay", tooltipField: "lastModifyDateDisplay", width: 120, maxWidth: 120},
            {headerName: "URL", field: "URLLinkAllowed", width: 70, maxWidth: 70,
                cellRendererFramework: ViewerLinkRenderer, cellRendererParams: {icon: this.constantsService.ICON_LINK, clickFunction: this.makeURLLink}},
            {headerName: "UCSC", field: "UCSCViewer", width: 80, maxWidth: 80,
                cellRendererFramework: ViewerLinkRenderer, cellRendererParams: {icon: this.constantsService.ICON_UCSC, clickFunction: this.makeUCSCLink}},
            {headerName: "IGV", field: "IGVViewer", width: 70, maxWidth: 70,
                cellRendererFramework: ViewerLinkRenderer, cellRendererParams: {icon: this.constantsService.ICON_IGV, clickFunction: this.makeIGVLink}},
            {headerName: "IOBIO", field: "BAMIOBIOViewer", width: 90, maxWidth: 90,
                cellRendererFramework: ViewerLinkRenderer, cellRendererParams: {icon: this.constantsService.ICON_IOBIO, clickFunction: this.makeIOBIOLink}},
            {headerName: "GENE", field: "GENEIOBIOViewer", width: 90, maxWidth: 90,
                cellRendererFramework: ViewerLinkRenderer, cellRendererParams: {icon: this.constantsService.ICON_IOBIO, clickFunction: this.makeGENELink}},
        ];
        this.getNodeChildDetails = function getItemNodeChildDetails(rowItem) {
            if (rowItem.FileDescriptor) {
                return {
                    group: true,
                    expanded: false,
                    children: rowItem.FileDescriptor,
                    key: rowItem.displayName
                };
            } else {
                return null;
            }
        };

        this.route.data.forEach((data: any) => {
            this.gridData = [];
            this.fileCount = 0;
            this.getAnalysisDownloadListResult = null;
            if(data && data.analysis && data.analysis.Analysis){
                this.analysis = data.analysis.Analysis;
                this.analysisService.getAnalysisDownloadList(data.analysis.Analysis.idAnalysis).subscribe((result: any) => {
                    if (result && result.Analysis) {
                        this.getAnalysisDownloadListResult = result;
                        this.gridData = [result.Analysis];
                        setTimeout(() => {
                            this.determineFileCount();
                        });
                    } else {
                        let message: string = "";
                        if (result && result.message) {
                            message = ": " + result.message;
                        }
                        this.dialogsService.alert("An error occurred while retrieving download list" + message, null);
                    }
                });
            }
        });
    }

    public onGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.gridColDefs);
        event.api.sizeColumnsToFit();
        this.gridApi = event.api;
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        event.api.sizeColumnsToFit();
    }

    private determineFileCount(): void {
        this.fileCount = 0;
        if (this.gridApi) {
            this.gridApi.forEachNode((node: RowNode) => {
                if (node.data.type && node.data.type !== 'dir') {
                    this.fileCount++;
                }
            });
        }
    }

    private makeURLLink: (data: any) => void = (data: any) => {
        let params: HttpParams = new HttpParams()
            .set("pathName", data.fileName);
        this.dataTrackService.makeURLLink(params).subscribe((result: any) => {
            if (result && result.urlsToLink) {
                this.dialogsService.alert(result.urlsToLink);
            } else {
                this.handleBackendLinkError(result);
            }
        });
    };

    private makeUCSCLink: (data: any) => void = (data:any) => {
        let params: HttpParams = new HttpParams()
            .set("idAnalysis", data.idAnalysis)
            .set("pathName", data.fileName);
        this.dataTrackService.makeUCSCLinks(params).subscribe((result: any) => {
            if (result && result.ucscURL1) {
                window.open(result.ucscURL1, "_blank");
            } else {
                this.handleBackendLinkError(result);
            }
        });
    };

    private makeIGVLink: (data: any) => void = (data: any) => {
        this.dataTrackService.makeIGVLink().subscribe((result: any) => {
            if (result && result.igvURL) {
                this.dialogsService.alert(result.igvURL);
            } else {
                this.handleBackendLinkError(result);
            }
        });
    };

    private makeIOBIOLink: (data: any) => void = (data: any) => {
        let params: HttpParams = new HttpParams()
            .set("requestType", "IOBIO")
            .set("pathName", data.fileName);
        this.dataTrackService.makeIOBIOLink(params).subscribe((result: any) => {
            if (result && result.urlsToLink) {
                window.open(result.urlsToLink, "_blank");
            } else {
                this.handleBackendLinkError(result);
            }
        });
    };

    private makeGENELink: (data: any) => void = (data: any) => {
        let params: HttpParams = new HttpParams()
            .set("idAnalysis", data.idAnalysis)
            .set("fileName", data.fileName)
            .set("VCFInfo", JSON.stringify(this.getAnalysisDownloadListResult.VCFInfo))
            .set("BAMInfo", JSON.stringify(this.getAnalysisDownloadListResult.BAMInfo));
        this.dataTrackService.makeGENELink(params).subscribe((result: any) => {
            if (result && result.urlsToLink) {
                window.open(result.urlsToLink, "_blank");
            } else {
                this.handleBackendLinkError(result);
            }
        });
    };

    private handleBackendLinkError(result: any): void {
        let message: string = "";
        if (result && result.message) {
            message = ": " + result.message;
        }
        this.dialogsService.alert("An error occurred while making the link" + message, null);
    }

    public handleUploadFiles(): void {
        // TODO Upload Files
    }

    public handleFDTUploadCommandLine(): void {
        // TODO FDT Upload Command Line
    }

    public handleFDTUploadFiles(): void {
        // TODO FDT Upload Files
    }

    public handleManageFiles(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.panelClass = 'no-padding-dialog';
        config.data = {
            order: this.analysis,
        };
        config.height = "40em";
        config.width = "55em";
        this.dialog.open(ManageFilesDialogComponent,config);

    }

    public handleDownloadFiles(): void {
        // TODO Download Files
    }

    ngOnDestroy() {
    }

}

function getDownloadGroupRenderer() {
    function DownloadGroupRenderer() {
    }

    DownloadGroupRenderer.prototype.init = function(params) {
        let tempDiv = document.createElement("div");
        let textColor: string = params.data.displayColor ? params.data.displayColor : 'black';
        if (params.data.icon) {
            tempDiv.innerHTML = '<span style="color: ' + textColor + ';"><img src="' + params.data.icon + '" class="icon"/>' + params.value + '</span>';
        } else {
            tempDiv.innerHTML = '<span style="color: ' + textColor + ';">' + params.value + '</span>';
        }
        this.eGui = tempDiv.firstChild;
    };

    DownloadGroupRenderer.prototype.getGui = function() {
        return this.eGui;
    };

    return DownloadGroupRenderer;
}
