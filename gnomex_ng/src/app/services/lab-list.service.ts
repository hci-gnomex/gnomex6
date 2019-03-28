import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {BehaviorSubject, Observable, of, Subject, throwError} from "rxjs";
import {catchError, first, flatMap, map} from "rxjs/operators";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";

@Injectable()
export class LabListService {
    private labListSubject:BehaviorSubject<any> = new BehaviorSubject([]);


    constructor(private http: Http, private httpClient:HttpClient) {
    }

    public getLabListCall(): Observable<Response> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("listKind", "UnboundedLabList");
        return this.http.get("/gnomex/GetLabList.gx", {search: params});
    }


    getLabListSubject():Observable<any>{
        return this.labListSubject.asObservable();
    }
    private handleError(errorResponse: HttpErrorResponse){
        if(errorResponse.error instanceof ErrorEvent){
            console.error("Client side Error: ", errorResponse.error.message);
        }else{
            console.error("Server Side Error: ", errorResponse);
        }
        return throwError({message: "An error occured please contact GNomEx Support."});
    }

    getLabList_FromBackEnd():void{
        let params: HttpParams = new HttpParams().set("listKind", "UnboundedLabList");
        this.httpClient.get("/gnomex/GetLabList.gx",{params:params}).pipe(first())
            .subscribe( resp => {
                this.labListSubject.next(resp)

            },(err) =>{
                this.labListSubject.next(err)
            });

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

    saveLab(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveLab.gx", params.toString(), {headers: headers});
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