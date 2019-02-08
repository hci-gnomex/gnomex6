import {Component, Input, OnInit} from "@angular/core";
import {HttpParams} from "@angular/common/http";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {Subscription} from "rxjs/index";

import {DictionaryService} from "../../services/dictionary.service";
import {BillingService} from "../../services/billing.service";
import {GnomexService} from "../../services/gnomex.service";

import {Experiment} from "../../util/models/experiment.model";

@Component({
    selector: "tabSeqSetupView",
    templateUrl: "./tab-seq-setup-view.component.html",
    styles: [`

        .heading {
            width: 15%;
            min-width: 25em;
            padding-right: 2em;
            margin-bottom: 2em;
        }

        .bold { font-weight: bold; }
        
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

        .significant-left-padding { padding-left: 3em; }
        
        .special-width { width: 6rem; }
        
        .short-width {
            width: 20em;
            min-width: 20em;
        }
        .moderate-width {
            width: 40em;
            min-width: 20em;
        }
        .long-width {
            width: 60em;
            min-width: 40em;
        }

        .right-align { text-align: right; }
        
        label.mat-radio-label {
            margin-top:    0.15em !important;
            margin-bottom: 0.15em !important;
        }
        
    `]
})

export class TabSeqSetupViewComponent implements OnInit {

    @Input("requestCategory") requestCategory: any;

    @Input("experiment") set experiment(value: Experiment) {
        this._experiment = value;
    };

    @Input("lab") set lab(value: any) {
        if (!value || !this.requestCategory) {
            return;
        }

        let appPriceListParams: HttpParams = new HttpParams()
            .set("codeRequestCategory" ,this.requestCategory.codeRequestCategory)
            .set("idLab", value.idLab);

        this.themesSubscription = this.billingService.getLibPrepApplicationPriceList(appPriceListParams).subscribe((response: any) => {
            for (let price of response) {
                let key: string = price.codeApplication;
                this.priceMap[key] = price.price;
            }

            this.appPrices = [];
            this.form.get("seqType").setValue("");

            this.showPool = this.form
                && this.form.get("seqPrepByCore")
                && this.form.get("seqPrepByCore").value === this.NO;

            this.filteredApps = this.filterApplication(this.requestCategory, !this.showPool);
            this.setupThemes();
        });
    };

    public readonly YES: string = "Y";
    public readonly NO: string = "N";
    public readonly SEPARATE: string = "separate";
    public readonly POOLED: string = "pooled";
    public currState: string;

    private form: FormGroup;

    private _experiment: Experiment;

    private isPreppedContainer: boolean = true;
    private showPool: boolean = false;
    private priceMap: Map<string, string> = new Map<string, string>();
    private filteredApps: any[] = [];
    themeMap: Map<string, any> = new Map<string, any>();

    public themes: any[] = [];

    get appPrices(): any[] {
        return this._appPrices;
    }
    set appPrices(value: any[]) {
        if (!value) {
           this._appPrices = [];
        } else {
            this._appPrices = value.sort(TabSeqSetupViewComponent.sortBySortOrderThenDisplay);
        }
    }
    private _appPrices: any[] = [];

    private libToChange: boolean = false;

    get showPoolingType(): boolean {
        return this.form
            && this.form.get('seqPrepByCore')
            && this.form.get('seqPrepByCore').value
            && this.form.get('seqPrepByCore').value === this.YES;
    }

    get showLibraryDesign(): boolean {
        return this.form
            && this.form.get("appPrice")
            && this.form.get("appPrice").value
            && this.form.get("appPrice").value.hasCaptureLibDesign
            && this.form.get("appPrice").value.hasCaptureLibDesign === this.YES;
    }


    get poolingType(): string {
        if (this.form
            && this.form.get("pooledLib")
            && this.form.get("pooledLib").value) {

            return this.form.get("pooledLib").value;
        }
    }
    set poolingType(value: string) {
        // do nothing, value should change in form automatically.  This function needs to be defined for ngModel
    }

