import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams, Headers} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class AppUserPublicService {

    constructor(private http: Http,
                private cookieUtilService: CookieUtilService) {
    }

    public getAppUserPublicCall(idAppUser: string): Observable<Response> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("idAppUser", idAppUser);
        return this.http.get("/gnomex/GetAppUserPublic.gx", {search: params});
    }

    public getAppUserPublic(idAppUser: string): Observable<any> {
        return this.getAppUserPublicCall(idAppUser).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return null;
            }
        });
    }

    public saveAppUserPublic(params: URLSearchParams):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return this.http.post("/gnomex/SaveAppUserPublic.gx", params.toString(), {headers: headers});
    }

}