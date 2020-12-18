import {Inject, Injectable, InjectionToken} from "@angular/core";
import {BehaviorSubject, Observable, Subject, throwError} from "rxjs";
import {
    HttpClient,
    HttpEvent,
    HttpEventType,
    HttpHeaders,
    HttpParams,
    HttpRequest,
} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";
import {catchError, map} from "rxjs/operators";
import {Experiment} from "../util/models/experiment.model";
import {CookieUtilService} from "../services/cookie-util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {AbstractControl, FormGroup} from "@angular/forms";
import {saveAs} from "file-saver";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";


export let BROWSE_EXPERIMENTS_ENDPOINT = new InjectionToken("browse_experiments_url");
export let VIEW_EXPERIMENT_ENDPOINT = new InjectionToken("view_experiment_url");

@Injectable()
export class ExperimentsService {

    public readonly TYPE_MICROARRAY: string = "MICROARRAY";
    public readonly TYPE_QC: string = "QC";
    public readonly TYPE_CAP_SEQ: string = "CAPSEQ";
    public readonly TYPE_FRAG_ANAL: string = "FRAGANAL";
    public readonly TYPE_MIT_SEQ: string = "MITSEQ";
    public readonly TYPE_CHERRY_PICK: string = "CHERRYPICK";
    public readonly TYPE_ISCAN: string = "ISCAN";
    public readonly TYPE_ISOLATION: string = "ISOLATION";
    public readonly TYPE_CLINICAL_SEQUENOM: string = "CLINSEQ";
    public readonly TYPE_SEQUENOM: string = "SEQUENOM";
    public readonly TYPE_NANOSTRING: string = "NANOSTRING";
    public readonly TYPE_GENERIC: string = "GENERIC";

    private experimentOrders: any[];
    public projectRequestList: any;
    public selectedTreeNode: any;
    public startSearchSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


    private experimentOrdersSubject: Subject<any[]> = new Subject();
    private experimentOrdersMessageSubject: Subject<string> = new Subject();
    private experimentSubject: Subject<any> = new Subject();
    private projectRequestListSubject: Subject<any> = new Subject<any>();
    private projectSubject: Subject<any> = new Subject();
    public canDeleteProjectSubject: Subject<boolean> = new Subject<boolean>();

    private haveLoadedExperimentOrders: boolean = false;
    private previousURLParams: HttpParams = null;
    private changeStatusSubject: Subject<any> = new Subject();
    private requestProgressList: Subject<any> = new Subject();
    private requestProgressDNASeqList: Subject<any> = new Subject();
    private requestProgressSolexaList: Subject<any> = new Subject();

    private experimentOverviewListSubject: BehaviorSubject<any> = new BehaviorSubject([]);
    private filteredExperimentOverviewListSubject: Subject<any> = new Subject();
    private saveManagerSubject: Subject<any> = new Subject();

    // conditional params
    browsePanelParams: HttpParams;
    experimentList: Array<any> = [];

    public invalid: boolean = false;
    public dirty: boolean = false;
    public modeChangedExperiment: any;
    public filteredLabs: any;
    public labList: any[] = [];
    private editMode: boolean = false;
    private _experimentOverviewForm: FormGroup;
    private _usePreviousURLParams: boolean = false;
    public currentTabIndex = 0;


    constructor(private cookieUtilService: CookieUtilService,
                private httpClient: HttpClient,
                private dialogService: DialogsService,
                @Inject(BROWSE_EXPERIMENTS_ENDPOINT) private _browseExperimentsUrl: string) {
        this._experimentOverviewForm = new FormGroup({});
    }

    set usePreviousURLParams(value: boolean) {
        this._usePreviousURLParams = value;
    }
    get usePreviousURLParams(): boolean {
        return this._usePreviousURLParams;
    }

    getExperimentsObservable(): Observable<any> {
        return this.experimentOrdersSubject.asObservable();
    }

    getExperimentsOrdersMessageObservable(): Observable<any> {
        return this.experimentOrdersMessageSubject.asObservable();
    }

    refreshProjectRequestList_fromBackend(): void {
        this.startSearchSubject.next(true);
        this.httpClient.get("/gnomex/GetProjectRequestList.gx", {params: this.previousURLParams})
            .subscribe((response: any) => {
                this.projectRequestList = response;
                this.emitProjectRequestList();
            }, (err: IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });
    }


    getExperiments_fromBackend(parameters: HttpParams): void {
        this.haveLoadedExperimentOrders = true;
        this.previousURLParams = parameters;

        this.httpClient.get("/gnomex/GetRequestList.gx", {params: parameters})
            .pipe(map((resp: any) => { return resp.Request}))
            .subscribe((response: any) => {
                this.experimentOrders = response;
                this.emitExperimentOrders();
                this.experimentOrdersMessageSubject.next(response.message);

            }, (err: IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });
    }

    repeatGetExperiments_fromBackend(): void {
        this.haveLoadedExperimentOrders = false;
        this.getExperiments_fromBackend(this.previousURLParams);
    }

