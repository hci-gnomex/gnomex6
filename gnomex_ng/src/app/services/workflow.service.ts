
import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class WorkflowService {
    constructor(private http: Http) {

    }

    getWorkItemList(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/GetWorkItemList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });

    }

    saveCombinedWorkItemQualityControl(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/SaveCombinedWorkItemQualityControl.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });

    }

}