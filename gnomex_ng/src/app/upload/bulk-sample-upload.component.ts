import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DialogPosition, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {Router} from "@angular/router";
import {DialogsService} from "../util/popup/dialogs.service";
import {SampleUploadService} from "./sample-upload.service";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {ShowErrorsShowSamplesRenderer} from "../util/grid-renderers/show-errors-show-samples.renderer";
import {Subscription} from "rxjs";
import {GnomexService} from "../services/gnomex.service";

@Component({
    selector: 'bulk-sample-upload-launcher',
    template: `
        <div></div>
    `,
    styles: [`
        
        .no-padding-dialog .mat-dialog-container {
            padding: 0;
        }
        .no-padding-dialog .mat-dialog-container .mat-dialog-actions {
            background-color: #eeeeeb;
        }
        
    `]
}) export class BulkSampleUploadLauncherComponent {

    constructor (private dialog: MatDialog,
                 private router: Router) {

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = '60em';
        config.height = '45em';
        config.panelClass = 'no-padding-dialog';
        config.disableClose = true;
        config.hasBackdrop = false;

        let dialogRef = this.dialog.open(BulkSampleUploadComponent, config);

        dialogRef.afterClosed().subscribe((result) => {
            // After closing the dialog, route away from this component so that the dialog could
            // potentially be reopened.
            this.router.navigate([{ outlets: {modal: null}}]);
        });
    }
}

