import {Injectable} from "@angular/core";
import {Resolve, ActivatedRouteSnapshot} from "@angular/router";
import {GnomexService} from "../gnomex.service";
import {DataTrackService} from "../data-track.service";
import {HttpParams} from "@angular/common/http";


@Injectable()
export class DatatrackListResolverService implements Resolve<any> {
    constructor(private datatrackService: DataTrackService,
                private gnomexService: GnomexService) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe


        let idGenomeBuild = route.params["idGenomeBuild"];
        let ids: HttpParams = new HttpParams().set("idGenomeBuild", idGenomeBuild);


        if(this.gnomexService.orderInitObj) {
            ids.set("number", this.gnomexService.orderInitObj.dataTrackNumber);
            ids.set("idOrganism", this.gnomexService.orderInitObj.idOrganism);
            ids.set("idLab", this.gnomexService.orderInitObj.idLab);
        }

        this.datatrackService.previousURLParams = ids;

        if(idGenomeBuild) {
            return this.datatrackService.getDataTrackList(ids);
        }

    }
}
