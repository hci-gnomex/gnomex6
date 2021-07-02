import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild,ChangeDetectorRef} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

import {GnomexService} from "../../services/gnomex.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {DictionaryService} from "../../services/dictionary.service";

import {Experiment} from "../../util/models/experiment.model";
import {Organism} from "../../util/models/organism.model";
import {PropertyService} from "../../services/property.service";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {TextAlignRightMiddleRenderer} from "../../util/grid-renderers/text-align-right-middle.renderer";
import {BehaviorSubject, Subscription} from "rxjs";
import {TabSeqSetupViewComponent} from "./tab-seq-setup-view.component";

@Component({
    selector: "tabSampleSetupView",
    templateUrl: "./tab-sample-setup-view.component.html",
    styles: [`

        .no-height { height: 0;  }
        .single-em { width: 1em; }


        .horizontal-center { text-align: center; }
        
        .green { color: green; }
        .blue  { color: blue;  }
        
        .minimum-height-grid {
            min-height: 12em;
            height: 16em;
        }
        
        .heading {
            width: 30%;
            min-width: 20em;
            padding-right: 2em;
        }
        .minor-heading {
            width: 15%;
            min-width: 10em;
            padding-right: 2em;
        }
        
        .horizontal-center { text-align: center; }
        
        
        ol.three-depth-numbering {
            padding: 0;
            margin: 0;
            list-style-type: none;
            counter-reset: section;
        }
        ol.three-depth-numbering li {
            display: flex;
            flex-direction: row;
            padding-bottom: 0.3em;
        }
        ol.three-depth-numbering li::before {
            counter-increment: section;
            content: "(" counter(section) ")";
            padding-right: 0.7em;
        }
        ol.three-depth-numbering li ol {
            padding: 0;
            margin: 0;
            list-style-type: none;
            counter-reset: subsection;
        }
        ol.three-depth-numbering li ol li {
            display: flex;
            flex-direction: row;
            padding-bottom: 0.3em;
        }
        ol.three-depth-numbering li ol li::before {
            counter-increment: subsection;
            content: "(" counter(section) "." counter(subsection) ")";
            padding-right: 0.7em;
        }
        ol.three-depth-numbering li ol li ol {
            padding: 0;
            margin: 0;
            list-style-type: none;
            counter-reset: subsubsection;
        }
        ol.three-depth-numbering li ol li ol li {
            display: flex;
            flex-direction: row;
            padding-bottom: 0.3em;
        }
        ol.three-depth-numbering li ol li ol li::before {
            counter-increment: subsubsection;
            content: "(" counter(section) "." counter(subsection) "." counter(subsubsection) ")";
            padding-right: 0.7em;
        }

        .normal-size-font { font-size: medium; }
        
        .title {
            font-weight: bold;
            color: darkblue;
            padding-left: 1.75em;
            padding-bottom: 0.25em;
        }

        .short-width {
            width: 20em;
            min-width: 20em;
        }
        .moderate-width {
            width: 40em;
            min-width: 20em;
        }
        .long-width {
            width: 80em;
            min-width: 40em;
        }
        
        .minwidth {
            min-width: 5em;
        }

        textarea.mat-input-element:disabled {
            color: rgba(88,88,88,1);
        }
        
        
        /************************/
        
        /deep/ .mat-checkbox .mat-checkbox-layout {
            padding: 0;
            margin: 0;
        }
        /deep/ .mat-checkbox .mat-checkbox-inner-container{
            height: 15px;
            width: 15px;
        }

    `]
})

export class TabSampleSetupViewComponent implements OnInit, OnDestroy {
    @Input() requestCategory: any;

    @Input() idCoreFacility: string;

    @Input("experiment") set experiment(value: Experiment) {
        this._experiment = value;

        if (this.onChange_codeRequestCategorySubscription) {
            this.onChange_codeRequestCategorySubscription.unsubscribe();
        }
        if (this.onChange_numberOfSamples_Subscription) {
            this.onChange_numberOfSamples_Subscription.unsubscribe();
        }

        this.onChange_codeRequestCategorySubscription = this._experiment.onChange_codeRequestCategory.subscribe((value) => {
            if (this.useIsolationTypeMode) {

                this.sampleSources = this.dictionaryService.getEntries(DictionaryService.SAMPLE_SOURCE);

                if (this.form && this.form.get("showDnaRnaChoices")) {
                    this.form.get("showDnaRnaChoices").setValue(false);
                }
                if (this.form && this.form.get("showExtractionTypeChoices")) {
                    this.form.get("showExtractionTypeChoices").setValue(true);
                }
            } else {
                if (this.form && this.form.get("showDnaRnaChoices")) {
                    this.form.get("showDnaRnaChoices").setValue(true);
                }
                if (this.form && this.form.get("showExtractionTypeChoices")) {
                    this.form.get("showExtractionTypeChoices").setValue(false);
                }
            }

            if (this.experimentTypeUsesPlates) {
                this.form.get("canUsePlates").setValue(true);
            } else {
                this.form.get("canUsePlates").setValue(false);
            }

            if (this.form && this.form.get("hasIsolationTypes")) {
                this.form.get("hasIsolationTypes").setValue(false);
            }
        });

        this.onChange_numberOfSamples_Subscription = this._experiment.onChange_numberOfSamples.subscribe((value: string) => {
            if (this.form && this.form.get("numSamples")) {
                this.form.get("numSamples").setValue(value);
            }
        });
    };

