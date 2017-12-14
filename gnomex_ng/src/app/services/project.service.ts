import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';

@Injectable()
export class ProjectService {

    constructor(private http: Http) {
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
//                console.log("&&&&&&&&&&&&&&&&&& getProject " + response);
                return response.json();
            } else {
                throw new Error("Error");
            }
        });

    }


}
