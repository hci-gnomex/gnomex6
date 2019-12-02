import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";
import {map} from "rxjs/operators";

@Injectable()
export class AppUserPublicService {

    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    public getAppUserPublicCall(idAppUser: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idAppUser", idAppUser);
        return this.httpClient.get("/gnomex/GetAppUserPublic.gx", {params: params});
    }

    public getAppUserPublic(idAppUser: string): Observable<any> {
        // TODO: Need to check the back-end for why not throwing errors
        // return this.getAppUserPublicCall(idAppUser);
        return this.getAppUserPublicCall(idAppUser).pipe(map((response: any) => {
            return response;
        }));
    }

    public saveAppUserPublic(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveAppUserPublic.gx", params.toString(), {headers: headers});
    }

}
