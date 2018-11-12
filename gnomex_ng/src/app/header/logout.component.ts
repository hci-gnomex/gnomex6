
import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {GnomexService} from "../services/gnomex.service";
import {ProgressService} from "../home/progress.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AuthenticationService} from "../auth/authentication.service";

@Component({
    template: ''
})

export class LogoutComponent implements OnInit {

    constructor(private authenticationService: AuthenticationService,
                private router: Router,
                private gnomexService: GnomexService,
                private progressService: ProgressService
                ) {}

    ngOnInit() {
        this.authenticationService.logout();
        this.gnomexService.isLoggedIn = false;
        this.gnomexService.orderInitObj = null;
        this.gnomexService.redirectURL = null;
        this.progressService.hideLoaderStatus(false);
        this.progressService.loaderStatus = new BehaviorSubject<number> (0);
        this.router.navigate(['authenticate']);
    }

}