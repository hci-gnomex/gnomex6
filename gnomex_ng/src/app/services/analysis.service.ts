import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {BehaviorSubject, Observable, Subject,throwError} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {catchError, map} from "rxjs/operators";
import {AbstractControl, FormGroup} from "@angular/forms";
import {DialogsService} from "../util/popup/dialogs.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

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
    private _previousURLParams: HttpParams = null;
    private _analysisPanelParams:HttpParams;
    private _analysisList:Array<any> =[];
    private analysisOverviewListSubject:BehaviorSubject<any> = new BehaviorSubject([]);
    private filteredAnalysisListSubject:Subject<any> = new Subject();
    private createAnalysisDataSubject:Subject<any> = new Subject();
    private saveManagerSubject:Subject<any> = new Subject();

    private _analysisOverviewForm: FormGroup;
    private _createdAnalysis: any;


    constructor(private http: Http, private httpClient:HttpClient,
                private cookieUtilService:CookieUtilService,
                private dialogService:DialogsService) {
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

    get analysisPanelParams(): HttpParams{
        return this._analysisPanelParams;
    }
    set analysisPanelParams(data:HttpParams){
        this._analysisPanelParams = data;
    }

    getAnalysis(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetAnalysis.gx", {params: params})
            .pipe(catchError((err:IGnomexErrorResponse) =>{
                return throwError(err);
            }));
    }

    saveAnalysis(params: HttpParams): Observable<any> {
        let headers : HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveAnalysis.gx", params.toString(), {headers: headers});
    }

    getAnalysisGroup(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetAnalysisGroup.gx", {params: params})
            .pipe(catchError((err:IGnomexErrorResponse) =>{
                return throwError(err);
            }));
    }

    getAnalysisGroupList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetAnalysisGroupList.gx", {params: params})
            .pipe(map((resp:any) =>{ return  resp.Lab}),catchError((err:IGnomexErrorResponse) =>{
                return throwError(err);
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
    getAnalysisGroupList_fromBackend(params: HttpParams,allowRefresh?:boolean): void {
        this.startSearchSubject.next(true);

        if (this._haveLoadedAnalysisGroupList && this._previousURLParams === params && !allowRefresh) {
            // do nothing
            console.log("Analysis already loaded");
        } else {
            this._haveLoadedAnalysisGroupList = true;
            this._previousURLParams = params;

            this.httpClient.get("/gnomex/GetAnalysisGroupList.gx", {params: params })
                .pipe(map((resp:any) =>{return resp.Lab}))
                .subscribe((response:any) => {
                    this.analysisGroupList = response;
                    this.emitAnalysisGroupList();
                },(err:IGnomexErrorResponse) => {
                    this.dialogService.stopAllSpinnerDialogs();
                });
        }
    }

    refreshAnalysisGroupList_fromBackend(): void {
        this.startSearchSubject.next(true);

        this.httpClient.get("/gnomex/GetAnalysisGroupList.gx", {params: this._previousURLParams})
            .pipe(map((resp:any) => {return resp.Lab}))
            .subscribe((response:any) => {
            this.analysisGroupList = response;
            this.emitAnalysisGroupList();
        }, (err:IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });
    }

    saveAnalysisGroup(params: HttpParams):  Observable<any> {
        let headers : HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        return this.httpClient.post("/gnomex/SaveAnalysisGroup.gx", params.toString(),{headers: headers});


    }

    deleteAnalysis(params: HttpParams):  Observable<any> {
        let headers : HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        return this.httpClient.post("/gnomex/DeleteAnalysis.gx", params.toString(),{headers: headers});

    }

    deleteAnalysisGroup(params: HttpParams):  Observable<any> {
        let headers : HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        return this.httpClient.post("/gnomex/DeleteAnalysisGroup.gx", params.toString(),{headers: headers});

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

    saveVisibility(params:HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveVisibilityAnalysis.gx", params.toString(), {headers: headers});
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
