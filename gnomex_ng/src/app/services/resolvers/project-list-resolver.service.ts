import {Injectable} from "@angular/core";
import {Resolve, ActivatedRouteSnapshot, ActivatedRoute} from "@angular/router";
import {ExperimentsService} from "../../experiments/experiments.service";
import {HttpParams} from "@angular/common/http";


@Injectable()
export class ProjectListResolverService implements Resolve<any> {
    constructor(private experimentsService: ExperimentsService) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready


        let idProject = route.params["idProject"];
        let ids: HttpParams = new HttpParams()
            .set("idProject", idProject )
            .set("showEmptyProjectFolders", "N" )
            .set("showCategory", "N")
            .set("showSamples", "N");

        this.experimentsService.browsePanelParams = ids;

        if(idProject) {
            return this.experimentsService.getProjectRequestList(ids);
        }

    }
}
