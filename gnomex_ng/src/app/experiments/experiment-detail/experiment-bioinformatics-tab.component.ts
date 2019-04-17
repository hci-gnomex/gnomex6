import {Component, Input} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {PropertyService} from "../../services/property.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Experiment} from "../../util/models/experiment.model";
import {GnomexService} from "../../services/gnomex.service";

@Component({
    selector: 'experiment-bioinformatics-tab',
    templateUrl: 'experiment-bioinformatics-tab.component.html',
    styles: [`
        
        .margin-top { margin-top: 0.5rem; }
        
        
        .label {
            color: blue;
            font-style: italic;
            
            padding: 0.3em;
        }
        
        .label-width {
            min-width: 12em;
        }
        
        
        .medium-width { width: 24em; }
        
        
        .min-size { width: fit-content; }
        
        
        .margin { margin: 0 2em; }
        
        
        .bold { font-weight: bold; }
        
        .small-font { font-size: small; }
        
        
        .disabled-color { color: #646464; }
        
        
        .highlight { background-color: #FFFEB3; }
        
        
        .bordered { border: 1px solid silver; }
        
        .disable-bordered { border: 1px solid #E0E0E0; }
        .enable-bordered  { border: 1px solid #A0A0A0; }
        
        .link-button {
            color: blue;
            text-decoration: underline;
        }
        
    `]
})
export class ExperimentBioinformaticsTabComponent {

    @Input('experiment') set experiment(experiment: any) {

        if (experiment instanceof Experiment) {
            this._experiment = experiment;
        } else {
            this._experiment = Experiment.createExperimentObjectFromAny(this.dictionaryService,
                this.gnomexService,
                this.propertyService,
                this.createSecurityAdvisorService,
                experiment);
        }

        if (this._experiment && this._experiment.sequenceLanes) {

            if (!Array.isArray(this._experiment.sequenceLanes)) {
                this._experiment.sequenceLanes = [this._experiment.sequenceLanes.SequenceLane];
            }

            if (this._experiment.sequenceLanes.length === 0) {
                this.flag_isANewExperiment = true;
            }

            this.prepareComponent();

            this.header        = this.getStringValuedProperty(PropertyService.PROPERTY_ANALYSIS_ASSISTANCE_HEADER,   this._experiment.idCoreFacility);
            this.groupName     = this.getStringValuedProperty(PropertyService.PROPERTY_ANALYSIS_ASSISTANCE_GROUP,    this._experiment.idCoreFacility);
            this.alignmentNote = this.getStringValuedProperty(PropertyService.PROPERTY_REQUEST_BIO_ALIGNMENT_NOTE,   this._experiment.idCoreFacility);
            this.analysisNote  = this.getStringValuedProperty(PropertyService.PROPERTY_REQUEST_BIO_ANALYSIS_NOTE,    this._experiment.idCoreFacility);
            this.linkUrl       = this.getStringValuedProperty(PropertyService.PROPERTY_CONTACT_EMAIL_BIOINFORMATICS, this._experiment.idCoreFacility);
        }
    }

    get experiment(): any {
        if (this._experiment) {
            return this._experiment;
        } else {
            return {};
        }
    }

    set bioinformaticsAssist(value: boolean) {
        if (this._experiment) {
            this._experiment.bioinformaticsAssist = value ? 'Y' : 'N';
        }
    }
    get bioinformaticsAssist(): boolean {
        return this._experiment && this._experiment.bioinformaticsAssist && this._experiment.bioinformaticsAssist === 'Y';
    }

    public masterDisabled: boolean = false;
    public form: FormGroup;

    public organismName: string = '';
    public alignToGenomeBuild: string = 'N';
    public genomeBuild: string = '';

    public sampleOrganisms: any[] = [];
    public sampleGenomeBuilds: any[] = [];

    private _experiment: any;

    private flag_isANewExperiment: boolean = false;

    private cachedGenomeBuilds: any[] = [];

    public header: string = '';
    public groupName: string = '';
    public alignmentNote: string = '';
    public analysisNote: string = '';
    public linkUrl: string = '';

    public consolidatedGenomeInformation: {
        idGenomeBuildAlignTo: string,
        idOrganism: string,
        organismName: string,
        alignToGenomeBuild: boolean,
        dictionary: any[],
        sequenceLane: any
    }[] = [];


