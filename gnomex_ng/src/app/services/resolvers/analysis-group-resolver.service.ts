import {Injectable} from "@angular/core";
import {Resolve, ActivatedRouteSnapshot} from "@angular/router";
import {AnalysisService} from "../analysis.service";
import {HttpParams} from "@angular/common/http";

/* This service will be used in analysis.routes.ts and when injecting ActivateRoute  into analysis-overview.component.ts
 we can get the project json off the route */

@Injectable()
export class AnalysisGroupResolverService implements Resolve<any> {
    constructor(private analysisService: AnalysisService) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let ids: HttpParams = new HttpParams();

        let idAnalysisGroup = route.params["idAnalysisGroup"]

        ids = ids.set("idAnalysisGroup", idAnalysisGroup );
        if(idAnalysisGroup) {
            return this.analysisService.getAnalysisGroup(ids);
        }

    }
}
