import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

@Injectable()
export class AppUserListService {

    constructor(private http: Http,
                private httpClient: HttpClient) {
    }

    getAppUserList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetAppUserList.gx", {params:params});
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

    public getAppUserNew(idAppUser: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idAppUser", idAppUser);
        return this.httpClient.get("/gnomex/GetAppUser.gx", {params: params}).pipe(map((response: any) => {
            return response.AppUser;
        }));
    }

    saveAppUser(params: HttpParams): Observable<any> {
        let headers : HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        return this.httpClient.post("/gnomex/SaveAppUser.gx", params.toString(), {headers: headers});
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

    getMembersOnly(): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("membersOnly", "Y");
        return this.getAppUserList(params);
    }

}