    constructor(private dictionaryService: DictionaryService,
                private formBuilder: FormBuilder,
                private gnomexService: GnomexService,
                private propertyService: PropertyService,
                public createSecurityAdvisorService: CreateSecurityAdvisorService) {

        this.cachedGenomeBuilds =  this.dictionaryService.getEntries('hci.gnomex.model.GenomeBuildLite');
        this.form = this.formBuilder.group({});
    }


    public onCheckboxChanged(item: any, event: any) {
        if (this._experiment && this._experiment.sequenceLanes) {
            if (!Array.isArray(this._experiment.sequenceLanes)) {
                this._experiment.sequenceLanes = [this._experiment.sequenceLanes.SequenceLane];
            }

            let lanesToChange = this._experiment.sequenceLanes.filter((a) => {
                return a.idOrganism === item.idOrganism;
            });

            if (event.value) {
                for (let lanes of lanesToChange) {
                    lanes.idGenomeBuildAlignTo = event.value ? event.value : '';
                }
            } else {
                for (let lanes of lanesToChange) {
                    lanes.idGenomeBuildAlignTo = event.value ? event.value : '';
                }
            }
        }
    }

    public onSelectChanged(item: any, event: any) {
        if (this._experiment && this._experiment.sequenceLanes) {
            if (!Array.isArray(this._experiment.sequenceLanes)) {
                this._experiment.sequenceLanes = [this._experiment.sequenceLanes.SequenceLane];
            }

            let lanesToChange = this._experiment.sequenceLanes.filter((a) => {
                return a.idOrganism === item.idOrganism;
            });

            for (let lanes of lanesToChange) {
                lanes.idGenomeBuildAlignTo = event.value ? event.value : '';
            }
        }
    }

    private getStringValuedProperty(propertyName: string, idCoreFacility: string): string {
        let result: string = '';
        let temp = this.propertyService.getProperty(propertyName, idCoreFacility);

        if (temp) {
            result = temp.propertyValue ? temp.propertyValue : '';
        }

        return result;
    }

