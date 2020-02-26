import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {BillingService} from "../../services/billing.service";
import {Subscription} from "rxjs/index";
import {Experiment} from "../../util/models/experiment.model";
import {NewExperimentService} from "../../services/new-experiment.service";

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
        
        .filter {
            width: 80%;
            min-width: 20em;
            max-width: 30em;
        }

        .odd  { background-color: white; }
        .even { background-color: #edede9; }
        
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
        
        .left-spacer { margin-left: 4em; }
        
        .inline-block {
            width: 20em;
            display: inline-block;
        }
        
    `]
})

export class TabSeqProtoViewComponent implements OnInit, OnDestroy {

    private readonly ALL:   string = "ALL";
    private readonly NOSEQ: string = "NOSEQ";
    private readonly HISEQ: string = "HISEQ";
    private readonly MISEQ: string = "MISEQ";
    private readonly OTHER: string = "OTHER";

    @Input("experiment") set experiment(value: Experiment) {
        this._experiment = value;

        if (this._experiment && this._experiment.onChange_idLab) {
            if (this.idLab_subscription) {
                this.idLab_subscription.unsubscribe();
            }

            this.idLab_subscription = this._experiment.onChange_idLab.subscribe(() => {
                this.changePrices();
            })
        }
        if (this._experiment && this._experiment.onChange_codeRequestCategory) {
            if (this.codeRequestCategory_subscription) {
                this.codeRequestCategory_subscription.unsubscribe();
            }

            this.codeRequestCategory_subscription = this._experiment.onChange_codeRequestCategory.subscribe((codeRequestCategory) => {
                this.changePrices();

                if (codeRequestCategory && codeRequestCategory === NewExperimentService.TYPE_ILLSEQ) {
                    this.useAlternateDisplay = true;
                } else {
                    this.useAlternateDisplay = false;
                }
            })
        }

        this.changePrices();
    }
    get experiment(): Experiment {
        return this._experiment;
    }

    private _experiment: Experiment;

    private idLab_subscription: Subscription;
    private codeRequestCategory_subscription: Subscription;

    public form: FormGroup;

    public useAlternateDisplay: boolean = false;

    private filteredNumberSequencingCyclesAllowedList: any[] = [];
    private priceMap: Map<string, string> = new Map<string, string>();

    private filterValue: string = this.ALL;

    // Instead of being static, these should probably be replaced by machines associated with the ILLSEQ RequestCategory
    // See [GNOM6-1245]
    public alternateDisplayFilters: any[] = [
        { value: this.ALL,   display: "All Available Options" },
        { value: this.NOSEQ, display: "Illumina NovaSeq Sequencing Options" },
        { value: this.HISEQ, display: "Illumina HiSeq Sequencing Options" },
        { value: this.MISEQ, display: "Illumina MiSeq Sequencing Options" }
    ];

    // TODO Replace this "alternate display node" per GNOM6-1204, replacing this front-end specific sorting
    // TODO   with a generic property on the backend.

    public get alternateDisplaySequencingOptions_Novaseq(): any[] {
        return this.filteredNumberSequencingCyclesAllowedList.filter((a: any) => {
            return a.display && a.display.toLowerCase().substr(0, 8) === 'novaseq ';
        });
    }

    public get alternateDisplaySequencingOptions_Hiseq(): any[] {
        return this.filteredNumberSequencingCyclesAllowedList.filter((a: any) => {
            return a.display && a.display.toLowerCase().substr(0, 6) === 'hiseq ';
        });
    }

    public get alternateDisplaySequencingOptions_Miseq(): any[] {
        return this.filteredNumberSequencingCyclesAllowedList.filter((a: any) => {
            return a.display && a.display.toLowerCase().substr(0, 6) === 'miseq ';
        });
    }

    public get alternateDisplaySequencingOptions_Other(): any[] {
        return this.filteredNumberSequencingCyclesAllowedList.filter((a: any) => {
            return (a.display && !(a.display.toLowerCase().substr(0, 8) === 'novaseq '))
                && (a.display && !(a.display.toLowerCase().substr(0, 6) === 'hiseq '))
                && (a.display && !(a.display.toLowerCase().substr(0, 6) === 'miseq '));
        });
    }


    public get showNovaSeqOptions(): boolean {
        return this.useAlternateDisplay && (this.filterValue === this.ALL || this.filterValue === this.NOSEQ);
    }
    public get showHiSeqOptions(): boolean {
        return this.useAlternateDisplay && (this.filterValue === this.ALL || this.filterValue === this.HISEQ);
    }
    public get showMiSeqOptions(): boolean {
        return this.useAlternateDisplay && (this.filterValue === this.ALL || this.filterValue === this.MISEQ);
    }
    public get showOtherOptions(): boolean {
        return this.useAlternateDisplay
            && (this.filterValue === this.ALL || this.filterValue === this.OTHER)
            && this.alternateDisplaySequencingOptions_Other
            && this.alternateDisplaySequencingOptions_Other.length > 0;
    }


    constructor(private billingService: BillingService,
                private dictionaryService: DictionaryService,
                private fb: FormBuilder) { }

    public ngOnInit() {
        this.form = this.fb.group({
            selectedProto: ['', Validators.required],
        });
    }

    public ngOnDestroy() {
        if (this.codeRequestCategory_subscription) {
            this.codeRequestCategory_subscription.unsubscribe();
        }
        if (this.idLab_subscription) {
            this.idLab_subscription.unsubscribe();
        }
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

    public static filterNumberSequencingCyclesAllowedByType(cycles: any[], theType: string): any[] {
        if (!cycles || !Array.isArray(cycles) || !theType) {
            return [];
        }

        let seqCycles: any[] = [];

        for (let cycle of cycles) {
            if (cycle.display && cycle.display.toLowerCase().substr(0, 8) === theType) {
                    seqCycles.push(cycle);
                }
            }

        return seqCycles;
    }

    public onProtoChange() {
        this._experiment.selectedProtocol = this.form.get("selectedProto").value;
    }

    private changePrices(): void {
        if (this._experiment && this._experiment.idLab) {
            let appPriceListParams: HttpParams = new HttpParams()
                .set("codeRequestCategory" ,this.experiment.codeRequestCategory)
                .set("idLab", this._experiment.idLab);

            this.billingService.getHiSeqRunTypePriceList(appPriceListParams).subscribe((response: any) => {

                if (Array.isArray(response)) {
                    for (let price of response) {
                        let key: string = price.idNumberSequencingCyclesAllowed;
                        this.priceMap.set(key, price.price);
                    }
                }

                if (this.experiment.requestCategory) {
                    this.filteredNumberSequencingCyclesAllowedList = TabSeqProtoViewComponent.filterNumberSequencingCyclesAllowed(
                        this.dictionaryService.getEntries('hci.gnomex.model.NumberSequencingCyclesAllowed'),
                        this.experiment.requestCategory
                    ).sort(TabSeqProtoViewComponent.sortNumberSequencingCyclesAllowed);

                    for (let proto of this.filteredNumberSequencingCyclesAllowedList) {
                        proto.price = this.priceMap.get(proto.idNumberSequencingCyclesAllowed);
                    }

                    this.alternateDisplayFilters = [
                        { value: this.ALL,   display: "All Available Options" },
                        { value: this.NOSEQ, display: "Illumina NovaSeq Sequencing Options" },
                        { value: this.HISEQ, display: "Illumina HiSeq Sequencing Options" },
                        { value: this.MISEQ, display: "Illumina MiSeq Sequencing Options" }
                    ];

                    if (this.alternateDisplaySequencingOptions_Other && this.alternateDisplaySequencingOptions_Other.length > 0) {
                        this.alternateDisplayFilters.push({ value: this.OTHER, display: "Other Sequencing Options" });
                    }
                }
            });
        }
    }

    public onChangeFilter(event: any): void {
        this.filterValue = event ? event : this.ALL;
    }
}