    @Input("QCChipPriceListSubject") set QCChipPriceListSubject(value: BehaviorSubject<any[]>) {
        if (this.QCChipPriceListSubscription) {
            this.QCChipPriceListSubscription.unsubscribe();
        }

        this.QCChipPriceListSubscription = value.subscribe((QCChipPriceList: any[]) => {
            this.bioanalyzerChipPrices = QCChipPriceList;
        });
    };

    @Input("organism") set organism(value: Organism) {
        this._organism = value;
    };

    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    public form: FormGroup;

    private _experiment: Experiment;
    private _organism: Organism;

    private sampleType: any;
    public filteredSampleTypeListDna: any[] = [];
    public filteredSampleTypeListRna: any[] = [];
    private showSampleNotes: boolean = false;
    public showSamplePrepContainer: boolean = true;
    public showKeepSample: boolean = true;
    public requireSamplePrepContainer: boolean = false;
    public showSampleQualityExperimentType: boolean = false;
    public showSequenomExperimentType: boolean = false;
    public showDefaultSampleNumber: boolean = true;
    private showOrganism: boolean = true;
    public requireOrganism: boolean = true;
    private showSamplePurification: boolean = true;
    private showQcInstructions: boolean = true;
    private showRnaseBox: boolean = false;
    private showDnaseBox: boolean = false;
    public _rnaWithDNase: string = 'Click if RNA samples were treated with DNase';
    public _dnaWithRNase: string = 'Click if DNA samples were treated with RNase';


    private organisms: any[] = [];
    public filteredApplications: any[] = [];

    private bioanalyzerChips: any[] = [];
    private bioanalyzerChipPrices: any[] = [];

    public isolationTypes: any[] = [];
    public sampleSources: any[] = [];

    public allPlates: any[] = [];

    private emToPxConversionRate: number = 13;

    private gridApi;

    // public noBioanalyzerChipTypesMessage = '';

    private QCChipPriceListSubscription: Subscription;

    private onChange_numberOfSamples_Subscription: Subscription;
    private onChange_codeRequestCategorySubscription: Subscription;


    public get useIsolationTypeMode(): boolean {
        if (this._experiment
            && this._experiment.requestCategory
            && this._experiment.requestCategory.type
            && this._experiment.requestCategory.type === NewExperimentService.TYPE_ISOLATION) {

            return true;
        } else {
            return false;
        }
    }

    public get numberOfSamples(): number|string {
        return this._experiment.numberOfSamples;
    }
    public set numberOfSamples(value: number|string) {
        this._experiment.numberOfSamples = '' + value;

        if (!this._experiment.samples) {
            this._experiment.samples = [];
        }
    }

    public get showBioAnalyzerChipTypeGrid(): boolean {
        if (this.form
            && this.form.get("selectedApp")
            && this.form.get("selectedApp").value
            && this.form.get("selectedApp").value.hasChipTypes
            && this.form.get("selectedApp").value.hasChipTypes === 'Y') {

            return true;
        }

        return false;
    }

    public get showElution(): boolean {
        return this.newExperimentService.currentState !== 'QCState';
    }

    public get showNotifyBMP(): boolean {
        if (this._experiment && this._experiment.idCoreFacility) {
            for (let option of this.gnomexService.coreFacilitiesICanManage) {
                if (option.idCoreFacility === this._experiment.idCoreFacility) {
                    return true;
                }
            }
        }

        return false;
    }

    public get showNumberPlatesPrompt(): boolean {
        // return true;
        return this._experiment
            && this._experiment.containerType
            && this._experiment.containerType === 'PLATE';
    }

    get experimentTypeUsesPlates(): boolean {
        return this.requestCategory
            && this.requestCategory.type === NewExperimentService.TYPE_SEQUENOM
    }

    public get showSpecialSampleNumberBatchWarning(): boolean {
        return this.form
            && this.form.get('selectedApp')
            && this.form.get('selectedApp').value
            && this.form.get('selectedApp').value.samplesPerBatch
            && this.form.get('selectedApp').value.samplesPerBatch !== '1';
    }