    private prepareComponent(): void {

        this.genomeBuild = '';
        this.sampleGenomeBuilds = [];

        let consolidatedGenomeBuildIds: Set<string> = new Set();
        let consolidatedOrganismIds: Set<string> = new Set();
        this.consolidatedGenomeInformation = [];

        if (this._experiment.sequenceLanes
            && Array.isArray(this._experiment.sequenceLanes)
            && !this.flag_isANewExperiment) {

            for (let sequenceLane of this._experiment.sequenceLanes) {
                let idGenomeBuildAlignTo: string = '';
                let idOrganism: string = '';

                if (sequenceLane && sequenceLane.idGenomeBuildAlignTo) {
                    consolidatedGenomeBuildIds.add(sequenceLane.idGenomeBuildAlignTo);
                    idGenomeBuildAlignTo = sequenceLane.idGenomeBuildAlignTo;
                }
                if (sequenceLane && sequenceLane.idOrganism) {
                    consolidatedOrganismIds.add(sequenceLane.idOrganism);
                    idOrganism = sequenceLane.idOrganism;
                }

                let temp: any = {
                    idGenomeBuildAlignTo: idGenomeBuildAlignTo,
                    idOrganism: idOrganism,
                    organismName: '',
                    alignToGenomeBuild: (!!idGenomeBuildAlignTo ? true : false),
                    dictionary: [],
                    sequenceLane: sequenceLane
                };

                for (let info of this.consolidatedGenomeInformation) {
                    if (temp.idOrganism === info.idOrganism && !info.alignToGenomeBuild) {
                        info.idGenomeBuildAlignTo = temp.idGenomeBuildAlignTo;
                        info.idOrganism           = temp.idOrganism;
                        info.organismName         = temp.organismName;
                        info.alignToGenomeBuild   = temp.alignToGenomeBuild;
                        info.dictionary           = temp.dictionary;
                        info.sequenceLane         = temp.sequenceLane;
                    }
                }

                let checkForExisting: any[] = this.consolidatedGenomeInformation.filter((a) => {
                    return temp.idGenomeBuildAlignTo === a.idGenomeBuildAlignTo
                        && temp.idOrganism           === a.idOrganism
                        && temp.organismName         === a.organismName
                        && temp.alignToGenomeBuild   === a.alignToGenomeBuild;
                });

                if (checkForExisting.length === 0) {
                    let checkForOrganism: any[] = this.consolidatedGenomeInformation.filter((a) => {
                        return temp.idOrganism === a.idOrganism
                            && !temp.alignToGenomeBuild
                            && a.alignToGenomeBuild;
                    });

                    if (checkForOrganism.length === 0) {
                        this.consolidatedGenomeInformation.push(temp);
                    }
                }
            }

            for (let id of consolidatedGenomeBuildIds) {
                if (this.genomeBuild) {
                    this.genomeBuild = this.genomeBuild + ' --- ';
                }

                let entry: any = this.dictionaryService.getEntry('hci.gnomex.model.GenomeBuildLite', id);

                if (entry) {
                    this.genomeBuild = this.genomeBuild + entry.display;
                    this.sampleGenomeBuilds.push(entry);
                }
            }
        } else {
            this._experiment.sequenceLanes = [];

            let samples: any[] = [];
            if(this._experiment.samples) {
                if (Array.isArray(this._experiment.samples)) {
                    samples = this._experiment.samples;
                } else {
                    samples = [this._experiment.samples.Sample];
                }
            }

            for (let sample of samples) {
                let idOrganism: string = '';

                if (sample.idOrganism) {
                    consolidatedOrganismIds.add(sample.idOrganism);
                    idOrganism = sample.idOrganism;
                }

                let lanePlus: number = parseInt(sample.multiplexGroupNumber) + 100000;
                let laneStr: string = lanePlus.toString().substr(1);

                let laneObj = {
                    idSequenceLane: 'SequenceLane' + laneStr,
                    notes: '',
                    idSeqRunType: sample.idSeqRunType,
                    idNumberSequencingCycles: sample.idNumberSequencingCycles,
                    idNumberSequencingCyclesAllowed: sample.idNumberSequencingCyclesAllowed,
                    idSample: sample.idSample,
                    idOrganism: sample.idOrganism,
                    idGenomeBuildAlignTo: ''
                };
                this._experiment.sequenceLanes.push(laneObj);


                let temp: any = {
                    alignToGenomeBuild: false,
                    dictionary: [],
                    idGenomeBuildAlignTo: '',
                    idOrganism: idOrganism,
                    organismName: ''
                };

                for (let info of this.consolidatedGenomeInformation) {
                    if (temp.idOrganism === info.idOrganism && !info.alignToGenomeBuild) {
                        info.idGenomeBuildAlignTo = temp.idGenomeBuildAlignTo;
                        info.idOrganism           = temp.idOrganism;
                        info.organismName         = temp.organismName;
                        info.alignToGenomeBuild   = temp.alignToGenomeBuild;
                        info.dictionary           = temp.dictionary;
                        info.sequenceLane         = temp.sequenceLane;
                    }
                }

                let checkForExisting: any[] = this.consolidatedGenomeInformation.filter((a) => {
                    return temp.idGenomeBuildAlignTo === a.idGenomeBuildAlignTo
                        && temp.idOrganism           === a.idOrganism
                        && temp.organismName         === a.organismName
                        && temp.alignToGenomeBuild   === a.alignToGenomeBuild;
                });

                if (checkForExisting.length === 0) {
                    let checkForOrganism: any[] = this.consolidatedGenomeInformation.filter((a) => {
                        return temp.idOrganism === a.idOrganism
                            && !temp.alignToGenomeBuild
                            && a.alignToGenomeBuild;
                    });

                    if (checkForOrganism.length === 0) {
                        this.consolidatedGenomeInformation.push(temp);
                    }
                }
            }
        }

        if (this.genomeBuild) {
            this.alignToGenomeBuild = 'Y';
        } else {
            this.alignToGenomeBuild = 'N';
        }

        this.organismName = '';
        this.sampleOrganisms = [];

        for (let id of consolidatedOrganismIds) {
            if (this.organismName) {
                this.organismName = this.organismName + ', ';
            }

            let entry: any = this.dictionaryService.getEntry('hci.gnomex.model.OrganismLite', id);

            if (entry) {
                this.organismName = this.organismName + entry.display;
                this.sampleOrganisms.push(entry);

                let tempDictionary: any[] = this.cachedGenomeBuilds.filter((a) => {
                    return a.idOrganism === id;
                });

                for (let data of this.consolidatedGenomeInformation) {
                    if (data.idOrganism === id) {
                        data.organismName = entry.display;
                        data.dictionary = tempDictionary;
                    }
                }
            }
        }
    }

    public tabDisplayed(): void {
        this.prepareComponent();
    }
}
