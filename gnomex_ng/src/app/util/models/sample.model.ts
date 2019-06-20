import {DictionaryService} from "../../services/dictionary.service";
import {Experiment} from "./experiment.model";
import {GnomexService} from "../../services/gnomex.service";
import {BehaviorSubject} from "rxjs";
import {PropertyService} from "../../services/property.service";

export class Sample {
    public idSample:                        string = ''; // "Sample0";
    public name:                            string = ''; // "asdffdsa";
    public number:                          string = ''; // "asdffdsa";
    public description:                     string = ''; // "";
    public canChangeSampleName:             string = 'Y'; // "Y";
    public canChangeSampleType:             string = 'Y'; // "Y";
    public canChangeSampleConcentration:    string = 'Y'; // "Y";
    public canChangeSampleSource:           string = 'Y'; // "Y";
    public canChangeNumberSequencingCycles: string = 'Y'; // "Y";
    public canChangeNumberSequencingLanes:  string = 'Y'; // "Y";
    public concentration:                   string = ''; // "";
    public sampleVolume:                    string = ''; // "";
    public ccNumber:                        string = ''; // "";
    public label:                           string = ''; // "";
    public idOligoBarcode:                  string = ''; // "";
    public barcodeSequence:                 string = ''; // "";
    public idOligoBarcodeB:                 string = ''; // "";
    public barcodeSequenceB:                string = ''; // "";
    public idNumberSequencingCycles:        string = ''; // "5";
    public idNumberSequencingCyclesAllowed: string = ''; // "69";
    public idSeqRunType:                    string = ''; // "4";
    public meanLibSizeActual:               string = '';
    public codeBioanalyzerChipType:         string = '';
    public qualFragmentSizeFrom:            string = '';
    public qualFragmentSizeTo:              string = '';
    public qualStatus:                      string = '';
    public seqPrepStatus:                   string = '';
    public sequenceLaneCount:               string = ''; // "1";

    public get numberSequencingLanes(): string {
        return this._numberSequencingLanes;
    }
    public set numberSequencingLanes(value: string) {
        this._numberSequencingLanes = value ? value : '';

        this.onChange_numberSequencingLanes.next(this.numberSequencingLanes);
    }
    public _numberSequencingLanes:           string = ''; // "1";
    public onChange_numberSequencingLanes:   BehaviorSubject<string> = new BehaviorSubject(this._numberSequencingLanes);


    public createSequenceLane(): any {
        return {
            idSequenceLane:                  "SequenceLane",
            notes:                           this.notes                           ? this.notes                           : "",
            idSeqRunType:                    this.idSeqRunType                    ? this.idSeqRunType                    : "",
            idNumberSequencingCycles:        this.idNumberSequencingCycles        ? this.idNumberSequencingCycles        : "",
            idNumberSequencingCyclesAllowed: this.idNumberSequencingCyclesAllowed ? this.idNumberSequencingCyclesAllowed : "",
            idSample:                        this.idSample                        ? this.idSample                        : "",
            idGenomeBuildAlignTo:            this.idGenomeBuildAlignTo            ? this.idGenomeBuildAlignTo            : "",
            idOrganism:                      this.idOrganism                      ? this.idOrganism                      : "",
            organism:                        this.organism                        ? this.organism                        : "",
        };
    }

    public createAllSequenceLanes(): any[] {
        let result: any[] = [];

        for (let i: number = 0; i < (this._numberSequencingLanes ? +this._numberSequencingLanes: 0); i++) {
            result.push(this.createSequenceLane());
        }

        return result;
    }


    public codeConcentrationUnit:           string = ''; // "ng/ul";
    public idSampleType:                    string = ''; // "1";

    public get sampleType(): any {
        return this._sampleType;
    }
    public set sampleType(value: any) {
        if (value && value.idSampleType) {
            this._sampleType = value;
            this.idSampleType = value.idSampleType;
        }
    }
    private _sampleType: any;

