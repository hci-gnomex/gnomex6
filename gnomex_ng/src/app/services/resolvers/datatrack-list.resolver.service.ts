import {Injectable} from '@angular/core'
import {Resolve, ActivatedRouteSnapshot, ActivatedRoute} from '@angular/router'
import {URLSearchParams} from "@angular/http";
import {AnalysisService} from "../analysis.service";
import {GnomexService} from "../gnomex.service";
import {DataTrackService} from "../data-track.service";

/* This service will be used in experiment.routes.ts and when injecting ActivateRoute  into browse-overview.component.ts
 we can get the project json off the route */

@Injectable()
export class DatatrackListResolverService implements Resolve<any> {
    constructor(private datatrackService: DataTrackService,
                private gnomexService: GnomexService) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let ids: URLSearchParams = new URLSearchParams;

        let idGenomeBuild= route.params["idGenomeBuild"];
        ids.set("idGenomeBuild", idGenomeBuild);


        if(this.gnomexService.orderInitObj){
            ids.set("number", this.gnomexService.orderInitObj.dataTrackNumber);
            ids.set("idOrganism", this.gnomexService.orderInitObj.idOrganism);
            ids.set("idLab", this.gnomexService.orderInitObj.idLab);
        }

        this.datatrackService.previousURLParams = ids;

        if(idGenomeBuild){
            return this.datatrackService.getDataTrackList(ids);
        }

    }
}