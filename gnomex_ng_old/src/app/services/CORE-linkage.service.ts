import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {PropertyService} from "./property.service";

@Injectable()
export class CORELinkageService {

    constructor(private httpClient: HttpClient,
                private propertyService: PropertyService) { }

    public searchForSampleAlias(alias: string): Observable<any> {

        let params: HttpParams = new HttpParams()
            .set("Content-Type", "application/json")
            .set("withCredentials", "true");

        let property: any = this.propertyService.getProperty(PropertyService.PROPERTY_CORE_LINKAGE_LOOKUP);

        if (property && property.propertyValue && alias) {
            return this.httpClient.get(property.propertyValue + alias, {params: params});
        } else {
            return null;
        }
    }

}