import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

@Injectable()
export class OrganismService {

    constructor(private http: Http) {
    }

    public getOrganismListCall(): Observable<Response> {
        return this.http.get("/gnomex/GetOrganismList.gx");
    }

    public getDas2OrganismList(): Observable<any[]> {
        return this.getOrganismListCall().map((response: Response) => {
            if (response.status === 200) {
                let allOrganisms: any[] = response.json();
                return allOrganisms.filter((organism: any) => {
                    return !(organism.das2Name === "") && !(organism.bionomialName === "") && organism.isActive === "Y";
                });
            } else {
                return [];
            }
        });
    }

    public saveOrganism(params: URLSearchParams):  Observable<Response> {
        return this.http.get("/gnomex/SaveOrganism.gx", {search: params});
    }

}