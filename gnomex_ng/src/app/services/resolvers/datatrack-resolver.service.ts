import {Injectable} from '@angular/core'
import {Resolve, ActivatedRouteSnapshot, ActivatedRoute} from '@angular/router'
import {URLSearchParams} from "@angular/http";
import {AnalysisService} from "../analysis.service";
import {GnomexService} from "../gnomex.service";
import {DataTrackService} from "../data-track.service";
import {HttpParams} from "@angular/common/http";

/* This service will be used in experiment.routes.ts and when injecting ActivateRoute  into browse-overview.component.ts
 we can get the project json off the route */

@Injectable()
export class DatatrackResolverService implements Resolve<any> {
    constructor(private datatrackService: DataTrackService) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let ids: HttpParams = new HttpParams();

        let idDataTrack= route.params["id"];
        ids = ids.set("idDataTrack", idDataTrack);

        if(idDataTrack){
            return this.datatrackService.getDataTrack(ids);
        }

    }
}