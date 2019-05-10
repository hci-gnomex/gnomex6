import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

import {MatOption, MatAutocomplete} from "@angular/material";

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

        
        .green {
            color: green;
        }
        
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
        
        .major-padding { padding: 1em; }
        
        .blue { color: blue; }
        
        
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

    @ViewChild("autoOrg") orgAutocomplete: MatAutocomplete;
    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    public form: FormGroup;

    private _experiment: Experiment;
    private _organism: Organism;

    private sampleType: any;
    public filteredSampleTypeListDna: any[] = [];
    public filteredSampleTypeListRna: any[] = [];
    private previousOrganismMatOption: MatOption;
    private showSampleNotes: boolean = false;
    public showSamplePrepContainer: boolean = true;
    public showKeepSample: boolean = true;
    public requireSamplePrepContainer: boolean = false;
    public showSampleQualityExperimentType: boolean = false;
    private showOrganism: boolean = true;
    private showSamplePurification: boolean = true;
    private showQcInstructions: boolean = true;
    private showRnaseBox: boolean = false;
    private showDnaseBox: boolean = false;

    private organisms: any[] = [];
    public filteredApplications: any[] = [];

    private bioanalyzerChips: any[] = [];
    private bioanalyzerChipPrices: any[] = [];

    public isolationTypes: any[] = [];
    public sampleSources: any[] = [];

    private emToPxConversionRate: number = 13;

    private gridApi;

    public noBioanalyzerChipTypesMessage = '';

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

    private get bioanalyzerColumnDefs(): any[] {
        let temp: any[] = [];

        temp.push({
            headerName: "",
            editable: true,
            field: "",
            checkboxSelection: true,
            width: 22,
            maxWidth: 22,
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
                private propertyService: PropertyService,
                private fb: FormBuilder) {

        this.form = this.fb.group({
                numSamples:                        ['', [Validators.pattern(/^\d+$/)]],
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
                sampleTypeNotes:                   [''],
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
    }

    public onAppChange(event): void {
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

            if (this._experiment) {
                this._experiment.codeApplication = this.form.get("selectedApp").value.codeApplication;
            }

            if (this.gridApi) {
                this.gridApi.setRowData(this.bioanalyzerChips);
            }
        }

        if (this.requestCategory) {
            let property = this.propertyService.getProperty('qc_instructions', this.idCoreFacility, this.requestCategory.codeRequestCategory);

            if (property) {
                this.noBioanalyzerChipTypesMessage = property.propertyValue;
            }
        }
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
                this.showSamplePurification = false;
            }

            if (this._experiment) {
                let qcInstText: string = this.propertyService.getExactProperty(this._experiment.idCoreFacility, this._experiment.codeRequestCategory, PropertyService.PROPERTY_QC_INSTRUCTIONS);

                if (qcInstText != null && qcInstText != '') {
                    this.qcInstructions = qcInstText;
                    this.showQcInstructions = true;
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
                        this.form.get("organism").setValue(organism[0]);
                        return;

                    } else {
                        this.form.get("organism").setValue(organism);
                        return;
                    }
                }
            }
        }
    }

    public display_generic(value: any): void {
        return value ? (typeof(value) === 'string' ? value : value.display) : '';
    }

    public chooseFirstOrgOption(): void {
        this.orgAutocomplete.options.first.select();
    }

    public displayOrg(org: any): void {
        return org ? org.combinedName : org;
    }

    public highlightDtOrgFirstOption(event): void {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.orgAutocomplete.options.first) {
            if (this.previousOrganismMatOption) {
                this.previousOrganismMatOption.setInactiveStyles();
            }
            this.orgAutocomplete.options.first.setActiveStyles();
            this.previousOrganismMatOption = this.orgAutocomplete.options.first;
        }
    }

    public filterOrganism(selectedOrganism: any): any[] {
        let fOrgs: any[] = [];
        if (selectedOrganism) {
            if (selectedOrganism.idOrganism) {
                fOrgs = this.organisms.filter(org =>
                    org.combinedName.toLowerCase().indexOf(selectedOrganism.combinedName.toLowerCase()) >= 0);
                return fOrgs;
            } else {
                fOrgs = this.organisms.filter(org =>
                    org.combinedName.toLowerCase().indexOf(selectedOrganism.toLowerCase()) >= 0);
                return fOrgs;
            }
        } else {
            return this.organisms;
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
        if (event !== undefined && event.source && event.source.value && event.source.value.idLab !== "0") {
            // needed for an input with autocomplete instead of a matselect.
            this.form.get("organism").setValue(event.source.value);

            this._experiment.organism = this.form.get("organism").value;
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
        if (event
            && event.isUserInput
            && event.isUserInput === true
            && event.source
            && event.source.value) {

            this._experiment.idSampleSource = event.source.value.value;
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
}
