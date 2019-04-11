import {Inject, Injectable, InjectionToken, Injector} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Subject, throwError} from "rxjs";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";
import {first,catchError, map} from "rxjs/operators";
import {Experiment} from "../util/models/experiment.model";
import {CookieUtilService} from "../services/cookie-util.service";
import {element} from "@angular/core/src/render3";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";


export let BROWSE_EXPERIMENTS_ENDPOINT = new InjectionToken("browse_experiments_url");
export let VIEW_EXPERIMENT_ENDPOINT = new InjectionToken("view_experiment_url");

@Injectable()
export class ExperimentsService {

    private experimentOrders: any[];
    public projectRequestList: any[];
    public selectedTreeNode:any;
    public startSearchSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


    private experimentOrdersSubject: Subject<any[]> = new Subject();
    private experimentOrdersMessageSubject: Subject<string> = new Subject();
    private experimentSubject: Subject<any> = new Subject();
    private projectRequestListSubject: Subject<any[]> = new Subject();
    private projectSubject:Subject<any> = new Subject();

    private haveLoadedExperimentOrders: boolean = false;
    private previousURLParams: HttpParams = null;
    private changeStatusSubject: Subject<any> = new Subject();
    private requestProgressList: Subject<any>= new Subject();
    private requestProgressDNASeqList: Subject<any> = new Subject();
    private requestProgressSolexaList:Subject<any> = new Subject();

    private experimentOverviewListSubject:BehaviorSubject<any> = new BehaviorSubject([]);
    private filteredExperimentOverviewListSubject:Subject<any> = new Subject();
    private saveManagerSubject:Subject<any> = new Subject();
    private navInitBrowsExperimentSubject:BehaviorSubject<boolean>= new BehaviorSubject(false);

    // conditional params
    browsePanelParams:HttpParams;
    experimentList:Array<any> =[];

    public invalid:boolean = false;
    public dirty:boolean = false;
    public modeChangedExperiment: any;
    public filteredLabs: any;
    public labList: any[] = [];
    private editMode: boolean = false;


    constructor(private cookieUtilService: CookieUtilService,
                private _http: Http,
                private httpClient: HttpClient,
                private dialogService: DialogsService,
                @Inject(BROWSE_EXPERIMENTS_ENDPOINT) private _browseExperimentsUrl: string) {}

    getExperimentsObservable(): Observable<any> {
        return this.experimentOrdersSubject.asObservable();
    }

    getExperimentsOrdersMessageObservable(): Observable<any> {
        return this.experimentOrdersMessageSubject.asObservable();
    }

    refreshProjectRequestList_fromBackend(): void {
        this.startSearchSubject.next(true);
        this.httpClient.get("/gnomex/GetProjectRequestList.gx", {params: this.previousURLParams})
            .pipe(map((resp:any) => { return resp.Lab}))
            .subscribe((response: any) => {
                this.projectRequestList = response;
                this.emitProjectRequestList();
            }, (err:IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
                this.dialogService.alert(err.gError.message);
            });
    }


    getExperiments_fromBackend(parameters: HttpParams): void {
        this.haveLoadedExperimentOrders = true;
        this.previousURLParams = parameters;

        this.httpClient.get("/gnomex/GetRequestList.gx", {params:parameters})
            .pipe(map((resp:any) => { return resp.Request}))
            .subscribe((response: any) => {
                this.experimentOrders = response;
                this.emitExperimentOrders();
                this.experimentOrdersMessageSubject.next(response.message);

            },(err:IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
                this.dialogService.alert(err.gError.message);
            });
    }

    repeatGetExperiments_fromBackend(): void {
        this.haveLoadedExperimentOrders = false;
        this.getExperiments_fromBackend(this.previousURLParams);
    }

    getPreviousURLParamsCoreFacilityFilter(): string {
        return this.previousURLParams.get('idCoreFacility');
    }

    getChangeExperimentStatusObservable(): Observable<any> {
        return this.changeStatusSubject.asObservable();
    }