    public idSampleSource:                  string = '';
    public idSeqLibProtocol:                string = ''; // "361";
    public seqPrepByCore:                   string = ''; // "Y";
    public idOrganism:                      string = ''; // "204";
    public otherOrganism:                   string = ''; // "";
    public treatment:                       string = ''; // "";
    public customColor:                     string = ''; // "0xFFFFFF";
    public multiplexGroupNumber:            string = ''; // "10";
    public qualCalcConcentration:           string = '';
    public qual260nmTo230nmRatio:           string = '';
    public qualRINNumber:                   string = '';
    public otherSamplePrepMethod:           string = '';
    public isDirty:                         string = ''; // "Y";

    private _organism: any = {};
    public get organism(): any {
        return this._organism;
    }
    public set organism(value: any) {
        if (value && value.idOrganism) {
            this._organism = value;
            this.idOrganism = value.idOrganism;
        }

        this.onChange_organism.next(this.organism);
    }
    public onChange_organism: BehaviorSubject<any> = new BehaviorSubject<any>(this.organism);

    private _sequencingOption: any;
    public get sequencingOption(): any {
        return this._sequencingOption;
    }
    public set sequencingOption(value: any) {
        if (value && value.idNumberSequencingCycles && value.idNumberSequencingCyclesAllowed) {
            this._sequencingOption = value;
            this.idNumberSequencingCycles = value.idNumberSequencingCycles;
            this.idNumberSequencingCyclesAllowed = value.idNumberSequencingCyclesAllowed;
            this.idSeqRunType = value.idSeqRunType;
        }
    }

    private _application: any;
    public get application_object(): any {
        return this._application;
    }
    public set application_object(value: any) {
        this._application = value;

        if (value && value.codeApplication) {
            let lookup = this.dictionaryService.getProtocolFromApplication(value.codeApplication);

            if (lookup && lookup.idSeqLibProtocol) {
                this.idSeqLibProtocol = lookup.idSeqLibProtocol;
            } else {
                this.idSeqLibProtocol = '';
            }
        } else {
            this.idSeqLibProtocol = '';
        }
    }

    constructor(private dictionaryService: DictionaryService) { }

    public static createSampleObjectFromAny(dictionaryService: DictionaryService, source: any): Sample {
        let sample: Sample = new Sample(dictionaryService);

        sample.cloneProperty("idSample", source);
        sample.cloneProperty("name", source);
        sample.cloneProperty("number", source);
        sample.cloneProperty("description", source);
        sample.cloneProperty("canChangeSampleName", source);
        sample.cloneProperty("canChangeSampleType", source);
        sample.cloneProperty("canChangeSampleConcentration", source);
        sample.cloneProperty("canChangeSampleSource", source);
        sample.cloneProperty("canChangeNumberSequencingCycles", source);
        sample.cloneProperty("canChangeNumberSequencingLanes", source);
        sample.cloneProperty("concentration", source);
        sample.cloneProperty("concentration", source);
        sample.cloneProperty("sampleVolume", source);
        sample.cloneProperty("ccNumber", source);
        sample.cloneProperty("label", source);
        sample.cloneProperty("idOligoBarcode", source);
        sample.cloneProperty("barcodeSequence", source);
        sample.cloneProperty("idOligoBarcodeB", source);
        sample.cloneProperty("barcodeSequenceB", source);
        sample.cloneProperty("idNumberSequencingCycles", source);
        sample.cloneProperty("idNumberSequencingCyclesAllowed", source);
        sample.cloneProperty("idSeqRunType", source);
        sample.cloneProperty("meanLibSizeActual", source);
        sample.cloneProperty("codeBioanalyzerChipType", source);
        sample.cloneProperty("qualFragmentSizeFrom", source);
        sample.cloneProperty("qualFragmentSizeTo", source);
        sample.cloneProperty("qualStatus", source);
        sample.cloneProperty("seqPrepStatus", source);
        sample.cloneProperty("numberSequencingLanes", source);
        sample.cloneProperty("sequenceLaneCount", source);
        sample.cloneProperty("codeConcentrationUnit", source);
        sample.cloneProperty("idSampleType", source);
        sample.cloneProperty("sampleType", source);
        sample.cloneProperty("idSampleSource", source);
        sample.cloneProperty("idSeqLibProtocol", source);
        sample.cloneProperty("seqPrepByCore", source);
        sample.cloneProperty("idOrganism", source);
        sample.cloneProperty("otherOrganism", source);
        sample.cloneProperty("treatment", source);
        sample.cloneProperty("customColor", source);
        sample.cloneProperty("qualCalcConcentration", source);
        sample.cloneProperty("qual260nmTo230nmRatio", source);
        sample.cloneProperty("qualRINNumber", source);
        sample.cloneProperty("otherSamplePrepMethod", source);
        sample.cloneProperty("multiplexGroupNumber", source);
        sample.cloneProperty("isDirty", source);
        sample.cloneProperty("organism", source);
        sample.cloneProperty("sequencingOption", source);
        sample.cloneProperty("application_object", source);
        sample.cloneProperty("index", source);
        sample.cloneProperty("prepInstructions", source);
        sample.cloneProperty("frontEndGridGroup", source);

        if (source) {
            for (let attribute of Object.keys(source)) {
                if (attribute.startsWith("ANNOT")) {
                    sample.cloneProperty(attribute, source);
                }
            }
        }

        return sample;
    }