    public get numberOfNecessaryPlates(): number {
        if (this.form && this.form.get('numSamples') && this.form.get('numSamples').value) {
            if (+this.form.get('numSamples').value % 96 === 0) {
                return Math.trunc(+this.form.get('numSamples').value / 96);
            } else {
                return Math.trunc(+this.form.get('numSamples').value / 96) + 1;
            }
        }

        return 1;
    }



    private get bioanalyzerColumnDefs(): any[] {
        let temp: any[] = [];

        temp.push({
            headerName: "",
            editable: true,
            field: "",
            checkboxSelection: true,
            width: 1,
            minWidth: 22
        });
        temp.push({
            headerName: "Chip Type",
            editable: false,
            field: "display",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            width: 10 * this.emToPxConversionRate,
            minWidth: 10 * this.emToPxConversionRate,
            outerForm: this.form,
            formName: 'gridForm'
        });
        temp.push({
            headerName: "Concentration Range",
            editable: false,
            field: "concentrationRange",
            cellRendererFramework: TextAlignRightMiddleRenderer,
            width: 10 * this.emToPxConversionRate,
            minWidth: 10 * this.emToPxConversionRate
        });
        temp.push({
            headerName: "Cost per Sample",
            editable: false,
            field: "price",
            cellRendererFramework: TextAlignRightMiddleRenderer,
            width: 10 * this.emToPxConversionRate,
            minWidth: 10 * this.emToPxConversionRate
        });

        return temp;
    }

    public bioanalyzerGridOptions = {
        onSelectionChanged: TabSampleSetupViewComponent.onChangeBioanalyzer,
        suppressDragLeaveHidesColumns: true
    };


    constructor(private dictionaryService: DictionaryService,
                public newExperimentService: NewExperimentService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private gnomexService: GnomexService,
                private changeDetectorRef: ChangeDetectorRef,
                private propertyService: PropertyService,
                private fb: FormBuilder) {

        this.form = this.fb.group({
                numSamples:                        ['', [Validators.pattern(/^\d+$/)]],
                numPlates:                         ['', [Validators.pattern(/^\d+$/)]],
                canUsePlates:                      [''],
                isUsingPlates:                     [''],
                showSampleQuality:                 [''],
                selectedApp:                       [''],
                selectedDna:                       [''],
                selectedRna:                       [''],
                sampleSource:                      [''],
                showDnaRnaChoices:                 [''],
                showExtractionTypeChoices:         [''],
                hasIsolationTypes:                 [''],
                selectedIsolationExtractionMethod: [''],
                selectedIsolationType:             [''],
                sampleTypeNotes:                   [{value: '', disabled: true}],
                addQubit:                          [''],
                notifyBMP:                         [''],
                organism:                          [''],
                reagent:                           ['', [Validators.maxLength(100)]],
                elution:                           ['', [Validators.maxLength(100)]],
                extractionMethod:                  ['', [Validators.maxLength(100)]],
                dnaseBox:                          [''],
                rnaseBox:                          [''],
                keepSample:                        [''],
                acid:                              [''],
                requiresCustomSpecification:       [''],
                customSpecification:               [''],
                coreNotes:                         ['', [Validators.maxLength(5000)]]
            },
            { validator: TabSampleSetupViewComponent.validatorWrapper }
        );
    }

    ngOnInit() {
        this.organisms = this.gnomexService.activeOrganismList;

        this.newExperimentService.currentState_onChangeObservable.subscribe((value) =>{
            if (value) {
                this.buildSampleTypes();
            }
        });

        this.setState();

        this.form.markAsPristine();
    }

    ngOnDestroy(): void {
        if (this.QCChipPriceListSubscription) {
            this.QCChipPriceListSubscription.unsubscribe();
        }
        if (this.onChange_codeRequestCategorySubscription) {
            this.onChange_codeRequestCategorySubscription.unsubscribe();
        }
        if (this.onChange_numberOfSamples_Subscription) {
            this.onChange_numberOfSamples_Subscription.unsubscribe();
        }
    }


    private static validatorWrapper(group: FormGroup): { [s:string]: boolean } {
        let temp: { [s:string]: boolean } = TabSampleSetupViewComponent.oneCategoryRequired(group);

        if (temp) {
            return temp;
        } else {
            temp = TabSampleSetupViewComponent.qcAssayRequiredIfShown(group);
        }

        if (temp) {
            return temp;
        } else {
            temp = TabSampleSetupViewComponent.sampleQualityRequiredIfShown(group);
        }

        if (temp) {
            return temp;
        } else {
            temp = TabSampleSetupViewComponent.requireExtractionTypeIfShown(group);
        }

        if (temp) {
            return temp;
        } else {
            temp = TabSampleSetupViewComponent.requireIsolationTypeIfShownAndAvailableOptions(group);
        }

        if (temp) {
            return temp;
        } else {
            temp = TabSampleSetupViewComponent.requireOtherSpecificationIfShown(group);
        }

        if (temp) {
            return temp;
        } else {
            temp = TabSampleSetupViewComponent.requireNumberPlatesIfShownAndAvailableOptions_AND_checkMinimumNeededPlates(group);
        }

        if (temp) {
            return temp;
        } else {
            temp = TabSampleSetupViewComponent.maxNumberOfPlates(group);
        }

        return temp;
    }