@Component({
    selector: 'bulk-sample-upload',
    templateUrl: 'bulk-sample-upload.component.html',
    styles: [`

        .no-height { height: 0;  } 
        .single-em { width: 1em; }
        
        .no-max-height { max-height: none; }
        
        .hidden { display: none; }

        .blue-text { color: blue; }
        .red-text  { color: red;  }
        
        .underline { text-decoration: underline; }
        
        .foreground { background-color: white;   }
        .background { background-color: #eeeeee; }
        
        .bordered { border: solid silver 1px; }
        
        
        
        .small-font { font-size: x-small; }
        
        .inline-block { display: inline-block; }

        .padded { padding: 0.3em; } 
        
        .padded-top { padding-top: 0.3em; }
        
        .padded-left-right { 
            padding-left:  0.3em; 
            padding-right: 0.3em; 
        }
        
        .padded-left-right-bottom {
            padding: 0;
            
            padding-left:   0.3em;
            padding-right:  0.3em;
            padding-bottom: 0.3em;
        }
        
        .no-margin    { margin: 0; }
        .margin-right { margin-right: 0.3em; }
        
        .title {
            background-color: #84b278;
            color: white;
            font-size: larger;
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
}) export class BulkSampleUploadComponent implements OnDestroy {

    @ViewChild('topmostLeftmost') topmostLeftmost: ElementRef;

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;
    @ViewChild('fileInput') fileInput: ElementRef;


    originalXClick: number = 0;
    originalYClick: number = 0;

    protected positionX: number = 0;
    protected positionY: number = 0;

    movingDialog: boolean = false;


    public file: any;
    protected fileParsed: boolean = false;
    protected fileUploaded: boolean = false;
    protected showErrorsAndSamplesScreen: boolean = false;
    protected showErrorsAboveSamples: boolean = true;
    protected selectedAll: boolean = true;

    protected importableGridApi: any;
    protected errorTopGridApi: any;
    protected errorBottomGridApi: any;
    protected finalErrorsGridApi: any;
    protected samplesTopGridApi: any;
    protected samplesBottomGridApi: any;

    private emToPxConversionRate: number = 16;

    private importableRows: any[];
    private errorRows: any[];
    private sampleGridHeaders: any[];
    private rows: any[];

    private errorRows_original: any[];
    private rows_original: any[];

    private uploadSubscription: Subscription;
    private importSamplesSubscription: Subscription;

    public context: any = this;

    private finalErrors:   any;
    private finalRequests: any;


    private get importedGridColumnDefs(): any[] {
        let columnDefinitions: any[] = [];

        columnDefinitions.push({
            headerName: "Import?",
            checkboxSelection: true,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            suppressSizeToFit: true
        });
        columnDefinitions.push({
            headerName: "Experiment #",
            editable: false,
            width:    7 * this.emToPxConversionRate,
            maxWidth: 7 * this.emToPxConversionRate,
            minWidth: 7 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "requestNumber"
        });
        columnDefinitions.push({
            headerName: "# Samples Unchanged",
            editable: false,
            width:    9 * this.emToPxConversionRate,
            maxWidth: 9 * this.emToPxConversionRate,
            minWidth: 9 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "numUnmodifiedSamples"
        });
        columnDefinitions.push({
            headerName: "# Samples Updated",
            editable: false,
            width:    8 * this.emToPxConversionRate,
            maxWidth: 8 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "numUpdatedSamples"
        });
        columnDefinitions.push({
            headerName: "# Samples Created",
            editable: false,
            width:    8 * this.emToPxConversionRate,
            maxWidth: 8 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "numCreatedSamples"
        });
        columnDefinitions.push({
            headerName: "# Errors/Warnings",
            editable: false,
            width:    8 * this.emToPxConversionRate,
            maxWidth: 8 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "numErrors"
        });


        columnDefinitions.push({
            headerName: "View Action",
            editable: false,
            width:    12 * this.emToPxConversionRate,
            cellRendererFramework: ShowErrorsShowSamplesRenderer,
            onClickButton1: "showSampleWithErrors",
            onClickButton2: "showErrorsForSample",
            field: "numErrors"
        });

        return columnDefinitions;
    }

    private get errorGridColumnDefs(): any[] {
        let columnDefinitions: any[] = [];

        columnDefinitions.push({
            headerName: "Row",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "rowOrdinal"
        });
        columnDefinitions.push({
            headerName: "Col",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "columnOrdinal"
        });
        columnDefinitions.push({
            headerName: "Experiment",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "requestNumber"
        });
        columnDefinitions.push({
            headerName: "Sample",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "sampleNumber"
        });
        columnDefinitions.push({
            headerName: "Col Name",
            editable: false,
            width:    6 * this.emToPxConversionRate,
            maxWidth: 6 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "header"
        });
        columnDefinitions.push({
            headerName: "Status",
            editable: false,
            width:    6 * this.emToPxConversionRate,
            maxWidth: 6 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "status"
        });

        columnDefinitions.push({
            headerName: "Message",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "message"
        });

        return columnDefinitions;
    }

    private get finalErrorGridColumnDefs(): any[] {
        let columnDefinitions: any[] = [];

        columnDefinitions.push({
            headerName: "Row",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "rowOrdinal"
        });
        columnDefinitions.push({
            headerName: "Col",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "columnOrdinal"
        });
        columnDefinitions.push({
            headerName: "Experiment",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "requestNumber"
        });
        columnDefinitions.push({
            headerName: "Sample",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "sampleNumber"
        });
        columnDefinitions.push({
            headerName: "Col Name",
            editable: false,
            width:    6 * this.emToPxConversionRate,
            maxWidth: 6 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "header"
        });
        columnDefinitions.push({
            headerName: "Status",
            editable: false,
            width:    6 * this.emToPxConversionRate,
            maxWidth: 6 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "status"
        });

        columnDefinitions.push({
            headerName: "Message",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "message"
        });

        return columnDefinitions;
    }

    private get samplesGridColumnDefs(): any[] {
        let columnDefinitions: any[] = [];

        columnDefinitions.push({
            headerName: "Row",
            editable: false,
            width:    4 * this.emToPxConversionRate,
            maxWidth: 4 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "rowOrdinal"
        });

        let i: number = 0;

        for (let header of this.sampleGridHeaders) {
            columnDefinitions.push({
                headerName: header.header,
                editable: false,
                width:    4 * this.emToPxConversionRate,
                maxWidth: 4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                errorMessageHeader: 'Upload Error\n',
                setErrors: (value: any,
                            data: any,
                            node: any,
                            colDef: any,
                            rowIndex: any,
                            gridApi: any) => {
                    if (data && data[colDef.field +"_errorMessage"]) {
                        node[colDef.field +"_errorMessage"] = data[colDef.field +"_errorMessage"];

                        return data[colDef.field +"_errorMessage"];
                    } else {
                        node[colDef.field +"_errorMessage"] = '';

                        return '';
                    }
                },
                field: ("n" + i++)
            });
        }

        columnDefinitions[columnDefinitions.length - 1].maxWidth = null;

        return columnDefinitions;
    }


    constructor(private dialogRef: MatDialogRef<BulkSampleUploadComponent>,
                private dialogService: DialogsService,
                private gnomexService: GnomexService,
                private sampleUploadService: SampleUploadService) { }



    onMouseDownHeader(event: any): void {
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
    onMouseMove(event: any): void {
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
    onMouseUp(): void {
        this.movingDialog = false;
    }



    public ngOnDestroy(): void {
        if (this.uploadSubscription) {
            this.uploadSubscription.unsubscribe();
        }
        if (this.importSamplesSubscription) {
            this.importSamplesSubscription.unsubscribe();
        }
    }

    public showAllErrorsThenSamples() {
        this.showErrorsAndSamplesScreen = true;
        this.showErrorsAboveSamples = true;
        this.selectedAll = true;

        this.dialogService.startDefaultSpinnerDialog();

        this.errorRows = this.errorRows_original;
        this.rows      = [];

        setTimeout(() => {
            this.assignErrorGridContents();
            this.assignSampleGridContents();
        });
    }
    public showAllSamplesThenErrors() {
        this.showErrorsAndSamplesScreen = true;
        this.showErrorsAboveSamples = false;
        this.selectedAll = true;

        this.dialogService.startDefaultSpinnerDialog();

        this.errorRows = [];
        this.rows      = this.rows_original;

        setTimeout(() => {
            this.assignErrorGridContents();
            this.assignSampleGridContents();
        });
    }

    public showErrorsForSample(node: any) {
        this.showErrorsAndSamplesScreen = true;
        this.showErrorsAboveSamples = true;
        this.selectedAll = false;

        this.dialogService.startDefaultSpinnerDialog();

        this.errorRows = [];
        this.rows      = [];

        if (this.errorRows_original) {
            let row_temp: any[];

            if (this.rows_original && Array.isArray(this.rows_original)) {
                row_temp = this.rows_original.filter((value) => {
                    return value && node && node.data && value.requestNumber === node.data.requestNumber;
                });
            }

            this.errorRows = this.errorRows_original.filter((value) => {
                return value && row_temp && row_temp[0]
                    && (value.columnOrdinal || value.rowOrdinal === (row_temp[0]).requestNumber);
            });
        }

        setTimeout(() => {
            this.assignErrorGridContents();
            this.assignSampleGridContents();
        });
    }
    public showSampleWithErrors(node: any) {
        this.showErrorsAndSamplesScreen = true;
        this.showErrorsAboveSamples = false;
        this.selectedAll = false;

        this.dialogService.startDefaultSpinnerDialog();

        this.errorRows = [];
        this.rows      = [];

        if (this.rows_original && Array.isArray(this.rows_original)) {
            this.rows = this.rows_original.filter((value) => {
                return value && node && node.data && value.requestNumber === node.data.requestNumber;
            });
        }

        setTimeout(() => {
            this.assignErrorGridContents();
            this.assignSampleGridContents();
        });
    }

    public onBackClicked() {
        this.showErrorsAndSamplesScreen = false;
    }

    public onFileSelected(event: any) {
        if (event.target.files && event.target.files.length > 0) {
            this.file = event.target.files[0];

            let formData: FormData = new FormData();
            formData.append("filename", this.file.name);
            formData.append("filetype", this.file.type == "text/html" ? "html" : "text");
            formData.append("value", this.file, this.file.name);

            if (!this.uploadSubscription) {
                this.dialogService.startDefaultSpinnerDialog();
                this.uploadSubscription = this.sampleUploadService.uploadBulkSampleSheet(formData).subscribe((result) => {
                    this.dialogService.stopAllSpinnerDialogs();

                    if (!!result) {
                        this.errorRows_original = result.Errors;
                        this.rows_original = result.Rows;

                        this.importableRows    = result.Requests;
                        this.sampleGridHeaders = result.Headers;

                        for (let error of this.errorRows_original) {
                            if (error.columnOrdinal && !error.rowOrdinal) {
                                for (let row of this.rows_original) {
                                    if (!(row["n"+ error.columnOrdinal + "_errorMessage"])) {
                                        row["n"+ error.columnOrdinal + "_errorMessage"] = error.message;
                                    } else {
                                        row["n"+ error.columnOrdinal + "_errorMessage"] = row["n"+ error.columnOrdinal + "_errorMessage"]
                                            + "\n\n"
                                            + error.message;
                                    }
                                }
                            } else if (!error.columnOrdinal && error.rowOrdinal) {
                                for (let row of this.rows_original) {
                                    if (row.rowOrdinal === error.rowOrdinal) {
                                        let i = 0;

                                        while (i < (this.sampleGridHeaders ? this.sampleGridHeaders.length : 0)) {
                                            if (!(row["n"+ i + "_errorMessage"])) {
                                                row["n"+ i + "_errorMessage"] = error.message;
                                            } else {
                                                row["n"+ i + "_errorMessage"] = row["n"+ i + "_errorMessage"]
                                                    + "\n\n"
                                                    + error.message;
                                            }

                                            i++;
                                        }
                                    }
                                }
                            } else if (error.columnOrdinal && error.rowOrdinal) {
                                for (let row of this.rows_original) {
                                    if (row.rowOrdinal === error.rowOrdinal) {
                                        if (!(row["n"+ error.columnOrdinal + "_errorMessage"])) {
                                            row["n"+ error.columnOrdinal + "_errorMessage"] = error.message;
                                        } else {
                                            row["n"+ error.columnOrdinal + "_errorMessage"] = row["n"+ error.columnOrdinal + "_errorMessage"]
                                                + "\n\n"
                                                + error.message;
                                        }
                                    }
                                }
                            } else {
                                // Do nothing
                            }
                        }

                        this.errorRows      = this.errorRows_original;
                        this.rows           = this.rows_original;

                        if (this.sampleGridHeaders) {
                            if (!Array.isArray(this.sampleGridHeaders)) {
                                this.sampleGridHeaders = [this.sampleGridHeaders];
                            }

                            this.sampleGridHeaders.sort((a, b) => {
                                if (!a || !b) {
                                    if (!b) {
                                        return -1;
                                    } else if (!a) {
                                        return 1;
                                    } else {
                                        return 0;
                                    }
                                }

                                return +(a.columnOrdinal) - +(b.columnOrdinal);
                            });
                        }

                        this.dialogService.alert("File uploaded successfully").subscribe(() => {
                            if (this.importableGridApi) {
                                this.assignImportableGridContents();
                                this.importableGridApi.sizeColumnsToFit();
                            }
                        });
                        this.fileParsed = true;
                    } else {
                        this.dialogService.alert("File failed to upload.");
                    }
                });
            } else {
                this.dialogService.startDefaultSpinnerDialog();
                this.sampleUploadService.uploadBulkSampleSheet(formData)
            }
        }
    }

    public openFileChooser() {
        setTimeout(() => {
            if (this.fileInput && this.fileInput.nativeElement) {
                this.fileInput.nativeElement.value = null;
                this.fileInput.nativeElement.click();
            }
        });
    }

    public closeButton() {
        this.dialogRef.close();
    }

    public importSamplesButton(): void {
        if (this.errorRows_original && Array.isArray(this.errorRows_original) && this.errorRows_original.length > 0) {
            let temp: string = '';

            if (this.errorRows_original.length !== 1) {
                temp = "There are "+ this.errorRows_original.length +" errors in the sheet. These errors may result in rows and/or columns being ignored in the spread sheet. Do you wish to continue?"
            } else {
                temp = "There is an error in the sheet. These errors may result in rows and/or columns being ignored in the spread sheet. Do you wish to continue?"
            }

            this.dialogService.yesNoDialog(["Data Skipped Warning", temp], this, "importSamples");
        } else {
            this.importSamples();
        }
    }

    private importSamples(): void {
        if (!this.importSamplesSubscription) {
            this.dialogService.startDefaultSpinnerDialog();

            this.importSamplesSubscription = this.sampleUploadService.importSamplesFromBulkSampleSheet(this.sampleGridHeaders, this.rows_original).subscribe((result) => {
                if (result) {
                    this.finalRequests = result.Requests;
                    this.finalErrors   = result.Errors;

                    if (!this.finalRequests) {
                        this.finalRequests = [];
                    }
                    if (!this.finalErrors) {
                        this.finalErrors = [];
                    }

                    if (!Array.isArray(this.finalRequests)) {
                        this.finalRequests = [ this.finalRequests.Request ];
                    }
                    if (!Array.isArray(this.finalErrors)) {
                        this.finalErrors = [ this.finalErrors.Error ];
                    }

                    this.dialogService.stopAllSpinnerDialogs();

                    this.fileUploaded = true;

                    setTimeout(() => {
                        this.assignFinalErrorGridContents();
                    });
                }
            });
        } else {
            this.sampleUploadService.importSamplesFromBulkSampleSheet(this.sampleGridHeaders, this.rows_original);
        }
    }

    public selectASample(event: any): void {
        // At time of writing, the "onRowSelected" event fires on selection of a row AS WELL as on row deselection.
        // If 'event.node.selected' is true, it should be the node that will be selected.
        if (event && event.node && event.node.selected) {
            this.errorRows = this.errorRows_original.filter((value) => {
                return (value && ((value.columnOrdinal)
                    || (event.node.data && event.node.data.rowOrdinal && event.node.data.rowOrdinal === value.rowOrdinal)));
            });

            this.assignErrorGridContents();
            this.errorBottomGridApi.sizeColumnsToFit();
        }
    }

    public selectAnError(event: any): void {
        // At time of writing, the "onRowSelected" event fires on selection of a row AS WELL as on row deselection.
        // If 'event.node.selected' is true, it should be the node that will be selected.
        if (event && event.node && event.node.selected) {
            this.rows = this.rows_original.filter((value) => {
                return (value && ((event.node.data && event.node.data.columnOrdinal)
                    || (event.node.data && event.node.data.rowOrdinal && event.node.data.rowOrdinal === value.rowOrdinal)));
            });

            this.assignSampleGridContents();
            this.samplesBottomGridApi.sizeColumnsToFit();
        }
    }

    public navigateButton(requestNumber: string) {
        this.gnomexService.navByNumber(requestNumber);
    }


    public assignImportableGridContents() {
        this.importableGridApi.setColumnDefs(this.importedGridColumnDefs);
        this.importableGridApi.setRowData(this.importableRows);
        this.importableGridApi.selectAll();
    }

    public assignErrorGridContents() {
        if (this.errorTopGridApi) {
            this.errorTopGridApi.setColumnDefs(this.errorGridColumnDefs);
            this.errorTopGridApi.setRowData(this.errorRows);
        }
        if (this.errorBottomGridApi) {
            this.errorBottomGridApi.setColumnDefs(this.errorGridColumnDefs);
            this.errorBottomGridApi.setRowData(this.errorRows);
        }

        this.dialogService.stopAllSpinnerDialogs();
    }

    public assignSampleGridContents() {
        if (this.samplesTopGridApi) {
            this.samplesTopGridApi.formGroup = null;
            this.samplesTopGridApi.setColumnDefs(this.samplesGridColumnDefs);
            this.samplesTopGridApi.setRowData(this.rows);
        }
        if (this.samplesBottomGridApi) {
            this.samplesBottomGridApi.formGroup = null;
            this.samplesBottomGridApi.setColumnDefs(this.samplesGridColumnDefs);
            this.samplesBottomGridApi.setRowData(this.rows);
        }

        this.dialogService.stopAllSpinnerDialogs();
    }

    public assignFinalErrorGridContents() {
        if (this.finalErrorsGridApi) {
            this.finalErrorsGridApi.setColumnDefs(this.finalErrorGridColumnDefs);
            this.finalErrorsGridApi.setRowData(this.finalErrors);
        }

        this.dialogService.stopAllSpinnerDialogs();
    }

    public onImportableGridReady(event: any) {
        this.importableGridApi = event.api;

        this.assignImportableGridContents();
        this.onGridSizeChanged(event);

        this.importableGridApi.hideOverlay();
    }

    public onErrorsTopGridReady(event: any) {
        this.errorTopGridApi = event.api;

        this.assignErrorGridContents();
        this.onGridSizeChanged(event);

        this.assignErrorGridContents();

        this.errorTopGridApi.hideOverlay();
    }

    public onErrorsBottomGridReady(event: any) {
        this.errorBottomGridApi = event.api;

        this.assignErrorGridContents();
        this.onGridSizeChanged(event);

        this.assignErrorGridContents();

        this.errorBottomGridApi.hideOverlay();
    }

    public onSamplesTopGridReady(event: any) {
        this.samplesTopGridApi = event.api;

        this.assignSampleGridContents();
        this.onGridSizeChanged(event);

        this.assignSampleGridContents();

        this.samplesTopGridApi.hideOverlay();
    }

    public onSamplesBottomGridReady(event: any) {
        this.samplesBottomGridApi = event.api;

        this.assignSampleGridContents();
        this.onGridSizeChanged(event);

        this.assignSampleGridContents();

        this.samplesBottomGridApi.hideOverlay();
    }

    public onFinalErrorsGridReady(event: any) {
        this.finalErrorsGridApi = event.api;

        this.assignFinalErrorGridContents();
        this.onGridSizeChanged(event);

        this.finalErrorsGridApi.hideOverlay();
    }

    public onGridSizeChanged(event: any) {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }
}