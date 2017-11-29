import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';

@Injectable()
export class AnnotationService {

    constructor(private http: Http) {
    }

    public getPropertyListCall(): Observable<Response> {
        return this.http.get("/gnomex/GetPropertyList.gx");
    }

    public getPropertyList(): Observable<any[]> {
        return this.getPropertyListCall().map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return [];
            }
        });
    }

}