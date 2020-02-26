import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class BroadcastEmailService {

    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    public getUploadURL(): Observable<any> {
        return this.httpClient.get("/gnomex/UploadAndBroadcastEmailURLServlet.gx");
    }

    public sendBroadcastEmail(params: HttpParams):  Observable<any> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/UploadAndBroadcastEmailServlet.gx", params.toString(), {headers: headers});
    }

    public sendBroadcastEmailWithFile(formData: FormData): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();

        return this.httpClient.post("/gnomex/UploadAndBroadcastEmailServlet.gx", formData);
    }

}
