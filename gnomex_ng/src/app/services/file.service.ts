import {Inject, Injectable} from "@angular/core";
import {forkJoin, Observable, of, throwError} from "rxjs";
import {Subject} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {catchError, flatMap, map, mergeMap} from "rxjs/operators";
import {ExperimentsService} from "../experiments/experiments.service";
import {AnalysisService} from "./analysis.service";
import {DOCUMENT} from "@angular/common";

@Injectable()
export class FileService {
    public analysisGroupList: any[];
    private organizeFilesSubject: Subject<any> = new Subject();
    private updateFileTabSubject : Subject<any> = new Subject();

    public static readonly SIZE_GB: number = Math.pow(2, 30);
    public static readonly SIZE_MB: number = Math.pow(2, 20);
    public static readonly SIZE_KB: number = Math.pow(2, 10);


    constructor(private httpClient:HttpClient,
                private experimentService: ExperimentsService,
                private analysisService: AnalysisService,
                private cookieUtilService:CookieUtilService,
                @Inject(DOCUMENT) private document: Document) {
    }

    public static formatFileSize(size: number): string {
        let sizeFormatted: number;
        if (size > FileService.SIZE_GB) {
            sizeFormatted = Math.round((size / FileService.SIZE_GB) * 10) / 10;
            if (sizeFormatted === 0) {
                sizeFormatted = 1;
            }
            return "" + sizeFormatted + " GB"
        } else if (size > FileService.SIZE_MB) {
            sizeFormatted = Math.round(size / FileService.SIZE_MB);
            if (sizeFormatted === 0) {
                sizeFormatted = 1;
            }
            return "" + sizeFormatted + " MB";
        } else if (size > FileService.SIZE_KB) {
            sizeFormatted = Math.round(size / FileService.SIZE_KB);
            if (sizeFormatted === 0) {
                sizeFormatted = 1;
            }
            return "" + sizeFormatted + " KB";
        } else if (size === 0) {
            return "0 bytes";
        } else {
            sizeFormatted = Math.round(size);
            if (sizeFormatted === 0) {
                sizeFormatted = 1;
            }
            return "" + sizeFormatted + " bytes";
        }
    }



    getUploadOrderUrl(call:string):Observable<any>{
        return this.httpClient.get(call);
    }


    emitUpdateFileTab(data:any):void{
        this.updateFileTabSubject.next(data);
    }
    getUpdateFileTabObservable(): Observable<any>{
        return this.updateFileTabSubject.asObservable();
    }

    emitGetAnalysisOrganizeFiles(params:any): void {
        this.organizeFilesSubject.next(params);
    }
    getAnalysisOrganizeFilesObservable(): Observable<any>{
        return this.organizeFilesSubject.pipe( flatMap(params => {

            let analysisParams : URLSearchParams =  new URLSearchParams();
            analysisParams.append('idAnalysis',params.idAnalysis);
            analysisParams.append('showUploads',params.showUploads);
            let downloadParams:HttpParams = new HttpParams()
                .set('idAnalysis',params.idAnalysis)
                .set('includeUploadStagingDir', params.includeUploadStagingDir)
                .set('skipUploadStagingDirFiles', params.skipUploadStagingDirFiles);

            return forkJoin(this.analysisService.getAnalysis(analysisParams),
                this.analysisService.getAnalysisDownloadListWithParams(downloadParams));
        }));
    }

    organizeExperimentFiles(params:HttpParams):Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        return this.httpClient.post("/gnomex/OrganizeExperimentUploadFiles.gx",params.toString(),{headers: headers});
    }

    organizeAnalysisUploadFiles(params:HttpParams): Observable<any>{
        let headers : HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        return this.httpClient.post("/gnomex/OrganizeAnalysisUploadFiles.gx",params.toString(),{headers: headers});
    }

    emitGetRequestOrganizeFiles(params:any):void{
        this.organizeFilesSubject.next(params);
    }

    getRequestOrganizeFilesObservable(): Observable<any>{
        return this.organizeFilesSubject.pipe( flatMap(params => {

                let expParams : HttpParams =  new HttpParams()
                    .append('idRequest',params.idRequest)
                    .append('showUploads',params.showUploads);
                let downloadParams:HttpParams = new HttpParams()
                    .set('idRequest',params.idRequest)
                    .set('includeUploadStagingDir', params.includeUploadStagingDir);

                return forkJoin(this.experimentService.getExperimentWithParams(expParams),
                    this.experimentService.getRequestDownloadListWithParams(downloadParams)).pipe(map((resp:any[]) =>{
                    if(Array.isArray(resp) && resp.length === 2){
                        let hasError = false;
                        let errorMessage = "";
                        if(resp[0] && resp[0].Request){
                            if(resp[0].Request.RequestUpload && resp[0].Request.RequestUpload.FileDescriptor){
                                let reqUpload = resp[0].Request.RequestUpload;
                                resp[0] = Array.isArray(reqUpload.FileDescriptor) ? reqUpload.FileDescriptor : [reqUpload.FileDescriptor];
                            }else{
                                resp[0] = [];
                            }
                        }else{
                            errorMessage += resp[0].message ? resp[0].message : "";
                            hasError = true;
                        }
                        if(resp[1] && resp[1].Request){ // GetRequestDownloadList doesn't need check for an array
                            resp[1] = [resp[1].Request];
                        }else{
                            errorMessage += resp[1].message ? resp[1].message : "";
                            hasError = true;
                        }

                        if(hasError){
                            throw new Error(errorMessage)
                        }
                    }else{
                        throw new Error("An error occurred please contact GNomEx Support.");
                    }
                    return resp;

                }), catchError(this.handleError));
            })
        );
    }

    public cacheAnalysisFileDownloadList: (files: any[]) => Observable<any> = (files: any[]) => {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        let params: HttpParams = new HttpParams()
            .set("fileDescriptorJSONString", JSON.stringify(files))
            .set("noJSONToXMLConversionNeeded", "Y");
        return this.httpClient.post("/gnomex/CacheAnalysisFileDownloadList.gx", params.toString(), {headers: headers});
    };

    public getFDTDownloadAnalysisServlet: (emailAddress: string, showCommandLineInstructions: boolean) => Observable<any>
        = (emailAddress: string, showCommandLineInstructions: boolean) => {

        // This does not work on localhost since the back-end is hard-coded for a linux environment
        // This workaround hopefully works but it cannot be tested until release
        /*
        let params: HttpParams = new HttpParams()
            .set("emailAddress", emailAddress)
            .set("showCommandLineInstructions", showCommandLineInstructions ? "Y" : "N");
        return this.httpClient.get("/gnomex/FastDataTransferDownloadAnalysisServlet.gx", {params: params});
        */

        let url: string = this.document.location.href;
        url = url.substring(0, url.indexOf("/gnomex") + 7);
        url += "/FastDataTransferDownloadAnalysisServlet.gx";
        url += "?emailAddress=" + emailAddress;
        url += "&showCommandLineInstructions=" + (showCommandLineInstructions ? "Y" : "N");
        window.open(url, "_blank");

        return of({result: "SUCCESS"});
    };

    private handleError(errorResponse: HttpErrorResponse){
        if(errorResponse.error instanceof ErrorEvent){
            console.error("Client side Error: ", errorResponse.error.message);
        }else{
            console.error("Server Side Error: ", errorResponse);
        }
        return throwError("An error occurred please contact GNomEx Support.");

    }






}
