import {Component, OnDestroy, OnInit} from "@angular/core";
import {ConstantsService} from "../../services/constants.service";
import {GridApi, GridReadyEvent, GridSizeChangedEvent, RowNode, RowDoubleClickedEvent} from "ag-grid-community";
import {ActivatedRoute} from "@angular/router";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ExperimentsService} from "../experiments.service";
import {FileService} from "../../services/file.service";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {ManageFilesDialogComponent} from "../../util/upload/manage-files-dialog.component";
import {Subscription} from "rxjs";
import {DownloadFilesComponent} from "../../util/download-files.component";

@Component({
    selector: 'experiment-files-tab',
    template: `
        <div class="padded flex-container-col full-height">
            <div class="flex-container-row">
                <button mat-button (click)="this.handleUploadFiles()" [disabled]="!this.canUpdate"><img [src]="this.constantsService.ICON_UPLOAD" class="icon">Upload Files</button>
                <button mat-button (click)="this.handleSFTPUploadFiles()" [disabled]="!this.canUpdate"><img [src]="this.constantsService.ICON_UPLOAD_LARGE" class="icon">SFTP Upload Files</button>
                <button mat-button (click)="this.handleFDTUploadFiles()" [disabled]="!this.canUpdate"><img [src]="this.constantsService.ICON_UPLOAD_LARGE" class="icon">FDT Upload Files</button>
                <button mat-button (click)="this.handleFDTUploadCommandLine()" [disabled]="!this.canUpdate"><img [src]="this.constantsService.ICON_UPLOAD_LARGE" class="icon">FDT Upload Command Line</button>
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
            <div>
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
export class ExperimentFilesTabComponent implements OnInit, OnDestroy {

    public getNodeChildDetails;
    private gridApi: GridApi;
    private gridColDefs: any[];
    public gridData: any[] = [];

    public fileCount: number = 0;
    public getRequestDownloadListResult: any;
    private request:any;
    public canUpdate: boolean = false;
    private updateFileSubscription:Subscription;


    constructor(public constantsService: ConstantsService,
                private route: ActivatedRoute,
                private fileService: FileService,
                private dialogsService: DialogsService,
                private experimentsService: ExperimentsService,
                private dialog:MatDialog) {
    }

    ngOnInit() {
        this.gridColDefs = [
            {headerName: "Folder or File", field: "displayName", tooltipField: "displayName", cellRenderer: "agGroupCellRenderer",
                cellRendererParams: {innerRenderer: getDownloadGroupRenderer(), suppressCount: true}},
            {headerName: "User", field: "info", tooltipField: "info", width: 150, maxWidth: 150},
            {headerName: "Linked Sample", field: "linkedSampleNumber", tooltipField: "linkedSampleNumber", width: 150, maxWidth: 150},
            {headerName: "Size", field: "fileSizeText", tooltipField: "fileSizeText", width: 150, maxWidth: 150, type: "numericColumn"},
            {headerName: "Modified", field: "lastModifyDateDisplay", tooltipField: "lastModifyDateDisplay", width: 150, maxWidth: 150},
        ];
        this.getNodeChildDetails = function getItemNodeChildDetails(rowItem) {
            let children: any[] = [];
            if (rowItem.FileDescriptor) {
                for (let fd of rowItem.FileDescriptor) {
                    children.push(fd);
                }
            }
            if (rowItem.RequestDownload) {
                for (let rd of rowItem.RequestDownload) {
                    children.push(rd);
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
            this.getRequestDownloadListResult = null;
            if (data && data.experiment && data.experiment.Request) {
                this.request = data.experiment.Request;
                this.canUpdate = this.request.canUpdate && this.request.canUpdate === 'Y';
                this.experimentsService.getRequestDownloadList(data.experiment.Request.idRequest).subscribe((result: any) => {
                    if (result && result.Request) {
                        this.getRequestDownloadListResult = result;
                        this.gridData = [result.Request];
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
        this.updateFileSubscription = this.fileService.getUpdateFileTabObservable().subscribe(data =>{
           this.gridData = data;
            setTimeout(() => {
                this.determineFileCount();
            });
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
                let idRequest: string = this.request.idRequest;
                let fileName: string = event.data.fileName;
                this.fileService.previewExperimentFile(idRequest, fileName);
            }
        }
    }

    public handleUploadFiles(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.panelClass = 'no-padding-dialog';
        config.data = {
            order: this.request,
            startTabIndex: 0,
            isFDT: false
        };
        config.height = "40em";
        config.width = "55em";
        config.disableClose = true;
        this.dialog.open(ManageFilesDialogComponent,config);
    }

    public handleFDTUploadCommandLine(): void {
        // TODO FDT Upload Command Line
    }

    public handleFDTUploadFiles(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.panelClass = 'no-padding-dialog';
        config.data = {
            order: this.request,
            startTabIndex: 0,
            isFDT: true
        };
        config.height = "40em";
        config.width = "55em";
        config.disableClose = true;
        this.dialog.open(ManageFilesDialogComponent,config);
    }

    public handleSFTPUploadFiles(): void {
        // TODO SFTP Upload Files
    }

    public handleManageFiles(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.panelClass = 'no-padding-dialog';
        config.data = {
            order: this.request,
            startTabIndex: 1,
            isFDT: false
        };
        config.height = "40em";
        config.width = "55em";
        config.disableClose = true;
        this.dialog.open(ManageFilesDialogComponent,config);
    }

    public handleDownloadFiles(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.panelClass = 'no-padding-dialog';
        config.data = {
            showCreateSoftLinks: true,
            downloadListSource: this.getRequestDownloadListResult.Request,
            cacheDownloadListFn: this.fileService.cacheExperimentFileDownloadList,
            fdtDownloadFn: this.fileService.getFDTDownloadExperimentServlet,
            makeSoftLinksFn: this.fileService.makeSoftLinks,
            downloadURL: "DownloadFileServlet.gx",
            suggestedFilename: "gnomex-data",
        };
        config.disableClose = true;
        this.dialog.open(DownloadFilesComponent, config);
    }

    ngOnDestroy() {
        this.updateFileSubscription.unsubscribe();
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
