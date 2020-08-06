import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {concat, Observable, ObservableInput, of, throwError} from "rxjs";
import {catchError, flatMap, map} from "rxjs/operators";
import {DialogsService} from "../util/popup/dialogs.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {HttpUriEncodingCodec} from "./interceptors/http-uri-encoding-codec";


@Injectable()
export class UploadFileService {
    constructor(private httpClient: HttpClient,
                private dialogService: DialogsService) {}


    public uploadFromBrowse(files: any[], url: string, ids: any): Observable<any> {
        let idKeys: string[] = Object.keys(ids);
        let idKey: string = idKeys[0];
        console.log(files);
        let fileUploadObservableList: ObservableInput<any>[] = [];

        files.forEach(file => {
            // create a new multipart-form for every file
            let formData = new FormData();
            // create a http-post request and pass the form
            // tell it to report the upload progress
            formData.append(idKey, ids[idKey]);
            formData.append("Filename", file.name);
            formData.append("Filedata", file.file, file.name);
            formData.append("Upload", "Submit Query");

            fileUploadObservableList.push(this.httpClient.post(url, formData, {withCredentials: true, reportProgress: true})
                .pipe(map((resp: any) => {
                    if(resp) {
                        return resp;
                    }
                }), catchError((err: IGnomexErrorResponse) => {
                    return throwError(err);
                })),
            );
        });
        return concat<any>(...fileUploadObservableList)
            .pipe(catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

    public startFDTUpload(idObj: any): Observable<any> {
        let key: string = (Object.keys(idObj))[0];
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()}).set(key, idObj[key]);
        return this.httpClient.get("/gnomex/FastDataTransferUploadStart.gx", {params: params})
            .pipe(flatMap((resp: any) => {
                if (resp && resp.uuid) {
                    let uuid = resp.uuid;
                    return this.getFDTJnlpServlet(new HttpParams().set("uuid", uuid));
                } else if (resp.message) {
                    this.dialogService.error(resp.message);
                }
                return of(false);
            }), catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

    private getFDTJnlpServlet(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/FastDataTransferUploadGetJnlpServlet.gx", {responseType: "blob", params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

}
