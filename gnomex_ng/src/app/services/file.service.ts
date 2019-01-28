import {Injectable} from "@angular/core";
import {forkJoin, Observable, of, throwError} from "rxjs";
import {Subject} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {catchError, flatMap, map, mergeMap} from "rxjs/operators";
import {ExperimentsService} from "../experiments/experiments.service";
import {AnalysisService} from "./analysis.service";

@Injectable()
export class FileService {
    public analysisGroupList: any[];
    private organizeFilesSubject: Subject<any> = new Subject();
    private updateFileTabSubject : Subject<any> = new Subject();


    constructor(private httpClient:HttpClient,
                private experimentService: ExperimentsService,
                private analysisService: AnalysisService,
                private cookieUtilService:CookieUtilService ) {
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

    private handleError(errorResponse: HttpErrorResponse){
        if(errorResponse.error instanceof ErrorEvent){
            console.error("Client side Error: ", errorResponse.error.message);
        }else{
            console.error("Server Side Error: ", errorResponse);
        }
        return throwError("An error occurred please contact GNomEx Support.");

    }






}