    getPreviousURLParamsCoreFacilityFilter(): string {
        return this.previousURLParams.get("idCoreFacility");
    }

    getChangeExperimentStatusObservable(): Observable<any> {
        return this.changeStatusSubject.asObservable();
    }

    public updateCanDeleteProject(canDelete: boolean): void {
        this.canDeleteProjectSubject.next(canDelete);
    }

    changeExperimentStatus(idRequest: string, codeRequestStatus: string): void {

        let params: HttpParams = new HttpParams()
            .set("idRequest", idRequest)
            .set("codeRequestStatus", codeRequestStatus);

        this.httpClient.get("/gnomex/ChangeRequestStatus.gx", {withCredentials: true, params: params})
            .subscribe((response: any) => {
            if (response) {
                this.changeStatusSubject.next(response);
            }
        }, (err: IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });
    }


    emitExperimentOrders(): void {
        this.experimentOrdersSubject.next(this.experimentOrders);
    }

    getProjectRequestListObservable(): Observable<any> {
        return this.projectRequestListSubject.asObservable();
    }


    emitProjectRequestList(): void {
        this.projectRequestListSubject.next(this.projectRequestList);
    }

    getProjectRequestList_fromBackend(params: HttpParams, allowRefresh? : boolean): void {
        this.startSearchSubject.next(true);

        this.haveLoadedExperimentOrders = true;
        this.previousURLParams = params;

        this.httpClient.get("/gnomex/GetProjectRequestList.gx", {params: params})
            .subscribe((response: any) => {
                this.projectRequestList = response;
                this.emitProjectRequestList();
            }, (err: IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });
    }

    emitExperiment(exp: any): void {
        this.experimentSubject.next(exp);
    }

    getExperimentObservable(): Observable<any> {
        return this.experimentSubject.asObservable();
    }

