import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {HttpClient, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class BillingService {

    constructor(private http: Http,
                private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    getBillingRequestListDep(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetBillingRequestList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getBillingItemListDep(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetBillingItemList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getBillingInvoiceListDep(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetBillingInvoiceList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getBillingAccountListForPeriodAndCore(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetBillingAccountListForPeriodAndCore.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    public getLibPrepApplicationPriceList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetLibPrepApplicationPriceList.gx", {params: params});
    }

    public getAuthorizedBillingAccounts(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetAuthorizedBillingAccounts.gx", {params: params});
    }

    public getBillingRequestList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetBillingRequestList.gx", {params: params});
    }

    public getBillingItemList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetBillingItemList.gx", {params: params});
    }

    public getBillingInvoiceList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetBillingInvoiceList.gx", {params: params});
    }

    public saveBillingItemList(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveBillingItemList.gx", null, {params: params});
    }

}