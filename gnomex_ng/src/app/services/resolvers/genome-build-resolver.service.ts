import {Injectable} from '@angular/core'
import {Resolve, ActivatedRouteSnapshot, ActivatedRoute} from '@angular/router'

import {URLSearchParams} from "@angular/http";
import {DataTrackService} from "../data-track.service";
import {HttpParams} from "@angular/common/http";

/* This service will be used in experiment.routes.ts and when injecting ActivateRoute  into browse-overview.component.ts
 we can get the project json off the route */

@Injectable()
export class GenomeBuildResolverService implements Resolve<any> {
    constructor(private datatrackService: DataTrackService) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe

        let idGenomeBuild = route.params["idGenomeBuild"];
        let ids: HttpParams = new HttpParams()
            .set('idGenomeBuild', idGenomeBuild );
        if(idGenomeBuild){
            return this.datatrackService.getGenomeBuild(ids);
        }

    }
}