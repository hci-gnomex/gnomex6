import {Injectable} from "@angular/core";
import {Resolve, ActivatedRouteSnapshot} from "@angular/router";
import {GetLabService} from "../get-lab.service";
import {HttpParams} from "@angular/common/http";


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


        if(idLab) {
            return this.getLabService.getLab(ids);
        }

    }
}
