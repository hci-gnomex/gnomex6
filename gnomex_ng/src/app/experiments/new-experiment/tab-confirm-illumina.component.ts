import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";

import {DictionaryService} from "../../services/dictionary.service";
import {GnomexService} from "../../services/gnomex.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {BillingService} from "../../services/billing.service";

import {Experiment} from "../../util/models/experiment.model";
import {BehaviorSubject, Subscription} from "rxjs/index";
import {ExperimentsService} from "../experiments.service";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignRightMiddleRenderer} from "../../util/grid-renderers/text-align-right-middle.renderer";
import {TabSamplesIlluminaComponent} from "./tab-samples-illumina.component";
import {AnnotationService} from "../../services/annotation.service";
import {TabSampleSetupViewComponent} from "./tab-sample-setup-view.component";
import {DialogsService} from "../../util/popup/dialogs.service";
import {TextAlignRightMiddleEditor} from "../../util/grid-editors/text-align-right-middle.editor";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {TextAlignLeftMiddleEditor} from "../../util/grid-editors/text-align-left-middle.editor";
import {UserPreferencesService} from "../../services/user-preferences.service";
import {GridApi} from "ag-grid-community";
import {NewExternalExperimentService} from "../../services/new-external-experiment.service";
import {ConstantsService} from "../../services/constants.service";
import {PropertyService} from "../../services/property.service";

@Component({
    selector: "tabConfirmIllumina",
    templateUrl: "./tab-confirm-illumina.component.html",
    styles: [`
        

        .no-height { height: 0;  }
        .single-em { width: 1em; }

        .multiline-strings { white-space: pre-line; }
        
        .bordered { border: solid silver 1px; }
        
        .heavily-left-padded { padding-left: 1.5em; }
        .heavily-right-padded { padding-right: 1.5em; }
        
        .moderate-width {
            width: 5em;
            min-width: 5em;
        }
        
        
        .wide-display {
            min-width: 15em;
            width: 15%;
        }
        
        
        .t  { display: table;      }
        .tr { display: table-row;  }
        .td { display: table-cell; }
        
        .right-align { text-align: right; }
        
        
        .top-margin { margin-top: 0.3em; }
        
        .minimal { width: fit-content; }
        
        .instructions-background {
            background-color: lightyellow;
        }
        
        .minheight { min-height: 3em; }
        
        .font-bold { font-weight: bold; }
        
        
    `]
})

export class TabConfirmIlluminaComponent implements OnInit, OnDestroy {

    @Input("experiment") public set experiment(value: Experiment) {
        this._experiment = value;
        if (value.RequestProperties && !this._experimentAnnotations) {
            this._experimentAnnotations = value.RequestProperties;
        }

        this.recalculateShowGenerateQuote();
    }

    private _isAmendState: boolean = false;
    @Input('isAmendState') public set isAmendState(value: boolean) {
        this._isAmendState = value;
    }
    public get isAmendState(): boolean {
        return this._isAmendState;
    }

    @Input("getExperimentAnnotationsSubject") public set getExperimentAnnotationsSubject(subject: BehaviorSubject<any>) {
        this._getExperimentAnnotationsSubject = subject;
    }
    @Input("experimentAnnotations") public set experimentAnnotations(subject: BehaviorSubject<any[]>) {
        if (!this.experimentAnnotationsSubscription && subject) {
            this.experimentAnnotationsSubscription = subject.asObservable().subscribe((value: any[]) => {
                this._experimentAnnotations = value;
            });
        }
    }

    @Input("agreeCheckboxLabelSubject") set agreeCheckboxLabelSubject(subject: BehaviorSubject<string>) {
        this.agreeCheckboxLabel_subject = subject;
    }

    @Input("requestCategory") set requestCategory(requestCategory: any) {
        setTimeout(() => {
            this.useMultiplexLanes = requestCategory
                && requestCategory.isIlluminaType
                && requestCategory.isIlluminaType === 'Y'
                && this.experiment
                && this.experiment.isExternal !== 'Y';

            this.showRowNumberColumn = requestCategory
                && requestCategory.isQCType
                && requestCategory.isQCType !== 'Y';

            let temp = this.propertyService.getProperty(PropertyService.PROPERTY_ESTIMATED_PRICE_WARNING, this._experiment.idCoreFacility, this._experiment.codeRequestCategory);
            this._estimatedChargesWarning = temp && temp.propertyValue ? temp.propertyValue : '';

            this.recalculateShowGenerateQuote();
        });
    }


    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    public get experiment(): Experiment {
        return this._experiment;
    }

