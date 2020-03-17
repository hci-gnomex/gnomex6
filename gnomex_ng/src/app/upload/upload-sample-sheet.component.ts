import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material";
import {Subscription} from "rxjs";

import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {SampleUploadService} from "./sample-upload.service";

import {SelectEditor} from "../util/grid-editors/select.editor";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {SampleSheetColumnFormatsComponent} from "./sample-sheet-column-formats.component";
import {Experiment} from "../util/models/experiment.model";
import {Sample} from "../util/models/sample.model";
import {DictionaryService} from "../services/dictionary.service";
import {GnomexService} from "../services/gnomex.service";
import {MultiSelectRenderer} from "../util/grid-renderers/multi-select.renderer";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {PropertyService} from "../services/property.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";


@Component({
    selector: 'upload-sample-sheet',
    templateUrl: 'upload-sample-sheet.component.html',
    styles: [`

        .hidden { display: none; }
        
        .title {
            background-color: #84b278;
            color: white;
            font-size: larger;
        }
        
        .link-button {
            color: blue;
            text-decoration: underline;
        }
        
        
        .padded { padding: 0.3rem; }
        
        .padded-left-right-bottom {
            padding-top:    0;
            padding-left:   0.3rem;
            padding-right:  0.3rem;
            padding-bottom: 0.3rem;
        }
        
        .bordered { border: solid silver 1px; }

        .no-margin {
            margin: 0;
        }
        
        .no-max-height {
            max-height: none;
        }

        .checkbox-margin-evener {
            margin-top:   0.5rem;
            margin-right: 0.5rem;
        }
        
        .foreground { background-color: white;   }
        .background { background-color: #eeeeee; }
        
        .small-font { font-size:    small; }
        .tiny-font  { font-size: xx-small; }
        
        label.mat-checkbox-layout { margin: 0; margin-bottom: 0; }
        
    `]
}) export class UploadSampleSheetComponent extends BaseGenericContainerDialog implements OnInit, OnDestroy {

    private readonly SUCCESS_STATUS: string = 'SUCCESS';

    @ViewChild('fileInput') fileInput: ElementRef;

    public actionType: any = ActionType ;

    private _firstRowIsColumnHeadings: boolean = true;

    public get firstRowIsColumnHeadings(): boolean {
        return this._firstRowIsColumnHeadings;
    }
    public set firstRowIsColumnHeadings(value: boolean) {
        this._firstRowIsColumnHeadings = value;
        this.assignGridContents();
    }

    private allowedToAddAdditionalSamples: boolean = false;
    public appendSamples: boolean = false;

    public fileParsed:    boolean = false;
    public reportResults: boolean = false;

    public reportText: string = '';

    public experiment: Experiment;

    public file: any;

    private columnChoicesDictionary: any[];
    private headersDictionary: any[];

    private fileData: any[];

    private existingRows: any[];

    private mostRecentRowData: any[];

    private allImportedRowsSucceeded: boolean = true;

    private uploadSubscription: Subscription;

    private gridApi: any;


    private get columnDefinitions(): any[] {
        let columnDefinitions: any[] = [];

        columnDefinitions.push({
            headerName: "Field",
            editable: false,
            width: 150,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "headerName"
        });
        columnDefinitions.push({
            headerName: "Type",
            editable: false,
            width: 100,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            field: "type"
        });
        if (this.firstRowIsColumnHeadings) {
            columnDefinitions.push({
                headerName: "Sample Sheet Column",
                editable: true,
                width: 150,
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.headersDictionary,
                selectOptionsValueField: 'data',
                selectOptionsDisplayField: 'label',
                field: "columnNumber"
            });
        } else {
            columnDefinitions.push({
                headerName: "Sample Sheet Column",
                editable: true,
                width: 150,
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.columnChoicesDictionary,
                selectOptionsValueField: 'data',
                selectOptionsDisplayField: 'label',
                field: "columnNumber"
            });
        }


        return columnDefinitions;
    }


    constructor(private dialogRef: MatDialogRef<UploadSampleSheetComponent>,
                private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private propertyService: PropertyService,
                private sampleUploadService: SampleUploadService,
                @Inject(MAT_DIALOG_DATA) private data) {
        super();
    }

    ngOnInit(): void {
        if(this.data) {
            this.file = this.data.file;
            setTimeout(() => {
                this.onFileSelected();
            });
        }
    }

    ngOnDestroy(): void {
        if (this.uploadSubscription) {
            this.uploadSubscription.unsubscribe();
        }
    }

    private assignGridContents() {
        if (this.gridApi) {
            this.gridApi.setColumnDefs(this.columnDefinitions);

            if (this.data) {
                if (this.data.sampleColumns) {
                    this.mostRecentRowData = this.data.sampleColumns.filter((a) => {
                        if (a.field && a.field === 'ccNumber') {
                            return this.data && !this.data.ccNumberColumnIsCurrentlyHidden;
                        }

                        return a && a.headerName;
                    });

                    for (let row of this.mostRecentRowData) {
                        if (row.cellRendererFramework && row.cellRendererFramework === SelectRenderer) {
                            row.type = 'Dropdown (single sel.)';
                            row.typeCode = 'OPTION';
                        } else if (row.cellRendererFramework && row.cellRendererFramework === MultiSelectRenderer) {
                            row.type = 'Dropdown (multiple sel.)';
                            row.typeCode = 'MOPTION';
                        } else {
                            row.type = 'Text';
                            row.typeCode = 'TEXT';
                        }

                        row.columnNumber = "0";

                        // This is to help with the transition between GNomEx versions 5 and 6, where the display name changed a bit.
                        if (row.headerName && row.headerName.toLowerCase() === 'multiplex group') {
                            for (let entry of this.headersDictionary) {
                                if (entry.label && entry.label.toLowerCase() === 'multiplex #') {
                                    row.columnNumber = entry.data;
                                    break;
                                }
                            }
                        }

                        for (let entry of this.headersDictionary) {
                            if (entry.label && row.headerName && row.headerName.toLowerCase() === entry.label.toLowerCase()) {
                                row.columnNumber = entry.data;
                                break;
                            }
                        }
                    }

                    this.gridApi.setRowData(this.mostRecentRowData);
                }

                if (this.data.experiment && this.data.experiment.samples) {
                    this.experiment = this.data.experiment;
                    this.existingRows = this.data.experiment.samples;
                }

                if (this.data.allowedToAddAdditionalSamples) {
                    this.allowedToAddAdditionalSamples = this.data.allowedToAddAdditionalSamples;
                }
            }


            setTimeout(() => {
                this.gridApi.sizeColumnsToFit();
            });
        }
    }

    public onPopulateFields() {
        let anyColumnsChosen: boolean = false;

        for (let row of this.mostRecentRowData) {
            if (row.columnNumber && row.columnNumber !== '0') {
                anyColumnsChosen = true;
                break;
            }
        }

        if (!anyColumnsChosen) {
            this.dialogService.alert('Please select a column for at least one field to populate', 'No Columns Selected', DialogType.VALIDATION);
            return;
        }

        let tempExisting = (this.existingRows ? this.existingRows.length : 0);
        let tempNew      = (this.fileData ? this.fileData.length : 0) - (this.firstRowIsColumnHeadings ? 1 : 0);

        if (tempExisting !== tempNew) {
            let message: string = '';

            if (tempExisting > tempNew) {
                message = 'The specified sample sheet has fewer rows than there are samples.\n\nIf you continue only the first samples available will be imported.\n\nPlease verify you have chosen the correct sample sheet.\n\nDo you wish to continue?';
            } else if (tempExisting < tempNew) {
                message = 'The specified sample sheet has more rows than there are samples.\n\nThe excess rows in the sample sheet will be added.\n\nPlease verify you have chosen the correct sample sheet.\n\nDo you wish to continue?';
            }

            this.dialogService.confirm( message, "Row/Sample Mismatch").subscribe((result: any) => {
                if(result) {
                    this.populateFieldsWarningPassed();
                } else {
                    this.populateFieldsWarningCancelled();
                }
            });
        } else {
            this.populateFieldsWarningPassed();
        }
    }

    public populateFieldsWarningPassed(): void {
        if (!this.fileData) {
            return;
        }

        this.allImportedRowsSucceeded = true;
        this.reportText = UploadSampleSheetComponent.formatColumns("Row", "SS Col", "Grid Col", "Status");

        let fileRowsStartingIndex: number = 0;

        if (this.firstRowIsColumnHeadings) {
            fileRowsStartingIndex = 1;
        }

        for (let i: number = fileRowsStartingIndex; i < this.fileData.length; i++) {
            for (let column of this.mostRecentRowData) {
                let reportStatus: string = this.SUCCESS_STATUS;
                let writeThisField: boolean = true;
                let columnField: string = column.field;

                let uploadColumnNumberForThisField: number = column.columnNumber - 1; // Removing default, not-real index.

                if (uploadColumnNumberForThisField >= 0
                    && i >= 0
                    && this.fileData[i].Column
                    && Array.isArray(this.fileData[i].Column)
                    && uploadColumnNumberForThisField < this.fileData[i].Column.length) {

                    if (i >= this.fileData.length) {
                        this.fileData.push({});
                    }

                    let uploadColumnValue: string = this.fileData[i].Column[uploadColumnNumberForThisField].Value;

                    if (columnField === 'name') {
                        // Only allow 30 characters for name
                        if (uploadColumnValue) {
                            if (uploadColumnValue.length > 30) {
                                uploadColumnValue = uploadColumnValue.substr(0, 30);
                                reportStatus = "Name.  Truncated to 30 characters.";
                            }
                        }
                    }
                    if (columnField === 'label') {
                        // Special handling for label field -- expect cy3 or cy5
                        if (uploadColumnValue && uploadColumnValue.length > 0 && uploadColumnValue !== 'cy3' && uploadColumnValue !== 'cy5') {
                            writeThisField = false;
                            reportStatus = "Label. Incorrect text: " + uploadColumnValue;
                        }
                    }
                    if (column.typeCode === "URL" || column.typeCode === "MOPTION") {
                        // For these types strip beginning, ending quotation marks if present
                        if (uploadColumnValue && uploadColumnValue.length > 0 && uploadColumnValue.charAt(0) == '"') {
                            uploadColumnValue = uploadColumnValue.substr(1);
                        }
                        if (uploadColumnValue && uploadColumnValue.length > 0 && uploadColumnValue.charAt(uploadColumnValue.length-1) == '"') {
                            uploadColumnValue = uploadColumnValue.substr(0, uploadColumnValue.length - 1);
                        }
                    }
                    if (column.typeCode === "OPTION" && uploadColumnValue && uploadColumnValue.length > 0) {
                        // We assume that columns of this type are using the custom SelectRenderer,
                        // and so have the SelectOptions, selectOptionsValueField and selectOptionsDisplayField
                        // properties in the column definition.

                        let optionFound: boolean = false;

                        uploadColumnValue = uploadColumnValue.trim();

                        if (column.selectOptions
                            && Array.isArray(column.selectOptions)
                            && column.selectOptionsValueField
                            && column.selectOptionsDisplayField) {

                            let filteredOptions: any[] = column.selectOptions.filter((a) => {
                                return a[column.selectOptionsDisplayField] && uploadColumnValue && a[column.selectOptionsDisplayField].toLowerCase() === uploadColumnValue.toLowerCase();
                            });

                            if (filteredOptions.length > 0) {
                                uploadColumnValue = filteredOptions[0][column.selectOptionsValueField];
                                optionFound = true;
                            }
                        }

                        if (!optionFound) {
                            writeThisField = false;
                            reportStatus = 'Dropdown. No selection found for: ' + uploadColumnValue;
                        }
                    }
                    if (column.typeCode === "MOPTION" && uploadColumnValue && uploadColumnValue.length > 0) {
                        let optionsFound: number = 0;
                        let optionsNotFound: number = 0;
                        let constructedValue: string = '';

                        let values: string[] = uploadColumnValue.split(/,/);

                        values = values.filter((a) => {
                            return a.trim().length > 0;
                        });

                        for (let value of values) {
                            value = value.trim();

                            let thisEntryFound = false;

                            for (let option of column.selectOptions) {
                                if (option[column.selectOptionsValueField] && option[column.selectOptionsValueField].toLowerCase() === value.toLowerCase()) {
                                    thisEntryFound = true;
                                    if (optionsFound > 0) {
                                        constructedValue = constructedValue + ',';
                                    }
                                    constructedValue = constructedValue + option[column.selectOptionsValueField];
                                    optionsFound++;
                                    break;
                                }
                            }

                            if (!thisEntryFound) {
                                if (optionsNotFound == 0) {
                                    reportStatus = "Dropdown (multi). No selection found for: " + value;
                                } else {
                                    reportStatus = reportStatus + ', ' + value;
                                }

                                optionsNotFound++;
                            }
                        }

                        if (optionsFound == 0) {
                            writeThisField = false;
                        } else {
                            uploadColumnValue = constructedValue;
                        }
                    }
                    if (column.typeCode === "CHECK" ) {
                        if (uploadColumnValue) {
                            if (uploadColumnValue !== 'Y' && uploadColumnValue !== 'N') {
                                writeThisField = false;
                            }
                        } else {
                            writeThisField = false;
                        }
                    }

                    if (writeThisField) {
                        if (this.firstRowIsColumnHeadings) {
                            if (i > this.existingRows.length) {
                                this.experiment.numberOfSamples = "" + ((+this.experiment.numberOfSamples) + 1);
                                Sample.createNewSamplesForExperiment(this.experiment, this.dictionaryService, this.propertyService, this.gnomexService);
                            }

                            this.existingRows[i - 1][column.field] = uploadColumnValue;
                        } else {
                            if (i >= this.existingRows.length) {
                                this.experiment.numberOfSamples = "" + ((+this.experiment.numberOfSamples) + 1);
                                Sample.createNewSamplesForExperiment(this.experiment, this.dictionaryService, this.propertyService, this.gnomexService);
                            }

                            this.existingRows[i][column.field] = uploadColumnValue;
                        }
                    }

                    this.reportText += UploadSampleSheetComponent.formatColumns(
                        '' + i,
                        '' + (+uploadColumnNumberForThisField + 1),
                        this.fileData[i].Column[uploadColumnNumberForThisField].Value,
                        reportStatus
                    );

                    if (reportStatus !== this.SUCCESS_STATUS) {
                        this.allImportedRowsSucceeded = false;
                    }
                }

                if (uploadColumnNumberForThisField >= 0
                    && i >= 0
                    && this.fileData[i].Column
                    && Array.isArray(this.fileData[i].Column)
                    && uploadColumnNumberForThisField >= this.fileData[i].Column.length) {

                    if (this.allowedToAddAdditionalSamples) {
                        this.existingRows.push({});
                    } else {
                        break;
                    }
                }
            }
        }

        if (this.allImportedRowsSucceeded) {
            this.uploadComplete();
        } else {
            this.reportResults = true;
        }
    }

    public static formatColumns(Row: string, SS_Col: string, Grid_Col: string, Status: string): string {
        return ''
            + UploadSampleSheetComponent.addWhitespace(Row, 5)
            + UploadSampleSheetComponent.addWhitespace(SS_Col, 8)
            + UploadSampleSheetComponent.addWhitespace(Grid_Col,24)
            + UploadSampleSheetComponent.addWhitespace(Status, 60) + "\n";
    }

    public static addWhitespace(inputStr: string, count: number): string {
        let output: string = "";

        if (inputStr != null) {
            if(inputStr.length > count) {
                inputStr = inputStr.substr(0, count-3) + "..";
            }
            output = inputStr;
            if(output.length < count) {
                // Fill in any remaining spaces between end of string and count
                for (let i: number = 0; i < count - inputStr.length; i++ ) {
                    output += " ";
                }
            }
        }

        return output;
    }

    public uploadComplete(): void {
        this.dialogRef.close(this.existingRows);
    }

    public populateFieldsWarningCancelled(): void {
        this.dialogService.alert('No samples have been imported.', null, DialogType.WARNING);

        this.dialogRef.close();
    }


    public onFileSelected(event?: any): void {
        if(event) {
            this.file = null;
            if (event.target.files && event.target.files.length > 0) {
                this.file = event.target.files[0];
            }
        }

        if(this.file) {

            let formData: FormData = new FormData();
            formData.append("filename", this.file.name);
            formData.append("filetype", this.file.type === "text/html" ? "html" : "text");
            formData.append("value", this.file, this.file.name);

            if (!this.uploadSubscription) {
                this.dialogService.startDefaultSpinnerDialog();

                this.uploadSubscription = this.sampleUploadService.uploadSampleSheet(formData).subscribe((result) => {
                    this.dialogService.stopAllSpinnerDialogs();

                    if (!!result) {
                        if (!result.ColumnSelector) {
                            result.ColumnSelector = [];
                        }

                        this.columnChoicesDictionary = result.ColumnSelector;

                        this.headersDictionary = [{
                            label: 'Click here to select column',
                            data:  '0'
                        }];

                        if (result.SampleSheetData
                            && Array.isArray(result.SampleSheetData)
                            && result.SampleSheetData.length > 0
                            && result.SampleSheetData[0].Column) {
                                if(Array.isArray(result.SampleSheetData[0].Column)) {
                                    for (let item of result.SampleSheetData[0].Column) {
                                        let temp: any = {
                                            label: item.Value,
                                            data:  item.Name
                                        };
                                        this.headersDictionary.push(temp);
                                    }
                                } else {
                                    this.dialogService.alert("File failed to upload.", null, DialogType.FAILED);
                                    return;
                                }
                        }


                        if (!result.SampleSheetData) {
                            result.SampleSheetData = [];
                        }
                        if (!Array.isArray(result.SampleSheetData)) {
                            result.SampleSheetData = [ result.SampleSheetData.Row ];
                        }

                        this.fileData = result.SampleSheetData;
                        this.assignGridContents();
                        this.fileParsed = true;
                    } else {
                        this.dialogService.alert("File failed to upload.", null, DialogType.FAILED);
                    }
                });
            } else {
                this.dialogService.startDefaultSpinnerDialog();
                this.sampleUploadService.uploadSampleSheet(formData);
            }
        }
    }

    public openFileChooser(): void {
        setTimeout(() => {
            if (this.fileInput && this.fileInput.nativeElement) {
                this.fileInput.nativeElement.value = null;
                this.fileInput.nativeElement.click();
            }
        });
    }


    public onFieldFormats(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = '75em';
        config.height = '35em';
        config.autoFocus = false;

        this.dialogService.genericDialogContainer(SampleSheetColumnFormatsComponent, "Sample Sheet Column Formats", null, config,
            {actions: [
                    {type: ActionType.SECONDARY, name: "OK", internalAction: "onClose"}
                ]});
    }


    public onGridReady(event: any) {
        this.gridApi = event.api;
        this.assignGridContents();

        this.gridApi.hideOverlay();
    }

    public onGridSizeChanged(event: any) {
        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }

    public onClose(): void {
        this.dialogRef.close();
    }
}
