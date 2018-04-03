import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';

@Injectable()
export class BillingService {

    constructor(private http: Http) {
    }

    getBillingRequestList(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetBillingRequestList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getBillingItemList(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetBillingItemList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getBillingInvoiceList(params: URLSearchParams): Observable<any> {
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

}