import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {HttpClient, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";

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

    public saveTopic(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/SaveTopic.gx", {search: params}).map((response:Response) =>{
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getTopicList(): Observable<any> {
        return this.http.get("/gnomex/GetTopicList.gx").map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
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
        return this.http.get("/gnomex/AddItemToTopic.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    unlinkItemFromTopic(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/UnlinkItemFromTopic.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    deleteTopic(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteTopic.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    moveOrCopyTopic(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/MoveOrCopyTopic.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
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