import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class TopicService {

    constructor(private http: Http) {
    }

    public saveTopic(params: URLSearchParams):  Observable<Response> {
        return this.http.get("/gnomex/SaveTopic.gx", {search: params});
    }

}