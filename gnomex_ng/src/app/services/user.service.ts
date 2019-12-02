import {Injectable} from "@angular/core";
import {Observable, throwError} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {IRegisterUser} from "../util/interfaces/register-user.model";
import {CookieUtilService} from "./cookie-util.service";
import {catchError} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";


@Injectable()
export class UserService {

    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    saveAppUser(params: HttpParams):  Observable<any> {
        return this.httpClient.get("/gnomex/SaveAppUser.gx", {params: params});
    }

    deleteAppUser(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/DeleteAppUser.gx", {params: params});
    }

    registerUser(params: HttpParams): Observable<IRegisterUser> {
        return this.httpClient.get<IRegisterUser>("/gnomex/GetNewAccountServlet.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

    saveSelfRegisteredAppUser(params: HttpParams): Observable<any> {
        let headers : HttpHeaders = new HttpHeaders().set("Content-Type", "application/x-www-form-urlencoded");
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/PublicSaveSelfRegisteredAppUser.gx", params.toString(), {headers: headers})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

}
