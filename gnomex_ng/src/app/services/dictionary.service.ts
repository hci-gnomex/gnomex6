import {EventEmitter, Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {ProgressService} from "../home/progress.service";

@Injectable()
export class DictionaryService {

    public static readonly APPLICATION:string = "hci.gnomex.model.Application";
    public static readonly ANNOTATION_REPORT_FIELD = "hci.gnomex.model.AnnotationReportField";
    public static readonly BILLING_PERIOD: string = "hci.gnomex.model.BillingPeriod";
    public static readonly CORE_FACILITY: string = "hci.gnomex.model.CoreFacility";
    public static readonly GENOME_BUILD: string = "hci.gnomex.model.GenomeBuildLite";
    public static readonly INSTITUTION: string = "hci.gnomex.model.Institution";
    public static readonly NUMBER_SEQUENCING_CYCLES_ALLOWED: string = "hci.gnomex.model.NumberSequencingCyclesAllowed";
    public static readonly OLIGO_BARCODE: string = "hci.gnomex.model.OligoBarcode";
    public static readonly ORGANISM: string = "hci.gnomex.model.OrganismLite";
    public static readonly PROPERTY_DICTIONARY: string = "hci.gnomex.model.PropertyDictionary";
    public static readonly REQUEST_CATEGORY: string = "hci.gnomex.model.RequestCategory";
    public static readonly SEQ_LIB_PROTOCOL: string = "hci.gnomex.model.SeqLibProtocol";
    public static readonly VISIBILTY: string = "hci.gnomex.model.Visibility";
    public static readonly ANALYSIS_TYPE:string = "hci.gnomex.model.AnalysisType";
    public static readonly ANALYSIS_PROTOCOL:string = "hci.gnomex.model.AnalysisProtocol";

    private cachedDictionaries: any;
    private cachedEntries: any;
    private cacheExpirationTime: number = 0;
    private reloadObservable: Observable<any> = null;
    private CACHE_EXPIRATION_MILLIS = 600000;   // ten minutes = 600000 millis

    constructor(private _http: Http, private progressService: ProgressService) {}

    private cacheDictionaryData(dictionaryData) {
        this.cachedDictionaries = [];
        this.cachedEntries = {};
        for (let dictionary of dictionaryData) {
            this.cachedEntries[dictionary.className] = dictionary.DictionaryEntry;
            delete dictionary.DictionaryEntry;
            this.cachedDictionaries.push(dictionary);
        }
        this.fixRequestCategories();
    }

    private fixRequestCategories() {
        let entries = this.cachedEntries[DictionaryService.REQUEST_CATEGORY];
        for (let entry of entries) {
            if (entry.codeRequestCategory == 'CAPSEQ') {entry.type = 'CAPSEQ';}
            if (entry.codeRequestCategory == 'FOO') {entry.type = 'CAPSEQ';}
            if (entry.codeRequestCategory == 'CLINSEQ') {entry.type = 'CLINSEQ';}
            if (entry.codeRequestCategory == 'AATI') {entry.type = 'FRAGANAL';}
            if (entry.codeRequestCategory == 'DDPCR') {entry.type = 'GENERIC';}
            if (entry.codeRequestCategory == 'DNAGEN') {entry.type = 'GENERIC';}
            if (entry.codeRequestCategory == 'EXP4') {entry.type = 'GENERIC';}
            if (entry.codeRequestCategory == 'IONTOR') {entry.type = 'GENERIC';}
            if (entry.codeRequestCategory == 'IONTORPR') {entry.type = 'GENERIC';}
            if (entry.codeRequestCategory == '121') {entry.type = 'HISEQ';}
            if (entry.codeRequestCategory == 'BCHEEZ') {entry.type = 'HISEQ';}
            if (entry.codeRequestCategory == 'EXP5') {entry.type = 'HISEQ';}
            if (entry.codeRequestCategory == 'HISEQ') {entry.type = 'HISEQ';}
            if (entry.codeRequestCategory == 'SOLEXA') {entry.type = 'HISEQ';}
            if (entry.codeRequestCategory == 'SSEQ') {entry.type = 'HISEQ';}
            if (entry.codeRequestCategory == 'TP36') {entry.type = 'HISEQ';}
            if (entry.codeRequestCategory == 'ISCAN') {entry.type = 'ISCAN';}
            if (entry.codeRequestCategory == '45') {entry.type = 'ISOLATION';}
            if (entry.codeRequestCategory == 'ISOL') {entry.type = 'ISOLATION';}
            if (entry.codeRequestCategory == '539') {entry.type = 'MICROARRAY';}
            if (entry.codeRequestCategory == 'AFFY') {entry.type = 'MICROARRAY';}
            if (entry.codeRequestCategory == 'AGIL') {entry.type = 'MICROARRAY';}
            if (entry.codeRequestCategory == 'AGIL1') {entry.type = 'MICROARRAY';}
            if (entry.codeRequestCategory == 'CHEEZ') {entry.type = 'MICROARRAY';}
            if (entry.codeRequestCategory == 'EXP3') {entry.type = 'MICROARRAY';}
            if (entry.codeRequestCategory == 'INHOUSE') {entry.type = 'MICROARRAY';}
            if (entry.codeRequestCategory == 'NIMBLE') {entry.type = 'MICROARRAY';}
            if (entry.codeRequestCategory == 'OTHER') {entry.type = 'MICROARRAY';}
            if (entry.codeRequestCategory == 'MDMISEQ') {entry.type = 'MISEQ';}
            if (entry.codeRequestCategory == 'MISEQ') {entry.type = 'MISEQ';}
            if (entry.codeRequestCategory == 'NANO') {entry.type = 'NANOSTRING';}
            if (entry.codeRequestCategory == 'MDSQ') {entry.type = 'QC';}
            if (entry.codeRequestCategory == 'QC') {entry.type = 'QC';}
            if (entry.codeRequestCategory == 'SEQEPI') {entry.type = 'SEQUENOM';}
            if (entry.codeRequestCategory == 'SEQUENOM') {entry.type = 'SEQUENOM';}
        }
    }

    /**
     * Forces a full reload of the dictionary, returns an observable of an empty object when it is done.
     * Provide a callback function to query the dictionary if you need it to run after the reload is complete
     * This should be called when the application first loads.
     * @param callback A function to be called when the reload is complete
     */
    reload(callback?): void {
        if (this.reloadObservable) {
            if (callback) {
            this.reloadObservable.subscribe((response) => {
                    callback();
                });
                }
        } else {
            this.reloadObservable = this.loadDictionariesObservable();
            this.reloadObservable.subscribe((response) => {
                this.cacheDictionaryData(response);
                this.cacheExpirationTime = Date.now() + this.CACHE_EXPIRATION_MILLIS;
                this.reloadObservable = null;
                //this.progressService.displayLoader(100);
                if (callback) {
                    callback();
                }
            });
        }
    }

    /**
     * Backend call to load all dictionaries from the database
     * Forces a database call and returns an observable
     * @returns {Observable<any>}
     */
    private loadDictionariesObservable(): Observable<any> {
        let emitter: EventEmitter<any> = new EventEmitter();
        this.loadDictionaries().subscribe((response) => {
            emitter.emit(response);
            emitter.complete();
        });
        return emitter.asObservable();
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
        if (Date.now() > this.cacheExpirationTime) {
            this.reload();
        }
        if (this.cachedEntries[className]) {
            return this.cachedEntries[className]
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
        return this.getCachedDictionaries().find((value) => (value.className == className));
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

    getMetaData(className: string): Observable<any> {
        return this._http.get("/gnomex/ManageDictionaries.gx?action=metadata&className=" + className, {withCredentials: true}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error in metaDataClass");
            }
        });
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

    private cloneObject(object: any): any {
        if (!object) {
            // leave null and undefined unchanged
            return object;
        }
        return JSON.parse(JSON.stringify(object));
    }

}
