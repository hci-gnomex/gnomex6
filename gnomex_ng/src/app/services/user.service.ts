import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";


@Injectable()
export class UserService {

    constructor(private http: Http) {
    }

    saveAppUser(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/SaveAppUser.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });

    }

    deleteAppUser(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/DeleteAppUser.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }
}