import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {IRegisterUser} from "../util/interfaces/register-user.model";
import {CookieUtilService} from "./cookie-util.service";



@Injectable()
export class UserService {

    constructor(private http: Http, private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    saveAppUser(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/SaveAppUser.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        }));

    }

    deleteAppUser(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteAppUser.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    registerUser(params:HttpParams): Observable<IRegisterUser> {
        return this.httpClient.get<IRegisterUser>("/gnomex/GetNewAccountServlet.gx", {params:params});
    }
    saveSelfRegisteredAppUser(params:HttpParams): Observable<any> {
        let headers : HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        //this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.get("/gnomex/PublicSaveSelfRegisteredAppUser.gx",{ params : params})
    }

}