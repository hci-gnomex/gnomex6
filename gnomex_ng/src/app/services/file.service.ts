import {Injectable} from "@angular/core";
import {forkJoin, Observable, of} from "rxjs";
import {Subject} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {flatMap, map} from "rxjs/operators";
import {ExperimentsService} from "../experiments/experiments.service";
import {AnalysisService} from "./analysis.service";

@Injectable()
export class FileService {
    public analysisGroupList: any[];
    private organizeFilesSubject: Subject<any> = new Subject();


    constructor(private httpClient:HttpClient,
                private experimentService: ExperimentsService,
                private analysisService: AnalysisService,
                private cookieUtilService:CookieUtilService ) {
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

    organizeAnalysisUploadFiles(params:HttpParams): Observable<any>{
        let headers : HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        return this.httpClient.post("/gnomex/OrganizeAnalysisUploadFiles.gx",params.toString(),{headers: headers});
    }





}
