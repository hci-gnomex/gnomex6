import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable()
export class ProjectService {

    constructor(private http: Http,
                private httpClient: HttpClient) {
    }

    deleteProject(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/DeleteProject.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });

    }

    saveProject(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/SaveProject.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });

    }

    getProject(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/GetProject.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });

    }

    public getProjectList(): Observable<any> {
        return this.httpClient.get("/gnomex/GetProjectList.gx");
    }

}
