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
import {DialogsService} from "../../util/popup/dialogs.service";
import {LinkButtonRenderer} from "../../util/grid-renderers/link-button.renderer";

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
        
        .allow-line-breaks {
            white-space: pre-line;
        }
        .sample-instructions {
            background-color: lightyellow;
            
            width: 40rem;
            
            min-width:  45%;
            max-width: 100%;
        }
        /*For achieving wrap around column header*/
        ::ng-deep .ag-header-cell-text {
            text-overflow: clip !important;
            overflow: visible !important;
            white-space: normal !important;
        }
        

    `]
})

export class TabSamplesIlluminaComponent implements OnInit {

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;
    @ViewChild('ccCheckbox') ccCheckbox: MatCheckbox;

    private emToPxConversionRate: number = 13;

    @Input('experiment') public set experiment(value: Experiment) {

        let newExperiment: boolean = (this._experiment !== value);

        this._experiment = value;

        if (this._stateChangeSubject && this._stateChangeSubject.value !== TabSamplesIlluminaComponent.STATE_NEW) {
            this._stateChangeSubject.next(TabSamplesIlluminaComponent.STATE_VIEW)
        }

        if (newExperiment && this.onChange_numberOfSamplesSubscription) {
            this.onChange_numberOfSamplesSubscription.unsubscribe();
        }
        if (newExperiment && this.onChange_sampleTypeSubscription) {
            this.onChange_sampleTypeSubscription.unsubscribe();
        }
        if (newExperiment && this.onChange_organismSubscription) {
            this.onChange_organismSubscription.unsubscribe();
        }
        if (newExperiment && this.onChange_codeApplicationSubscription) {
            this.onChange_codeApplicationSubscription.unsubscribe();
        }
        if (newExperiment && this.onChange_selectedProtocolSubscription) {
            this.onChange_selectedProtocolSubscription.unsubscribe();
        }


        if (!this.onChange_numberOfSamplesSubscription) {
            this.onChange_numberOfSamplesSubscription = this._experiment.onChange_numberOfSamples.subscribe((value) =>{
                if (value && this.samplesGridApi) {
                    if (+(this._experiment.numberOfSamples) > 0) {
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
                    this.changeOrganism();
                    this.requireReconfirmation();
                }
            });
        }
        if (!this.onChange_codeApplicationSubscription) {
            this._experiment.onChange_codeApplication.subscribe((value) => {
                if (value && this.samplesGridApi) {
                    this.changeCode();
                }
            });
        }
        if (!this.onChange_selectedProtocolSubscription) {
            this._experiment.onChange_selectedProtocol.subscribe((value) => {
                if (value && this.samplesGridApi) {
                    this.updateRows();
                }
            });
        }

        this.bioanalyzerChipType = this.dictionaryService.getEntries("hci.gnomex.model.BioanalyzerChipType").filter((a) => {
            return a.codeApplication === this._experiment.codeApplication;
        });

        this.rebuildColumnDefinitions();
        this.loadSampleTypes();
        this.loadSeqLibProtocol();
    }


    @Input('stateChangeSubject') set stateChangeSubject(value: BehaviorSubject<string>) {
        if (value) {
            this._stateChangeSubject = value;

            if (this._stateChangeSubscription) {
                this._stateChangeSubscription.unsubscribe();
            }

            this._stateChangeSubscription = value.subscribe((state: string) => {
                if (this.ccCheckbox) {
                    this.ccCheckbox.checked = false;
                }

                this._state = state;
                this.createColumnsBasedOnState(state);
                this.assignRowDataBasedOnState(state);

                if (this.showCcCheckbox
                    && (this._state === TabSamplesIlluminaComponent.STATE_EDIT
                        || this._state === TabSamplesIlluminaComponent.STATE_VIEW)) {

                    setTimeout(() => {
                        if (this.ccCheckbox) {
                            this.ccCheckbox.checked = true;
                            this.toggleCC({ checked: true });
                        }
                    });
                }
            });
        }
    }

    private _stateChangeSubject: BehaviorSubject<string>;

    public static readonly STATE_NEW: string  = 'NEW';
    public static readonly STATE_EDIT: string = 'EDIT';
    public static readonly STATE_VIEW: string = 'VIEW';

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
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'Y';
    };

    public get showConcentrationUnitColumn(): boolean {
        return !this.usingMultiplexGroupGroups;
    }

    public get showVolumeColumn(): boolean {
        return this.usingMultiplexGroupGroups;
    }

    public get showCcCheckbox(): boolean {
        let search1: any = this.propertyService.getProperty("bst_linkage_supported");
        let search2: any = this.propertyService.getProperty("can_access_bstx");

        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'N'
            && search1 && search1.propertyValue
            && search2 && search2.propertyValue;
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
            && this._experiment.requestCategory.isIlluminaType === 'N';
    }

    public get showLinkToCCNumber(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'N';
    }

    public get showDescription(): boolean {
        return this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.isIlluminaType
            && this._experiment.requestCategory.isIlluminaType === 'N';
    }

    public context: any = this;

    private _experiment: Experiment;

    private _barCodes: any[] = [];

    public _state: string = TabSamplesIlluminaComponent.STATE_NEW;

    private _stateChangeSubscription: Subscription;

    private onChange_numberOfSamplesSubscription: Subscription;
    private onChange_sampleTypeSubscription: Subscription;
    private onChange_organismSubscription: Subscription;
    private onChange_codeApplicationSubscription: Subscription;
    private onChange_selectedProtocolSubscription: Subscription;

    public static readonly ANNOTATION_ATTRIBUTE_NAME_PREFIX :string = "ANNOT";

    public readonly BASIC_INSTRUCTIONS: string = ''
        + '1.  Assign a multiplex group number for each sample in the table below. Samples that are to be sequenced in the same lane should be assigned the same multiplex group number.\n'
        + '2.  Provide a name for each sample.\n'
        + '3.  Provide the concentration for each sample if available.\n'
        + '4.  Type the volume (ul) that will be provided for each sample.\n'
        + '5.  Specify the number of sequence lanes required for each multiplex group.\n'
        + '6.  Optional: Annotate the samples using the characteristics that you selected from the Annotations tab.\n'
        + '7.  Optional: Edit other fields as appropriate.';

    public readonly TOOLTIP_TEXT: string = ''
        + 'Instructions\n'
        + '1. Mandatory: Fill in the following highlighted fields: Multiplex Group #, Sample Name(Max 30 characters)\n'
        + '2. Optional: Any annotation characteristic that you selected from the previous screen appears on this screen'
        + 'as a highlighted column. Please type desired information under the highlighted field with the annotation header.\n'
        + '3. After completing all line items, click the \'Next\' button at the bottom of the the page to proceed.'
        + 'You may also upload a sample sheet. Please see the \'Sample sheet help\' for more help.';

    public sampleTypes: any[] = [];
    public organisms: any[] = [];
    public concentrationUnits: any[] = [];
    public bioanalyzerChipType: any[] = [];

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
        temp.push({
            value: 'Bypassed',
            display: 'Bypass'
        });

        return temp;
    }

    public form: FormGroup;

    private hideCCNum: boolean = true;
    private gridColumnApi;

    public showInstructions: boolean = false;

    private samplesGridApi: any;

    public nodeChildDetails: any;

    private samplesGridColumnDefs: any[];

    private _tabIndexToInsertAnnotations: number = 0;

    private propertyList: any[] = [];


    private get defaultSampleColumnDefinitions(): any[] {
        let temp: any[] = [];

        temp.push({
            headerName: "",
            field: "index",
            width:    2 * this.emToPxConversionRate,
            maxWidth: 2 * this.emToPxConversionRate,
            minWidth: 2 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            suppressSizeToFit: true
        });

        temp.push({
            headerName: "Multiplex Group",
            editable: true,
            field: "multiplexGroupNumber",
            width:    6.5 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            maxWidth: 9 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup',
            validators: [
                Validators.required,
                Validators.pattern(/^\d*$/)
            ],
            errorNameErrorMessageMap: [
                { errorName: 'required', errorMessage: 'Multiplex Group required' },
                { errorName: 'pattern',  errorMessage: 'Multiplex Group must be numeric' }
            ],
            outerForm: this.form,
            formName:  "gridFormGroup"
        });

        temp.push({
            headerName: "Sample Name",
            field: "name",
            width:    9 * this.emToPxConversionRate,
            minWidth: 6.5 * this.emToPxConversionRate,
            maxWidth: 12 * this.emToPxConversionRate,
            editable: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            validators: [ Validators.required ],
            errorNameErrorMessageMap: [
                { errorName: 'required', errorMessage: 'Sample Name required' }
            ]
        });
        temp.push({
            headerName: "Conc. (ng/ul)",
            field: "concentration",
            width:    7.5 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            maxWidth: 9 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            editable: true,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        });
        temp.push({
            headerName: "Vol. (ul)",
            field: "sampleVolume",
            width:    7.5 * this.emToPxConversionRate,
            minWidth: 4 * this.emToPxConversionRate,
            maxWidth: 9 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            editable: true,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        });
        temp.push({
            headerName: "CC Number",
            field: "ccNumber",
            width:    9 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            maxWidth: 10 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            editable: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup',
            hide: this.hideCCNum
        });

        this._tabIndexToInsertAnnotations = temp.length;

        temp.push({
            headerName: "Prepped by Core?",
            editable: false,
            width:    5 * this.emToPxConversionRate,
            minWidth: 5 * this.emToPxConversionRate,
            field: "seqPrepByCore",
            cellRendererFramework: TextAlignLeftMiddleRenderer
        });

        temp.push({
            headerName: "# Seq Lanes",
            field: "numberSequencingLanes",
            width:    6.5 * this.emToPxConversionRate,
            minWidth: 5 * this.emToPxConversionRate,
            maxWidth: 8 * this.emToPxConversionRate,
            editable: true,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup',
            headerTooltip: "This is the number of times(1 or greater) that you want to sequence this sample.",
            cellStyle: {color: 'black', 'background-color': 'LightGreen'}
        });
        temp.push({
            headerName: "Sample Type",
            editable: true,
            width:    13 * this.emToPxConversionRate,
            minWidth: 9 * this.emToPxConversionRate,
            field: "idSampleType",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.sampleTypes,
            selectOptionsDisplayField: "sampleType",
            selectOptionsValueField: "idSampleType",
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        });
        temp.push({
            headerName: "Organism",
            editable: true,
            width:    13 * this.emToPxConversionRate,
            minWidth: 9  * this.emToPxConversionRate,
            field: "idOrganism",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.organisms,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idOrganism",
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup',
            validators: [Validators.required],
            errorNameErrorMessageMap: [
                {errorName: 'required', errorMessage: 'Multiplex Group required'}
            ]
        });
        temp.push({
            headerName: "Seq Lib Protocol",
            editable: false,
            width:    20 * this.emToPxConversionRate,
            minWidth: 9  * this.emToPxConversionRate,
            field: "idSeqLibProtocol",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.seqLibProtocols,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idSeqLibProtocol"
        });
        if (this._experiment
            && this._experiment.seqPrepByCore_forSamples
            && this._experiment.seqPrepByCore_forSamples === 'N') {

            temp.push({
                headerName: "Index Tag A",
                editable: true,
                width:    12 * this.emToPxConversionRate,
                minWidth: 12 * this.emToPxConversionRate,
                maxWidth: 20 * this.emToPxConversionRate,
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
            if (this._barCodes && Array.isArray(this._barCodes) && this._barCodes.length > 0) {
                temp.push({
                    headerName: "Index Tag B",
                    editable: true,
                    width:    12 * this.emToPxConversionRate,
                    minWidth: 12 * this.emToPxConversionRate,
                    maxWidth: 20 * this.emToPxConversionRate,
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
                    ]
                });
            } else {
                temp.push({
                    headerName: "Index Tag B",
                    editable: true,
                    width:    12 * this.emToPxConversionRate,
                    minWidth: 12 * this.emToPxConversionRate,
                    maxWidth: 20 * this.emToPxConversionRate,
                    field: "idOligoBarcodeB",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: BarcodeSelectEditor,
                    selectOptions: this._barCodes,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "idOligoBarcodeB",
                    indexTagLetter: 'B'
                });
            }

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

        return temp;
    }

    private get editSampleColumnDefinitions(): any[] {
        let temp: any[] = [];

        temp.push({
            headerName: "",
            field: "counter",
            width:    2 * this.emToPxConversionRate,
            maxWidth: 2 * this.emToPxConversionRate,
            minWidth: 2 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            suppressSizeToFit: true,
            editable: false,
            pinned: "left"
        });

        if (this.usingMultiplexGroupGroups) {
            temp.push({
                headerName: "Multiplex Group",
                editable: true,
                field: "multiplexGroupNumber",
                width: 6.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup',
                validators: [
                    Validators.required,
                    Validators.pattern(/^\d*$/)
                ],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Multiplex Group required'},
                    {errorName: 'pattern', errorMessage: 'Multiplex Group must be numeric'}
                ],
                outerForm: this.form,
                formName: "gridFormGroup",
                pinned: "left"
            });
        }

        temp.push({
            headerName: "ID",
            field: "number",
            width:    6 * this.emToPxConversionRate,
            minWidth: 6 * this.emToPxConversionRate,
            maxWidth: 9 * this.emToPxConversionRate,
            editable: false,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            validators: [ Validators.required ],
            errorNameErrorMessageMap: [
                { errorName: 'required', errorMessage: 'Sample Name required' }
            ],
            pinned: "left"
        });
        temp.push({
            headerName: "Sample Name",
            field: "name",
            width:    9 * this.emToPxConversionRate,
            minWidth: 6.5 * this.emToPxConversionRate,
            maxWidth: 12 * this.emToPxConversionRate,
            editable: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            validators: [ Validators.required ],
            errorNameErrorMessageMap: [
                { errorName: 'required', errorMessage: 'Sample Name required' }
            ],
            pinned: "left"
        });

        if (!this.showConcentrationUnitColumn) {
            temp.push({
                headerName: "Conc. (ng/ul)",
                field: "concentration",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: true,
                cellRendererFramework: TextAlignRightMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        } else {
            temp.push({
                headerName: "Concentration",
                field: "concentration",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: true,
                cellRendererFramework: TextAlignRightMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
            temp.push({
                headerName: "Units",
                field: "codeConcentrationUnit",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: true,
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.concentrationUnits,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "value",
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        if (this.showVolumeColumn) {
            temp.push({
                headerName: "Vol. (ul)",
                field: "sampleVolume",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: true,
                cellRendererFramework: TextAlignRightMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        temp.push({
            headerName: "CC Number",
            field: "ccNumber",
            width:    9 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            maxWidth: 10 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            editable: true,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup',
            hide: this.hideCCNum
        });

        this._tabIndexToInsertAnnotations = temp.length;

        temp.push({
            headerName: "Sample Type",
            editable: true,
            width:    13 * this.emToPxConversionRate,
            minWidth: 9 * this.emToPxConversionRate,
            field: "idSampleType",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.sampleTypes,
            selectOptionsDisplayField: "sampleType",
            selectOptionsValueField: "idSampleType",
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        });

        if (this.showNucleicAcidExtractionMethod) {
            temp.push({
                headerName: "Nucl. acid extraction meth.",
                field: "otherSamplePrepMethod",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: true,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        if (this.showAssayColumn) {
            temp.push({
                headerName: "Assay",
                editable: true,
                width:    13 * this.emToPxConversionRate,
                minWidth: 9 * this.emToPxConversionRate,
                field: "codeBioanalyzerChipType",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.bioanalyzerChipType,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "value",
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        if (this.showOrganism) {
            temp.push({
                headerName: "Organism",
                editable: true,
                width:    13 * this.emToPxConversionRate,
                minWidth: 9  * this.emToPxConversionRate,
                field: "idOrganism",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.organisms,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOrganism",
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup',
                validators: [Validators.required],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Multiplex Group required'}
                ]
            });
        }

        temp.push({
            headerName: "QC Conc. (ng/uL)",
            editable: true,
            width:    9 * this.emToPxConversionRate,
            minWidth: 9  * this.emToPxConversionRate,
            field: "qualCalcConcentration",
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignRightMiddleEditor,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        });

        if (this.showQC260_230) {
            temp.push({
                headerName: "QC 260/230",
                editable: true,
                width:    9 * this.emToPxConversionRate,
                minWidth: 9  * this.emToPxConversionRate,
                field: "qual260nmTo230nmRatio",
                cellRendererFramework: TextAlignRightMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        temp.push({
            headerName: "QC RIN",
            editable: true,
            width:    9 * this.emToPxConversionRate,
            minWidth: 9  * this.emToPxConversionRate,
            field: "qualRINNumber",
            cellRendererFramework: TextAlignRightMiddleRenderer,
            cellEditorFramework: TextAlignRightMiddleEditor,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        });

        if (this.showSeqLibProtocol) {
            temp.push({
                headerName: "Seq Lib Protocol",
                editable: true,
                width:    20 * this.emToPxConversionRate,
                minWidth: 9  * this.emToPxConversionRate,
                field: "idSeqLibProtocol",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.seqLibProtocols,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idSeqLibProtocol"
            });
        }

        if (this.showAverageInsertSizeColumn) {
            temp.push({
                headerName: "Ave Insert Size",
                field: "meanLibSizeActual",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                suppressSizeToFit: true,
                editable: true,
            });
        }

        temp.push({
            headerName: "QC Frag Size (from)",
            field: "qualFragmentSizeFrom",
            width:    8.5 * this.emToPxConversionRate,
            minWidth: 8.5 * this.emToPxConversionRate,
            maxWidth: 10 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            suppressSizeToFit: true,
            editable: true,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        });
        temp.push({
            headerName: "QC Frag Size (to)",
            field: "qualFragmentSizeTo",
            width:    8.5 * this.emToPxConversionRate,
            minWidth: 8.5 * this.emToPxConversionRate,
            maxWidth: 10 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            suppressSizeToFit: true,
            editable: true,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        });
        temp.push({
            headerName: "QC Status",
            field: "qualStatus",
            width:    8.5 * this.emToPxConversionRate,
            minWidth: 8.5 * this.emToPxConversionRate,
            maxWidth: 10 * this.emToPxConversionRate,
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.workflowStatus,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            suppressSizeToFit: true,
            editable: true,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup'
        });

        if (this.showSeqLibPrepStatus) {
            temp.push({
                headerName: "Seq Lib Prep Status",
                field: "seqPrepStatus",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                suppressSizeToFit: true,
                editable: true,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
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
                maxWidth: 9 * this.emToPxConversionRate,
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
            maxWidth: 5 * this.emToPxConversionRate,
            minWidth: 5 * this.emToPxConversionRate,
            cellRendererFramework: TextAlignRightMiddleRenderer,
            suppressSizeToFit: true,
            pinned: 'left'
        });
        temp.push({
            headerName: "Sample Name",
            field: "name",
            width:    9 * this.emToPxConversionRate,
            minWidth: 6.5 * this.emToPxConversionRate,
            maxWidth: 12 * this.emToPxConversionRate,
            editable: false,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            validators: [ Validators.required ],
            errorNameErrorMessageMap: [
                { errorName: 'required', errorMessage: 'Sample Name required' }
            ],
            pinned: 'left'
        });

        if (!this.showConcentrationUnitColumn) {
            temp.push({
                headerName: "Conc. (ng/ul)",
                field: "concentration",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
                cellRendererFramework: TextAlignRightMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        } else {
            temp.push({
                headerName: "Concentration",
                field: "concentration",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: true,
                cellRendererFramework: TextAlignRightMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
            temp.push({
                headerName: "Units",
                field: "codeConcentrationUnit",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: true,
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.concentrationUnits,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "value",
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        if (this.showVolumeColumn) {
            temp.push({
                headerName: "Vol. (ul)",
                field: "sampleVolume",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
                cellRendererFramework: TextAlignRightMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        temp.push({
            headerName: "CC Number",
            field: "ccNumber",
            width:    9 * this.emToPxConversionRate,
            minWidth: 8 * this.emToPxConversionRate,
            maxWidth: 10 * this.emToPxConversionRate,
            suppressSizeToFit: true,
            editable: false,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            showFillButton: true,
            fillGroupAttribute: 'frontEndGridGroup',
            hide: this.hideCCNum
        });

        this._tabIndexToInsertAnnotations = temp.length;

        if (this.showPreppedByCorePositionMiddle) {
            temp.push({
                headerName: "Prepped by Core?",
                editable: false,
                width:    5 * this.emToPxConversionRate,
                minWidth: 5 * this.emToPxConversionRate,
                field: "seqPrepByCore",
                cellRendererFramework: TextAlignLeftMiddleRenderer
            });
        }

        if (this.showSampleTypeInViewMode) {
            temp.push({
                headerName: "Sample Type",
                editable: false,
                width:    13 * this.emToPxConversionRate,
                minWidth: 9 * this.emToPxConversionRate,
                field: "idSampleType",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.sampleTypes,
                selectOptionsDisplayField: "sampleType",
                selectOptionsValueField: "idSampleType",
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        if (this.showNucleicAcidExtractionMethod) {
            temp.push({
                headerName: "Nucl. acid extraction meth.",
                field: "otherSamplePrepMethod",
                width:    7.5 * this.emToPxConversionRate,
                minWidth: 4 * this.emToPxConversionRate,
                maxWidth: 9 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: true,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        if (this.showAssayColumn) {
            temp.push({
                headerName: "Assay",
                editable: false,
                width:    13 * this.emToPxConversionRate,
                minWidth: 9 * this.emToPxConversionRate,
                field: "codeBioanalyzerChipType",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.bioanalyzerChipType,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "value",
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        if (this.showOrganism) {
            temp.push({
                headerName: "Organism",
                editable: false,
                width:    13 * this.emToPxConversionRate,
                minWidth: 9  * this.emToPxConversionRate,
                field: "idOrganism",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.organisms,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOrganism",
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup',
                validators: [Validators.required],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Multiplex Group required'}
                ]
            });
        }

        temp.push({
            headerName: "QC Conc. (ng/uL)",
            editable: false,
            width:    9 * this.emToPxConversionRate,
            minWidth: 9  * this.emToPxConversionRate,
            field: "qualCalcConcentration",
            cellRendererFramework: TextAlignRightMiddleRenderer
        });

        if (this.showQC260_230) {
            temp.push({
                headerName: "QC 260/230",
                editable: true,
                width:    9 * this.emToPxConversionRate,
                minWidth: 9  * this.emToPxConversionRate,
                field: "qual260nmTo230nmRatio",
                cellRendererFramework: TextAlignRightMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                showFillButton: true,
                fillGroupAttribute: 'frontEndGridGroup'
            });
        }

        temp.push({
            headerName: "QC RIN",
            editable: false,
            width:    9 * this.emToPxConversionRate,
            minWidth: 9  * this.emToPxConversionRate,
            field: "qualRINNumber",
            cellRendererFramework: TextAlignRightMiddleRenderer
        });

        if (this.showSeqLibProtocol) {
            temp.push({
                headerName: "Seq Lib Protocol",
                editable: false,
                width:    20 * this.emToPxConversionRate,
                minWidth: 9  * this.emToPxConversionRate,
                field: "idSeqLibProtocol",
                cellRendererFramework: SelectRenderer,
                cellEditorFramework: SelectEditor,
                selectOptions: this.seqLibProtocols,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idSeqLibProtocol"
            });
        }

        if (this.showPreppedByCorePositionLast) {
            temp.push({
                headerName: "Prepped by Core?",
                editable: false,
                width:    5 * this.emToPxConversionRate,
                minWidth: 5 * this.emToPxConversionRate,
                field: "seqPrepByCore",
                cellRendererFramework: TextAlignLeftMiddleRenderer
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
                cellEditorFramework: BarcodeSelectEditor,
                selectOptions: this._barCodes,
                selectOptionsDisplayField: "display",
                selectOptionsValueField: "idOligoBarcode",
                indexTagLetter: 'A',
                validators: [Validators.required],
                errorNameErrorMessageMap: [
                    {errorName: 'required', errorMessage: 'Index Tag A required'}
                ]
            });
            temp.push({
                headerName: "Index Tag Sequence A",
                field: "barcodeSequence",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false
            });
            if (this._barCodes && Array.isArray(this._barCodes) && this._barCodes.length > 0) {
                temp.push({
                    headerName: "Index Tag B",
                    editable: false,
                    width:    12 * this.emToPxConversionRate,
                    minWidth: 12 * this.emToPxConversionRate,
                    maxWidth: 20 * this.emToPxConversionRate,
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
                    ]
                });
            } else {
                temp.push({
                    headerName: "Index Tag B",
                    editable: false,
                    width:    12 * this.emToPxConversionRate,
                    minWidth: 12 * this.emToPxConversionRate,
                    maxWidth: 20 * this.emToPxConversionRate,
                    field: "idOligoBarcodeB",
                    cellRendererFramework: SelectRenderer,
                    cellEditorFramework: BarcodeSelectEditor,
                    selectOptions: this._barCodes,
                    selectOptionsDisplayField: "display",
                    selectOptionsValueField: "idOligoBarcodeB",
                    indexTagLetter: 'B'
                });
            }

            temp.push({
                headerName: "Index Tag Sequence B",
                field: "barcodeSequenceB",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });

            if (this.showAverageInsertSizeColumn) {
                temp.push({
                    headerName: "Ave Insert Size",
                    field: "meanLibSizeActual",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    maxWidth: 10 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                });
            }

            temp.push({
                headerName: "QC Frag Size (from)",
                field: "qualFragmentSizeFrom",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
            temp.push({
                headerName: "QC Frag Size (to)",
                field: "qualFragmentSizeTo",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
            temp.push({
                headerName: "QC Status",
                field: "qualStatus",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
            temp.push({
                headerName: "Seq Lib Prep Status",
                field: "seqPrepStatus",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
            temp.push({
                headerName: "Core to prep lib?",
                field: "seqPrepByCore",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
            temp.push({
                headerName: "Seq Lib Conc. ng/uL",
                field: "seqPrepLibConcentration",
                width:    8.5 * this.emToPxConversionRate,
                minWidth: 8.5 * this.emToPxConversionRate,
                maxWidth: 10 * this.emToPxConversionRate,
                suppressSizeToFit: true,
                editable: false,
            });
        } else {

            if (this.showQCStatus) {
                temp.push({
                    headerName: "QC Status",
                    field: "qualStatus",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    maxWidth: 10 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                });
            }

            if (this.showLinkToCCNumber) {
                temp.push({
                    headerName: "CC Number",
                    field: "ccNumber",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    maxWidth: 10 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                    cellRendererFramework: LinkButtonRenderer,
                    onClickButton: 'onClickCCNumberLink',
                    buttonValueLabel: 'ccNumber'
                });
            }

            if (this.showDescription) {
                temp.push({
                    headerName: "Description",
                    field: "description",
                    width:    8.5 * this.emToPxConversionRate,
                    minWidth: 8.5 * this.emToPxConversionRate,
                    maxWidth: 10 * this.emToPxConversionRate,
                    suppressSizeToFit: true,
                    editable: false,
                    cellRendererFramework: TextAlignLeftMiddleRenderer
                });
            }
        }

        return temp;
    }


    constructor(public constService: ConstantsService,
                private annotationService: AnnotationService,
                private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private fb: FormBuilder,
                private dialog: MatDialog,
                private propertyService: PropertyService) {

        this.organisms = this.dictionaryService.getEntries(DictionaryService.ORGANISM);
        this.concentrationUnits = this.dictionaryService.getEntries(DictionaryService.CONCENTRATION_UNIT);

        this.form = this.fb.group({});

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

        this.samplesGridColumnDefs = this.defaultSampleColumnDefinitions;
        this.nodeChildDetails = this.getItemNodeChildDetails;

        setTimeout(() => {
            this.dialogService.startDefaultSpinnerDialog();
        });

        this.annotationService.getPropertyList().subscribe((result) => {
            this.propertyList = result;
            this.rebuildColumnDefinitions();

            this.dialogService.stopAllSpinnerDialogs();
        });
    }

    ngOnInit() {
        // this.sampleTypes = this.samplesService.filterSampleTypes(this.dictionaryService.getEntries("hci.gnomex.model.SampleType"), null);
        this.loadSampleTypes();
        this.showHideColumns();

        this.loadBarcodes();
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

        if (this._stateChangeSubscription) {
            this._stateChangeSubscription.unsubscribe();
        }
    }

    private loadBarcodes(): void {
        this._barCodes = [];

        let allBarcodes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
        for (let code of allBarcodes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this._barCodes.push(code);
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

    private seqLibProtocols: any[];

    private loadSeqLibProtocol(): void {
        this.seqLibProtocols = this.dictionaryService.getEntries('hci.gnomex.model.SeqLibProtocol').sort((a, b) => {
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
                        return -1
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
    }

    private rebuildColumnDefinitions(): void {
        let temp: any[]  = this.defaultSampleColumnDefinitions;

        if (this._experiment) {
            for (let sampleAnnotation of this._experiment.getSelectedSampleAnnotations()) {
                let fullProperty = this.propertyList.filter((value: any) => {
                    return value.idProperty === sampleAnnotation.idProperty;
                });

                if (fullProperty && Array.isArray(fullProperty) && fullProperty.length > 0) {
                    TabSamplesIlluminaComponent.addColumnToColumnDef(temp, fullProperty[0], this._tabIndexToInsertAnnotations, this.emToPxConversionRate, this._state);
                }
            }
        }

        // clear out data for annotations that have been removed since last rebuild
        let foundAllOldColumns = true;
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

        if (this.samplesGridApi) {
            this.samplesGridColumnDefs = temp;

            this.createColumnsBasedOnState(this._state);
            this.assignRowDataBasedOnState(this._state);
            // this.samplesGridApi.setRowData(this._experiment.samples);
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

    private changeOrganism() {
        if (this.samplesGridApi) {
            // this.samplesGridApi.forEachNode((node: any) => {
            //     node.data.idOrganism = this._experiment.organism.idOrganism;
            // });
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
            protocol = this.dictionaryService.getProtocolFromApplication(this._experiment.codeApplication)
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

        if (this._experiment && this._experiment.numberOfSamples) {

            let idSampleType: string = '';
            let idOrganism: string = '';
            let idNumberSequencingCycles: string = '';
            let idNumberSequencingCyclesAllowed: string = '';
            let idSeqRunType: string = '';
            let protocol: any = '';
            let numberSequencingLanes: string = this._experiment.isRapidMode === 'Y' ? '2' : '1';
            let seqPrepByCore: any = '';

            if (this.gnomexService.submitInternalExperiment() && this._experiment.sampleType) {
                idSampleType = this._experiment.sampleType.idSampleType;
            } else if (this._experiment.idSampleTypeDefault != null) {
                idSampleType = this._experiment.idSampleTypeDefault
            } else {
                // do nothing, leave idSampleType as default.
            }

            if (this.gnomexService.submitInternalExperiment() && this._experiment.organism) {
                idOrganism = this._experiment.organism.idOrganism;
            } else if (this._experiment.idOrganismSampleDefault != null) {
                idOrganism = this._experiment.idOrganismSampleDefault;
            } else {
                // do nothing, leave idOrganism as default.
            }

            if (this.gnomexService.submitInternalExperiment() && this._experiment.selectedProtocol) {
                idNumberSequencingCycles = this._experiment.selectedProtocol.idNumberSequencingCycles;
            }

            if (this.gnomexService.submitInternalExperiment() && this._experiment.selectedProtocol) {
                idNumberSequencingCyclesAllowed = this._experiment.selectedProtocol.idNumberSequencingCyclesAllowed
            }

            if (this.gnomexService.submitInternalExperiment() && this._experiment.selectedProtocol) {
                idSeqRunType = this._experiment.selectedProtocol.idSeqRunType
            }

            if (this._experiment.codeApplication) {
                protocol = this.dictionaryService.getProtocolFromApplication(this._experiment.codeApplication)
            }

            if (this._experiment && this._experiment.seqPrepByCore_forSamples) {
                seqPrepByCore = this._experiment.seqPrepByCore_forSamples;
            }

            let index = +(this._experiment.numberOfSamples) - this._experiment.samples.length;

            if (index > 0) {
                for (let i = 0; i < index; i++) {
                    let obj: Sample = new Sample(this.dictionaryService);

                    obj.index = this._experiment.samples.length + 1;
                    obj.idSample = 'Sample' + this.getNextSampleId().toString();
                    obj.multiplexGroupNumber = "";
                    obj.name = "";
                    obj.canChangeSampleName = 'Y';
                    obj.canChangeSampleType = 'Y';
                    obj.canChangeSampleConcentration = 'Y';
                    obj.canChangeSampleSource = 'Y';
                    obj.canChangeNumberSequencingCycles = 'Y';
                    obj.canChangeNumberSequencingLanes = 'Y';
                    obj.concentration = "";
                    obj.label = '';
                    obj.idOligoBarcode = '';
                    obj.barcodeSequence = '';
                    obj.idOligoBarcodeB = '';
                    obj.barcodeSequenceB = '';
                    obj.idNumberSequencingCycles = idNumberSequencingCycles;
                    obj.idNumberSequencingCyclesAllowed = idNumberSequencingCyclesAllowed;
                    obj.idSeqRunType = idSeqRunType;
                    obj.numberSequencingLanes = numberSequencingLanes;
                    obj.idSampleType = idSampleType;
                    obj.idSeqLibProtocol = protocol.idSeqLibProtocol;
                    obj.seqPrepByCore = seqPrepByCore;
                    obj.idOrganism = idOrganism;
                    obj.prepInstructions = '';
                    obj.otherOrganism = '';
                    obj.treatment = '';
                    obj.frontEndGridGroup = '0';

                    this._experiment.samples.push(obj);
                }
            } else if (index < 0) {
                this._experiment.samples.splice(-1, Math.abs(index));
            }

            this.createColumnsBasedOnState(this._state);
            this.assignRowDataBasedOnState(this._state); // REMEMBER
            // this.samplesGridApi.setRowData(this._experiment.samples);
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
            if (this._state === TabSamplesIlluminaComponent.STATE_NEW) {
                temp = this.defaultSampleColumnDefinitions;
            } else if (this._state === TabSamplesIlluminaComponent.STATE_EDIT) {
                temp = this.editSampleColumnDefinitions;
            } else if (this._state === TabSamplesIlluminaComponent.STATE_VIEW) {
                temp = this.viewSampleColumnDefinitions;
            }

            if (temp && this._experiment) {
                for (let sampleAnnotation of this._experiment.getSelectedSampleAnnotations()) {
                    let fullProperty = this.propertyList.filter((value: any) => {
                        return value.idProperty === sampleAnnotation.idProperty;
                    });

                    if (fullProperty && Array.isArray(fullProperty) && fullProperty.length > 0) {
                        TabSamplesIlluminaComponent.addColumnToColumnDef(temp, fullProperty[0], this._tabIndexToInsertAnnotations, this.emToPxConversionRate, this._state);
                    }
                }
            }

            this.samplesGridApi.setColumnDefs(temp);
            this.samplesGridApi.redrawRows();
        }
        if (this.ccCheckbox) {
            this.ccCheckbox.checked = false;
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

            if (temp.length > 0) {
                this.gridColumnApi.setColumnVisible(temp[0].colId, event.checked);
            }

            this.form.get('invalidateWithoutSamples').setValue(true);
        }
    }

    public onClickCCNumberLink(event: any): void {
        console.log("Hello World");

        let search: any = this.propertyService.getProperty("gnomex_linkage_bst_url");
        let ccNum: string = '';

        if (this.samplesGridApi
            && this.samplesGridApi.getRowNode(event)
            && this.samplesGridApi.getRowNode(event).data
            && this.samplesGridApi.getRowNode(event).data.ccNumber) {

            ccNum = this.samplesGridApi.getRowNode(event).data.ccNumber;
        }

        if (search && search.propertyValue) {
            window.open(search.propertyValue + '#ccNumber=' + ccNum, "_blank");
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

    public onCellValueChanged(event) {
        if (event.colDef.headerName === "Index Tag A") {
            let barcode = this._barCodes.filter(barcode => barcode.idOligoBarcode === event.data.idOligoBarcode);
            if (Array.isArray(barcode) && barcode.length > 0) {
                if (this.samplesGridApi
                    && this.samplesGridApi.getRowNode(event.rowIndex)
                    && this.samplesGridApi.getRowNode(event.rowIndex).data) {
                    this.samplesGridApi.getRowNode(event.rowIndex).data.barcodeSequence = barcode[0].barcodeSequence;
                }

                this.samplesGridApi.redrawRows();
            }
        } else if (event.colDef.headerName === "Index Tag B") {
            let barcode = this._barCodes.filter(barcode => barcode.idOligoBarcodeB === event.data.idOligoBarcodeB);
            if (Array.isArray(barcode) && barcode.length > 0) {
                if (this.samplesGridApi
                    && this.samplesGridApi.getRowNode(event.rowIndex)
                    && this.samplesGridApi.getRowNode(event.rowIndex).data) {

                    this.samplesGridApi.getRowNode(event.rowIndex).data.barcodeSequenceB = barcode[0].barcodeSequence;
                }

                this.samplesGridApi.redrawRows();
            }
        }
    }

    public upload(): void {
        let data = {
            sampleColumns: this.samplesGridColumnDefs,
            rowData: this._experiment.samples
        };

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = '60em';
        config.height = '45em';
        config.panelClass = 'no-padding-dialog';
        config.data = data;

        let dialogRef = this.dialog.open(UploadSampleSheetComponent, config);

        dialogRef.afterClosed().subscribe((result) => {
            this.samplesGridApi.refreshCells();
        });
    }

    public download(): void {

    }

    public onClickShowInstructions(): void {
        this.showInstructions = !this.showInstructions;
    }

    public static addColumnToColumnDef(columnDefs: any[], annot: any, tabIndexToInsertAnnotations: number, emToPxConversionRate: number, state: string): void {
        if (!annot || !annot.idProperty) {
            return;
        }

        let column: any;
        switch(annot.codePropertyType) {
            case annotType.CHECK :
                column = TabSamplesIlluminaComponent.createCheckColumn(annot, emToPxConversionRate);
                break;
            case annotType.MOPTION :
                column = TabSamplesIlluminaComponent.createMoptionColumn(annot, emToPxConversionRate);
                break;
            case annotType.OPTION :
                column = TabSamplesIlluminaComponent.createOptionColumn(annot, emToPxConversionRate);
                break;
            case annotType.URL :
                column = TabSamplesIlluminaComponent.createUrlColumn(annot, emToPxConversionRate);
                break;
            case annotType.TEXT :
                column = TabSamplesIlluminaComponent.createTextColumn(annot, emToPxConversionRate);
                break;
            default:
                column = TabSamplesIlluminaComponent.createTextColumn(annot, emToPxConversionRate);
        }

        if (annot.isRequired && annot.isRequired === 'Y' && state === TabSamplesIlluminaComponent.STATE_NEW) {
            column.cellStyle = {color: 'black', 'background-color': 'yellow'};
        }

        if (!columnDefs || !Array.isArray(columnDefs)) {
            columnDefs = [];
        }

        if (!tabIndexToInsertAnnotations) {
            tabIndexToInsertAnnotations = columnDefs.length;
        }

        columnDefs.splice(tabIndexToInsertAnnotations, 0, column);
    }

    public static createCheckColumn(annot: any, emToPxConversionRate: number) {
        return {
            headerName: annot.display,
            editable: false,
            checkboxEditable: true,
            idProperty: annot.idProperty,
            width:    10 * emToPxConversionRate,
            minWidth: 7 * emToPxConversionRate,
            suppressSizeToFit: true,
            field: TabSamplesIlluminaComponent.ANNOTATION_ATTRIBUTE_NAME_PREFIX + annot.idProperty,
            cellRendererFramework: CheckboxRenderer,
        };
    }

    public static createMoptionColumn(annot: any, emToPxConversionRate: number): any{
        return {
            headerName: annot.display,
            editable: true,
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

    public static createOptionColumn(annot: any, emToPxConversionRate: number): any {
        return {
            headerName: annot.display,
            editable: true,
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

    public static createTextColumn(annot: any, emToPxConversionRate: number): any {
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
            editable: true
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