    changeExperimentStatus(idRequest: string, codeRequestStatus: string): void {

        let parameters: URLSearchParams = new URLSearchParams;
        parameters.set("idRequest", idRequest);
        parameters.set("codeRequestStatus", codeRequestStatus);

        // console.log("Changing Experiment numbers: " + parameters.get("idRequest") + " status to " + parameters.get("codeRequestStatus"));

        this._http.get("/gnomex/ChangeRequestStatus.gx", {withCredentials: true, search: parameters}).subscribe((response: Response) => {
            if (response.status === 200) {
                this.changeStatusSubject.next(response.json());
                //return response.json().Request;
            } else {
                throw new Error("Error");
            }
        });
    }


    emitExperimentOrders(): void {
        this.experimentOrdersSubject.next(this.experimentOrders);
    }

    getProjectRequestListObservable(): Observable<any> {
        return this.projectRequestListSubject.asObservable();
    }


    emitProjectRequestList(projectRequestList?:any): void {
        if(projectRequestList){
            this.projectRequestListSubject.next(projectRequestList);
        }else{
            this.projectRequestListSubject.next(this.projectRequestList);
        }

    }

    getProjectRequestList_fromBackend(params: HttpParams,allowRefresh?:boolean): void {
        this.startSearchSubject.next(true);

        this.haveLoadedExperimentOrders = true;
        this.previousURLParams = params;

        this.httpClient.get("/gnomex/GetProjectRequestList.gx", {params: params})
            .pipe(map((resp:any) =>{
                if(resp.Lab){
                    return resp.Lab
                }
                return resp;
            }))
            .subscribe((response: any) => {
                this.projectRequestList = response;
                this.emitProjectRequestList();
            }, (err:IGnomexErrorResponse) =>{
                this.dialogService.stopAllSpinnerDialogs();
                this.dialogService.alert(err.gError.message);
            });
    }

    emitExperiment(exp:any):void{
        this.experimentSubject.next(exp);
    }

    getExperimentObservable():Observable<any>{
        return this.experimentSubject.asObservable();
    }

    getExperiment(id: string): Observable<any> {
        let params:HttpParams = new HttpParams().set('idRequest',id);
        return this.httpClient.get("/gnomex/GetRequest.gx", {params: params})
            .pipe(catchError((err:IGnomexErrorResponse) =>{
                this.dialogService.alert(err.gError.message);
                return throwError(err);
            }));
    }

    public getNewRequest(): Observable<any> {
        let params: HttpParams = new HttpParams().set("idRequest", '0');
        return this.httpClient.get("/gnomex/GetRequest.gx", {params: params});
    }

    public getMultiplexLaneList(experiment: Experiment): Observable<any> {

        let params: HttpParams = new HttpParams()
            .set('requestJSONString', JSON.stringify(experiment.getJSONObjectRepresentation()));

        this.cookieUtilService.formatXSRFCookie();

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        return this.httpClient.post("/gnomex/GetMultiplexLaneList.gx", params.toString(), { headers: headers });
    }

