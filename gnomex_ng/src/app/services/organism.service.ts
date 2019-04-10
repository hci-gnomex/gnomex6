import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable, throwError} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {catchError, map} from "rxjs/operators";

@Injectable()
export class OrganismService {

    constructor(private http: Http,
                private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    public getOrganismListNew(): Observable<any> {
        return this.httpClient.get("/gnomex/GetOrganismList.gx");
    }

    public deleteOrganism(idOrganism: string): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let params: HttpParams = new HttpParams().set("idOrganism", idOrganism);
        return this.httpClient.post("/gnomex/DeleteOrganism.gx", null, {params: params});
    }

    public saveOrganismNew(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveOrganism.gx", params.toString(), {headers: headers});
    }

    public getOrganismListCall(): Observable<Response> {
        return this.http.get("/gnomex/GetOrganismList.gx");
    }

    public getDas2OrganismList(): Observable<any[]> {
        return this.getOrganismListCall().pipe(map((response: Response) => {
            if (response.status === 200) {
                let allOrganisms: any[] = response.json();
                return allOrganisms.filter((organism: any) => {
                    return !(organism.das2Name === "") && !(organism.bionomialName === "") && organism.isActive === "Y";
                });
            } else {
                return [];
            }
        }),catchError(err => {return throwError(err)}));
    }

    public saveOrganism(params: URLSearchParams):  Observable<Response> {
        return this.http.get("/gnomex/SaveOrganism.gx", {search: params});
    }

}

