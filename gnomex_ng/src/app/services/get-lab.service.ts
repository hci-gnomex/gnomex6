import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';

@Injectable()
export class GetLabService {

    constructor(private http: Http) {
    }

    public getLabCall(params: URLSearchParams): Observable<Response> {
        return this.http.get("/gnomex/GetLab.gx", {search: params});
    }

    getLab(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetLab.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    deleteLab(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteLab.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getLabById(idLab: string): Observable<any> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("idLab", idLab);
        return this.getLab(params);
    }

    public getLabByIdOnlyForHistoricalOwnersAndSubmitters(idLab: string): Observable<any> {
        let params: URLSearchParams = this.makeParams(idLab, false, false, false, false, true, false, false, false);
        return this.getLab(params);
    }

    public getLabBillingAccounts(idLab: string): Observable<any> {
        let params: URLSearchParams = this.makeParams(idLab, true, false, false, false, false, false, false, false);
        return this.getLab(params);
    }

    public getLabBasic(idLab: string): Observable<Response> {
        let params: URLSearchParams = this.makeParams(idLab, false, false, false, false, false, false, false, false);
        return this.getLabCall(params);
    }

    public getLabMembers(idLab: string): Observable<any[]> {
        return this.getLabBasic(idLab).map((response: Response) => {
            if (response.status === 200) {
                let lab = response.json();
                return lab.Lab.members;
            } else {
                return [];
            }
        });
    }

    private makeParams(idLab: string, includeBillingAccounts: boolean, includeProductCounts: boolean,
                       includeProjects: boolean, includeCoreFacilities: boolean, includeHistoricalOwnersAndSubmitters: boolean,
                       includeInstitutions: boolean, includeSubmitters: boolean, includeMoreCollaboratorInfo: boolean): URLSearchParams {

        let params: URLSearchParams = new URLSearchParams();
        params.set("idLab", idLab);
        params.set("includeBillingAccounts", includeBillingAccounts ? "Y" : "N");
        params.set("includeProductCounts", includeProductCounts ? "Y" : "N");
        params.set("includeProjects", includeProjects ? "Y" : "N");
        params.set("includeCoreFacilities", includeCoreFacilities ? "Y" : "N");
        params.set("includeHistoricalOwnersAndSubmitters", includeHistoricalOwnersAndSubmitters ? "Y" : "N");
        params.set("includeInstitutions", includeInstitutions ? "Y" : "N");
        params.set("includeSubmitters", includeSubmitters ? "Y" : "N");
        params.set("includeMoreCollaboratorInfo", includeMoreCollaboratorInfo ? "Y" : "N");
        return params;
    }

}