    public get showGenerateQuote(): boolean {
        return this._showGenerateQuote;
    }

    private _showGenerateQuote: boolean = false;

    private _experiment: Experiment;
    public  _experimentAnnotations: any[];

    private _getExperimentAnnotationsSubject: BehaviorSubject<any>;

    private agreeCheckboxLabel_subject: BehaviorSubject<string>;

    public form: FormGroup;

    private clientPrepString: string = "Library Prepared By Client";
    private clientPrepLib: boolean;
    private seqLaneTypeLabel: string;
    private gridApi: GridApi;
    private columnApi: any;
    private samplesGridConfirmColumnDefs: any;
    private requestPropsColumnDefs: any;
    private organisms: any[] = [];

    private isCheckboxChecked: boolean;
    private disable_agreeCheckbox: boolean;
    private useMultiplexLanes: boolean;
    private showRowNumberColumn: boolean = true;

    private requestPropBox: boolean;
    public billingItems: any[] = [];

    private _barCodes: any[] = [];

    private columnProperties: any[] = [];

    private sampleTypes: any[] = [];

    private bioanalyzerChips: any[] = [];

    private experimentAnnotationsSubscription: Subscription;


    public totalEstimatedCharges: string = '$-.--';
    private _estimatedChargesWarning: string = '';

    private tabIndexToInsertAnnotations: number;

    private emToPxConversionRate: number = 13;

    private propertyList: any[];
    private sequenceLanes: any[];


    public get estimatedChargesWarning(): string {
        return this._estimatedChargesWarning ? this._estimatedChargesWarning : '';
    }

    public get labName(): string {
        if (this._experiment && this._experiment._labName_notReturned) {
            return this._experiment._labName_notReturned;
        } else {
            return '';
        }
    }

    public get billingAccountName(): string {
        return this._experiment ? this._experiment.billingAccountName : "";
    }
    public set billingAccountName(value: string) {
        this._experiment.billingAccountName = value;
    }

    public get billingAccountNumber(): string {
        return this._experiment.billingAccountNumber;
    }
    public set billingAccountNumber(value: string) {
        this._experiment.billingAccountNumber = value;
    }


    public get showExperimentDescription(): boolean {
        return true;
    }
    public get showNotesForCoreFacility(): boolean {
        return true;
    }


    constructor(private annotationService: AnnotationService,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                private experimentService: ExperimentsService,
                private gnomexService: GnomexService,
                private billingService: BillingService,
                private fb: FormBuilder,
                private propertyService: PropertyService,
                public constantService: ConstantsService,
                public prefService: UserPreferencesService) {

        this.requestPropsColumnDefs = [
            {
                headerName: "",
                field: "name",
                width: 100,
            },
            {
                headerName: "",
                field: "value",
                width: 100,
            }
        ];

        this.annotationService.getPropertyList().subscribe((result) => {
            this.propertyList = result;
            this.buildColumnDefinitions();
        });

        this.organisms = this.dictionaryService.getEntries("hci.gnomex.model.OrganismLite");
    }

    ngOnInit() {
        this.loadBarcodes();
        this.loadSampleTypes();

        this.form = this.fb.group({});
    }

    ngOnDestroy() {
        if (this.experimentAnnotationsSubscription) {
            this.experimentAnnotationsSubscription.unsubscribe();
        }
    }

    private buildColumnDefinitions(): void {
        for(let sample of this._experiment.samples) {
            if (sample.ccNumber) {
                this._experiment.hasCCNumber = "Y";
                break;
            }
        }

        if (this.useMultiplexLanes) {
            this.buildMultiplexLaneColumnDefinitions();
        } else {
            this.buildNonmultiplexLaneColumnDefinitions();
        }
    }

    private buildMultiplexLaneColumnDefinitions(): void {
        this.columnProperties = [];
        this.columnProperties = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.COLUMN_PROPERTIES);

        if (this.columnProperties) {
            this.columnProperties = this.columnProperties.filter((a) => {
                return a.codeRequestCategory === this._experiment.codeRequestCategory;
            });
        } else {
            this.columnProperties = [];
        }

