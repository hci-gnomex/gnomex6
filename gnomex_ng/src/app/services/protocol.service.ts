import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import { CookieUtilService } from "./cookie-util.service";
import {Observable, Subject, throwError} from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class ProtocolService {

    private protocolSubject: Subject<any> = new Subject();
    private protocolListSubject: Subject<any[]> = new Subject();

    private saveNewProtocolSubject: Subject<any> = new Subject();
    private saveExistingProtocolSubject: Subject<any> = new Subject();
    private deleteProtocolSubject: Subject<any> = new Subject();

    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) { }


    public getProtocolObservable(): Observable<any> {
        return this.protocolSubject.asObservable();
    }
    public getProtocolListObservable(): Observable<any[]> {
        return this.protocolListSubject.asObservable();
    }

    public getSaveNewProtocolObservable(): Observable<any> {
        return this.saveNewProtocolSubject.asObservable();
    }
    public getSaveExistingProtocolObservable(): Observable<any> {
        return this.saveExistingProtocolSubject.asObservable();
    }

    public getDeleteProtocolObservable(): Observable<any> {
        return this.deleteProtocolSubject.asObservable();
    }

    public getProtocolByIdAndClass(id: string, protocolClassName: string): void {
        let params: HttpParams = new HttpParams()
            .set('id', id)
            .set('protocolClassName', protocolClassName);

        this.httpClient.get('gnomex/GetProtocol.gx', {params: params})
            .pipe(catchError(this.handleError))
            .subscribe((result) => {
            this.protocolSubject.next(result);
        });
    }
    public getProtocolList(): void {
        this.httpClient.get('gnomex/GetProtocolList.gx').subscribe((result) => {
            if (!!result) {
                if (Array.isArray(result)) {
                    this.protocolListSubject.next(result);
                } else {
                    this.protocolListSubject.next([]);
                    // this.protocolListSubject.next([result.Protocols]);
                }
            } else {
                this.protocolListSubject.next([]);
            }
        });
    }

    public saveProtocol(params:HttpParams): Observable<any>{ // used for experiment platform
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post('/gnomex/SaveProtocol.gx',null,{params:params})
            .pipe(catchError(this.handleError));
    }
    private handleError(errorResponse: HttpErrorResponse){
        if(errorResponse.error instanceof ErrorEvent){
            console.error("Client side Error: ", errorResponse.error.message);
        }else{
            console.log("Server Side Error: ", errorResponse);
        }
        return throwError("An error occured please contact GNomEx Support.");
    }


    public saveNewProtocol(protocolName: string, codeRequestCategory: string, protocolClassName: string, idAnalysisType: string): void {
        this.cookieUtilService.formatXSRFCookie();

        let params: HttpParams;

        if (idAnalysisType && idAnalysisType !== '') {
            params = new HttpParams()
                .set('protocolName', protocolName)
                .set('codeRequestCategory', '')
                .set('protocolClassName', protocolClassName)
                .set('idAnalysisType', idAnalysisType);
        } else {
            params = new HttpParams()
                .set('protocolName', protocolName)
                .set('codeRequestCategory', codeRequestCategory)
                .set('protocolClassName', protocolClassName);
        }

        this.httpClient.post('/gnomex/SaveProtocol.gx', null, {params: params}).subscribe((result) => {
            this.saveNewProtocolSubject.next(result);
        });
    }

    public saveExistingProtocol(protocolName: string,
                                protocolDescription: string,
                                idAnalysisType: string,
                                protocolClassName: string,
                                codeRequestCategory: string,
                                idAppUser: string,
                                isActive: string,
                                idProtocol: string,
                                protocolUrl: string): void {
        this.cookieUtilService.formatXSRFCookie();

        let params: HttpParams = new HttpParams()
            .set('protocolName',        protocolName)
            .set('protocolDescription', protocolDescription)
            .set('idAnalysisType',      idAnalysisType)
            .set('protocolClassName',   protocolClassName)
            .set('codeRequestCategory', codeRequestCategory)
            .set('idAppUser',           idAppUser)
            .set('isActive',            isActive)
            .set('idProtocol',          idProtocol)
            .set('protocolUrl',         protocolUrl);

        this.httpClient.post('/gnomex/SaveProtocol.gx', null, {params: params}).subscribe((result) => {
            this.saveExistingProtocolSubject.next(result);
        });
    }

    public deleteProtocol(idProtocol: string, protocolClassName: string): void {
        this.cookieUtilService.formatXSRFCookie();

        let params: HttpParams = new HttpParams()
            .set('idProtocol', idProtocol)
            .set('protocolClassName', protocolClassName);

        this.httpClient.post('/gnomex/DeleteProtocol.gx', null, {params: params}).subscribe((result) => {
            this.deleteProtocolSubject.next(result);
        });
    }
}