import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable()
export class ProjectService {

    constructor(private httpClient: HttpClient) {
    }

    deleteProject(params: HttpParams):  Observable<any> {
        return this.httpClient.get("/gnomex/DeleteProject.gx", {params: params});

    }

    public getProjectList(): Observable<any> {
        return this.httpClient.get("/gnomex/GetProjectList.gx");
    }

}
