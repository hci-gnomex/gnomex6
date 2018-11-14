import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";


@Injectable()
export class UserService {

    constructor(private http: Http) {
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
}