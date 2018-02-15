import {Injectable} from "@angular/core";
import {Http, Headers, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class ReportIssueService {
    constructor(private http: Http,
                private cookieUtilService: CookieUtilService) {
    }

    public sendReportIssueEmail(url: any, formData: FormData):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();

        return this.http.post(url, formData);
    }

    reportIssueServletGetURL(): Observable<any> {
        return this.http.get("/gnomex/ReportIssueServletGetURL.gx").map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

}