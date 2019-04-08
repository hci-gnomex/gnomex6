import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {map} from "rxjs/operators";
import {AbstractControl, FormGroup} from "@angular/forms";

@Injectable()
export class AnalysisService {
    public isDeleteFromGrid: boolean = false;
    public analysisGroupList: any[];
    // for the save button on right pane
    public invalid: boolean = false;
    public dirty: boolean = false;

    public startSearchSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private analysisGroupListSubject: Subject<any[]> = new Subject();
    private _haveLoadedAnalysisGroupList: boolean = false;
    private _previousURLParams: URLSearchParams = null;
    private _analysisPanelParams: URLSearchParams;
    private _analysisList: Array<any> = [];
    private analysisOverviewListSubject: BehaviorSubject<any> = new BehaviorSubject([]);
    private filteredAnalysisListSubject: Subject<any> = new Subject();
    private createAnalysisDataSubject: Subject<any> = new Subject();
    private saveManagerSubject: Subject<any> = new Subject();

    private _analysisOverviewForm: FormGroup;
    private _createdAnalysis: any;


    constructor(private http: Http, private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
        this._analysisOverviewForm = new FormGroup({});
    }


    get createdAnalysis(): any {
        return this._createdAnalysis;
    }
    set createdAnalysis(data: any) {
        this._createdAnalysis = data;
    }

    get analysisList(): Array<any> {
        return this._analysisList;
    }
    set analysisList(data: Array<any>) {
        this._analysisList = data;
    }

    get analysisPanelParams(): URLSearchParams {
        return this._analysisPanelParams;
    }
    set analysisPanelParams(data: URLSearchParams) {
        this._analysisPanelParams = data;
    }

    getAnalysis(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetAnalysis.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    saveAnalysis(params: HttpParams): Observable<any> {
        let headers : HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveAnalysis.gx", params.toString(), {headers: headers});
    }

    getAnalysisGroup1(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetAnalysisGroup.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    getAnalysisGroup(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetAnalysisGroup.gx", {params: params}).pipe(map((response) => {
            if (response["AnalysisGroup"]) {
                return response;
            } else {
                throw new Error("Error in getting AnalysisGroup: " + response["message"]);
            }
        }));
    }

    getAnalysisGroupList(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetAnalysisGroupList.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                this.analysisGroupList = response.json().Lab;
                return this.analysisGroupList;
            } else {
                throw new Error("Error");
            }
        }));
    }

    getAnalysisLabList(): Observable<any> {
        return this.http.get("/gnomex/GetAnalysisGroupList.gx").pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    emitAnalysisGroupList(agList?: any): void {
        if(agList) {
            this.analysisGroupListSubject.next(agList);
        } else {
            this.analysisGroupListSubject.next(this.analysisGroupList);
        }

    }

    getAnalysisGroupListObservable(): Observable<any> {
        return this.analysisGroupListSubject.asObservable();
    }
    getAnalysisGroupList_fromBackend(params: URLSearchParams, allowRefresh?: boolean): void {
        this.startSearchSubject.next(true);

        if (this._haveLoadedAnalysisGroupList && this._previousURLParams === params && !allowRefresh) {
            // do nothing
            console.log("Analysis already loaded");
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
                } else {
                    throw new Error("Error");
                }
            });
        }
    }

    refreshAnalysisGroupList_fromBackend(): void {
        this.startSearchSubject.next(true);

        this.http.get("/gnomex/GetAnalysisGroupList.gx", {
            withCredentials: true,
            search: this._previousURLParams
        }).subscribe((response: Response) => {
            console.log("GetAnalysisGroupList called");

            if (response.status === 200) {
                this.analysisGroupList = response.json().Lab;
                this.emitAnalysisGroupList();
                //return response.json().Request;
            } else {
                throw new Error("Error");
            }
        });
    }

    saveAnalysisGroup(params: HttpParams):  Observable<any> {
        let headers : HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveAnalysisGroup.gx", params.toString(), {headers: headers})
            .pipe(map((response) => {
                if(response["idAnalysisGroup"]) {
                    return response;
                } else {
                    throw new Error("Error in saving AnalysisGroup: " + response["message"]);
                }
            }));
    }

    deleteAnalysis(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/DeleteAnalysis.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        }));

    }

    deleteAnalysisGroup(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/DeleteAnalysisGroup.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        }));

    }

    public moveAnalysis(idLab: string, idAnalysisGroup: string, analyses: any[], isCopyMode: boolean): Observable<any> {
        let idAnalysisString: string = "";
        for (let analysis of analyses) {
            idAnalysisString += analysis.idAnalysis + ",";
        }
        let params: HttpParams = new HttpParams()
            .set("idLab", idLab)
            .set("idAnalysisGroup", idAnalysisGroup)
            .set("idAnalysisString", idAnalysisString)
            .set("isCopyMode", isCopyMode ? "Y" : "N")
            .set("noJSONToXMLConversionNeeded", "Y");
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/MoveAnalysis.gx", params.toString(), {headers: headers});
    }

    resetAnalysisOverviewListSubject() {
        this.analysisOverviewListSubject = new BehaviorSubject([]);
    }

    emitAnalysisOverviewList(data: any): void {
        this.analysisOverviewListSubject.next(data);
    }
    getAnalysisOverviewListSubject(): BehaviorSubject<any> {
        return this.analysisOverviewListSubject;
    }

    emitFilteredOverviewList(data: any): void {
        this.filteredAnalysisListSubject.next(data);
    }
    getFilteredOverviewListObservable(): Observable<any> {
        return this.filteredAnalysisListSubject.asObservable();
    }

    emitCreateAnalysisDataSubject(data: any): void {
        this.createAnalysisDataSubject.next(data);
    }
    getCreateAnaylsisDataSubject(): Subject<any> {
        return this.createAnalysisDataSubject;
    }
    emitSaveManger(type: string): void {
        this.saveManagerSubject.next(type);
    }
    getSaveMangerObservable(): Observable<any> {
        return this.saveManagerSubject.asObservable();
    }

    saveVisibility(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/SaveVisibilityAnalysis.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error: In SaveVisibility");
            }
        }));
    }

    getExperimentPickList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetExperimentPickList.gx", {params: params});
    }
    //for link to experiment
    getRequestList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetRequestList.gx", {params: params});
    }
    linkExpToAnalysis(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/LinkExpToAnalysis.gx", null, {params: params});
    }

    public getAnalysisDownloadList(idAnalysis: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idAnalysis", idAnalysis)
            .set("autoCreate", "Y")
            .set("includeUploadStagingDir", "N");
        return this.httpClient.get("/gnomex/GetAnalysisDownloadList.gx", {params: params});
    }
    public getAnalysisDownloadListWithParams(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetAnalysisDownloadList.gx", {params: params});
    }

    public managePedFile(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/ManagePedFile.gx", params.toString(), {headers: headers});
    }
    get analysisOverviewForm(): FormGroup {
        return this._analysisOverviewForm;
    }

    public addAnalysisOverviewFormMember(control: AbstractControl, name: string, afterControlAddedfn?: any): void {
        setTimeout(() => {
            this._analysisOverviewForm.addControl(name, control);
            if(afterControlAddedfn) {
                afterControlAddedfn();
            }
        });
    }
    public clearAnalysisOverviewForm(): void {
        this._analysisOverviewForm = new FormGroup({});
    }




}
