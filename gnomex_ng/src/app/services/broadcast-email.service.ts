import {Injectable} from "@angular/core";
import {Http, Headers, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class BroadcastEmailService {

    constructor(private http: Http,
                private cookieUtilService: CookieUtilService) {
    }

    public getUploadURLCall(): Observable<Response> {
        return this.http.get("/gnomex/UploadAndBroadcastEmailURLServlet.gx");
    }

    public getUploadURL(): Observable<any> {
        return this.getUploadURLCall().map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return null;
            }
        });
    }

    public sendBroadcastEmail(params: URLSearchParams):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return this.http.post("/gnomex/UploadAndBroadcastEmailServlet.gx", params.toString(), {headers: headers});
    }

    public sendBroadcastEmailWithFile(formData: FormData): Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();

        return this.http.post("/gnomex/UploadAndBroadcastEmailServlet.gx", formData);
    }

}