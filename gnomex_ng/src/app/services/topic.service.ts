import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs";
import {Subject} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {map} from "rxjs/operators";

@Injectable()
export class TopicService {
    public startSearchSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _previousURLParams: URLSearchParams = null;
    private topicsListSubject: Subject<any[]> = new Subject();
    private topicTreeNodeSubject:BehaviorSubject<any>= new BehaviorSubject({});

    public topicsList: any[];

    constructor(private http: Http,private httpClient:HttpClient,
                private cookieUtilService:CookieUtilService) {
    }

    public saveTopic(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveTopic.gx", params.toString(), {headers: headers});
    }

    emitTopicsList(): void {
        this.topicsListSubject.next(this.topicsList);
    }

    getTopicsListObservable(): Observable<any> {
        return this.topicsListSubject.asObservable();
    }

    refreshTopicsList_fromBackend(): void {
        this.startSearchSubject.next(true);
        this.http.get("/gnomex/GetTopicList.gx", {
            withCredentials: true,
            search: this._previousURLParams
        }).subscribe((response: Response) => {
            if (response.status === 200) {
                this.topicsList = response.json();
                this.emitTopicsList();
            } else {
                throw new Error("Error");
            }
        });
    }


    addItemToTopic(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/AddItemToTopic.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    unlinkItemFromTopic(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/UnlinkItemFromTopic.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    deleteTopic(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteTopic.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    moveOrCopyTopic(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/MoveOrCopyTopic.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    emitSelectedTreeNode(data:any):void{
        this.topicTreeNodeSubject.next(data);
    }
    getSelectedTreeNodeObservable(): Observable<any>{
        return this.topicTreeNodeSubject.asObservable();
    }
    resetTopicTreeNodeSubject():void{
        this.topicTreeNodeSubject =  new BehaviorSubject({});
    }
    emailTopicOwner(params:HttpParams):Observable<any>{
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/EmailTopicOwner.gx",null,{params:params});
    }



}