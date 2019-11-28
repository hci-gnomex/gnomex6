import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class ReportIssueService {
    constructor(private http: Http, private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    public sendReportIssueEmail(url: any, formData: FormData):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();
        //TODO: Convert multipart http calls to httpClient
        return this.http.post(url, formData);
    }

    reportIssueServletGetURL(): Observable<any> {
        return this.httpClient.get("/gnomex/ReportIssueServletGetURL.gx");
    }

}
