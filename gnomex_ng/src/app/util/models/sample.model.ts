import {DictionaryService} from "../../services/dictionary.service";

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
    public numberSequencingLanes:           string = ''; // "1";
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
    }

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

        // Todo : use keyset to get annotations

        return sample;
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
}