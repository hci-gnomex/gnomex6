import {Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
import {MatCheckbox, MatDialog, MatDialogConfig} from "@angular/material";
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

import {BehaviorSubject, Subscription} from "rxjs";

import {DictionaryService} from "../../services/dictionary.service";
import {ConstantsService} from "../../services/constants.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {TextAlignLeftMiddleEditor} from "../../util/grid-editors/text-align-left-middle.editor";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {GnomexService} from "../../services/gnomex.service";
import {UploadSampleSheetComponent} from "../../upload/upload-sample-sheet.component";
import {BarcodeSelectEditor} from "../../util/grid-editors/barcode-select.editor";
import {annotType, PropertyService} from "../../services/property.service";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {UrlAnnotEditor} from "../../util/grid-editors/url-annot-editor";
import {UrlAnnotRenderer} from "../../util/grid-renderers/url-annot-renderer";
import {MultiSelectRenderer} from "../../util/grid-renderers/multi-select.renderer";
import {MultiSelectEditor} from "../../util/grid-editors/multi-select.editor";
import {TabSampleSetupViewComponent} from "./tab-sample-setup-view.component";
import {TextAlignRightMiddleRenderer} from "../../util/grid-renderers/text-align-right-middle.renderer";
import {Experiment} from "../../util/models/experiment.model";
import {Sample} from "../../util/models/sample.model";
import {AnnotationService} from "../../services/annotation.service";
import {TextAlignRightMiddleEditor} from "../../util/grid-editors/text-align-right-middle.editor";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {LinkButtonRenderer} from "../../util/grid-renderers/link-button.renderer";
import {GridApi, SelectionChangedEvent} from "ag-grid-community";
import {SampleUploadService} from "../../upload/sample-upload.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {CORELinkageService} from "../../services/CORE-linkage.service";
import {CoreSampleSelectorComponent} from "./core-sample-selector.component";
import {ImprovedSelectRenderer} from "../../util/grid-renderers/improved-select.renderer";
import {ImprovedSelectEditor} from "../../util/grid-editors/improved-select.editor";

@Component({
    selector: "tab-samples-illumina",
    templateUrl: "./tab-samples-illumina.component.html",
    styles: [`
        .no-height { height: 0;  }
        .single-em { width: 1em; }
        
        .horizontal-spacer {
            height: 80%;
            width: 2px;
            background-color: lightgrey;
        }

        /*For achieving wrap around column header*/
        ::ng-deep .ag-header-cell-text {
            text-overflow: clip !important;
            overflow: visible !important;
            white-space: normal !important;
        }
        .hidden {
            display: none;
        }
    `]
})

export class TabSamplesIlluminaComponent implements OnInit {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;
    @ViewChild('ccCheckbox') ccCheckbox: MatCheckbox;
    @ViewChild('fileInput') fileInput: ElementRef;

    private emToPxConversionRate: number = 13;

    private _isAmendState: boolean = false;
    @Input('isAmendState') public set isAmendState(value: boolean) {
        this._isAmendState = value;
    }
    public get isAmendState(): boolean {
        return this._isAmendState;
    }

    @Input('experiment') public set experiment(value: Experiment) {

        let newExperiment: boolean = (this._experiment !== value);
        this.getColumnProperties();

        this._experiment = value;

        if(newExperiment) {
            this.selectedSamples = [];
        }

        if (this._stateChangeSubject && this._stateChangeSubject.value !== TabSamplesIlluminaComponent.STATE_NEW) {
            this._stateChangeSubject.next(TabSamplesIlluminaComponent.STATE_VIEW);
        }

        if (newExperiment && this.onChange_numberOfSamplesSubscription) {
            this.onChange_numberOfSamplesSubscription.unsubscribe();
            this.onChange_numberOfSamplesSubscription = undefined;
        }
        if (newExperiment && this.onChange_sampleTypeSubscription) {
            this.onChange_sampleTypeSubscription.unsubscribe();
            this.onChange_sampleTypeSubscription = undefined;
        }
        if (newExperiment && this.onChange_organismSubscription) {
            this.onChange_organismSubscription.unsubscribe();
            this.onChange_organismSubscription = undefined;
        }
        if (newExperiment && this.onChange_codeApplicationSubscription) {
            this.onChange_codeApplicationSubscription.unsubscribe();
            this.onChange_codeApplicationSubscription = undefined;
        }
        if (newExperiment && this.onChange_selectedProtocolSubscription) {
            this.onChange_selectedProtocolSubscription.unsubscribe();
            this.onChange_selectedProtocolSubscription = undefined;
        }
        if (newExperiment && this.onChange_codeBioanalyzerChipTypeSubscription) {
            this.onChange_codeBioanalyzerChipTypeSubscription.unsubscribe();
            this.onChange_codeBioanalyzerChipTypeSubscription = undefined;
        }
        if (newExperiment && this.onChange_idSampleSourceSubscription) {
            this.onChange_idSampleSourceSubscription.unsubscribe();
            this.onChange_idSampleSourceSubscription = undefined;
        }
        if (newExperiment && this.onChange_codeRequestCategorySubscription) {
            this.onChange_codeRequestCategorySubscription.unsubscribe();
            this.onChange_codeRequestCategorySubscription = undefined;
        }

        if (!this.onChange_codeRequestCategorySubscription) {
            this.onChange_codeRequestCategorySubscription = this._experiment.onChange_codeRequestCategory.subscribe((value) => {
                this.getColumnProperties();
                let hide_property = this.propertyService.getProperty(PropertyService.PROPERTY_HIDE_MULTIPLEX_LANE_OOLUMN, this._experiment.idCoreFacility, this._experiment.codeRequestCategory);
                this._hideMultiplexGroupColumn = hide_property && hide_property.propertyValue && hide_property.propertyValue === 'Y';
            });
        }

        if (!this.onChange_numberOfSamplesSubscription) {
            this.onChange_numberOfSamplesSubscription = this._experiment.onChange_numberOfSamples.subscribe((value) =>{
                if (this.samplesGridApi) {
                    if (+(this._experiment.numberOfSamples) >= 0) {
                        if (this.experiment.samples
                            && Array.isArray(this.experiment.samples)
                            && this.experiment.samples.length > (+value)) {

                            this.experiment.samples.splice((+value), this.experiment.samples.length - (+value));
                        }

                        this.buildInitialRows();
                    }
                }
                if (this.samplesGridApi && this._experiment.numberOfSamples) {
                    this.samplesGridApi.forEachNode((node: any) => {
                        if (node.data.name === this._experiment.sampleType) {
                            node.setSelected(true);
                        }
                    });
                }
            });
        }
        if (!this.onChange_sampleTypeSubscription) {
            this.onChange_sampleTypeSubscription = this._experiment.onChange_sampleType.subscribe((value) => {
                if (value && this.samplesGridApi) {
                    this.changeSampleType();
                }
            });
        }
        if (!this.onChange_organismSubscription) {
            this.onChange_organismSubscription = this._experiment.onChange_organism.subscribe((value) => {
                if (value && this.samplesGridApi) {
                    this.changeOrganism(value);
                    this.requireReconfirmation();
                }
            });
        }
        if (!this.onChange_codeApplicationSubscription) {
            this.onChange_codeApplicationSubscription = this._experiment.onChange_codeApplication.subscribe((value) => {
                if (value && this.samplesGridApi) {
                    this.changeCode();
                }

                this.bioanalyzerChips = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BIOANALYZER_CHIP_TYPE);

                if (this.bioanalyzerChips && Array.isArray(this.bioanalyzerChips)) {
                    this.bioanalyzerChips = this.bioanalyzerChips.filter((a) => {
                        return a.codeApplication && a.codeApplication === value;
                    });
                    this.bioanalyzerChips.unshift("");
                }
            });
        }
        if (!this.onChange_selectedProtocolSubscription) {
            this.onChange_selectedProtocolSubscription = this._experiment.onChange_selectedProtocol.subscribe((value) => {
                if (value && this.samplesGridApi) {
                    this.updateRows();
                }
            });
        }
        if (newExperiment && !this.onChange_codeBioanalyzerChipTypeSubscription) {
            this.onChange_codeBioanalyzerChipTypeSubscription = this._experiment.onChange_codeBioanalyzerChipType.subscribe((value) => {
                if (this._experiment && this._experiment.samples && Array.isArray(this._experiment.samples)) {
                    for (let sample of this._experiment.samples) {
                        sample.codeBioanalyzerChipType = value;
                    }
                }
            });
        }
        if (!this.onChange_idSampleSourceSubscription) {
            this.onChange_idSampleSourceSubscription = this._experiment.onChange_idSampleSource.subscribe((value) => {
                if (this.samplesGridApi) {
                    // this.samplesGridApi.setRowData(this._experiment.samples);
                    this.samplesGridApi.redrawRows();
                }
                this.requireReconfirmation();
            });
        }


        this.bioanalyzerChipType = this.dictionaryService.getEntries(DictionaryService.BIOANALYZER_CHIP_TYPE).filter((a) => {
            return a.codeApplication === this._experiment.codeApplication;
        });

        this.rebuildColumnDefinitions();
        this.loadSampleTypes();
        this.loadSeqLibProtocol();

        if (this.samplesGridApi) {
            this.samplesGridApi.sizeColumnsToFit();
        }
    }
    public get experiment() {
        return this._experiment;
    }

    @Input('stateChangeSubject') set stateChangeSubject(value: BehaviorSubject<string>) {
        if (value) {
            this._stateChangeSubject = value;

            if (this._stateChangeSubscription) {
                this._stateChangeSubscription.unsubscribe();
            }

            this._stateChangeSubscription = value.subscribe((state: string) => {
                this._state = state;
                this.createColumnsBasedOnState(state);
                this.assignRowDataBasedOnState(state);

                if(this.selectedSamples.length > 0) {
                    this.selectedSamples = [];
                }

                if (this.showCcCheckbox) {
                    setTimeout(() => {
                        if (this.ccCheckbox) {
                            if(this._experiment.hasCCNumber === "Y") {
                                this.ccCheckbox.checked = true;
                                this.toggleCC({ checked: true });
                            } else {
                                this.ccCheckbox.checked = false;
                                this.toggleCC({ checked: false });
                            }
                        }
                    });
                }
            });
        }
    }

    @Input("lab") set lab(value: any) {
        this._lab = value;
    }

    private _stateChangeSubject: BehaviorSubject<string>;

    public static readonly STATE_NEW: string  = 'NEW';
    public static readonly STATE_EDIT: string = 'EDIT';
    public static readonly STATE_VIEW: string = 'VIEW';

    public static readonly TEXT: string = 'text';
    public static readonly TEXT_RIGHT: string = 'text-right';
    public static readonly OPTION: string = 'option';
    public static readonly IMP_OPTION: string = 'IMPROVED_OPTION';
    public static readonly MULTIOPTION: string = 'multioption';

    private _lab: any;

    public get STATE_NEW(): string {
        return TabSamplesIlluminaComponent.STATE_NEW;
    }
    public get STATE_EDIT(): string {
        return TabSamplesIlluminaComponent.STATE_EDIT;
    }
    public get STATE_VIEW(): string {
        return TabSamplesIlluminaComponent.STATE_VIEW;
    }

    public get usingMultiplexGroupGroups(): boolean {
        return this._experiment
            && this._experiment.isExternal !== 'Y'
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y';
    }

    public get usingPlates(): boolean {
        if(this._experiment
            && this._experiment.plates
            && Array.isArray(this._experiment.plates)
            && this._experiment.plates.length > 0) {

            return true;
        }

        if (this._experiment
            && this._experiment.samples
            && Array.isArray(this._experiment.samples)
            && this._experiment.samples.length > 0) {

            for (let sample of this._experiment.samples) {
                if (sample.plateName) {
                    return true;
                }
            }
        }

        return false;
    }

    public get requestCategoryType(): string {
        if(this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.type) {
            return this._experiment.requestCategory.type === NewExperimentService.TYPE_MISEQ ?
                NewExperimentService.TYPE_HISEQ : this._experiment.requestCategory.type;
        }
        return null;
    }

    public get hideMultiplexGroupColumn(): boolean {
        return this._hideMultiplexGroupColumn;
    }

    public get showConcentrationUnitColumn(): boolean {
        return !this.usingMultiplexGroupGroups;
    }

    public get showVolumeColumn(): boolean {
        return this.usingMultiplexGroupGroups;
    }

    public get showCcCheckbox(): boolean {
        if (this._state === this.STATE_VIEW) {
            return false;
        }

        let showExternalCCNumber = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_CAN_SHOW_CCNUMBER_EXTERNAL_EXPERIMENTS);

        if (this.experiment && this.experiment.isExternal === "Y") {
            return showExternalCCNumber
        }

        let isBSTLinkageSupported: boolean = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_CORE_LINKAGE_SUPPORTED);
        let canAccessBSTX: boolean = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_CAN_ACCESS_BSTX);

        return isBSTLinkageSupported && canAccessBSTX;
    }

    public get showNucleicAcidExtractionMethod(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'N';
    }

    public get showAssayColumn(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'N';
    }

    public get showOrganism(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y';
    }

    public get showQC260_230(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'N';
    }

    public get showSampleTypeInViewMode(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y';
    }

    public get showSeqLibProtocol(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y';
    }

    public get showAverageInsertSizeColumn(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y';
    }

    public get showSeqLibPrepStatus(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y';
    }

    public get showPreppedByCorePositionLast(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y';
    }

    public get showPreppedByCorePositionMiddle(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'N';
    }

    public get showQCStatus(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'N'
            && this._experiment.requestCategory.type !== NewExperimentService.TYPE_GENERIC;
    }

    public get showLinkToCCNumber(): boolean {
        return this._experiment && this._experiment.hasCCNumber === 'Y';
    }

    public get showDescription(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'N'
            && this._experiment.requestCategory.type !== NewExperimentService.TYPE_GENERIC;
    }


    public context: any = this;

    private _experiment: Experiment;

    private _barCodes: any[] = [];

    private _hideMultiplexGroupColumn: boolean = false;
    private _defaultMultiplexGroupValue: string;

    public _state: string = TabSamplesIlluminaComponent.STATE_NEW;

    private _stateChangeSubscription: Subscription;

    private onChange_numberOfSamplesSubscription: Subscription;
    private onChange_sampleTypeSubscription: Subscription;
    private onChange_organismSubscription: Subscription;
    private onChange_codeApplicationSubscription: Subscription;
    private onChange_selectedProtocolSubscription: Subscription;
    private onChange_codeBioanalyzerChipTypeSubscription: Subscription;
    private onChange_idSampleSourceSubscription: Subscription;
    private onChange_codeRequestCategorySubscription: Subscription;

    public static readonly ANNOTATION_ATTRIBUTE_NAME_PREFIX :string = "ANNOT";

    public sampleTypes: any[] = [];
    public organisms: any[] = [];
    public concentrationUnits: any[] = [];
    public bioanalyzerChipType: any[] = [];
    public bioanalyzerChips: any[] = [];

    private get workflowStatus(): any[] {
        let temp: any[] = [];

        temp.push({
            value: '',
            display: ''
        });
        temp.push({
            value: 'In Progress',
            display: 'In Progress'
        });
        temp.push({
            value: 'Completed',
            display: 'Complete'
        });
        temp.push({
            value: 'On Hold',
            display: 'On Hold'
        });
        temp.push({
            value: 'Terminated',
            display: 'Terminate'
        });

        return temp;
    }

    public form: FormGroup;

    private hideCCNum: boolean = true;
    private ccNumberIsCurrentlyHidden: boolean = true;

    private gridColumnApi;

    private samplesGridApi: GridApi;

    public nodeChildDetails: any;

    private samplesGridColumnDefs: any[];

    private _tabIndexToInsertAnnotations: number = 0;

    private propertyList: any[] = [];

    private columnProperties: any[] = [];

    public selectedSamples: any[] = [];


    private get defaultSampleColumnDefinitions(): any[] {
        let temp: any[] = [];

        if (this.usingPlates) {
            temp.push({
                headerName: "Plate",
                editable: false,
                field: "plateName",
                pinned: "left",
                width:    6.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                sortOrder: 7,
                cellRendererFramework: SelectRenderer,
                cellEditorFramework:   SelectEditor,
                selectOptions: this._experiment.plates,
                selectOptionsDisplayField: "plateName",
                selectOptionsValueField: "plateName"
            });
            temp.push({
                headerName: "Well",
                editable: false,
                field: "wellName",
                pinned: "left",
                width:    6.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                sortOrder: 9,
                cellRendererFramework: TextAlignLeftMiddleRenderer
            });
        } else {
            // This is the far more common case at time of writing
            temp.push({
                headerName: "",
                field: "index",
                width:    4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                cellRendererFramework: TextAlignRightMiddleRenderer,
                suppressSizeToFit: true,
                pinned: "left",
                sortOrder: 5
            });
        }

        if (this.usingMultiplexGroupGroups && !this.hideMultiplexGroupColumn) {
            temp.push({
                headerName: "Multiplex Group",
                editable: true,
                field: "multiplexGroupNumber",
                width:    6.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup',
                validators: [
                    Validators.required,
                    Validators.pattern(/^\d{1,10}$/)
                ],
                errorNameErrorMessageMap: [
                    { errorName: 'required', errorMessage: 'Multiplex Group required' },
                    { errorName: 'pattern',  errorMessage: 'Expects an integer number' }
                ],
                outerForm: this.form,
                formName:  "gridFormGroup",
                pinned: "left",
                sortOrder: 10
            });
        }

        if (this.usingPlates) {
            temp.push({
                headerName: "Sample Name",
                field: "name",
                width: 9 * this.emToPxConversionRate,
                minWidth: 6.5 * this.emToPxConversionRate,
                editable: true,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                validators: [Validators.maxLength(200)],
                errorNameErrorMessageMap: [
                    {errorName: "maxlength", errorMessage: "Maximum of 200 characters"}
                ],
                pinned: "left",
                outerForm: this.form,
                formName: "gridFormGroup",
                sortOrder: 15
            });
        } else {
            temp.push({
                headerName: "Sample Name",
                field: "name",
                width: 9 * this.emToPxConversionRate,
                minWidth: 6.5 * this.emToPxConversionRate,
                editable: true,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                validators: [Validators.required, Validators.maxLength(200)],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Sample Name required'},
                    {errorName: 'maxlength', errorMessage: 'Maximum of 200 characters'}
                ],
                pinned: "left",
                outerForm: this.form,
                formName: "gridFormGroup",
                sortOrder: 15
            });
        }

        let isExternal: boolean = this.experiment && this.experiment.isExternal === 'Y';

        for (let columnProperty of this.columnProperties) {

            if (columnProperty.showInNewMode && columnProperty.showInNewMode === 'Y') {
                if (isExternal && columnProperty.showForExternal === 'N') {
                    continue;
                }

                let editable: boolean = (columnProperty.editableNewMode && columnProperty.editableNewMode === 'Y') || isExternal;
                let showFillButton: boolean = columnProperty.showFillButton && columnProperty.showFillButton === 'Y';

                let newColumn: any = {
                    headerName: columnProperty.header,
                    field: columnProperty.field,
                    width: (+columnProperty.width) * this.emToPxConversionRate,
                    minWidth: (+columnProperty.minWidth) * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: editable,

                    showFillButton: showFillButton,
                    fillGroupAttribute: columnProperty.fillGroupAttribute,
                    sortOrder: columnProperty.sortOrder,
                    validators: [],
                    errorNameErrorMessageMap: []
                };

                if (columnProperty.maxWidth) {
                    newColumn.maxWidth = (+columnProperty.maxWidth) * this.emToPxConversionRate;
                }

                if (columnProperty.requiredInNewMode && columnProperty.requiredInNewMode === 'Y') {
                    newColumn.validators.push(Validators.required);
                    newColumn.errorNameErrorMessageMap.push({ errorName: 'required', errorMessage: columnProperty.header + ' is required' });
                }

                if (columnProperty.patternToMatch) {
                    let message: string = (columnProperty.patternToMatchErrorMessage ? '' + columnProperty.patternToMatchErrorMessage : '');

                    newColumn.validators.push(Validators.pattern(columnProperty.patternToMatch));
                    newColumn.errorNameErrorMessageMap.push({ errorName: 'pattern', errorMessage: message });
                }

                // Temporary solution for maxLength check. It would be better to add a maximumLength column to columnProperties table for these columns.
                if(columnProperty.field === 'qualRINNumber') {
                    newColumn.validators.push(Validators.maxLength(10));
                    newColumn.errorNameErrorMessageMap.push({ errorName: 'maxlength', errorMessage: 'Maximum of 10 characters'});
                }

                if(columnProperty.field === 'otherSamplePrepMethod') {
                    newColumn.validators.push(Validators.maxLength(300));
                    newColumn.errorNameErrorMessageMap.push({ errorName: 'maxlength', errorMessage: 'Maximum of 300 characters'});
                }

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
                            let fullDictionaryModelPathToLoad: any[] = this.dictionaryService.getEntriesExcludeBlank('' + columnProperty.fullDictionaryModelPathToLoad);
                            fullDictionaryModelPathToLoad.unshift("");
                            newColumn.selectOptions = fullDictionaryModelPathToLoad;
                        } else {
                            newColumn.selectOptions = [];
                        }

                        newColumn.selectOptionsDisplayField = columnProperty.nameField ? columnProperty.nameField : "display";
                        newColumn.selectOptionsValueField   = columnProperty.valueField ? columnProperty.valueField : "value";
                        break;
                    // case TabSamplesIlluminaComponent.MULTIOPTION:
                    //     break;

                    case TabSamplesIlluminaComponent.IMP_OPTION:
                        newColumn.cellRendererFramework = ImprovedSelectRenderer;
                        newColumn.cellEditorFramework   = ImprovedSelectEditor;

                        if (columnProperty.nameFrontEndDictionaryToUse) {
                            newColumn.selectOptions = this['' + columnProperty.nameFrontEndDictionaryToUse];
                        } else if (columnProperty.fullDictionaryModelPathToLoad) {
                            let fullDictionaryModelPathToLoad: any[] = this.dictionaryService.getEntriesExcludeBlank('' + columnProperty.fullDictionaryModelPathToLoad);
                            fullDictionaryModelPathToLoad.unshift("");
                            newColumn.selectOptions = fullDictionaryModelPathToLoad;
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

        // temp.push({
        //     headerName: "CC Number",
        //     field: "ccNumber",
        //     width:    9 * this.emToPxConversionRate,
        //     minWidth: 8 * this.emToPxConversionRate,
        //     suppressSizeToFit: true,
        //     editable: true,
        //     cellRendererFramework: TextAlignLeftMiddleRenderer,
        //     cellEditorFramework: TextAlignLeftMiddleEditor,
        //     validators: [Validators.maxLength(20)],
        //     errorNameErrorMessageMap: [
        //         {errorName: "maxlength", errorMessage: "Maximum of 20 characters"}
        //     ],
        //     showFillButton: true,
        //     fillGroupAttribute: 'frontEndGridGroup',
        //     hide: this.hideCCNum,
        //     ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden
        // });

        temp.push({
            headerName: "CORE Sample Alias",
            field: "sampleAlias_CORE",
            width:    9 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            editable: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            validators: [Validators.maxLength(30)],
            errorNameErrorMessageMap: [
                {errorName: "maxlength", errorMessage: "Maximum of 30 characters"}
            ],
            showFillButton: false,
            context: this,
            onCellValueChanged: this.checkExistsCORESamples,
            // fillGroupAttribute: 'frontEndGridGroup',
            hide: this.hideCCNum,
            ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
            sortOrder: 140
        });

        temp.push({
            headerName: "CORE Sample ID",
            field: "idSample_CORE",
            width:    9 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            editable: false,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            hide: this.hideCCNum,
            ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
            sortOrder: 145
        });

        this._tabIndexToInsertAnnotations = 150;

        if (this.usingMultiplexGroupGroups) {
            temp.push({
                headerName: "# Seq Lanes",
                field: this.isAmendState ? "sequenceLaneCount" : "numberSequencingLanes",
                width: 6.5 * this.emToPxConversionRate,
                minWidth: 5 * this.emToPxConversionRate,
                editable: !this.isAmendState,
                cellRendererFramework: TextAlignRightMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                validators: [
                    Validators.pattern(/^\d{0,10}$/)
                ],
                errorNameErrorMessageMap: [
                    { errorName: 'pattern',  errorMessage: 'Expects an integer number' }
                ],
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup',
                headerTooltip: "This is the number of times(1 or greater) that you want to sequence this sample.",
                cellStyle: {color: 'black', 'background-color': 'LightGreen'},
                sortOrder: 200
            });

            if (this.isAmendState) {
                temp.push({
                    headerName: "Addtl # Seq Lanes",
                    field: "numberSequencingLanes",
                    width: 6.5 * this.emToPxConversionRate,
                    minWidth: 5 * this.emToPxConversionRate,
                    editable: true,
                    cellRendererFramework: TextAlignRightMiddleRenderer,
                    cellEditorFramework: TextAlignLeftMiddleEditor,
                    showFillButton: true,
                    fillGroupAttribute: 'frontEndGridGroup',
                    headerTooltip: "This is the number of times (0 or greater) that you want to sequence this sample again.",
                    validators: [Validators.required, Validators.pattern(/^\d{1,10}$/)],
                    errorNameErrorMessageMap: [
                        {errorName: 'required', errorMessage: 'Addtl # Seq Lanes required'},
                        { errorName: 'pattern',  errorMessage: 'Expects an integer number' }
                    ],
                    sortOrder: 200
                });
            }
        }

        if (this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y'
            && this._experiment.seqPrepByCore_forSamples
            && this._experiment.seqPrepByCore_forSamples === 'N') {

            temp.push({
                headerName: "Index Tag A",
                editable: true,
                width:    12 * this.emToPxConversionRate,
                minWidth: 12 * this.emToPxConversionRate,
                field: "idOligoBarcode",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: BarcodeSelectEditor,
                selectOptions: this._barCodes,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOligoBarcode",
                indexTagLetter: 'A',
                validators: [Validators.required],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Index Tag A required'}
                ],
                sortOrder: 300
            });

            if (!this.isAmendState) {
                // temp.push({
                //     headerName: "Index Tag Sequence A",
                //     field: "barcodeSequence",
                //     width:    7.5 * this.emToPxConversionRate,
                //     minWidth: 6.5 * this.emToPxConversionRate,
                //     suppressSizeToFit: true,
                //     editable: false,
                //     sortOrder: 305
                // });

                let permittedBarcodes: any[] = [];

                if (this._experiment && this._experiment.samples && this._experiment.samples.length > 0) {
                    permittedBarcodes = BarcodeSelectEditor.getPermittedBarcodes('B', this._experiment.samples[0].idSeqLibProtocol, this.dictionaryService);
                }

                if (permittedBarcodes && Array.isArray(permittedBarcodes) && permittedBarcodes.length > 0) {
                    temp.push({
                        headerName: "Index Tag B",
                        editable: true,
                        width:    12 * this.emToPxConversionRate,
                        minWidth: 12 * this.emToPxConversionRate,
                        field: "idOligoBarcodeB",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: BarcodeSelectEditor,
                        selectOptions: this._barCodes,
                        selectOptionsDisplayField: "display",
                        selectOptionsValueField: "idOligoBarcodeB",
                        indexTagLetter: 'B',
                        validators: [Validators.required],
                        errorNameErrorMessageMap: [
                            {errorName: 'required', errorMessage: 'Index Tag B required'}
                        ],
                        sortOrder: 310
                    });
                } else {
                    temp.push({
                        headerName: "Index Tag B",
                        editable: true,
                        width:    12 * this.emToPxConversionRate,
                        minWidth: 12 * this.emToPxConversionRate,
                        field: "idOligoBarcodeB",
                        cellRendererFramework: SelectRenderer,
                        cellEditorFramework: BarcodeSelectEditor,
                        selectOptions: this._barCodes,
                        selectOptionsDisplayField: "display",
                        selectOptionsValueField: "idOligoBarcodeB",
                        indexTagLetter: 'B',
                        sortOrder: 310
                    });
                }

                // temp.push({
                //     headerName: "Index Tag Sequence B",
                //     field: "barcodeSequenceB",
                //     width:    7 * this.emToPxConversionRate,
                //     minWidth: 6.5 * this.emToPxConversionRate,
                //     suppressSizeToFit: true,
                //     editable: false,
                //     sortOrder: 315
                // });

                temp.push({
                    headerName: "Lib QC Conc.",
                    field: "qcLibConcentration",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    cellEditorFramework: TextAlignLeftMiddleEditor,
                    cellRendererFramework: TextAlignLeftMiddleRenderer,
                    showFillButton: true,
                    fillGroupAttribute: 'frontEndGridGroup',
                    validators: [Validators.pattern(/^\d{0,7}(\.\d{1})?$/)],
                    errorNameErrorMessageMap: [
                        {errorName: "pattern", errorMessage: "Expects a decimal numeric(8,1)"}
                    ],
                    suppressSizeToFit: true,
                    editable: true,
                    sortOrder: 320
                });
            }
        }

        if (this.showDescription) {
            temp.push({
                headerName: "Description",
                field: "description",
                width:    9 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                suppressSizeToFit: true,
                editable: true,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup',
                sortOrder: 325
            });
        }

        return temp;
    }

    private get editSampleColumnDefinitions(): any[] {
        let temp: any[] = [];

        if (this.usingPlates) {
            temp.push({
                headerName: "Plate",
                editable: true,
                field: "plateName",
                pinned: "left",
                width:    6.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                sortOrder: 7,
                cellRendererFramework: SelectRenderer,
                cellEditorFramework:   SelectEditor,
                selectOptions: this._experiment.getAllUsedPlates(),
                selectOptionsDisplayField: "value",
                selectOptionsValueField: "value"
            });
            temp.push({
                headerName: "Well",
                editable: true,
                field: "wellName",
                pinned: "left",
                width:    6.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                sortOrder: 9,
                cellRendererFramework: SelectRenderer,
                cellEditorFramework:   SelectEditor,
                selectOptions: this._experiment.getAllPossibleWellNames(),
                selectOptionsDisplayField: "value",
                selectOptionsValueField: "value"
            });
        } else {
            temp.push({
                headerName: "",
                field: "counter",
                width:    4 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                suppressSizeToFit: true,
                editable: false,
                sortOrder: 5,
                pinned: "left"
            });
        }


        if (this.usingMultiplexGroupGroups && !this.hideMultiplexGroupColumn) {
            temp.push({
                headerName: "Multiplex Group",
                editable: true,
                field: "multiplexGroupNumber",
                width: 6.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup',
                validators: [
                    Validators.required,
                    Validators.pattern(/^\d{1,10}$/)
                ],
                errorNameErrorMessageMap: [
                    { errorName: 'required', errorMessage: 'Multiplex Group required' },
                    { errorName: 'pattern',  errorMessage: 'Expects an integer number' }
                ],
                outerForm: this.form,
                formName: "gridFormGroup",
                sortOrder: 10,
                pinned: "left"
            });
        }

        temp.push({
            headerName: "ID",
            field: "number",
            width:    6 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
            editable: false,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            sortOrder: 15,
            pinned: "left"
        });
        temp.push({
            headerName: "Sample Name",
            field: "name",
            width:    9 * this.emToPxConversionRate,
            minWidth: 6.5 * this.emToPxConversionRate,
            editable: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            validators: [Validators.required, Validators.maxLength(200)],
            errorNameErrorMessageMap: [
                {errorName: 'required', errorMessage: 'Sample Name required'},
                {errorName: 'maxlength', errorMessage: 'Maximum of 200 characters'}
            ],
            sortOrder: 20,
            outerForm: this.form,
            formName:  "gridFormGroup",
            pinned:    "left"
        });

        let isExternal: boolean = this.experiment && this.experiment.isExternal === 'Y';

        for (let columnProperty of this.columnProperties) {

            if (columnProperty.showInEditMode && columnProperty.showInEditMode === 'Y') {
                if (isExternal && columnProperty.showForExternal === 'N') {
                    continue;
                }

                let editable: boolean = (columnProperty.editableEditMode && columnProperty.editableEditMode === 'Y') || isExternal;
                let showFillButton: boolean = columnProperty.showFillButton && columnProperty.showFillButton === 'Y';

                let newColumn: any = {
                    headerName: columnProperty.header,
                    field: columnProperty.field,
                    width: (+columnProperty.width) * this.emToPxConversionRate,
                    minWidth: (+columnProperty.minWidth) * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: editable,

                    showFillButton: showFillButton,
                    fillGroupAttribute: columnProperty.fillGroupAttribute,
                    sortOrder: columnProperty.sortOrder,
                    validators: [],
                    errorNameErrorMessageMap: []
                };

                if (columnProperty.maxWidth) {
                    newColumn.maxWidth = (+columnProperty.maxWidth) * this.emToPxConversionRate;
                }

                if (columnProperty.requiredInEditMode && columnProperty.requiredInEditMode === 'Y') {
                    newColumn.validators.push(Validators.required);
                    newColumn.errorNameErrorMessageMap.push({ errorName: 'required', errorMessage: columnProperty.header + ' is required' });
                }

                if (columnProperty.patternToMatch) {
                    let message: string = (columnProperty.patternToMatchErrorMessage ? '' + columnProperty.patternToMatchErrorMessage : '');

                    newColumn.validators.push(Validators.pattern(columnProperty.patternToMatch));
                    newColumn.errorNameErrorMessageMap.push({ errorName: 'pattern', errorMessage: message });
                }
                // Temporary solution for maxLength check. It would be better to add a maximumLength column to columnProperties table for these columns.
                if(columnProperty.field === 'qualRINNumber') {
                    newColumn.validators.push(Validators.maxLength(10));
                    newColumn.errorNameErrorMessageMap.push({ errorName: 'maxlength', errorMessage: 'Maximum of 10 characters'});
                }

                if(columnProperty.field === 'otherSamplePrepMethod') {
                    newColumn.validators.push(Validators.maxLength(300));
                    newColumn.errorNameErrorMessageMap.push({ errorName: 'maxlength', errorMessage: 'Maximum of 300 characters'});
                }

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
                            let fullDictionaryModelPathToLoad: any[] = this.dictionaryService.getEntriesExcludeBlank('' + columnProperty.fullDictionaryModelPathToLoad);
                            fullDictionaryModelPathToLoad.unshift("");
                            newColumn.selectOptions = fullDictionaryModelPathToLoad;
                        } else {
                            newColumn.selectOptions = [];
                        }

                        newColumn.selectOptionsDisplayField = columnProperty.nameField ? columnProperty.nameField : "display";
                        newColumn.selectOptionsValueField   = columnProperty.valueField ? columnProperty.valueField : "value";
                        break;
                    case TabSamplesIlluminaComponent.IMP_OPTION:
                        newColumn.cellRendererFramework = ImprovedSelectRenderer;
                        newColumn.cellEditorFramework   = ImprovedSelectEditor;

                        if (columnProperty.nameFrontEndDictionaryToUse) {
                            newColumn.selectOptions = this['' + columnProperty.nameFrontEndDictionaryToUse];
                        } else if (columnProperty.fullDictionaryModelPathToLoad) {
                            let fullDictionaryModelPathToLoad: any[] = this.dictionaryService.getEntriesExcludeBlank('' + columnProperty.fullDictionaryModelPathToLoad);
                            fullDictionaryModelPathToLoad.unshift("");
                            newColumn.selectOptions = fullDictionaryModelPathToLoad;
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

        // temp.push({
        //     headerName: "CC Number",
        //     field: "ccNumber",
        //     width:    9 * this.emToPxConversionRate,
        //     minWidth: 8 * this.emToPxConversionRate,
        //     suppressSizeToFit: true,
        //     editable: true,
        //     cellRendererFramework: TextAlignLeftMiddleRenderer,
        //     cellEditorFramework: TextAlignLeftMiddleEditor,
        //     validators: [Validators.maxLength(20)],
        //     errorNameErrorMessageMap: [
        //         {errorName: "maxlength", errorMessage: "Maximum of 20 characters"}
        //     ],
        //     showFillButton: true,
        //     fillGroupAttribute: 'frontEndGridGroup',
        //     hide: this.hideCCNum,
        //     ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
        //     sortOrder: 139
        // });


        temp.push({
            headerName: "CORE Sample Alias",
            field: "sampleAlias_CORE",
            width:    9 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            editable: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            validators: [Validators.maxLength(30)],
            errorNameErrorMessageMap: [
                {errorName: "maxlength", errorMessage: "Maximum of 30 characters"}
            ],
            showFillButton: false,
            context: this,
            onCellValueChanged: this.checkExistsCORESamples,
            // fillGroupAttribute: 'frontEndGridGroup',
            hide: this.hideCCNum,
            ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
            sortOrder: 140
        });

        temp.push({
            headerName: "CORE Sample ID",
            field: "idSample_CORE",
            width:    9 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            editable: false,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            hide: this.hideCCNum,
            ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
            sortOrder: 145
        });

        this._tabIndexToInsertAnnotations = 150;

        if (this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y') {

            temp.push({
                headerName: "Index Tag A",
                editable: true,
                width:    12 * this.emToPxConversionRate,
                minWidth: 12 * this.emToPxConversionRate,
                field: "idOligoBarcode",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: BarcodeSelectEditor,
                selectOptions: this._barCodes,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOligoBarcode",
                indexTagLetter: 'A',
                validators: [Validators.required],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Index Tag A required'}
                ],
                sortOrder: 300
            });
            // temp.push({
            //     headerName: "Index Tag Sequence A",
            //     field: "barcodeSequence",
            //     width:    8.5 * this.emToPxConversionRate,
            //     minWidth: 8.5 * this.emToPxConversionRate,
            //     suppressSizeToFit: true,
            //     editable: false,
            //     sortOrder: 301
            // });

            let permittedBarcodes: any[] = [];

            if (this._experiment && this._experiment.samples && this._experiment.samples.length > 0) {
                permittedBarcodes = BarcodeSelectEditor.getPermittedBarcodes('B', this._experiment.samples[0].idSeqLibProtocol, this.dictionaryService);
            }

            if (permittedBarcodes && Array.isArray(permittedBarcodes) && permittedBarcodes.length > 0) {
                temp.push({
                    headerName: "Index Tag B",
                    editable: true,
                    width:    12 * this.emToPxConversionRate,
                    minWidth: 12 * this.emToPxConversionRate,
                    field: "idOligoBarcodeB",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: BarcodeSelectEditor,
                    selectOptions: this._barCodes,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "idOligoBarcodeB",
                    indexTagLetter: 'B',
                    validators: [Validators.required],
                    errorNameErrorMessageMap: [
                        {errorName: 'required', errorMessage: 'Index Tag B required'}
                    ],
                    sortOrder: 302
                });
            } else {
                temp.push({
                    headerName: "Index Tag B",
                    editable: false,
                    width:    12 * this.emToPxConversionRate,
                    minWidth: 12 * this.emToPxConversionRate,
                    field: "idOligoBarcodeB",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: BarcodeSelectEditor,
                    selectOptions: this._barCodes,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "idOligoBarcodeB",
                    indexTagLetter: 'B',
                    sortOrder: 302
                });
            }

            // temp.push({
            //     headerName: "Index Tag Sequence B",
            //     field: "barcodeSequenceB",
            //     width:    8.5 * this.emToPxConversionRate,
            //     minWidth: 8.5 * this.emToPxConversionRate,
            //     suppressSizeToFit: true,
            //     editable: false,
            //     sortOrder: 303
            // });

            temp.push({
                headerName: "Lib QC Conc.",
                field: "qcLibConcentration",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup',
                validators: [Validators.pattern(/^\d{0,7}(\.\d{1})?$/)],
                errorNameErrorMessageMap: [
                    {errorName: "pattern", errorMessage: "Expects a decimal numeric(8,1)"}
                ],
                suppressSizeToFit: true,
                editable: true,
                sortOrder: 304
            });

            temp.push({
                headerName: "QC Status",
                field: "qualStatus",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                // cellRendererFramework: SelectRenderer,
                // cellEditorFramework: SelectEditor,
                // selectOptions: this.workflowStatus,
                // selectOptionsDisplayField: "display",
                // selectOptionsValueField: "value",
                suppressSizeToFit: true,
                editable: false,
                // showFillButton: true,
                // fillGroupAttribute: 'frontEndGridGroup',
                sortOrder: 500
            });
            temp.push({
                headerName: "Seq Lib Prep Status",
                field: "seqPrepStatus",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                // cellRendererFramework: SelectRenderer,
                // cellEditorFramework: SelectEditor,
                // selectOptions: this.workflowStatus,
                // selectOptionsDisplayField: "display",
                // selectOptionsValueField: "value",
                suppressSizeToFit: true,
                editable: false,
                // showFillButton: true,
                // fillGroupAttribute: 'frontEndGridGroup',
                sortOrder: 505
            });
        } else if (!isExternal) {

            if (this._experiment
                && this._experiment.requestCategory
                && this._experiment.requestCategory.type !== NewExperimentService.TYPE_GENERIC
                && !this.usingPlates) {
                    if (this.showQCStatus) {
                        temp.push({
                            headerName: "QC Status",
                            field: "qualStatus",
                            width: 8.5 * this.emToPxConversionRate,
                            minWidth: 8.5 * this.emToPxConversionRate,
                            // cellRendererFramework: SelectRenderer,
                            // cellEditorFramework: SelectEditor,
                            // selectOptions: this.workflowStatus,
                            // selectOptionsDisplayField: "display",
                            // selectOptionsValueField: "value",
                            suppressSizeToFit: true,
                            editable: false,
                            // showFillButton: true,
                            // fillGroupAttribute: 'frontEndGridGroup',
                            sortOrder: 500
                        });
                    }
                    if (this.showDescription) {
                        temp.push({
                            headerName: "Description",
                            field: "description",
                            width:    9 * this.emToPxConversionRate,
                            minWidth: 8.5 * this.emToPxConversionRate,
                            cellRendererFramework: TextAlignLeftMiddleRenderer,
                            cellEditorFramework: TextAlignLeftMiddleEditor,
                            suppressSizeToFit: true,
                            editable: true,
                            showFillButton: true,
                            fillGroupAttribute: 'frontEndGridGroup',
                            sortOrder: 510
                        });
                    }
            }
        }

        return temp;
    }

    private get viewSampleColumnDefinitions(): any[] {
        let temp: any[] = [];

        if (this.usingMultiplexGroupGroups) {
            temp.push({
                headerName: "Multiplex Group",
                field: "mainMultiplexGroupNumber",
                width: 5 * this.emToPxConversionRate,
                minWidth: 5 * this.emToPxConversionRate,
                cellRenderer: "agGroupCellRenderer",
                cellRendererParams: {
                    innerRenderer: getGroupRenderer(),
                    suppressCount: true
                },
                pinned: 'left'
            });
        } else if (this.usingPlates) {
            temp.push({
                headerName: "Plate",
                field: "mainMultiplexGroupNumber",
                width: 5 * this.emToPxConversionRate,
                minWidth: 5 * this.emToPxConversionRate,
                cellRenderer: "agGroupCellRenderer",
                cellRendererParams: {
                    innerRenderer: getGroupRenderer(),
                    suppressCount: true
                },
                pinned: 'left'
            });
        }

        temp.push({
            headerName: "ID",
            field: "number",
            width:    5 * this.emToPxConversionRate,
            minWidth: 5 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            suppressSizeToFit: true,
            pinned: 'left'
        });

        if (this.usingPlates) {
            temp.push({
                headerName: "Well",
                field: "wellName",
                width:    5 * this.emToPxConversionRate,
                minWidth: 5 * this.emToPxConversionRate,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                suppressSizeToFit: true,
                pinned: 'left'
            });
        }

        temp.push({
            headerName: "Sample Name",
            field: "name",
            width:    9 * this.emToPxConversionRate,
            minWidth: 6.5 * this.emToPxConversionRate,
            editable: false,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            outerForm: this.form,
            formName:  "gridFormGroup",
            pinned: 'left'
        });

        let isExternal: boolean = this.experiment && this.experiment.isExternal === 'Y';

        // Add all configurable columns for this RequestCategory.
        for (let columnProperty of this.columnProperties) {

            if (columnProperty.showInViewMode && columnProperty.showInViewMode === 'Y') {
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
                    suppressSizeToFit: true,
                    editable: editable,

                    showFillButton: showFillButton,
                    fillGroupAttribute: columnProperty.fillGroupAttribute,
                    sortOrder: columnProperty.sortOrder
                };

                if (columnProperty.maxWidth) {
                    newColumn.maxWidth = (+columnProperty.maxWidth) * this.emToPxConversionRate;
                }

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
                            let fullDictionaryModelPathToLoad: any[] = this.dictionaryService.getEntriesExcludeBlank('' + columnProperty.fullDictionaryModelPathToLoad);
                            fullDictionaryModelPathToLoad.unshift("");
                            newColumn.selectOptions = fullDictionaryModelPathToLoad;
                        } else {
                            newColumn.selectOptions = [];
                        }

                        newColumn.selectOptionsDisplayField = columnProperty.nameField ? columnProperty.nameField : "display";
                        newColumn.selectOptionsValueField   = columnProperty.valueField ? columnProperty.valueField : "value";
                        break;
                    case TabSamplesIlluminaComponent.IMP_OPTION:
                        newColumn.cellRendererFramework = ImprovedSelectRenderer;
                        newColumn.cellEditorFramework   = ImprovedSelectEditor;

                        if (columnProperty.nameFrontEndDictionaryToUse) {
                            newColumn.selectOptions = this['' + columnProperty.nameFrontEndDictionaryToUse];
                        } else if (columnProperty.fullDictionaryModelPathToLoad) {
                            let fullDictionaryModelPathToLoad: any[] = this.dictionaryService.getEntriesExcludeBlank('' + columnProperty.fullDictionaryModelPathToLoad);
                            fullDictionaryModelPathToLoad.unshift("");
                            newColumn.selectOptions = fullDictionaryModelPathToLoad;
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


        // This is used as the sortOrder basis for the sample annotations.
        this._tabIndexToInsertAnnotations = 150;

        if (this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y') {

            if (this.showLinkToCCNumber) {
            //     temp.push({
            //         headerName: "CC Number",
            //         field: "ccNumber",
            //         width:    8.5 * this.emToPxConversionRate,
            //         minWidth: 8.5 * this.emToPxConversionRate,
            //         suppressSizeToFit: true,
            //         editable: false,
            //         cellRendererFramework: LinkButtonRenderer,
            //         onClickButton: 'onClickCoreLink',
            //         ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
            //         buttonValueLabel: 'ccNumber',
            //         sortOrder: 289
            //     });

                temp.push({
                    headerName: "CORE Sample Alias",
                    field: "sampleAlias_CORE",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                    cellRendererFramework: LinkButtonRenderer,
                    onClickButton: 'onClickCoreLink',
                    ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
                    buttonValueLabel: 'sampleAlias_CORE',
                    sortOrder: 290
                });

                temp.push({
                    headerName: "CORE Sample ID",
                    field: "idSample_CORE",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                    cellRendererFramework: LinkButtonRenderer,
                    onClickButton: 'onClickCoreLink',
                    ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
                    buttonValueLabel: 'idSample_CORE',
                    sortOrder: 295
                });
            }

            temp.push({
                headerName: "Index Tag A",
                editable: false,
                width:    7 * this.emToPxConversionRate,
                minWidth: 7 * this.emToPxConversionRate,
                field: "idOligoBarcode",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: BarcodeSelectEditor,
                selectOptions: this._barCodes,
                selectOptionsDisplayField: "name",
                selectOptionsValueField: "idOligoBarcode",
                indexTagLetter: 'A',
                sortOrder: 300
            });
            temp.push({
                headerName: "Index Tag Sequence A",
                field: "barcodeSequence",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
                sortOrder: 301
            });

            let permittedBarcodes: any[] = [];

            if (this._experiment && this._experiment.samples && this._experiment.samples.length > 0) {
                permittedBarcodes = BarcodeSelectEditor.getPermittedBarcodes('B', this._experiment.samples[0].idSeqLibProtocol, this.dictionaryService);
            }

            if (permittedBarcodes && Array.isArray(permittedBarcodes) && permittedBarcodes.length > 0) {
                temp.push({
                    headerName: "Index Tag B",
                    editable: false,
                    width:    7 * this.emToPxConversionRate,
                    minWidth: 7 * this.emToPxConversionRate,
                    field: "idOligoBarcodeB",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: BarcodeSelectEditor,
                    selectOptions: this._barCodes,
                    selectOptionsDisplayField: "name",
                    selectOptionsValueField: "idOligoBarcodeB",
                    indexTagLetter: 'B',
                    sortOrder: 302
                });

                temp.push({
                    headerName: "Index Tag Sequence B",
                    field: "barcodeSequenceB",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                    sortOrder: 303
                });
            } else {
                // In view mode, if there are no usable Index Tag B's, we just don't display this column.

                // temp.push({
                //     headerName: "Index Tag B",
                //     editable: false,
                //     width:    12 * this.emToPxConversionRate,
                //     minWidth: 12 * this.emToPxConversionRate,
                //     maxWidth: 20 * this.emToPxConversionRate,
                //     field: "idOligoBarcodeB",
                //     cellRendererFramework: SelectRenderer,
                //     cellEditorFramework: BarcodeSelectEditor,
                //     selectOptions: this._barCodes,
                //     selectOptionsDisplayField: "display",
                //     selectOptionsValueField: "idOligoBarcodeB",
                //     indexTagLetter: 'B',
                //     sortOrder: 302
                // });
            }

            temp.push({
                headerName: "Lib QC Conc.",
                field: "qcLibConcentration",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });

            temp.push({
                headerName: "QC Status",
                field: "qualStatus",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
            temp.push({
                headerName: "Seq Lib Prep Status",
                field: "seqPrepStatus",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
            temp.push({
                headerName: "Core to prep lib?",
                field: "seqPrepByCore",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
            temp.push({
                headerName: "Seq Lib Conc. ng/uL",
                field: "seqPrepLibConcentration",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
        } else if (!this.usingPlates) {
            if (this.showQCStatus) {
                temp.push({
                    headerName: "QC Status",
                    field: "qualStatus",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                });
            }
            if (this.showLinkToCCNumber) {
                // temp.push({
                //     headerName: "CC Number",
                //     field: "ccNumber",
                //     width:    8.5 * this.emToPxConversionRate,
                //     minWidth: 8.5 * this.emToPxConversionRate,
                //     suppressSizeToFit: true,
                //     editable: false,
                //     cellRendererFramework: LinkButtonRenderer,
                //     onClickButton: 'onClickCoreLink',
                //     ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
                //     buttonValueLabel: 'ccNumber'
                // });

                temp.push({
                    headerName: "CORE Sample Alias",
                    field: "sampleAlias_CORE",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                    cellRendererFramework: LinkButtonRenderer,
                    onClickButton: 'onClickCoreLink',
                    ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
                    buttonValueLabel: 'sampleAlias_CORE',
                    sortOrder: 290
                });

                temp.push({
                    headerName: "CORE Sample ID",
                    field: "idSample_CORE",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                    cellRendererFramework: LinkButtonRenderer,
                    onClickButton: 'onClickCoreLink',
                    ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
                    buttonValueLabel: 'idSample_CORE',
                    sortOrder: 295
                });
            }

            if (this.showDescription) {
                temp.push({
                    headerName: "Description",
                    field: "description",
                    width:    9 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                    cellRendererFramework: TextAlignLeftMiddleRenderer
                });
            }
        } else {
            if (this.showLinkToCCNumber) {
                // temp.push({
                //     headerName: "CC Number",
                //     field: "ccNumber",
                //     width:    8.5 * this.emToPxConversionRate,
                //     minWidth: 8.5 * this.emToPxConversionRate,
                //     suppressSizeToFit: true,
                //     editable: false,
                //     cellRendererFramework: LinkButtonRenderer,
                //     onClickButton: 'onClickCoreLink',
                //     ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
                //     buttonValueLabel: 'ccNumber'
                // });

                temp.push({
                    headerName: "CORE Sample Alias",
                    field: "sampleAlias_CORE",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                    cellRendererFramework: LinkButtonRenderer,
                    onClickButton: 'onClickCoreLink',
                    ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
                    buttonValueLabel: 'sampleAlias_CORE',
                    sortOrder: 290
                });

                temp.push({
                    headerName: "CORE Sample ID",
                    field: "idSample_CORE",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                    cellRendererFramework: LinkButtonRenderer,
                    onClickButton: 'onClickCoreLink',
                    ccNumberIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
                    buttonValueLabel: 'idSample_CORE',
                    sortOrder: 295
                });
            }
        }

        return temp;
    }


    constructor(public constService: ConstantsService,
                public dialogService: DialogsService,
                private annotationService: AnnotationService,
                private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private fb: FormBuilder,
                private dialog: MatDialog,
                private propertyService: PropertyService,
                private sampleUploadService: SampleUploadService,
                private coreLinkageService: CORELinkageService,
                public createSecurityAdvisor: CreateSecurityAdvisorService) { }

    ngOnInit() {
        this.selectedSamples = [];
        this.organisms = this.dictionaryService.getEntries(DictionaryService.ORGANISM);
        this.concentrationUnits = this.dictionaryService.getEntries(DictionaryService.CONCENTRATION_UNIT);

        this.form = this.fb.group({});

        if (!this.isAmendState) {
            this.form.addControl(
                'invalidateWithoutSamples',
                new FormControl('', (control: AbstractControl) => {
                    if (control
                        && control.parent
                        && control.parent.controls
                        && control.parent.controls['gridFormGroup']
                        && control.parent.controls['gridFormGroup'].controls) {
                        return null;
                    } else {
                        return { message: 'Grid is not populated yet' };
                    }
                })
            );
        }

        this.samplesGridColumnDefs = TabSamplesIlluminaComponent.sortColumns(this.defaultSampleColumnDefinitions);
        this.nodeChildDetails = this.getItemNodeChildDetails;

        this.rebuildColumnDefinitions();

        this.loadSampleTypes();
        this.showHideColumns();

        this.loadBarcodes();

        if (this.samplesGridApi) {
            this.samplesGridApi.sizeColumnsToFit();
        }
    }

    ngOnDestroy() {
        if (this.onChange_numberOfSamplesSubscription) {
            this.onChange_numberOfSamplesSubscription.unsubscribe();
        }
        if (this.onChange_sampleTypeSubscription) {
            this.onChange_sampleTypeSubscription.unsubscribe();
        }
        if (this.onChange_organismSubscription) {
            this.onChange_organismSubscription.unsubscribe();
        }
        if (this.onChange_codeApplicationSubscription) {
            this.onChange_codeApplicationSubscription.unsubscribe();
        }
        if (this.onChange_selectedProtocolSubscription) {
            this.onChange_selectedProtocolSubscription.unsubscribe();
        }
        if (this.onChange_codeBioanalyzerChipTypeSubscription) {
            this.onChange_codeBioanalyzerChipTypeSubscription.unsubscribe();
        }

        if (this.onChange_idSampleSourceSubscription) {
            this.onChange_idSampleSourceSubscription.unsubscribe();
        }

        if (this.onChange_codeRequestCategorySubscription) {
            this.onChange_codeRequestCategorySubscription.unsubscribe();
        }

        if (this._stateChangeSubscription) {
            this._stateChangeSubscription.unsubscribe();
        }
    }

    private loadBarcodes(): void {
        this._barCodes = [];

        let allBarcodes = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.OLIGO_BARCODE);
        for (let code of allBarcodes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this._barCodes.push(code);
        }
    }

    private loadSampleTypes(): void {
        let types: any[] = [];

        for (let sampleType of this.dictionaryService.getEntriesExcludeBlank(DictionaryService.SAMPLE_TYPE)) {
            if (sampleType.isActive === 'N'
                || (sampleType.codeNucleotideType !== "RNA" && sampleType.codeNucleotideType !== "DNA")) {

                continue;
            }

            let requestCategories = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.SAMPLE_TYPE_REQUEST_CATEGORY).filter(sampleRequestCategory =>
                sampleRequestCategory.value !== "" && sampleRequestCategory.idSampleType === sampleType.value
            );

            for (let requestCategory of requestCategories) {
                if (this._experiment && requestCategory.codeRequestCategory === this._experiment.codeRequestCategory) {
                    types.push(sampleType);
                }
            }
        }

        this.sampleTypes = types.sort(TabSampleSetupViewComponent.sortSampleTypes);
        this.sampleTypes.unshift("");
    }

    private seqLibProtocols: any[];

    private loadSeqLibProtocol(): void {
        this.seqLibProtocols = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.SEQ_LIB_PROTOCOL).sort((a, b) => {
            if (!a && !b) {
                return 0;
            } else if (!a) {
                return 1;
            } else if (!b) {
                return -1;
            } else {
                if (!a.sortOrder && !b.sortOrder) {
                    // compare based on display
                    if (!a.display && !a.display) {
                        return 0;
                    } else if (!a.display) {
                        return 1;
                    } else if (!b.display) {
                        return -1;
                    } else {
                        return 0;
                    }
                } else if (!a.sortOrder) {
                    return 1;
                } else if (!b.sortOrder) {
                    return -1;
                } else {
                    return (+a.sortOrder) - (+b.sortOrder);
                }
            }
        });
        this.seqLibProtocols.unshift("");
    }


    public static sortColumns(temp: any[]): any[] {
        if (temp && Array.isArray(temp)) {
            temp = temp.sort((a: any, b: any) => {
                if (a.sortOrder && b.sortOrder) {
                    return (+a.sortOrder) - (+b.sortOrder);
                } else if (a.sortOrder && !b.sortOrder) {
                    return -1;
                } else if (!a.sortOrder && b.sortOrder) {
                    return 1;
                } else {
                    if (a.headerName && b.headerName) {
                        return (+a.headerName) - (+b.headerName);
                    } else if (a.headerName && !b.headerName) {
                        return -1;
                    } else if (!a.headerName && b.headerName) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
            });
        }

        return temp;
    }


    public requireReconfirmation(): void {
        if (this.form && !this.form.contains('invalidateWithoutConfirmation')) {
            this.form.addControl(
                'invalidateWithoutConfirmation',
                new FormControl('', (control: AbstractControl) => {
                    return { message: 'Samples have changed. They require review.' };
                })
            );
        }
    }

    public confirm(): void {
        if (this.form && this.form.contains('invalidateWithoutConfirmation')) {
            this.form.removeControl('invalidateWithoutConfirmation');
        }
    }

    public tabDisplayed(): void {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this.rebuildColumnDefinitions();
        this.confirm();
        this.selectedSamples = [];
    }

    private getColumnProperties(): void {
        if (this._experiment && this._experiment.codeRequestCategory) {
            this.columnProperties = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.COLUMN_PROPERTIES).filter((cp) => {
                return this._experiment && cp.codeRequestCategory === this._experiment.codeRequestCategory;
            });
        } else {
            this.columnProperties = [];
        }
    }

    private rebuildColumnDefinitions(): void {
        if (this._state !== this.STATE_NEW) {
            if (this.samplesGridApi) {
                this.createColumnsBasedOnState(this._state);
                this.assignRowDataBasedOnState(this._state);
                this.samplesGridApi.sizeColumnsToFit();
            }

            return;
        }

        this.getColumnProperties();

        let temp: any[]  = this.defaultSampleColumnDefinitions;

        if (temp && this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.type !== NewExperimentService.TYPE_QC
            && this._experiment.requestCategory.type !== NewExperimentService.TYPE_CAP_SEQ
            && this._experiment.requestCategory.type !== NewExperimentService.TYPE_FRAG_ANAL
            && this._experiment.requestCategory.type !== NewExperimentService.TYPE_MIT_SEQ
            && this._experiment.requestCategory.type !== NewExperimentService.TYPE_CHERRY_PICK
            && this._experiment.requestCategory.type !== NewExperimentService.TYPE_GENERIC) {

            for (let sampleAnnotation of this._experiment.getSelectedSampleAnnotations()) {
                let fullProperty = this.gnomexService.propertyList.filter((value: any) => {
                    return value.idProperty === sampleAnnotation.idProperty;
                });

                if (fullProperty && Array.isArray(fullProperty) && fullProperty.length > 0) {
                    TabSamplesIlluminaComponent.addColumnToColumnDef(temp, fullProperty[0], true, this._tabIndexToInsertAnnotations, this.emToPxConversionRate, this._state, false);
                }
            }
        }

        // clear out data for annotations that have been removed since last rebuild
        let foundAllOldColumns = true;
        if (this.samplesGridColumnDefs && Array.isArray(this.samplesGridColumnDefs)) {
            for (let oldColumn of this.samplesGridColumnDefs) {
                let foundOldColumn: boolean = false;
                for (let newColumn of temp) {
                    if (newColumn.field && oldColumn.field && ('' + newColumn.field).localeCompare('' + oldColumn.field) === 0) {
                        foundOldColumn = true;
                        break;
                    }
                }

                if (!foundOldColumn) {
                    foundAllOldColumns = false;
                    // the old column was removed, remove the values from the samples.
                    for (let sample of this._experiment.samples) {
                        // Delete is important here, as it actually removes the attribute in question.
                        if (oldColumn.field && ('' + oldColumn.field).startsWith(TabSamplesIlluminaComponent.ANNOTATION_ATTRIBUTE_NAME_PREFIX)) {
                            delete sample[oldColumn.field];
                        } else {
                            sample[oldColumn.field] = '';
                        }
                    }
                }
            }
        }

        if (this.samplesGridApi) {
            this.createColumnsBasedOnState(this._state);
            this.assignRowDataBasedOnState(this._state);
            this.samplesGridApi.sizeColumnsToFit();
        }
    }


    public getItemNodeChildDetails(rowItem: any): any {
        // if (this._state === TabSamplesIlluminaComponent.STATE_VIEW && rowItem.multiplexGroupNumber) {
        if (rowItem && rowItem.samples) {
            return {
                group: true,
                expanded: true,
                children: rowItem.samples,
                key: rowItem.mainMultiplexGroupNumber
            };
        } else {
            return null;
        }
    };


    private showHideColumns() {
        let hideSampleTypeOnExternalExperiment: boolean = false;
        if (!this.gnomexService.isInternalExperimentSubmission && this.gnomexService.getProperty(this.gnomexService.PROPERTY_HIDE_SAMPLETYPE_ON_EXTERNAL_EXPERIMENT) === "Y") {
            hideSampleTypeOnExternalExperiment = true;
        }
    }

    private changeOrganism(value: any) {
        for (let sample of this._experiment.samples) {
            sample.idOrganism = value && value.idOrganism ? value.idOrganism : '';
        }

        if (this.samplesGridApi) {
            this.samplesGridApi.redrawRows();
        }
    }

    private changeCode() {
        if (this.samplesGridApi) {
            let protocol = this._experiment.codeApplication ? this.dictionaryService.getProtocolFromApplication(this._experiment.codeApplication) : '';
            this.samplesGridApi.forEachNode((node: any) => {
                node.data.idSeqLibProtocol = protocol.idSeqLibProtocol;
            });
            this.samplesGridApi.redrawRows();
        }
    }

    private updateRows() {

        if (!this._experiment) {
            return;
        }

        let idSampleType: string = '';
        let idOrganism: string = '';
        let idNumberSequencingCycles: string = '';
        let idNumberSequencingCyclesAllowed: string = '';
        let idSeqRunType: string = '';
        let protocol: any = '';
        let numberSequencingLanes: string = this._experiment.isRapidMode === 'Y' ? '2' : '1';
        if (this.isAmendState) {
            numberSequencingLanes = "";
        }

        if (this.gnomexService.submitInternalExperiment() && this._experiment.sampleType) {
            idSampleType = this._experiment.sampleType.idSampleType;
        } else if (this._experiment.idSampleTypeDefault != null) {
            idSampleType = this._experiment.idSampleTypeDefault;
        } else {
            // Do nothing; use default value
        }

        if (this.gnomexService.submitInternalExperiment() && this._experiment.organism) {
            idOrganism = this._experiment.organism.idOrganism
        } else if (this._experiment.idOrganismSampleDefault != null) {
            idOrganism = this._experiment.idOrganismSampleDefault;
        } else {
            // Do nothing; use default value
        }

        if (this.gnomexService.submitInternalExperiment() && this._experiment.selectedProtocol) {
            idNumberSequencingCycles = this._experiment.selectedProtocol.idNumberSequencingCycles;
        }

        if (this.gnomexService.submitInternalExperiment() && this._experiment.selectedProtocol) {
            idNumberSequencingCyclesAllowed = this._experiment.selectedProtocol.idNumberSequencingCyclesAllowed;
        }

        if (this.gnomexService.submitInternalExperiment() && this._experiment.selectedProtocol) {
            idSeqRunType = this._experiment.selectedProtocol.idSeqRunType;
        }

        if (this._experiment.codeApplication) {
            protocol = this.dictionaryService.getProtocolFromApplication(this._experiment.codeApplication);
        }

        for (let sample of this._experiment.samples) {
            sample.idNumberSequencingCycles = idNumberSequencingCycles;
            sample.idNumberSequencingCyclesAllowed = idNumberSequencingCyclesAllowed;
            sample.idSeqRunType = idSeqRunType;
            sample.numberSequencingLanes = numberSequencingLanes;
            sample.idSampleType = idSampleType;
            sample.idSeqLibProtocol = protocol.idSeqLibProtocol;
            sample.idOrganism = idOrganism;
        }
    }

    private buildInitialRows() {

        if (this._experiment && this._experiment.samples) {

            Sample.createNewSamplesForExperiment(this._experiment, this.dictionaryService, this.propertyService, this.gnomexService);

            this.createColumnsBasedOnState(this._state);
            this.assignRowDataBasedOnState(this._state); // REMEMBER
            this.samplesGridApi.sizeColumnsToFit();

            if (this.form && this.form.get('invalidateWithoutSamples')) {
                this.form.removeControl('invalidateWithoutSamples');
            }
        }
    }

    protected getNextSampleId(): number {
        let lastId: number = -1;

        for (let sample of this._experiment.samples) {
            if (sample.idSample.indexOf("Sample") === 0) {
                let id: number = +(sample.idSample.toString().substr(6));
                if (id > lastId) {
                    lastId = id;
                }
            }
        }

        lastId++;
        return lastId;
    }

    private changeSampleType() {
        if (this.samplesGridApi) {
            this.samplesGridApi.redrawRows();  // probably only gets hit when off of this tab...
        }
    }


    private createColumnsBasedOnState(state: string): any[] {
        if (state && this._state !== state) {
            this._state = state;
        }

        let temp: any[] = [];

        if (this.samplesGridApi) {

            let annotationFieldsAreEditable: boolean = true;

            if (this._state === TabSamplesIlluminaComponent.STATE_NEW) {
                temp = this.defaultSampleColumnDefinitions;
            } else if (this._state === TabSamplesIlluminaComponent.STATE_EDIT) {
                temp = this.editSampleColumnDefinitions;
            } else if (this._state === TabSamplesIlluminaComponent.STATE_VIEW) {
                temp = this.viewSampleColumnDefinitions;
                annotationFieldsAreEditable = false;
            }

            if (temp && this._experiment
                && this._experiment.requestCategory
                && this._experiment.requestCategory.type !== NewExperimentService.TYPE_QC
                && this._experiment.requestCategory.type !== NewExperimentService.TYPE_CAP_SEQ
                && this._experiment.requestCategory.type !== NewExperimentService.TYPE_FRAG_ANAL
                && this._experiment.requestCategory.type !== NewExperimentService.TYPE_MIT_SEQ
                && this._experiment.requestCategory.type !== NewExperimentService.TYPE_CHERRY_PICK
                && this._experiment.requestCategory.type !== NewExperimentService.TYPE_GENERIC) {

                for (let sampleAnnotation of this._experiment.getSelectedSampleAnnotations()) {
                    let fullProperty = this.gnomexService.propertyList.filter((value: any) => {
                        return value.idProperty === sampleAnnotation.idProperty;
                    });

                    if (fullProperty && Array.isArray(fullProperty) && fullProperty.length > 0) {
                        TabSamplesIlluminaComponent.addColumnToColumnDef(temp, fullProperty[0], annotationFieldsAreEditable, this._tabIndexToInsertAnnotations, this.emToPxConversionRate, this._state, false);
                    }
                }
            }

            temp = TabSamplesIlluminaComponent.sortColumns(temp);

            this.samplesGridApi.setColumnDefs(temp);
            this.samplesGridApi.redrawRows();

            this.samplesGridColumnDefs = temp;

            if (this.samplesGridApi) {
                this.samplesGridApi.sizeColumnsToFit();
            }
        }
        if (this.ccCheckbox) {
            this.toggleCC(this.ccCheckbox);
        }

        return temp;
    }

    private assignRowDataBasedOnState(state: string): void {
        if (!state || !this.samplesGridApi || !this._experiment || !this._experiment.samples) {
            return;
        }

        this.samplesGridApi.setRowData([]);

        if (this.usingMultiplexGroupGroups && state === TabSamplesIlluminaComponent.STATE_VIEW) {
            let keysUsed: string[] = [];

            for (let sample of this._experiment.samples) {
                let search: string[] = keysUsed.filter((a: string) => {
                    return a === sample.multiplexGroupNumber;
                });

                if (search && Array.isArray(search) && search.length < 1) {
                    keysUsed.push(sample.multiplexGroupNumber);
                }
            }

            let rowData: any[] = [];

            for (let key of keysUsed) {
                rowData.push({
                    mainMultiplexGroupNumber: key,
                    samples: []
                });
            }

            for (let sample of this._experiment.samples) {
                let search: any[] = rowData.filter((a: any) => {
                    return a.mainMultiplexGroupNumber === sample.multiplexGroupNumber;
                });

                if (search && Array.isArray(search) && search.length === 1) {
                    search[0].samples.push(sample);
                }
            }

            this.samplesGridApi.setRowData(rowData);
        } else if (this.usingPlates && state === TabSamplesIlluminaComponent.STATE_VIEW) {
            let keysUsed: string[] = [];

            for (let sample of this._experiment.samples) {
                let search: string[] = keysUsed.filter((a: string) => {
                    return a === sample.plateName;
                });

                if (search && Array.isArray(search) && search.length < 1) {
                    keysUsed.push(sample.plateName);
                }
            }

            let rowData: any[] = [];

            for (let key of keysUsed) {
                rowData.push({
                    mainMultiplexGroupNumber: key,
                    samples: []
                });
            }

            for (let sample of this._experiment.samples) {
                let search: any[] = rowData.filter((a: any) => {
                    return a.mainMultiplexGroupNumber === sample.plateName;
                });

                if (search && Array.isArray(search) && search.length === 1) {
                    search[0].samples.push(sample);
                }
            }

            this.samplesGridApi.setRowData(rowData);
        } else {
            let counter = 1;

            for (let sample of this._experiment.samples) {
                sample.counter = counter++;
            }

            this.samplesGridApi.setRowData(this._experiment.samples);
        }

        // this.samplesGridApi.redrawRows();
    }

    public toggleCC(event) {
        if (this.gridColumnApi
            && this.gridColumnApi.columnController
            && this.gridColumnApi.columnController.gridColumns
            && Array.isArray(this.gridColumnApi.columnController.gridColumns)) {

            let temp: any[] = this.gridColumnApi.columnController.gridColumns.filter((value: any) => {
                return value && value.colDef && value.colDef.field && value.colDef.field === 'ccNumber'
            });
            let temp2: any[] = this.gridColumnApi.columnController.gridColumns.filter((value: any) => {
                return value && value.colDef && value.colDef.field && value.colDef.field === 'sampleAlias_CORE'
            });
            let temp3: any[] = this.gridColumnApi.columnController.gridColumns.filter((value: any) => {
                return value && value.colDef && value.colDef.field && value.colDef.field === 'idSample_CORE'
            });

            if (temp.length > 0) {
                this.gridColumnApi.setColumnVisible(temp[0].colId, event.checked);
                this.ccNumberIsCurrentlyHidden = !event.checked;
                if (!event.checked) {
                    this._experiment.hasCCNumber = "N";
                    for (let sample of this._experiment.samples) {
                        sample.ccNumberTempBackup = sample.ccNumber;
                        sample.ccNumber = "";
                    }
                } else {
                    let hadAnyOldCCNumbers: boolean = false;

                    for (let sample of this._experiment.samples) {
                        if (sample.ccNumberTempBackup) {
                            sample.ccNumber = sample.ccNumberTempBackup;
                            hadAnyOldCCNumbers = true;
                        }
                    }

                    if (hadAnyOldCCNumbers) {
                        this._experiment.hasCCNumber = "Y";
                    }
                }
            }
            if (temp2.length > 0) {
                this.gridColumnApi.setColumnVisible(temp2[0].colId, event.checked);
            }
            if (temp3.length > 0) {
                this.gridColumnApi.setColumnVisible(temp3[0].colId, event.checked);
            }

            if (this.form && this.form.get('invalidateWithoutSamples')) {
                this.form.get('invalidateWithoutSamples').setValue(true);
            }
        }
    }

    public lastCOREChangeEvent: any;

    public checkExistsCORESamples(event: any): void {
        if (!event || !event.newValue) {
            return null;
        }

        this.context.lastCOREChangeEvent = event;

        if (event.newValue.length < 3) {
            if (this.lastCOREChangeEvent && this.lastCOREChangeEvent.data) {
                this.lastCOREChangeEvent.data.sampleAlias_CORE = this.lastCOREChangeEvent.oldValue;
                this.samplesGridApi.refreshCells();
            }

            return;
        }

        this.context.dialogService.startSpinnerDialog('Searching CORE...', 3, 30);

        // cannot access this context through this column event hook.
        this.context.coreLinkageService.searchForSampleAlias(event.newValue).subscribe((result: any) => {
            if (result && Array.isArray(result)) {

                for (let i:number = 0; i < result.length; i++) {
                    if (result[i].amount && result[i].amount === 0) {
                        result[i].amount = "0.0";
                    }
                }

                this.context.dialogService.stopAllSpinnerDialogs();

                if (result.length === 0) {
                    this.context.openNoCOREMatchesDialog(this, result);
                } else if (result.length === 1) {
                    if (this.context
                        && this.context.lastCOREChangeEvent
                        && this.context.lastCOREChangeEvent.data
                        && this.context.samplesGridApi
                        && result[0].identificationNumber) {

                        this.context.lastCOREChangeEvent.data.sampleAlias_CORE = result[0].alias;
                        this.context.lastCOREChangeEvent.data.idSample_CORE = result[0].identificationNumber;
                        this.context.samplesGridApi.refreshCells();
                    }
                } else {
                    this.context.openMultipleCOREMatchesDialog(this, result);
                }
            } else {
                this.context.dialogService.stopAllSpinnerDialogs();
            }
        }, (err: any) => {
            this.context.dialogService.error("Unable to reach CORE.  Please contact GNomEx Support to resolve the issue.");
        });
    }

    private openNoCOREMatchesDialog(rowdata: any, searchResult: any): void {

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = '60em';
        config.height = '45em';
        config.panelClass = 'no-padding-dialog';

        this.context.dialogService.error("Unable to find matches in CORE.\n Reverting to previous value...");

        if (rowdata && rowdata.context && rowdata.context.lastCOREChangeEvent && rowdata.context.lastCOREChangeEvent.data) {
            rowdata.context.lastCOREChangeEvent.data.sampleAlias_CORE = rowdata.context.lastCOREChangeEvent.oldValue;
            this.context.samplesGridApi.refreshCells();
        }
    }

    private openMultipleCOREMatchesDialog(rowdata: any, searchResult: any) {

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = '60em';
        config.height = '45em';
        config.panelClass = 'no-padding-dialog';
        config.data = {
            event: this.context.lastCOREChangeEvent,
            searchResults: searchResult
        };

        this.context.dialogService.genericDialogContainer(CoreSampleSelectorComponent, "Link to CORE Sample", null, config)
            .subscribe((result: any) => {
                if (this.context
                    && this.context.lastCOREChangeEvent
                    && this.context.lastCOREChangeEvent.data
                    && this.context.samplesGridApi) {

                    if (Array.isArray(result)) {
                        if(result[0].identificationNumber) {
                            this.context.lastCOREChangeEvent.data.sampleAlias_CORE = result[0].alias;
                            this.context.lastCOREChangeEvent.data.idSample_CORE = result[0].identificationNumber;
                            this.context.samplesGridApi.refreshCells();
                        }
                    } else {
                        if (rowdata && rowdata.context && rowdata.context.lastCOREChangeEvent && rowdata.context.lastCOREChangeEvent.data) {
                            rowdata.context.lastCOREChangeEvent.data.sampleAlias_CORE = rowdata.context.lastCOREChangeEvent.oldValue;
                            rowdata.context.samplesGridApi.refreshCells();
                        }
                    }
                }
            });
    }

    public onClickCoreLink(node: any): void {
        let search: any = this.propertyService.getProperty("GNomEx_linkage_CORE_url");
        let idSample_CORE: string = '';

        if (this.samplesGridApi && node && node.data && node.data.idSample_CORE) {
            idSample_CORE = node.data.idSample_CORE;

            if (search && search.propertyValue && idSample_CORE) {
                // window.open(search.propertyValue + '#ccNumber=' + ccNum, "_blank");
                window.open(search.propertyValue + idSample_CORE, "_blank");
            }
        }
    }

    public onSamplesGridReady(event: any) {
        this.samplesGridApi = event.api;
        this.gridColumnApi = event.columnApi;
        event.api.setHeaderHeight(50);

        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this.createColumnsBasedOnState(this._state);
        this.assignRowDataBasedOnState(this._state);
        // this.samplesGridApi.setRowData(this._experiment.samples);
        this.samplesGridApi.sizeColumnsToFit();
    }

    public onGridSizeChanged(event: any) {
        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }

    public onSelectionChanged(event: SelectionChangedEvent) {
        this.selectedSamples = event.api.getSelectedRows();
    }

    public onCellValueChanged(event) {
        if (event.colDef.headerName === "Seq Lib Protocol") {
            if(event.newValue !== event.oldValue) {
                if (this.samplesGridApi
                    && this.samplesGridApi.getRowNode(event.rowIndex)
                    && this.samplesGridApi.getRowNode(event.rowIndex).data) {
                    this.samplesGridApi.getRowNode(event.rowIndex).data.idOligoBarcode = "";
                    this.samplesGridApi.getRowNode(event.rowIndex).data.idOligoBarcodeB = "";
                    this.samplesGridApi.getRowNode(event.rowIndex).data.barcodeSequence = "";
                    this.samplesGridApi.getRowNode(event.rowIndex).data.barcodeSequenceB = "";
                }

                this.samplesGridApi.redrawRows();
            }

        } else if (event.colDef.headerName === "Index Tag A") {
            let barcode = this._barCodes.filter(barcode => barcode.idOligoBarcode === event.data.idOligoBarcode);
            if (this.samplesGridApi
                && this.samplesGridApi.getRowNode(event.rowIndex)
                && this.samplesGridApi.getRowNode(event.rowIndex).data) {

                if (Array.isArray(barcode) && barcode.length > 0) {
                    this.samplesGridApi.getRowNode(event.rowIndex).data.barcodeSequence = barcode[0].barcodeSequence;
                } else {
                    this.samplesGridApi.getRowNode(event.rowIndex).data.barcodeSequence = "";
                }

                this.samplesGridApi.redrawRows();
            }

        } else if (event.colDef.headerName === "Index Tag B") {
            let barcode = this._barCodes.filter(barcode => barcode.idOligoBarcodeB === event.data.idOligoBarcodeB);
            if (this.samplesGridApi
                && this.samplesGridApi.getRowNode(event.rowIndex)
                && this.samplesGridApi.getRowNode(event.rowIndex).data) {

                if (Array.isArray(barcode) && barcode.length > 0) {
                    this.samplesGridApi.getRowNode(event.rowIndex).data.barcodeSequenceB = barcode[0].barcodeSequence;
                } else {
                    this.samplesGridApi.getRowNode(event.rowIndex).data.barcodeSequenceB = "";
                }

                this.samplesGridApi.redrawRows();
            }
        }

    }

    public upload(): void {
        this.fileInput.nativeElement.click();
    }

    public onFileSelected(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            // this.file = event.target.files[0];
            let data = {
                sampleColumns: this.samplesGridColumnDefs,
                ccNumberColumnIsCurrentlyHidden: this.ccNumberIsCurrentlyHidden,
                experiment: this._experiment,
                file: event.target.files[0]
            };

            let config: MatDialogConfig = new MatDialogConfig();
            config.width = '60em';
            config.height = '45em';
            config.panelClass = 'no-padding-dialog';
            config.data = data;

            this.dialogService.genericDialogContainer(UploadSampleSheetComponent, "Upload Sample Sheet", null, config)
                .subscribe((result: any) => {
                    if (result && Array.isArray(result)) {
                        this._experiment.numberOfSamples = '' + result.length;
                    }

                    this.samplesGridApi.refreshCells();
                });
        }
    }

    public download(): void {

        let state: string = "";

        if (this._state === TabSamplesIlluminaComponent.STATE_NEW) {
            state = "new";
        }

        if (this._experiment) {
            if (this._lab) {
                this.sampleUploadService.downloadSampleSheet(this._lab.name, state, this.samplesGridColumnDefs, this._experiment);
            } else if (this._experiment.lab) {
                this.sampleUploadService.downloadSampleSheet(this._experiment.lab.name, state, this.samplesGridColumnDefs, this._experiment);
            } else if (this._experiment.idLab && this.gnomexService.labList && Array.isArray(this.gnomexService.labList)) {
                let selectionSet = this.gnomexService.labList.filter((lab) => {
                    return lab.idLab && lab.idLab === this._experiment.idLab;
                });

                if (selectionSet && Array.isArray(selectionSet) && selectionSet.length > 0) {
                    this.sampleUploadService.downloadSampleSheet(selectionSet[0].name, state, this.samplesGridColumnDefs, this._experiment);
                } else {
                    this.sampleUploadService.downloadSampleSheet("Unknown Lab", state, this.samplesGridColumnDefs, this._experiment);
                }
            } else {
                this.sampleUploadService.downloadSampleSheet("Unknown Lab", state, this.samplesGridColumnDefs, this._experiment);
            }
        }
    }

    public onAddSample(): void {
        this.experiment.numberOfSamples = this._experiment.samples.length + 1;
        this.selectedSamples = [];
        this.samplesGridApi.deselectAll();
    }

    public onRemoveSamples(): void {
        let deletedSamples: any[] = [];
        for(let sample of this.selectedSamples) {
            // Only administrators can delete samples
            if(sample.idSample && sample.idSample.toString().indexOf("Sample") < 0 && this._experiment.canDeleteSample !== "Y") {
                this.dialogService.alert("Existing sample " + sample.number + " cannot be deleted from the experiment.", "", DialogType.WARNING);
                continue;
            }

            if(this.checkDeleteValidity(sample)) {
                this.removeSingleSample(sample);
                deletedSamples.push(sample);
            } else {
                break;
            }
        }

        for(let deletedSample of deletedSamples) {
            this.selectedSamples.splice(this.selectedSamples.indexOf(deletedSample), 1);
        }

        setTimeout(() => {
            this.samplesGridApi.redrawRows();
        });
    }

    private checkDeleteValidity(sample: any): boolean {
        let isValid: boolean = true;

        let sequenceLanes: any[] = [];
        if(!this._experiment.sequenceLanes) {
            return isValid;
        } else {
            let experimentSequenceLanes = Array.isArray(this._experiment.sequenceLanes) ? this._experiment.sequenceLanes : [this._experiment.sequenceLanes];
            sequenceLanes = experimentSequenceLanes.filter((lane: any) => {
                return lane.idSample === sample.idSample;
            });
        }

        for (let lane of sequenceLanes) {
            // For the current experiments that are not illumina type  but with sequenceLanes created when submitting experiment,
            // there is not Sequence Lanes Tab that allow users to remove sequence lanes, remove the sequence lanes directly.
            if(this._experiment.requestCategory.isIlluminaType && this._experiment.requestCategory.isIlluminaType === 'Y') {
                if(sample.idSample.indexOf("Sample") >= 0 || this.experiment.isExternal === "Y") {
                    this._experiment.sequenceLanes.splice(this._experiment.sequenceLanes.indexOf(lane), 1);
                } else {
                    this.dialogService.alert("Please remove sequence lanes for sample " + sample.name + " before attempting to delete sample.", "", DialogType.WARNING);
                    isValid = false;
                    break;
                }
            } else {
                this._experiment.sequenceLanes.splice(this._experiment.sequenceLanes.indexOf(lane), 1);
            }

        }
        return isValid;
    }

    private removeSingleSample(sample: any) {
        this._experiment.samples.splice(this._experiment.samples.indexOf(sample), 1);
        this.experiment.numberOfSamples = this._experiment.samples.length;
    }

    public static addColumnToColumnDef(columnDefs: any[], annot: any, editable: boolean, sortOrder: number, emToPxConversionRate: number, state: string, noColor: boolean): void {
        if (!annot || !annot.idProperty) {
            return;
        }

        let column: any;
        switch(annot.codePropertyType) {
            case annotType.CHECK :
                column = TabSamplesIlluminaComponent.createCheckColumn(annot, emToPxConversionRate, editable);
                break;
            case annotType.MOPTION :
                column = TabSamplesIlluminaComponent.createMoptionColumn(annot, emToPxConversionRate, editable);
                break;
            case annotType.OPTION :
                column = TabSamplesIlluminaComponent.createOptionColumn(annot, emToPxConversionRate, editable);
                break;
            case annotType.IMP_OPTION :
                column = TabSamplesIlluminaComponent.createImprovedOptionColumn(annot, emToPxConversionRate, editable);
                break;
            case annotType.URL :
                column = TabSamplesIlluminaComponent.createUrlColumn(annot, emToPxConversionRate);
                break;
            case annotType.TEXT :
                column = TabSamplesIlluminaComponent.createTextColumn(annot, emToPxConversionRate, editable);
                break;
            default:
                column = TabSamplesIlluminaComponent.createTextColumn(annot, emToPxConversionRate, editable);
        }

        if (noColor) {
            // column.cellStyle = {color: 'black', 'background-color': 'white'};
        }
        else if (annot.isRequired && annot.isRequired === 'Y') {
            if (state === TabSamplesIlluminaComponent.STATE_NEW) {
                column.cellStyle = {color: 'black', 'background-color': 'yellow'};
            } else if (state === TabSamplesIlluminaComponent.STATE_EDIT) {
                column.cellStyle = {color: 'black', 'background-color': '#DFFFCF'};
            }
        }

        if (!columnDefs || !Array.isArray(columnDefs)) {
            columnDefs = [];
        }

        if (!sortOrder) {
            sortOrder = 999999;
        }

        column.sortOrder = sortOrder++;

        columnDefs.push(column);
    }

    public static createCheckColumn(annot: any, emToPxConversionRate: number, editable: boolean) {
        return {
            headerName: annot.display,
            editable: false,
            checkboxEditable: editable,
            idProperty: annot.idProperty,
            width:    10 * emToPxConversionRate,
            minWidth: 7 * emToPxConversionRate,
            suppressSizeToFit: true,
            field: TabSamplesIlluminaComponent.ANNOTATION_ATTRIBUTE_NAME_PREFIX + annot.idProperty,
            cellRendererFramework: CheckboxRenderer,
        };
    }

    public static createMoptionColumn(annot: any, emToPxConversionRate: number, editable: boolean): any{
        return {
            headerName: annot.display,
            editable: editable,
            width:    10 * emToPxConversionRate,
            minWidth: 7 * emToPxConversionRate,
            suppressSizeToFit: true,
            idProperty: annot.idProperty,
            field: TabSamplesIlluminaComponent.ANNOTATION_ATTRIBUTE_NAME_PREFIX + annot.idProperty,
            cellRendererFramework: MultiSelectRenderer,
            cellEditorFramework: MultiSelectEditor,
            selectOptions: annot.options,
            selectOptionsDisplayField: "option",
            selectOptionsValueField: "idPropertyOption",
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        };

    }

    public static createOptionColumn(annot: any, emToPxConversionRate: number, editable: boolean): any {
        return {
            headerName: annot.display,
            editable: editable,
            width:    10 * emToPxConversionRate,
            minWidth: 7 * emToPxConversionRate,
            suppressSizeToFit: true,
            idProperty: annot.idProperty,
            field: TabSamplesIlluminaComponent.ANNOTATION_ATTRIBUTE_NAME_PREFIX + annot.idProperty,
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: annot.options,
            selectOptionsDisplayField: "option",
            selectOptionsValueField: "idPropertyOption",
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        };
    }

    public static createImprovedOptionColumn(annot: any, emToPxConversionRate: number, editable: boolean): any {
        return {
            headerName: annot.display,
            editable: editable,
            width:    10 * emToPxConversionRate,
            minWidth: 7 * emToPxConversionRate,
            suppressSizeToFit: true,
            idProperty: annot.idProperty,
            field: TabSamplesIlluminaComponent.ANNOTATION_ATTRIBUTE_NAME_PREFIX + annot.idProperty,
            cellRendererFramework: ImprovedSelectRenderer,
            cellEditorFramework: ImprovedSelectEditor,
            selectOptions: annot.options,
            selectOptionsDisplayField: "option",
            selectOptionsValueField: "idPropertyOption",
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        };
    }

    public static createTextColumn(annot: any, emToPxConversionRate: number, editable: boolean): any {
        return {
            headerName: annot.display,
            field: TabSamplesIlluminaComponent.ANNOTATION_ATTRIBUTE_NAME_PREFIX + annot.idProperty,
            width:    10 * emToPxConversionRate,
            minWidth: 7 * emToPxConversionRate,
            suppressSizeToFit: true,
            idProperty: annot.idProperty,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup',
            editable: editable
        };
    }

    public static createUrlColumn(annot: any, emToPxConversionRate: number): any {
        return {
            headerName: annot.display,
            editable: true,
            width:    10 * emToPxConversionRate,
            minWidth: 7 * emToPxConversionRate,
            suppressSizeToFit: true,
            idProperty: annot.idProperty,
            field: TabSamplesIlluminaComponent.ANNOTATION_ATTRIBUTE_NAME_PREFIX + annot.idProperty,
            cellEditorFramework: UrlAnnotEditor,
            cellRendererFramework: UrlAnnotRenderer,
            annotation: annot
        };
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
