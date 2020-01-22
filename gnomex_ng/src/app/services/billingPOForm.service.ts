import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import { Observable } from "rxjs";
import { Subject } from "rxjs";

import {CookieUtilService} from "./cookie-util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {UtilService} from "./util.service";

@Injectable()
export class BillingPOFormService {

    private static readonly getPOUploadURL_URL: string = "/gnomex/UploadPurchaseOrderURL.gx";
    private static readonly deletePoForm_URL: string = "/gnomex/DeletePurchaseForm.gx";

    private poUpload_URL: string = null;
    private uploadSucceededSubject: Subject<boolean>;
    private deleteSucceededSubject: Subject<boolean>;

    constructor(private httpClient: HttpClient, private cookieUtilService: CookieUtilService) { }

    public uploadNewForm(params: any): Observable<boolean> {

        this.cookieUtilService.formatXSRFCookie();

        if (this.poUpload_URL != null) {
            this.httpClient.post(this.poUpload_URL, params).subscribe((response: any) => {
                if (response && response.result && response.result === "SUCCESS") {
                    this.uploadSucceededSubject.next(true);
                } else {
                    this.uploadSucceededSubject.next(false);
                }
            }, (err: IGnomexErrorResponse) => {});
        } else {
            this.httpClient.get(BillingPOFormService.getPOUploadURL_URL).subscribe((response: any) => {
                if(response && response.url) {
                    this.poUpload_URL = UtilService.getUrlString(response.url);
                    this.httpClient.post(this.poUpload_URL, params).subscribe((response: any) => {
                        if (response && response.result && response.result === "SUCCESS") {
                            this.uploadSucceededSubject.next(true);
                        } else {
                            this.uploadSucceededSubject.next(false);
                        }
                    }, (err: IGnomexErrorResponse) => {});
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
