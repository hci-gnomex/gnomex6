import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";

import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

import {CookieUtilService} from "../services/cookie-util.service";


@Injectable()
export class SampleUploadService {

    private static readonly getUploadSampleSheetURL_URL: string = "/gnomex/UploadSampleSheetURLServlet.gx";

    private sampleUpload_URL: string = null;
    private bulkSampleUpload_URL: string = null;

    private hasSampleUploadURLSubject: Subject<any>;


    private uploadSampleSheetSubject: Subject<any>;

    private bulkUploadSubject: Subject<any>;
    private bulkUploadImportedSubject: Subject<any>;


    constructor(private http: Http, private cookieUtilService: CookieUtilService) {
        this.hasSampleUploadURLSubject = new Subject();
    }


    private getSampleUpload_URL(): void {
        this.http.get(SampleUploadService.getUploadSampleSheetURL_URL, {}).subscribe((response: any) => {
            if (response) {
                this.sampleUpload_URL = '' + response.json().url;

                this.hasSampleUploadURLSubject.next(this.sampleUpload_URL);
                this.hasSampleUploadURLSubject.unsubscribe();
            }
        });
    }

    public uploadSampleSheet(formData): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();

        if (!this.sampleUpload_URL) {
            // try again once we actually do have it.
            this.hasSampleUploadURLSubject.subscribe(() => {
                this.uploadSampleSheet(formData);
            });

            this.getSampleUpload_URL();
        } else {
            this.cookieUtilService.formatXSRFCookie();

            this.http.post("/gnomex/UploadSampleSheetFileServlet.gx", formData).subscribe((response: any) => {
                if (response && response.status === 200) {
                    let result = response.json();
                    this.uploadSampleSheetSubject.next(result);
                } else {
                    this.uploadSampleSheetSubject.next(null);
                }
            });
        }

        if (!this.uploadSampleSheetSubject) {
            this.uploadSampleSheetSubject = new Subject();
        }

        return this.uploadSampleSheetSubject.asObservable();
    }

    public uploadBulkSampleSheet(params: any): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();

        this.http.get(SampleUploadService.getUploadSampleSheetURL_URL, {}).subscribe((response: any) => {
            if (response && response.url) {
                this.sampleUpload_URL = '' + response.url;

                this.cookieUtilService.formatXSRFCookie();

                this.http.post('/gnomex/UploadMultiRequestSampleSheetFileServlet.gx', params).subscribe((response: any) => {
                    if (response && response.status === 200) {
                        this.bulkUploadSubject.next(response.json());
                    } else {
                        this.bulkUploadSubject.next(null);
                    }
                });
            }
        });

        if (!this.bulkUploadSubject) {
            this.bulkUploadSubject = new Subject();
        }

        return this.bulkUploadSubject.asObservable();
    }

    public importSamplesFromBulkSampleSheet(columnHeaders: any[], rows: any[]): Observable<any> {
        if (!columnHeaders || !rows) {
            return null;
        }

        if (!this.bulkUploadImportedSubject) {
            this.bulkUploadImportedSubject = new Subject();
        }

        let processedHeaders: any[] = [
            {
                name: "@rowOrdinal",
                header: "Row"
            }
        ];

        for (let header of columnHeaders) {
            processedHeaders.push({
                name: ("@n" + header.columnOrdinal),
                header: ("" + header.header)
            });
        }

        let params: URLSearchParams = new URLSearchParams();

        params.set('sampleSheetHeaderXMLString', JSON.stringify(processedHeaders));
        params.set('sampleSheetRowXMLString',    JSON.stringify(rows));

        let headers: Headers = new Headers();
        headers.set("Content-Type", "application/x-www-form-urlencoded");

        this.cookieUtilService.formatXSRFCookie();

        this.http.post('/gnomex/SaveMultiRequestSampleSheet.gx', params.toString(), {headers: headers}).subscribe((response: any) => {
            if (response && response.status === 200) {
                this.bulkUploadImportedSubject.next(response.json());
            } else {
                this.bulkUploadImportedSubject.next(null);
            }
        });

        return this.bulkUploadImportedSubject;
    }
}