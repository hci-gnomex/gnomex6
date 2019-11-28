import {Injectable} from "@angular/core";
import {Observable, throwError} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {catchError} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Injectable()
export class UsageService {

    constructor(private httpClient: HttpClient) {
    }

    public getUsageData(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetUsageData.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                return throwError(err);
            }));
    }

    public getUsageDetail(fieldName: string, startDate: string, idCoreFacility: string): Observable<any> {
        let params = new HttpParams()
            .set("chartName", "SummaryActivityByWeek")
            .set("fieldName", fieldName)
            .set("startDate", startDate)
            .set("idCoreFacility", idCoreFacility ? idCoreFacility : "");

        return this.httpClient.get("/gnomex/GetUsageDetail.gx", {params: params});
    }

}
