import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { CookieUtilService } from "./cookie-util.service";
import { Observable } from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

@Injectable()
export class ProtocolService {

    private protocolSubject: Subject<any> = new Subject();
    private protocolListSubject: Subject<any[]> = new Subject();


    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) { }


    public getProtocolObservable(): Observable<any> {
        return this.protocolSubject.asObservable();
    }
    public getProtocolListObservable(): Observable<any[]> {
        return this.protocolListSubject.asObservable();
    }

    public getProtocolByIdAndClass(id: string, protocolClassName: string): void {
        this.cookieUtilService.formatXSRFCookie();

        let params: HttpParams = new HttpParams()
            .set('id', id)
            .set('protocolClassName', protocolClassName);

        this.httpClient.post('gnomex/GetProtocol.gx', null, {params: params}).subscribe((result) => {
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

}