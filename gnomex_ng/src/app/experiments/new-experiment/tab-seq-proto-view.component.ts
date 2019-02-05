import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {GnomexService} from "../../services/gnomex.service";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BillingService} from "../../services/billing.service";
import {HttpParams} from "@angular/common/http";

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

    private filteredNumberSequencingCyclesAllowedList: any[] = [];
    private form: FormGroup;
    private runTypeLabel: string;
    private priceMap: Map<string, string> = new Map<string, string>();

    constructor(private dictionaryService: DictionaryService,
                private newExperimentService: NewExperimentService,
                private billingService: BillingService,
                private gnomexService: GnomexService,
                private changeRef: ChangeDetectorRef,
                private fb: FormBuilder) {
    }

    ngOnInit() {
        this.form = this.fb.group({
            selectedProto: ['', Validators.required],
        });
        this.newExperimentService.hiSeqPricesChanged.subscribe((value) => {
            if (value ) {
                if (this.newExperimentService.hiSeqPricesChanged.value === true) {
                    this.newExperimentService.hiSeqPricesChanged.next(false);
                }

                if (this.requestCategory) {
                    this.filteredNumberSequencingCyclesAllowedList = this.dictionaryService.getEntries('hci.gnomex.model.NumberSequencingCyclesAllowed')
                        .sort(this.newExperimentService.sortNumberSequencingCyclesAllowed);
                    this.filteredNumberSequencingCyclesAllowedList = this.newExperimentService.filterNumberSequencingCyclesAllowed(this.filteredNumberSequencingCyclesAllowedList, this.requestCategory);
                    this.runTypeLabel = this.gnomexService.getRequestCategoryProperty(this.requestCategory.idCoreFacility, this.requestCategory.codeRequestCategory, this.gnomexService.PROPERTY_HISEQ_RUN_TYPE_LABEL_STANDARD);
                    for (let proto of this.filteredNumberSequencingCyclesAllowedList) {
                        let price = this.newExperimentService.priceMap.get(proto.idNumberSequencingCyclesAllowed);
                        proto.price = price;
                    }
                }
            }
        });
    }

    onProtoChange(event) {
        this.newExperimentService.selectedProto = this.form.get("selectedProto").value;

    }

    onAppPriceChanged(event) {

    }

}