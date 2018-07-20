import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {ExperimentsService} from "../experiments/experiments.service";
import {HttpClient} from "@angular/common/http";
import {DictionaryService} from "./dictionary.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {GnomexService} from "./gnomex.service";
import {AnnotationService} from "./annotation.service";

@Injectable()
export class NewExperimentService {
    get applicationName(): string {
        return this._applicationName;
    }

    set applicationName(value: string) {
        this._applicationName = value;
    }

    get codeApplication(): string {
        return this._codeApplication;
    }

    set codeApplication(value: string) {
        this._codeApplication = value;
    }
    get lab(): any {
        return this._lab;
    }

    set lab(value: any) {
        this._lab = value;
    }
    public currentState = new BehaviorSubject("SolexaBaseState");
    private _request: any;
    private _annotations: any[];
    private _organism;
    private _category: any;
    private _lab: any;
    private _applicationName: string;
    private _codeApplication: string;
    public filteredAppList: any[] = [];
    public selectedIndex = new BehaviorSubject<number>(1);

    public readonly TYPE_MICROARRAY: string = 'MICROARRAY';
    public readonly TYPE_HISEQ: string = 'HISEQ';
    public readonly TYPE_MISEQ: string = 'MISEQ';
    public readonly TYPE_QC: string = 'QC';
    public readonly TYPE_CAP_SEQ: string = "CAPSEQ";
    public readonly TYPE_FRAG_ANAL: string = "FRAGANAL";
    public readonly TYPE_MIT_SEQ: string = "MITSEQ";
    public readonly TYPE_CHERRY_PICK: string = "CHERRYPICK";
    public readonly TYPE_ISCAN: string = "ISCAN";
    public readonly TYPE_ISOLATION: string = "ISOLATION";
    public readonly TYPE_CLINICAL_SEQUENOM: string = "CLINSEQ";
    public readonly TYPE_SEQUENOM: string = "SEQUENOM";
    public readonly TYPE_NANOSTRING: string = "NANOSTRING";
    public readonly TYPE_GENERIC: string = "GENERIC";

    constructor(private _http: Http,
                private dictionaryService: DictionaryService,
                private experimentService: ExperimentsService,
                private gnomexService: GnomexService,
                private annotationService: AnnotationService,
                private httpClient: HttpClient) {
        this.filteredAppList = this.dictionaryService.getEntries('hci.gnomex.model.Application').sort(this.sortApplication);

    }


    isMicroarrayState(requestCategory: any): boolean {
        if (requestCategory.type === this.TYPE_MICROARRAY) {
            return true;
        } else {
            return false;
        }
    }

    public filterSampleType(codeNucleotideType: string, currentState: string, requestCategory: any): any[] {
        let doesMatchRequestCategory: boolean = false;
        let types: any[] = [];


        for (let category of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.SampleType")) {
            if (!this.isEditState(currentState) && category.isActive === 'N') {
                continue;
            }

            if (codeNucleotideType != null && category.codeNucleotideType != codeNucleotideType) {
                continue;
            }
            let theRequestCategories = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.SampleTypeRequestCategory").filter(category2 =>
                category2.value != "" && category2.idSampleType === category.value
            );
            for (let category3 of theRequestCategories) {
                if (category3.codeRequestCategory === requestCategory.codeRequestCategory) {
                    types.push(category);
                }
            }

        }

