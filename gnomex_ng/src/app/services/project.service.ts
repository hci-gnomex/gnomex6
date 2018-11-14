import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map} from "rxjs/operators";

@Injectable()
export class ProjectService {

    constructor(private http: Http,
                private httpClient: HttpClient) {
    }

    deleteProject(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/DeleteProject.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        }));

    }

    public getProjectList(): Observable<any> {
        return this.httpClient.get("/gnomex/GetProjectList.gx");
    }

}
