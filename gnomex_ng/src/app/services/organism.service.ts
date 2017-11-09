import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';

@Injectable()
export class OrganismService {

    constructor(private http: Http) {
    }

    getOrganismList(params: URLSearchParams):  Observable<any> {
        return this.http.get("/gnomex/GetOrganismList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error("Error");
            }
        });

    }

}
