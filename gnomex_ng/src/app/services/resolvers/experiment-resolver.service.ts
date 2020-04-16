import { Injectable } from '@angular/core'
import {Resolve, ActivatedRouteSnapshot, UrlTree, Router} from '@angular/router'
import { ExperimentsService } from '../../experiments/experiments.service'
import {flatMap, map} from "rxjs/operators";
import {NavigationService} from "../navigation.service";
import {of} from "rxjs";

/* This service will be used in experiment.routes.ts and when injecting ActivateRoute  into experiment-details.component
 we can get the experiments json off the route */

@Injectable()
export class ExperimentResolverService implements Resolve<any> {
    constructor(private experimentsService:ExperimentsService,
                private router:Router) {}

    resolve(route:ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load before display component
        let segGroup  = (<UrlTree>this.router.parseUrl(this.router.url)).root.children['modal'];
        if(!segGroup){
            return this.experimentsService.getExperiment(route.params['idRequest']);
        }// need to returns something
        return of(null);
    }
}