    getLab(params: URLSearchParams): Observable<any> {
        return this._http.get("/gnomex/GetLab.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json().Lab;
            } else {
                throw new Error("Error");
            }
        }));

    }

    saveRequestProject(params: HttpParams):  Observable<any> {
        return this.httpClient.get("/gnomex/SaveRequestProject.gx", {params: params});
    }

    saveRequest(experiment: any):  Observable<any> {

        if (!experiment) {
            return;
        }

        let params: HttpParams = new HttpParams()
            .set('requestJSONString', JSON.stringify(experiment.getJSONObjectRepresentation()))
            .set('description', experiment.description)
            .set('idProject', experiment.idProject)
            .set('propertiesXML', '');
        // .set('invoicePrice', '');

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        return this.httpClient.post("/gnomex/SaveRequest.gx", params.toString(), { headers: headers });
    }

    saveVisibility(body: any, idProject?: string): Observable<any> {

        let parameters: HttpParams = new HttpParams();
        let strBody:string = JSON.stringify(body);

        if(idProject){
            parameters = parameters.set("idProject",idProject);
        }
        parameters = parameters.set("visibilityXMLString", strBody);
        return this.httpClient.get("/gnomex/SaveVisibility.gx", {params: parameters});
    }



    getProjectObsevable():Observable<any>{
        return this.projectSubject.asObservable();
    }
    emitProject(project:any):void{
        this.projectSubject.next(project);
    }
    getProject_fromBackend(params: URLSearchParams): void {
        this._http.get("/gnomex/GetProject.gx",{search: params})
            .subscribe((response: Response) => {
                console.log("getProject called");
                if (response.status === 200) {
                    let project = response.json();
                    this.emitProject(project);
                    //return response.json().Request;
                } else {
                    throw new Error("Error getting Project");
                }
            });
    }



    getProject(params: HttpParams):  Observable<any> {
        return this.httpClient.get("/gnomex/GetProject.gx", {params: params})
            .pipe(catchError((err:IGnomexErrorResponse) =>{
                this.dialogService.alert(err.gError.message);
                return throwError(err);
            }));
    }

    saveProject(params: HttpParams):  Observable<any> {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveProject.gx", params.toString(), {headers: headers});

    }

    deleteExperiment(params: HttpParams):  Observable<any> {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/DeleteRequest.gx", params.toString(), {headers: headers});
    }

    getProjectRequestList(params: HttpParams) {
        return this._http.get("/gnomex/GetProjectRequestList.gx", {params:params})
            .pipe(catchError((err:IGnomexErrorResponse) =>{
                this.dialogService.alert(err.gError.message);
                return throwError(err);
            }));
    }

    getRequestProgressListObservable():Observable<any>{
        return this.requestProgressList;
    }
    getRequestProgressList_FromBackend(params:HttpParams):void{
        this.httpClient.get("/gnomex/GetRequestProgressList.gx",{params:params})
            .subscribe((response: any)=> {this.requestProgressList.next(response);}
                ,(err:IGnomexErrorResponse) => {
                    this.dialogService.alert(err.gError.message);
                });
    }

    getRequestProgressSolexaListObservable():Observable<any>{
        return this.requestProgressSolexaList.asObservable();
    }
    getRequestProgressSolexaList_FromBackend(params: HttpParams):void{
        this.httpClient.get("/gnomex/GetRequestProgressSolexaList.gx",{params:params})
            .subscribe((response: any)=> {
                this.requestProgressSolexaList.next(response);
            }, (err:IGnomexErrorResponse) => {
                this.dialogService.alert(err.gError.message);
            });

    }

    getRequestProgressDNASeqListObservable(){
        return this.requestProgressDNASeqList.asObservable();
    }
    getRequestProgressDNASeqList_FromBackend(params: HttpParams):void{
        this.httpClient.get("/gnomex/GetRequestProgressDNASeqList.gx",{params:params})
            .subscribe((response: any)=> {this.requestProgressDNASeqList.next(response);}
                ,(err: IGnomexErrorResponse) => {
                    this.dialogService.alert(err.gError.message);
                });
    }
    emitExperimentOverviewList(data:any):void{
        this.experimentOverviewListSubject.next(data);
    }
    resetExperimentOverviewListSubject(){
        this.experimentOverviewListSubject = new BehaviorSubject([]);
    }
    getExperimentOverviewListSubject():BehaviorSubject<any>{
        return this.experimentOverviewListSubject;
    }
    emitFilteredOverviewList(data:any):void{
        this.filteredExperimentOverviewListSubject.next(data);
    }
    getFilteredOverviewListObservable():Observable<any>{
        return this.filteredExperimentOverviewListSubject.asObservable();
    }
    emitSaveManger(type:string):void{
        this.saveManagerSubject.next(type);
    }
    getSaveMangerObservable():Observable<any>{
        return this.saveManagerSubject.asObservable();
    }

    public getRequestDownloadList(idRequest: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idRequest", idRequest);
        return this.httpClient.get("/gnomex/GetRequestDownloadList.gx", {params: params});
    }


    getExperimentWithParams(params: HttpParams) {
        return this.httpClient.get("/gnomex/GetRequest.gx",{params:params})
    }

    getRequestDownloadListWithParams(params: HttpParams) {
        return this.httpClient.get("/gnomex/GetRequestDownloadList.gx", {params: params});
    }

    getLinkedSampleFiles(params: HttpParams):Observable<any>{
        return this.httpClient.get("/gnomex/GetLinkedSampleFiles.gx", {params:params});
    }

    public setEditMode(editMode: boolean): void {
        this.editMode = editMode;
    }

    public getEditMode(): boolean {
        return this.editMode;
    }

    emailServlet(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/EmailServlet.gx", null, {params: params});
    }
}