    public static createNewSamplesForExperiment(experiment: Experiment, dictionaryService: DictionaryService, propertyService: PropertyService, gnomexService: GnomexService): void {
        if (!experiment) {
            return;
        }

        let defaultValue_multiplexGroupNumber_property = propertyService.getProperty(PropertyService.PROPERTY_DEFAULT_VALUE_MULTIPLEX_LANE_COLUMN, experiment.idCoreFacility, experiment.codeRequestCategory);
        let defaultValue_multiplexGroupNumber: string;

        if (defaultValue_multiplexGroupNumber_property && defaultValue_multiplexGroupNumber_property.propertyValue) {
            defaultValue_multiplexGroupNumber = defaultValue_multiplexGroupNumber_property.propertyValue;
        } else {
            defaultValue_multiplexGroupNumber = null;
        }

        if (experiment && experiment.numberOfSamples) {

            let idSampleType: string = '';
            let idOrganism: string = '';
            let idNumberSequencingCycles: string = '';
            let idNumberSequencingCyclesAllowed: string = '';
            let idSeqRunType: string = '';
            let protocol: any = '';
            let numberSequencingLanes: string = experiment.isRapidMode === 'Y' ? '2' : '1';
            let seqPrepByCore: any = '';

            if (gnomexService.submitInternalExperiment() && experiment.sampleType) {
                idSampleType = experiment.sampleType.idSampleType;
            } else if (experiment.idSampleTypeDefault != null) {
                idSampleType = experiment.idSampleTypeDefault
            } else {
                // do nothing, leave idSampleType as default.
            }

            if (gnomexService.submitInternalExperiment() && experiment.organism) {
                idOrganism = experiment.organism.idOrganism;
            } else if (experiment.idOrganismSampleDefault != null) {
                idOrganism = experiment.idOrganismSampleDefault;
            } else {
                // do nothing, leave idOrganism as default.
            }

            if (gnomexService.submitInternalExperiment() && experiment.selectedProtocol) {
                idNumberSequencingCycles = experiment.selectedProtocol.idNumberSequencingCycles;
            }

            if (gnomexService.submitInternalExperiment() && experiment.selectedProtocol) {
                idNumberSequencingCyclesAllowed = experiment.selectedProtocol.idNumberSequencingCyclesAllowed
            }

            if (gnomexService.submitInternalExperiment() && experiment.selectedProtocol) {
                idSeqRunType = experiment.selectedProtocol.idSeqRunType
            }

            if (experiment.codeApplication) {
                protocol = dictionaryService.getProtocolFromApplication(experiment.codeApplication)
            }

            if (experiment && experiment.seqPrepByCore_forSamples) {
                seqPrepByCore = experiment.seqPrepByCore_forSamples;
            }

            let index = +(experiment.numberOfSamples) - experiment.samples.length;

            if (index > 0) {
                for (let i = 0; i < index; i++) {
                    let obj: Sample = new Sample(dictionaryService);

                    obj.index = experiment.samples.length + 1;
                    obj.idSample = 'Sample' + Sample.getNextSampleId(experiment).toString();

                    if (defaultValue_multiplexGroupNumber) {
                        obj.multiplexGroupNumber = "" + defaultValue_multiplexGroupNumber;
                    } else {
                        obj.multiplexGroupNumber = "";
                    }

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
                    obj.idSampleSource = experiment.idSampleSource;
                    obj.idSampleType = idSampleType;
                    obj.idSeqLibProtocol = protocol.idSeqLibProtocol;
                    obj.seqPrepByCore = seqPrepByCore;
                    obj.idOrganism = idOrganism;
                    obj.prepInstructions = '';
                    obj.otherOrganism = '';
                    obj.treatment = '';
                    obj.frontEndGridGroup = '0';
                    obj.codeBioanalyzerChipType = experiment.codeBioanalyzerChipType;

                    experiment.samples.push(obj);
                }
            }
        }

        if (experiment && experiment.samples && ((Array.isArray(experiment.samples) ? experiment.samples.length : 0) !== (+experiment.numberOfSamples))) {
            experiment.numberOfSamples = '' + (Array.isArray(experiment.samples) ? experiment.samples.length : 0);
        }
    }

