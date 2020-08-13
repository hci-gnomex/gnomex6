import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import { CookieUtilService } from "./cookie-util.service";
import {Observable, Subject} from "rxjs";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";
import {HttpUriEncodingCodec} from "./interceptors/http-uri-encoding-codec";

@Injectable()
export class ProtocolService {

    private protocolSubject: Subject<any> = new Subject();
    private protocolListSubject: Subject<any[]> = new Subject();

    private saveNewProtocolSubject: Subject<any> = new Subject();
    private saveExistingProtocolSubject: Subject<any> = new Subject();
    private deleteProtocolSubject: Subject<any> = new Subject();
    public static readonly ANALYSIS_PROTOCOL_CLASS_NAME: string  = "hci.gnomex.model.AnalysisProtocol";
    private mainPaneTitle: string = "";

    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService,
                private dialogService: DialogsService) { }


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
            .subscribe((result) => {
            this.protocolSubject.next(result);
        }, (err: IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });
    }




    public getProtocolList(params?:HttpParams): void {
        let protocolCallBackFn =  (result:any) => {
            if (result) {
                if (Array.isArray(result)) {
                    this.protocolListSubject.next(result);
                } else {
                    //this.protocolListSubject.next([]);
                    this.protocolListSubject.next([result.Protocols]);
                }
            } else {
                this.protocolListSubject.next([]);
            }
        };

        if(params){
            this.httpClient.get('/gnomex/GetProtocolList.gx',{params: params}).subscribe(protocolCallBackFn, (err:IGnomexErrorResponse) =>{
                this.dialogService.stopAllSpinnerDialogs();
            })
        }else{
            this.httpClient.get('/gnomex/GetProtocolList.gx').subscribe(protocolCallBackFn, (err:IGnomexErrorResponse) =>{
                this.dialogService.stopAllSpinnerDialogs();
            });
        }


    }

    public saveProtocol(params:HttpParams): Observable<any>{ // used for experiment platform
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveProtocol.gx", null, {params: params});
        }

    public saveNewProtocol(protocolName: string, codeRequestCategory: string, protocolClassName: string, idAnalysisType: string): void {
        this.cookieUtilService.formatXSRFCookie();

        let params: HttpParams;

        if (idAnalysisType && idAnalysisType !== '') {
            params = new HttpParams({encoder: new HttpUriEncodingCodec()})
                .set('protocolName', protocolName)
                .set('codeRequestCategory', '')
                .set('protocolClassName', protocolClassName)
                .set('idAnalysisType', idAnalysisType);
        } else {
            params = new HttpParams({encoder: new HttpUriEncodingCodec()})
                .set('protocolName', protocolName)
                .set('codeRequestCategory', codeRequestCategory)
                .set('protocolClassName', protocolClassName);
        }

        this.httpClient.post('/gnomex/SaveProtocol.gx', null, {params: params}).subscribe((result) => {
            this.saveNewProtocolSubject.next(result);
        }, (err: IGnomexErrorResponse) => {
            this.dialogService.stopAllSpinnerDialogs();
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

        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
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
        }, (err: IGnomexErrorResponse) => {
            this.dialogService.stopAllSpinnerDialogs();
        });
    }

    public deleteProtocol(idProtocol: string, protocolClassName: string): void {
        this.cookieUtilService.formatXSRFCookie();

        let params: HttpParams = new HttpParams()
            .set('idProtocol', idProtocol)
            .set('protocolClassName', protocolClassName);

        this.httpClient.post('/gnomex/DeleteProtocol.gx', null, {params: params}).subscribe((result) => {
            this.deleteProtocolSubject.next(result);
        }, (err: IGnomexErrorResponse) => {
            this.dialogService.stopAllSpinnerDialogs();
        });
    }

    public getMainPaneTitle (): string {
        return this.mainPaneTitle;
    }

    public setMainPaneTitle (mainPaneTitle: string): void {
        this.mainPaneTitle = mainPaneTitle;
    }
}
