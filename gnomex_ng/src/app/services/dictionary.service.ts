import {EventEmitter, Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/timeout';

@Injectable()
export class DictionaryService {

    public static readonly ALIGNMENT_PLATFORM: string = "hci.gnomex.model.AlignmentPlatform";
    public static readonly ANALYSIS_PROTOCOL: string = "hci.gnomex.model.AnalysisProtocol";
    public static readonly ANALYSIS_TYPE: string = "hci.gnomex.model.AnalysisType";
    public static readonly ANNOTATION_REPORT_FIELD: string = "hci.gnomex.model.AnnotationReportField";
    public static readonly APPLICATION: string = "hci.gnomex.model.Application";
    public static readonly APPLICATION_THEME: string = "hci.gnomex.model.ApplicationTheme";
    public static readonly APPLICATION_TYPE: string = "hci.gnomex.model.ApplicationType";
    public static readonly APP_USER: string = "hci.gnomex.model.AppUserLite";
    public static readonly ARRAY_COORDINATE: string = "hci.gnomex.model.ArrayCoordinate";
    public static readonly ASSAY: string = "hci.gnomex.model.Assay";
    public static readonly BILLING_CHARGE_KIND: string = "hci.gnomex.model.BillingChargeKind";
    public static readonly BILLING_PERIOD: string = "hci.gnomex.model.BillingPeriod";
    public static readonly BILLING_SLIDE_PRODUCT_CLASS: string = "hci.gnomex.model.BillingSlideProductClass";
    public static readonly BILLING_SLIDE_SERVICE_CLASS: string = "hci.gnomex.model.BillingSlideServiceClass";
    public static readonly BILLING_STATUS: string = "hci.gnomex.model.BillingStatus";
    public static readonly BIOANALYZER_CHIP_TYPE: string = "hci.gnomex.model.BioanalyzerChipType";
    public static readonly CONCENTRATION_UNIT: string = "hci.gnomex.model.ConcentrationUnit";
    public static readonly CONTEXT_SENSITIVE_HELP: string = "hci.gnomex.model.ContextSensitiveHelp";
    public static readonly CORE_FACILITY: string = "hci.gnomex.model.CoreFacility";
    public static readonly CREDIT_CARD_COMPANY: string = "hci.gnomex.model.CreditCardCompany";
    public static readonly EXPERIMENT_DESIGN: string = "hci.gnomex.model.ExperimentDesign";
    public static readonly EXPERIMENT_FACTOR: string = "hci.gnomex.model.ExperimentFactor";
    public static readonly FEATURE_EXTRACTION_PROTOCOL: string = "hci.gnomex.model.FeatureExtractionProtocol";
    public static readonly FUNDING_AGENCY: string = "hci.gnomex.model.FundingAgency";
    public static readonly GENOME_BUILD: string = "hci.gnomex.model.GenomeBuildLite";
    public static readonly HYB_PROTOCOL: string = "hci.gnomex.model.HybProtocol";
    public static readonly INSTITUTION: string = "hci.gnomex.model.Institution";
    public static readonly INSTRUMENT: string = "hci.gnomex.model.Instrument";
    public static readonly INSTRUMENT_RUN_STATUS: string = "hci.gnomex.model.InstrumentRunStatus";
    public static readonly ISOLATION_PREP_TYPE: string = "hci.gnomex.model.IsolationPrepType";
    public static readonly LABEL: string = "hci.gnomex.model.Label";
    public static readonly LABELING_PROTOCOL: string = "hci.gnomex.model.LabelingProtocol";
    public static readonly LABELING_REACTION_SIZE: string = "hci.gnomex.model.LabelingReactionSize";
    public static readonly LIBRARY_PREP_QC_PROTOCOL: string = "hci.gnomex.model.LibraryPrepQCProtocol";
    public static readonly NUCLEOTIDE_TYPE: string = "hci.gnomex.model.NucleotideType";
    public static readonly NUMBER_SEQUENCING_CYCLES: string = "hci.gnomex.model.NumberSequencingCycles";
    public static readonly NUMBER_SEQUENCING_CYCLES_ALLOWED: string = "hci.gnomex.model.NumberSequencingCyclesAllowed";
    public static readonly OLIGO_BARCODE: string = "hci.gnomex.model.OligoBarcode";
    public static readonly OLIGO_BARCODE_SCHEME: string = "hci.gnomex.model.OligoBarcodeScheme";
    public static readonly OLIGO_BARCODE_SCHEME_ALLOWED: string = "hci.gnomex.model.OligoBarcodeSchemeAllowed";
    public static readonly ORGANISM: string = "hci.gnomex.model.OrganismLite";
    public static readonly PIPELINE_PROTOCOL: string = "hci.gnomex.model.PipelineProtocol";
    public static readonly PLATE_TYPE: string = "hci.gnomex.model.PlateType";
    public static readonly PRICE_CATEGORY: string = "hci.gnomex.model.PriceCategoryLite";
    public static readonly PRIMER: string = "hci.gnomex.model.Primer";
    public static readonly PRODUCT_ORDER_STATUS: string = "hci.gnomex.model.ProductOrderStatus";
    public static readonly PRODUCT_TYPE: string = "hci.gnomex.model.ProductType";
    public static readonly PROPERTY_DICTIONARY: string = "hci.gnomex.model.PropertyDictionary";
    public static readonly REACTION_TYPE: string = "hci.gnomex.model.ReactionType";
    public static readonly REQUEST_CATEGORY: string = "hci.gnomex.model.RequestCategory";
    public static readonly REQUEST_CATEGORY_APPLICATION: string = "hci.gnomex.model.RequestCategoryApplication";
    public static readonly REQUEST_CATEGORY_TYPE: string = "hci.gnomex.model.RequestCategoryType";
    public static readonly REQUEST_STATUS: string = "hci.gnomex.model.RequestStatus";
    public static readonly SAMPLE_DROP_OFF_LOCATION: string = "hci.gnomex.model.SampleDropOffLocation";
    public static readonly SAMPLE_SOURCE: string = "hci.gnomex.model.SampleSource";
    public static readonly SAMPLE_TYPE: string = "hci.gnomex.model.SampleType";
    public static readonly SAMPLE_TYPE_REQUEST_CATEGORY: string = "hci.gnomex.model.SampleTypeRequestCategory";
    public static readonly SCAN_PROTOCOL: string = "hci.gnomex.model.ScanProtocol";
    public static readonly SEAL_TYPE: string = "hci.gnomex.model.SealType";
    public static readonly SEQ_LIB_PROTOCOL: string = "hci.gnomex.model.SeqLibProtocol";
    public static readonly SEQ_LIB_PROTOCOL_APPLICATION: string = "hci.gnomex.model.SeqLibProtocolApplication";
    public static readonly SEQ_LIB_TREATMENT: string = "hci.gnomex.model.SeqLibTreatment";
    public static readonly SEQ_RUN_TYPE: string = "hci.gnomex.model.SeqRunType";
    public static readonly SEQUENCING_CONTROL: string = "hci.gnomex.model.SequencingControl";
    public static readonly SEQUENCING_PLATFORM: string = "hci.gnomex.model.SequencingPlatform";
    public static readonly SLIDE_DESIGN: string = "hci.gnomex.model.SlideDesign";
    public static readonly SLIDE_SOURCE: string = "hci.gnomex.model.SlideSource";
    public static readonly STATE: string = "hci.gnomex.model.State";
    public static readonly STEP: string = "hci.gnomex.model.Step";
    public static readonly SUBMISSION_INSTRUCTION: string = "hci.gnomex.model.SubmissionInstruction";
    public static readonly USER_PERMISSION_KIND: string = "hci.gnomex.model.UserPermissionKind";
    public static readonly VENDOR: string = "hci.gnomex.model.Vendor";
    public static readonly VISIBILITY: string = "hci.gnomex.model.Visibility";
    public static readonly VISIBILTY: string = "hci.gnomex.model.Visibility";   // ***** REMOVE ME WHEN SAFE *****
    public static readonly WORKFLOW_PROPERTY: string = "hci.gnomex.model.WorkflowProperty";

    private cachedDictionaries: any;
    private cachedEntries: any;
    private cacheExpirationTime: number = 0;
    private CACHE_EXPIRATION_MILLIS = 600000;   // ten minutes = 600000 millis
    private reloadInProgress: Observable<any> = null;
    private RELOAD_EXPIRATION_MILLIS = 10000;   // ten seconds = 10000 millis

    constructor(private _http: Http) {}

    private cacheDictionaryData(dictionaryData) {
        this.cachedDictionaries = [];
        this.cachedEntries = {};
        for (let dictionary of dictionaryData) {
            this.cachedEntries[dictionary.className] = dictionary.DictionaryEntry;
            delete dictionary.DictionaryEntry;
            this.cachedDictionaries.push(dictionary);
        }
    }

    /**
     * Forces a full reload of the dictionary, returns an observable of an empty object when it is done.
     * Provide a callback function to query the dictionary if you need it to run after the reload is complete
     * This should be called when the application first loads.
     * @param callback A function to be called when the reload is complete
     * @param errorCallback A function (with 'error' parameter) to be called if the reload fails
     */
    reload(callback?, errorCallback?): void {
        if (this.reloadInProgress) {
            if (callback || errorCallback) {
                this.reloadInProgress.subscribe((response) => {
                    if (callback) {
                        callback();
                    }
                }, (error) => {
                    if (errorCallback) {
                        errorCallback(error);
                    }
                });
            }
        } else {
            this.reloadInProgress = this.loadDictionariesObservable();
            this.reloadInProgress.subscribe((response) => {
                this.cacheDictionaryData(response);
                this.cacheExpirationTime = Date.now() + this.CACHE_EXPIRATION_MILLIS;
                this.reloadInProgress = null;
                if (callback) {
                    callback();
                }
            }, (error) => {
                this.reloadInProgress = null;
                if (errorCallback) {
                    errorCallback(error);
                }
            });
        }
    }

    /**
     * Backend call to load all dictionaries from the database
     * Forces a database call and returns an observable that will throw an error
     * if data is not returned in a specific amount of time (RELOAD_EXPIRATION_MILLIS)
     * @returns {Observable<any>}
     */
    private loadDictionariesObservable(): Observable<any> {
        let emitter: EventEmitter<any> = new EventEmitter();
        this.loadDictionaries().subscribe((response) => {
            emitter.emit(response);
            emitter.complete();
        });
        return emitter.asObservable().timeout(this.RELOAD_EXPIRATION_MILLIS);
    }

    /**
     * Backend call to load all dictionaries from the database
     * Follows typical GNomEx backend format, which returns an Observable without forcing a database call
     * The database call only happens when the caller to this method subscribes to the Observable
     * @returns {Observable<any>} The dictionary object
     */
    private loadDictionaries(): Observable<any> {
        return this._http.get("/gnomex/ManageDictionaries.gx?action=load", {withCredentials: true}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error in ManageDictionaries");
            }
        });
    }

    /**
     * Internal method to get the current list of cached dictionary objects without the entries
     * If the cache has expired this will initiate a reload but not wait for the newest version
     * @returns {any[]}
     */
    private getCachedDictionaries(): any[] {
        if (!this.cachedDictionaries) {
            this.reload();
            throw "error in dictionary service: missing cached dictionaries";
        }
        if (Date.now() > this.cacheExpirationTime) {
            this.reload();
        }
        return this.cachedDictionaries;
    }

    /**
     * Internal method to get the current list of cached dictionary entries for the given className
     * If the cache has expired this will initiate a reload but not wait for the newest version
     * If there is no dictionary for the given className, returns an empty array
     * @param {string} className
     * @returns {any[]}
     */
    private getCachedEntries(className: string): any[] {
        if (!this.cachedEntries) {
            this.reload();
            throw "error in dictionary service: missing cached entries";
        }
        if (Date.now() > this.cacheExpirationTime) {
            this.reload();
        }
        if (this.cachedEntries[className]) {
            return this.cachedEntries[className];
        } else {
            return [];
        }
    }

    private sortArrayByField(array: any[], fieldName: string) {
        return array.sort((o1, o2) => {
            if (o1[fieldName] < o2[fieldName]) {
                return -1;
            } else if (o1[fieldName] > o2[fieldName]) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    /**
     * Get an array of all dictionary objects (no entries), sorted by displayName
     * @returns {any[]}
     */
    getAllDictionaries(): any[] {
        let dictionaries: any[] = this.cloneObject(this.getCachedDictionaries());
        return this.sortArrayByField(dictionaries, "displayName");
    }

    /**
     * Get an array of all editable dictionary objects (no entries), sorted by displayName
     * @returns {any[]}
     */
    getEditableDictionaries(): any[] {
        return this.getAllDictionaries().filter((value) => (value.canWrite == "Y"));
    }

    /**
     * Get the dictionary object (no entries) for a specific className, returns undefined if not found
     * @param {string} className
     * @returns {any}
     */
    getDictionary(className: string): any {
        let dictionary = this.getCachedDictionaries().find((value) => (value.className == className));
        return this.cloneObject(dictionary);
    }

    /**
     * Get all dictionary entries for a specific className, including blank entries, sorted by display
     * Returns an empty array if not found
     * @param {string} className
     * @returns {any[]}
     */
    getEntries(className: string): any[] {
        let entries = this.cloneObject(this.getCachedEntries(className));
        return this.sortArrayByField(entries, "display");
    }

    /**
     * Get all dictionary entries for a specific className, excluding blank entries, sorted by display
     * Returns an empty array if not found
     * @param {string} className
     * @returns {any[]}
     */
    getEntriesExcludeBlank(className: string): any[] {
        return this.getEntries(className).filter((value) => value.value != "");
    }

    /**
     * Get all core facilities
     * @returns {any[]}
     */
    coreFacilities(): any[] {
        return this.getEntries(DictionaryService.CORE_FACILITY);
    }

    /**
     * Get the dictionary entry for a specific className and value. Returns undefined if no match is found.
     * @param {string} className
     * @param {string} value
     * @returns {any}
     */
    getEntry(className: string, value: string): any {
        let entry = this.getCachedEntries(className).find((entry) => entry.value == value);
        return this.cloneObject(entry);
    }

    /**
     * Returns an array of dictionary entries for a specific className and array of values.
     * @param {string} className
     * @param {string[]} values
     * @returns {any}
     */
    getEntryArray(className: string, values: string[]): any {
        if (!values) {
            return [];
        }
        if (Array.isArray(values)) {
            return values.map((value) => this.getEntry(className, value));
        } else {
            return this.getEntry(className, values);
        }
    }

    /**
     * Returns the display text for the dictionary entry matching the className and value provided.
     * Returns an empty string if no match is found.
     * @param {string} className
     * @param {string} value
     * @returns {string}
     */
    getEntryDisplay(className: string, value: string): string {
        let entry = this.getEntry(className, value);
        if (entry && entry.display) {
            return entry.display;
        } else {
            return "";
        }
    }

    /**
     * Asynchronous call to retrieve dictionary metadata
     * @param {string} className
     * @returns {Observable<any>}
     */
    getMetaData(className: string): Observable<any> {
        return this._http.get("/gnomex/ManageDictionaries.gx?action=metadata&className=" + className, {withCredentials: true}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error in metaData for class: " + className);
            }
        });
    }

    private cloneObject(object: any): any {
        if (!object) {
            // leave null and undefined unchanged
            return object;
        }
        return JSON.parse(JSON.stringify(object));
    }

}
