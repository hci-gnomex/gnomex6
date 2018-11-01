// src/app/auth/auth-guard.service.ts
import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {GnomexService} from "../gnomex.service";
import {CreateSecurityAdvisorService} from "../create-security-advisor.service";

@Injectable()
export class SubRouteGuardService implements CanActivate {
    constructor(
                public router: Router,
                public route: ActivatedRoute,
                private gnomexService: GnomexService,
                private secAdvisory: CreateSecurityAdvisorService

    ) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        /*isLoggedIn is determined by if*/
        if (!this.gnomexService.isLoggedIn){
            this.gnomexService.redirectURL = state.url;
            this.router.navigate(['home']);
            return false;
        }else if(this.gnomexService.redirectURL === "/configure-experiment-platform"){
            if(this.secAdvisory.isAdmin){
                return true;
            }else{
                return false;
            }

        }

        return true;
    }
}