    private static oneCategoryRequired(group: FormGroup): { [s:string]: boolean } {
        if (group
            && ((group.controls['selectedDna'].value
                || group.controls['selectedRna'].value)
                || group.controls['showDnaRnaChoices'].value === false)) {

            return null;
        }

        return {
            'error': true,
            'oneCategoryRequired': true
        };
    }

    private static qcAssayRequiredIfShown(group: FormGroup): { [s:string]: boolean } {

        if (group
            && group.controls["selectedApp"]
            && group.controls["selectedApp"].value
            && group.controls["selectedApp"].value.hasChipTypes
            && group.controls["selectedApp"].value.hasChipTypes === 'Y'
            && group.controls["gridForm"]
            && group.controls["gridForm"].value
            && !(group.controls["gridForm"].value['bioanalyzer'])) {

            return {
                'error': true,
                'qcAssayRequiredIfShown': true
            };
        }

        return null;
    }

    private static sampleQualityRequiredIfShown(group: FormGroup): { [s:string]: boolean } {

        if (group
            && group.controls["showSampleQuality"]
            && group.controls["showSampleQuality"].value === true
            && group.controls["selectedApp"]
            && !(group.controls["selectedApp"].value)) {

            return {
                'error': true,
                'sampleQualityRequiredIfShown': true
            };
        }

        return null;
    }

    private static requireExtractionTypeIfShown(group: FormGroup): { [s:string]: boolean } {
        if (group
            && group.controls["showExtractionTypeChoices"]
            && group.controls["showExtractionTypeChoices"].value === true
            && group.controls["selectedIsolationExtractionMethod"]
            && !(group.controls["selectedIsolationExtractionMethod"].value)) {

            return {
                'error': true,
                'requireExtractionTypeIfShown': true
            };
        }

        return null;
    }

    private static requireIsolationTypeIfShownAndAvailableOptions(group: FormGroup): { [s:string]: boolean } {
        if (group
            && group.controls["showExtractionTypeChoices"]
            && group.controls["showExtractionTypeChoices"].value === true
            && group.controls["hasIsolationTypes"]
            && group.controls["hasIsolationTypes"].value === true
            && group.controls["selectedIsolationType"]
            && !(group.controls["selectedIsolationType"].value)) {

            return {
                'error': true,
                'requireIsolationTypeIfShownAndAvailableOptions': true
            };
        }

        return null;
    }

    private static requireOtherSpecificationIfShown(group: FormGroup): { [s:string]: boolean } {
        if (group
            && group.controls["requiresCustomSpecification"]
            && group.controls["requiresCustomSpecification"].value === true
            && group.controls["customSpecification"]
            && !(group.controls["customSpecification"].value)) {

            group.controls["customSpecification"].setErrors({
                'error': true,
                'required': true
            });

            return {
                'error': true,
                'required': true
            };
        }

        return null;
    }

    private static requireNumberPlatesIfShownAndAvailableOptions_AND_checkMinimumNeededPlates(group: FormGroup): { [s:string]: boolean } {
        if (group
            && group.controls["canUsePlates"]
            && group.controls["canUsePlates"].value === true
            && group.controls["isUsingPlates"]
            && group.controls["isUsingPlates"].value === true
            && group.controls["numSamples"]
            && group.controls["numSamples"].value
            && group.controls["numPlates"]
            && !(group.controls["numPlates"].value)) {

            group.controls["numPlates"].setErrors({
                'error': true,
                'required': true
            });

            return {
                'error': true,
                'required': true
            };
        }

        if (group
            && group.controls["canUsePlates"]
            && group.controls["canUsePlates"].value === true
            && group.controls["numSamples"]
            && group.controls["numSamples"].value
            && group.controls["numPlates"]
            && group.controls["numPlates"].value
            && +(group.controls["numSamples"].value) > +(group.controls["numPlates"].value) * 12 * 8 ) {

            group.controls["numPlates"].setErrors({
                'error': true,
                'requireNumberPlatesIfShownAndAvailableOptions_AND_checkMinimumNeededPlates': 'true'
            });

            return {
                'error': true,
                'requireNumberPlatesIfShownAndAvailableOptions_AND_checkMinimumNeededPlates': true
            };
        }

        return null;
    }