        let temp: any[] = [];

        temp.push({
            headerName: "Multiplex Group #",
            editable: false,
            field: "multiplexGroupNumber",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            width:    10 * this.emToPxConversionRate,
            minWidth: 10 * this.emToPxConversionRate,
            maxWidth: 12 * this.emToPxConversionRate,
            sortOrder: 5
        });
        temp.push({
            headerName: "Sample ID",
            field: "sampleId",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            width:    6 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
            maxWidth: 8 * this.emToPxConversionRate,
            editable: false,
            sortOrder: 10
        });
        temp.push({
            headerName: "Sample Name",
            field: "name",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            width:    8 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            maxWidth: 10 * this.emToPxConversionRate,
            editable: false,
            sortOrder: 15
        });


        for (let columnProperty of this.columnProperties) {

            if (columnProperty.showInNewSummaryMode && columnProperty.showInNewSummaryMode === 'Y') {
                let editable: boolean = false;
                let showFillButton: boolean = columnProperty.showFillButton && columnProperty.showFillButton === 'Y';

                let newColumn: any = {
                    headerName: columnProperty.header,
                    field: columnProperty.field,
                    width: (+columnProperty.width) * this.emToPxConversionRate,
                    minWidth: (+columnProperty.minWidth) * this.emToPxConversionRate,
                    maxWidth: (+columnProperty.maxWidth) * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: editable,

                    showFillButton: showFillButton,
                    fillGroupAttribute: columnProperty.fillGroupAttribute,
                    sortOrder: columnProperty.sortOrder
                };

                switch(columnProperty.columnType) {
                    case TabSamplesIlluminaComponent.TEXT_RIGHT:
                        newColumn.cellRendererFramework = TextAlignRightMiddleRenderer;
                        newColumn.cellEditorFramework   = TextAlignRightMiddleEditor;
                        break;
                    case TabSamplesIlluminaComponent.OPTION:
                        newColumn.cellRendererFramework = SelectRenderer;
                        newColumn.cellEditorFramework   = SelectEditor;

                        if (columnProperty.nameFrontEndDictionaryToUse) {
                            newColumn.selectOptions = this['' + columnProperty.nameFrontEndDictionaryToUse];
                        } else if (columnProperty.fullDictionaryModelPathToLoad) {
                            newColumn.selectOptions = this.dictionaryService.getEntries('' + columnProperty.fullDictionaryModelPathToLoad);
                        } else {
                            newColumn.selectOptions = [];
                        }

                        newColumn.selectOptionsDisplayField = columnProperty.nameField ? columnProperty.nameField : "display";
                        newColumn.selectOptionsValueField   = columnProperty.valueField ? columnProperty.valueField : "value";
                        break;
                    // case TabSamplesIlluminaComponent.MULTIOPTION:
                    //     break;

                    case TabSamplesIlluminaComponent.TEXT:
                        newColumn.cellRendererFramework = TextAlignLeftMiddleRenderer;
                        newColumn.cellEditorFramework   = TextAlignLeftMiddleEditor;
                        break;
                    default:
                        newColumn.cellRendererFramework = TextAlignLeftMiddleRenderer;
                        newColumn.cellEditorFramework   = TextAlignLeftMiddleEditor;
                }

                temp.push(newColumn);
            }
        }

        if (this._experiment.hasCCNumber === "Y") {
            temp.push({
                headerName: "CC Number",
                field: "ccNumber",
                width: 9 * this.emToPxConversionRate,
                minWidth: 8 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
            });
        }

