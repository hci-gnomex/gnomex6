import {Injectable} from "@angular/core";
import {Http, Headers, Response} from "@angular/http";
import {Observable, of, throwError} from "rxjs";
import {Subject} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {catchError, map} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";

@Injectable()
export class DataTrackService {
    public datatracksList: any[];
    private datatracksListSubject: Subject<any[]> = new Subject();
    private _haveLoadedDatatracksList: boolean = false;
    private _previousURLParams: HttpParams = null;
    private _datatrackListTreeNode: any;
    private _labList: any[] =[];
    private _activeNodeToSelect: any = {};

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

    set activeNodeToSelect(data: any) {
        this._activeNodeToSelect = data;
    }
    get activeNodeToSelect(): any {
        return this._activeNodeToSelect;
    }

    getDataTrack(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetDataTrack.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

    getDataTrackList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetDataTrackList.gx", {params: params}).pipe(map((response: any) => {
            return response.Organism;
        }));
    }

    public getDataTrackListFull(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetDataTrackList.gx", {params: params});
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
        this.dialogService.addSpinnerWorkItem();
        this._haveLoadedDatatracksList = true;
        this._previousURLParams = params;

        this.httpClient.get("/gnomex/GetDataTrackList.gx", {params: params})
            .pipe(map((resp:any) =>{ return resp.Organism}))
            .subscribe((response: any) => {
                this.dialogService.removeSpinnerWorkItem();
                this.datatracksList = response;
                this.emitDatatracksList();
            },(err:IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });

    }

    refreshDatatracksList_fromBackend(): void {
        this.dialogService.addSpinnerWorkItem();
        this.httpClient.get("/gnomex/GetDataTrackList.gx", {params: this._previousURLParams})
            .pipe(map((resp:any) => { return resp.Organism }))
            .subscribe((response: any) => {
                this.dialogService.removeSpinnerWorkItem();
                this.datatracksList = response;
                this.emitDatatracksList();
            }, (err:IGnomexErrorResponse) =>{
                this.dialogService.stopAllSpinnerDialogs();
            });
    }

    getGenomeBuild(params:HttpParams):Observable<any>{
        return this.httpClient.get("/gnomex/GetGenomeBuild.gx", {params: params})
            .pipe(catchError((err:IGnomexErrorResponse) =>{
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

    public createAllDataTracks(idAnalysis: string, idsToDistrube: string[] ): Observable<any> {
        let noConvertHeader : HttpHeaders = new HttpHeaders().set( "noJSONToXMLConversionNeeded" , "Y");
        let body = {
            idAnalysis: idAnalysis,
            idAnalysisFileToDistribute: idsToDistrube,
        };

        return this.httpClient.post("/gnomex/CreateAllDataTracks.gx", body, {headers: noConvertHeader});
    }

    public getDownloadEstimatedSize(keys: string): Observable<any> {
        let params: HttpParams = new HttpParams().set("keys", keys);
        return this.httpClient.get("/gnomex/GetEstimatedDownloadDataTrackSize.gx", {params: params});
    }

    public getActiveNodeAttribute(node: any): void {
        this.activeNodeToSelect = null;
        if(node && node.data) {
            let attribute: string = "";
            let value: string = "";
            if(node.data.isOrganism) {
                attribute = "idOrganism";
                value = node.data.idOrganism;
            } else if(node.data.isGenomeBuild) {
                attribute = "idGenomeBuild";
                value = node.data.idGenomeBuild;
            } else if(node.data.isDataTrackFolder) {
                attribute = "idDataTrackFolder";
                value = node.data.idDataTrackFolder;
            } else if(node.data.isDataTrack) {
                attribute = "idDataTrack";
                value = node.data.idDataTrack;
            }
            this.activeNodeToSelect = {
                attribute: attribute,
                value: value
            };
        }
    }

}
