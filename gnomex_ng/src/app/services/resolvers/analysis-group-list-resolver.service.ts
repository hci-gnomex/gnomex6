import {Injectable} from "@angular/core";
import {Resolve, ActivatedRouteSnapshot} from "@angular/router";
import {AnalysisService} from "../analysis.service";
import {HttpParams} from "@angular/common/http";


@Injectable()
export class AnalysisGroupListResolverService implements Resolve<any> {
    constructor(private analysisService: AnalysisService) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let idLab = route.params["idLab"];
        let ids: HttpParams = new HttpParams()
            .set("idLab", idLab)
            .set("searchPublicProjects", "Y")
            .set("showCategory", "N")
            .set("showSamples", "N");
        this.analysisService.analysisPanelParams = ids;

        if(idLab) {
            return this.analysisService.getAnalysisGroupList(ids);
        }

    }
}
