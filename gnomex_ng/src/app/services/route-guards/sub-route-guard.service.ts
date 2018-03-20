// src/app/auth/auth-guard.service.ts
import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from "@hci/authentication";
import {GnomexService} from "../gnomex.service";
import {CreateSecurityAdvisorService} from "../create-security-advisor.service";

@Injectable()
export class SubRouteGuardService implements CanActivate {
    constructor(private authService:AuthenticationService,
                public router: Router,
                public route: ActivatedRoute,
                private gnomexService: GnomexService,
                private secAdvisorService: CreateSecurityAdvisorService

    ) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        console.log(state.url);
        /*isLoggedIn is determined by if*/
        if (!this.gnomexService.isLoggedIn){
            this.gnomexService.redirectURL = state.url;
            this.router.navigate(['home']);
            return false;
        }

        return true;
    }
}