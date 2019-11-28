import {Injectable} from "@angular/core";
import {Resolve, ActivatedRouteSnapshot} from "@angular/router";
import {AnalysisService} from "../analysis.service";
import {HttpParams} from "@angular/common/http";


@Injectable()
export class AnalysisGroupResolverService implements Resolve<any> {
    constructor(private analysisService: AnalysisService) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let ids: HttpParams = new HttpParams();

        let idAnalysisGroup = route.params["idAnalysisGroup"];

        ids = ids.set("idAnalysisGroup", idAnalysisGroup );
        if(idAnalysisGroup) {
            return this.analysisService.getAnalysisGroup(ids);
        }

    }
}
