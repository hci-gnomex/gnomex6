
import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {HttpParams} from "@angular/common/http";

@Injectable()
export class WorkflowService {
    public readonly ILLUMINA_SEQQC = "ILLSEQQC";
    public readonly QC = "QC";
    public readonly MICROARRAY = "MICROARRAY";
    public readonly NANOSTRING = "NANO";
    public readonly ALL = "ALL";

    public readonly workflowCompletionStatus = [
        {display: '', value: ''},
        {display: 'In Progress', value: 'In Progress'},
        {display: 'Complete', value: 'Completed'},
        {display: 'On Hold', value: 'On Hold'},
        {display: 'Terminate', value: 'Terminated'},
        {display: 'Bypass', value: 'Bypassed'}
    ];

    constructor(private http: Http) {

    }

    getWorkItemList(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/GetWorkItemList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });

    }

    saveCombinedWorkItemQualityControl(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/SaveCombinedWorkItemQualityControl.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });

    }

    saveWorkItemSolexaPrep(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/SaveWorkItemSolexaPrep.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });

    }

    getCoreAdmins(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/GetCoreAdmins.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });

    }

    // getCoreAdmins(p: HttpParams) : Observable<any> {
    //     return this.http.get("/gnomex/GetCoreAdmins.gx",{params: p});
    // }

}