import {Injectable} from '@angular/core'
import {Resolve, ActivatedRouteSnapshot, ActivatedRoute} from '@angular/router'
import {ExperimentsService} from '../../experiments/experiments.service'
import {URLSearchParams} from "@angular/http";
import {AnalysisService} from "../analysis.service";

/* This service will be used in experiment.routes.ts and when injecting ActivateRoute  into browse-overview.component.ts
 we can get the project json off the route */

@Injectable()
export class AnalysisGroupResolverService implements Resolve<any> {
    constructor(private analysisService: AnalysisService) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let ids: URLSearchParams = new URLSearchParams;

        let idAnalysisGroup = route.params["idAnalysisGroup"]

        ids.set('idAnalysisGroup', idAnalysisGroup );
        if(idAnalysisGroup){
            return this.analysisService.getAnalysisGroup(ids);
        }

    }
}