    private static maxNumberOfPlates(group: FormGroup): { [s:string]: boolean } {
        if (group
            && group.controls["numPlates"]
            && group.controls["numPlates"].value
            && +(group.controls["numPlates"].value) > 12) {

            group.controls["numPlates"].setErrors({
                'error': true,
                'maximum': true
            });

            return {
                'error': true,
                'maximum': true
            };
        }

        return null;
    }

    ngOnChanges() {
        if (this.filteredSampleTypeListDna.length === 0 && this.requestCategory) {
            this.filteredSampleTypeListDna = this.filterSampleType("DNA")
                .sort(TabSampleSetupViewComponent.sortSampleTypes);
        }
        if (this.filteredSampleTypeListRna.length === 0 && this.requestCategory) {
            this.filteredSampleTypeListRna = this.filterSampleType("RNA")
                .sort(TabSampleSetupViewComponent.sortSampleTypes);
        }
        if (this.sampleTypes.length === 0) {
            this.sampleTypes = this.sampleTypes.concat(this.filteredSampleTypeListDna);
            this.sampleTypes = this.sampleTypes.concat(this.filteredSampleTypeListRna);
        }
    }

    private sampleTypes: any[] = [];

    private filterSampleType(codeNucleotideType: string): any[] {
        let types: any[] = [];

        for (let category of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.SampleType")) {
            if (!this.newExperimentService.isEditState() && category.isActive === 'N') {
                continue;
            }
            if (codeNucleotideType != null && category.codeNucleotideType !== codeNucleotideType) {
                continue;
            }

            let theRequestCategories = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.SampleTypeRequestCategory").filter(category2 =>
                category2.value !== "" && category2.idSampleType === category.value
            );

            for (let category3 of theRequestCategories) {
                if (this.requestCategory && category3.codeRequestCategory === this.requestCategory.codeRequestCategory) {
                    types.push(category);
                }
            }
        }

