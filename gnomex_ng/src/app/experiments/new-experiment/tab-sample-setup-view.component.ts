import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {GnomexService} from "../../services/gnomex.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {
    Experiment, NewExperimentService, Organism,
    Sample
} from "../../services/new-experiment.service";
import {DictionaryService} from "../../services/dictionary.service";
import {MatOption, MatAutocomplete} from "@angular/material";
import {Subscription} from "rxjs";
import {AnnotationService} from "../../services/annotation.service";
import {AnnotationTabComponent} from "../../util/annotation-tab.component";

@Component({
    selector: "tabSampleSetupView",
    templateUrl: "./tab-sample-setup-view.component.html",
    styles: [`
        
        .heading {
            width: 30%;
            min-width: 20em;
            padding-right: 2em;
        }
        
        
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

export class TabSampleSetupViewComponent implements OnInit {
    // public currentState: string;
    @Input() requestCategory: any;
    @Input("experiment") set experiment(value: Experiment) {
        this._experiment = value;
    };

    @Input("organism") set organism(value: Organism) {
        this._organism = value;
    };

    @Output() onChangeSampleData = new EventEmitter<any>();

    @ViewChild("autoOrg") orgAutocomplete: MatAutocomplete;

    public form: FormGroup;

    private _experiment: Experiment;
    private _organism: Organism;

    private sampleType: any;
    private filteredSampleTypeListDna: any[] = [];
    private filteredSampleTypeListRna: any[] = [];
    private previousOrganismMatOption: MatOption;
    private showSampleNotes: boolean = false;
    private showSamplePrepContatainer: boolean = true;
    private showRnaseBox: boolean = false;
    private showDnaseBox: boolean = false;



    get numberOfSamples(): number|string {
        return this._experiment.numberOfSamples;

        // return this.newExperimentService.numSamples;
    }

    set numberOfSamples(value: number|string) {
        this._experiment.numberOfSamples = '' + value;

        this.newExperimentService.numSamples = '' + value;

        if (!this._experiment.samples) {
            this._experiment.samples = [];
        }

        // while (this._experiment.samples.length < +value) {
        //     let newSample = new Sample();
        //     newSample.idOrganism = this._organism ? this._organism.idOrganism : '';
        //
        //     this._experiment.samples.push();
        // }
    }


    public get showElution(): boolean {
        return this.newExperimentService.currentState !== 'QCState';
    }

    constructor(private dictionaryService: DictionaryService,
                public newExperimentService: NewExperimentService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private gnomexService: GnomexService,
                private fb: FormBuilder) {

        this.form = this.fb.group({
                numSamples:      ['', [Validators.pattern(/^\d+$/)]],
                selectedDna:     [''],
                selectedRna:     [''],
                sampleTypeNotes: [''],
                organism:        [''],
                reagent:         ['', [Validators.maxLength(100)]],
                elution:         ['', [Validators.maxLength(100)]],
                dnaseBox:        [''],
                rnaseBox:        [''],
                keepSample:      [''],
                acid:            [''],
                coreNotes:       ['', [Validators.maxLength(5000)]]
            },
            { validator: TabSampleSetupViewComponent.oneCategoryRequired }
        );
    }

    // private validator_elution_requiredIfVisible(formControl: FormControl): any {
    //     if (this.showElution && (!formControl || !formControl.value)) {
    //         return { 'requiredIfVisible': true };
    //     } else {
    //         return null;
    //     }
    // }

    ngOnInit() {
        this.newExperimentService.organisms = this.gnomexService.activeOrganismList;
        this.newExperimentService.currentState_onChangeObservable.subscribe((value) =>{
            if (value) {
                // this.currentState = value;
                this.buildSampleTypes();
            }
        });
        this.newExperimentService.sampleSetupView = this;
        this.form.markAsPristine();
    }

    private static oneCategoryRequired(group: FormGroup): { [s:string]: boolean } {
        if (group && (group.controls['selectedDna'].value || group.controls['selectedRna'].value)) {
            return null;
        }

        return { 'error': true };
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
        if (this.newExperimentService.sampleTypes.length === 0) {
            this.newExperimentService.sampleTypes = this.newExperimentService.sampleTypes.concat(this.filteredSampleTypeListDna);
            this.newExperimentService.sampleTypes = this.newExperimentService.sampleTypes.concat(this.filteredSampleTypeListRna);
        }
    }

    public filterSampleType(codeNucleotideType: string): any[] {
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


    buildSampleTypes() {
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

    onDnaChange(event) {
        if (this.form
            && this.form.get("selectedRna")
            && this.form.get("selectedRna").value) {

            this.form.get("selectedRna").setValue("");
        }

        this.setState();
        this.showSampleNotes = !!(this.form.get("selectedDna").value.notes);
        this.sampleType = this.form.get("selectedDna").value;
        this.newExperimentService.sampleType = this.sampleType;
        this.pickSampleType();
    }

    onRnaChange(event) {
        if (this.form.get("selectedDna").value) {
            this.form.get("selectedDna").setValue("");
        }
        this.setState();
        this.showSampleNotes = !!(this.form.get("selectedRna").value.notes);
        this.sampleType = this.form.get("selectedRna").value;
        this.newExperimentService.sampleTypes = this.filteredSampleTypeListRna;
        this.newExperimentService.sampleType = this.sampleType;
        this.pickSampleType();
    }

    setState() {
        if (this.requestCategory) {
            if (this.requestCategory.codeRequestCategory === "MDMISEQ") {
                //TODO this.sampleSetupView.currentState = 'MDMiSeqState';
            }
            if (this.gnomexService.submitInternalExperiment()) {
                // this.currentState = "SolexaSetupState";
                // this.newExperimentService.currentState = "SolexaSetupState";
                this.newExperimentService.currentState = "SolexaBaseState";
                this.showSamplePrepContatainer = false;
            }
        }
    }

    selectDna(event) {
    }

    selectRna(event) {
    }

    pickSampleType() {
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

        // TODO parentDocument.samplesView.initializeSamplesGrid();

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

    chooseFirstOrgOption(): void {
        this.orgAutocomplete.options.first.select();
    }

    public displayOrg(org: any) {
        return org ? org.combinedName : org;
    }

    highlightDtOrgFirstOption(event): void {
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

    filterOrganism(selectedOrganism: any): any[] {
        let fOrgs: any[] = [];
        if (selectedOrganism) {
            if (selectedOrganism.idOrganism) {
                fOrgs = this.newExperimentService.organisms.filter(org =>
                    org.combinedName.toLowerCase().indexOf(selectedOrganism.combinedName.toLowerCase()) >= 0);
                return fOrgs;
            } else {
                fOrgs = this.newExperimentService.organisms.filter(org =>
                    org.combinedName.toLowerCase().indexOf(selectedOrganism.toLowerCase()) >= 0);
                return fOrgs;
            }
        } else {
            return this.newExperimentService.organisms;
        }
    }

    public selectOrganism(event): void {
        if (event !== undefined && event.source && event.source.value && event.source.value.idLab !== "0") {
            // needed for an input with autocomplete instead of a matselect.
            this.form.get("organism").setValue(event.source.value);

            this._experiment.organism = this.form.get("organism").value;

            this.onChangeSampleData.emit({});

            // this._experiment.RequestProperties = this._experiment.filterExperimentAnnotations();

            this.newExperimentService.organism = this.form.get("organism").value;
            // this.newExperimentService.propertyEntriesForUser = this.newExperimentService.filterPropertiesByUser(this.newExperimentService.propertyEntries);
            this.newExperimentService.propertyEntriesForUser = this._experiment.filterPropertiesByUser(this._experiment.RequestProperties);

            // this.setAnnotations(this.newExperimentService.annotations);
            // this.setAnnotations(this._experiment.RequestProperties);
            // this.newExperimentService.propertyEntriesForUser.sort(AnnotationService.sortProperties);

            // this._experiment.RequestProperties.sort(AnnotationService.sortProperties);

            // this.newExperimentService.propEntriesChanged.next(true);
            // this._experiment.onChange_propertyEntries.next(true);
        }
    }

    // setAnnotations(annotations: any) {
    //     for (let component of this.newExperimentService.components) {
    //         if (component instanceof AnnotationTabComponent) {
    //             component.annotations = annotations;
    //         }
    //     }
    // }

    onReagentChanged(event) {
        this._experiment.reagent                  = this.form.get("reagent").value;
        this.newExperimentService.request.reagent = this.form.get("reagent").value;
    }

    onElutionChanged(event) {
        this._experiment.elutionBuffer                  = this.form.get("elution").value;
        this.newExperimentService.request.elutionBuffer = this.form.get("elution").value;
    }

    onDnaseChanged(event) {
        if (event.checked) {
            this._experiment.usedDnase                  = 'Y';
            this.newExperimentService.request.usedDnase = 'Y';
        }
    }

    onRnaseChanged(event) {
        if (event.checked) {
            this._experiment.usedRnase                  = 'Y';
            this.newExperimentService.request.usedRnase = 'Y';
        }
    }

    onKeepChange(event) {
        if (event.value === 1) {
            this._experiment.keepSamples                  = 'Y';
            this.newExperimentService.request.keepSamples = 'Y';
        } else {
            this._experiment.keepSamples                  = 'N';
            this.newExperimentService.request.keepSamples = 'N';
        }
    }

    onGridReady(event) {

    }

    onTypeChange(event) {

    }

    selectType(event) {

    }


}
