import {Component, OnDestroy, OnInit} from "@angular/core";
import {ConstantsService} from "../../services/constants.service";
import {
    GridApi,
    GridReadyEvent,
    GridSizeChangedEvent,
    RowDoubleClickedEvent,
    RowNode,
} from "ag-grid-community";
import {AnalysisService} from "../../services/analysis.service";
import {ActivatedRoute} from "@angular/router";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {ViewerLinkRenderer} from "../../util/grid-renderers/viewer-link.renderer";
import {DataTrackService} from "../../services/data-track.service";
import {HttpParams} from "@angular/common/http";
import {ManageFilesDialogComponent} from "../../util/upload/manage-files-dialog.component";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {FormGroup} from "@angular/forms";
import {FileService} from "../../services/file.service";
import {Subscription} from "rxjs";
import {DownloadFilesComponent} from "../../util/download-files.component";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {PropertyService} from "../../services/property.service";
import {DictionaryService} from "../../services/dictionary.service";
import {UtilService} from "../../services/util.service";

@Component({
    selector: 'analysis-files-tab',
    template: `
        <div class="padded flex-container-col full-height">
            <div class="flex-container-row">
                <button mat-button (click)="this.handleUploadFiles()" [disabled]="!this.canUpdate"><img [src]="this.constantsService.ICON_UPLOAD" class="icon">Upload Files</button>
                <button mat-button *ngIf="isFDTSupported" (click)="this.handleFDTUploadCommandLine()" [disabled]="!this.canUpdate"><img [src]="this.constantsService.ICON_UPLOAD_LARGE" class="icon">FDT Upload Command Line</button>
                <button mat-button *ngIf="isFDTSupported" (click)="this.handleFDTUploadFiles()" [disabled]="!this.canUpdate"><img [src]="this.constantsService.ICON_UPLOAD_LARGE" class="icon">FDT Upload Files</button>
                <button mat-button (click)="this.handleManageFiles()" [disabled]="!this.canUpdate"><img [src]="this.constantsService.ICON_CHART_ORGANIZATION" class="icon">Manage Files</button>
                <button mat-button (click)="this.handleDownloadFiles()"><img [src]="this.constantsService.ICON_DOWNLOAD" class="icon">Download Files</button>
            </div>
            <div class="flex-grow">
                <ag-grid-angular class="ag-theme-balham full-height full-width"
                                 (gridReady)="this.onGridReady($event)"
                                 (gridSizeChanged)="this.onGridSizeChanged($event)"
                                 (rowDoubleClicked)="this.onGridRowDoubleClicked($event)"
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
    styles: [``]
})
export class AnalysisFilesTabComponent implements OnInit, OnDestroy {

    public getNodeChildDetails;
    private gridApi: GridApi;
    private gridColDefs: any[];
    public gridData: any[] = [];

    public fileCount: number = 0;
    public getAnalysisDownloadListResult: any;
    private analysis:any;
    public canUpdate: boolean = false;
    private formGroup: FormGroup;
    private analysisDownloadListSubscription: Subscription;
    public isFDTSupported:boolean = false;
    public isClinicalResearch:boolean = false;


    constructor(public constantsService: ConstantsService,
                private analysisService: AnalysisService,
                private fileService: FileService,
                private route: ActivatedRoute,
                private dialogsService: DialogsService,
                private dataTrackService: DataTrackService,
                private propertyService: PropertyService,
                private dialog:MatDialog) {
    }

    ngOnInit() {
        this.isFDTSupported = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_FDT_SUPPORTED);

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
            let children: any[] = [];
            if (rowItem.FileDescriptor) {
                for (let fd of rowItem.FileDescriptor) {
                    children.push(fd);
                }
            }
            if (rowItem.AnalysisDownload) {
                for (let ad of rowItem.AnalysisDownload) {
                    children.push(ad);
                }
            }
            if (children.length > 0) {
                return {
                    group: true,
                    expanded: false,
                    children: children,
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
                this.canUpdate = this.analysis.canUpdate && this.analysis.canUpdate === 'Y';

                if(this.analysisDownloadListSubscription){ // every time route changes a new subscriber is made we don't want that.
                    this.analysisDownloadListSubscription.unsubscribe();
                }
                this.analysisDownloadListSubscription=  this.fileService.getAnalysisOrganizeFilesObservable(true)
                    .subscribe((result: any) => {
                        if (result && result.Analysis) {
                            this.getAnalysisDownloadListResult = result;
                            this.gridData = [result.Analysis];
                            setTimeout(() => {
                                this.determineFileCount();
                            });
                        }
                    },(err:IGnomexErrorResponse) =>{
                    });
                this.fileService.emitGetAnalysisOrganizeFiles({"idAnalysis": this.analysis.idAnalysis});
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
                if (node.data.fileSize && node.data.type !== 'dir') {
                    this.fileCount++;
                }
            });
        }
    }

    public onGridRowDoubleClicked(event: RowDoubleClickedEvent): void {
        if (event.data.type) {
            let extensionType: string = "." + event.data.type;
            if (ConstantsService.FILE_EXTENSIONS_FOR_VIEW.includes(extensionType)) {
                let idAnalysis: string = event.data.idAnalysis;
                let fileName: string = event.data.fileName;
                let dir: string = "";
                if (event.node.parent && event.node.parent.data.type && event.node.parent.data.type === 'dir') {
                    dir = event.node.parent.data.displayName;
                }
                this.fileService.previewAnalysisFile(idAnalysis, fileName, dir);
            }
        }
    }

    private makeURLLink: (data: any) => void = (data: any) => {
        let params: HttpParams = new HttpParams()
            .set("pathName", data.fileName);
        this.dataTrackService.makeURLLink(params).subscribe((result: any) => {
            if (result && result.urlsToLink) {
                this.dialogsService.alert(result.urlsToLink, null, DialogType.SUCCESS);
            }
        },(err:IGnomexErrorResponse) => {
            this.handleBackendLinkError(err.gError);
        });
    }

    private makeUCSCLink: (data: any) => void = (data:any) => {
        let params: HttpParams = new HttpParams()
            .set("idAnalysis", data.idAnalysis)
            .set("pathName", data.fileName);
        this.dataTrackService.makeUCSCLinks(params).subscribe((result: any) => {
            if (result && result.ucscURL1) {
                window.open(result.ucscURL1, "_blank");
            }
        },(err:IGnomexErrorResponse) => {
            this.handleBackendLinkError(err.gError);
        });
    }

    private makeIGVLink: (data: any) => void = (data: any) => {
        this.dataTrackService.makeIGVLink().subscribe((result: any) => {
            if (result && result.igvURL) {
                this.dialogsService.alert(result.igvURL, null, DialogType.SUCCESS);
            }
        }, (err: IGnomexErrorResponse) => {
            this.handleBackendLinkError(err.gError);
        });
    }

    private makeIOBIOLink: (data: any) => void = (data: any) => {
        let params: HttpParams = new HttpParams()
            .set("requestType", "IOBIO")
            .set("pathName", data.fileName);
        this.dataTrackService.makeIOBIOLink(params).subscribe((result: any) => {
            if (result && result.urlsToLink) {
                window.open(result.urlsToLink, "_blank");
            }
        },(err:IGnomexErrorResponse) =>{
            this.handleBackendLinkError(err.gError);
        });
    }

    private makeGENELink: (data: any) => void = (data: any) => {
        let params: HttpParams = new HttpParams()
            .set("idAnalysis", data.idAnalysis)
            .set("fileName", data.fileName)
            .set("VCFInfo", JSON.stringify(this.getAnalysisDownloadListResult.VCFInfo))
            .set("BAMInfo", JSON.stringify(this.getAnalysisDownloadListResult.BAMInfo))
            .set("noJSONToXMLConversionNeeded", "Y");
        this.dataTrackService.makeGENELink(params).subscribe((result: any) => {
            if (result && result.urlsToLink) {
                window.open(result.urlsToLink, "_blank");
            }
        },(err:IGnomexErrorResponse) => {
            this.handleBackendLinkError(err.gError);
        });
    }

    private handleBackendLinkError(result: any): void {
        let message: string = "";
        if (result && result.message) {
            message = ": " + result.message;
        }
        this.dialogsService.error("An error occurred while making the link" + message);
    }

    public handleUploadFiles(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            order: this.analysis,
            startTabIndex: 0,
            isFDT: false
        };
        config.height = "40.3em";
        config.width = "70em";
        config.autoFocus = false;
        this.dialogsService.genericDialogContainer(ManageFilesDialogComponent, "Upload Files", null, config);
    }

    public handleFDTUploadCommandLine(): void {
        if(this.analysis &&  this.analysis.idAnalysis){
            this.fileService.startFDTupload(this.analysis.idAnalysis, 'a')
                .subscribe(resp => {
                    // nothing to show window.open() displays html text
                },(err:IGnomexErrorResponse) =>{});
        }
    }

    public handleFDTUploadFiles(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            order: this.analysis,
            startTabIndex: 0,
            isFDT: true
        };
        config.height = "40.3em";
        config.width = "70em";
        config.autoFocus = false;
        this.dialogsService.genericDialogContainer(ManageFilesDialogComponent, "Upload Files", null, config);
    }

    public handleManageFiles(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            order: this.analysis,
            startTabIndex: 1,
            isFDT: false
        };
        config.height = "40.3em";
        config.width = "70em";
        config.autoFocus = false;
        this.dialogsService.genericDialogContainer(ManageFilesDialogComponent, "Upload Files", null, config)

    }

    public handleDownloadFiles(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            showCreateSoftLinks: false,
            downloadListSource: this.gridData[0],
            cacheDownloadListFn: this.fileService.cacheAnalysisFileDownloadList,
            fdtDownloadFn: this.fileService.getFDTDownloadAnalysisServlet,
            downloadURL: "DownloadAnalysisFileServlet.gx",
            suggestedFilename: "gnomex-analysis",
        };
        config.autoFocus = false;
        this.dialogsService.genericDialogContainer(DownloadFilesComponent, "Download Files", null, config);
    }

    ngOnDestroy() {
        UtilService.safelyUnsubscribe(this.analysisDownloadListSubscription);
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
