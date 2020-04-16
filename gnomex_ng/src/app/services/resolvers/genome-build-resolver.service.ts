import {Injectable} from "@angular/core";
import {Resolve, ActivatedRouteSnapshot, UrlTree, Router} from "@angular/router";
import {DataTrackService} from "../data-track.service";
import {HttpParams} from "@angular/common/http";


@Injectable()
export class GenomeBuildResolverService implements Resolve<any> {
    constructor(private datatrackService: DataTrackService,
                private router:Router) {
    }

    resolve(route: ActivatedRouteSnapshot) {
        let segGroup  = (<UrlTree>this.router.parseUrl(this.router.url)).root.children["modal"];
        if(!segGroup){
            let idGenomeBuild = route.queryParams["idGenomeBuild"];
            let ids: HttpParams = new HttpParams()
                .set("idGenomeBuild", idGenomeBuild );
            if(idGenomeBuild) {
                return this.datatrackService.getGenomeBuild(ids);
            }
        }
    }
}