    get sequenceType(): any {
        if (this.form && this.form.get("seqType")) {
            return this.form.get("seqType").value;
        }

        return {
            display: '',
            idApplicationTheme: ''
        }
    }
    set sequenceType(value: any) {
        let tempAppPrices = [];

        if (value) {
            for (let app of this.filteredApps) {
                if (app.idApplicationTheme === value.idApplicationTheme) {
                    tempAppPrices.push(app);
                }
            }
        }

        this.appPrices = tempAppPrices;
    }


    private themesSubscription: Subscription;


    constructor(private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private billingService: BillingService,
                private fb: FormBuilder) { }

    ngOnInit() {
        this.form = this.fb.group({
            // seqPrepByCore:    [''],
            seqPrepByCore:    ['', Validators.required],
            pooledLib:     [''],
            numTubes:      [''],
            seqType:       ['', Validators.required],
            appPrice:      ['', Validators.required],
            libraryDesign: ['']
        });

        this.filteredApps = this.filterApplication(this.requestCategory, !this.showPool);
        this.setupThemes();
    }


    private setupThemes(): void {
        this.themes = [];
        this.themeMap = new Map<string, any>();

        let preparedAppList: any[] = [];
        let themeSet: Set<any> = new Set();

        for (let item of this.filteredApps) {
            let theme = this.dictionaryService.getEntry("hci.gnomex.model.ApplicationTheme", item.idApplicationTheme);
            if (!theme) {
                continue;
            }
            if (!this.themeMap.get(theme.value)) {
                this.themeMap.set(theme.value, theme);
            }
            if (!themeSet.has(theme)) {
                themeSet.add(theme);
            }

            if (this.priceMap && this.priceMap[item.codeApplication]) {
                item.price = this.priceMap[item.codeApplication];
            } else {
                item.price = "";
            }
            preparedAppList.push(item);
        }

        for (let thm of this.themeMap.values()) {
            this.themes.push(thm);
        }

        if (this.form.get("seqPrepByCore").value === this.YES) {
            preparedAppList.sort(TabSeqSetupViewComponent.sortApplicationsAlphabetically);
        }

        this.themes.sort(TabSeqSetupViewComponent.sortApplicationsOnOrder);
    }

    public onLipPrepChange(event): void {
        let appPriceListParams: HttpParams = new HttpParams()
            .set("codeRequestCategory" ,this.requestCategory.codeRequestCategory)
            .set("idLab", this._experiment.idLab);

        this.themes = [];  // Clearing out themes early to improve visual look of the change.
        this.sequenceType = null;

        this.billingService.getLibPrepApplicationPriceList(appPriceListParams).subscribe((response: any) => {
            if (response) {
                for (let price of response) {
                    let key: string = price.codeApplication;
                    this.priceMap[key] = price.price;
                }
            }

            this.appPrices = [];
            this.form.get("seqType").setValue("");

            if (this.form && this.form.get("seqPrepByCore")) {
                if (this.form.get("seqPrepByCore").value) {
                    this._experiment.seqPrepByCore = this.form.get("seqPrepByCore").value;
                } else {
                    this._experiment.seqPrepByCore = '';
                }

                this.showPool = this.form.get("seqPrepByCore").value === this.NO;
            }


            this.filteredApps = this.filterApplication(this.requestCategory, !this.showPool);
            this.setupThemes();
        });

        this.isPreppedContainer = !(this.currState === "NanoStringState");

        this.libToChange = false;
    }

    public selectTheme(event): void {
        // TODO: ? Seems like there should be something here
    }

    public onAppPriceChanged(event): void {
        let application = this.dictionaryService.getEntry('hci.gnomex.model.Application', this.form.get("appPrice").value.value);
        if (application) {
            this._experiment.application_object = application;

            //If it is sure select we need to show the library capture id input box
            this.libToChange = application.hasCaptureLibDesign === 'Y';
        }
    }

