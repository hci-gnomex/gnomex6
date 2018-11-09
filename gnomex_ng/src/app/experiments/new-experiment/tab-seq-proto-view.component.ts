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
        .radio-group-container {
            display: inline-flex;
            flex-direction: row;
            vertical-align: middle;
            width: fit-content;
            margin-top: 1.1em;
        }
        .type-radio-button {
            margin: 0 0.5%;
        }
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