        if (this._experiment
            && this._experiment.seqPrepByCore_forSamples
            && this._experiment.seqPrepByCore_forSamples === 'N') {

            temp.push({
                headerName: "Index Tag A",
                editable: false,
                width:    12 * this.emToPxConversionRate,
                minWidth: 12 * this.emToPxConversionRate,
                maxWidth: 20 * this.emToPxConversionRate,
                field: "idOligoBarcode",
                cellRendererFramework: SelectRenderer,
                selectOptions: this._barCodes,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOligoBarcode",
                indexTagLetter: 'A',
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Index Tag A required'}
                ]
            });
            temp.push({
                headerName: "Index Tag Sequence A",
                field: "barcodeSequence",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 6.5 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false
            });
            if (!this.isAmendState) {
                temp.push({
                    headerName: "Index Tag B",
                    editable: false,
                    width:    12 * this.emToPxConversionRate,
                    minWidth: 12 * this.emToPxConversionRate,
                    maxWidth: 20 * this.emToPxConversionRate,
                    field: "idOligoBarcodeB",
                    cellRendererFramework: SelectRenderer,
                    selectOptions: this._barCodes,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "idOligoBarcodeB",
                    indexTagLetter: 'B'
                });
                temp.push({
                    headerName: "Index Tag Sequence B",
                    field: "barcodeSequenceB",
                    width:    7 * this.emToPxConversionRate,
                    minWidth: 6.5 * this.emToPxConversionRate,
                    maxWidth: 9 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                });
            }
        }

        this.tabIndexToInsertAnnotations = 150;

        temp.push({
            headerName: "# Seq Lanes",
            field: "numberSequencingLanes",
            width:    6 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
            maxWidth: 8 * this.emToPxConversionRate,
            editable: false,
            sortOrder: 200
        });

        if (this._experiment) {
            for (let sampleAnnotation of this._experiment.getSelectedSampleAnnotations()) {
                let fullProperty = this.propertyList.filter((value: any) => {
                    return value.idProperty === sampleAnnotation.idProperty;
                });

                if (fullProperty && Array.isArray(fullProperty) && fullProperty.length > 0) {
                    TabSamplesIlluminaComponent.addColumnToColumnDef(temp, fullProperty[0], false, this.tabIndexToInsertAnnotations, this.emToPxConversionRate, TabSamplesIlluminaComponent.STATE_NEW, true);
                }
            }
        }

        temp = TabSamplesIlluminaComponent.sortColumns(temp);

        this.samplesGridConfirmColumnDefs = temp;
    }

    private buildNonmultiplexLaneColumnDefinitions(): void {
        this.columnProperties = [];
        this.columnProperties = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.COLUMN_PROPERTIES);

        if (this.columnProperties) {
            this.columnProperties = this.columnProperties.filter((a) => {
                return a.codeRequestCategory === this._experiment.codeRequestCategory;
            });
        } else {
            this.columnProperties = [];
        }

        let temp: any[] = [];

        if (this.showRowNumberColumn) {
            temp.push({
                headerName: "",
                field: "index",
                width:    4 * this.emToPxConversionRate,
                maxWidth: 4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                cellRendererFramework: TextAlignRightMiddleRenderer,
                suppressSizeToFit: true,
                pinned: "left",
                sortOrder: 5
            });
        }
        temp.push({
            headerName: "Sample Name",
            field: "name",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            width:    8 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            maxWidth: 10 * this.emToPxConversionRate,
            editable: false,
            sortOrder: 15
        });

        let isExternal: boolean = this.experiment && this.experiment.isExternal === 'Y';

        for (let columnProperty of this.columnProperties) {

            if (columnProperty.showInNewSummaryMode && columnProperty.showInNewSummaryMode === 'Y') {
                if (isExternal && columnProperty.showForExternal === 'N') {
                    continue;
                }

                let editable: boolean = false;
                let showFillButton: boolean = columnProperty.showFillButton && columnProperty.showFillButton === 'Y';

                let newColumn: any = {
                    headerName: columnProperty.header,
                    field: columnProperty.field,
                    width: (+columnProperty.width) * this.emToPxConversionRate,
                    minWidth: (+columnProperty.minWidth) * this.emToPxConversionRate,
                    maxWidth: (+columnProperty.maxWidth) * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: editable,

                    showFillButton: showFillButton,
                    fillGroupAttribute: columnProperty.fillGroupAttribute,
                    sortOrder: columnProperty.sortOrder
                };

                switch(columnProperty.columnType) {
                    case TabSamplesIlluminaComponent.TEXT_RIGHT:
                        newColumn.cellRendererFramework = TextAlignRightMiddleRenderer;
                        newColumn.cellEditorFramework   = TextAlignRightMiddleEditor;
                        break;
                    case TabSamplesIlluminaComponent.OPTION:
                        newColumn.cellRendererFramework = SelectRenderer;
                        newColumn.cellEditorFramework   = SelectEditor;

                        if (columnProperty.nameFrontEndDictionaryToUse) {
                            newColumn.selectOptions = this['' + columnProperty.nameFrontEndDictionaryToUse];
                        } else if (columnProperty.fullDictionaryModelPathToLoad) {
                            newColumn.selectOptions = this.dictionaryService.getEntries('' + columnProperty.fullDictionaryModelPathToLoad);
                        } else {
                            newColumn.selectOptions = [];
                        }

                        newColumn.selectOptionsDisplayField = columnProperty.nameField ? columnProperty.nameField : "display";
                        newColumn.selectOptionsValueField   = columnProperty.valueField ? columnProperty.valueField : "value";
                        break;
                    // case TabSamplesIlluminaComponent.MULTIOPTION:
                    //     break;

                    case TabSamplesIlluminaComponent.TEXT:
                        newColumn.cellRendererFramework = TextAlignLeftMiddleRenderer;
                        newColumn.cellEditorFramework   = TextAlignLeftMiddleEditor;
                        break;
                    default:
                        newColumn.cellRendererFramework = TextAlignLeftMiddleRenderer;
                        newColumn.cellEditorFramework   = TextAlignLeftMiddleEditor;
                }

                temp.push(newColumn);
            }
        }

        if(this._experiment.hasCCNumber === "Y") {
            temp.push({
                headerName: "CC Number",
                field: "ccNumber",
                width: 9 * this.emToPxConversionRate,
                minWidth: 8 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
            });
        }

        if (this._experiment
            && this._experiment.seqPrepByCore_forSamples
            && this._experiment.seqPrepByCore_forSamples === 'N') {

            temp.push({
                headerName: "Index Tag A",
                editable: false,
                width:    12 * this.emToPxConversionRate,
                minWidth: 12 * this.emToPxConversionRate,
                maxWidth: 20 * this.emToPxConversionRate,
                field: "idOligoBarcode",
                cellRendererFramework: SelectRenderer,
                selectOptions: this._barCodes,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOligoBarcode",
                indexTagLetter: 'A',
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Index Tag A required'}
                ]
            });
            temp.push({
                headerName: "Index Tag Sequence A",
                field: "barcodeSequence",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 6.5 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false
            });
            temp.push({
                headerName: "Index Tag B",
                editable: false,
                width:    12 * this.emToPxConversionRate,
                minWidth: 12 * this.emToPxConversionRate,
                maxWidth: 20 * this.emToPxConversionRate,
                field: "idOligoBarcodeB",
                cellRendererFramework: SelectRenderer,
                selectOptions: this._barCodes,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOligoBarcodeB",
                indexTagLetter: 'B'
            });
            temp.push({
                headerName: "Index Tag Sequence B",
                field: "barcodeSequenceB",
                width:    7 * this.emToPxConversionRate,
                minWidth: 6.5 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
        }

        this.tabIndexToInsertAnnotations = 150;

        if (this._experiment) {
            for (let sampleAnnotation of this._experiment.getSelectedSampleAnnotations()) {
                let fullProperty = this.propertyList.filter((value: any) => {
                    return value.idProperty === sampleAnnotation.idProperty;
                });

                if (fullProperty && Array.isArray(fullProperty) && fullProperty.length > 0) {
                    TabSamplesIlluminaComponent.addColumnToColumnDef(temp, fullProperty[0], false, this.tabIndexToInsertAnnotations, this.emToPxConversionRate, TabSamplesIlluminaComponent.STATE_NEW, true);
                }
            }
        }

        temp = TabSamplesIlluminaComponent.sortColumns(temp);

        this.samplesGridConfirmColumnDefs = temp;
    }

    public tabDisplayed(): void {
        if (this.isAmendState) {
            this.prepareAmendSequenceLanes();
        } else if (!this._experiment.sequenceLanes || this._experiment.sequenceLanes.length === 0) {
            this._experiment.replaceAllSequenceLanes();
        }

        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this.bioanalyzerChips = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BIOANALYZER_CHIP_TYPE);

        if (this.bioanalyzerChips && Array.isArray(this.bioanalyzerChips)) {
            this.bioanalyzerChips = this.bioanalyzerChips.filter((a) => {
                return a.codeApplication && this._experiment.codeApplication;
            });
        }

        this.buildColumnDefinitions();

        if (this._getExperimentAnnotationsSubject) {
            this._getExperimentAnnotationsSubject.next({});
        }
        this.setUpView();

        this.gridApi.setColumnDefs(this.samplesGridConfirmColumnDefs);
        this.gridApi.setRowData(this.sequenceLanes);
        this.gridApi.sizeColumnsToFit();
    }

    private loadBarcodes(): void {
        this._barCodes = [];

        let allBarcodes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
        for (let code of allBarcodes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this._barCodes.push(code);
        }
    }

    private setUpView() {
        this.getEstimatedBilling();
        this.getSequenceLanes();

        this.clientPrepLib = false;

        if (this._experiment.samples
            && Array.isArray(this._experiment.samples)
            && this._experiment.samples.length > 0) {

            let s1 = this._experiment.samples[0];

            let nsca: any = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(nsca2 =>
                nsca2.value != "" && nsca2.idSampleType === s1.idNumberSequencingCyclesAllowed
            );

            this.seqLaneTypeLabel = nsca.display;

            if (s1.seqPrepByCore === 'N') {
                this.clientPrepLib = true;

                this.clientPrepString = "Library Prepared By Client";
                if (this._experiment.hasPrePooledLibraries === 'Y' && this._experiment.numPrePooledTubes != null && this._experiment.numPrePooledTubes != '') {
                    this.clientPrepString += ", " + this._experiment.numPrePooledTubes + " Pre-Pooled Tubes";
                }
            }
        }

        this.requestPropBox = this.gnomexService.getCoreFacilityProperty(this._experiment.idCoreFacility, this.gnomexService.PROPERTY_REQUEST_PROPS_ON_CONFIRM_TAB) === 'Y';
    }

    private getEstimatedBilling(): void {
        this.disable_agreeCheckbox = true;
        this.isCheckboxChecked = false;

        if (this._experiment) {
            if (this._experiment.isExternal === 'Y') {
                // This is an external experiment submission.  Don't attempt to get estimated charges.
                this.totalEstimatedCharges = '$-.--';
                this.billingItems = [];
            } else {
                let accountName:String = "";

                if (this._experiment.billingAccount != null) {
                    accountName = this._experiment.billingAccount.accountNumberDisplay;
                } else if (this.experiment.accountNumberDisplay) {
                    accountName = this.experiment.accountNumberDisplay;
                }

                this.agreeCheckboxLabel_subject.next("I authorize all charges to be billed to account(s): " + accountName);
                this.disable_agreeCheckbox = false;

                // This is a new experiment request. Get the estimated charges for this request.

                let propertiesXML = JSON.stringify(this._experimentAnnotations);

                this.dialogsService.startDefaultSpinnerDialog();
                this.totalEstimatedCharges = "Calculating...";

                this.billingService.createBillingItems(propertiesXML, this._experiment).subscribe((response: any) => {

                    this.dialogsService.stopAllSpinnerDialogs();

                    if (!response || !response.Request) {
                        return;
                    }

                    if (response.Request.invoicePrice && ('' + response.Request.invoicePrice).match(/^.[\d,]+\.\d{2}$/)) {
                        this.totalEstimatedCharges = response.Request.invoicePrice;
                    }

                    this.billingItems = [];

                    if (response.Request.BillingItem){
                        if (Array.isArray(response.Request.BillingItem)) {
                            this.billingItems = response.Request.BillingItem
                        } else {
                            this.billingItems = [response.Request.BillingItem];
                        }
                    }
                });
            }
        }
    }

    private getSequenceLanes(): void {
        if (this.experiment.isExternal === 'Y' || this.isAmendState) {
            let lanes = [];
            for (let index = 0; index < this.experiment.samples.length; index++) {
                let lane: any = this.experiment.samples[index].getJSONObjectRepresentation();
                lane.sampleId = "X" + (index + 1);
                lanes.push(lane);
            }
            this.sequenceLanes = lanes;
            this.gridApi.setRowData(this.sequenceLanes);
        } else if (this.useMultiplexLanes) {
            this.experimentService.getMultiplexLaneList(this._experiment).subscribe((response: any) => {
                if (!response || !(Array.isArray(response) || response.MultiplexLane)) {
                    return;
                }

                let multiplexLanes: any[] = [];

                if (Array.isArray(response)) {
                    multiplexLanes = response;
                } else {
                    multiplexLanes = [response.MultiplexLane];
                }

                let sequenceLanes = [];
                let sampleNumber: number = 0;

                for (let sample of this._experiment.samples) {
                    let lane = sample.getJSONObjectRepresentation();
                    lane.sampleId = "X" + ++sampleNumber;
                    sequenceLanes.push(lane);
                }

                this.sequenceLanes = sequenceLanes;
                this.gridApi.setRowData(this.sequenceLanes);
            });
        } else {
            let sampleNumber: number = 0;
            let sequenceLanes = [];

            for (let sample of this._experiment.samples) {
                let lane = sample.getJSONObjectRepresentation();
                lane.sampleId = "X" + ++sampleNumber;
                sequenceLanes.push(lane);
            }

            this.sequenceLanes = sequenceLanes;
            this.gridApi.setRowData(this.sequenceLanes);
        }
    }

    private loadSampleTypes(): void {
        let types: any[] = [];

        for (let sampleType of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.SampleType")) {
            if (sampleType.isActive === 'N'
                || (sampleType.codeNucleotideType !== "RNA" && sampleType.codeNucleotideType !== "DNA")) {

                continue;
            }

            let requestCategories = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.SampleTypeRequestCategory").filter(sampleRequestCategory =>
                sampleRequestCategory.value !== "" && sampleRequestCategory.idSampleType === sampleType.value
            );

            for (let requestCategory of requestCategories) {
                if (this._experiment && requestCategory.codeRequestCategory === this._experiment.codeRequestCategory) {
                    types.push(sampleType);
                }
            }
        }

        this.sampleTypes = types.sort(TabSampleSetupViewComponent.sortSampleTypes);
    }

    public displayAnnotationValue(annotation: any): string {
        if (annotation && annotation.codePropertyType) {
            switch (annotation.codePropertyType) {
                case 'TEXT'    : return annotation.value ? annotation.value : '';
                case 'OPTION'  :
                case 'MOPTION' :
                    let temp: string = '';

                    if (annotation.PropertyOption && Array.isArray(annotation.PropertyOption) && annotation.PropertyOption.length > 0) {
                        for (let option of annotation.PropertyOption) {
                            if (option.name && option.selected && option.selected === 'Y') {
                                temp += option.name + '\n';
                            }
                        }

                    }

                    return temp;
            }
        }
    }

    public onClickPriceQuote(event?: any) {
        this.experimentService.showPriceQuote(this._experiment);
    }

    public onGridReady(params: any): void {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this.gridApi.setColumnDefs(this.samplesGridConfirmColumnDefs);
        this.gridApi.setRowData(this.sequenceLanes);
        this.gridApi.sizeColumnsToFit();
    }

    private prepareAmendSequenceLanes(): void {
        if (this.experiment && this.experiment.samples && this.experiment.sequenceLanes) {
            // Remove existing "dummy" sequence lanes if the samples grid has changed
            let seqLanesToRemove: any[] = [];
            for (let seqLane of this.experiment.sequenceLanes) {
                if (seqLane.idSequenceLane === "SequenceLane") {
                    seqLanesToRemove.push(seqLane);
                }
            }
            for (let seqLaneToRemove of seqLanesToRemove) {
                this.experiment.sequenceLanes.splice(this.experiment.sequenceLanes.indexOf(seqLanesToRemove), 1);
            }

            // Add "dummy" sequence lane for each sample that will be re-sequenced
            for (let sample of this.experiment.samples) {
                if (sample.numberSequencingLanes) {
                    let additionalSequencingNumber: number = parseInt(sample.numberSequencingLanes);
                    for (let i = 0; i < additionalSequencingNumber; i++) {
                        this.experiment.sequenceLanes.push(sample.createSequenceLane());
                    }
                }
            }
        }
    }

    private recalculateShowGenerateQuote(): void {
        if (this._experiment && this._experiment.idCoreFacility && this._experiment.codeRequestCategory) {
            let temp = this.propertyService.getProperty(PropertyService.PROPERTY_ALLOW_PRICE_QUOTE, this._experiment.idCoreFacility, this._experiment.codeRequestCategory);
            this._showGenerateQuote = temp && temp.propertyValue && temp.propertyValue === 'Y';
        } else {
            this._showGenerateQuote = false;
        }
    }
}
