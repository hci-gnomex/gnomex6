import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable()
export class LaunchPropertiesService {
    constructor(private httpClient: HttpClient) {
    }

    getLaunchProperties(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetLaunchProperties.gx", {params: params});
    }

    saveFAQ(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/SaveFAQ.gx", {params: params});
    }

    deleteFAQ(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/DeleteFAQ.gx", {params: params});
    }

    getFAQ(): Observable<any> {
        return this.httpClient.get("/gnomex/GetFAQ.gx");
    }

    getSampleSheetUploadURL(): Observable<any> {
        return this.httpClient.get("/gnomex/UploadSampleSheetURLServlet.gx");
    }
}
