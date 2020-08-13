import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";

import {Observable} from "rxjs";
import {Subject} from "rxjs";

import {CookieUtilService} from "../services/cookie-util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../util/popup/dialogs.service";
import {Experiment} from "../util/models/experiment.model";
import {CheckboxRenderer} from "../util/grid-renderers/checkbox.renderer";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignRightMiddleRenderer} from "../util/grid-renderers/text-align-right-middle.renderer";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {MultiSelectRenderer} from "../util/grid-renderers/multi-select.renderer";
import {
    HttpClient,
    HttpEvent,
    HttpEventType,
    HttpHeaders,
    HttpParams,
    HttpRequest
} from "@angular/common/http";
import {saveAs} from "file-saver";
import {UtilService} from "../services/util.service";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";


@Injectable()
export class SampleUploadService {

    private static readonly getUploadSampleSheetURL_URL: string = "/gnomex/UploadSampleSheetURLServlet.gx";

    private sampleUpload_URL: string = null;
    private bulkSampleUpload_URL: string = null;

    private hasSampleUploadURLSubject: Subject<any>;


    private uploadSampleSheetSubject: Subject<any>;

    private bulkUploadSubject: Subject<any>;
    private bulkUploadImportedSubject: Subject<any>;


    constructor(private http: Http,
                private cookieUtilService: CookieUtilService,
                private dialogService: DialogsService,
                private httpClient: HttpClient) {
        this.hasSampleUploadURLSubject = new Subject();
    }


    private getSampleUpload_URL(): void {
        this.httpClient.get(SampleUploadService.getUploadSampleSheetURL_URL).subscribe((response: any) => {
            if (response && response.url) {
                this.sampleUpload_URL = UtilService.getUrlString(response.url);

                this.hasSampleUploadURLSubject.next(this.sampleUpload_URL);
                this.hasSampleUploadURLSubject.unsubscribe();
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogService.stopAllSpinnerDialogs();
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

            this.httpClient.post(this.sampleUpload_URL, formData).subscribe((response: any) => {
                if (response) {
                    this.uploadSampleSheetSubject.next(response);
                } else {
                    this.uploadSampleSheetSubject.next(null);
                }
            }, (err: IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });
        }

        if (!this.uploadSampleSheetSubject) {
            this.uploadSampleSheetSubject = new Subject();
        }

        return this.uploadSampleSheetSubject.asObservable();
    }

    public uploadBulkSampleSheet(params: any): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();

        this.httpClient.post("/gnomex/UploadMultiRequestSampleSheetFileServlet.gx", params).subscribe((response: any) => {
            this.bulkUploadSubject.next(response);

        }, (err: IGnomexErrorResponse) => {
            this.dialogService.stopAllSpinnerDialogs();
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

        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set('sampleSheetHeaderXMLString', JSON.stringify(processedHeaders))
            .set('sampleSheetRowXMLString',    JSON.stringify(rows));

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        this.cookieUtilService.formatXSRFCookie();

        this.httpClient.post('/gnomex/SaveMultiRequestSampleSheet.gx', params.toString(), {headers: headers}).subscribe((response: any) => {
            if (response) {
                this.bulkUploadImportedSubject.next(response);
            } else {
                this.bulkUploadImportedSubject.next(null);
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogService.stopAllSpinnerDialogs();
        });

        return this.bulkUploadImportedSubject;
    }

    public downloadSampleSheet(labName: string, stateName: string, columnDefs: any[], experiment: Experiment): void {
        if (!labName || !columnDefs || !experiment) {
            return null;
        }

        let nameList: any[] = [];

        for (let columnDef of columnDefs) {
            if (columnDef.field && columnDef.headerName) {
                let newNameListEntry: any = {
                    dataField : "" + columnDef.field,
                    fieldText : "" + columnDef.headerName,
                    fieldType : "TEXT"
                };

                if (columnDef.cellRendererFramework) {
                    if (columnDef.cellRendererFramework instanceof CheckboxRenderer) {
                        newNameListEntry.fieldType = "CHECK";
                    } else if (columnDef.cellRendererFramework instanceof TextAlignLeftMiddleRenderer
                        || columnDef.cellRendererFramework instanceof TextAlignRightMiddleRenderer) {

                        newNameListEntry.fieldType = "TEXT";
                    } else if (columnDef.cellRendererFramework instanceof SelectRenderer) {
                        newNameListEntry.fieldType = "OPTION";
                    } else if (columnDef.cellRendererFramework instanceof MultiSelectRenderer) {
                        newNameListEntry.fieldType = "MOPTION";
                    }
                }

                nameList.push(newNameListEntry);
            }
        }

        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("names", JSON.stringify(nameList))
            .set("requestJSONString", JSON.stringify(experiment.getJSONObjectRepresentation()));

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        this.cookieUtilService.formatXSRFCookie();

        let today: Date = new Date();
        let filename: string = "";

        let dateString: string = today.getFullYear() + "-";
        let temp: string = "" + (today.getMonth() + 1);

        if (temp.length === 1) {
            temp = "0" + temp;
        }

        dateString += temp + "-";

        temp = "" + today.getDate();

        if (temp.length === 1) {
            temp = "0" + temp;
        }

        dateString += temp;

        if (stateName) {
            filename = labName + "_" + stateName + "_" + dateString + ".txt";
        } else {
            filename = labName + "_" + today.getFullYear() + dateString + ".txt";
        }

        const request: HttpRequest<any> = new HttpRequest<any>("POST", "/gnomex/DownloadSampleSheet.gx", params.toString(), {
            headers: headers,
            responseType: "blob"
        });

        this.httpClient.request(request).subscribe((event: HttpEvent<any>) => {
            if (event.type === HttpEventType.Response) {
                saveAs(event.body, filename);
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogService.stopAllSpinnerDialogs();
        });
    }
}
