import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs";
import {Subject} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {map} from "rxjs/operators";
import {UtilService} from "./util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";

@Injectable()
export class TopicService {
    public startSearchSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _previousURLParams: HttpParams = null;
    private topicsListSubject: Subject<any[]> = new Subject();
    private topicTreeNodeSubject: BehaviorSubject<any> = new BehaviorSubject(null);
    public static readonly DATATRACK : string = 'datatrack';
    public static readonly ANALYSIS : string = 'analysis';
    public static readonly EXPERIMENT: string = 'experiment';
    public static readonly TOPIC: string = 'detail';

    public topicsList: any[];

    constructor(private httpClient: HttpClient,
                private dialogService: DialogsService,
                private cookieUtilService: CookieUtilService) {
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
        this.httpClient.get("/gnomex/GetTopicList.gx", {
            withCredentials: true,
            params: this._previousURLParams}).subscribe((response: any) => {
            if (response) {
                this.topicsList = response;
                this.emitTopicsList();
            } else {
                throw new Error("Error");
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogService.stopAllSpinnerDialogs();
        });
    }


    addItemToTopic(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/AddItemToTopic.gx", {params: params});
    }

    public addItemToTopicNew(idTopic: string, attribute: string, attributeValue: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idTopic", idTopic)
            .set(attribute, attributeValue);
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/AddItemToTopic.gx", params.toString(), {headers: headers});
    }

    unlinkItemFromTopic(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/UnlinkItemFromTopic.gx", {params: params});
    }

    deleteTopic(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/DeleteTopic.gx", {params: params});
    }

    moveOrCopyTopic(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/MoveOrCopyTopic.gx", {params: params});
    }

    emitSelectedTreeNode(data: any): void {
        this.topicTreeNodeSubject.next(data);
    }
    getSelectedTreeNodeObservable(): Observable<any>{
        return this.topicTreeNodeSubject.asObservable();
    }

    emailTopicOwner(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/EmailTopicOwner.gx", null, {params: params});
    }

    public getTopics(): Observable<any[]> {
        return this.httpClient.get("/gnomex/GetTopicList.gx").pipe(map((response: any) => {
            let topics: any[] = [];
            if (response && response.Folder && response.Folder) {
                this.recursivelyAddChildrenTopics(response.Folder, topics);
            }
            return topics;
        }));
    }

    private recursivelyAddChildrenTopics(node: any, topicList: any[]): void {
        if (node.Topic) {
            let children: any[] = UtilService.getJsonArray(node.Topic, node.Topic);
            for (let child of children) {
                topicList.push(child);
                this.recursivelyAddChildrenTopics(child, topicList);
            }
        }
    }


}
