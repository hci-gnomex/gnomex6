import {Injectable} from "@angular/core";
import {Http, Headers, Response, URLSearchParams} from "@angular/http";

import { Observable } from "rxjs/observable";

@Injectable()
export class BillingPOFormService {

    private static readonly getPOUploadURL_URL: string = "/gnomex/UploadPurchaseOrderURL.gx";

    private poUpload_URL: string = null;

    constructor(private http: Http) { }

    public getPOUploadURL(): string {
        if (this.poUpload_URL != null) {
            return this.poUpload_URL;
        }

        this.http.post(BillingPOFormService.getPOUploadURL_URL, {}).subscribe((response) => {
            if (response && response.status === 200
                // && response.name === "UploadPurchaseOrderURL"
            ) {
                this.poUpload_URL = response.url;
            }
        });
    }

    public uploadNewForm(params: any): Observable<Response> {
        console.log("Uploaded a file using " + this.poUpload_URL+ "!");

        return this.http.post(this.getPOUploadURL(), params);
    }
}