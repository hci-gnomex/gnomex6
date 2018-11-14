import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable()
export class LabListService {

    constructor(private http: Http) {
    }

    public getLabListCall(): Observable<Response> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("listKind", "UnboundedLabList");
        return this.http.get("/gnomex/GetLabList.gx", {search: params});
    }

    public getLabList(): Observable<any[]> {
        return this.getLabListCall().pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return [];
            }
        }));
    }

    getLabListWithParams(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetLabList.gx", {search: params}).pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    saveLab(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/SaveLab.gx", {search: params});
    }

    getOrganismList(): Observable<any> {
        return this.http.get("/gnomex/GetOrganismList.gx").pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        }));
    }

    generateUserAccountEmail(params: URLSearchParams): Observable<any> {
        if (params.paramsMap.size === 0) {
            return this.http.get("/gnomex/GenerateUserAccountEmail.gx").pipe(map((response: Response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error("Error");
                }
            }));

        } else {
            return this.http.get("/gnomex/GenerateUserAccountEmail.gx", {search: params}).pipe(map((response: Response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error("Error");
                }
            }));
        }
    }

    public getSubmitRequestLabList(): Observable<any[]> {
        return this.getLabListCall().pipe(map((response: Response) => {
            if (response.status === 200) {
                let allLabs: any[] = response.json();
                return allLabs.filter((lab: any) => {
                    return lab.canGuestSubmit === "Y" || lab.canSubmitRequests === "Y";
                });
            } else {
                return [];
            }
        }));
    }

    public getAllLabsCall(): Observable<Response> {
        return this.http.get("/gnomex/GetAllLabs.gx");
    }

    public getAllLabs(): Observable<any[]> {
        return this.getAllLabsCall().pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return [];
            }
        }));
    }

}