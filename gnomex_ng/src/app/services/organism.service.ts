import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {map} from "rxjs/operators";

@Injectable()
export class OrganismService {

    constructor(private httpClient: HttpClient,
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

    public getOrganismListCall(): Observable<any> {
        return this.httpClient.get("/gnomex/GetOrganismList.gx");
    }

    public getDas2OrganismList(): Observable<any[]> {
        return this.getOrganismListCall().pipe(map((response: any) => {
            let allOrganisms: any[] = response ? Array.isArray(response) ? response : [response] : [];
            return allOrganisms.filter((organism: any) => {
                return !(organism.das2Name === "") && !(organism.bionomialName === "") && organism.isActive === "Y";
            });
        }));
    }

}

