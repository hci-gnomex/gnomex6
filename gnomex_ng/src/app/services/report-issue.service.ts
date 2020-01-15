import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class ReportIssueService {
    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    public sendReportIssueEmail(url: any, formData: FormData):  Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post(url, formData, {responseType: "text"});
    }

    reportIssueServletGetURL(): Observable<any> {
        return this.httpClient.get("/gnomex/ReportIssueServletGetURL.gx");
    }

}