    private cloneProperty(propertyName: string, source: any): void {
        if (source && source[propertyName]) {
            this[propertyName] = source[propertyName];
        }
    }

    // extra variables for grid stuff?  Not needed back-end.
    public index: number;
    public prepInstructions: string; // ???
    public frontEndGridGroup: string;

    [prop: string]: any;

    public getJSONObjectRepresentation(): any {

        let temp: any = {
            idSample:                        this.idSample,
            name:                            this.name,
            number:                          this.number,
            description:                     this.description,
            canChangeSampleName:             this.canChangeSampleName,
            canChangeSampleType:             this.canChangeSampleType,
            canChangeSampleConcentration:    this.canChangeSampleConcentration,
            canChangeSampleSource:           this.canChangeSampleSource,
            canChangeNumberSequencingCycles: this.canChangeNumberSequencingCycles,
            canChangeNumberSequencingLanes:  this.canChangeNumberSequencingLanes,
            concentration:                   this.concentration,
            sampleVolume:                    this.sampleVolume,
            ccNumber:                        this.ccNumber,
            label:                           this.label,
            idOligoBarcode:                  this.idOligoBarcode,
            barcodeSequence:                 this.barcodeSequence,
            idOligoBarcodeB:                 this.idOligoBarcodeB,
            barcodeSequenceB:                this.barcodeSequenceB,
            idNumberSequencingCycles:        this.idNumberSequencingCycles,
            idNumberSequencingCyclesAllowed: this.idNumberSequencingCyclesAllowed,
            idSeqRunType:                    this.idSeqRunType,
            meanLibSizeActual:               this.meanLibSizeActual,
            codeBioanalyzerChipType:         this.codeBioanalyzerChipType,
            qualFragmentSizeFrom:            this.qualFragmentSizeFrom,
            qualFragmentSizeTo:              this.qualFragmentSizeTo,
            qualStatus:                      this.qualStatus,
            seqPrepStatus:                   this.seqPrepStatus,
            numberSequencingLanes:           this.numberSequencingLanes,
            sequenceLaneCount:               this.sequenceLaneCount,
            codeConcentrationUnit:           this.codeConcentrationUnit,
            idSampleType:                    this.idSampleType,
            idSampleSource:                  this.idSampleSource,
            idSeqLibProtocol:                this.idSeqLibProtocol,
            seqPrepByCore:                   this.seqPrepByCore,
            idOrganism:                      this.idOrganism,
            otherOrganism:                   this.otherOrganism,
            treatment:                       this.treatment,
            customColor:                     this.customColor,
            multiplexGroupNumber:            this.multiplexGroupNumber,
            qualCalcConcentration:           this.qualCalcConcentration,
            qual260nmTo230nmRatio:           this.qual260nmTo230nmRatio,
            qualRINNumber:                   this.qualRINNumber,
            otherSamplePrepMethod:           this.otherSamplePrepMethod,
            isDirty:                         this.isDirty
        };

        for (let key of Object.keys(this)) {
            if (key.startsWith("ANNOT")) {
                temp[key] = this[key];
            }
        }

        return temp;
    }

    protected static getNextSampleId(experiment: Experiment): number {
        let lastId: number = -1;

        for (let sample of experiment.samples) {
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
}