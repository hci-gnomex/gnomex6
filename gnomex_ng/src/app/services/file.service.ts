import {Inject, Injectable} from "@angular/core";
import {forkJoin, Observable, of, throwError} from "rxjs";
import {Subject} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {catchError, first, flatMap, map, mergeMap} from "rxjs/operators";
import {ExperimentsService} from "../experiments/experiments.service";
import {AnalysisService} from "./analysis.service";
import {DOCUMENT} from "@angular/common";
import {Form, FormGroup} from "@angular/forms";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {UtilService} from "./util.service";

@Injectable()
export class FileService {
    public analysisGroupList: any[];
    private organizeFilesSubject: Subject<any> = new Subject();
    private updateFileTabSubject : Subject<any> = new Subject();
    private linkedSampleFilesSubject: Subject<any> = new Subject();
    private manageFileSaveSubject: Subject<any> = new Subject();
    private manageFileForm:FormGroup = new FormGroup({});

    public static readonly SIZE_GB: number = Math.pow(2, 30);
    public static readonly SIZE_MB: number = Math.pow(2, 20);
    public static readonly SIZE_KB: number = Math.pow(2, 10);



    constructor(private httpClient:HttpClient,
                private experimentService: ExperimentsService,
                private analysisService: AnalysisService,
                private cookieUtilService:CookieUtilService,
                @Inject(DOCUMENT) private document: Document) {
    }

