import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {DictionaryService} from "./dictionary.service";
import {Observable} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";
import {map} from "rxjs/operators";


export enum annotType
{
    CHECK = "CHECK",
    URL = "URL",
    OPTION = "OPTION",
    MOPTION = "MOPTION",
    TEXT = "TEXT"
}

@Injectable()
export class PropertyService {

    readonly SHOW_FUNDING_AGENCY: string = 'show_funding_agency';
    public static readonly PROPERTY_CONTACT_EMAIL_SOFTWARE_BUGS: string = 'contact_email_software_bugs';
    public static readonly PROPERTY_CONTACT_EMAIL_BIOINFORMATICS: string = 'contact_email_bioinformatics';
    public static readonly PROPERTY_NO_PUBLIC_VISIBILITY:string = "no_public_visibility";
    public static readonly PROPERTY_PRODUCT_SHEET_NAME: string = 'product_sheet_name';
    public static readonly SHOW_ADMIN_NOTES_ON_REQUEST: string = 'show_admin_notes_on_request';
    public static readonly PROPERTY_DATASET_PRIVACY_EXPIRATION:string = "dataset_privacy_expiration";
    public static readonly PROPERTY_HIDE_EXCLUDE_USAGE_FLAG:string = "hide_exclude_usage_flag";
    public static readonly PROPERTY_SAMPLE_BATCH_WARNING:string = "sample_batch_warning";
    public static readonly PROPERTY_NO_PRODUCTS_MESSAGE:string = "no_products_message";
    public static readonly PROPERTY_DESCRIPTION_NAME_MANDATORY_FOR_INTERNAL_EXPERIMENTS:string = "description_name_mandatory_for_internal_experiments";
    public static readonly PROPERTY_STATUS_TO_USE_PRODUCTS:string = "status_to_use_products";
    public static readonly PROPERTY_NEW_REQUEST_SAVE_BEFORE_SUBMIT:string =  "new_request_save_before_submit";
    public static readonly PROPERTY_INTERNAL_PRICE_LABEL:string = "internal_price_label";
    public static readonly PROPERTY_EXTERNAL_ACADEMIC_PRICE_LABEL:string = "external_academic_price_label";
    public static readonly PROPERTY_EXTERNAL_COMMERCIAL_PRICE_LABEL:string = "external_commercial_price_label";
    public static readonly PROPERTY_WORK_AUTHORIZATION_MAIN_GNOMEX_NAME: string = "workauth1_name";
    public static readonly PROPERTY_WORK_AUTHORIZATION_MAIN_GNOMEX_URL: string  = "workauth1_url";
    public static readonly PROPERTY_WORK_AUTHORIZATION_ALT_GNOMEX_NAME: string = "workauth2_name";
    public static readonly PROPERTY_WORK_AUTHORIZATION_ALT_GNOMEX_URL: string  = "workauth2_url";
    public static readonly PROPERTY_QC_ASSAY_HIDE_BUFFER_STRENGTH: string = "qc_assay_hide_buffer_strength";
    public static readonly PROPERTY_QC_ASSAY_HIDE_WELLS_PER_CHIP: string = "qc_assay_hide_wells_per_chip";
    public static readonly PROPERTY_DATATRACK_SUPPORTED: string = "datatrack_supported";
    public static readonly PROPERTY_FDT_SUPPORTED: string = "fdt_supported";
    public static readonly PROPERTY_HELP_URL: string = "help_url";
    public static readonly PROPERTY_HIDE_INSTITUTIONS: string = "hide_institutions";
    public static readonly PROPERTY_ALLOW_ADD_SEQUENCING_SERVICES: string = "allow_add_sequencing_services";
    public static readonly PROPERTY_WORKAUTH_INSTRUCTIONS: string = "workauth_instructions";
    public static readonly PROPERTY_AUTH_ACCOUNTS_DESCRIPTION: string = "auth_accounts_description";
    public static readonly PROPERTY_ACCESS_AUTH_ACCOUNT_LINK_TEXT: string = "access_auth_account_link_text";
    public static readonly PROPERTY_ACCOUNT_NUMBER_ACCOUNT_DEFAULT: string = "account_number_account_default";
    public static readonly PROPERTY_CONFIGURABLE_BILLING_ACCOUNTS: string = "configurable_billing_accounts";
    public static readonly PROPERTY_EXPERIMENT_DEFAULT_VIEW: string = "experiment_default_view";
    public static readonly PROPERTY_EXCLUDE_NEW_REQUESTS: string = "exclude_new_requests";
    public static readonly PROPERTY_BULLETIN: string = "bulletin";
    public static readonly PROPERTY_DISABLE_USER_SIGNUP: string = "disable_user_signup";
    public static readonly PROPERTY_NO_GUEST_ACCESS: string = "no_guest_access";
    public static readonly PROPERTY_GUEST_DOWNLOAD_TERMS: string = "guest_download_terms";
    public static readonly PROPERTY_ALLOW_PRICE_QUOTE: string = "allow_price_quote";
    public static readonly PROPERTY_HIDE_MULTIPLEX_LANE_OOLUMN: string = "hide_multiplex_lane_column";
    public static readonly PROPERTY_DEFAULT_VALUE_MULTIPLEX_LANE_COLUMN: string = "default_value_multiplex_lane_column";
    public static readonly PROPERTY_ESTIMATED_PRICE_WARNING: string = "estimated_price_warning";

