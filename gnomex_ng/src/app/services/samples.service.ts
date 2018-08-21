import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {DictionaryService} from "./dictionary.service";
import {NewExperimentService} from "./new-experiment.service";

@Injectable()
export class SamplesService {
    constructor(private dictionaryService: DictionaryService,
                private newExperimentService: NewExperimentService
    ) {

    }
    public filterSampleTypes(types: any[], codeNucleotideType: string): any[] {
        let filteredTypes: any[] = [];
        for (let item of types) {
            if (item) {
                if (item.isActive === 'Y') {
                    if (codeNucleotideType && item.codeNucleotideType === codeNucleotideType) {
                        let doesMatchRequestCategory: boolean = false;
                        let requestCategory = this.newExperimentService.requestCategory;
                        let theRequestCategories = this.dictionaryService.getEntries("hci.gnomex.model.SampleTypeRequestCategory");
                        for (var xref1 of theRequestCategories) {
                            if (xref1.codeRequestCategory.toString() === requestCategory.codeRequestCategory) {
                                filteredTypes.push(item);
                                break;
                            }
                        }
                    }
                }
            }
        }
        return filteredTypes;
    }


}