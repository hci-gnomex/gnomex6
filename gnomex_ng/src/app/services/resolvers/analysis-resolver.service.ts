import {Injectable} from "@angular/core";
import {Resolve, ActivatedRouteSnapshot, Router, UrlTree} from "@angular/router";
import {AnalysisService} from "../analysis.service";
import {HttpParams} from "@angular/common/http";


@Injectable()
export class AnalysisResolverService implements Resolve<any> {
    constructor(private analysisService: AnalysisService,
                private router: Router) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let ids: HttpParams = new HttpParams();
        let segGroup  = (<UrlTree>this.router.parseUrl(this.router.url)).root.children["modal"];
        if(!segGroup) {
            let idAnalysis = route.params["idAnalysis"];

            ids = ids.set("idAnalysis", idAnalysis );
            if(idAnalysis) {
                return this.analysisService.getAnalysis(ids);
            }

        }
    }
}
