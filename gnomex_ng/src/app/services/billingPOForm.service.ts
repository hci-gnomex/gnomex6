import {Injectable} from "@angular/core";
import {Http, Headers, Response, URLSearchParams} from "@angular/http";

import { Observable } from "rxjs";
import { Subject } from "rxjs";

import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class BillingPOFormService {

    private static readonly getPOUploadURL_URL: string = "/gnomex/UploadPurchaseOrderURL.gx";
    private static readonly deletePoForm_URL: string = "DeletePurchaseForm.gx";

    private poUpload_URL: string = null;
    private uploadSucceededSubject: Subject<boolean>;
    private deleteSucceededSubject: Subject<boolean>;

    constructor(private http: Http, private cookieUtilService: CookieUtilService) { }

    public uploadNewForm(params: any): Observable<boolean> {

        this.cookieUtilService.formatXSRFCookie();

        if (this.poUpload_URL != null) {
            this.http.post(this.poUpload_URL, params).subscribe((response) => {
                if (response && response.status === 200) {
                    this.uploadSucceededSubject.next(true);
                } else {
                    this.uploadSucceededSubject.next(false);
                }
            });
        } else {
            this.http.get(BillingPOFormService.getPOUploadURL_URL, {}).subscribe((response) => {
                if (response && response.status === 200) {
                    this.poUpload_URL = response.json().url;
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
            });
        }

        this.uploadSucceededSubject = new Subject();
        return this.uploadSucceededSubject.asObservable();
    }

    public deletePoFormFromBillingAccount(idBillingAccount: string): Observable<boolean> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("idBillingAccount", '' + idBillingAccount);
        this.http.get(BillingPOFormService.deletePoForm_URL, {search: params}).subscribe((response) => {
            if (response.status === 200) {
                this.deleteSucceededSubject.next(true);
            } else {
                this.deleteSucceededSubject.next(false);
            }
        });

        this.deleteSucceededSubject = new Subject();
        return this.deleteSucceededSubject.asObservable();
    }
}