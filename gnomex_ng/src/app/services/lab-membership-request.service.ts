import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams, Headers} from "@angular/http";
import {Observable} from "rxjs";

import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class LabMembershipRequestService {

    constructor(private http: Http,
                private cookieUtilService: CookieUtilService) {
    }

    public requestLabMembership(idLabs: string):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        let params: URLSearchParams = new URLSearchParams();
        params.set("idLabs", idLabs);
        return this.http.post("/gnomex/RequestLabMembership.gx", params.toString(), {headers: headers});
    }

}