    getExperiment(id: string): Observable<any> {
        let params: HttpParams = new HttpParams().set("idRequest", id);
        return this.httpClient.get("/gnomex/GetRequest.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

    public getNewRequest(): Observable<any> {
        let params: HttpParams = new HttpParams().set("idRequest", "0");
        return this.httpClient.get("/gnomex/GetRequest.gx", {params: params});
    }

    public getMultiplexLaneList(experiment: Experiment): Observable<any> {

        let params: HttpParams = new HttpParams()
            .set("requestJSONString", JSON.stringify(experiment.getJSONObjectRepresentation()))
            .set("noJSONToXMLConversionNeeded", "Y");

        this.cookieUtilService.formatXSRFCookie();

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        return this.httpClient.post("/gnomex/GetMultiplexLaneList.gx", params.toString(), { headers: headers });
    }

    getLab(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetLab.gx", {params: params}).pipe(map((response: any) => {
            if (response && response.Lab) {
                return response.Lab;
            } else {
                throw new Error("Error"); // TODO: need to confirm what's inside of response
            }
        }), catchError((err: IGnomexErrorResponse) => {
            return throwError(err);
        }));

    }

    saveRequestProject(params: HttpParams):  Observable<any> {
        return this.httpClient.get("/gnomex/SaveRequestProject.gx", {params: params});
    }

    saveRequest(experiment: any):  Observable<any> {

        if (!experiment) {
            return;
        }

        let propertiesXML: string;
        if(Array.isArray(experiment.RequestProperties) && experiment.RequestProperties.length === 0) {
            propertiesXML = "";
        } else {
            propertiesXML = JSON.stringify(experiment.RequestProperties);
        }

        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("requestJSONString", JSON.stringify(experiment.getJSONObjectRepresentation()))
            .set("description", experiment.description)
            .set("idProject", experiment.idProject)
            .set("invoicePrice", experiment.invoicePrice)
            .set("propertiesXML", propertiesXML)
            .set("noJSONToXMLConversionNeeded","true");

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        return this.httpClient.post("/gnomex/SaveRequest.gx", params.toString(), { headers: headers });
    }

    public GetQCChipTypePriceList(codeRequestCategory: string, idLab: string):  Observable<any> {

        if (!codeRequestCategory || !idLab) {
            return;
        }

        let params: HttpParams = new HttpParams()
            .set("codeRequestCategory", codeRequestCategory)
            .set("idLab", idLab);

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        return this.httpClient.post("/gnomex/GetQCChipTypePriceList.gx", params.toString(), { headers: headers });
    }

    saveVisibility(body: any, idProject?: string): Observable<any> {

        let parameters: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()});
        let strBody: string = JSON.stringify(body);

        if(idProject) {
            parameters = parameters.set("idProject", idProject);
        }
        parameters = parameters.set("visibilityXMLString", strBody);
        return this.httpClient.get("/gnomex/SaveVisibility.gx", {params: parameters});
    }



    getProjectObsevable(): Observable<any> {
        return this.projectSubject.asObservable();
    }
    emitProject(project: any): void {
        this.projectSubject.next(project);
    }
    getProject_fromBackend(params: HttpParams): void {
        this.httpClient.get("/gnomex/GetProject.gx", {params: params})
            .subscribe((response: any) => {
                if (response) {
                    this.emitProject(response);
                } else {
                    throw new Error("Error getting Project"); // Fixme: required?
                }
            }, (err: IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs(); // Fixme: required?
            });
    }



    getProject(params: HttpParams):  Observable<any> {
        return this.httpClient.get("/gnomex/GetProject.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
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
        return this.httpClient.get("/gnomex/GetProjectRequestList.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

    public getProjectRequestListNew(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetProjectRequestList.gx", {params: params});
    }

    getRequestProgressListObservable(): Observable<any> {
        return this.requestProgressList;
    }
    getRequestProgressList_FromBackend(params: HttpParams): void {
        this.httpClient.get("/gnomex/GetRequestProgressList.gx", {params: params})
            .subscribe((response: any) => {
                if(response && !Array.isArray(response) && response["RequestProgress"]) {
                    this.requestProgressList.next([response["RequestProgress"]]);
                } else {
                    this.requestProgressList.next(response);
                }
            }, (err: IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });
    }

    getRequestProgressSolexaListObservable(): Observable<any> {
        return this.requestProgressSolexaList.asObservable();
    }
    getRequestProgressSolexaList_FromBackend(params: HttpParams): void {
        this.httpClient.get("/gnomex/GetRequestProgressSolexaList.gx", {params: params}).pipe()
            .subscribe((response: any) => {
                if(response && !Array.isArray(response) && response["RequestProgress"]) {
                    this.requestProgressSolexaList.next([response["RequestProgress"]]);
                } else {
                    this.requestProgressSolexaList.next(response);
                }
            }, (err: IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });

    }

    getRequestProgressDNASeqListObservable() {
        return this.requestProgressDNASeqList.asObservable();
    }
    getRequestProgressDNASeqList_FromBackend(params: HttpParams): void {
        this.httpClient.get("/gnomex/GetRequestProgressDNASeqList.gx", {params: params})
            .subscribe((response: any) => {
                if(response && !Array.isArray(response) && response["RequestProgress"]) {
                    this.requestProgressDNASeqList.next([response["RequestProgress"]]);
                } else {
                    this.requestProgressDNASeqList.next(response);
                }
            }, (err: IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });
    }
    emitExperimentOverviewList(data: any): void {
        this.experimentOverviewListSubject.next(data);
    }
    resetExperimentOverviewListSubject() {
        this.experimentOverviewListSubject = new BehaviorSubject([]);
    }
    getExperimentOverviewListSubject(): BehaviorSubject<any> {
        return this.experimentOverviewListSubject;
    }
    emitFilteredOverviewList(data: any): void {
        this.filteredExperimentOverviewListSubject.next(data);
    }
    getFilteredOverviewListObservable(): Observable<any> {
        return this.filteredExperimentOverviewListSubject.asObservable();
    }
    emitSaveManger(type: string): void {
        this.saveManagerSubject.next(type);
    }
    getSaveMangerObservable(): Observable<any> {
        return this.saveManagerSubject.asObservable();
    }

    public getRequestDownloadList(idRequest: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idRequest", idRequest);
        return this.httpClient.get("/gnomex/GetRequestDownloadList.gx", {params: params});
    }


    getExperimentWithParams(params: HttpParams) {
        return this.httpClient.get("/gnomex/GetRequest.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

    getRequestDownloadListWithParams(params: HttpParams) {
        return this.httpClient.get("/gnomex/GetRequestDownloadList.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

    getLinkedSampleFiles(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetLinkedSampleFiles.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
            return throwError(err);
        }));
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

    get experimentOverviewForm(): FormGroup {
        return this._experimentOverviewForm;
    }

    public addExperimentOverviewFormMember(control: AbstractControl, name: string, afterControlAddedFn?: any): void {
        setTimeout(() => {
            this._experimentOverviewForm.addControl(name, control);
            if(afterControlAddedFn) {
                afterControlAddedFn();
            }
        });
    }
    public clearExperimentOverviewForm(): void {
        this._experimentOverviewForm = new FormGroup({});
    }

    public showPriceQuote(experiment: Experiment): void {
        if (!experiment) {
            return;
        }

        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("requestJSONString", JSON.stringify(experiment.getJSONObjectRepresentation()))
            .set("noJSONToXMLConversionNeeded", "Y");

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        const request: HttpRequest<any> = new HttpRequest<any>("POST", "/gnomex/ShowRequestForm.gx", params.toString(), {
            headers: headers,
            responseType: "blob"
        });

        this.httpClient.request(request).subscribe((event: HttpEvent<any>) => {
            if (event.type === HttpEventType.Response) {
                saveAs(event.body, "testing_ShowRequestForm.pdf");
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogService.stopAllSpinnerDialogs(); // Fixme: required?
        });
    }
}
