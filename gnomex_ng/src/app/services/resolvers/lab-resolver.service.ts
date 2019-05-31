import {Injectable} from '@angular/core'
import {Resolve, ActivatedRouteSnapshot, ActivatedRoute} from '@angular/router'
import {URLSearchParams} from "@angular/http";
import {GetLabService} from "../get-lab.service";
import {HttpParams} from "@angular/common/http";


/* This service will be used in experiment.routes.ts and when injecting ActivateRoute  into browse-overview.component.ts
 we can get the project json off the route */

@Injectable()
export class LabResolverService implements Resolve<any> {
    constructor(private getLabService: GetLabService ) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let idLab = route.params["idLab"];
        let ids: HttpParams = new HttpParams()
            .set("idLab", idLab )
            .set("includeBillingAccounts", "N")
            .set("includeProductCounts", "N");


        if(idLab){
            return this.getLabService.getLab(ids);
        }

    }
}