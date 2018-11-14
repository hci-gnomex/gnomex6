import {Injectable} from "@angular/core";
import {Http,Headers, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {Subject} from "rxjs";
import {BehaviorSubject} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map} from "rxjs/operators";

@Injectable()
export class DataTrackService {
    public datatracksList: any[];
    public startSearchSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private datatracksListSubject: Subject<any[]> = new Subject();
    private _haveLoadedDatatracksList: boolean = false;
    private _previousURLParams: URLSearchParams = null;
    private _datatrackListTreeNode: any;
    private _labList: any[] =[];

    constructor(private http: Http, private cookieUtilService: CookieUtilService,
                private httpClient: HttpClient ) {
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
    set previousURLParams(data:URLSearchParams){
        this._previousURLParams  = data;
    }
    get previousURLParams():URLSearchParams{
        return this._previousURLParams;
    }

    getDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetDataTrack.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    getDataTrackList(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetDataTrackList.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json().Organism;
            } else {
                throw new Error("Error");
            }
        }));
    }

    saveDataTrackFolder(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/SaveDataTrackFolder.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    saveDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/SaveDataTrack.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    deleteDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteDataTrack.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    unlinkDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/UnlinkDataTrack.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    duplicateDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DuplicateDataTrack.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    moveDataTrack(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/MoveDataTrack.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    moveDataTrackFolder(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/MoveDataTrackFolder.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    deleteDataTrackFolder(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteDataTrackFolder.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    deleteGenomeBuild(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteGenomeBuild.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    deleteOrganism(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteOrganism.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
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
    getDatatracksList_fromBackend(params: URLSearchParams): void {
        this.startSearchSubject.next(true);
        this._haveLoadedDatatracksList = true;
        this._previousURLParams = params;

        this.http.get("/gnomex/GetDataTrackList.gx", {
            withCredentials: true,
            search: params
        }).subscribe((response: Response) => {
            console.log("GetRequestList called");

            if (response.status === 200) {
                this.datatracksList = response.json().Organism;
                this.emitDatatracksList();
            } else {
                throw new Error("Error");
            }
        });

    }

    refreshDatatracksList_fromBackend(): void {
        this.startSearchSubject.next(true);
        this.http.get("/gnomex/GetDataTrackList.gx", {
            withCredentials: true,
            search: this._previousURLParams
        }).subscribe((response: Response) => {
            console.log("GetDataTrackList called");

            if (response.status === 200) {
                this.datatracksList = response.json().Organism;
                this.emitDatatracksList();
            } else {
                throw new Error("Error");
            }
        });
    }

    getGenomeBuild(params:URLSearchParams):Observable<any>{
            return this.http.get("/gnomex/GetGenomeBuild.gx", {search: params}).pipe(map((response: Response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error("Error");
                }
            }));
    }

    saveGenomeBuild(params: URLSearchParams):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();
        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return this.http.post("/gnomex/SaveGenomeBuild.gx",params,{headers:headers})
            .pipe(map((response: Response) => {
                if (response.status === 200) {
                    return response.json();
                }
            }));
    }
    saveFolder(params: URLSearchParams):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();
        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return this.http.post("/gnomex/SaveDataTrackFolder.gx",params,{headers:headers})
            .pipe(map((response: Response) => {
                if (response.status === 200) {
                    return response.json();
                }
            }));
    }



    getImportSegments(params: URLSearchParams):Observable<any>{
        this.cookieUtilService.formatXSRFCookie();
        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return this.http.post("/gnomex/ImportSegments.gx",params.toString(), {headers: headers})
            .pipe(map((response: Response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error("Error");
                }
            }));

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

    saveOrganism(params: URLSearchParams):  Observable<Response> {
        this.cookieUtilService.formatXSRFCookie();
        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return this.http.post("/gnomex/SaveOrganism.gx",params,{headers:headers})
            .pipe(map((response: Response) => {
                if (response.status === 200) {
                    return response.json();
                }
            }));
    }

    makeUCSCLinks(params:HttpParams): Observable<any>{
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/MakeDataTrackUCSCLinks.gx",null,{params:params});
    }
    makeIGVLink(): Observable<any>{
        //this.cookieUtilService.formatXSRFCookie();
        //return this.httpClient.post("/gnomex/MakeDataTrackIGVLink.gx",null);
        return this.httpClient.get("/gnomex/MakeDataTrackIGVLink.gx");

    }
    makeIOBIOLink(params:HttpParams): Observable<any>{
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/MakeDataTrackLinks.gx",null,{params:params});
    }
    makeURLLink(params:HttpParams) : Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/MakeDataTrackLinks.gx", null, {params:params});
    }
    destroyLinks(): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/DestroyExistingLinks.gx",null);
    }




}