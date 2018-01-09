import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';

@Injectable()
export class UsageService {

    constructor(private http: Http) {
    }

    public getUsageDataCall(params: URLSearchParams): Observable<Response> {
        return this.http.get("/gnomex/GetUsageData.gx", {search: params});
    }

    public getUsageData(params: URLSearchParams): Observable<any[]> {
        return this.getUsageDataCall(params).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return [];
            }
        });
    }

}