        return types;
    }

    get request(): any {
        return this._request;
    }

    set request(value: any) {
        this._request = value;
    }

    get category(): any {
        return this._category;
    }

    set category(value: any) {
        this._category = value;
    }

    set organism(organism) {
        this._organism = this.organism;
    }

    get organism() {
        return this._organism;
    }

    get annotations(): any[] {
        return this._annotations;
    }

    set annotations(value: any[]) {
        this._annotations = value;
    }

    public isEditState(currentState: string): boolean {
        if (currentState == 'EditState' ||
            currentState == 'GenericEditState' ||
            currentState == 'SolexaEditState' ||
            currentState == 'SeqExternalEditState' ||
            currentState == 'QCEditState' ||
            currentState == 'MicroarrayEditState' ||
            currentState == 'CapSeqEditState' ||
            currentState == 'CherryPickEditState' ||
            currentState == 'FragAnalEditState' ||
            currentState == 'MitSeqEditState' ||
            currentState == 'IScanEditState' ||
            currentState == 'SequenomEditState' ||
            currentState == 'IsolationEditState' ||
            currentState == 'ClinicalSequenomEditState' ||
            currentState == 'NanoStringEditState') {
            return true;
        } else {
            return false;
        }
    }

    public isSequenomState(currentState): boolean {
        if (currentState == 'SequenomState' || currentState == 'SequenomEditState') {
            return true;
        } else {
            return false;
        }
    }

    public isClinicalSequenomState(currentState): boolean {
        if (currentState == 'ClinicalSequenomState' || currentState == 'ClinicalSequenomEditState') {
            return true;
        } else {
            return false;
        }
    }

    public isQCState(currentState): boolean {
        if (currentState == 'QCState' ||
            currentState == 'QCExternalState' ||
            currentState == 'QCEditState') {
            return true;
        } else {
            return false;
        }
    }

    public filterAnnotations(idOrganism): any[] {
        let fAnnotations: any[] = [];
        for (let annot of this.annotations) {
            annot = this.gnomexService.getSampleProperty(annot.idProperty);
            if (AnnotationService.isApplicableProperty(annot, this.category, idOrganism, null)) {
                fAnnotations.push(annot);
            }
        }
        return fAnnotations;
    }

    public sortSampleTypes(obj1, obj2): number {
        if (obj1 == null && obj2 == null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {
            let order1: number = Number(obj1.sortOrder);
            let order2: number = Number(obj2.sortOrder);

            if (obj1.value == '') {
                return -1;
            } else if (obj2.value == '') {
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

    // Sort application by sortOrder field
    private sortApplication(obj1, obj2): number {
        if (obj1 === null && obj2 === null) {
            return 0;
        } else if (obj1 === null) {
            return 1;
        } else if (obj2 === null) {
            return -1;
        } else {
            var order1: number = obj1.sortOrder;
            var order2: number = obj2.sortOrder;
            var disp1: string = obj1.display;
            var disp2: string = obj2.display;

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
                    if (disp1 < disp2) {
                        return -1;
                    } else if (disp1 > disp2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }

    public filterApplication(requestCategory, seqPrepByCore): any[] {
        let filteredApps: any[] = [];
        for (let app of this.filteredAppList) {
            if (!app.value) {
                continue;
            }
            if (app.isActive === 'N') {
                continue;
            }
            var doesMatchRequestCategory: boolean = false;
            let theApplications = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategoryApplication").filter(reqCatApp =>

                reqCatApp.value != "" && reqCatApp.codeApplication === app.value
            );
            for (var xref of theApplications) {
                if (xref.codeRequestCategory === requestCategory.codeRequestCategory) {
                    doesMatchRequestCategory = true;
                    break;
                }
            }

            var doesMatchSeqPrepByCore: boolean = false;
            if (doesMatchRequestCategory) {
                if (requestCategory.isIlluminaType !== 'Y' || !this.gnomexService.isInternalExperimentSubmission) {
                    doesMatchSeqPrepByCore = true;
                } else {
                    doesMatchSeqPrepByCore = (app.onlyForLabPrepped === "N" || !seqPrepByCore);
                }
            }
            if (doesMatchRequestCategory && doesMatchSeqPrepByCore) {
                filteredApps.push(app);
            }
        }
        return filteredApps;
    }

    public sortNumberSequencingCyclesAllowed(obj1: any, obj2: any): number {
        if (obj1 == null && obj2 == null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {

            if (obj1.value === '') {
                return -1;
            } else if (obj2.value === '') {
                return 1;
            } else {
                var isCustom1:String = obj1.isCustom;
                var isCustom2:String = obj2.isCustom
                var numberCycles1:Number = obj1.numberSequencingCyclesDisplay;
                var numberCycles2:Number = obj2.numberSequencingCyclesDisplay;
                var sortOrder1:Number = obj1.sortOrder === '' ? -1 : obj1.sortOrder;
                var sortOrder2:Number = obj2.sortOrder === '' ? -1 : obj2.sortOrder;

                if (isCustom1 < isCustom2) {
                    return -1;
                } else if (isCustom1 > isCustom2) {
                    return 1;
                } else {
                    if (sortOrder1 < sortOrder2) {
                        return -1;
                    } else if (sortOrder1 > sortOrder2) {
                        return 1;
                    } else {
                        if (numberCycles1 < numberCycles2) {
                            return -1;
                        } else if (numberCycles1 > numberCycles2) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                }
            }
        }
    }

    public filterNumberSequencingCyclesAllowed(cycles: any[], requestCategory: any): any[] {
        let seqCycles: any[] = [];

        for (let cycle of cycles) {
            if (cycle.value) {

                var doesMatch: Boolean = false;
                if (cycle.codeRequestCategory === requestCategory.codeRequestCategory && cycle.isActive.toString() === 'Y') {
                    seqCycles.push(cycle);
                }
            }
        }
        return seqCycles;
    }
}