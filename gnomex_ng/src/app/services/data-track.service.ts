import {Injectable} from "@angular/core";
import {Http,Headers, Response, URLSearchParams} from "@angular/http";
import {Observable, of, throwError} from "rxjs";
import {Subject} from "rxjs";
import {BehaviorSubject} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {catchError, map} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";

@Injectable()
export class DataTrackService {
    public datatracksList: any[];
    public startSearchSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private datatracksListSubject: Subject<any[]> = new Subject();
    private _haveLoadedDatatracksList: boolean = false;
    private _previousURLParams: HttpParams = null;
    private _datatrackListTreeNode: any;
    private _labList: any[] =[];

    constructor(private http: Http, private cookieUtilService: CookieUtilService,
                private httpClient: HttpClient,
                private dialogService:DialogsService) {
    }

    set labList(data:string[]){
        this._labList = data;
    }
    get labList(){
        return this._labList;
    }
    set datatrackListTreeNode(data:any){
        this._datatrackListTreeNode = data;
    }
    get datatrackListTreeNode():any{
        return this._datatrackListTreeNode;
    }
    set previousURLParams(data:HttpParams){
        this._previousURLParams  = data;
    }
    get previousURLParams():HttpParams{
        return this._previousURLParams;
    }

    getDataTrack(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetDataTrack.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                this.dialogService.alert(err.gError.message);
                return throwError(err);
            }));
    }

    getDataTrackList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetDataTrackList.gx", {params: params}).pipe(map((response: any) => {
            return response.Organism;
        }));
    }

    public saveDataTrackFolder(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveDataTrackFolder.gx", params.toString(), {headers: headers});
    }

    public saveDataTrack(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveDataTrack.gx", params.toString(), {headers: headers});
    }

    deleteDataTrack(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/DeleteDataTrack.gx", params.toString(), {headers: headers});
    }

    unlinkDataTrack(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/UnlinkDataTrack.gx", params.toString(), { headers: headers });
    }

    duplicateDataTrack(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/DuplicateDataTrack.gx", params.toString(), { headers: headers });
    }

    moveDataTrack(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/MoveDataTrack.gx", params.toString(), { headers: headers });
    }

    moveDataTrackFolder(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/MoveDataTrackFolder.gx", params.toString(), { headers: headers });
    }

    deleteDataTrackFolder(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/DeleteDataTrackFolder.gx", params.toString(), { headers: headers });
    }

    deleteGenomeBuild(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/DeleteGenomeBuild.gx", params.toString(), { headers: headers });
    }

    deleteOrganism(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/DeleteOrganism.gx", params.toString(), { headers: headers });
    }

    emitDatatracksList(dtList?:any): void {
        if(dtList){
            this.datatracksListSubject.next(dtList);
        }else{
            this.datatracksListSubject.next(this.datatracksList);
        }
    }

    getDatatracksListObservable(): Observable<any> {
        return this.datatracksListSubject.asObservable();
    }
    getDatatracksList_fromBackend(params: HttpParams): void {
        this.startSearchSubject.next(true);
        this._haveLoadedDatatracksList = true;
        this._previousURLParams = params;

        this.httpClient.get("/gnomex/GetDataTrackList.gx", {params: params})
            .pipe(map((resp:any) =>{ return resp.Organism}))
            .subscribe((response: any) => {
                this.datatracksList = response;
                this.emitDatatracksList();
            },(err:IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
                this.dialogService.alert(err.gError.message);
            });

    }

    refreshDatatracksList_fromBackend(): void {
        this.startSearchSubject.next(true);
        this.httpClient.get("/gnomex/GetDataTrackList.gx", {params: this._previousURLParams})
            .pipe(map((resp:any) => { return resp.Organism }))
            .subscribe((response: any) => {
                this.datatracksList = response;
                this.emitDatatracksList();
            }, (err:IGnomexErrorResponse) =>{
                this.dialogService.stopAllSpinnerDialogs();
                this.dialogService.alert(err.gError.message);
            });
    }

    getGenomeBuild(params:HttpParams):Observable<any>{
        return this.httpClient.get("/gnomex/GetGenomeBuild.gx", {params: params})
            .pipe(catchError((err:IGnomexErrorResponse) =>{
                this.dialogService.alert(err.gError.message);
                return throwError(err);
            }));

    }

    public saveGenomeBuild(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveGenomeBuild.gx", params.toString(), {headers: headers});
    }

    saveFolder(params: HttpParams):  Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveDataTrackFolder.gx",params.toString(),{headers:headers})
    }



    getImportSegments(params: HttpParams):Observable<any>{
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/ImportSegments.gx",params.toString(), {headers: headers})

    }
    getImportSeqFiles(formData: FormData):Observable<any>{
        this.cookieUtilService.formatXSRFCookie();
        let headers: Headers = new Headers();
        //headers.set("Content-Type", "application/x-www-form-urlencoded");
        //, {headers: headers})
        return this.http.post("/gnomex/UploadSequenceFileServlet.gx",formData)
            .pipe(map((response: Response) => {
                if (response.status === 200) {
                    return response.json();
                }
            }));

    }

    saveOrganism(params: HttpParams):  Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveOrganism.gx",params.toString(),{headers:headers});
    }

    makeUCSCLinks(params:HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/MakeDataTrackUCSCLinks.gx", params.toString(),{headers: headers});
    }

    makeIGVLink(): Observable<any> {
        return this.httpClient.get("/gnomex/MakeDataTrackIGVLink.gx");
    }

    makeIOBIOLink(params:HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/MakeDataTrackLinks.gx", params.toString(),{headers: headers});
    }

    makeURLLink(params:HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/MakeDataTrackLinks.gx", params.toString(), {headers: headers});
    }

    makeGENELink(params:HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/MakeGeneURL.gx", params.toString(), {headers: headers});
    }

    destroyLinks(): Observable<any> {
        return this.httpClient.post("/gnomex/DestroyExistingLinks.gx",null);
    }

    public createAllDataTracks(idAnalysis: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idAnalysis", idAnalysis);
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/CreateAllDataTracks.gx", params.toString(), {headers: headers});
    }

    public getDownloadEstimatedSize(keys: string): Observable<any> {
        let params: HttpParams = new HttpParams().set("keys", keys);
        return this.httpClient.get("/gnomex/GetEstimatedDownloadDataTrackSize.gx", {params: params});
    }

}