import {Injectable} from '@angular/core'
import {Resolve, ActivatedRouteSnapshot, ActivatedRoute, Router, UrlTree} from '@angular/router'
import {URLSearchParams} from "@angular/http";
import {AnalysisService} from "../analysis.service";
import {HttpParams} from "@angular/common/http";

/* This service will be used in experiment.routes.ts and when injecting ActivateRoute  into browse-overview.component.ts
 we can get the project json off the route */

@Injectable()
export class AnalysisResolverService implements Resolve<any> {
    constructor(private analysisService: AnalysisService,
                private router: Router) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let ids: HttpParams = new HttpParams();
        let segGroup  = (<UrlTree>this.router.parseUrl(this.router.url)).root.children['modal'];
        if(!segGroup){
            let idAnalysis= route.params["idAnalysis"];

            ids = ids.set('idAnalysis', idAnalysis );
            if(idAnalysis){
                return this.analysisService.getAnalysis(ids);
            }

        }


    }
}