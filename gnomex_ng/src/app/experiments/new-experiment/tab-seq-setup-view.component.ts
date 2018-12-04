import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {BillingService} from "../../services/billing.service";

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
    public readonly YES: string = "yes";
    public readonly NO: string = "no";
    public readonly SEPARATE: string = "separate";
    public readonly POOLED: string = "pooled";
    public currState: string;
    @Input() requestCategory: any;

    private form: FormGroup;
    private isPreppedContainer: boolean = true;
    private showPool: boolean = false;
    private priceMap: Map<string, string> = new Map<string, string>();
    private filteredApps: any[] = [];
    themeMap: Map<string, any> = new Map<string, any>();

    public themes: any[] = [];
    public appPrices: any[] = [];

    // private showAppPrice: boolean = false;
    // private libraryDesign: boolean = false;
    private libToChange: boolean = false;

    get showPoolingType(): boolean {
        return this.form
            && this.form.get('seqLibPrep')
            && this.form.get('seqLibPrep').value
            && this.form.get('seqLibPrep').value === this.NO;
    }

    get showLibraryDesign(): boolean {
        return this.form
            && this.form.get("appPrice")
            && this.form.get("appPrice").value
            && this.form.get("appPrice").value.hasCaptureLibDesign
            && this.form.get("appPrice").value.hasCaptureLibDesign === 'Y';
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
        this.appPrices =[];

        if (value) {
            for (let app of this.filteredApps) {
                if (app.idApplicationTheme === value.idApplicationTheme) {
                    this.appPrices.push(app);
                }
            }
        }

        this.newExperimentService.seqType = value;
    }


    constructor(private dictionaryService: DictionaryService,
                private newExperimentService: NewExperimentService,
                private billingService: BillingService,
                private changeRef: ChangeDetectorRef,
                private fb: FormBuilder) {
    }

    ngOnInit() {
        this.form = this.fb.group({
            seqLibPrep:    [''],
            // seqLibPrep:    ['', Validators.required],
            pooledLib:     [''],
            numTubes:      [''],
            seqType:       ['', Validators.required],
            appPrice:      ['', Validators.required],
            libraryDesign: ['']
        });

        this.filteredApps = this.newExperimentService.filterApplication(this.requestCategory, !this.showPool);
        this.setupThemes();
    }

    ngAfterViewInit() {
    }

    getPriceList() {
        let appPriceListParams: HttpParams = new HttpParams().set("codeRequestCategory" ,this.requestCategory.codeRequestCategory)
            .set("idLab", this.newExperimentService.lab.idLab);
        this.billingService.getLibPrepApplicationPriceList(appPriceListParams).subscribe((response: any) => {
            for (let price of response) {
                let key: string = price.codeApplication;
                this.priceMap[key] = price.price;
            }

        });

    }

    setupThemes() {
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
            // if (theme.length > 0) {
            //     this.themeMap[item.idApplicationTheme] = theme[0];
            // }
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

        if (this.form.get("seqLibPrep").value === "yes") {
            preparedAppList.sort(this.sortApplicationsAlphabetically);
        }


        this.themes.sort(this.sortApplicationsOnOrder);

        // this.applicationRepeater.dataProvider = preparedAppList;
        // preparedAppList.refresh();
        // this.chosenThemeLabel.text = "";
        // libraryDesign.visible = false;
        // libraryDesign.includeInLayout = false;
        //

    }

    onLipPrepChange(event) {
        let appPriceListParams: HttpParams = new HttpParams()
            .set("codeRequestCategory" ,this.requestCategory.codeRequestCategory)
            .set("idLab", this.newExperimentService.lab.idLab);

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

            if (event.value === this.NO) {
                this.showPool = true;
            } else {
                this.showPool = false;
            }

            this.filteredApps = this.newExperimentService.filterApplication(this.requestCategory, !this.showPool);
            this.setupThemes();
            // this.showAppPrice = true;
        });

        if (this.currState === "NanoStringState") {
            // Hide isPrepped
            this.isPreppedContainer = false;
        } else {
            this.isPreppedContainer = true;
        }

        this.libToChange = false;
    }
    //
    // onPooledChanged(event) {
    //     this.showAppPrice = true;
    //
    // }

    // onSeqTypeChanged(event) {
    //     this.appPrices =[];
    //     for (let app of this.filteredApps) {
    //         if (app.idApplicationTheme === event.value.idApplicationTheme) {
    //             this.appPrices.push(app);
    //         }
    //
    //     }
    //     this.newExperimentService.seqType = this.form.get("seqType").value;
    //
    // }

    selectApp(event) {

    }

    selectTheme(event) {

    }

    onAppPriceChanged(event) {
        let application = this.dictionaryService.getEntry('hci.gnomex.model.Application', this.form.get("appPrice").value.value);
        if (application) {
            this.newExperimentService.applicationName = application.display;
            this.newExperimentService.codeApplication = application.codeApplication;
            if(application.hasCaptureLibDesign === 'Y'){ //If it is sure select we need to show the library capture id input box
                this.libToChange = true;
            } else {
                this.libToChange = false;
                // this.form.controls['libraryDesign'].setValidators([Validators.required]);
                // TODO Need to create new request
                // this.newExperimentService.request.captureLibDesignId = "";
            }
        }
    }

    ngAfterViewChecked() {
        // let detectChanges: boolean = false;
        //
        // if (this.libToChange !== this.libraryDesign) {
        //     this.libraryDesign = this.libToChange;
        //     detectChanges = true;
        // }
        // if (detectChanges) {
        //     this.changeRef.detectChanges();
        // }
    }

    onNumTubesChanged(event) {
        this.newExperimentService.numTubes = event
    }

    onNumSamplesChanged(event) {

    }

    private sortApplicationsAlphabetically(obj1, obj2): number{
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

    private sortApplicationsOnOrder(obj1, obj2): number{
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


}
