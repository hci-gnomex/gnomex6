import {Injectable} from '@angular/core'
import {Resolve, ActivatedRouteSnapshot, ActivatedRoute} from '@angular/router'
import {ExperimentsService} from '../../experiments/experiments.service'
import {URLSearchParams} from "@angular/http";
import {HttpParams} from "@angular/common/http";

/* This service will be used in experiment.routes.ts and when injecting ActivateRoute  into browse-overview.component.ts
 we can get the project json off the route */

@Injectable()
export class ProjectResolverService implements Resolve<any> {
    constructor(private experimentsService: ExperimentsService) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
                                            // then it calls subscribe
        let idLab = route.params["idLab"];
        let idProject = route.params["idProject"];

        let ids: HttpParams = new HttpParams()
            .set('idLab',idLab )
            .set('idProject', idProject );
        if(idLab){
            return this.experimentsService.getProject(ids);
        }

    }
}