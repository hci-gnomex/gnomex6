import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {Subject} from "rxjs/Subject";

@Injectable()
export class AnalysisService {
    public analysisGroupList: any[];

    private analysisGroupListSubject: Subject<any[]> = new Subject();
    private _haveLoadedAnalysisGroupList: boolean = false;
    private _previousURLParams: URLSearchParams = null;

    constructor(private http: Http) {
    }

    getAnalysis(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetAnalysis.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    saveAnalysis(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/SaveAnalysis.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getAnalysisGroup(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetAnalysisGroup.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getAnalysisGroupList(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetAnalysisGroupList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                this.analysisGroupList = response.json().Lab;
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getAnalysisLabList(): Observable<any> {
        return this.http.get("/gnomex/GetAnalysisGroupList.gx").map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    emitAnalysisGroupList(): void {
        this.analysisGroupListSubject.next(this.analysisGroupList);
    }

    getAnalysisGroupListObservable(): Observable<any> {
        return this.analysisGroupListSubject.asObservable();
    }
    getAnalysisGroupList_fromBackend(params: URLSearchParams): void {
        if (this._haveLoadedAnalysisGroupList && this._previousURLParams === params) {
            // do nothing
            console.log("Analysis already loaded");
            // return Observable.of(this.experimentOrders);
        } else {
            this._haveLoadedAnalysisGroupList = true;
            this._previousURLParams = params;

            this.http.get("/gnomex/GetAnalysisGroupList.gx", {
                withCredentials: true,
                search: params
            }).subscribe((response: Response) => {
                console.log("GetRequestList called");

                if (response.status === 200) {
                    this.analysisGroupList = response.json().Lab;
                    this.emitAnalysisGroupList();
                    //return response.json().Request;
                } else {
                    throw new Error("Error");
                }
            });
        }
    }

    refreshAnalysisGroupList_fromBackend(): void {
        this.http.get("/gnomex/GetAnalysisGroupList.gx", {
            withCredentials: true,
            search: this._previousURLParams
        }).subscribe((response: Response) => {
            console.log("GetAnalysiisGroupList called");

            if (response.status === 200) {
                this.analysisGroupList = response.json().Lab;
                this.emitAnalysisGroupList();
                //return response.json().Request;
            } else {
                throw new Error("Error");
            }
        });
    }

    saveAnalysisGroup(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/SaveAnalysisGroup.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });

    }

    deleteAnalysis(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/DeleteAnalysis.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });

    }

    deleteAnalysisGroup(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/DeleteAnalysisGroup.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });

    }

    moveAnalysis(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/MoveAnalysis.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });

    }


}
