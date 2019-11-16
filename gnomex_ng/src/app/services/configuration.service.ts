import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Subject} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";


@Injectable()
export class ConfigurationService {
    private coreListSubject: Subject<any> = new Subject();

    constructor(private httpClient: HttpClient, private cookieUtilService: CookieUtilService) {
    }

    emitCoreList(data: any): void {
        this.coreListSubject.next(data);
    }

    getCoreListObservable(): Observable<any> {
        return this.coreListSubject.asObservable();
    }

    saveCoreFacility(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveCoreFacility.gx", params.toString(), {headers: headers});
    }

}
