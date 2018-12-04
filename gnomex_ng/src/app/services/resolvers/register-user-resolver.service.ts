import {Injectable} from '@angular/core'
import {Resolve, ActivatedRouteSnapshot, ActivatedRoute} from '@angular/router'
import {GetLabService} from "../get-lab.service";
import {HttpParams} from "@angular/common/http";
import {UserService} from "../user.service";
import {IRegisterUser} from "../../util/interfaces/register-user.model";



/* This service will be used in experiment.routes.ts and when injecting ActivateRoute  into browse-overview.component.ts
 we can get the project json off the route */

@Injectable()
export class RegisterUserResolverService implements Resolve<IRegisterUser> {
    constructor(private userService: UserService ) {
    }

    resolve(route: ActivatedRouteSnapshot) { // resolve is good with asyncrous data, it waits to load component till data is ready
        // then it calls subscribe
        let ids: HttpParams = new HttpParams();

        let idCoreFacility = route.params["idCoreFacility"];
        if(idCoreFacility){
            ids = ids.set("idCoreFacility", idCoreFacility);
        }

        return this.userService.registerUser(ids);
    }
}