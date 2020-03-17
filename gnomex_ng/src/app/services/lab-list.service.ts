import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, of, Subject, throwError} from "rxjs";
import {catchError, first, flatMap, map} from "rxjs/operators";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Injectable()
export class LabListService {
    private labListSubject: BehaviorSubject<any> = new BehaviorSubject([]);


    constructor(private httpClient: HttpClient) {
    }

    public getLabListCall(): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("listKind", "UnboundedLabList");
        return this.httpClient.get("/gnomex/GetLabList.gx", {params: params});
    }

    getLabListSubject(): Observable<any> {
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

    getLabList_FromBackEnd(): void {
        let params: HttpParams = new HttpParams().set("listKind", "UnboundedLabList");
        this.httpClient.get("/gnomex/GetLabList.gx", {params: params}).pipe(first())
            .subscribe( (resp: any) => {
                this.labListSubject.next(resp);

            }, (err: IGnomexErrorResponse) => {
                this.labListSubject.next(err);
            });

    }

    public getLabList(): Observable<any[]> {
        return this.getLabListCall().pipe(map((response: any) => {
            return response;
        }), (catchError((err: IGnomexErrorResponse) => {
            return throwError(err);
        })));
    }

    getLabListWithParams(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetLabList.gx", {params: params});
    }

    saveLab(params: HttpParams): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/SaveLab.gx", params.toString(), {headers: headers});
    }

    getOrganismList(): Observable<any> {
        return this.httpClient.get("/gnomex/GetOrganismList.gx");
    }

    generateUserAccountEmail(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GenerateUserAccountEmail.gx", {params: params});
    }

    public getSubmitRequestLabList(): Observable<any[]> {
        return this.getLabListCall().pipe(map((response: any) => {
            let allLabs = response ? Array.isArray(response) ? response : [response] : [];
            return allLabs.filter((lab: any) => {
                return lab.canGuestSubmit === "Y" || lab.canSubmitRequests === "Y";
            });
        }), (catchError((err: IGnomexErrorResponse) => {
            return throwError(err);
        })));
    }

    public getAllLabs(): Observable<any[]> {
        return this.httpClient.get("/gnomex/GetAllLabs.gx").pipe(map((response: any) => {
            return response;
        }), (catchError((err: IGnomexErrorResponse) => {
            return throwError(err);
        })));
    }

    resetLabListSubject() {
        this.labListSubject = new BehaviorSubject<any>([]);
    }
}
