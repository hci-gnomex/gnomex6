import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {HttpClient, HttpParams} from "@angular/common/http";
import { Observable } from "rxjs";
import { Subject } from "rxjs";

import {CookieUtilService} from "./cookie-util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Injectable()
export class BillingPOFormService {

    private static readonly getPOUploadURL_URL: string = "/gnomex/UploadPurchaseOrderURL.gx";
    private static readonly deletePoForm_URL: string = "/gnomex/DeletePurchaseForm.gx";

    private poUpload_URL: string = null;
    private uploadSucceededSubject: Subject<boolean>;
    private deleteSucceededSubject: Subject<boolean>;

    constructor(private http: Http, private httpClient: HttpClient, private cookieUtilService: CookieUtilService) { }

    public uploadNewForm(params: any): Observable<boolean> {

        this.cookieUtilService.formatXSRFCookie();

        if (this.poUpload_URL != null) {
            // TODO: Convert multipart http calls to httpClient
            this.http.post(this.poUpload_URL, params).subscribe((response) => {
                if (response && response.status === 200) {
                    this.uploadSucceededSubject.next(true);
                } else {
                    this.uploadSucceededSubject.next(false);
                }
            });
        } else {
            this.httpClient.get(BillingPOFormService.getPOUploadURL_URL).subscribe((response: any) => {
                if(response && response.url) {
                    this.poUpload_URL = response.url;
                    // TODO: Convert multipart http calls to httpClient
                    this.http.post(this.poUpload_URL, params).subscribe((response) => {
                        if (response && response.status === 200) {
                            this.uploadSucceededSubject.next(true);
                        } else {
                            this.uploadSucceededSubject.next(false);
                        }
                    });
                } else {
                    this.uploadSucceededSubject.next(false);
                }
            }, (err: IGnomexErrorResponse) => {});
        }

        this.uploadSucceededSubject = new Subject();
        return this.uploadSucceededSubject.asObservable();
    }

    public deletePoFormFromBillingAccount(idBillingAccount: string): Observable<boolean> {
        let params: HttpParams = new HttpParams()
            .set("idBillingAccount", idBillingAccount);
        this.httpClient.get(BillingPOFormService.deletePoForm_URL, {params: params}).subscribe((response: any) => {
            if(response && response.result && response.result === "SUCCESS") {
                this.deleteSucceededSubject.next(true);
            } else {
                this.deleteSucceededSubject.next(false);
            }
        }, (err: IGnomexErrorResponse) => {
        });

        this.deleteSucceededSubject = new Subject();
        return this.deleteSucceededSubject.asObservable();
    }
}