        return types;
    }

    public static sortSampleTypes(obj1, obj2): number {
        if (obj1 == null && obj2 == null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {
            let order1: number = Number(obj1.sortOrder);
            let order2: number = Number(obj2.sortOrder);

            if (obj1.value === '') {
                return -1;
            } else if (obj2.value === '') {
                return 1;
            } else {
                if (order1 < order2) {
                    return -1;
                } else if (order1 > order2) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }


    private buildSampleTypes(): void {
        if (this.filteredApplications.length === 0 && this.requestCategory) {
            let temp: any[] = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.APPLICATION);
            this.filteredApplications = [];

            if (this.filteredApplications && Array.isArray(this.filteredApplications)) {
                let bridge: any[] = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY_APPLICATION);

                if (bridge && Array.isArray(bridge)) {
                    bridge = bridge.filter((a: any) => {
                        return a.codeRequestCategory && this._experiment && a.codeRequestCategory === this._experiment.codeRequestCategory;
                    });

                    for (let item of bridge) {
                        for (let application of temp) {
                            if (application.codeApplication === item.codeApplication) {
                                this.filteredApplications.push(application);
                                break;
                            }
                        }
                    }

                    this.filteredApplications = this.filteredApplications.sort(TabSeqSetupViewComponent.sortBySortOrderThenDisplay)
                }
            }
        }

        if (this.filteredSampleTypeListDna.length === 0 && this.requestCategory) {
            this.filteredSampleTypeListDna = this.filterSampleType("DNA")
                .sort(TabSampleSetupViewComponent.sortSampleTypes);
        }

        if (this.filteredSampleTypeListRna.length === 0 && this.requestCategory) {
            this.filteredSampleTypeListRna = this.filterSampleType("RNA")
                .sort(TabSampleSetupViewComponent.sortSampleTypes);
        }
    }

    public onChange_numberOfSamples(event: any): void {
        this.numberOfSamples = this.form.get("numSamples").value;

        if (this.form && this.form.get("numPlates")) {
            this.form.get("numPlates").updateValueAndValidity();
        }
    }

    public onChange_numberOfPlates(event: any): void {

        if (this.form
            && this.form.get("numPlates")
            && this.form.get("numPlates").value
            && +this.form.get("numPlates").value >= 0) {

            let numberOfPlatesToHave: number = +this.form.get("numPlates").value;

            if (numberOfPlatesToHave > 12) {
                numberOfPlatesToHave = 12;
            }
            if (numberOfPlatesToHave < 0) {
                numberOfPlatesToHave = 0;
            }

            while (numberOfPlatesToHave > this.allPlates.length) {
                this.allPlates.push({
                    label: ('Plate ' + (1 + this.allPlates.length)) + ' : ',
                    plateName: ('Plate ' + (1 + this.allPlates.length))
                });
            }

            if (numberOfPlatesToHave < this.allPlates.length) {
                this.allPlates.splice(+this.form.get("numPlates").value);
            }
        } else {
            this.allPlates = [];
        }

        this._experiment.generateHypotheticalSamplesBasedOnPlates(this.allPlates);
    }

    public onChangePlateName(event: any, plate: any): void {
        if (event
            && event.currentTarget
            && event.currentTarget.value
            && plate) {

            plate.plateName = event.currentTarget.value;
        }

        this._experiment.generateHypotheticalSamplesBasedOnPlates(this.allPlates);
    }

    public onAppChange(event): void {
        if (this.form
            && this.form.get("selectedApp")
            && this.form.get("selectedApp").value
            && this._experiment) {

            this._experiment.application_object = this.form.get("selectedApp").value;
        }

        if (this.form
            && this.form.get("selectedApp")
            && this.form.get("selectedApp").value
            && this.form.get("selectedApp").value.hasChipTypes
            && this.form.get("selectedApp").value.hasChipTypes === 'Y') {

            this.bioanalyzerChips = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.BIOANALYZER_CHIP_TYPE);

            if (this.bioanalyzerChips && Array.isArray(this.bioanalyzerChips)) {
                this.bioanalyzerChips = this.bioanalyzerChips.filter((a) => {
                    let temp = this.form.get("selectedApp").value;
                    return a.codeApplication
                        && this.form.get("selectedApp").value.codeApplication
                        && a.codeApplication === this.form.get("selectedApp").value.codeApplication;
                });

                for (let bioanalyzerChip of this.bioanalyzerChips) {
                    for (let price of this.bioanalyzerChipPrices) {
                        if (bioanalyzerChip.codeBioanalyzerChipType
                            && bioanalyzerChip.codeBioanalyzerChipType === price.codeBioanalyzerChipType) {
                            bioanalyzerChip.price = '$' + price.price;
                        }
                    }
                }

                this.bioanalyzerChips = this.bioanalyzerChips.sort(TabSeqSetupViewComponent.sortBySortOrderThenDisplay);
            }

            if (this.gridApi) {
                this.gridApi.setRowData(this.bioanalyzerChips);
            }
        }

        if (this.form && this.form.get("requiresCustomSpecification")) {
            if (this.form.get("selectedApp")
                && this.form.get("selectedApp").value
                && this.form.get("selectedApp").value.codeApplication
                && this.form.get("selectedApp").value.codeApplication === "OTHER") {

                this.form.get("requiresCustomSpecification").setValue(true);
            } else {
                this.form.get("requiresCustomSpecification").setValue(false);
            }
        }

        // if (this.requestCategory) {
        //     let property = this.propertyService.getProperty('qc_instructions', this.idCoreFacility, this.requestCategory.codeRequestCategory);
        //
        //     if (property) {
        //         this.noBioanalyzerChipTypesMessage = property.propertyValue;
        //     }
        // }
    }

    private static onChangeBioanalyzer(event): void {
        if (event && event.api && event.api.formGroup) {
            let selectedRows: any[] = event.api.getSelectedRows();

            if (selectedRows && Array.isArray(selectedRows) && selectedRows.length === 1) {
                event.api.formGroup.addControl('bioanalyzer', new FormControl('',[]));
                event.api.formGroup.get('bioanalyzer').setValue(selectedRows[0]);

                if (event.api._experiment) {
                    event.api._experiment.codeBioanalyzerChipType = selectedRows[0].codeBioanalyzerChipType;
                }
            } else if (selectedRows && Array.isArray(selectedRows) && selectedRows.length === 0) {
                event.api.formGroup.addControl('bioanalyzer', new FormControl('',[]));
                event.api.formGroup.get('bioanalyzer').setValue(null);

                if (event.api._experiment) {
                    event.api._experiment.codeBioanalyzerChipType = selectedRows[0].codeBioanalyzerChipType;
                }
            }
        }
    }

    public onDnaChange(event): void {
        if (this.form
            && this.form.get("selectedRna")
            && this.form.get("selectedRna").value) {

            this.form.get("selectedRna").setValue("");
        }

        this.setState();
        this.showSampleNotes = !!(this.form.get("selectedDna").value.notes);
        this.form.get("sampleTypeNotes").setValue(this.form.get("selectedDna").value.notes);
        this.sampleType = this.form.get("selectedDna").value;
        this._experiment.sampleType = this.sampleType;
        this.pickSampleType();
    }

    public onSelectedIsolationExtractionMethod(event): void {
        this.setState();

        if (this.form.get("selectedIsolationExtractionMethod")
            && this.form.get("selectedIsolationExtractionMethod").value) {

            this.isolationTypes = [];
            let temp = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ISOLATION_PREP_TYPE);

            if (temp && Array.isArray(temp)) {
                this.isolationTypes = temp.filter((value) => {
                    return value && value.isActive && value.isActive !== 'N' && value.type === this.form.get("selectedIsolationExtractionMethod").value;
                });
            }

            if (this.form && this.form.get("hasIsolationTypes")) {
                this.form.get("hasIsolationTypes").setValue(this.isolationTypes && Array.isArray(this.isolationTypes) && this.isolationTypes.length > 0);
            }
        }
    }

    public onChangeIsolationType(event: any): void {

        if (this.form.get("selectedIsolationExtractionMethod")
            && this.form.get("selectedIsolationExtractionMethod").value
            && this.form.get("selectedIsolationExtractionMethod").value === 'DNA') {

            this._experiment.coreToExtractDNA = 'Y';
        } else {
            this._experiment.coreToExtractDNA = '';
        }

        if (this.form.get("selectedIsolationType")
            && this.form.get("selectedIsolationType").value
            && this.form.get("selectedIsolationType").value.codeIsolationPrepType) {

            this._experiment.codeIsolationPrepType = this.form.get("selectedIsolationType").value.codeIsolationPrepType
        } else {
            this._experiment.codeIsolationPrepType = '';
        }
    }

    public onRnaChange(event): void {
        if (this.form.get("selectedDna").value) {
            this.form.get("selectedDna").setValue("");
        }

        this.setState();
        this.showSampleNotes = !!(this.form.get("selectedRna").value.notes);
        this.form.get("sampleTypeNotes").setValue(this.form.get("selectedRna").value.notes);
        this.sampleType = this.form.get("selectedRna").value;
        this._experiment.sampleType = this.sampleType;
        this.pickSampleType();
    }

    private setState(): void {
        if (this.requestCategory) {
            this.showSamplePrepContainer = true;
            this.showKeepSample = true;
            this.showSampleQualityExperimentType = false;
            this.requireSamplePrepContainer = false;
            this.showOrganism = true;
            this.requireOrganism = true;
            this.showSamplePurification = true;
            this.showQcInstructions = false;

            if (this.gnomexService.submitInternalExperiment()) {
                this.showSamplePrepContainer = false;
            }

            if (this.requestCategory.codeRequestCategory === "MDMISEQ") {
                this.showSamplePrepContainer = true;
                this.requireSamplePrepContainer = true;
                this.showSamplePurification = false;
                this.showKeepSample = false;
            }

            if (this.requestCategory.type === NewExperimentService.TYPE_SEQUENOM) {
                this.showSamplePrepContainer = false;
                this.requireSamplePrepContainer = false;
                this.showSamplePurification = false;
                this.showKeepSample = false;
                this.showSequenomExperimentType = true;
                this.showDefaultSampleNumber = false;
                this.showOrganism = false;
                this.requireOrganism = false;
            }

            if (this.requestCategory.codeRequestCategory === "DDPCR BR") {
                this.showSamplePurification = false;
                this.showKeepSample = false;
                this.showSamplePrepContainer = false;
            }

            if (this.form && this.form.get('showSampleQuality')) {
                this.form.get('showSampleQuality').setValue(this.requestCategory.type === "QC");
            }

            // if (this.requestCategory.codeRequestCategory === "QC" || this.requestCategory.codeRequestCategory === 'MDSQ') {}
            if (this.requestCategory.type === "QC") {
                this.showSamplePrepContainer = true;
                this.showKeepSample = false;
                this.showSampleQualityExperimentType = true;
                this.requireSamplePrepContainer = true;
                this.showOrganism = false;
                this.requireOrganism = false;
                this.showSamplePurification = false;
            }

            if (this.requestCategory.type === NewExperimentService.TYPE_NANOSTRING) {
                this.showSamplePrepContainer = true;
                this.requireSamplePrepContainer = true;
                this.showSamplePurification = false;
                this.showKeepSample = false;
            }

            if (this._experiment) {
                let qcInstText: any = this.propertyService.getProperty(PropertyService.PROPERTY_QC_INSTRUCTIONS, this._experiment.idCoreFacility, this._experiment.codeRequestCategory);

                if (qcInstText && qcInstText.propertyValue && qcInstText.propertyValue !== '') {
                    this.qcInstructions = qcInstText.propertyValue;
                    this.showQcInstructions = this.newExperimentService.isQCState();
                }
            }
        }
    }

    public qcInstructions: string = '';

    private pickSampleType(): void {
        if (this.sampleType){
            if (this.sampleType.codeNucleotideType === 'DNA'){
                this.showRnaseBox = true;
                this.showDnaseBox = false;
            } else if(this.sampleType.codeNucleotideType == 'RNA'){
                this.showRnaseBox = false;
                this.showDnaseBox = true;
            } else{
                this.showRnaseBox = false;
                this.showDnaseBox = false;
            }
        }

        if (this.newExperimentService.isSequenomState() || this.newExperimentService.isClinicalSequenomState()) {
            return;
        }
        // Select the default organism on sample setup if the request category specifies one
        if (!this.newExperimentService.isQCState()) {
            if (!this.form.get("organism")) {
                if (this.requestCategory && this.requestCategory.idOrganism) {
                    let organism = this.dictionaryService.getEntry('hci.gnomex.model.OrganismLite',this.requestCategory.idOrganism);
                    if ( this.securityAdvisor.isArray(organism)) {
                        this.form.get("organism").setValue(organism[0].idOrganism);
                        return;

                    } else {
                        this.form.get("organism").setValue(organism.idOrganism);
                        return;
                    }
                }
            }
        }
    }

    public onGridReady(event: any): void {
        if (!event) {
            return;
        }

        this.gridApi = event.api;

        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }

        this.gridApi.setColumnDefs(this.bioanalyzerColumnDefs);
        this.gridApi.setRowData(this.bioanalyzerChips);
        this.gridApi.sizeColumnsToFit();

        this.gridApi._experiment = this._experiment;
    }



    public selectOrganism(event): void {
        if (event && (!event.idLab || event.idLab !== "0")) {
            this._experiment.organism = this.dictionaryService.getEntry('hci.gnomex.model.OrganismLite', this.form.get("organism").value.idOrganism);
        }
    }

    public onReagentChanged(event): void {
        this._experiment.reagent = this.form.get("reagent").value;
    }

    public onElutionChanged(event): void {
        this._experiment.elutionBuffer = this.form.get("elution").value;
    }

    public onExtractionMethodChanged(event): void {
        this._experiment.extractionMethod = this.form.get("extractionMethod").value;
    }

    public onDnaseChanged(event): void {
        if (event.checked) {
            this._experiment.usedDnase = 'Y';
        }
    }

    public onRnaseChanged(event): void {
        if (event.checked) {
            this._experiment.usedRnase = 'Y';
        }
    }

    public onChangeAddQubit(event): void {
        if (this.form && this.form.get('addQubit') && this._experiment) {
            this._experiment.includeQubitConcentration = this.form.get('addQubit').value ? 'Y' : 'N';
        }
    }

    public onChangeBMPPickup(event): void {
        if (this.form && this.form.get('notifyBMP') && this._experiment) {
            // this looks like an error and may be, but is a duplication of the logic from the flex version.  See TabSampleSetupView.mxml:1259
            this._experiment.includeQubitConcentration = this.form.get('notifyBMP').value ? 'Y' : 'N';
        }
    }

    public onKeepChange(event): void {
        if (event.value === 1) {
            this._experiment.keepSamples = 'Y';
        } else {
            this._experiment.keepSamples = 'N';
        }
    }

    public onSelectSampleSource(event: any): void {
        if (event) {
            this._experiment.idSampleSource = event.value;
        }
    }

    public onInputCoreFacilityNotes(event: any): void {
        if (!event) {
            return;
        }

        if (this.form && this.form.get("coreNotes")) {
            if (this.form.get("coreNotes").value) {
                this._experiment.corePrepInstructions = this.form.get("coreNotes").value;
            } else {
                this._experiment.corePrepInstructions = '';
            }
        }
    }

    public onContainerChange(event: any): void {
        if (this._experiment) {
            if (event && event.value) {
                this._experiment.containerType = '' + event.value;

                if (this.form && this.form.get("isUsingPlates")) {
                    if (event.value === "PLATE") {
                        this.form.get("isUsingPlates").setValue(true);
                    } else {
                        this.form.get("isUsingPlates").setValue(false);

                        this._experiment.numberOfSamples = '' + this._experiment.requiredNumberOfSamples;
                    }
                }
            } else {
                this._experiment.containerType = '';

                if (this.form && this.form.get("isUsingPlates")) {
                    this.form.get("isUsingPlates").setValue(false);
                }
            }
        }

        // Spoofing selecting 1 to create a default plate
        if (this.form && this.form.get("numPlates")) {
            if (event.value === "PLATE") {
                this.form.get("numPlates").setValue('1');
                this.onChange_numberOfPlates({ value: '1' });
            } else {
                this.form.get("numPlates").setValue('');
                this.onChange_numberOfPlates({ value: '' });
            }
        }
    }

    public onChange_otherSpecification(event: any): void {
        if (this._experiment) {
            if (event && event.value) {
                this._experiment.applicationNotes       = '' + event.value;
                this._experiment.applicationDescription = '' + event.value;
            } else {
                this._experiment.applicationNotes = '';
                this._experiment.applicationDescription = '';
            }
        }
    }
}
