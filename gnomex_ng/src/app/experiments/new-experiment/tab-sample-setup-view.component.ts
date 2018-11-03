import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GnomexService} from "../../services/gnomex.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {DictionaryService} from "../../services/dictionary.service";
import {MatOption, MatAutocomplete} from "@angular/material";
import {Subscription} from "rxjs";
import {AnnotationService} from "../../services/annotation.service";
import {AnnotationTabComponent} from "../../util/annotation-tab.component";

@Component({
    selector: "tabSampleSetupView",
    templateUrl: "./tab-sample-setup-view.component.html",
    styles: [`        
        .row-one {
            display: flex;
            flex-grow: 1;
        }
        .row-one-quarter {
            display: flex;
            flex-grow: 1;
        }
        .exp-type-radio-group {
            display: inline-flex;
            flex-direction: column;
        }
        .mat-button.mat-small {
            min-width: 1%;
        }
        mat-form-field.formField {
            width: 30%;
            margin: 0 0.5em;
        }
        .flex-container{
            display: flex;
            margin-top: 1em;
            padding-left: 1em;
        }
        .inline-span {
            width: 20em;
            display: inline-block;
        }
        mat-radio-button.radioOption {
            margin: 0 0.25rem;
        }
        /deep/ .mat-checkbox .mat-checkbox-label {
            font-size: .75rem;
        }
        /deep/ .mat-checkbox .mat-checkbox-inner-container{
            height: 15px;
            width: 15px;
        }

    `]
})

export class TabSampleSetupViewComponent implements OnInit {
    public currState: string;
    @Input() requestCategory: any;

    @Output() indexEvent = new EventEmitter<string>();
    @Output() goBack = new EventEmitter<string>();
    @Output() goNext = new EventEmitter<string>();
    @ViewChild("autoOrg") orgAutocomplete: MatAutocomplete;
    public form: FormGroup;
    private sampleType: any;
    private filteredSampleTypeListDna: any[] = [];
    private filteredSampleTypeListRna: any[] = [];
    private filteredChipTypeList: any[] = [];
    private previousOrganismMatOption: MatOption;
    private sampleSetupContainer: boolean = true;
    private showSampleNotes: boolean = false;
    private showSamplePrepContatainer: boolean = true;
    private showRnaseBox: boolean = false;
    private showDnaseBox: boolean = false;

    constructor(private dictionaryService: DictionaryService,
                public newExperimentService: NewExperimentService,
                private annotationService: AnnotationService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private gnomexService: GnomexService,
                private fb: FormBuilder) {

        this.form = this.fb.group({
            numSamples: ['', Validators.required],
            selectedDna: [''],
            selectedRna: [''],
            sampleTypeNotes: [''],
            organism: ['', Validators.required],
            reagent: ['', [Validators.required, Validators.maxLength(100)]],
            elution: ['', [Validators.required, Validators.maxLength(100)]],
            dnaseBox: [''],
            rnaseBox: [''],
            keepSample: ['', Validators.required],
            acid: [''],
            coreNotes: ['', [Validators.maxLength(5000)]],
        }, { validator: this.oneCategoryRequired});
    }

    ngOnInit() {
        this.newExperimentService.organisms = this.gnomexService.activeOrganismList;
        this.newExperimentService.currentState.subscribe((value) =>{
            if (value) {
                this.currState = value;
                this.buildSampleTypes();
            }
        });
        this.newExperimentService.sampleSetupView = this;
        this.form.markAsPristine();
    }

    oneCategoryRequired(group : FormGroup) : {[s:string ]: boolean} {
        if (group) {
            if(group.controls['selectedDna'].value || group.controls['selectedRna'].value) {
                return null;
            }
        }
        return {'error': true};
    }

    ngOnChanges() {
        if (this.filteredSampleTypeListDna.length === 0 && this.requestCategory) {
            this.filteredSampleTypeListDna = this.newExperimentService.filterSampleType("DNA", this.currState, this.requestCategory)
                .sort(this.newExperimentService.sortSampleTypes);
        }
        if (this.filteredSampleTypeListRna.length === 0 && this.requestCategory) {
            this.filteredSampleTypeListRna = this.newExperimentService.filterSampleType("RNA", this.currState, this.requestCategory)
                .sort(this.newExperimentService.sortSampleTypes);
        }
        if (this.newExperimentService.sampleTypes.length === 0) {
            this.newExperimentService.sampleTypes = this.newExperimentService.sampleTypes.concat(this.filteredSampleTypeListDna);
            this.newExperimentService.sampleTypes = this.newExperimentService.sampleTypes.concat(this.filteredSampleTypeListRna);
        }
    }


