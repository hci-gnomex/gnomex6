import {Component, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {MatDialog} from "@angular/material";
import {GnomexService} from "../../services/gnomex.service";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: "tabBioinformaticsView",
    templateUrl: "./tab-bioinformatics-view.component.html",
    styles: [`
        button.link-button {
            background: none;
            background-color: inherit;
            border: none;
            padding: 0;
            text-decoration: underline;
            cursor: pointer;
        }
        .questions-assist {
            background-color: lightyellow;
            font-size: small;
        }
        .anal-assist-email {
            font-size: small;
            text-decoration: underline;
            color: blue;
        }
        .anal-note {
            width: 40em;
        }
    `]
})

export class TabBioinformaticsViewComponent implements OnInit {
    private questionsLabel: string = "Questions? Please Contact the ";
    private atLabel: string  = " at:   ";
    private alignToLabel: string = "Do you want the sequence data to be aligned?";
    private analysisAssistLabel: string = "Would you like the ";
    private bioAnalysisNote: string;
    private assistLabel: string = " to assist you with analysis?";
    private analysisAssistanceGroup: string;
    private analysisAssistanceHeader: string;
    private genomeBuilds: any[] = [];
    private selectedOrganism: string = "";
    private bioEmail: string;
    private form: FormGroup;
    private organisms: any[] = [];

    constructor(private dictionaryService: DictionaryService,
                private newExperimentService: NewExperimentService,
                private gnomexService: GnomexService,
                dialog: MatDialog, private fb: FormBuilder
    ) {

    }

    ngOnInit() {
        this.newExperimentService.organismChanged.subscribe((value) => {
            if (this.newExperimentService.organismChanged.value === true) {
                this.newExperimentService.organismChanged.next(false);
            }

            let organismsFormArray: any[] = [];
            this.organisms = Array.from(this.newExperimentService.sampleOrganisms);

            for (let org of this.organisms) {
                organismsFormArray.push(this.fb.group({
                    alignToGenome: '',
                    selectGenomeBuild: '',
                }));
            }
            this.form = this.fb.group({
                analAssist: [''],
                analysisNote: [''],
                orgList: this.fb.array(organismsFormArray),
            });
        });
        this.analysisAssistanceGroup = this.gnomexService.getCoreFacilityProperty(this.newExperimentService.idCoreFacility, this.gnomexService.PROPERTY_ANALYSIS_ASSISTANCE_GROUP);
        this.analysisAssistanceHeader = this.gnomexService.getCoreFacilityProperty(this.newExperimentService.idCoreFacility, this.gnomexService.PROPERTY_ANALYSIS_ASSISTANCE_HEADER);
        this.bioEmail = this.gnomexService.getCoreFacilityProperty(this.newExperimentService.idCoreFacility, this.gnomexService.PROPERTY_CONTACT_EMAIL_BIOINFORMATICS);
        this.bioAnalysisNote = this.gnomexService.getCoreFacilityProperty(this.newExperimentService.idCoreFacility, this.gnomexService.PROPERTY_REQUEST_BIO_ANALYSIS_NOTE);
    }

    get orgList(): FormArray {
        return this.form.get('orgList') as FormArray;
    };


    onGenomeBuildSelection(event) {

    }

    onIsAlignChange(event, i) {
        let org = [...this.newExperimentService.sampleOrganisms][i];
        this.genomeBuilds[i] = this.newExperimentService.getFilteredGenomeBuildList(org.idOrganism);
    }
}