    public addManageFilesForm(name:string ,form:FormGroup,){
        setTimeout(() => {
            this.manageFileForm.addControl(name, form);
        })

    }
    public getManageFilesForm():FormGroup{
        return this.manageFileForm;
    }
    resetManageFilesForm():void{
        this.manageFileForm = new FormGroup({});
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

            let analysisParams : HttpParams =  new HttpParams()
                .append('idAnalysis',params.idAnalysis)
                .append('showUploads','Y');
            let downloadParams:HttpParams = new HttpParams()
                .set('idAnalysis',params.idAnalysis)
                .set('includeUploadStagingDir', 'N')
                .set('skipUploadStagingDirFiles', 'Y');

            return forkJoin(this.analysisService.getAnalysis(analysisParams),
                this.analysisService.getAnalysisDownloadListWithParams(downloadParams));
        }));
    }

    organizeExperimentFiles(params:HttpParams):Observable<any>{
        let headers: HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        return this.httpClient.post("/gnomex/OrganizeExperimentUploadFiles.gx",params.toString(),{headers: headers });
    }

    organizeAnalysisUploadFiles(params:HttpParams): Observable<any>{
        let headers : HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        return this.httpClient.post("/gnomex/OrganizeAnalysisUploadFiles.gx",params.toString(),{headers: headers});
    }

    emitGetLinkedSampleFiles(params:any):void{
        this.linkedSampleFilesSubject.next(params);
    }
    getLinkedSampleFilesSubject():Observable<any> {
        return this.linkedSampleFilesSubject.pipe(flatMap( params => {
            let requestList:Observable<any>[] = [];
            let expParams : HttpParams =  new HttpParams()
                .append('idRequest',params.idRequest)
                .append('showUploads','Y');
            let sampleFileParams: HttpParams = new HttpParams().append('idRequest',params.idRequest);

            requestList.push(this.experimentService.getLinkedSampleFiles(sampleFileParams));
            requestList.push( this.experimentService.getRequestDownloadListWithParams(expParams));
            try{
                return forkJoin(requestList).pipe(first(),catchError(this.handleError),
                    map((resp:any[]) =>{
                        let errorMessage = "";
                        if(resp && Array.isArray(resp) ){
                            if(resp[0] && resp[0].SampleRoot){
                                let root:any = resp[0].SampleRoot;
                                let sampleList:any[] = [];
                                Object.keys(root).forEach(key => {
                                    if(Array.isArray(root[key])){
                                        sampleList = sampleList.concat(root[key])
                                    }
                                });
                                resp[0] = sampleList;
                            }else{
                                throw new Error(resp[0].message);
                            }

                            if(resp[1] && resp[1].Request){ // GetRequestDownloadList doesn't need check for an array
                                resp[1] = [resp[1].Request];
                            }else{
                                throw new Error(resp[0].message)
                            }
                        }
                        return resp;

                    }));

            }catch(e){
                return throwError(e)
            }


        }))
    }

    emitSaveManageFiles(){
        this.manageFileSaveSubject.next();
    }
    saveManageFilesObservable(){
        return this.manageFileSaveSubject;
    }



    emitGetRequestOrganizeFiles(params:any):void{
        this.organizeFilesSubject.next(params);
    }

    prepUploadData(files:any[] ):void{
        for(let file of  files){
            if(file.FileDescriptor){
                file.FileDescriptor = UtilService.getJsonArray(file.FileDescriptor ,file.FileDescriptor);
                this.prepUploadData(file.FileDescriptor)
            }


        }
    }

    getUploadFiles(uploadData:any):any[]{
        if(uploadData && uploadData.FileDescriptor){
            uploadData.FileDescriptor = UtilService.getJsonArray(uploadData.FileDescriptor, uploadData.FileDescriptor);
            this.prepUploadData(uploadData.FileDescriptor);
            return uploadData.FileDescriptor;
        }
        return [];
    }


    getRequestOrganizeFilesObservable(): Observable<any>{
        return this.organizeFilesSubject.pipe( flatMap((params:any) => {
                let requestList:Observable<any>[] = [];
                let expParams : HttpParams =  new HttpParams()
                    .append('idRequest',params.idRequest)
                    .append('showUploads','Y');
                requestList.push( this.experimentService.getExperimentWithParams(expParams));


                let downloadParams:HttpParams = new HttpParams()
                    .set('idRequest',params.idRequest)
                    .set('includeUploadStagingDir', 'N');
                requestList.push(this.experimentService.getRequestDownloadListWithParams(downloadParams));



                return forkJoin(requestList).pipe(map((resp:any[]) =>{
                    if(Array.isArray(resp) && resp.length === 2){
                        let hasError = false;
                        let errorMessage = "";
                        if(resp[0] && resp[0].Request){
                            if(resp[0].Request.RequestUpload && resp[0].Request.RequestUpload.FileDescriptor){
                                let reqUpload = resp[0].Request.RequestUpload;
                                this.getUploadFiles(reqUpload);
                                resp[0] = reqUpload.FileDescriptor;
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

    public previewAnalysisFile(idAnalysis: string, fileName: string, dir: string): void {
        let url: string = this.document.location.href;
        url = url.substring(0, url.lastIndexOf("/gnomex") + 7);
        url += "/DownloadAnalysisSingleFileServlet.gx";
        url += "?idAnalysis=" + idAnalysis;
        url += "&fileName=" + fileName;
        url += "&view=Y";
        url += "&dir=" + dir;
        window.open(url, "_blank");
    }

    public previewExperimentFile(idRequest: string, fileName: string): void {
        let url: string = this.document.location.href;
        url = url.substring(0, url.lastIndexOf("/gnomex") + 7);
        url += "/DownloadSingleFileServlet.gx";
        url += "?idRequest=" + idRequest;
        url += "&fileName=" + fileName;
        url += "&view=Y";
        window.open(url, "_blank");
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

    public cacheExperimentFileDownloadList: (files: any[]) => Observable<any> = (files: any[]) => {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        let params: HttpParams = new HttpParams()
            .set("fileDescriptorJSONString", JSON.stringify(files))
            .set("noJSONToXMLConversionNeeded", "Y");
        return this.httpClient.post("/gnomex/CacheFileDownloadList.gx", params.toString(), {headers: headers});
    };

    public getFDTDownloadExperimentServlet: (emailAddress: string, showCommandLineInstructions: boolean) => Observable<any>
        = (emailAddress: string, showCommandLineInstructions: boolean) => {

        // This does not work on localhost since the back-end is hard-coded for a linux environment
        // This workaround hopefully works but it cannot be tested until release
        /*
        let params: HttpParams = new HttpParams()
            .set("emailAddress", emailAddress)
            .set("showCommandLineInstructions", showCommandLineInstructions ? "Y" : "N");
        return this.httpClient.get("/gnomex/FastDataTransferDownloadExpServlet.gx", {params: params});
        */

        let url: string = this.document.location.href;
        url = url.substring(0, url.indexOf("/gnomex") + 7);
        url += "/FastDataTransferDownloadExpServlet.gx";
        url += "?emailAddress=" + emailAddress;
        url += "&showCommandLineInstructions=" + (showCommandLineInstructions ? "Y" : "N");
        window.open(url, "_blank");

        return of({result: "SUCCESS"});
    };

    public startFDTupload(idOrder:string, orderType: string): Observable<any>{
        let params: HttpParams = new HttpParams();
        let headers: HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        if(orderType === 'e'){
            params = params.set('idRequest', idOrder );
        }else{
            params = params.set('idAnalysis', idOrder);
        }

        return this.httpClient.post("/gnomex/FastDataTransferUploadStart.gx", params.toString(), {headers: headers})
            .pipe(flatMap( (resp:any) =>{
                let uuid:string = resp.uuid;
                let url: string = this.document.location.href;
                url = url.substring(0, url.indexOf("/gnomex") + 7);
                url += "/FastDataTransferUploadGetJnlpServlet.gx";
                url += "?uuid=" + uuid;
                url += "&showCommandLineInstructions=" + "Y";
                window.open(url, "_blank");

                return of({result: "SUCCESS"});


            }));

    }

    public makeSoftLinks: (files: any[]) => Observable<any> = (files: any[]) => {
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        let params: HttpParams = new HttpParams()
            .set("fileDescriptorJSONString", JSON.stringify(files))
            .set("noJSONToXMLConversionNeeded", "Y");
        return this.httpClient.post("/gnomex/MakeSoftLinks.gx", params.toString(), {headers: headers});
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
