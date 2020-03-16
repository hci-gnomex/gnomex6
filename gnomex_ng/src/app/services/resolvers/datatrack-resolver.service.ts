import {Injectable} from "@angular/core";
import {Resolve, ActivatedRouteSnapshot, ActivatedRoute, UrlTree, Router} from "@angular/router";
import {DataTrackService} from "../data-track.service";
import {HttpParams} from "@angular/common/http";


@Injectable()
export class DatatrackResolverService implements Resolve<any> {
    constructor(private datatrackService: DataTrackService,
                private router: Router) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let segGroup  = (<UrlTree>this.router.parseUrl(this.router.url)).root.children["modal"];
        if(!segGroup) {
            let ids: HttpParams = new HttpParams();
            let idDataTrack = route.params["idDataTrack"];
            ids = ids.set("idDataTrack", idDataTrack);
            if(idDataTrack) {
                return this.datatrackService.getDataTrack(ids);
            }
        }

    }
}
