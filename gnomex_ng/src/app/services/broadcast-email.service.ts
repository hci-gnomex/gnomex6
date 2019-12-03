import {Injectable} from "@angular/core";
import {Http, Headers, Response, URLSearchParams} from "@angular/http";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class BroadcastEmailService {

    constructor(private http: Http, private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    public getUploadURL(): Observable<any> {
        return this.httpClient.get("/gnomex/UploadAndBroadcastEmailURLServlet.gx");
    }
    // TODO: Convert multipart http calls to httpClient and make a way to test it without sending emails to the users
    public sendBroadcastEmail(params: URLSearchParams):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return this.http.post("/gnomex/UploadAndBroadcastEmailServlet.gx", params.toString(), {headers: headers});
    }

    // TODO: Convert multipart http calls to httpClient
    public sendBroadcastEmailWithFile(formData: FormData): Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();

        return this.http.post("/gnomex/UploadAndBroadcastEmailServlet.gx", formData);
    }

}
