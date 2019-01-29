import {Component, Input, OnInit} from "@angular/core";
import {GnomexService} from "../../services/gnomex.service";
import {DictionaryService} from "../../services/dictionary.service";
import {Experiment, NewExperimentService} from "../../services/new-experiment.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: "tabSeqProtoView",
    templateUrl: "./tab-seq-proto-view.component.html",
    styles: [`

        .heading {
            width: 15%;
            min-width: 25em;
            padding-right: 2em;
            margin-bottom: 2em;
        }

        .odd  { background-color: #edede9; }
        .even { background-color: white; }
        
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
            margin-bottom: 2em;
        }
        ol.three-depth-numbering li li {
            margin-bottom: 0;
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
        
        .major-padded-left { padding-left: 3em; }
        
        .right-align { text-align: right; }
        
        
        
        .inline-block {
            width: 20em;
            display: inline-block;
        }
        
    `]
})

export class TabSeqProtoViewComponent implements OnInit {
    @Input() requestCategory: any;
    @Input("experiment") experiment: Experiment;

    private form: FormGroup;
    private filteredNumberSequencingCyclesAllowedList: any[] = [];
    // private runTypeLabel: string;
    // private priceMap: Map<string, string> = new Map<string, string>();

    constructor(private dictionaryService: DictionaryService,
                private newExperimentService: NewExperimentService,
                // private gnomexService: GnomexService,
                private fb: FormBuilder) { }

    public ngOnInit() {
        this.form = this.fb.group({
            selectedProto: ['', Validators.required],
        });
        this.newExperimentService.hiSeqPricesChanged.subscribe((value) => {
            if (value ) {
                if (this.newExperimentService.hiSeqPricesChanged.value === true) {
                    this.newExperimentService.hiSeqPricesChanged.next(false);
                }

                if (this.requestCategory) {
                    // this.filteredNumberSequencingCyclesAllowedList = this.dictionaryService.getEntries('hci.gnomex.model.NumberSequencingCyclesAllowed')
                    //     .sort(TabSeqProtoViewComponent.sortNumberSequencingCyclesAllowed);
                    // this.filteredNumberSequencingCyclesAllowedList = TabSeqProtoViewComponent.filterNumberSequencingCyclesAllowed(this.filteredNumberSequencingCyclesAllowedList, this.requestCategory);
                    this.filteredNumberSequencingCyclesAllowedList = TabSeqProtoViewComponent.filterNumberSequencingCyclesAllowed(
                        this.dictionaryService.getEntries('hci.gnomex.model.NumberSequencingCyclesAllowed'),
                        this.requestCategory
                    ).sort(TabSeqProtoViewComponent.sortNumberSequencingCyclesAllowed);

                    // this.runTypeLabel = this.gnomexService.getRequestCategoryProperty(this.requestCategory.idCoreFacility, this.requestCategory.codeRequestCategory, this.gnomexService.PROPERTY_HISEQ_RUN_TYPE_LABEL_STANDARD);
                    for (let proto of this.filteredNumberSequencingCyclesAllowedList) {
                        proto.price = this.newExperimentService.priceMap.get(proto.idNumberSequencingCyclesAllowed);
                    }
                }
            }
        });
    }

    public static sortNumberSequencingCyclesAllowed(obj1: any, obj2: any): number {
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
                let isCustom1: String = obj1.isCustom;
                let isCustom2: String = obj2.isCustom;
                let numberCycles1: Number = obj1.numberSequencingCyclesDisplay;
                let numberCycles2: Number = obj2.numberSequencingCyclesDisplay;
                let sortOrder1: Number = obj1.sortOrder === '' ? -1 : obj1.sortOrder;
                let sortOrder2: Number = obj2.sortOrder === '' ? -1 : obj2.sortOrder;

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

    public static filterNumberSequencingCyclesAllowed(cycles: any[], requestCategory: any): any[] {
        if (!cycles || !Array.isArray(cycles) || !requestCategory) {
            return [];
        }

        let seqCycles: any[] = [];

        for (let cycle of cycles) {
            if (cycle.value && cycle.codeRequestCategory === requestCategory.codeRequestCategory && cycle.isActive.toString() === 'Y') {
                seqCycles.push(cycle);
            }
        }

        return seqCycles;
    }

    public onProtoChange() {
        // this.newExperimentService.selectedProto = this.form.get("selectedProto").value;
        this.experiment.selectedProtocol = this.form.get("selectedProto").value;
    }
}