    public static readonly PROPERTY_ANALYSIS_ASSISTANCE_GROUP: string  = "analysis_assistance_group";
    public static readonly PROPERTY_ANALYSIS_ASSISTANCE_HEADER: string = "analysis_assistance_header";
    public static readonly PROPERTY_REQUEST_BIO_ALIGNMENT_NOTE: string = "request_bio_alignment_note";
    public static readonly PROPERTY_REQUEST_BIO_ANALYSIS_NOTE: string  = "request_bio_analysis_note";
    public static readonly PROPERTY_EXPERIMENT_FILE_SAMPLE_LINKING_ENABLED:string = "experiment_file_sample_linking_enabled";

    public static readonly PROPERTY_QC_INSTRUCTIONS: string = "qc_instructions";
    public static readonly PROPERTY_BST_LINKAGE_SUPPORTED: string = "bst_linkage_supported";
    public static readonly PROPERTY_CAN_ACCESS_BSTX: string = "can_access_bstx";

    constructor(private dictionaryService: DictionaryService,
                private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {}

    /**
     * Returns the property entry that matches the provided search data as specifically as possible:
     *   1. name, core facility, request category
     *   2. name, core facility
     *   3. name
     * If a match is not found at a specific level or if the corresponding optional data was not provided,
     * the search will move to the next level. Returns undefined if no match is found at any level.
     * (compare with getExactProperty(), which requires an exact match)
     * @param {string} name
     * @param {string} idCoreFacility (optional)
     * @param {string} codeRequestCategory (optional)
     * @returns {any}
     */
    getProperty(name: string, idCoreFacility?: string, codeRequestCategory?: string): any {
        let properties = this.dictionaryService.getEntries(DictionaryService.PROPERTY_DICTIONARY);
        let property;
        if (idCoreFacility && codeRequestCategory) {
            property = properties.find((property) => (property.propertyName === name && property.idCoreFacility === idCoreFacility && property.codeRequestCategory === codeRequestCategory));
        }
        if (!property && idCoreFacility) {
            property = properties.find((property) => (property.propertyName === name && property.idCoreFacility === idCoreFacility && property.codeRequestCategory === ""));
        }
        if (!property) {
            property = properties.find((property) => (property.propertyName === name && property.idCoreFacility === "" && property.codeRequestCategory === ""));
        }
        return property;
    }

    /**
     * Returns the property entry that exactly matches the provided search data:
     *   1. name, core facility, request category
     *   2. name, core facility
     *   3. name
     *
     * Search terms that are not provided will only match null values in the database.
     * Returns undefined if no match is found.
     * (compare with getProperty(), which can return partial matches)
     * @param {string} name
     * @param {string} idCoreFacility (optional)
     * @param {string} codeRequestCategory (optional)
     * @returns {any}
     */
    getExactProperty(name: string, idCoreFacility?: string, codeRequestCategory?: string): any {
        let properties = this.dictionaryService.getEntries(DictionaryService.PROPERTY_DICTIONARY);
        if (!idCoreFacility) {
            idCoreFacility = "";
        }
        if (!codeRequestCategory) {
            codeRequestCategory = "";
        }
        return properties.find((property) => (property.propertyName === name && property.idCoreFacility === idCoreFacility && property.codeRequestCategory === codeRequestCategory));
    }

    getPropertyForServer(): any {

    }

    public getPropertyListCall(propertyOnly: boolean): Observable<any> {
        if (propertyOnly) {
            let params: HttpParams = new HttpParams()
                .set("propertyOnly", "Y");
            return this.httpClient.get("/gnomex/GetPropertyList.gx", {params: params});
        } else {
            return this.httpClient.get("/gnomex/GetPropertyList.gx");
        }
    }

    public getPropertyList(propertyOnly: boolean): Observable<any[]> {
        return this.getPropertyListCall(propertyOnly).pipe(map((response: any) => {
            return response ? Array.isArray(response) ? response : [response] : [];
        }));
    }

    public getPropertyAnnotation(idProperty: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idProperty", idProperty);
        return this.httpClient.get("/gnomex/GetProperty.gx", {params: params});
    }

    public savePropertyAnnotation(params: HttpParams):  Observable<any> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveProperty.gx", params.toString(), {headers: headers});
    }

    public deletePropertyAnnotation(params: HttpParams):  Observable<any> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/DeleteProperty.gx", params.toString(), {headers: headers});
    }

    public isPublicVisbility(): boolean{
        let visProp = this.getProperty(PropertyService.PROPERTY_NO_PUBLIC_VISIBILITY);
         if(visProp){
            return !(visProp.propertyValue === 'Y');
         }else{
             return true;
         }
    }
    public get isPrivacyExpirationSupported(): boolean{
        let privacyExpProp = this.getProperty(PropertyService.PROPERTY_DATASET_PRIVACY_EXPIRATION);
        if(privacyExpProp){
            let pv:number = +privacyExpProp.propertyValue;
            return ( pv > 0 );
        }else{
            return false;
        }
    }

    public getPropertyAsBoolean(name: string, idCoreFacility?: string, codeRequestCategory?: string): boolean {
        return this.getPropertyValue(name, idCoreFacility, codeRequestCategory) === "Y";
    }

    public getPropertyValue(name: string, idCoreFacility?: string, codeRequestCategory?: string): string {
        let prop: any = this.getProperty(name, idCoreFacility, codeRequestCategory);
        return prop && prop.propertyValue ? prop.propertyValue : "";
    }

}
