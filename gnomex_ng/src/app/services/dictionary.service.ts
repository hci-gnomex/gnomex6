import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Dictionary} from "../configuration/dictionary.interface";
import {DictionaryEntry} from "../configuration/dictionary-entry.type";
import {CookieUtilService} from "./cookie-util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {HttpUriEncodingCodec} from "./interceptors/http-uri-encoding-codec";

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
    public static readonly COLUMN_PROPERTIES: string = "hci.gnomex.model.ColumnProperties";
    public static readonly CONCENTRATION_UNIT: string = "hci.gnomex.model.ConcentrationUnit";
    public static readonly CONTEXT_SENSITIVE_HELP: string = "hci.gnomex.model.ContextSensitiveHelp";
    public static readonly CORE_FACILITY: string = "hci.gnomex.model.CoreFacility";
    public static readonly CREDIT_CARD_COMPANY: string = "hci.gnomex.model.CreditCardCompany";
    public static readonly DOWNSTREAM_ANALYSIS: string = "hci.gnomex.model.DownstreamAnalysis";
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
    public static readonly PROPERTY_PLATFORM_APPLICATION_DICTIONARY: string = "hci.gnomex.model.PropertyPlatformApplication";
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
    public static readonly WORKFLOW_PROPERTY: string = "hci.gnomex.model.WorkflowProperty";

    private cachedDictionaries: Dictionary[] = [];
    private cachedEntries: { [key: string]: DictionaryEntry[] } = {};

    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    public load(callback?: () => void | null, errorCallback?: () => void | null, className?: string): void {
        this.loadDictionaries(className).subscribe((result: any) => {
            if (result && result.result && result.result !== 'SUCCESS') {
                if (errorCallback) {
                    errorCallback();
                }
                return;
            }

            if (className) {
                this.cacheDictionary(result[0], true);
            } else {
                this.cacheDictionaries(result);
            }

            if (callback) {
                callback();
            }
        }, () => {
            if (errorCallback) {
                errorCallback();
            }
        });
    }

    public reload(callback?: () => void | null, errorCallback?: () => void | null): void {
        this.reloadDictionaries().subscribe((result: any) => {
            if (result && result.result && result.result === 'SUCCESS') {
                if (callback) {
                    callback();
                }
            } else {
                if (errorCallback) {
                    errorCallback();
                }
            }
        }, () => {
            if (errorCallback) {
                errorCallback();
            }
        });
    }

    public reloadAndRefresh(callback?: () => void | null, errorCallback?: () => void | null, className?: string): void {
        this.reload(() => {
            this.load(callback, errorCallback, className);
        }, errorCallback);
    }

    public save(insertMode: boolean, object: HttpParams, className: string, callback?: () => void | null, errorCallback?: () => void | null): void {
        this.changeDictionary(object, insertMode ? "add" : "save", className, callback, errorCallback);
    }

    public delete(object: HttpParams, className: string, callback?: () => void | null, errorCallback?: () => void | null): void {
        this.changeDictionary(object, "delete", className, callback, errorCallback);
    }

    private changeDictionary(object: HttpParams, action: string, className: string, callback?: () => void | null, errorCallback?: () => void | null): void {
        let params: HttpParams = object
            .set("action", action)
            .set("className", className);
        this.callManageDictionariesPOST(params).subscribe((result: any) => {
            if (result && Array.isArray(result)) {
                this.cacheDictionary(result[0], true);
                if (callback) {
                    callback();
                }
            } else {
                if (errorCallback) {
                    errorCallback();
                }
            }
        }, (err: IGnomexErrorResponse) => {
            if (errorCallback) {
                errorCallback();
            }
        });
    }

    private callManageDictionariesGET(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/ManageDictionaries.gx", {params: params});
    }

    private callManageDictionariesPOST(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/ManageDictionaries.gx", params.toString(), {headers: headers});
    }

    public saveDictionaries(dictionaryEntries: any[], className: string, callback?: () => void | null, errorCallback?: () => void | null): void {
        for (let entry of dictionaryEntries) {
            let object: HttpParams = <HttpParams> entry["object"];
            let action: string = entry["action"];
            this.changeDictionary(object, action, className, callback, errorCallback);
        }
    }

    private loadDictionaries(className?: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("action", "load");
        if (className) {
            params = params.set("className", className);
        }
        return this.callManageDictionariesGET(params);
    }

    private reloadDictionaries(): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("action", "reload");
        return this.callManageDictionariesPOST(params);
    }

    public getMetaData(className: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("action", "metadata")
            .set("className", className);
        return this.callManageDictionariesGET(params);
    }

    private cacheDictionaries(dictionaryData: Dictionary[]): void {
        this.cachedDictionaries = [];
        this.cachedEntries = {};
        for (let dictionary of dictionaryData) {
            this.cacheDictionary(dictionary);
        }
    }

    private cacheDictionary(dictionary: Dictionary, isRefresh: boolean = false): void {
        this.cachedEntries[dictionary.className] = Array.isArray(dictionary.DictionaryEntry) ? dictionary.DictionaryEntry : [dictionary.DictionaryEntry];
        delete dictionary.DictionaryEntry;
        dictionary.Filters = Array.isArray(dictionary.Filters) ? dictionary.Filters : [(dictionary.Filters as any).filter];

        if (isRefresh) {
            let found: boolean = false;
            for (let index: number = 0; index < this.cachedDictionaries.length; index++) {
                if (this.cachedDictionaries[index].className === dictionary.className) {
                    found = true;
                    this.cachedDictionaries[index] = dictionary;
                    break;
                }
            }
            if (!found) {
                this.cachedDictionaries.push(dictionary);
            }
        } else {
            this.cachedDictionaries.push(dictionary);
        }
    }

    private getCachedDictionaries(): Dictionary[] {
        return this.cachedDictionaries;
    }

    private getCachedEntries(className: string): DictionaryEntry[] {
        if (this.cachedEntries[className]) {
            return this.cachedEntries[className];
        } else {
            return [];
        }
    }

    public getAllDictionaries(): Dictionary[] {
        let dictionaries: Dictionary[] = DictionaryService.cloneObject(this.getCachedDictionaries());
        return DictionaryService.sortArrayByField(dictionaries, "displayName");
    }

    public getEditableDictionaries(): Dictionary[] {
        return this.getAllDictionaries().filter((value: Dictionary) => (value.canWrite === "Y"));
    }

    public getDictionary(className: string): Dictionary {
        let dictionary: Dictionary = this.getCachedDictionaries().find((value: Dictionary) => (value.className === className));
        return DictionaryService.cloneObject(dictionary);
    }

    public getEntries(className: string): DictionaryEntry[] {
        let entries: DictionaryEntry[] = DictionaryService.cloneObject(this.getCachedEntries(className));
        return DictionaryService.sortArrayByField(entries, "display");
    }

    public getEntriesExcludeBlank(className: string): DictionaryEntry[] {
        return this.getEntries(className).filter((value: DictionaryEntry) => value.value !== "");
    }

    public getEntriesCF(className: string): DictionaryEntry[] {
        let entries: DictionaryEntry[] = DictionaryService.cloneObject(this.getCachedEntries(className));
        return DictionaryService.sortArrayByField(entries, "value");
    }

    public getEntriesExcludeBlankCF(className: string): DictionaryEntry[] {
        return this.getEntriesCF(className).filter((value: DictionaryEntry) => value.value !== "");
    }

    public getEntry(className: string, value: string): DictionaryEntry {
        let entry: DictionaryEntry = this.getCachedEntries(className).find((entry: DictionaryEntry) => entry.value === value);
        return DictionaryService.cloneObject(entry);
    }

    public getEntryArray(className: string, values: string[]): DictionaryEntry[] {
        if (!values) {
            return [];
        }
        return values.map((value: string) => this.getEntry(className, value));
    }

    public getEntryDisplay(className: string, value: string): string {
        let entry: DictionaryEntry = this.getEntry(className, value);
        return entry ? entry.display : "";
    }

    public findEntryByField(className: string, fieldName: string, fieldValue: string): DictionaryEntry {
        let entry: DictionaryEntry = this.getCachedEntries(className).find((entry: DictionaryEntry) => entry[fieldName] === fieldValue);
        return DictionaryService.cloneObject(entry);
    }

    public coreFacilities(): DictionaryEntry[] {
        return this.getEntries(DictionaryService.CORE_FACILITY);
    }

    // Given the code application function returns the first active protocol associated with the application.
    // This is useful for Illumina applications which by process have only one active protocol associated with them.
    public getProtocolFromApplication(codeApplication: string): any {
        let returnProtocol: any = null;
        let seqLibProtocolApplication = this.findEntryByField(DictionaryService.SEQ_LIB_PROTOCOL_APPLICATION, "codeApplication", codeApplication);

        return seqLibProtocolApplication;
    }

    public getApplicationForProtocol(idSeqLibProtocol: string): DictionaryEntry {
        let application: DictionaryEntry;
        let seqLibProtocolApplication: DictionaryEntry = this.findEntryByField(DictionaryService.SEQ_LIB_PROTOCOL_APPLICATION, "idSeqLibProtocol", idSeqLibProtocol);
        if (seqLibProtocolApplication) {
            application = this.findEntryByField(DictionaryService.APPLICATION, "codeApplication", seqLibProtocolApplication.codeApplication);
        }
        return application;
    }

    private static sortArrayByField<T>(array: T[], fieldName: string): T[] {
        return array.sort((o1: T, o2: T) => {
            return o1[fieldName] - o2[fieldName];
        });
    }

    private static cloneObject<T>(object: T): T {
        if (!object) {
            return object; // leave null and undefined unchanged
        }
        return JSON.parse(JSON.stringify(object));
    }

    public saveInstitutions(institutions: any[]): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("institutions", JSON.stringify(institutions))
            .set("noJSONToXMLConversionNeeded", "Y");
        return this.httpClient.post("/gnomex/SaveInstitution.gx", params.toString(), {headers: headers});
    }

}
