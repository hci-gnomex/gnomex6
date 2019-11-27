import {Injectable} from "@angular/core";
import {
    ActivatedRoute,
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import {GnomexService} from "../gnomex.service";
import {CreateSecurityAdvisorService} from "../create-security-advisor.service";
import {PropertyService} from "../property.service";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";

@Injectable()
export class SubRouteGuardService implements CanActivate {
    constructor(
                public router: Router,
                public route: ActivatedRoute,
                private dialogsService: DialogsService,
                private gnomexService: GnomexService,
                private propertyService: PropertyService,
                private secAdvisory: CreateSecurityAdvisorService

    ) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        /*isLoggedIn is determined by if authed and  all preliminary backend calls to for loading the app are finished*/



        if (!this.gnomexService.isLoggedIn) {
            this.gnomexService.redirectURL = state.url;
            this.router.navigate(["home"]);
            return false;
        }
        if(this.gnomexService.redirectURL === "/configure-experiment-platform") {
            if(this.secAdvisory.isAdmin) {
                return true;
            } else {
                return false;
            }

        }

        if(!this.propertyService.isPublicVisbility()) {
            if(this.gnomexService.orderInitObj &&  this.gnomexService.orderInitObj.codeVisbility === "PUBLIC") {
                this.dialogsService.alert("You do not have permission to view this item.", "", DialogType.FAILED);
                return false;
            }
        }

        return true;
    }
}
