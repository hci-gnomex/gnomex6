import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class GetLabService {

    constructor(private http: Http) {
    }

    public labMembersSubject: BehaviorSubject<any[]> = new BehaviorSubject([]);

    public getLabCall(params: URLSearchParams): Observable<Response> {
        return this.http.get("/gnomex/GetLab.gx", {search: params});
    }


    public  sortLabMembersFn = (obj1, obj2) =>{
        if (!obj1 && !obj2) {
            return 0;
        } else if (!obj1) {
            return 1;
        } else if (!obj2) {
            return -1;
        } else {
            var display1:String = obj1.displayName;
            var display2:String = obj2.displayName;

            if (display1.toLowerCase() < display2.toLowerCase()) {
                return -1;
            } else if (display1.toLowerCase() > display2.toLowerCase()) {
                return 1;
            } else {
                return 0;
            }
        }
    };


    getLabMembers_fromBackend(params: URLSearchParams): void {

        this.http.get("/gnomex/GetLab.gx", { search: params}).subscribe((response: Response) => {
            // console.log("GetRequestList called");

            if (response.status === 200) {
                let lab: any = response.json().Lab;
                if(lab){
                    let members:Array<any> = Array.isArray(lab.members) ? lab.members : [lab.members];
                    let activeMembers:Array<any> = members.filter(appUser => appUser.isActive === 'Y');
                    let sortedActiveMembers = activeMembers.sort(this.sortLabMembersFn);
                    this.labMembersSubject.next(sortedActiveMembers);
                }

                //return response.json().Request;
            } else {
                throw new Error("Error");
            }
        });
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