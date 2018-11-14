import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable()
export class AppUserListService {

    constructor(private http: Http) {
    }

    getAppUserList(params: URLSearchParams): Observable<any[]> {
        return this.http.get("/gnomex/GetAppUserList.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    getAppUser(params: URLSearchParams): Observable<any[]> {
        return this.http.get("/gnomex/GetAppUser.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    saveAppUser(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/SaveAppUser.gx", {search: params});
    }

    getFullAppUserList(): Observable<any> {
        return this.http.get("/gnomex/GetAppUserList.gx").pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    getMembersOnly(): Observable<any[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("membersOnly", "Y");
        return this.getAppUserList(params);
    }

}