    public onNumTubesChanged(event): void {
        this._experiment.numPrePooledTubes = event;
    }

    public filterApplication(requestCategory, seqPrepByCore): any[] {
        let filteredApps: any[] = [];
        let filteredAppList: any[] = this.dictionaryService.getEntries('hci.gnomex.model.Application').sort(TabSeqSetupViewComponent.sortApplication);
        for (let app of filteredAppList) {
            if (!app.value) {
                continue;
            }
            if (app.isActive === 'N') {
                continue;
            }
            let doesMatchRequestCategory: boolean = false;
            let theApplications = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategoryApplication").filter((reqCatApp) => {
                return reqCatApp.value !== "" && reqCatApp.codeApplication === app.value;
            });

            for (let xref of theApplications) {
                if (xref.codeRequestCategory === requestCategory.codeRequestCategory) {
                    doesMatchRequestCategory = true;
                    break;
                }
            }

            let doesMatchSeqPrepByCore: boolean = false;
            if (doesMatchRequestCategory) {
                if (requestCategory.isIlluminaType !== 'Y' || !this.gnomexService.isInternalExperimentSubmission) {
                    doesMatchSeqPrepByCore = true;
                } else {
                    doesMatchSeqPrepByCore = (app.onlyForLabPrepped === "N" || seqPrepByCore);
                }
            }
            if (doesMatchRequestCategory && doesMatchSeqPrepByCore) {
                filteredApps.push(app);
            }
        }
        return filteredApps;
    }

    private static sortApplicationsAlphabetically(obj1, obj2): number{
        if (obj1 == null && obj2 == null) {
            return 0;
        }else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else{
            if(String(obj1.display).toLowerCase() < String(obj2.display).toLowerCase()){
                return -1;
            } else if(String(obj1.display).toLowerCase() > String(obj2.display).toLowerCase()){
                return 1;
            } else{
                return 0;
            }
        }
    }

    private static sortApplicationsOnOrder(obj1, obj2): number{
        if (obj1 == null && obj2 == null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {
            let sortOrder1: number = obj1.sortOrder == "" ? 999 : obj1.sortOrder;
            let sortOrder2: number = obj2.sortOrder == "" ? 999 : obj2.sortOrder;
            if (sortOrder1 < sortOrder2) {
                return -1;
            } else if (sortOrder1 > sortOrder2) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    private static sortBySortOrderThenDisplay(obj1, obj2): number{
        if ((obj1 === null || obj1 === undefined) && (obj2 === null || obj2 === undefined)) {
            return 0;
        } else if (obj1 === null || obj1 === undefined) {
            return 1;
        } else if (obj2 === null || obj2 === undefined) {
            return -1;
        } else {
            let sortOrder1: number = obj1.sortOrder === "" ? 999 : +obj1.sortOrder;
            let sortOrder2: number = obj2.sortOrder === "" ? 999 : +obj2.sortOrder;

            if (sortOrder1 < sortOrder2) {
                return -1;
            } else if (sortOrder1 > sortOrder2) {
                return 1;
            } else {
                if ((obj1.display === null || obj1.display === undefined)
                    && (obj2.display === null || obj2.display === undefined)) {
                    return 0;
                } else if (obj1.display === null || obj1.display === undefined) {
                    return 1;
                } else if (obj2.display === null || obj2.display === undefined) {
                    return -1;
                } else {
                    return obj1.display.toUpperCase().localeCompare(obj2.display.toUpperCase());
                }
            }
        }
    }

    public static sortApplication(obj1, obj2): number {
        if (obj1 === null && obj2 === null) {
            return 0;
        } else if (obj1 === null) {
            return 1;
        } else if (obj2 === null) {
            return -1;
        } else {
            let order1: number = obj1.sortOrder;
            let order2: number = obj2.sortOrder;
            let disp1: string = obj1.display;
            let disp2: string = obj2.display;

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
}
