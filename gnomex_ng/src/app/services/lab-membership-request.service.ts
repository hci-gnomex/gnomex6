import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class LabMembershipRequestService {

    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    public requestLabMembership(idLabs: string):  Observable<any> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        let params: HttpParams = new HttpParams()
            .set("idLabs", idLabs);
        return this.httpClient.post("/gnomex/RequestLabMembership.gx", params.toString(), {headers: headers});
    }

}
