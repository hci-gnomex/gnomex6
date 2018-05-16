import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams, Headers} from "@angular/http";
import {DictionaryService} from "./dictionary.service";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class PropertyService {

    readonly SHOW_FUNDING_AGENCY: string = 'show_funding_agency';
    public static readonly PROPERTY_CONTACT_EMAIL_SOFTWARE_BUGS: string = 'contact_email_software_bugs';
    public static readonly PROPERTY_CONTACT_EMAIL_BIOINFORMATICS: string = 'contact_email_bioinformatics';
    public static readonly PROPERTY_NO_PUBLIC_VISIBILITY:string = "no_public_visibility";
    public static readonly PROPERTY_PRODUCT_SHEET_NAME: string = 'product_sheet_name';

    constructor(private dictionaryService: DictionaryService,
                private http: Http,
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

    public getPropertyListCall(propertyOnly: boolean): Observable<Response> {
        if (propertyOnly) {
            let params: URLSearchParams = new URLSearchParams();
            params.set("propertyOnly", "Y");
            return this.http.get("/gnomex/GetPropertyList.gx", {search: params});
        } else {
            return this.http.get("/gnomex/GetPropertyList.gx");
        }
    }

    public getPropertyList(propertyOnly: boolean): Observable<any[]> {
        return this.getPropertyListCall(propertyOnly).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return [];
            }
        });
    }

    public getPropertyAnnotationCall(idProperty: string): Observable<Response> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("idProperty", idProperty);
        return this.http.get("/gnomex/GetProperty.gx", {search: params});
    }

    public getPropertyAnnotation(idProperty: string): Observable<any> {
        return this.getPropertyAnnotationCall(idProperty).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return null;
            }
        });
    }

    public savePropertyAnnotation(params: URLSearchParams):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return this.http.post("/gnomex/SaveProperty.gx", params.toString(), {headers: headers});
    }

    public deletePropertyAnnotation(params: URLSearchParams):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return this.http.post("/gnomex/DeleteProperty.gx", params.toString(), {headers: headers});
    }

    public isPublicVisbility():boolean{
        let visProp = this.getProperty(PropertyService.PROPERTY_NO_PUBLIC_VISIBILITY);
         if(visProp){
            return !(visProp.propertyValue === 'Y');
         }else{
             return true;
         }
    }

}
