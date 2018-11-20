import { Injectable } from '@angular/core'
import { Resolve,ActivatedRouteSnapshot } from '@angular/router'
import { ExperimentsService } from '../../experiments/experiments.service'

/* This service will be used in experiment.routes.ts and when injecting ActivateRoute  into experiment-details.component
 we can get the experiments json off the route */

@Injectable()
export class ExperimentResolverService implements Resolve<any> {
    constructor(private experimentsService:ExperimentsService) {}

    resolve(route:ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load before display component
        return this.experimentsService.getExperiment(route.params['id']); // this is an observable, but resolve doesn't require calling subscribe
    }
}