    buildSampleTypes() {
        if (this.filteredSampleTypeListDna.length === 0 && this.requestCategory) {
            this.filteredSampleTypeListDna = this.newExperimentService.filterSampleType("DNA", this.currState, this.requestCategory)
                .sort(this.newExperimentService.sortSampleTypes);
        }
        if (this.filteredSampleTypeListRna.length === 0 && this.requestCategory) {
            this.filteredSampleTypeListRna = this.newExperimentService.filterSampleType("RNA", this.currState, this.requestCategory)
                .sort(this.newExperimentService.sortSampleTypes);
        }

    }

    onDnaChange(event) {
        if (this.form.get("selectedRna").value) {
            this.form.get("selectedRna").setValue("");
        }
        this.setState("");
        this.showSampleNotes = this.form.get("selectedDna").value.notes ? true : false;;
        this.sampleType = this.form.get("selectedDna").value;
        this.newExperimentService.sampleType = this.sampleType;
        this.pickSampleType();
    }

    onRnaChange(event) {
        if (this.form.get("selectedDna").value) {
            this.form.get("selectedDna").setValue("");
        }
        this.setState("");
        this.showSampleNotes = this.form.get("selectedRna").value.notes ? true : false;
        this.sampleType = this.form.get("selectedRna").value;
        this.newExperimentService.sampleTypes = this.filteredSampleTypeListRna;
        this.newExperimentService.sampleType = this.sampleType;
        this.pickSampleType();
    }

    setState(state) {
        if (this.requestCategory) {
            if (this.requestCategory.codeRequestCategory === "MDMISEQ") {
                //TODO this.sampleSetupView.currentState = 'MDMiSeqState';
            }
            if (this.gnomexService.submitInternalExperiment()) {
                this.currState = "SolexaSetupState";
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

        if (this.newExperimentService.isSequenomState(this.currState) || this.newExperimentService.isClinicalSequenomState(this.currState)) {
            return;
        }
        // Select the default organism on sample setup if the request category specifies one
        if (!this.newExperimentService.isQCState(this.currState)) {
            if (!this.form.get("organism")) {
                if (this.requestCategory.idOrganism) {
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
        // this.newExperimentService.selectedIndex = 2;
    }

    chooseFirstOrgOption(): void {
        this.orgAutocomplete.options.first.select();
    }

    displayOrg(org: any) {
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

    selectOrgOption(event) {
        if (event != undefined && event.source.value && event.source.value.idLab !== "0") {
            this.form.get("organism").setValue(event.source.value);
            this.newExperimentService.annotations = this.newExperimentService.filterAnnotations(event.source.value.idOrganism);
            this.indexEvent.emit('+');
            this.newExperimentService.organism = this.form.get("organism").value;
            this.newExperimentService.propertyEntriesForUser = this.newExperimentService.filterPropertiesByUser(this.newExperimentService.propertyEntries);
            this.setAnnotations(this.newExperimentService.annotations);
            this.newExperimentService.propertyEntriesForUser.sort(AnnotationService.sortProperties);
            this.newExperimentService.propEntriesChanged.next(true);
        }
    }

    setAnnotations(annotations: any) {
        for (let component of this.newExperimentService.components) {
            if (component instanceof AnnotationTabComponent) {
                component.annotations = annotations;
            }
        }
    }

    onReagentChanged(event) {
        this.newExperimentService.request.reagent = this.form.get("reagent").value;
    }

    onElutionChanged(event) {
        this.newExperimentService.request.elutionBuffer = this.form.get("elution").value;

    }

    onDnaseChanged(event) {
        if (event.checked) {
            this.newExperimentService.request.usedDnase = 'Y';
        }
    }

    onRnaseChanged(event) {
        if (event.checked) {
            this.newExperimentService.request.usedRnase = 'Y';
        }
    }

    onKeepChange(event) {
        if (event.value === 1) {
            this.newExperimentService.request.keepSamples = 'Y';
        } else {
            this.newExperimentService.request.keepSamples = 'N';
        }
    }

    onGridReady(event) {

    }

    setNumSamples(event) {
        this.newExperimentService.numSamples = this.form.get("numSamples").value;
        // this.newExperimentService.numSamplesChanged.next(true);
    }

    onTypeChange(event) {

    }

    selectType(event) {

    }


}
